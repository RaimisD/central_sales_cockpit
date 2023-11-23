import { api, LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'

import getBoardRecords from '@salesforce/apex/boardController.getBoardRecords';
import getColumRecords from '@salesforce/apex/boardController.getColumRecords';
export default class Csc extends NavigationMixin(LightningElement) {
    connectedCallback() {

    }

    navigateToRecord(event) {
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
}