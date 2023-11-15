import { api, LightningElement, wire } from 'lwc';
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
        this.loadBoards();
        this.loadColumns();
    }

    loadBoards() {
        getBoardRecords()
        .then(result => {
            this.boards = result;
            console.log('board result: ', result);
            this.error = undefined;
        })
        .catch(error => {
            this.error = error;
            this.boards = undefined;
            console.log('error, no data');
        });
    }
    // processResults(data) {
    //     this.tabData = data.map((board, index) => ({
    //         id: board.Id,
    //         name: board.Name,
    //         tabIndex: index,
    //         active: index === 0 // First tab active by default
    //     }));
    // }
    loadColumns(){
        getBoardColumns()
        .then(result => {
            this.columns = result;
            console.log('column result: ', result);
            this.error = undefined;
        })
        .catch(error => {
            this.error = error;
            this.columns = undefined;
            console.log('error, no data');
        });
    }

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