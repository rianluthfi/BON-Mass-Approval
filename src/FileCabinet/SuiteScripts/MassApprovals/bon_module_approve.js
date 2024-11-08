/**
 * @NApiVersion 2.1
 */
define([
    'N/search',
    'N/ui/serverWidget'
],
    
    (
        search,
        serverWidget
    ) => {

        function setSublistColumn(sublist){

            

            sublist.addMarkAllButtons();
            sublist.addField({id : 'custpage_approve', label: 'Approve', type: serverWidget.FieldType.CHECKBOX});
            sublist.addField({id : 'custpage_view', label: '.', type: serverWidget.FieldType.URL}).linkText = 'View';
            sublist.addField({id : 'custpage_trandate', label: 'Date', type: serverWidget.FieldType.TEXT});
            sublist.addField({id : 'custpage_tranid', label: 'Document Number', type: serverWidget.FieldType.TEXT});
            sublist.addField({id : 'custpage_entity', label: 'Vendor', type: serverWidget.FieldType.TEXT});
            sublist.addField({id : 'custpage_approvalstatus', label: 'Status', type: serverWidget.FieldType.TEXT});
            sublist.addField({id : 'custpage_amount', label: 'Total Transaction', type: serverWidget.FieldType.CURRENCY});
            sublist.addField({id : 'custpage_trans_type', label: 'Transaction Type', type: serverWidget.FieldType.TEXT});
            sublist.addField({id : 'custpage_memo', label: 'Memo', type: serverWidget.FieldType.TEXT});
            sublist.addField({id : 'custpage_location', label: 'Location', type: serverWidget.FieldType.TEXT});
            sublist.addField({id : 'custpage_subsidiary', label: 'Subsidiary', type: serverWidget.FieldType.TEXT});
        }

        function setSublistValueAvoidEmpty(sublist, id_sublist, line_sublist, value_sublist){

            if (value_sublist != '' && value_sublist != '- None -'){
                sublist.setSublistValue({id : id_sublist, line : line_sublist, value : value_sublist});
            }
            
        }

        function getSearchPOtoApproveByAFAM(PAGE_SIZE, subsidiary, location, startdate, enddate){

            /**
             * Approval Status
             *      1 | Pending Approve
             * subsidiary id
             *      10 | PT. Boncafe Lestari
             *      11 | PT. Boncafe Sejahtera
             */

            var customFilters = new Array();
            customFilters.push(["workflow.currentstate","anyof","38","35"]);
            customFilters.push("AND");
            customFilters.push(["mainline","is","T"]);
            customFilters.push("AND");
            customFilters.push(["type","anyof","PurchOrd"]);
            customFilters.push("AND");
            customFilters.push(["workflow.workflow","anyof","21","20"]);
            customFilters.push("AND");
            customFilters.push(["approvalstatus","anyof","1"]);

            if (subsidiary){
                customFilters.push("AND");
                customFilters.push(["subsidiary","anyof",subsidiary]);
            }else{
                customFilters.push("AND");
                customFilters.push(["subsidiary","anyof","10","11"]);
            }

            if (location){
                customFilters.push("AND");
                customFilters.push(["location","anyof",location]);
            }

            if (startdate){
                customFilters.push("AND");
                customFilters.push(["trandate","onorafter",startdate]);
            }

            if (enddate){
                customFilters.push("AND");
                customFilters.push(["trandate","onorbefore",enddate]);
            }

            var purchaseorderSearchObj = search.create({
                type: "purchaseorder",
                filters: customFilters,
                columns:
                [
                    search.createColumn({name: "type", label: "Type"}),
                    search.createColumn({name: "trandate", label: "Date"}),
                    search.createColumn({name: "tranid", label: "Document Number"}),
                    search.createColumn({name: "approvalstatus", label: "Approval Status"}),
                    search.createColumn({name: "entity", label: "Name"}),
                    search.createColumn({name: "subsidiary", label: "Subsidiary"}),
                    search.createColumn({name: "location", label: "Location"}),
                    search.createColumn({name: "cseg1", label: "Transaction Type"}),
                    search.createColumn({name: "amount", label: "Amount"}),
                    search.createColumn({name: "memomain", label: "Memo"})
                    ]
            });

            return purchaseorderSearchObj.runPaged({
                pageSize : PAGE_SIZE
            });
        }

        function getDataPOtoApproveByAFAM(dataSearch, pageId){

            var searchPage = dataSearch.fetch({
                index : pageId
            });

            var results = new Array();

            searchPage.data.forEach(function (result) {

                results.push({
                    'id' : result.id,
                    'view' : '/app/accounting/transactions/purchord.nl?id='+result.id+'&whence=',
                    'type' : result.getValue(result.columns[0]),
                    'trandate' : result.getValue(result.columns[1]),
                    'tranid' : result.getValue(result.columns[2]),
                    'approvalstatus' : result.getText(result.columns[3]),
                    'entity' : result.getText(result.columns[4]),
                    'subsidiary' : result.getText(result.columns[5]).replace("Boncafe Group Holding : Boncafe Group : ", ""),
                    'location' : result.getText(result.columns[6]),
                    'trans_type' : result.getText(result.columns[7]),
                    'amount' : parseFloat(result.getValue(result.columns[8])),
                    'memo' : result.getValue(result.columns[9])
                });
            });

            return results;
        }

        return {
            setSublistColumn,
            setSublistValueAvoidEmpty,
            getSearchPOtoApproveByAFAM,
            getDataPOtoApproveByAFAM

        }

    });