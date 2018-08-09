/*
 * Developed by Ben Logan, linkedin.com/in/ben-logan
 */
({
    // grab the case's contact record
    getdoInit : function(component, event, helper) {
		var caseId = component.get("v.recordId");
        var getCaseAction = component.get("c.getCaseClient");

        getCaseAction.setParams({caseId : caseId});
        getCaseAction.setCallback(this, function(response) {
            component.set("v.caseClient", response.getReturnValue());
        });
        $A.enqueueAction(getCaseAction);
    },
    
    // grab all assets related to the contact
    getClientRelatedProducts : function (component, event, helper) {
        component.set('v.searchType', 'Client');
        var caseClient = component.get("v.caseClient");
        if(caseClient == null) {
            return;
        }
        var getCaseAction = component.get("c.getCaseClientRelatedProducts");

        getCaseAction.setParams({contactId : caseClient.Id});
        getCaseAction.setCallback(this, function(response) {
            component.set("v.caseClientRelatedProducts", response.getReturnValue());
        });
        $A.enqueueAction(getCaseAction);
    },
    /* The variable search handler for united API callouts */
    getExternalSearch : function(component, event, helper) {
        var searchStr =  component.find("assetSearch").get("v.value");
        var filterStr = component.find("searchFilter").get("v.value");
        var orderAction = component.get("c.externalOrderSearch");
        var productAction = component.get("c.externalProductSearch")
        
        if(filterStr == 'Product: Serial Number') {
            console.log('Product search');
            component.set('v.searchType', 'Product');
            productAction.setParams({ searchStr: searchStr});
            productAction.setCallback(this, function(response) {
                component.set("v.caseClientRelatedProducts", response.getReturnValue());
            });
            $A.enqueueAction(productAction);            
        } else {
            console.log('Order search');
            component.set('v.searchType', 'Order');
            orderAction.setParams({ searchStr: searchStr, filterStr: filterStr });
            orderAction.setCallback(this, function(response) {
                component.set("v.caseClientRelatedProducts", response.getReturnValue());
            });
            $A.enqueueAction(orderAction);
        }
    }
})