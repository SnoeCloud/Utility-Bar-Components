/*
 * Developed by Ben Logan, linkedin.com/in/ben-logan
 */
 
 public class RelatedAssetsController {
    
    // Get Assets for the Related Tab - these are assets that match the search string AND are related to a given contact
    @AuraEnabled
    public static List<Asset> getInternalRelated (String searchStr, String filterStr, String contactId) {
        List<Asset> internalRelated = new List<Asset>();
        String newSearchText = searchStr;
        String query;
        String queryfields = ''; 
        
        SObjectType assetObject = Schema.getGlobalDescribe().get('Asset');
        Map<String,Schema.SObjectField> assetFields = assetObject.getDescribe().fields.getMap();
        
        // Construct a string list of all fields for the query 
        for (string field : assetFields.keySet()){
            queryfields += field + ',';
        }
        
        // Remove the extra comma
        queryfields = queryfields.substring(0, queryfields.length()-1);

        if(searchStr == '') {
            return internalRelated;
        }
        
        if (filterStr.replaceAll('\\s', '') == 'SerialNumber'){
            query = 'select ' + queryfields + ' from Asset where SerialNumber = :newSearchText and ContactId =:contactId';
        } else {
            query = 'select ' + queryfields + ' from Asset where Last_Order_Number__c = :newSearchText and ContactId =:contactId';
        }
        
        system.debug(query);
        system.debug(newSearchText);
        internalRelated = Database.query(query);
        
        
        return internalRelated;
    }
    
    // Get Assets for the All Internal Tab - these are any assets that match the search string
    @AuraEnabled
    public static List<Asset> getInternal(String searchStr, String filterStr) {
        List<Asset> internalAssets = new List<Asset>();
        String newSearchText = searchStr;
        String query;
        String queryfields = ''; 
        
        SObjectType assetObject = Schema.getGlobalDescribe().get('Asset');
        Map<String,Schema.SObjectField> assetFields = assetObject.getDescribe().fields.getMap();
        
        // Construct a string list of all fields for the query 
        for (string field : assetFields.keySet()){
            queryfields += field + ',';
        }
        
        // Remove the extra comma
        queryfields = queryfields.substring(0, queryfields.length()-1);

        if(searchStr == '') {
            return null;
        }
        
        if (filterStr.replaceAll('\\s', '') == 'SerialNumber'){ 
            query = 'select ' + queryfields + ' from Asset where SerialNumber = :newSearchText';
        } else if (filterStr.replaceAll('\\s', '') == 'HouseholdID'){ 
            query = 'select ' + queryfields + ' from Asset where House_hold_id__c = :newSearchText';
        } else if (filterStr.replaceAll('\\s', '') == 'Email'){ 
            query = 'select ' + queryfields + ' from Asset where Registration_Email__c = :newSearchText';
        } else if(filterStr.replaceAll('\\s', '') == 'unitedID'){ 
            query = 'select ' + queryfields + ' from Asset where Contact.united_ID__c = :newSearchText' ;
        } else { // this is fine
            query = 'select ' + queryfields + ' from Asset where Last_Order_Number__c = :newSearchText';
        }
        system.debug(query);
        system.debug(newSearchText);
        internalAssets = Database.query(query);

        if (internalAssets != null && internalAssets.size() == 0)
            return null;
        
        return internalAssets;
    }
    
    // Get list of case record types for new case modal
    // - needed for the create a case modal
    @AuraEnabled        
    public static List<String> fetchRecordTypeValues(){
        Map<String, Id> recordTypeMap = ApexUtilities.getRecordtypesMap('Case');
        List<String> recordTypeValues = new List<String>();
        recordTypeValues.addAll(recordTypeMap.keySet());
        return recordTypeValues;
    }
    
    // Used for Add to Case record type selector modal
    @AuraEnabled        
    public static List<String> fetchCaseAssetRecordTypeValues(){
        Map<String, Id> recordTypeMap = ApexUtilities.getRecordtypesMap('Case_Asset__c');
        List<String> recordTypeValues = new List<String>();
        recordTypeMap.remove('Accessory');
        recordTypeMap.remove('Master');
        recordTypeValues.addAll(recordTypeMap.keySet());
        return recordTypeValues;
    }
    
    // Get the open case's client contact record
    @AuraEnabled
    public static Contact getCaseClient(Id caseId) {
        // Modified by Lalit to Overcome Error - System.QueryException: List has no rows for assignment to SObject
        /*List<Case> currentCaseList = [Select Id, ContactId from Case where Id =:caseId];
        if(!currentCaseList.isEmpty()){
            return [Select Id, Name from Contact where Id =:currentCaseList.get(0).ContactId];
        } else {
            return new Contact();
        }*/

        try {
            List<Case> currentCaseList = [Select Id, ContactId from Case where Id =:caseId];
            if(!currentCaseList.isEmpty()){
                return [Select Id, Name from Contact where Id =:currentCaseList.get(0).ContactId];
            } else {
             return null;
            }
        } catch(Exception e) {
            return null;
        }
    }
    
    // Get Assets related to a given contact
    // - Used on-init/on-change of the contactId
    @AuraEnabled
    public static List<Asset> getCaseClientRelatedProducts (Id contactId) {
        List<Asset> relatedProducts = new List<Asset>();
        String query;
        String queryfields = ''; 
        
        SObjectType assetObject = Schema.getGlobalDescribe().get('Asset');
        Map<String,Schema.SObjectField> assetFields = assetObject.getDescribe().fields.getMap();
        
        // Construct a string list of all fields for the query 
        for (string field : assetFields.keySet()){
            queryfields += field + ',';
        }
        
        // Remove the extra comma
        queryfields = queryfields.substring(0, queryfields.length()-1);

        query = 'select ' + queryfields + ' from Asset where ContactId =:contactId';
        relatedProducts = Database.query(query);

        return relatedProducts;
    }
    
    // Use the united API wrapper class to retrieve info about orders
    @AuraEnabled
    public static List<scOrderInfo> externalOrderSearch (String searchStr) {
        List<scOrderInfo> searchResultsList = new List<scOrderInfo>();
        searchResultsList.addAll(scOrderCallout.getOrdersDetails(searchStr));
        system.debug('Order Search Result List: ' + searchResultsList);
        
        // return null if it's returning a blank object
        if (searchResultsList != null && searchResultsList.get(0).Id == null)
            return null; 

        return searchResultsList;
    }
    
    // Use the united API wrapper class to retrieve info about a product
   /* @AuraEnabled
    public static List<scProductInfo> externalProductSearch (String searchStr) {
        List<scProductInfo> prod = scProductCallout.getProductDetails(searchStr);
        return prod;
    }*/

    /* Check if the Asset is already associated to a Case
     * If so, return the Case #
     * Else, return 'New'
     */
    @AuraEnabled
    public static String caseAssetExists (String myAssetSN){
        Case_Asset__c check;
        
        try {
            check = [Select Id, Serial_Number__c, Case__r.CaseNumber from Case_Asset__c where Serial_Number__c=:myAssetSN Limit 1];
        } catch (Exception e){
            return 'New';
        }
        
        system.debug(check.Case__r.CaseNumber);
        return check.Case__r.CaseNumber;
    }

    // Create a new Case Asset from an Asset
    @AuraEnabled
    public static Case_Asset__c createNewCaseAsset (Asset myAsset, String caseId, String rType){
        Case check;        
        try {
            check = [Select Id from Case where Id=:caseId];
        } catch (Exception e){
            return null; //if the lightning component doesn't recognize you're on a case page...
        }
        
        Map<String,Id> temp = new Map<String,Id>(ApexUtilities.getRecordtypesMap ('Case_Asset__c'));

        Case_Asset__c newCA = new Case_Asset__c();
        //newCA.RecordTypeId = temp.get(rType);
        newCA.Case__c = check.Id;
        newCA.Asset__c = myAsset.Id;

        Database.insert(newCA);
        return newCA;
    }

    // Create new case asset for a given Serial Number for an Extenal Product search result
    @AuraEnabled
    public static Case_Asset__c createNewCaseAssetFromExternal(String myAsset, String caseId, String rType){
        scProductInfo myFixedAsset = (scProductInfo)JSON.deserialize(myAsset, scProductInfo.class);

        Case check;
        try {
            check = [Select Id from Case where Id=:caseId];
        } catch (Exception e){
            return null; //if the lightning component doesn't recognize you're on a case page...
        }

        Map<String,Id> temp = new Map<String,Id>(ApexUtilities.getRecordtypesMap ('Case_Asset__c'));

        Case_Asset__c newCA = new Case_Asset__c();
        //newCA.RecordTypeId = temp.get(rType);
        newCA.Case__c = check.Id;
        newCA.Serial_Number__c = myFixedAsset.SerialNumber;
       
        newCA.StockKeepingUnit__c = myFixedAsset.ProductDetails.Code;
        newCA.Order_Number__c = myFixedAsset.OrderDetails.OrderNumber;

        //AssetLookup.DateDetails(Last.RegisteredOn or FirstRegisteredOn - Which ever is non-null)
        
        if (myFixedAsset.DateDetails.ShippedOnUTC != null) {
           
            newCA.Last_Ship_Date__c = myFixedAsset.DateDetails.ShippedOnUTC;
        }
        if (myFixedAsset.DateDetails.LastRegisteredOnUTC != null) {
            
            newCA.InstallDate__c = myFixedAsset.DateDetails.LastRegisteredOnUTC; //*temp*
        }
        else if (myFixedAsset.DateDetails.FirstRegisteredOnUTC != null) { 
           
            newCA.InstallDate__c = myFixedAsset.DateDetails.FirstRegisteredOnUTC;
        }
        if (myFixedAsset.ProductDetails.Description != null)
            newCA.Product_Name__c = myFixedAsset.ProductDetails.Description; 
        if (myFixedAsset.RegistrationDetails != null && myFixedAsset.RegistrationDetails.LastEmailAddress != null)
            newCA.Registered_Email__c = myFixedAsset.RegistrationDetails.LastEmailAddress;
        if (myFixedAsset.OrderDetails.InvoiceNumber != null)
            newCA.Invoice_Number__c = myFixedAsset.OrderDetails.InvoiceNumber;
        if (myFixedAsset.DateDetails.ManufacturedOnUTC != null){
            //newCA.Manufacture_Date__c = convertDTToDate(myFixedAsset.DateDetails.ManufacturedOnUTC); //*temp*
            newCA.Manufacture_Date__c = myFixedAsset.DateDetails.ManufacturedOnUTC;
        }
        

        if(myFixedAsset.OrderDetails.PurchasedFromunited!= null && myFixedAsset.OrderDetails.PurchasedFromunited == 1){
            //newCA.Purchased_From_united__c = true;
        } else{
            //newCA.Purchased_From_united__c = false;
        }

        Database.insert(newCA);
        return newCA;
    }

    // Create new case asset for a given Serial Number on a Line Item in an Order
    @AuraEnabled 
    public static Case_Asset__c createNewCaseAssetFromOrder(String myAsset, String caseId, String myLineItemSN, String rType){
        scOrderInfo myFixedAsset = (scOrderInfo)JSON.deserialize(myAsset, scOrderInfo.class);

        Case check;
        try {
            check = [Select Id from Case where Id=:caseId];
        } catch (Exception e){
            return null; //if the lightning component doesn't recognize you're on a case page...
        }

        Map<String,Id> temp = new Map<String,Id>(ApexUtilities.getRecordtypesMap ('Case_Asset__c'));
        Case_Asset__c newCA = new Case_Asset__c();
        //newCA.RecordTypeId = temp.get(rType);
        newCA.Case__c = check.Id;

        // Add fields from Order here
        newCA.Serial_Number__c = myLineItemSN;
        newCA.Order_Number__c = myFixedAsset.unitedOrderNumber;
        if (myFixedAsset.OrderDateUTC != null) {
            //newCA.Last_Ship_Date__c = convertDTToDate(myFixedAsset.OrderDateUTC); *temp*
            newCA.Last_Ship_Date__c = myFixedAsset.OrderDateUTC; //*temp*
        }

        for (scOrderInfo.LineItem li : myFixedAsset.LineItems.LineItem) {
            if (li.SerialNumbers.SerialNumber.contains(myLineItemSN)){
                // Add fields from Line Item here
                //newCA.Model_Number__c = li.ProductNumber; Removed per I-312709
                newCA.StockKeepingUnit__c = li.ProductNumber;
                newCA.Product_Name__c = li.ProductDescription;
                newCA.Refurbished__c = (li.Refurbished == 1 ? true : false);
            }
        }
        
        Database.insert(newCA);
        return newCA;
    }


    public static Date convertDTToDate(DateTime toConvert){
        return Date.newInstance(toConvert.year(), toConvert.month(), toConvert.day());
    }

    // Given an order, check for whether or not Case Assets exist for any of the Serial Numbers in the Order's Line Items
    @AuraEnabled
    public static String caseAssetsExistForOrder(String myOrderResult){
        scOrderInfo myFixedOrderResult = (scOrderInfo)JSON.deserialize(myOrderResult, scOrderInfo.class);
        Case_Asset__c check;
        String returnValue;
        
        for (scOrderInfo.LineItem li : myFixedOrderResult.LineItems.LineItem) {
            if (li.SerialNumbers != null){
                for (String serialN : li.SerialNumbers.SerialNumber){
                    try { 
                        check = [Select Id, Serial_Number__c, Case__r.CaseNumber from Case_Asset__c where Serial_Number__c=:serialN Limit 1];
                        returnValue = check.Case__r.CaseNumber;
                        return returnValue;
                    } catch (Exception e){
                        returnValue = 'New';
                        return returnValue;
                    }
                }
            } else {
                return 'Serial Numbers are not available for Line Items';
            }
        }
        
        return returnValue;
    }

    // Create new case assets for each Serial Number on each Line Item on an Order
    @AuraEnabled
    public static List<Case_Asset__c> createNewCaseAssetsFromOrder(String myOrderResult, String caseId){
        scOrderInfo myFixedOrderResult = (scOrderInfo)JSON.deserialize(myOrderResult, scOrderInfo.class);
        List<Case_Asset__c> created = new List<Case_Asset__c>();

        Case check;
        try {
            check = [Select Id from Case where Id=:caseId];
        } catch (Exception e){
            return null; //if the lightning component doesn't recognize you're on a case page...
        }
        
        Map<String,Id> temp = new Map<String,Id>(ApexUtilities.getRecordtypesMap ('Case_Asset__c'));
        
        // Create a Case Asset for each Serial Number for each Line Item on the Order
        for (scOrderInfo.LineItem li : myFixedOrderResult.LineItems.LineItem) {
            if (li.SerialNumbers != null){
                for (String serialN : li.SerialNumbers.SerialNumber){
                    Case_Asset__c newCA = new Case_Asset__c();
                
                    newCA.Case__c = check.Id;
                    //newCA.RecordTypeId = newCA.RecordTypeId = temp.get('Money Back Guarantee');

                    // Add fields from Order here
                    newCA.Serial_Number__c = serialN;
                    newCA.Return_Channel__c = myFixedOrderResult.Dealer.Channel;
                    //newCA.Purchased_From_united__c = (myFixedOrderResult.Dealer.PurchasedFromunited == 1 ? true : false);
                    newCA.Refurbished__c = (li.Refurbished == 1 ? true : false);
                    newCA.Order_Number__c = myFixedOrderResult.unitedOrderNumber;
                    //newCA.Last_Ship_Date__c = convertDTToDate(myFixedOrderResult.OrderDateUTC); //*temp*
                    newCA.Last_Ship_Date__c = myFixedOrderResult.OrderDateUTC; //*temp*
                    //newCA.unitedID__c = myFixedOrderResult.CustomerID;
                    //newCA.Model_Number__c = li.ProductNumber; Removed per I-312709
                    newCA.StockKeepingUnit__c = li.ProductNumber;
                    newCA.Product_Name__c = li.ProductDescription;
                    created.add(newCA);
                }
            }
        }
        Database.insert(created);
        return created;
    }
    
}