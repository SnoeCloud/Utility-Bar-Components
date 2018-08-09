/*
 * Developed by Ben Logan, linkedin.com/in/ben-logan
 */

 ({
	// Grab the case's related client record
    doInit : function(component, event, helper) {
        helper.getdoInit(component, event);
    },
    // Use the united API to find additional product/order info
    externalunitedOrderSearch : function(component, event, helper) {
        helper.getExternalunitedOrderSearch(component, event);
    },
    // Search when hitting enter
    onHitEtter : function(component,event, helper) {
        if(event.getParams().keyCode === 13) {
            helper.getExternalunitedOrderSearch(component, event);
        }
    }
})