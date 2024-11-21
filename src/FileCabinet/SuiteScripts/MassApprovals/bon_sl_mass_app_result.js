/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/ui/serverWidget',
    '/SuiteScripts/MassApprovals/bon_module_approve.js',
],
    
    (
        serverWidget,
        bonApproveModule
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {

            // var parameters = JSON.parse(scriptContext.request.parameters.data);
            // log.debug("parameters "+typeof parameters, parameters);

            var data = bonApproveModule.getDataPObyID();

            log.debug("data "+typeof data, data);

            if (scriptContext.request.method === 'GET') {
                var form = serverWidget.createForm({
                    title: 'Mass Approve Result',
                    hideNavBar: false
                });

                var sublist = form.addSublist({
                    id: 'custpage_sublist',
                    type: serverWidget.SublistType.LIST,
                    label: 'Data'
                });

                sublist.addField({id : 'custpage_view', label: '.', type: serverWidget.FieldType.URL}).linkText = 'View';
                sublist.addField({id : 'custpage_id', label: 'ID', type: serverWidget.FieldType.TEXT}).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                sublist.addField({id : 'custpage_trandate', label: 'Date', type: serverWidget.FieldType.TEXT});
                sublist.addField({id : 'custpage_tranid', label: 'Document Number', type: serverWidget.FieldType.TEXT});
                sublist.addField({id : 'custpage_entity', label: 'Vendor', type: serverWidget.FieldType.TEXT});
                sublist.addField({id : 'custpage_approvalstatus', label: 'Status', type: serverWidget.FieldType.TEXT});
                sublist.addField({id : 'custpage_amount', label: 'Total Transaction', type: serverWidget.FieldType.CURRENCY});
                sublist.addField({id : 'custpage_trans_type', label: 'Transaction Type', type: serverWidget.FieldType.TEXT});
                sublist.addField({id : 'custpage_memo', label: 'Memo', type: serverWidget.FieldType.TEXT});
                sublist.addField({id : 'custpage_location', label: 'Location', type: serverWidget.FieldType.TEXT});
                sublist.addField({id : 'custpage_subsidiary', label: 'Subsidiary', type: serverWidget.FieldType.TEXT});

                var j = 0;
                data.forEach(function (result) {
                    
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

                sublist.addRefreshButton();

                form.addSubmitButton({
                    label: 'Back'
                });

                scriptContext.response.writePage(form);
            }
            else{

                var prevScript = parameters.sourceScript;

                redirect.toSuitelet({
                    scriptId: prevScript.id,
                    deploymentId: prevScript.deploymentId
                });
            }
        }

        return {onRequest}

    });
