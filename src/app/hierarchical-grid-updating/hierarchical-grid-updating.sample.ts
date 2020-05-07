import { Component, ViewChild, AfterViewInit } from '@angular/core';
import {
    IgxRowIslandComponent,
    IgxHierarchicalGridComponent,
    IGridCreatedEventArgs,
    IgxHierarchicalTransactionServiceFactory,
    GridSelectionMode
} from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';

@Component({
    selector: 'app-hierarchical-grid-updating-sample',
    templateUrl: 'hierarchical-grid-updating.sample.html',
    providers: [ RemoteService, IgxHierarchicalTransactionServiceFactory ]
})
export class HierarchicalGridUpdatingSampleComponent implements AfterViewInit {

    public lastChildGrid: IgxHierarchicalGridComponent;
    public lastIdx = 1000;
    public selectionMode;
    public remoteData = [];
    public primaryKeys = [
        { name: 'CustomerID', type: 'string', level: 0 },
        { name: 'OrderID', type: 'number', level: 1 },
        { name: 'EmployeeID', type: 'number', level: 2 },
        { name: 'ProductID', type: 'number', level: 2 }
    ];

    @ViewChild('rowIsland1', { static: true })
    rowIsland1: IgxRowIslandComponent;

    @ViewChild('rowIsland2', { static: true })
    rowIsland2: IgxRowIslandComponent;

    @ViewChild('hGrid', { static: true })
    hGrid: IgxHierarchicalGridComponent;

    constructor(private remoteService: RemoteService) {
        remoteService.url = 'https://services.odata.org/V4/Northwind/Northwind.svc/';

        this.remoteService.urlBuilder = (dataState) => this.buildUrl(dataState);
        this.selectionMode = GridSelectionMode.none;
    }

    public buildUrl(dataState) {
        let qS = '';
        if (dataState) {
            qS += `${dataState.key}?`;

            const level = dataState.level;
            if (level > 0) {
                const parentKey = this.primaryKeys.find((key) => key.level === level - 1);
                const parentID = typeof dataState.parentID !== 'object' ? dataState.parentID : dataState.parentID[parentKey.name];

                if (parentKey.type === 'string') {
                    qS += `$filter=${parentKey.name} eq '${parentID}'`;
                } else {
                    qS += `$filter=${parentKey.name} eq ${parentID}`;
                }
            }
        }
        return `${this.remoteService.url}${qS}`;
    }

    public ngAfterViewInit() {
        this.remoteService.getData({ parentID: null, level: 0, key: 'Customers' }, (data) => {
            this.remoteData = data['value'];
        });
    }

    gridCreated(event: IGridCreatedEventArgs, rowIsland: IgxRowIslandComponent) {
        this.remoteService.getData({ parentID: event.parentID, level: rowIsland.level, key: rowIsland.key }, (data) => {
            if (rowIsland.key === 'Orders') {
                let index = 0;
                data['value'].forEach(item => {
                    item.OrderDate = new Date(item.OrderDate);
                    item.MyID = index;
                    index++;
                });
            }
            event.grid.data = data['value'];
            event.grid.cdr.detectChanges();
        });
        this.lastChildGrid = event.grid;
    }

    addRow() {
        this.hGrid.addRow({
            'CustomerID': this.lastIdx,
            'CompanyName': 'Some Company ' + this.lastIdx,
            'ContactName': 'Some Contact ' + this.lastIdx,
            'ContactTitle': 'Some Title ' + this.lastIdx++,
            'Country': 'Germany',
            'Phone': '000-0000'
        });
    }

    deleteRow() {
        const grid = this.rowIsland1.hgridAPI.getChildGrids()[0];
        grid.deleteRow(grid.data[0]['OrderID']);
    }

    logTransactionsMain() {
        console.log(this.hGrid.transactions.getTransactionLog());
    }

    logTransactionsIsland1() {
        console.log(this.rowIsland1.transactions.getTransactionLog());
    }

    commitTransactionsIsland1() {
        this.rowIsland1.rowIslandAPI.getChildGrids().forEach((grid: IgxHierarchicalGridComponent) => {
            grid.transactions.commit(grid.data);
        });
    }

}
