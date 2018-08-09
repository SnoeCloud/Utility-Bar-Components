/*
 * Developed by Ben Logan, linkedin.com/in/ben-logan
 */
({
    getInternalSearch : function(component, event, helper) {
        var searchStr =  component.find("assetSearch").get("v.value");
        var filterStr = component.find("searchFilter").get("v.value");
        var action = component.get("c.getInternal");
        var spinner = component.find("allAssetsTabSpinner");
        
        $A.util.toggleClass(spinner, "slds-hide");
        action.setParams({ searchStr: searchStr, filterStr: filterStr });
        action.setCallback(this, function(response) {
            $A.util.toggleClass(spinner, "slds-hide");
            component.set("v.caseClientRelatedProducts", response.getReturnValue());
        });
        $A.enqueueAction(action);
    },
    // Search when hitting enter
    onHitEtter : function(component,event, helper) {
        var spinner = component.find("allAssetsTabSpinner");

        if(event.getParams().keyCode === 13) {
            var searchStr =  component.find("assetSearch").get("v.value");
            var filterStr = component.find("searchFilter").get("v.value");
            var action = component.get("c.getInternal");

            $A.util.toggleClass(spinner, "slds-hide");
            action.setParams({ searchStr: searchStr, filterStr: filterStr });
            action.setCallback(this, function(response) {
                $A.util.toggleClass(spinner, "slds-hide");
                component.set("v.caseClientRelatedProducts", response.getReturnValue());
            });
            $A.enqueueAction(action);
        }
    }
})