public with sharing class boardController {
    @AuraEnabled(cacheable=true)
    public static list<Board__c> getBoardRecords() {
        return [SELECT Id, Name, board_order__c FROM Board__c ORDER BY board_order__c ASC];
    }
    @AuraEnabled(cacheable=true) //ORDER BY Order__c ASC
    public static list<Board_column__c> getColumRecords(string boardId) {
        return [SELECT Id, Name, (SELECT Id, Name, Order__c, Board_column__c FROM Accounts__r), 
        (SELECT Id, Name, Order__c, Board_column__c FROM Contacts__r), 
        (SELECT Id, Name, Order__c, Board_column__c FROM Leads__r), 
        (SELECT Id, Name, Amount, Order__c, Board_column__c FROM Opportunities__r) 
        FROM Board_column__c WHERE Board__c = :boardId ORDER BY col_order__c ASC];
    }
    
    @AuraEnabled
    public static void updateColumn(String recordId, String newColumnId, String recType) {
        System.debug('Values received, recordId: ' + recordId + ', newColumnId: ' + newColumnId + ', sObjType: ' + recType);
        String query = 'SELECT Id, Board_column__c FROM ' + recType + ' WHERE Id = :recordId LIMIT 1';
        SObject recordToUpdate;
        try {
            recordToUpdate = Database.query(query);
            System.debug('Record to update: ' + recordToUpdate);
            recordToUpdate.put('Board_column__c', newColumnId);
            update recordToUpdate;
            System.debug('Record updated successfully');
        } catch (Exception e) {
            System.debug('Error in updating record: ' + e.getMessage());
        }
    }
    @AuraEnabled (cacheable=true)
    public static integer totalAmount(string colId){
        AggregateResult result = [SELECT SUM(expectedRevenue) total FROM Opportunity WHERE Board_column__c =: colId];

        // Check if the result is not null and the total is not null
        if (result != null && result.get('total') != null) {
            // Cast the total to Decimal and then to Integer
            return (Integer)((Decimal)result.get('total'));
        }
        return 0;
    }
    @AuraEnabled(cacheable=true)
    public static Integer recCount(string colId){
        List<AggregateResult> results = [SELECT COUNT(Id) FROM Opportunity WHERE Board_column__c = :colId];
        if (!results.isEmpty()) {
            return (Integer)results[0].get('expr0');
        }
        return 0;
    }
}