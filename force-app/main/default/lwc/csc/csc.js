import { LightningElement, wire } from 'lwc';
import { getRecord, getRecords, getRecordUi } from 'lightning/uiRecordApi';
import { getObjectInfo, getObjectInfos } from 'lightning/uiObjectInfoApi';
import { getListInfoByName, getListInfosByName } from "lightning/uiListsApi";
import { getListUi } from 'lightning/uiListApi';
import BOARD_OBEJCT from '@salesforce/schema/Board__c';
export default class Csc extends LightningElement {

    @wire(getObjectInfo, {objectApiName: BOARD_OBEJCT})
    objInfo({error, data}){
        if(data){
            console.log('object info: ',data);
        }
        else if(!data){
            console.log('no data 1');
        }
        else if(error){
            console.log('error: ', error);
        }
    }
}