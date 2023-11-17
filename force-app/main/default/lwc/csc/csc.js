import { api, LightningElement, wire, track } from 'lwc';
import { getRecord, getRecords, getRecordUi } from 'lightning/uiRecordApi';
import { getObjectInfo, getObjectInfos } from 'lightning/uiObjectInfoApi';
import { getListInfoByName, getListInfosByName } from "lightning/uiListsApi";
import { getListUi } from 'lightning/uiListApi';

import getBoardRecords from '@salesforce/apex/boardController.getBoardRecords';
import getBoardColumns from '@salesforce/apex/boardController.getBoardColumns';

import BOARD_OBEJCT from '@salesforce/schema/Board__c';

export default class Csc extends LightningElement {

    @api boards;
    @api columns;
    @api error;
    @api tabData;


    connectedCallback() {
        //this.loadColumns();
    }

    @track boards;
    @track error;

    @wire(getBoardRecords)
    wiredBoards({error, data}){
        if(data){
            console.log('board data: ',data)
            this.boards = data;
            //this.error = undefined;
        }
        else if(error){
            console.log('error 1: ', error);
            //this.error = error;
            this.boards = undefined;
        }
    }
    @track columns;

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