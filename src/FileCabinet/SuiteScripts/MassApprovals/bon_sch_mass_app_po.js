/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define([
    'N/runtime',
    'N/record'
],
    
    (
        runtime,
        record
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

            var data = parameter.data;
            log.debug("data "+typeof data, data);

            if (data.length > 0){
                for (var i = 0; i < data.length; i++){

                    log.debug("data[i] "+typeof data[i], data[i]);
                    var objRecord = record.load({
                        type: record.Type.PURCHASE_ORDER, 
                        id: data[i],
                        isDynamic: true,
                    });

                    if (parameter.approval_level == '1'){
                        log.debug("process app level 1");
                        objRecord.setValue("custbody_bcg_approved_level_1", true);
                    }

                    objRecord.save();
                }
            }
        }

        return {execute}

    });
