public with sharing class boardController {
    @AuraEnabled(cacheable=true)
    public static list<Board__c> getBoardRecords() {
        return [SELECT Id, Name, (SELECT Id, Name FROM Board_columns__r), (SELECT Id, Name, Board_column__c FROM Accounts__r), (SELECT Id, Name, Board_column__c FROM Contacts__r), (SELECT Id, Name, Board_column__c FROM Leads__r), (SELECT Id, Name, Board_column__c FROM Opportunities__r) FROM Board__c];
    }
    @AuraEnabled(cacheable=true)
    public static list<Board_column__c> getColumRecords(string boardId) {
        return [SELECT Id, Name, (SELECT Id, Name, Board_column__c FROM Accounts__r), (SELECT Id, Name, Board_column__c FROM Contacts__r), (SELECT Id, Name, Board_column__c FROM Leads__r), (SELECT Id, Name, Board_column__c FROM Opportunities__r) FROM Board_column__c WHERE Board__c = :boardId];
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
            //System.debug('Record with updated field: ' + recordToUpdate);
    
            update recordToUpdate;
            System.debug('Record updated successfully');
        } catch (Exception e) {
            System.debug('Error in updating record: ' + e.getMessage());
        }
    }
}