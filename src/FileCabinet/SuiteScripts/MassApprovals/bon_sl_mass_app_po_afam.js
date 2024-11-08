/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

/**
 * Created at 9 November 2024 by lufiali
 * 
 * previous version at 
 * Suitelet     : BCG SL Mass Approval AF & AM
 * Script ID    : customscript_bcg_sl_mass_approval_af_am
 * script Name  : bcg_sl_mass_po_af_n_am.js
 */

define([
    'N/ui/serverWidget',
    'N/runtime',
    '/SuiteScripts/MassApprovals/bon_module_approve.js',
    // '/SuiteScripts/int_dev/bulk_interco_to_ui/module_interco_to_sch.js',
    'N/redirect'
],

    (
        serverWidget,
        runtime,
        bonApproveModule,
        // module_interco_to_sch,
        redirect
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

            var PAGE_SIZE = 20;

            var myScript = runtime.getCurrentScript();

            if (scriptContext.request.method === 'GET') {

                var form = serverWidget.createForm({
                    title: 'Mass Approve PO by AF & AM',
                    hideNavBar: false
                });

                form.clientScriptModulePath = 'SuiteScripts/MassApprovals/bon_cs_mass_app_po_afam.js';

                var dataSearch = bonApproveModule.getSearchPOtoApproveByAFAM(PAGE_SIZE, subsidiary, location, startdate, enddate);

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

                var sublist = form.addSublist({
                    id: 'custpage_sublist',
                    type: serverWidget.SublistType.LIST,
                    label: 'Total Data (' + parseInt(dataSearch.count) + ")"
                });

                bonApproveModule.setSublistColumn(sublist);

                if (dataSearch.count > 0) {

                    var dataResults = bonApproveModule.getDataPOtoApproveByAFAM(dataSearch, pageId);
                    log.debug("dataResults " + typeof dataResults, dataResults);

                    var j = 0;
                    dataResults.forEach(function (result) {
                        
                        bonApproveModule.setSublistValueAvoidEmpty(sublist, 'custpage_view', j, result.view);
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
            }
            else {
                // as POST

                var numLines = scriptContext.request.getLineCount({
                    group: 'custpage_sublist'
                });

                log.debug('numLines ' + typeof numLines, numLines);

                for (var i = 0; i < numLines; i++) {

                    var process = scriptContext.request.getSublistValue({
                        group: 'custpage_sublist',
                        name: 'custpage_process',
                        line: i
                    });

                    // log.debug('check_detail',check_detail);

                    if (process == 'T') {
                        var data = ({
                            'id_external': scriptContext.request.getSublistValue({ group: 'custpage_sublist', name: 'custpage_id_external', line: i }),
                            'list_id': scriptContext.request.getSublistValue({ group: 'custpage_sublist', name: 'custpage_list_id', line: i })
                        });

                        log.debug("data " + typeof data, data);

                        var id_bg = module_interco_to_ui.createDataBG(data);

                        var data_bulk = new Object();

                        data_bulk = ({
                            'id_bg': id_bg,
                            'data': data
                        });
                        log.debug("data_bulk " + typeof data_bulk, data_bulk);

                        if (id_bg) {
                            log.debug("created id_bg " + typeof id_bg, id_bg);
                            module_interco_to_sch.submitTaskScheduleSingleQueue(JSON.stringify(data_bulk));
                        }
                    }

                    log.debug('Remaining Usage In Loop ' + i, myScript.getRemainingUsage());
                }

                redirect.toSavedSearchResult({
                    id: 1031 //Bulk Interco TO BG Status 1030-Sandbox 1031-Production
                });
            }
        }

        return { onRequest }

    });

