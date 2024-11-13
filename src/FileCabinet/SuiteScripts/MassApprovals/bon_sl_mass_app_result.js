/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/ui/serverWidget'
],
    
    (
        serverWidget
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {

            var parameters = JSON.parse(scriptContext.request.parameters.data);
            log.debug("parameters "+typeof parameters, parameters);

            if (scriptContext.request.method === 'GET') {
                var form = serverWidget.createForm({
                    title: 'Mass Approve Result',
                    hideNavBar: false
                });

                form.addSubmitButton({
                    label: 'Refresh'
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
