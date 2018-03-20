# igx-grid
**igx-grid** component provides the capability to manipulate and represent tabular data.  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid.html)

## Usage
```html
<igx-grid #grid1 [data]="localData" [autoGenerate]="true"
    (onColumnInit)="initColumns($event)" (onCellSelection)="selectCell($event)">
</igx-grid>
```

## Getting Started

### Dependencies
In order to be able to use most of the grid's features some additions should be kept in mind, for example:

Import *IgxGridBindingBehavior*, *IgxGridColumnInitEvent*, *DataContainer* (responsible for CRUD operations, data records access, data processing etb.), *IDataSate* (filtering, sorting, paging features), *sorting* and *filtering* strategies etc.

```typescript
import { IgxGridBindingBehavior, IgxGridColumnInitEvent, IgxGridComponent } from "../../../src/grid/grid.component";
import {
    DataContainer,
    IDataState,
    IgxSnackbar,
    IgxToast,
    IPagingState,
    PagingError,
    SortingDirection,
    StableSortingStrategy
} from "../../../src/main";
```

### Basic configuration

Define the grid
```html
<igx-grid #grid1 [data]="localData" [autoGenerate]="true"
    (onColumnInit)="initColumns($event)" (onCellSelection)="selectCell($event)">
</igx-grid>
```

When all needed dependencies are included, next step would be to configure local or remote service that will return grids data. For example:

```typescript
@Injectable()
export class LocalService {
    public records: Observable<any[]>;
    private url: string = "http://services.odata.org/V4/Northwind/Northwind.svc/Alphabetical_list_of_products";
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
```

Create the Grid component that will be used in the application. This will include:
- define data fetching on ngOnInit() and implement some sorting or paging for example.

```typescript
public ngOnInit(): void {
    this.data = this.localService.records;
    this.remote = this.remoteService.remoteData;

    this.localService.getData();

    this.localData = [
        {ID: 1, Name: "A"},
        {ID: 2, Name: "B"},
    ];
...
    this.grid3.state = {
    paging: {
        index: 2,
        recordsPerPage: 10
    },
    sorting: {
        expressions: [
        {fieldName: "ProductID", dir: SortingDirection.Desc}
        ]
    }
    };
}
...
public ngAfterViewInit() {
    this.remoteService.getData(this.grid3.dataContainer.state);
}

```

- enable some features for certaing columns

```typescript
public initColumns(event: IgxGridColumnInitEvent) {
    const column: IgxColumnComponent = event.column;
    if (column.field === "Name") {
    column.filtering = true;
    column.sortable = true;
    column.editable = true;
    }
}
```

- Аdd event handlers for CRUD operations

```typescript
public addRow() {
    if (!this.newRecord.trim()) {
    this.newRecord = "";
    return;
    }
    const record = {ID: this.grid1.data[this.grid1.data.length - 1].ID + 1, Name: this.newRecord};
    this.grid1.addRow(record);
    this.newRecord = "";
}

public updateRecord(event) {
    this.grid1.updateCell(this.selectedCell.rowIndex, this.selectedCell.columnField, event);
    this.grid1.getCell(this.selectedCell.rowIndex, this.selectedCell.columnField);
}

public deleteRow(event) {
    this.selectedRow = Object.assign({}, this.grid1.getRow(this.selectedCell.rowIndex));
    this.grid1.deleteRow(this.selectedCell.rowIndex);
    this.selectedCell = {};
    this.snax.message = `Row with ID ${this.selectedRow.record.ID} was deleted`;
    this.snax.show();
}
```

<div class="divider--half"></div>

## API

### Inputs

