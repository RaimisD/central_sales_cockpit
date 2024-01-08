import { api, LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord, getRecord, updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from "@salesforce/apex";

import getBoardRecords from '@salesforce/apex/boardController.getBoardRecords';
import getColumRecords from  '@salesforce/apex/boardController.getColumRecords';
import updateColumn from '@salesforce/apex/boardController.updateColumn';

import OPPORTUNITYID_FIELD from '@salesforce/schema/Opportunity.Id';
import OPPORTUNITYBOARD_FIELD from '@salesforce/schema/Opportunity.Board__c';
import OPPORTUNITYCOL_FIELD from '@salesforce/schema/Opportunity.Board_column__c';

import ACCOUNTID_FIELD from '@salesforce/schema/Account.Id';
import ACCOUNTBOARD_FIELD from '@salesforce/schema/Account.Board__c';
import ACCOUNTCOL_FIELD from '@salesforce/schema/Account.Board_column__c';

import CONTACTID_FIELD from '@salesforce/schema/Contact.Id';
import CONTACTBOARD_FIELD from '@salesforce/schema/Contact.Board__c';
import CONTACTCOL_FIELD from '@salesforce/schema/Contact.Board_column__c';

import LEADID_FIELD from '@salesforce/schema/Lead.Id';
import LEADBOARD_FIELD from '@salesforce/schema/Lead.Board__c';
import LEADCOL_FIELD from '@salesforce/schema/Lead.Board_column__c';


export default class Csc extends NavigationMixin(LightningElement) {
    connectedCallback() {

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
    }
    @api boards;
    @track boards;
    @track boardList = [];
    wiredBoardsResult;
    /* -----LOAD BOARDS----- */
    @wire(getBoardRecords)
    wiredBoards(result){
        this.wiredBoardsResult = result;
        console.log(this.wiredBoardsResult);
        if(result.data){
            this.boards = result.data;
            this.boardList = result.data.map(board=>({
                ...board
            }))
            //console.log('board data: ',this.boards);
        }
        else if(result.error){
            //console.log('error 1: ', result.error);
            this.boards = undefined;
        }
        else if(!result.data){
            //console.log('no data 1');
        }
    }
    /* -----ADD NEW BOARD----- */
    @track addBoardOpen = false;
    handleAddBoard(event){
        this.showSettings = false;
        this.addBoardOpen = true;
        //console.log("Board open? ", this.addBoardOpen);
    }
    handleCloseAddBoard(event){
        this.addBoardOpen = false;
        this.showSettings = true;
        //console.log("Board open? ", this.addBoardOpen);
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
        refreshApex(this.wiredBoardsResult);
        window.location.reload()
    }
    @api id;
    async handleDeleteBoard(event){
        const boardId = event.currentTarget.dataset.id;
        //console.log('boardId: ', boardId);
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
        //console.log('record to edit: ', this.recordIdToEdit);
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
    getIconName(recordType) {
        const iconMap = {
            'Accounts__r': 'standard:account',
            'Contacts__r': 'standard:contact',
            'Leads__r': 'standard:lead',
            'Opportunities__r': 'standard:opportunity'
        };
        return iconMap[recordType] || 'standard:default';
    }

    combineChildRecords(column) {
        let combined = [];
        const recordTypes = ['Accounts__r', 'Contacts__r', 'Leads__r', 'Opportunities__r'];
        
        recordTypes.forEach(type => {
            if (column[type]) {
                combined = [
                    ...combined,
                    ...column[type].map(record => ({ 
                        ...record, 
                        recordType: type,
                        iconName: this.getIconName(type)
                    }))
                ];
            }
        });
        combined.sort((a, b) => {
            return a.Order__c - b.Order__c;
        });
    
        return combined;
    }

    @api columns;
    @track columns;
    @track ElementList = [];
    wiredColumnResult;
    @wire(getColumRecords, { boardId: '$selectedTab' })
    wiredColumns(result) {
        this.wiredColumnResult = result;
        if (result.data) {
            this.ElementList = result.data.map(column => ({
                ...column,
                childs: this.combineChildRecords(column)
            }));
            this.columns = result.data;
            //console.log('ElementList--------> ', this.ElementList);
            //console.log('column data: ', result.data);
        }
        else if (result.error) {
            this.columns = undefined;
            //console.log('column error: ', result.error);
        }
        else if (!result.data) {
            //console.log('no column data!');
        }
    }

    /* -----LOAD COLUMNS AND RECORDS----- */


    /* -----ADD NEW COLUMN----- */
    @track addColumn = false;
    handleAddColumn(event){
        this.addColumn = true;
        //console.log("column open? ", this.addColumn);
    }
    handleCloseAddColumn(event){
        this.addColumn = false;
        //console.log("column open? ", this.addColumn);
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

      //------------- DRAG AND DROP
    @track recId;
    @track sourceColId;
    @track targetColId;
    @track selectedId;
    dragStart(event) {
        event.target.classList.add("drag");
        event.dataTransfer.setData("text", event.target.dataset.id);
        this.itemId = event.currentTarget.dataset.dropid;
        this.sourceColId = event.currentTarget.dataset.sourceid;
    }
    @track itemId;
    @track dragColStart;
    DragColStart(event) {
        this.dragColStart = parseInt(event.currentTarget.dataset.index, 10);
        event.target.classList.add("drag");
        this.itemId = event.currentTarget.dataset.id;
    }
    DragColOver(event) {
        event.preventDefault();
        return false;
    }
    @track objName;
    @wire(getRecord, {recordId: '$itemId', layoutTypes: 'Full'})
    getItemInfo({error, data}){
        if(data){
            //console.log('Selected item info: ', data.apiName);
            this.objName = data.apiName;
        }
        else if(!data){

        }
        else if(error){

        }
    }
    @track targetColId;
    @track droppedOnObj;
    @wire(getRecord, {recordId: '$targetColId', layoutTypes: 'Full'})
    getTargetInfo({error, data}){
        if(data){
            //console.log('dropped on item: ', data);
            this.droppedOnObj = data.apiName;
        }
        else if(!data){

        }
        else if(error){

        }
    }

    DropCol(event) {
        if(this.objName === 'Board_column__c'){
            event.preventDefault();
            event.stopPropagation();
            const DragColIndex = this.dragColStart;
            const DropColIndex = parseInt(event.currentTarget.dataset.index, 10);
            if (DragColIndex === DropColIndex) {
                return false;
            }
            // Reorder the list
            const elementToMove = this.ElementList.splice(DragColIndex, 1)[0];
            this.ElementList.splice(DropColIndex, 0, elementToMove);
    
            // Force the component to update with the new list
            this.ElementList = [...this.ElementList];
    
            const recordInputs = this.ElementList.map((col, index) => {
                return {
                    fields: {
                        Id: col.Id,
                        col_order__c: index
                    }
                };
            });
            recordInputs.forEach(recordInput => {
                updateRecord(recordInput)
                .then(() => {
                    // Optionally handle successful update
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error updating record',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                });
            });
        }
        if(this.objName === 'Account' || this.objName === 'Opportunity' || this.objName === 'Lead' || this.objName === 'Contact'){
            event.preventDefault();
            //console.log('HERE 1');
            this.recId = this.itemId; //SELECTED ITEM
            //console.log('HERE 2');
            var columnId = event.target.dataset.dropid; //TARGET COL
            //console.log('target: ', columnId);
            if(columnId === undefined){
                return;
            }
            this.targetColId = columnId; //TARGET COL
            this.updateColumn(this.recId, this.targetColId, this.objName);
            const sourceColumnId = this.sourceColId;
            const newIndex = parseInt(event.target.dataset.cardindex, 10);

            //const testIndex = event.target.dataset.cardindex;
            //console.log('dropped on index: ', testIndex);
            console.log('dropped on index: ', newIndex);

            let sourceColumn = this.ElementList.find(col => col.childs.some(child => child.Id === this.recId));
            let targetColumn = this.ElementList.find(col => col.Id === this.targetColId);
            
            if (sourceColumnId === this.targetColId && sourceColumn.childs.findIndex(child => child.Id === this.recId) === newIndex) {
                return;
            }
            let [movedRecord] = sourceColumn.childs.splice(sourceColumn.childs.findIndex(child => child.Id === this.recId), 1);
            targetColumn.childs.splice(newIndex, 0, movedRecord);
            let updates = [];

            if (sourceColumnId !== this.targetColId) {
                sourceColumn.childs.forEach((child, index) => {
                    updates.push(this.createUpdateRecordInput(child.Id, index, child.recordType));
                });
            }

            targetColumn.childs.forEach((child, index) => {
                updates.push(this.createUpdateRecordInput(child.Id, index, child.recordType));
            });
            this.updateRecords(updates);
        }
    }

    createUpdateRecordInput(recordId, newOrder, objectName) {
        // Map the object name to the API field name for Board_column__c
        const boardColumnFieldMap = {
            'Account': 'Accounts__r',
            'Opportunity': 'Opportunities__r',
            'Lead': 'Leads__r',
            'Contact': 'Contacts__r'
        };
        const fieldApiName = boardColumnFieldMap[objectName] || 'Board_column__c';
    
        return {
            fields: {
                Id: recordId,
                Order__c: newOrder,
                [fieldApiName]: this.colId
            }
        };
    }
    updateRecords(recInputs) {
        // Handle the updates (for simplicity, using Promise.all here, but you may want to handle them individually)
        const updatePromises = recInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(updatePromises)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'changed',
                    variant: 'success'
                })
            );
            
            this.recId = undefined;
            this.targetColId = undefined;
            refreshApex(this.wiredColumnResult);
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'error',
                    variant: 'error'
                })
            );
        });
    }

    updateColumn(recordId, columnId, objName) {
        updateColumn({ recordId: recordId, newColumnId: columnId,  recType: objName})
        .then(result => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'changed',
                    variant: 'success'
                })
            );
            
            //this.recId = undefined;
            //this.targetColId = undefined;
            //refreshApex(this.wiredColumnResult);
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'error',
                    variant: 'error'
                })
            );
        });
    }
    async handleDeleteColumn(event){
        const colId = event.currentTarget.dataset.colid;
        try{
            await deleteRecord(colId);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "column deleted!",
                    variant: "success",
                })
            );
            await refreshApex(this.wiredColumnResult);
        }catch(error){
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error deleting column',
                    variant: 'error',
                })
            );
        }
    }
    @track editColumn = false;
    @track colToEditName;

    handleEditColumn(event){
        this.editColumn = true;
        this.colToEditName = event.currentTarget.dataset.colid;
    }
    handleCancelColRename(event){
        this.editColumn = false;
        this.colToEditName = undefined;
    }
    async handleEditColSuccess(event){
        try{
        this.editColumn = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Name changed',
                    variant: 'success'
                })
            );
            this.colToEditName = undefined;
            await refreshApex(this.wiredColumnResult);
        }catch(error){
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'ERROR WHILE CHANGING NAME',
                    variant: 'error',
                })
            );
            this.colToEditName = undefined;
        }
        
    }
    @track currentType;
    handleEditColSubmit(event){}
    removeCard(event){
        const cardId = event.target.dataset.id;
        const fields = {};
        this.currentType = event.currentTarget.dataset.type;
        if(this.currentType === 'Accounts__r'){
            fields[ACCOUNTID_FIELD.fieldApiName] = cardId;
            fields[ACCOUNTBOARD_FIELD.fieldApiName] = null;
            fields[ACCOUNTCOL_FIELD.fieldApiName] = null;
        }
        if(this.currentType === 'Contacts__r'){
            fields[CONTACTID_FIELD.fieldApiName] = cardId;
            fields[CONTACTBOARD_FIELD.fieldApiName] = null;
            fields[CONTACTCOL_FIELD.fieldApiName] = null;
        }
        if(this.currentType === 'Leads__r'){
            fields[LEADID_FIELD.fieldApiName] = cardId;
            fields[LEADBOARD_FIELD.fieldApiName] = null;
            fields[LEADCOL_FIELD.fieldApiName] = null;
        }
        if(this.currentType === 'Opportunities__r'){
            fields[OPPORTUNITYID_FIELD.fieldApiName] = cardId;
            fields[OPPORTUNITYBOARD_FIELD.fieldApiName] = null;
            fields[OPPORTUNITYCOL_FIELD.fieldApiName] = null;
        }
        const recordInput = { fields };
        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'card removed',
                    variant: 'success'
                })
            );
            refreshApex(this.wiredColumnResult);
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'ERROR WHILE REMOVING',
                    variant: 'error'
                })
            );
        });
    }
    // board drag and drop
    @track dragBoardStart;
    boardDragStart(event){
        this.dragBoardStart = parseInt(event.currentTarget.dataset.index, 10);
        event.target.classList.add("drag");
    }
    dropBoard(event){
        event.preventDefault();
        event.stopPropagation();
        const DragBoardIndex = this.dragBoardStart;
        const DropBoardIndex = parseInt(event.currentTarget.dataset.index, 10);
        if(DragBoardIndex === DropBoardIndex){
            return false;
        }
        const boardToMove = this.boardList.splice(DragBoardIndex, 1)[0];
        this.boardList.splice(DropBoardIndex, 0, boardToMove);

        this.boardList = [...this.boardList]

        const boardInputs = this.boardList.map((board, index)=>{
            return{
                fields:{
                    Id: board.Id,
                    board_order__c: index
                }
            };
        });
        boardInputs.forEach(boardInput => {
            updateRecord(boardInput)
            .then(()=>{

            })
            .catch(error=>{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error updating record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
        });
        //await refreshApex(this.wiredBoardsResult);

    }
    dragBoardOver(event){
        event.preventDefault();
        return false;
    }
}