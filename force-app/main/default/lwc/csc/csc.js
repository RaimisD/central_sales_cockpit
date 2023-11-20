import { api, LightningElement, wire, track } from 'lwc';
import { getRecord, getRecords, getRecordUi } from 'lightning/uiRecordApi';
import { getObjectInfo, getObjectInfos } from 'lightning/uiObjectInfoApi';
import { getListInfoByName, getListInfosByName } from "lightning/uiListsApi";
import { getListUi } from 'lightning/uiListApi';


import getBoardRecords from '@salesforce/apex/boardController.getBoardRecords';
//import getBoardColumns from '@salesforce/apex/boardController.getBoardColumns';
import getColumRecords from '@salesforce/apex/boardController.getColumRecords';

import BOARD_OBEJCT from '@salesforce/schema/Board__c';
import BOARD_COLUMN_OBJECT from '@salesforce/schema/Board_column__c'
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';


export default class Csc extends LightningElement {

    @api boards;
    @api columns;
    @api error;
    @api tabData;

    connectedCallback() {

    }
    @track boards;
    @track error;

    @wire(getBoardRecords)
    wiredBoards({error, data}){
        if(data){
            console.log('board data: ',data)
            this.boards = data;
        }
        else if(error){
            console.log('error 1: ', error);
            this.boards = undefined;
        }
        else if(!data){
            console.log('no data 1');
        }
    }
    
    @track columns;
    @wire(getColumRecords)
    wiredRecords({error, data}){
        if(data){
            console.log('column records: ',data);
            this.columns = data;
        }
        else if(!data){
            console.log('no data 3');
            this.columns = undefined;
        }
        else if(error){
            console.log('error 3: ', error);
        }
    }
    @track recordUrl;
    get recordUrl(){
        return 'lightning/r/'
    }

    @wire(getObjectInfo, {objectApiName: BOARD_OBEJCT})
    objInfo({error, data}){
        if(data){
            console.log('object info: ',data);
        }
        else if(!data){
            console.log('no data 2');
        }
        else if(error){
            console.log('error 2: ', error);
        }
    }
}