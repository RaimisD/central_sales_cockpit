import { api, LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord, getRecord, getRecords } from 'lightning/uiRecordApi';
import { refreshApex } from "@salesforce/apex";
import { getRelatedListRecordsBatch, getRelatedListInfo, getRelatedListInfoBatch,  getRelatedListRecords} from 'lightning/uiRelatedListApi';

import getBoardRecords from '@salesforce/apex/boardController.getBoardRecords';
import getColumRecords from '@salesforce/apex/boardController.getColumRecords';
import updateColumn from '@salesforce/apex/boardController.updateColumn';
import ACCOUNT_NAME_FIELD from "@salesforce/schema/Account.Name";
import LEAD_NAME_FIELD from "@salesforce/schema/Lead.Name";
import OPPORTUNITY_NAME_FIELD from "@salesforce/schema/Opportunity.Name";
import CONTACT_NAME_FIELD from "@salesforce/schema/Contact.Name";


export default class Csc extends NavigationMixin(LightningElement) {
    connectedCallback() {
        console.log("Board open? ", this.addBoardOpen);
        console.log("Column open? ", this.addColumn);
    }
    navigateToRecord(event) {  //generates link to record
        event.stopPropagation();
        const recordId = event.currentTarget.dataset.id;
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            },
        }).then(url => {
            window.open(url);
        });
    }
        /* ---------BOARD TABS---------- */
    @track selectedTab;
    handleTabSelect(event){ //checks which column is selected to pass value
        this.selectedTab = event.target.value;
        //this.loadColumnRecords();
        console.log('selected tab: ', event.target.value);
    }
    @api boards;
    @track boards;
    wiredBoardsResult;
    /* -----LOAD BOARDS----- */
    @wire(getBoardRecords)
    wiredBoards(result){
        this.wiredBoardsResult = result;
        if(result.data){
            this.boards = result.data;
            console.log('board data: ',this.boards);
        }
        else if(result.error){
            console.log('error 1: ', result.error);
            this.boards = undefined;
        }
        else if(!result.data){
            console.log('no data 1');
        }
    }
    /* -----ADD NEW BOARD----- */
    @track addBoardOpen = false;
    handleAddBoard(event){
        this.showSettings = false;
        this.addBoardOpen = true;
        console.log("Board open? ", this.addBoardOpen);
    }
    handleCloseAddBoard(event){
        this.addBoardOpen = false;
        this.showSettings = true;
        console.log("Board open? ", this.addBoardOpen);
    }
    async handleCreateBoardSuccess(event){
        try{
            this.addBoardOpen = false;
            this.showSettings = true;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Board created successfully',
                    variant: 'success'
                })
            );
            await refreshApex(this.wiredBoardsResult);
        }
        catch(error){
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error adding board',
                    variant: 'error',
                })
            );
        }
    }
    handleCreateBoardSubmit(event){
    }
    /* -----BOARD SETTING MODAL----- */
    @track showSettings = false;
    handleOpenSettings(event){
        this.showSettings = true;
    }
    handleCloseSettings(event){
        this.showSettings = false;
        this.editRecordId = undefined;
        console.log('closed value: ', this.editRecordId);
    }
    @api id;
    async handleDeleteBoard(event){
        const boardId = event.currentTarget.dataset.id;
        console.log('boardId: ', boardId);
        try{
            await deleteRecord(boardId);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Success",
                    message: "Board deleted",
                    variant: "success",
                })
            );
            await refreshApex(this.wiredBoardsResult);
        }catch(error){
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error deleting board',
                    variant: 'error',
                })
            );
        }
    }
    /* -----LOAD RENAME----- */
    @track recordIdToEdit;
    @track openEditor = false;
    handleEditButton(event){
        this.recordIdToEdit = event.currentTarget.dataset.id;
        this.openEditor = true;
        console.log('record to edit: ', this.recordIdToEdit);
    }
    handleCancelRename(event){
        this.openEditor = false;
        this.recordIdToEdit = undefined;
    }
    async handleEditSuccess(event){
        try{
            this.openEditor = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Name changed successfully',
                    variant: 'success'
                })
            );
            await refreshApex(this.wiredBoardsResult);
        }catch(error){
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error renaming board',
                    variant: 'error',
                })
            );
        }
    }
    handleEditSubmit(event){
    }
    /* ---------COLUMNS---------- */
    /* -----LOAD COLUMNS AND RECORDS----- */
    @api columns;
    @track columns;
    //@track ids;
    wiredColumnResult;
    @wire(getColumRecords, {boardId: '$selectedTab'})
    wiredColumns(result){
        this.wiredColumnResult = result;
        if(result.data){
            this.columns = result.data;
            console.log('column data: ', result.data);   
            //this.combineAndSortItems();
        }
        else if(result.error){
            this.columns = undefined;
            console.log('column error: ', result.error);
        }
        else if(!result.data){
            console.log('no column data!');
        }
    }

    // combineAndSortItems() {
    //     let combinedList = [];
    //     this.columns.forEach(column => {
    //         console.log('Processing column:', column);
    //         if(column.Accounts__r){
    //             column.Accounts__r.forEach(acc => {
    //                 console.log(acc);
    //                 combinedList.push({ ...acc, type: 'Account' });
    //                 console.log('fired here 1');
    //             });
    //         }
    //         if(column.Contacts__r){
    //             column.Contacts__r.forEach(contact => {
    //                 console.log(contact);
    //                 combinedList.push({ ...contact, type: 'Contact' });
    //                 console.log('fired here 2');
    //             });
    //         }

    //         if(column.Leads__r){
    //             column.Leads__r.forEach(lead => {
    //                 console.log(lead);
    //                 combinedList.push({ ...lead, type: 'Lead' });
    //                 console.log('fired here 3');
    //             });
    //         }

    //         if(column.Opportunities__r){
    //             column.Opportunities__r.forEach(opportunity => {
    //                 console.log(opportunity);
    //                 combinedList.push({ ...opportunity, type: 'Opportunity' });
    //                 console.log('fired here 4');
    //             });
    //         }
    //     });
    //     console.log('Before sorting: ', combinedList);
    //     combinedList.sort((a, b) => a.Order__c - b.Order__c);
    //     console.log('After sorting: ', combinedList);

    //     this.combinedItems = combinedList;
    //     console.log('combined: ',this.combinedItems);

    // }
    /* -----ADD NEW COLUMN----- */
    @track addColumn = false;
    handleAddColumn(event){
        this.addColumn = true;
        console.log("column open? ", this.addColumn);
    }
    handleCloseAddColumn(event){
        this.addColumn = false;
        console.log("column open? ", this.addColumn);
    }
    async handleAddColumnSuccess(event){
        try{
            this.addColumn = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Column created successfully',
                    variant: 'success'
                })
            );
            await refreshApex(this.wiredColumnResult);
        }catch(error){
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating column',
                    variant: 'error',
                })
            );
        }
    }
    handleAddColumnSubmit(event){
    }
    /* -----DRAG AND DROP----- */
    dragStart(event) {
        event.dataTransfer.dropEffect = 'move';
        event.dataTransfer.setData("text", event.target.dataset.id);
        console.log('drag start')
    }
    allowDrop(event) {
        event.preventDefault();
        return false;
    }
    @track recId;
    @track colId;
    @track selectedId;
    drop(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        var recordId = event.dataTransfer.getData("text");
        this.recId = recordId;
        var columnId = event.target.dataset.id;
        this.colId = columnId;
        console.log('dragged item: ', this.recId);
        console.log('moving on: ', this.colId);

        console.log('fire 1');
        console.log('should be dropped on: ', columnId, ' record id: ', recordId);
    }
    @track objName;
    @wire(getRecord, {recordId: '$recId', layoutTypes: 'Full'})
    getRecData({error, data}){
        if(data){
            console.log('api name: ',data.apiName);
            console.log('rec data: ', data);
            console.log('board Id id: ', data.fields.Board__c.value);
            this.objName = data.apiName;
            this.updateColumn(this.recId, this.colId, this.objName);
            console.log('fire 2');
        }
        else if(!data){
            console.log('no data!');
        }
        else if(error){
            console.log(error);
        }
    }
    updateColumn(recordId, columnId, objName) {
        updateColumn({ recordId: recordId, newColumnId: columnId,  recType: objName})
        .then(result => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Column changed successfully',
                    variant: 'success'
                })
            );
            refreshApex(this.wiredColumnResult);
            this.objName = undefined;
            this.recId = undefined;
            this.colId = undefined;
            console.log('api 2: ', this.objName);
            console.log('rec 2: ', this.recId);
            console.log('col 2: ', this.colId);
        })
        .catch(error => {
            // Handle error
        });
    }
    dragOver(event) {
        return false;
        // By not calling event.preventDefault(), you effectively disallow dropping here
    }

    @wire(getRelatedListRecordsBatch, {
        parentRecordId: 'a010600002V2FQGAA3',
        relatedListParameters: [
            {
              relatedListId: 'Contacts__r',

            },
            {
              relatedListId: 'Opportunities__r',

            },
            {
            relatedListId: 'Accounts__r',

            },
            {
            relatedListId: 'Leads__r',

            }
          ]
    })
    getBatchData({error, data}){
        if(data){
            this.batchData = data;
            console.log('test batch: ', this.batchData);
            console.log('Batch id: ', data.results);
        }
        else if(!data){
            console.log('no test batch data!');
        }
        else if(error){
            console.log(error);
        }
    }
}
