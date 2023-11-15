public with sharing class boardController {
    @AuraEnabled(cacheable=true)
    public static list<Board__c> getBoardRecords() {
        return [SELECT Id, Name FROM Board__c];
    }

    @AuraEnabled(cacheable=true)
    public static list<Board__c> getBoardColumns(){
        return [SELECT Name, (SELECT Name FROM Board_columns__r) FROM Board__c];
    }
}