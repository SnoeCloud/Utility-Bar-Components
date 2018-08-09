/*
 * Developed by Ben Logan, linkedin.com/in/ben-logan
 */

 ({
    // Grab the case's related client record
    doInit : function(component, event, helper) {
        helper.getdoInit(component, event);
    },
    
    // Populate initial list of client related products
    populateClientRelatedProducts : function(component, event, helper) {
      	helper.getClientRelatedProducts(component, event);  
    },
    
    // Use the united API to find additional product/order info
    externalSearch : function(component, event, helper) {
        helper.getExternalSearch(component, event);
    },

    // Search when hitting enter
    onHitEtter : function(component,event, helper) {

        if(event.getParams().keyCode === 13) {
            helper.getExternalSearch(component, event);
        }
    }
})