/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define([
    'N/runtime'
],
    
    (
        runtime
    ) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            var myScript = runtime.getCurrentScript();
		
            var parameter = JSON.parse(myScript.getParameter({
                name: 'custscript_bon_params_mass_app_po'
            }));

            log.debug("parameter "+typeof parameter, parameter);
        }

        return {execute}

    });
