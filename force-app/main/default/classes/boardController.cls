public with sharing class boardController {
    @AuraEnabled(cacheable=true)
    public static list<Board__c> getBoardRecords() {
        // return [SELECT Id, Name, (SELECT Id, Name FROM Board_columns__r) FROM Board__c];
        return [SELECT Id, Name, (SELECT Id, Name FROM Board_columns__r), (SELECT Id, Name, Board_column__c FROM Accounts__r), (SELECT Id, Name, Board_column__c FROM Contacts__r), (SELECT Id, Name, Board_column__c FROM Leads__r), (SELECT Id, Name, Board_column__c FROM Opportunities__r) FROM Board__c];
    }
    // @AuraEnabled(cacheable=true)
    // public static list<Board_column__c> getBoardColumns(){ //list<Board__c>
    //     //return [SELECT Name, Id, (SELECT Name, Board__c FROM Board_columns__r) FROM Board__c];
    //     return [SELECT Name, ID, Board__c FROM Board_column__c];
    // }
    @AuraEnabled(cacheable=true)
    public static list<Board_column__c> getColumRecords() {
        return [SELECT Id, Name, (SELECT Id, Name, Board_column__c FROM Accounts__r), (SELECT Id, Name, Board_column__c FROM Contacts__r), (SELECT Id, Name, Board_column__c FROM Leads__r), (SELECT Id, Name, Board_column__c FROM Opportunities__r) FROM Board_column__c];
    }
}