import { api, LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord, getRecord, updateRecord, getRecords } from 'lightning/uiRecordApi';
import { refreshApex } from "@salesforce/apex";
import { getRelatedListRecordsBatch, getRelatedListInfo, getRelatedListInfoBatch,  getRelatedListRecords} from 'lightning/uiRelatedListApi';

import getBoardRecords from '@salesforce/apex/boardController.getBoardRecords';
import getColumRecords from  '@salesforce/apex/boardController.getColumRecords';
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
    @track ElementList = [];
    //@track ids;
    wiredColumnResult;
    @wire(getColumRecords, {boardId: '$selectedTab'})
    wiredColumns(result){
        this.wiredColumnResult = result;
        
        if(result.data){
            this.ElementList = [];
            this.columns = result.data;
            for(let i=0; i<this.columns.length;i++){
                this.ElementList.push(this.columns[i]);
                //console.log('pushed this column: ',this.columns[i]);
            }
            console.log('ElementList--------> ', this.ElementList);
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
    // dragStart(event) {
    //     event.dataTransfer.dropEffect = 'move';
    //     event.dataTransfer.setData("text", event.target.dataset.id);
    //     console.log('drag start')
    // }
    // allowDrop(event) {
    //     event.preventDefault();
    //     return false;
    // }
    // @track recId;
    // @track colId;
    // @track selectedId;
    // drop(event) {
    //     event.preventDefault();
    //     event.dataTransfer.dropEffect = 'move';
    //     var recordId = event.dataTransfer.getData("text");
    //     this.recId = recordId;
    //     var columnId = event.target.dataset.id;
    //     this.colId = columnId;
    //     console.log('dragged item: ', this.recId);
    //     console.log('moving on: ', this.colId);

    //     console.log('fire 1');
    //     console.log('should be dropped on: ', columnId, ' record id: ', recordId);
    // }
    // dropOnCard(event) {
    //     event.stopPropagation(); // Stop the event from propagating to the column
    //     // Optionally, you can provide feedback to the user here
    //     console.log('Dropping on cards is not allowed.');
    // }
    // @track objName;
    // @wire(getRecord, {recordId: '$recId', layoutTypes: 'Full'})
    // getRecData({error, data}){
    //     if(data){
    //         console.log('api name: ',data.apiName);
    //         console.log('rec data: ', data);
    //         console.log('board Id id: ', data.fields.Board__c.value);
    //         this.objName = data.apiName;
    //         this.updateColumn(this.recId, this.colId, this.objName);
    //         console.log('fire 2');
    //     }
    //     else if(!data){
    //         console.log('no data!');
    //     }
    //     else if(error){
    //         console.log(error);
    //     }
    // }
    // updateColumn(recordId, columnId, objName) {
    //     updateColumn({ recordId: recordId, newColumnId: columnId,  recType: objName})
    //     .then(result => {
    //         this.dispatchEvent(
    //             new ShowToastEvent({
    //                 title: 'Success',
    //                 message: 'Column changed successfully',
    //                 variant: 'success'
    //             })
    //         );
    //         refreshApex(this.wiredColumnResult);
    //         this.objName = undefined;
    //         this.recId = undefined;
    //         this.colId = undefined;
    //         console.log('api 2: ', this.objName);
    //         console.log('rec 2: ', this.recId);
    //         console.log('col 2: ', this.colId);
    //     })
    //     .catch(error => {
    //         // Handle error
    //     });
    // }
    // dragOver(event) {
    //     console.log('should drop here');
    // }
    // dragOver2(event){
    //     console.log('should not drop here')
    // }


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
      // column drag and drop
      @track dragColStart;
      DragColStart(event) {
          this.dragColStart = parseInt(event.currentTarget.dataset.index, 10);
          event.target.classList.add("drag");
          this.itemId = event.currentTarget.dataset.id;
          console.log('selected item: ', this.itemId);
        }
      
        DragColOver(event) {
          event.preventDefault();
          return false;
        }
        DropCol(event) {
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
}
