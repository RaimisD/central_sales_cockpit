public with sharing class boardController {
    @AuraEnabled(cacheable=true)
    public static list<Board__c> getBoardRecords() {
        return [SELECT Id, Name FROM Board__c];
    }
}