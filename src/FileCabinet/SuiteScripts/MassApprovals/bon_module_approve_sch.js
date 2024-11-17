/**
 * @NApiVersion 2.1
 */
define([
    'N/query', 
    'N/task'
],
    
    (
        query,
        task
    ) => {

        function submitTaskScheduleSingleQueue(parameter){

            log.debug("parameter submitTaskScheduleSingleQueue"+typeof parameter, parameter);
		
            var mySchedule = query.create({
                type: query.Type.SCHEDULED_SCRIPT
            });
            
            var myQueryTask = task.create({
                taskType: task.TaskType.QUERY
            });
            
            myQueryTask.filePath = 'ExportFolder/export.csv';
            myQueryTask.query = mySchedule;
            
            var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
            scriptTask.scriptId = 'customscript_bon_sch_mass_app_po';
            scriptTask.params = {
                'custscript_bon_params_mass_app_po': parameter
            };
            
            myQueryTask.addInboundDependency(scriptTask);
            var myTaskId = myQueryTask.submit();
            
            var myTaskStatus = task.checkStatus({
                taskId: myTaskId
            });
        }

        return {
            submitTaskScheduleSingleQueue
        }

    });
