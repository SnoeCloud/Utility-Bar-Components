/*
 * Developed by Ben Logan, linkedin.com/in/ben-logan
 */

 ({
	checkCaseAssetExistence : function(component, event, helper) {
		var context = component.get('v.context');
		var myAsset = component.get("v.myAsset");
		var myProductResult = component.get('v.myProductResult');
		var myOrderResult = component.get('v.myOrderResult');
		var myLineItemSN = component.get('v.myLineItemSN');

		var myAssetSN;

		if (context=='Internal'){
			myAssetSN = myAsset.SerialNumber;
		} else if (context == 'ProductResult'){
			myAssetSN = myProductResult.SerialNumber;
		} else { // else context = 'Order'
			myAssetSN = myLineItemSN;
		}
		
		var newIndicator = component.get("v.newOrCase");
        var checkAction = component.get("c.caseAssetExists");
        var spinner = component.find("mySpinner");
        $A.util.toggleClass(spinner, "slds-hide");
        
        checkAction.setParams({"myAssetSN": myAssetSN});
        checkAction.setCallback(this, function(response) {
            var state = response.getState();
            console.debug(response.getState());
            if (state === 'SUCCESS'){
				component.set("v.newOrCase", newIndicator + 1);
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
	/*createCaseAsset : function(component, event, helper) {
		var myAsset = component.get('v.myAsset');
		var myProductResult = component.get('v.myProductResult');
		var myOrderResult = component.get('v.myOrderResult');
		var myLineItemSN = component.get('v.myLineItemSN');
		var caseId = component.get('v.caseId');
		var context = component.get('v.context');
		var action;

		console.log('>>>>>>>>' + context);

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
                toastEvent.setParams({
					"title": "Error.",
					mode: 'sticky',
                    "message": "There was an error adding this to the Case: " + msg,
                    "type" : "error"
                });
                toastEvent.fire();
                $A.util.toggleClass(spinner, "slds-hide");
			}
		});
		$A.enqueueAction(action);
	},*/
    handleShowModal: function(component, evt, helper) {
        var thisAsset = component.get("v.myAsset");
        var thisProductResult = component.get("v.myProductResult");
        var thisOrderResult = component.get("v.myOrderResult");
        var thisLineItemSN = component.get("v.myLineItemSN");
        var thisContext = component.get("v.context");
        var thisCaseId = component.get("v.caseId");
        var thisNewOrCase = component.get("v.newOrCase");
        var spinner = component.find("mySpinner");
        
        
        var modalBody;
        $A.createComponent("c:CaseAssetRecordTypeSelector", 
                           {
                               "myAsset" : thisAsset,
                               "myProductResult" : thisProductResult,
                               "myOrderResult" : thisOrderResult,
                               "myLineItemSN" : thisLineItemSN,
                               "context" : thisContext,
                               "caseId" : thisCaseId,
                               "newOrCase" : thisNewOrCase
                           },
                           function(content, status) {
                               if (status === "SUCCESS") {
                                   modalBody = content;
                                   component.find('overlayLib').showCustomModal({
                                       header: "New Case Asset",
                                       body: modalBody, 
                                       showCloseButton: true,
                                       cssClass: "mymodal",
                                       closeCallback: function() {
                                           $A.util.toggleClass(spinner, "slds-hide");
                                       }
                                   })
                                   
                               }
                               
                           });
    }
})