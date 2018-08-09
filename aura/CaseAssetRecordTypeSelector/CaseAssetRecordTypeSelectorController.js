/*
 * Developed by Ben Logan, linkedin.com/in/ben-logan
 */
({
	handleCancel : function(component, event, helper) {
        //closes the modal or popover from the component
        component.find("overlayLib").notifyClose();
    },
    handleOK : function(component, event, helper) {
		helper.createCaseAsset(component, event, helper);
    },
    fetchListOfRecordTypes: function(component, event, helper) {
        var action = component.get("c.fetchCaseAssetRecordTypeValues");
        action.setCallback(this, function(response) {
            component.set("v.lstOfRecordType", response.getReturnValue());
        });
        $A.enqueueAction(action);
    }
})