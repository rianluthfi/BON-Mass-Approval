/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    'N/url',
    'N/currentRecord'
],

function(
    url,
    currentRecord
) {

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        if (
			scriptContext.fieldId == 'custpage_pageid' || 
            scriptContext.fieldId == 'custpage_param_startdate' || 
            scriptContext.fieldId == 'custpage_param_enddate' || 
            scriptContext.fieldId == 'custpage_param_subsidiary' || 
            scriptContext.fieldId == 'custpage_param_location'
		) {

            var pageId = scriptContext.currentRecord.getValue({fieldId : 'custpage_pageid'});
            var startdate = scriptContext.currentRecord.getText({fieldId : 'custpage_param_startdate'});
            var enddate = scriptContext.currentRecord.getText({fieldId : 'custpage_param_enddate'});
            var subsidiary = scriptContext.currentRecord.getValue({fieldId : 'custpage_param_subsidiary'});
            var location = scriptContext.currentRecord.getValue({fieldId : 'custpage_param_location'});

            pageId = parseInt(pageId.split('_')[1]);

            document.location = url.resolveScript({
                scriptId : getParameterFromURL('script'),
                deploymentId : getParameterFromURL('deploy'),
                params : {
                    'page' 	    : pageId,
                    'startdate' : startdate,
                    'enddate'   : enddate,
                    'subsidiary': subsidiary,
                    'location'  : location
                }
            });

        }
    }

    function getParameterFromURL(param) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == param) {
                return decodeURIComponent(pair[1]);
            }
        }
        return (false);
    }

    function redirectToDetail(){

        var curRec = currentRecord.get();

        var status_data = curRec.getValue('custpage_status_data');
        log.debug('status_data '+typeof status_data, status_data);

        var numLines = curRec.getLineCount({
            sublistId : 'custpage_sublist'
        });

        log.debug('numLines '+typeof numLines, numLines);

        var lineid = new Array();
        
        for (var i = 0; i < numLines; i++) {
            
            var check_detail = curRec.getSublistValue({
                sublistId: 'custpage_sublist',
                fieldId: 'custpage_check_detail',
                line: i
            });

            if (check_detail == true) {
                
                lineid.push(i);

            }
        }

        if (lineid.length == 1){
            log.debug('Check Detail');

            var line = lineid[0];

            var data = ({
                'id_external' : curRec.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_id_external', line: line}),
                'date' : curRec.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_date', line: line}),
                'sub_from' : curRec.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_sub_from', line: line}),
                'sub_to' : curRec.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_sub_to', line: line}),
                'loc_from' : curRec.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_loc_from', line: line}),
                'loc_to' : curRec.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_loc_to', line: line}),
                'incoterm' : curRec.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_incoterm', line: line}),
                'prepared_by' : curRec.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_prepared_by', line: line}),
                'approved_by' : curRec.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_approved_by', line: line}),
                'memo' : curRec.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_memo', line: line}),
                'count_id' : curRec.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_count_id', line: line}),
                'list_id' : curRec.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_list_id', line: line}),
                'status' : curRec.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_status', line: line}),
                'related_trans' : curRec.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_related_trans', line: line}),
                'notes' : curRec.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_notes', line: line})
            });

            document.location = url.resolveScript({
                scriptId : 'customscript_int_sl_bulk_interco_to_ui_d',
                deploymentId : 'customdeploy_int_sl_bulk_interco_to_ui_d',
                params : {
                    // 'staging_sales_group' : JSON.stringify(staging_sales_group),
                    'status_data' : status_data,
                    'data' : JSON.stringify(data)
                }
            });
        }
        else{
            log.debug('Please check only One');
            alert('Please check only One');
        }
    }

    function redirectToHome(){

        document.location = url.resolveScript({
            scriptId : 'customscript_int_sl_bulk_interco_to_ui',
            deploymentId : 'customdeploy_int_sl_bulk_interco_to_ui'
        });

    }

    
    return {
        fieldChanged: fieldChanged,
        redirectToDetail : redirectToDetail,
        redirectToHome : redirectToHome
    };
    
});
