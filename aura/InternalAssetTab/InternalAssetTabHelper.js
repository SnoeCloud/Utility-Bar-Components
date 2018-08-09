/*
 * Developed by Ben Logan, linkedin.com/in/ben-logan
 */

 ({
    // Grab the case's contact record
    getDoInit : function(component, event, helper) {
		var caseId = component.get("v.recordId");
        var getCaseAction = component.get("c.getCaseClient");

        getCaseAction.setParams({caseId : caseId});
        getCaseAction.setCallback(this, function(response) {
            component.set("v.caseClient", response.getReturnValue());
        });
        $A.enqueueAction(getCaseAction);
    },
    
    // Grab Assets related to the contact
    getClientRelatedProducts : function (component, event, helper) {
        var caseClient = component.get("v.caseClient");
        var spinner = component.find("internalTabSpinner");

        $A.util.toggleClass(spinner, "slds-hide");
        if(caseClient == null) {
            $A.util.toggleClass(spinner, "slds-hide");
            return;
        }
        var getCaseAction = component.get("c.getCaseClientRelatedProducts");

        getCaseAction.setParams({contactId : caseClient.Id});
        getCaseAction.setCallback(this, function(response) {
            $A.util.toggleClass(spinner, "slds-hide");
            component.set("v.caseClientRelatedProducts", response.getReturnValue());
        });
        $A.enqueueAction(getCaseAction);
    },
    
    // Search internally for related Assets
    getInternalSearch : function(component, event, helper) {
		var caseClient = component.get("v.caseClient");
        var searchStr =  component.find("assetSearch").get("v.value");
        var filterStr = component.find("searchFilter").get("v.value");
        var action = component.get("c.getInternalRelated");
        var spinner = component.find("internalTabSpinner");
       
        $A.util.toggleClass(spinner, "slds-hide");
        if(caseClient == null) {
            $A.util.toggleClass(spinner, "slds-hide");
            return;
        }        

        action.setParams({ searchStr: searchStr, filterStr: filterStr, contactId: caseClient.Id });
        action.setCallback(this, function(response) {
            $A.util.toggleClass(spinner, "slds-hide");
            component.set("v.caseClientRelatedProducts", response.getReturnValue());
        });
        $A.enqueueAction(action);
    }
})