public with sharing class boardController {
    @AuraEnabled(cacheable=true)
    public static list<Board__c> getBoardRecords() {
        return [SELECT Id, Name, (SELECT Id, Name FROM Board_columns__r), (SELECT Id, Name, Board_column__c FROM Accounts__r), (SELECT Id, Name, Board_column__c FROM Contacts__r), (SELECT Id, Name, Board_column__c FROM Leads__r), (SELECT Id, Name, Board_column__c FROM Opportunities__r) FROM Board__c];
    }
    @AuraEnabled(cacheable=true)
    public static list<Board_column__c> getColumRecords(string boardId) {
        return [SELECT Id, Name, (SELECT Id, Name, Board_column__c FROM Accounts__r), (SELECT Id, Name, Board_column__c FROM Contacts__r), (SELECT Id, Name, Board_column__c FROM Leads__r), (SELECT Id, Name, Board_column__c FROM Opportunities__r) FROM Board_column__c WHERE Board__c = :boardId];
    }
    @AuraEnabled(cacheable=true)
    public static void updateAccountColumn(String recordId, String newColumnId) {
        // Find the Account record based on the recordId
        Account accToUpdate = [SELECT Id, Board_column__c FROM Account WHERE Id = :recordId LIMIT 1];

        // Check if the account is found and if the new column ID is different from the current one
        if (accToUpdate != null && accToUpdate.Board_column__c != newColumnId) {
            // Update the Board_column__c field with the new column ID
            accToUpdate.Board_column__c = newColumnId;

            // Save the changes
            update accToUpdate;
        }
    }
}