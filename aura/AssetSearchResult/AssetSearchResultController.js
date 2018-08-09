/*
 * Developed by Ben Logan, linkedin.com/in/ben-logan
 */
({
	toggleExpand : function(component, event, helper) {
        var cmpTarget = component.find('product-section');
		$A.util.toggleClass (cmpTarget, 'slds-is-open');
	}
})