public with sharing class boardController {
    @AuraEnabled(cacheable=true)
    public static list<Board__c> getBoardRecords() {
        return [SELECT Id, Name, (SELECT Id, Name FROM Board_columns__r), (SELECT Id, Name, Board_column__c FROM Accounts__r), (SELECT Id, Name, Board_column__c FROM Contacts__r), (SELECT Id, Name, Board_column__c FROM Leads__r), (SELECT Id, Name, Board_column__c FROM Opportunities__r) FROM Board__c];
    }
    @AuraEnabled(cacheable=true)
    public static list<Board_column__c> getColumRecords(string boardId) {
        return [SELECT Id, Name, (SELECT Id, Name, Board_column__c FROM Accounts__r), (SELECT Id, Name, Board_column__c FROM Contacts__r), (SELECT Id, Name, Board_column__c FROM Leads__r), (SELECT Id, Name, Board_column__c FROM Opportunities__r) FROM Board_column__c WHERE Board__c = :boardId];
    }
}