/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

/**
 * Created at 12 November 2024 by lufiali
 * 
 * previous version at 
 * Suitelet     : BCG SL Mass Approval FC
 * Script ID    : customscript_bcg_sl_mass_approval_fc
 * script Name  : bcg_sl_mass_po_fc.js
 */

define([
    'N/ui/serverWidget',
    'N/runtime',
    '/SuiteScripts/MassApprovals/bon_module_approve.js',
    '/SuiteScripts/MassApprovals/bon_module_approve_sch.js',
    'N/redirect',
    'N/ui/message'
],

    (
        serverWidget,
        runtime,
        bonApproveModule,
        bonApproveModuleSch,
        redirect,
        message
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {

            var parameters = scriptContext.request.parameters;
            log.debug("parameters "+typeof parameters, parameters);

            var startdate = parameters.startdate;
            if (!startdate || startdate == '' || startdate < 0) {
                startdate = '';
            }

            var enddate = parameters.enddate;
            if (!enddate || enddate == '' || enddate < 0) {
                enddate = '';
            }

            var subsidiary = parameters.subsidiary;
            if (!subsidiary || subsidiary == '' || subsidiary < 0) {
                status_data = '';
            }

            var location = parameters.location;
            if (!location || location == '' || location < 0) {
                location = '';
            }

            var trans_type = parameters.trans_type;
            if (!trans_type || trans_type == '' || trans_type < 0) {
                trans_type = '';
            }

            /*
                ID      |   Role Name
                3	    |   Administrator
                1002	|   Holding - CEO
                1011    |	BCF - Assistant Finance & Accounting Manager
                1021	|   Financial Controller - PT. Bon Ami Abadi
            */


            // Describe Global Parameters here
            var PAGE_SIZE = 20;
            var PAGE_TITLE = 'Mass Approve PO by FC';
            var APPROVAL_LEVEL = '1';
            var ROLE_APPROVAL = 1021;
            var PATH_CLIENT_SCRIPT = 'SuiteScripts/MassApprovals/bon_cs_mass_app_po_afam.js';

            var myScript = runtime.getCurrentScript();
            var userObj = runtime.getCurrentUser();

            if (scriptContext.request.method === 'GET') {

                if (userObj.role == 3 || userObj.role == ROLE_APPROVAL){
                // if (userObj.role == ROLE_APPROVAL){      // For testing role

                    var form = serverWidget.createForm({
                        title: PAGE_TITLE,
                        hideNavBar: false
                    });
    
                    form.clientScriptModulePath = PATH_CLIENT_SCRIPT;
    
                    var dataSearch = bonApproveModule.getSearchPOtoApproveByFC(PAGE_SIZE, subsidiary, location, trans_type, startdate, enddate);
    
                    var pageId = parseInt(scriptContext.request.parameters.page);
    
                    // Set pageId to correct value if out of index
                    if (!pageId || pageId == '' || pageId < 0) {
                        pageId = 0;
                    }
                    else if (pageId >= pageCount) {
                        pageId = pageCount - 1;
                    }
    
                    var pageCount = Math.ceil(dataSearch.count / PAGE_SIZE);
    
                    // Add drop-down and options to navigate to specific page
                    var selectOptions = form.addField({
                        id: 'custpage_pageid',
                        label: 'Page Index',
                        type: serverWidget.FieldType.SELECT
                    });
    
                    for (i = 0; i < pageCount; i++) {
                        if (i == pageId) {
                            selectOptions.addSelectOption({
                                value: 'pageid_' + i,
                                text: ((i * PAGE_SIZE) + 1) + ' - ' + ((i + 1) * PAGE_SIZE),
                                isSelected: true
                            });
                        } else {
                            selectOptions.addSelectOption({
                                value: 'pageid_' + i,
                                text: ((i * PAGE_SIZE) + 1) + ' - ' + ((i + 1) * PAGE_SIZE)
                            });
                        }
                    }
    
                    // END of Setting Pagination
    
                    form.addField({ id: 'custpage_param_startdate', type: serverWidget.FieldType.DATE, label: 'Start Date'}).defaultValue = startdate;
                    form.addField({ id: 'custpage_param_enddate', type: serverWidget.FieldType.DATE, label: 'End Date'}).defaultValue = enddate;
                    form.addField({ id: 'custpage_param_subsidiary', type: serverWidget.FieldType.SELECT, label: 'Subsidiary', source: 'subsidiary'}).defaultValue = subsidiary;
                    form.addField({ id: 'custpage_param_location', type: serverWidget.FieldType.SELECT, label: 'Location', source: 'location'}).defaultValue = location;
                    form.addField({ id: 'custpage_param_trans_type', type: serverWidget.FieldType.SELECT, label: 'Transaction Type', source: 'customrecord_cseg1'}).defaultValue = trans_type;
    
                    var sublist = form.addSublist({
                        id: 'custpage_sublist',
                        type: serverWidget.SublistType.LIST,
                        label: 'Total Data (' + parseInt(dataSearch.count) + ")"
                    });
    
                    bonApproveModule.setSublistColumn(sublist);
    
                    if (dataSearch.count > 0) {
    
                        var dataResults = bonApproveModule.getDataPOtoApproveByFC(dataSearch, pageId);
                        log.debug("dataResults " + typeof dataResults, dataResults);
    
                        var j = 0;
                        dataResults.forEach(function (result) {
                            
                            bonApproveModule.setSublistValueAvoidEmpty(sublist, 'custpage_view', j, result.view);
                            bonApproveModule.setSublistValueAvoidEmpty(sublist, 'custpage_id', j, result.id);
                            bonApproveModule.setSublistValueAvoidEmpty(sublist, 'custpage_trandate', j, result.trandate);
                            bonApproveModule.setSublistValueAvoidEmpty(sublist, 'custpage_tranid', j, result.tranid);
                            bonApproveModule.setSublistValueAvoidEmpty(sublist, 'custpage_entity', j, result.entity);
                            bonApproveModule.setSublistValueAvoidEmpty(sublist, 'custpage_approvalstatus', j, result.approvalstatus);
                            bonApproveModule.setSublistValueAvoidEmpty(sublist, 'custpage_amount', j, result.amount);
                            bonApproveModule.setSublistValueAvoidEmpty(sublist, 'custpage_trans_type', j, result.trans_type);
                            bonApproveModule.setSublistValueAvoidEmpty(sublist, 'custpage_memo', j, result.memo);
                            bonApproveModule.setSublistValueAvoidEmpty(sublist, 'custpage_location', j, result.location);
                            bonApproveModule.setSublistValueAvoidEmpty(sublist, 'custpage_subsidiary', j, result.subsidiary);
    
                            j++
                        });
    
                        form.addSubmitButton({
                            label: 'Submit Mass Approval'
                        });
    
                    }
    
                    log.debug('Remaining Usage', myScript.getRemainingUsage());
                    scriptContext.response.writePage(form);
                }else{
                    // Return page "You Dont Have Access"
                    bonApproveModule.pageDontHaveAccess(scriptContext, serverWidget, message);
                }
            }
            else {
                // as POST

                var numLines = scriptContext.request.getLineCount({
                    group: 'custpage_sublist'
                });

                log.debug('numLines ' + typeof numLines, numLines);

                var data = new Array();

                for (var i = 0; i < numLines; i++) {

                    var approve = scriptContext.request.getSublistValue({
                        group: 'custpage_sublist',
                        name: 'custpage_approve',
                        line: i
                    });

                    // log.debug("approve "+typeof approve, approve);

                    if (approve == 'T') {

                        data.push(
                            scriptContext.request.getSublistValue({ group: 'custpage_sublist', name: 'custpage_id', line: i })
                        );
                    }
                }

                log.debug("data "+typeof data, data);
                log.debug('Remaining Usage In Loop ', myScript.getRemainingUsage());

                var parameters = {
                    'sourceScript'  : myScript,
                    'userObj'       : userObj,
                    'approval_level': APPROVAL_LEVEL,
                    'data'          : data,
                }

                log.debug("data "+typeof data, data);

                // return error;

                if (data.length > 0){

                    log.debug("There is data");

                    var task = bonApproveModuleSch.submitTaskScheduleSingleQueue(parameters);

                    redirect.toSuitelet({
                        scriptId: '594',        // customscript_bon_sl_mass_app_result
                        deploymentId: '1',      // customdeploy_bon_sl_mass_app_result
                        parameters: {
                            data : JSON.stringify(parameters)
                        }
                    });
                }else{
                    // No Data Submit to Process
                    // Back to Current Suitelet

                    log.debug("No data");

                    redirect.toSuitelet({
                        scriptId: myScript.id,
                        deploymentId: myScript.deploymentId
                    });

                }

                
            }
        }

        return { onRequest }

    });

