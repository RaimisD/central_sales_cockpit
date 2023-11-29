import { api, LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from "@salesforce/apex";

import getBoardRecords from '@salesforce/apex/boardController.getBoardRecords';
import getColumRecords from '@salesforce/apex/boardController.getColumRecords';
import updateAccountColumn from '@salesforce/apex/boardController.updateAccountColumn';
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
    wiredColumnResult;
    @wire(getColumRecords, {boardId: '$selectedTab'})
    wiredColumns(result){
        this.wiredColumnResult = result;
        if(result.data){
            this.columns = result.data;
            console.log('column data: ', result.data);
        }
        else if(result.error){
            this.columns = undefined;
            console.log('column error: ', result.error);
        }
        else if(!result.data){
            console.log('no column data!');
        }
    }
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
        event.dataTransfer.setData("text", event.target.dataset.id);
    }
    allowDrop(event) {
        event.preventDefault();
    }
    drop(event) {
        event.preventDefault();
        var recordId = event.dataTransfer.getData("text");
        var columnId = event.target.dataset.id;
        this.updateAccountColumn(recordId, columnId);
    }
    updateAccountColumn(recordId, columnId) {
        updateAccountColumn({ recordId: recordId, newColumnId: columnId })
        .then(result => {
            // Handle success - e.g., refresh the list
        })
        .catch(error => {
            // Handle error
        });
    }
}