Below is the list of all inputs that the developers may set to configure the grid look/behavior:
|Name|Type|Description|
|--- |--- |--- |
|`id`|string|Unique identifier of the Grid. If not provided it will be automatically generated.|
|`data`|Array|The data source for the grid.|
|`autoGenerate`|boolean|Autogenerate grid's columns, default value is _false_|
|`paging`|bool|Enables the paging feature. Defaults to _false_.|
|`perPage`|number|Visible items per page, default is 15|
|`filteringLogic`|FilteringLogic|The filtering logic of the grid. Defaults to _AND_.|
|`filteringExpressions`|Array|The filtering state of the grid.|
|`sortingExpressions`|Array|The sorting state of the grid.|
|`height`|string|The height of the grid element. You can pass values such as `1000px`, `75%`, etc.|
|`width`|string|The width of the grid element. You can pass values such as `1000px`, `75%`, etc.|
|`evenRowCSS`|string|Additional styling classes applied to all even rows in the grid.|
|`oddRowCSS`|string|Additional styling classses applied to all odd rows in the grid.|
|`paginationTemplate`|TemplateRef|You can provide a custom `ng-template` for the pagination part of the grid.|

### Outputs

A list of the events emitted by the **igx-grid**:

|Name|Description|
|--- |--- |
|_Event emitters_|_Notify for a change_|
|`onEditDone`|Emitted when a cell value changes. Returns `{ currentValue: any, newValue: any }`|
|`onSelection`|Emitted when a cell is selected. Returns the cell object.|
|`onColumnInit`|Emitted when the grid columns are initialized. Returns the column object.|
|`onSortingDone`|Emitted when sorting is performed through the UI. Returns the sorting expression.|
|`onFilteringDone`|Emitted when filtering is performed through the UI. Returns the filtering expression.|
|`onPagingDone`|Emitted when paging is performed. Returns an object consisting of the previous and the new page.|
|`onRowAdded`|Emitted when a row is being added to the grid through the API. Returns the data for the new row object.|
|`onRowDeleted`|Emitted when a row is deleted through the grid API. Returns the row object being removed.|


### Methods

Here is a list of all public methods exposed by the **igx-grid**:

