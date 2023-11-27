import { api, LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';

import getBoardRecords from '@salesforce/apex/boardController.getBoardRecords';
import getColumRecords from '@salesforce/apex/boardController.getColumRecords';
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

    @track selectedTab;
    handleTabSelect(event){ //checks which column is selected to pass value
        this.selectedTab = event.target.value;
        this.loadColumnRecords();
        console.log('selected tab: ', event.target.value);
    }
    @api boards;
    @track boards;
    @wire(getBoardRecords) //loads boards
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
    @api columns;
    @track columns;
    loadColumnRecords() { //loads columns and records
        getColumRecords({ boardId: this.selectedTab })
            .then(result => {
                this.columns = result;
                console.log('column data: ', result);
            })
            .catch(error => {
                console.error(error);
            });
    }

    //add new board
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
    handleCreateBoardSuccess(event){
        this.addBoardOpen = false;
        this.showSettings = false;
        const toastEvent = new ShowToastEvent({
            title: 'Success',
            message: 'Board created successfully',
            variant: 'success'
        });
        this.dispatchEvent(toastEvent);
    }
    handleCreateBoardSubmit(event){
        
    }

    //add new column
    @track addColumn = false;
    handleAddColumn(event){
        this.addColumn = true;
        console.log("column open? ", this.addColumn);
    }
    handleCloseAddColumn(event){
        this.addColumn = false;
        console.log("column open? ", this.addColumn);
    }
    handleAddColumnSuccess(event){
        this.addColumn = false;
        const toastEvent = new ShowToastEvent({
            title: 'Success',
            message: 'Column added successfully',
            variant: 'success'
        });
        this.dispatchEvent(toastEvent);
    }
    handleAddColumnSubmit(event){

    }

    //board settings
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
    handleDeleteBoard(event){
        const boardId = event.currentTarget.dataset.id;
        console.log('boardId: ', boardId);
        deleteRecord(boardId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Success",
                        message: "Board deleted",
                        variant: "success",
                    })
                );
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting board',
                        variant: 'error',
                    })
                );
            });
    }
    @track editRecordId;
    handleEdit(event){
        const editRecordId = event.currentTarget.dataset.id;
        console.log('record to edit: ', editRecordId);
    }

}