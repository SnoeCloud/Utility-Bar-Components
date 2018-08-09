/*
 * Developed by Ben Logan, linkedin.com/in/ben-logan
 */

 ({
	checkCaseAssetsExistence : function(component, event, helper) {
		var myOrderResult = component.get("v.myOrderResult");
		var checkCount = component.get("v.checkCount");
        var checkAction = component.get("c.caseAssetsExistForOrder");
        var spinner = component.find("mySpinner");
        $A.util.toggleClass(spinner, "slds-hide");
        
        checkAction.setParams({"myOrderResult": JSON.stringify(myOrderResult)});
        checkAction.setCallback(this, function(response) {
            var state = response.getState();
            console.debug(response.getState());
            if (state === 'SUCCESS'){
				if (response.getReturnValue() == 'New'){
					// Try to create Case Assets
					component.set("v.checkCount", checkCount + 1);
				} else if(response.getReturnValue() =='Serial Numbers are not available for Line Items'){
					var toastEvent = $A.get("e.force:showToast");
					toastEvent.setParams({
						"title": "Error.",
						mode: 'sticky',
						"message": response.getReturnValue(),
						"type" : "error"
					});
					toastEvent.fire();
					$A.util.toggleClass(spinner, "slds-hide");
				} else {
					var toastEvent = $A.get("e.force:showToast");
					toastEvent.setParams({
						"title": "Error.",
						mode: 'sticky',
						"message": "Case Asset exists on this case: "+ response.getReturnValue(),
						"type" : "error"
					});
					toastEvent.fire();
					$A.util.toggleClass(spinner, "slds-hide");
				}
            } else {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
					"title": "Error.",
					mode: 'sticky',
                    "message": "There was an error adding this to the Case.",
                    "type" : "error"
                });
                toastEvent.fire();
                $A.util.toggleClass(spinner, "slds-hide");
            }

        });
		$A.enqueueAction(checkAction);
	},
	createCaseAssets : function(component, event, helper) {
		var myOrderResult = component.get("v.myOrderResult");
		var spinner = component.find("mySpinner");
		var caseId = component.get('v.caseId');
		var action = component.get("c.createNewCaseAssetsFromOrder");

		action.setParams({"myOrderResult": JSON.stringify(myOrderResult), "caseId": caseId});

		action.setCallback(this, function(response) {
			var state = response.getState();
            console.log(response.getState());
            if (state === 'SUCCESS'){
				var toastEvent = $A.get("e.force:showToast");
				if (response.getReturnValue() == null){
					toastEvent.setParams({
						"title": "Error.",
						mode: 'sticky',
						"message": "There was an error adding this to the Case. \r\n" +
									"Either the Asset already has an active Case, or a Case Record Page is not open.",
						"type" : "error"
					});
				} else {
					toastEvent.setParams({
						"title": "Success!",
						"message": "Case Assets have been created.",
						"type" : "success"
					});
				}

				toastEvent.fire();
				$A.get('e.force:refreshView').fire();
				$A.util.toggleClass(spinner, "slds-hide");
			} else {
				var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
					"title": "Error.",
					mode: 'sticky',
                    "message": "There was an error adding this to the Case. \r\n" +
					"Either the Asset already has an active Case, or a Case Record Page is not open.",
                    "type" : "error"
                });
                toastEvent.fire();
                $A.util.toggleClass(spinner, "slds-hide");
			}
		});
		$A.enqueueAction(action);
	}
})