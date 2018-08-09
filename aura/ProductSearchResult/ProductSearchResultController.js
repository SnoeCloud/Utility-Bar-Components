/*
 * Developed by Ben Logan, linkedin.com/in/ben-logan
 */

 ({
	toggleExpand : function(component, event, helper) {
        var cmpTarget = component.find('product-section');
		$A.util.toggleClass (cmpTarget, 'slds-is-open');
	},
	/*doInit : function(component, event, helper) {
		var lineItemsWithNulls = component.get('v.lineItemsWithNullSNs');
		var thisLineItem = component.get('v.related');

		if (thisLineItem != null) {
			for (var item in lineItemsWithNulls){
				if (lineItemsWithNulls[item] == thisLineItem.Id){
					component.set('v.nullAddAllButton', 'true');
				}
			}
		}
	}*/
})