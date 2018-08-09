/*
 * Developed by Ben Logan, linkedin.com/in/ben-logan
 */

 ({
    // Grab the case's related client record
    doInit : function(component, event, helper) {
        helper.getDoInit(component, event);
    },
    
    // Populate initial list of client related products
    populateClientRelatedProducts : function(component, event, helper) {
      	helper.getClientRelatedProducts(component, event);  
    },
    
    // Search internally for Assets related to this client
    internalSearch : function(component, event, helper) {
    	helper.getInternalSearch(component, event);
    },

    // Search when hitting enter
    onHitEtter : function(component,event, helper) {
        if(event.getParams().keyCode === 13) {
            helper.getInternalSearch(component, event);
        }
    }
    
})