|Signature|Description|
|--- |--- |
|`getColumnByName(name: string)`|Returns the column object with field property equal to `name` or `undefined` if no such column exists.|
|`getCellByColumn(rowIndex: number, columnField: string)`|Returns the cell object in column with `columnField` and row with `rowIndex` or `undefined`.|
|`addRow(data: any)`|Creates a new row object and adds the `data` record to the end of the data source.|
|`deleteRow(rowIndex: number)`|Removes the row object and the corresponding data record from the data source.|
|`updateRow(value: any, rowIndex: number)`|Updates the row object and the data source record with the passed value.|
|`updateCell(value: any, rowIndex: number, column: string)`|Updates the cell object and the record field in the data source.|
|`filter(column: string, value: any, condition?, ignoreCase?: boolean)`|Filters a single column. Check the available [filtering conditions](#filtering-conditions)|
|`filter(expressions: Array)`|Filters the grid columns based on the provided array of filtering expressions.|
|`filterGlobal(value: any, condition? ignoreCase?)`|Filters all the columns in the grid.|
|`clearFilter(name?: string)`|If `name` is provided, clears the filtering state of the corresponding column, otherwise clears the filtering state of all columns.|
|`sort(name: string, direction, ignorecase)`|Sorts a single column.|
|`sort(expressions: Array)`|Sorts the grid columns based on the provided array of sorting expressions.|
|`clearSort(name?: string)`|If `name` is provided, clears the sorting state of the corresponding column, otherwise clears the sorting state of all columns.|
|`previousPage()`|Goes to the previous page if paging is enabled and the current page is not the first.|
|`nextPage()`|Goes to the next page if paging is enabled and current page is not the last.|
|`paginate(page: number)`|Goes to the specified page if paging is enabled. Page indices are 0 based.|
|`markForCheck()`|Manually triggers a change detection cycle for the grid and its children.|

<div class="divider--half"></div>

# IgxColumnComponent

Column component is used to define grid's *columns* collection. Cell, header and footer templates are available.

## Example
```html
<igx-grid #grid2 [data]="data | async" [paging]="true" [perPage]="10"
    (onCellSelection)="onInlineEdit($event)">
    <igx-column [sortable]="true" [field]="'ProductID'" [header]="'ID'"></igx-column>
    <igx-column [sortable]="true" [filterable]="true" [field]="'ProductName'"></igx-column>
    <igx-column [sortable]="true" [field]="'UnitsInStock'" [header]="'In Stock'">
        <ng-template igxCell let-col="column" let-ri="rowIndex" let-item="item">
            <span *ngIf="!showInput(ri, col.field)">{{ item }}</span>
            <input *ngIf="showInput(ri, col.field)" igxInput [value]="item">
        </ng-template>
    </igx-column>
```


## API

### Inputs

Inputs available on the **IgxGridColumnComponent** to define columns:
|Name|Type|Description|
|--- |--- |--- |
|`field`|string|Column field name|
|`header`|string|Column header text|
|`sortable`|boolean|Set column to be sorted or not|
|`editable`|boolean|Set column values to be editable|
|`filterable`|boolean|Set column values to be filterable|
|`hasSummary`| boolean  |Set the specific column to have a summaries or not|
|`summaries`| IgxSummaryOperand |Set custom summary for the specific column|
|`hidden`|boolean|Visibility of the column|
|`movable`|boolean|Column moving|
|`width`|string|Columns width|
|`headerClasses`|string|Additional CSS classes applied to the header element.|
|`cellClasses`|string|Additional CSS classes applied to the cells in this column.|
|`formatter`|Function|A function used to "template" the values of the cells without the need to pass a cell template the column.|
|`index`|string|Column index|
|`filteringCondition`|FilteringCondition|Boolean, date, string or number conditions. Default is string _contains_|
|`filteringIgnoreCase`|boolean|Ignore capitalization of strings when filtering is applied. Defaults to _true_.|
|`sortingIgnoreCase`|boolean|Ignore capitalization of strings when sorting is applied. Defaults to _true_.|
|`dataType`|DataType|One of string, number, boolean or Date. When filtering is enabled the filter UI conditions are based on the `dataType` of the column. Defaults to `string` if it is not provided. With `autoGenerate` enabled the grid will try to resolve the correct data type for each column based on the data source.|

### Getters/Setters

|Name|Type|Getter|Setter|Description|
|--- |--- |--- |--- |--- |
|`bodyTemplate`|TemplateRef|Yes|Yes|Get/Set a reference to a template which will be applied to the cells in the column.|
|`headerTemplate`|TemplateRef|Yes|Yes|Get/Set a reference to a template which will be applied to the column header.|
|`footerTemplate`|TemplateRef|Yes|Yes|Get/Set a reference to a template which will be applied to the column footer.|
|`inlineEditorTemplate`|TemplateRef|Yes|Yes|Get/Set a reference to a template which will be applied as a cell enters edit mode.|

<div class="divider--half"></div>

## IgxGridCellComponent

### Getters/Setters

|Name|Type|Getter|Setter|Description|
|--- |--- |--- |--- |--- |
|`column`|IgxColumnComponent|Yes|No|The column to which the cell belongs.|
|`row`|IgxGridRowComponent|Yes|No|The row to which the cell belongs.|
|`value`|any|Yes|No|The value in the cell.|
|`rowIndex`|number|Yes|No|The index of the row this cell belongs to.|
|`columnIndex`|number|Yes|No|The index of the column this cell belongs to.|
|`grid`|IgxGridComponent|Yes|No|The grid component itself.|
|`inEditMode`|boolean|Yes|Yes|Gets/Sets the cell in edit mode.|
|`nativeElement`|HTMLElement|Yes|No|The native DOM element representing the cell. Could be `null` in certain environments.|

### Methods

|Name|Return Type|Description|
|--- |--- |--- |
|`update(val: any)`|void|Emits the `onEditDone` event and updates the appropriate record in the data source.|
