import { Component, Injectable, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { BehaviorSubject, Observable } from "rxjs/Rx";
import { IgxColumnComponent } from "../../lib/grid/column.component";
import { IgxGridComponent } from "../../lib/grid/grid.component";
import {
    DataContainer,
    IDataState,
    IgxSnackbarComponent,
    IgxToastComponent,
    IPagingState,
    PagingError,
    SortingDirection,
    StableSortingStrategy
} from "../../lib/main";

@Injectable()
export class LocalService {
    public records: Observable<any[]>;
    private url: string = "http://services.odata.org/V4/Northwind/Northwind.svc/";
    private _records: BehaviorSubject<any[]>;
    private dataStore: any[];

    constructor(private http: Http) {
        this.dataStore = [];
        this._records = new BehaviorSubject([]);
        this.records = this._records.asObservable();
    }

    public getData() {
        return this.http.get(this.url)
            .map((response) => response.json())
            .subscribe((data) => {
                this.dataStore = data.value;
                this._records.next(this.dataStore);
            });
    }

}

@Injectable()
export class RemoteService {
    public remoteData: Observable<any[]>;
    private url: string = "http://services.odata.org/V4/Northwind/Northwind.svc/Products";
    private _remoteData: BehaviorSubject<any[]>;

    constructor(private http: Http) {
        this._remoteData = new BehaviorSubject([]);
        this.remoteData = this._remoteData.asObservable();
    }

    public getData(data?: Array<any>, cb?: () => void): any {
        return this.http
            .get(this.buildUrl(null))
            .map((response) => response.json())
            .map((response) => {
                if (data) {
                    // const p: IPagingState = data.paging;
                    //  if (p) {
                    //      const countRecs: number = response["@odata.count"];
                    //      p.metadata = {
                    //          countPages: Math.ceil(countRecs / p.recordsPerPage),
                    //         countRecords: countRecs,
                    //         error: PagingError.None
                    //      };
                    //  }
                }
                if (cb) {
                    cb();
                }
                return response;
            })
            .subscribe((data) => {
                this._remoteData.next(data.value);
            });
    }

    private buildUrl(dataState: IDataState): string {
        let qS = "";
        if (dataState && dataState.paging) {
            const skip = dataState.paging.index * dataState.paging.recordsPerPage;
            const top = dataState.paging.recordsPerPage;
            qS += `$skip=${skip}&$top=${top}&$count=true`;
        }
        if (dataState && dataState.sorting) {
            const s = dataState.sorting;
            if (s && s.expressions && s.expressions.length) {
                qS += (qS ? "&" : "") + "$orderby=";
                s.expressions.forEach((e, ind) => {
                    qS += ind ? "," : "";
                    qS += `${e.fieldName} ${e.dir === SortingDirection.Asc ? "asc" : "desc"}`;
                });
            }
        }
        qS = qS ? `?${qS}` : "";
        return `${this.url}${qS}`;
    }
}

@Component({
    providers: [LocalService, RemoteService],
    selector: "grid-sample",
    styleUrls: ["../app.samples.css", "sample.component.css"],
    templateUrl: "sample.component.html"
})
export class GridSampleComponent {
    @ViewChild("grid1") public grid1: IgxGridComponent;
    @ViewChild("grid2") public grid2: IgxGridComponent;
    @ViewChild("grid3") public grid3: IgxGridComponent;
    @ViewChild("toast") public toast: IgxToastComponent;
    @ViewChild("snax") public snax: IgxSnackbarComponent;
    public data: Observable<any[]>;
    public remote: Observable<any[]>;
    public localData: any[];
    public selectedCell;
    public selectedRow;
    public newRecord = "";
    public editCell;
    constructor(private localService: LocalService,
    private remoteService: RemoteService) { }
    public ngOnInit(): void {
        this.data = this.localService.records;
        this.remote = this.remoteService.remoteData;

        this.localService.getData();

        this.localData = [
            { ID: 1, Name: "A" },
            { ID: 2, Name: "B" },
            { ID: 3, Name: "C" },
            { ID: 4, Name: "D" },
            { ID: 5, Name: "E" }
        ];

        this.grid2.sortingExpressions = [];

        this.grid3.sortingExpressions = [
            { fieldName: "ProductID", dir: SortingDirection.Desc }
        ];
        this.grid3.paging = true;
        //      index: 2,
        //     recordsPerPage: 10

    }

    public ngAfterViewInit() {
        this.remoteService.getData(this.grid3.data);
    }

    /*public onProcess(event: IgxGridBindingBehavior): void {
        event.process = (dataContainer: DataContainer) => {
            if (dataContainer.data.length) {
                dataContainer.transformedData = dataContainer.data;
            }
        };
    }*/

    public onInlineEdit(event) {
        this.editCell = event.cell;
    }

    public showInput(index, field) {
        return this.editCell && this.editCell.columnField === field && this.editCell.rowIndex === index;
    }
    public process(event) {
        this.toast.message = "Loading remote data";
        this.toast.position = 1;
        this.toast.show();
        this.remoteService.getData(this.grid3.data, () => {
            this.toast.hide();
        });
    }

    public initColumns(event: IgxColumnComponent) {
        const column: IgxColumnComponent = event;
        if (column.field === "Name") {
            column.filterable = true;
            column.sortable = true;
            column.editable = true;
        }
    }

    public onPagination(event) {
        if (!this.grid2.paging) {
            return;
        }
        const total = this.grid2.data.length;
        const state = this.grid2.pagingState;
        if ((state.recordsPerPage * event) >= total) {
            return;
        }
        this.grid2.paginate(event);
    }

    public onPerPage(event) {
        if (!this.grid2.paging) {
            return;
        }
        const total = this.grid2.data.length;
        const state = this.grid2.pagingState;
        if ((state.index * event) >= total) {
            return;
        }
        this.grid2.perPage = event;
        state.paging.recordsPerPage = event;
        // this.grid2.dataContainer.process();
    }

    public selectCell(event) {
        this.selectedCell = event;
    }

    public addRow() {
        if (!this.newRecord.trim()) {
            this.newRecord = "";
            return;
        }
        const record = { ID: this.grid1.data[this.grid1.data.length - 1].ID + 1, Name: this.newRecord };
        this.grid1.addRow(record);
        this.newRecord = "";
    }

    public updateRecord(event) {
        this.grid1.updateCell(this.selectedCell.rowIndex, this.selectedCell.columnField, event);
        //this.grid1.getCell(this.selectedCell.rowIndex, this.selectedCell.columnField);
    }

    public deleteRow(event) {
        this.selectedRow = Object.assign({}, this.selectedCell.Row);
        this.grid1.deleteRow(this.selectedCell.rowIndex);
        this.selectedCell = {};
        this.snax.message = `Row with ID ${this.selectedRow.record.ID} was deleted`;
        this.snax.show();
    }

    public restore() {
        this.grid1.addRow(this.selectedRow.record);
        this.snax.hide();
    }
}