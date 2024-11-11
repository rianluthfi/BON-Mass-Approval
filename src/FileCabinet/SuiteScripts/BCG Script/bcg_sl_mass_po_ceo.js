/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search', 'N/log', 'N/record', 'N/http', 'N/url', 'N/redirect'],
    function(serverWidget, search, log, record, http, url, redirect) {
        function onRequest(context) {

			if (context.request.method === 'GET') {
				log.debug('ON GET');
				context.response.writePage({
					pageObject : renderList(translate(findPO()))
				});
			}else if (context.request.method === 'POST'){
				log.debug('ON POST');
				var lineCount = context.request.getLineCount('custpage_table');
				
				for (var i = 0; i < lineCount; i++){
					var checkValue = context.request.getSublistValue({
						group : 'custpage_table',
						name : 'custpage_checkbox',
						line : i
					});
					
					if (checkValue === 'T'){
						var PO_ID = context.request.getSublistValue({
							group : 'custpage_table',
							name : 'custpage_internal_id',
							line : i
						});
						
						var masterPO = record.load({
							type: record.Type.PURCHASE_ORDER, 
							id: PO_ID,
							isDynamic: true,
						});
						
						masterPO.setValue('custbody_bcg_approved_level_2', true);
						masterPO.save();
					}
				}
				
				// Redirect ke Mass Approve PO by CEO
				redirect.redirect({
					url: '/app/site/hosting/scriptlet.nl?script=200&deploy=1',
					parameters: {'custparam_test':'helloWorld'} 
				});
			}
        }

		function renderList(results){
			// Form Title
			var form = serverWidget.createForm({
				title : 'Mass Approve PO by CEO'
			});
			
			form.addSubmitButton('Submit Approve');
			
			var sublist = form.addSublist({
				id: 'custpage_table',
				type: serverWidget.SublistType.LIST,
				label: 'Purchase Order'
			});
			
			sublist.addMarkAllButtons();
			
			var check = sublist.addField({
				id: 'custpage_checkbox',
				label: 'Approve',
				type: serverWidget.FieldType.CHECKBOX
			});

			var viewLink = sublist.addField({
				id: 'custpage_view',
				label: '.',
				type: serverWidget.FieldType.URL
			});
			viewLink.linkText = 'View';
			
			var internal = sublist.addField({
				id: 'custpage_internal_id',
				label: 'Internal ID',
				type: serverWidget.FieldType.TEXT
			});
			
			internal.updateDisplayType({
				displayType: serverWidget.FieldDisplayType.HIDDEN
			});

			var date = sublist.addField({
				id: 'custpage_trandate',
				label: 'Date',
				type: serverWidget.FieldType.DATE
			});
			
			var tranid = sublist.addField({
				id: 'custpage_rec_id',
				label: 'PO# Number',
				type: serverWidget.FieldType.TEXT
			});
			
			var entity = sublist.addField({
				id: 'custpage_entity',
				label: 'Vendor',
				type: serverWidget.FieldType.TEXT
			});
			
			var approvalstatus = sublist.addField({
				id: 'custpage_approvalstatus',
				label: 'Status',
				type: serverWidget.FieldType.TEXT
			});
			
			var total = sublist.addField({
				id: 'custpage_total',
				label: 'Total Transaction',
				type: serverWidget.FieldType.CURRENCY
			});
			
			var transtype = sublist.addField({
				id: 'custpage_transaction_type',
				label: 'Transaction Type',
				type: serverWidget.FieldType.TEXT
			});
			
			var memo = sublist.addField({
				id: 'custpage_memo',
				label: 'Memo',
				type: serverWidget.FieldType.TEXT
			});
			
			var location = sublist.addField({
				id: 'custpage_location',
				label: 'location',
				type: serverWidget.FieldType.TEXT
			});
			
			var subsidiary = sublist.addField({
				id: 'custpage_subsidiary',
				label: 'subsidiary',
				type: serverWidget.FieldType.TEXT
			});
				
			for (var i = 0; i < results.length; i++){

				sublist.setSublistValue({
					id : 'custpage_view',
					line : i,
					value : '/app/accounting/transactions/purchord.nl?id='+results[i].internalid+'&whence='
				});
				sublist.setSublistValue({
					id : 'custpage_trandate',
					line : i,
					value : results[i].date
				});
				sublist.setSublistValue({
					id : 'custpage_internal_id',
					line : i,
					value : results[i].internalid
				});
				sublist.setSublistValue({
					id : 'custpage_rec_id',
					line : i,
					value : results[i].tranid
				});
				sublist.setSublistValue({
					id : 'custpage_entity',
					line : i,
					value : results[i].entity
				});
				sublist.setSublistValue({
					id : 'custpage_subsidiary',
					line : i,
					value : results[i].subsidiary
				});
				
				if (results[i].transtype !== ''){
					sublist.setSublistValue({
						id : 'custpage_transaction_type',
						line : i,
						value : results[i].transtype
					});
				}
				
				if (results[i].memo !== ''){
					sublist.setSublistValue({
						id : 'custpage_memo',
						line : i,
						value : results[i].memo
					});
				}
				
				if (results[i].location !== ''){
					sublist.setSublistValue({
						id : 'custpage_location',
						line : i,
						value : results[i].location
					});
				}
				
				if (results[i].approvalstatus !== ''){
					sublist.setSublistValue({
						id : 'custpage_approvalstatus',
						line : i,
						value : results[i].approvalstatus
					});
				}
				
				sublist.setSublistValue({
					id : 'custpage_total',
					line : i,
					value : results[i].total
				});
			}
			
			return form;
		}
		
		function findPO(){
			
			// Saved Search ID Purchase Order to Approve (CEO)
			var mySearch = search.load({
				id: 'customsearch194'
			});
			
			var jumlah = mySearch.run().getRange({start:0, end:25});
			
			return mySearch.run().getRange({start:0, end:jumlah.length});
			
		}
		
		function resultToObject(result){
			return{
				date : result.getValue({name:'trandate'}),
				tranid : result.getValue({name:'tranid'}),
				transtype : result.getText({name:'cseg1'}),
				memo : result.getValue({name:'memomain'}),
				entity : result.getText({name:'entity'}),
				subsidiary : result.getText({name:'subsidiary'}),
				location : result.getText({name:'location'}),
				total : result.getValue({name:'amount'}),
				approvalstatus : result.getText({name:'approvalstatus'}),
				internalid : result.id
			};
		}
		
		function translate(results){
			return results.map(resultToObject);
		}
		
		function getBaseURL(){
			return url.resolveRecord({
				recordType : serverWidget.Type.PURCHASE_ORDER
			});
		}

        return {
            onRequest: onRequest
        };
    });