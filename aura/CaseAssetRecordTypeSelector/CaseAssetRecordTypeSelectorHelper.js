/*
 * Developed by Ben Logan, linkedin.com/in/ben-logan
 */
({
	createCaseAsset : function(component, event, helper) {
		var myAsset = component.get('v.myAsset');
		var myProductResult = component.get('v.myProductResult');
		var myOrderResult = component.get('v.myOrderResult');
		var myLineItemSN = component.get('v.myLineItemSN');
		var caseId = component.get('v.caseId');
		var context = component.get('v.context');
        var rType = component.find("selectid").get("v.value");
		var action;

		console.log('>>>>>>>>' + context);
        console.log('>>>>>>>>' + rType);
        if (rType == null || rType == "undefined"){
            rType = "Accessory";
        }

		if (context == 'ProductResult') {
			action = component.get("c.createNewCaseAssetFromExternal");	
            action.setParams({"myAsset": JSON.stringify(myProductResult), "caseId" : caseId, "rType" : rType});
		} else if(context == 'Internal') {
			action = component.get("c.createNewCaseAsset");	
            action.setParams({"myAsset": myAsset, "caseId" : caseId, "rType" : rType});
		} else { // else context = order
			action = component.get("c.createNewCaseAssetFromOrder");	
            action.setParams({"myAsset": JSON.stringify(myOrderResult), "caseId" : caseId, "myLineItemSN": myLineItemSN, "rType" : rType});
		}
		var spinner = component.find("mySpinner");
		
        action.setCallback(this, function(response) {
			var state = response.getState();
			console.log(response.getState());
            if (state === 'SUCCESS'){
				var toastEvent = $A.get("e.force:showToast");
				if (response.getReturnValue() == null){
					toastEvent.setParams({
						"title": "Error.",
						mode: 'sticky',
						"message": "There was an error adding this to the Case. Either a Case Asset already exists or a Case record is not open.",
						"type" : "error"
					});
				} else {
					toastEvent.setParams({
						"title": "Success!",
						"message": "A Case Asset has been created.",
						"type" : "success"
					});
				}

				toastEvent.fire();
                component.find("overlayLib").notifyClose();
				$A.get('e.force:refreshView').fire();
				$A.util.toggleClass(spinner, "slds-hide");
			} else {
				var toastEvent = $A.get("e.force:showToast");
				var err = response.getError();
				var msg;
				if (err && Array.isArray(err) && err.length > 0 && err[0].pageErrors != null) {
					msg = err[0].pageErrors[0].message;
				} else if (err && Array.isArray(err) && err.length > 0) {
					msg = err[0].message;
				}
				var thisId = "";
				var thisName = "";
				console.log(msg);
				console.log(msg.length);

				if (msg.length >= 100){
					thisId = msg.substring(54, 72); //substring(70, 88);
					thisName = msg.substring(88, 100); //substring(89, 101);	
				}
                toastEvent.setParams({
					"title": "Error.",
					mode: 'sticky',
					"message": msg,
					"messageTemplate" :  'There is already an active return for this Asset. Click here to view: {0}',
					messageTemplateData: [{
						url: '/one/one.app?#/sObject/' + thisId + '/view',
						label: thisName,
					}
					],						
                    "type" : "error"
                });
                component.find("overlayLib").notifyClose();
                toastEvent.fire();
                $A.util.toggleClass(spinner, "slds-hide");
			}
		});
		$A.enqueueAction(action);
	}
})