/*
 * Developed by Ben Logan, linkedin.com/in/ben-logan
 */

 ({
	// Grab the case's contact record
    getdoInit : function(component, event) {
		var caseId = component.get("v.recordId");
        var getCaseAction = component.get("c.getCaseClient");

        getCaseAction.setParams({caseId : caseId});
        getCaseAction.setCallback(this, function(response) {
            component.set("v.caseClient", response.getReturnValue());
        });
        $A.enqueueAction(getCaseAction);
    },
    getExternalunitedOrderSearch : function(component, event) {
        var searchStr =  component.find("orderSearch").get("v.value");
        var orderAction = component.get("c.externalOrderSearch");
        var spinner = component.find("orderSpinner");
        
        $A.util.toggleClass(spinner, "slds-hide");
        component.set('v.searchType', 'Order');
        orderAction.setParams({ searchStr: searchStr});
        orderAction.setCallback(this, function(response) {
            component.set("v.orderSearchResults", response.getReturnValue());
            $A.util.toggleClass(spinner, "slds-hide");
            
            var myResponse = response.getReturnValue();
            var allNull = true;
            var someNull = false;
            var lineItemsWithNullSNs = new Array();
            var validSNs = new Array();

            if (myResponse != null) {               
                for (var order in myResponse){
                    for (var lineItemsContainer in myResponse[order].LineItems){
                        var lineItemArray = myResponse[order].LineItems[lineItemsContainer];
                        for(var lineItem in lineItemArray){
                            if (lineItemArray[lineItem].SerialNumbers == null) {
                                someNull = true;
                                lineItemsWithNullSNs.push(myResponse[order].Id);
                            } else {
                                allNull = false;
                                var serNums = lineItemArray[lineItem].SerialNumbers;
                                for(var sn in serNums) {
                                    validSNs.push(serNums[sn]);
                                }
                            }
                        }
                    }
                }
                
                if (someNull && !allNull){
                    component.set('v.lineItemsWithNullSNs', lineItemsWithNullSNs);
                    component.set('v.validSNs', validSNs);
                } else if (someNull && allNull) {
                    component.set('v.nullAddAllButton', 'true');
                } else {
                    component.set('v.validSNs', validSNs);
                }
                
            }
        });
        $A.enqueueAction(orderAction);
    }
})