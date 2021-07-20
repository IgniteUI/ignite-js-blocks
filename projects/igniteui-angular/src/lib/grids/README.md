# igx-grid
**igx-grid** component provides the capability to manipulate and represent tabular data.
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/grid)

## Usage
```html
<igx-grid #grid1 [data]="localData" [autoGenerate]="true"
    (columnInit)="initColumns($event)" (onCellSelection)="selectCell($event)">
</igx-grid>
```

## Getting Started

### Dependencies
The grid is exported as as an `NgModule`, thus all you need to do in your application is to import the _IgxGridModule_ inside your `AppModule`

```typescript
// app.module.ts

import { IgxGridModule } from 'igniteui-angular/main';
// Or
import { IgxGridModule } from 'igniteui-angular/grid';

@NgModule({
    imports: [
        ...
        IgxGridModule,
        ...
    ]
})
export class AppModule {}
```

Each of the components, directives and helper classes in the _IgxGridModule_ can be imported either through the _grid_ sub-package or through the main bundle in _igniteui-angular_. While you don't need to import all of them to instantiate and use the grid, you usually will import them (or your editor will auto-import them for you) when declaring types that are part of the grid API.

```typescript
import { IgxGridComponent } from 'igniteui-angular/grid/';
// Or
import { IgxGridComponent } from 'igniteui-angular/main'
...

@ViewChild('myGrid', { read: IgxGridComponent })
public grid: IgxGridComponent;
```

### Basic configuration

Define the grid
```html
<igx-grid #grid1 [data]="data | async" [height]="'500px'" width="100%" [autoGenerate]='false'>
    <igx-column [field]="'ProductID'" [width]="'120px'" [filterable]='true' ></igx-column>
    <igx-column [field]="'Category'" [width]="'120px'" [filterable]='true' ></igx-column>
    <igx-column [field]="'Type'" [width]="'150px'"></igx-column>
    <igx-column [field]="'Change'" [width]="'120px'" [dataType]="'number'" [headerClasses]="'headerAlignSyle'">
        <ng-template igxHeader>
            <span class="cellAlignSyle">Change</span>
        </ng-template>
    <igx-column [field]="'Change(%)'" [width]="'130px'" [dataType]="'number'" [formatter]="formatNumber">
        <ng-template igxHeader>
            <span class="cellAlignSyle">Change(%)</span>
        </ng-template>
    </igx-column>
</igx-grid>
```

When all needed dependencies are included, next step would be to configure local or remote service that will return grids data. For example:

```typescript
@Injectable()
export class FinancialSampleComponent {
    @ViewChild("grid1") public grid1: IgxGridComponent;
    public data: Observable<any[]>;
    constructor(private localService: LocalService) {
        this.localService.getData(100000);
        this.data = this.localService.records;
    }
    public ngOnInit(): void {
    }
    public formatNumber(value: number) {
        return value.toFixed(2);
    }
    public formatCurrency(value: number) {
        return "$" + value.toFixed(2);
    }
}
```

Create the Grid component that will be used in the application. This will include:
- implement some sorting or paging for example.

```typescript
public ngOnInit(): void {
    this.grid1.state = {
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

```

- enable some features for certain columns

```typescript
public initColumns(event: IgxGridColumnInitEvent) {
    const column: IgxColumnComponent = event.column;
    if (column.field === "Change") {
        column.filterable = true;
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
    this.snax.open();
}
```

- Аdd cell template to allow cells to grow according to their content.

```
        <ng-template igxCell let-cell="cell" let-val>
        {{val}}
        </ng-template>
```

## API

### Inputs

Below is the list of all inputs that the developers may set to configure the grid look/behavior:


|Name|Type|Description|
|--- |--- |--- |
|`id`|string|Unique identifier of the Grid. If not provided it will be automatically generated.|
|`data`|Array|The data source for the grid.|
|`resourceStrings`| IGridResourceStrings | Resource strings of the grid. |
|`autoGenerate`|boolean|Autogenerate grid's columns, default value is _false_|
|`batchEditing`|boolean|Toggles batch editing in the grid, default is _false_|
|`paging`|boolean|Enables the paging feature. Defaults to _false_.|
|`page`| number | The current page index.|
|`perPage`|number|Visible items per page, default is 15|
|`allowFiltering`| boolean | Enables quick filtering functionality in the grid. |
|`allowAdvancedFiltering`| boolean | Enables advanced filtering functionality in the grid. |
|`filterMode`| `FilterMode` | Determines the filter mode, default value is `quickFilter`.|
|`filteringLogic`| FilteringLogic | The filtering logic of the grid. Defaults to _AND_. |
|`filteringExpressionsTree`| IFilteringExpressionsTree | The filtering state of the grid. |
|`advancedFilteringExpressionsTree`| IFilteringExpressionsTree | The advanced filtering state of the grid. |
|`emptyFilteredGridMessage`| string | The message displayed when there are no records and the grid is filtered.|
|`uniqueColumnValuesStrategy`| void | Property that provides a callback for loading unique column values on demand. If this property is provided, the unique values it generates will be used by the Excel Style Filtering. |
|`sortingExpressions`|Array|The sorting state of the grid.|
|`rowSelectable`|boolean|Enables multiple row selection, default is _false_.|
|`height`|string|The height of the grid element. You can pass values such as `1000px`, `75%`, etc.|
|`width`|string|The width of the grid element. You can pass values such as `1000px`, `75%`, etc.|
|`evenRowCSS`|string|Additional styling classes applied to all even rows in the grid.|
|`oddRowCSS`|string|Additional styling classes applied to all odd rows in the grid.|
|`paginationTemplate`|TemplateRef|You can provide a custom `ng-template` for the pagination part of the grid.|
|`groupingExpressions`| Array | The group by state of the grid.
|`groupingExpansionState`| Array | The list of expansion states of the group rows. Contains the expansion state(expanded: boolean) and an unique identifier for the group row (Array<IGroupByExpandState>) that contains a list of the group row's parents described via their fieldName and value.
|`groupsExpanded`| boolean | Determines whether created groups are rendered expanded or collapsed.  |
|`hideGroupedColumns`| boolean | Determines whether the grouped columns are hidden as well.  |
|`rowEditable` | boolean | enables/disables row editing mode |
|`transactions`| `TransactionService` | Transaction provider allowing access to all transactions and states of the modified rows. |
|`summaryPosition`| GridSummaryPosition | The summary row position for the child levels. The default is top. |
|`summaryCalculationMode`| GridSummaryCalculationMode | The summary calculation mode. The default is rootAndChildLevels, which means summaries are calculated for root and child levels.|
|`columnHiding`| boolean | Returns whether the column hiding UI for the `IgxGridComponent` is enabled.|
| `columnHidingTitle`| string | The title to be displayed in the built-in column hiding UI.|
| `columnPinning` | boolean | Returns if the built-in column pinning UI should be shown in the toolbar. |
| `columnPinningTitle` | string | The title to be displayed in the UI of the column pinning.|
| `rowHeight` | number | Sets the row height. |
| `columnWidth` | string | The default width of the `IgxGridComponent`'s columns. |
|`primaryKey`| any | Property that sets the primary key of the `IgxGridComponent`. |
|`hiddenColumnsText`| string | The text to be displayed inside the toggle button for the built-in column hiding UI of the`IgxColumnComponent`. |
|`pinnedColumnsText`| string | the text to be displayed inside the toggle button for the built-in column pinning UI of the`IgxColumnComponent`. |
|`showToolbar`| boolean | Specifies whether the `IgxGridComponent`'s toolbar is shown or hidden.|
|`toolbarTitle`| string | the toolbar's title. |
|`exportExcel`| boolean | Returns whether the option for exporting to MS Excel is enabled or disabled. |
|`exportCsv`| boolean | Returns whether the option for exporting to CSV is enabled or disabled.|
|`exportText`| string | Returns the textual content for the main export button.|
|`exportExcelText`| string | Sets the textual content for the main export button. |
|`exportCsvText`| string | Returns the textual content for the CSV export button.|
|`locale`| string | Determines the locale of the grid. Default value is `en`. |
| `isLoading` | bool | Sets if the grid is waiting for data - default value false. |
| `rowDraggable` | bool | Sets if the grid rows can be dragged |
| `columnSelection` | GridSelectionMode | Sets if the grid columns can be selected |
| `showGroupArea` | boolean | Set/get whether the group are row is shown |

### Outputs

A list of the events emitted by the **igx-grid**:

|Name|Description|
|--- |--- |
|_Event emitters_|_Notify for a change_|
|`cellEditEnter`|Emitted when cell enters edit mode.|
|`cellEdit`|Emitted just before a cell's value is committed (e.g. by pressing Enter).|
|`cellEditDone`|Emitted after a cell has been edited and editing has been committed.|
|`cellEditExit`|Emitted when a cell exits edit mode.|
|`rowEditEnter`|If `[rowEditing]` is enabled, emitted when a row enters edit mode (before cellEditEnter).|
|`rowEdit`|Emitted just before a row in edit mode's value is committed (e.g. by clicking the Done button on the Row Editing Overlay).|
|`rowEditDone`|Emitted after exiting edit mode for a row and editing has been committed.|
|`rowEditExit`|Emitted when a row exits edit mode without committing its values (e.g. by clicking the Cancel button on the Row Editing Overlay).|
|`cellClick`|Emitted when a cell is clicked. Returns the cell object.|
|`columnMoving`|Emitted when a column is moved. Returns the source and target columns objects. This event is cancelable.|
|`columnMovingEnd`|Emitted when a column moving ends. Returns the source and target columns objects. This event is cancelable.|
|`columnMovingStart`|Emitted when a column moving starts. Returns the moved column object.|
|`selected`|Emitted when a cell is selected. Returns the cell object.|
|`rowSelected`|Emitted when a row selection has changed. Returns array with old and new selected rows' IDs and the target row, if available.|
|`columnSelected`|Emitted when a column selection has changed. Returns array with old and new selected column' fields|
|`columnInit`|Emitted when the grid columns are initialized. Returns the column object.|
|`sortingDone`|Emitted when sorting is performed through the UI. Returns the sorting expression.|
|`filteringDone`|Emitted when filtering is performed through the UI. Returns the filtering expressions tree of the column for which the filtering was performed.|
|`pagingDone`|Emitted when paging is performed. Returns an object consisting of the previous and the new page.|
|`rowAdded`|Emitted when a row is being added to the grid through the API. Returns the data for the new row object.|
|`rowDeleted`|Emitted when a row is deleted through the grid API. Returns the row object being removed.|
|`dataPreLoad`| Emitted when a new chunk of data is loaded from virtualization. |
|`columnPin`|Emitted when a column is pinned or unpinned through the grid API. The index that the column is inserted at may be changed through the `insertAtIndex` property. Use `isPinned` to check whether the column is pinned or unpinned.|
|`columnResized`|Emitted when a column is resized. Returns the column object, previous and new column width.|
|`contextMenu`|Emitted when a cell is right clicked. Returns the cell object.|
|`doubleClick`|Emitted when a cell is double clicked. Returns the cell object.|
|`columnVisibilityChanged`| Emitted when `IgxColumnComponent` visibility is changed. Args: { column: any, newValue: boolean } |
|`onGroupingDone`|Emitted when the grouping state changes as a result of grouping columns, ungrouping columns or a combination of both. Provides an array of `ISortingExpression`, an array of the **newly** grouped columns as `IgxColumnComponent` references and an array of the **newly** ungrouped columns as `IgxColumnComponent` references.|
|`toolbarExporting`| Emitted when an export process is initiated by the user.|
| `rowDragStart` | Emitted when the user starts dragging a row. |
| `rowDragEnd` | Emitted when the user drops a row or cancel the drag. |
| `gridScroll` | Emitted when grid is scrolled horizontally/vertically. |
| `gridKeydown` | Emitted when keydown is triggered over element inside grid's body. |
| `gridCopy` | Emitted when a copy operation is executed. |
| `rowToggle` | Emitted when the expanded state of a row gets changed. |
| `rowPinning` | Emitted when the pinned state of a row is changed. |
| `rangeSelected` |  Emitted when making a range selection. |


Defining handlers for these event emitters is done using declarative event binding:

```html
<igx-grid #grid1 [data]="data | async" [autoGenerate]="false"
    (columnInit)="initColumns($event)" (selected)="selectCell($event)"></igx-grid>
```

### Methods

Here is a list of all public methods exposed by **igx-grid**:

|Signature|Description|
|--- |--- |
|`getColumnByName(name: string)`|Returns the column object with field property equal to `name` or `undefined` if no such column exists.|
|`getCellByColumn(rowIndex: number, columnField: string)`|Returns the cell object in column with `columnField` and row with `rowIndex` or `undefined`.|
|`addRow(data: any)`|Creates a new row object and adds the `data` record to the end of the data source.|
|`deleteRow(rowIndex: number)`|Removes the row object and the corresponding data record from the data source.|
|`updateRow(value: any, rowIndex: number)`|Updates the row object and the data source record with the passed value.|
|`updateCell(value: any, rowIndex: number, column: string)`|Updates the cell object and the record field in the data source.|
|`filter(name: string, value: any, conditionOrExpressionTree?: IFilteringOperation | IFilteringExpressionsTree, ignoreCase?: boolean)`|Filters a single column. A filtering condition or filtering expressions tree could be used. Check the available [filtering conditions](#filtering-conditions)|
|`filterGlobal(value: any, condition?, ignoreCase?)`|Filters all the columns in the grid with the same condition.|
|`clearFilter(name?: string)`|If `name` is provided, clears the filtering state of the corresponding column, otherwise clears the filtering state of all columns.|
|`sort(expression: ISortingExpression)`|Sorts a single column.|
|`sort(expressions: Array)`|Sorts the grid columns based on the provided array of sorting expressions.|
|`clearSort(name?: string)`|If `name` is provided, clears the sorting state of the corresponding column, otherwise clears the sorting state of all columns.|
|`enableSummaries(fieldName: string, customSummary?: any)`|Enable summaries for the specified column and apply your `customSummary`. If you do not provide the `customSummary`, then the default summary for the column data type will be applied.|
|`enableSummaries(expressions: Array)`|Enable summaries for the columns and apply your `customSummary` if it is provided.|
|`disableSummaries(fieldName: string)`|Disable summaries for the specified column.|
|`disableSummaries(columns: string[])`|Disable summaries for the listed columns.|
|`previousPage()`|Goes to the previous page if paging is enabled and the current page is not the first.|
|`nextPage()`|Goes to the next page if paging is enabled and current page is not the last.|
|`paginate(page: number)`|Goes to the specified page if paging is enabled. Page indices are 0 based.|
|`markForCheck()`|Manually triggers a change detection cycle for the grid and its children.|
|`pinColumn(name: string): boolean`|Pins a column by field name. Returns whether the operation is successful.|
|`unpinColumn(name: string): boolean`|Unpins a column by field name. Returns whether the operation is successful.|
|`selectedRows()`|Returns array of the currently selected rows' IDs|
|`selectRows(rowIDs: any[], clearCurrentSelection?: boolean)`|Marks the specified row(s) as selected in the grid `selectionAPI`. `clearCurrentSelection` first empties the grid's selection array.|
|`deselectRows(rowIDs: any[])`|Removes the specified row(s) from the grid's selection in the `selectionAPI`.|
|`selectAllRows()`|Marks all rows as selected in the grid `selectionAPI`.|
|`deselectAllRows()`|Sets the grid's row selection in the `selectionAPI` to `[]`.|
|`selectedColumns()`|Returns array of the currently selected columns|
|`selectColumns(columns: string[] | IgxColumnComponent[], clearCurrentSelection?: boolean)`|Marks the specified columns as selected in the grid `selectionAPI`. `clearCurrentSelection` first empties the grid's selection array.|
|`deselectColumns(columns: string[] | IgxColumnComponent[])`|Removes the specified columns from the grid's selection in the `selectionAPI`.|
|`deselectAllColumns()`|Sets the grid's column selection in the `selectionAPI` to `[]`.|
|`getSelectedColumnsData()`|Gets the the data form current selected columns.|
|`findNext(text: string, caseSensitive?: boolean, exactMatch?: boolean)`|Highlights all occurrences of the specified text and marks the next occurrence as active.|
|`findPrev(text: string, caseSensitive?: boolean, exactMatch?: boolean)`|Highlights all occurrences of the specified text and marks the previous occurrence as active.|
|`clearSearch(text: string, caseSensitive?: boolean)`|Removes all search highlights from the grid.|
|`refreshSearch()`|Refreshes the current search.|
|`groupBy(expression: IGroupingExpression)`| Groups by a new column based on the provided expression or modifies an existing one.
|`groupBy(expressions: Array<IGroupingExpression>)`| Groups columns based on the provided array of grouping expressions.
|`clearGrouping()`| Clears all grouping in the grid.
|`clearGrouping(fieldName: string)`| Clear grouping from a particular column.
|`isExpandedGroup(group: IGroupByRecord )`| Returns if a group is expanded or not.
|`toggleGroup(group: IGroupByRecord)`| Toggles the expansion state of a group.
|`toggleAllGroupRows()`| Toggles the expansion state of all group rows recursively.
|`selectAllRowsInGroup(group: IGroupByRecord, clearPrevSelection?: boolean)`| Select all rows within a group.
|`deselectAllRowsInGroup(group: IGroupByRecord)`| Deselect all rows within a group.
|`openAdvancedFilteringDialog()`| Opens the advanced filtering dialog.
|`closeAdvancedFilteringDialog(applyChanges: boolean)`| Closes the advanced filtering dialog.


## IgxColumnComponent

### Inputs

Inputs available on the **IgxGridColumnComponent** to define columns:

|Name|Type|Description|
|--- |--- |--- |
|`field`|string|Column field name|
|`header`|string|Column header text|
|`sortable`|boolean|Set column to be sorted or not|
|`sortStrategy`| Provide custom sort strategy to be used when sorting|
|`editable`|boolean|Set column values to be editable|
|`filterable`|boolean|Set column values to be filterable|
|`hasSummary`| boolean  |Sets whether or not the specific column has summaries enabled.|
|`summaries`| IgxSummaryOperand |Set custom summary for the specific column|
|`hidden`|boolean|Visibility of the column|
|`movable`|boolean|Set column to be movable|
|`resizable`|boolean|Set column to be resizable|
|`selectable`|boolean|Set column to be selectable|
|`selected`|boolean|Set column to be selected|
|`width`|string|Columns width|
|`minWidth`|string|Columns minimal width|
|`maxWidth`|string|Columns miximum width|
|`headerClasses`|string|Additional CSS classes applied to the header element.|
|`cellClasses`|string|Additional CSS classes that can be applied conditionally to the cells in this column.|
|`formatter`|Function|A function used to "template" the values of the cells without the need to pass a cell template the column.|
|`index`|string|Column index|
|`filteringIgnoreCase`|boolean|Ignore capitalization of strings when filtering is applied. Defaults to _true_.|
|`sortingIgnoreCase`|boolean|Ignore capitalization of strings when sorting is applied. Defaults to _true_.|
|`dataType`|GridColumnDataType|One of string, number, boolean or Date. When filtering is enabled the filter UI conditions are based on the `dataType` of the column. Defaults to `string` if it is not provided. With `autoGenerate` enabled the grid will try to resolve the correct data type for each column based on the data source.|
|`pinned`|boolean|Set column to be pinned or not|
|`searchable`|boolean|Determines whether the column is included in the search. If set to false, the cell values for this column will not be included in the results of the search API of the grid (defaults to true)|
|`groupable`|boolean| Determines whether the column may be grouped via the UI.|
|`disableHiding`|boolean| Enables/disables hiding for the column, default value is `false`.|
|`disablePinning`|boolean| Enables/disables pinning for the column, default value is `false`.|
|`rowStart`|number|Row index from which the field is starting. Only applies when the columns are within `IgxColumnLayoutComponent`.|
|`colStart`|number|Column index from which the field is starting. Only applies when the columns are within `IgxColumnLayoutComponent`.|
|`rowEnd`|string|Row index where the current field should end. The amount of rows between rowStart and rowEnd will determine the amount of spanning rows to that field. Only applies when the columns are within `IgxColumnLayoutComponent`.|
|`colEnd`|string|Column index where the current field should end. The amount of columns between colStart and colEnd will determine the amount of spanning columns to that field. Only applies when the columns are within `IgxColumnLayoutComponent`.|


### Methods
Here is a list of all public methods exposed by **IgxGridColumnComponent**:

|Signature|Description|
|--- |--- |
|`pin(): boolean`|Pins the column. Returns if the operation is successful.|
|`unpin(): boolean`|Unpins the column. Returns if the operation is successful.|
|`move(index): boolean`|Moves the column to the specified visible index.|


### Getters/Setters

|Name|Type|Getter|Setter|Description|
|--- |--- |--- |--- |--- |
|`bodyTemplate`|TemplateRef|Yes|Yes|Get/Set a reference to a template which will be applied to the cells in the column.|
|`headerTemplate`|TemplateRef|Yes|Yes|Get/Set a reference to a template which will be applied to the column header.|
|`footerTemplate`|TemplateRef|Yes|Yes|Get/Set a reference to a template which will be applied to the column footer.|
|`inlineEditorTemplate`|TemplateRef|Yes|Yes|Get/Set a reference to a template which will be applied as a cell enters edit mode.|
|`filterCellTemplate`|TemplateRef|Yes|Yes|Get/Set a reference to a template which will be applied to the filter cell of the column.|


## Filtering Conditions

You will need to import the appropriate condition types from the `igniteui-angular` package.

```typescript
import {
    STRING_FILTERS,
    NUMBER_FILTERS,
    DATE_FILTERS,
    BOOLEAN_FILTERS
} from 'igniteui-angular/main';
```

### String types

|Name|Signature|Description|
|--- |--- |--- |
|`contains`|`(target: string, searchVal: string, ignoreCase?: boolean)`|Returns true if the `target` contains the `searchVal`.|
|`startsWith`|`(target: string, searchVal: string, ignoreCase?: boolean)`|Returns true if the `target` starts with the `searchVal`.|
|`endsWith`|`(target: string, searchVal: string, ignoreCase?: boolean)`|Returns true if the `target` ends with the `searchVal`.|
|`doesNotContain`|`(target: string, searchVal: string, ignoreCase?: boolean)`|Returns true if `searchVal` is not in `target`.|
|`equals`|`(target: string, searchVal: string, ignoreCase?: boolean)`|Returns true if `searchVal` matches `target`.|
|`doesNotEqual`|`(target: string, searchVal: string, ignoreCase?: boolean)`|Returns true if `searchVal` does not match `target`.|
|`null`|`(target: any)`|Returns true if `target` is `null`.|
|`notNull`|`(target: any)`|Returns true if `target` is not `null`.|
|`empty`|`(target: any)`|Returns true if `target` is either `null`, `undefined` or a string of length 0.|
|`notEmpty`|`(target: any)`|Returns true if `target` is not `null`, `undefined` or a string of length 0.|


### Number types

|Name|Signature|Description|
|--- |--- |--- |
|`equals`|`(target: number, searchVal: number)`|Returns true if `target` equals `searchVal`.|
|`doesNotEqual`|`(target: number, searchVal: number)`|Returns true if `target` is not equal to `searchVal`.|
|`doesNotEqual`|`(target: number, searchVal: number)`|Returns true if `target` is greater than `searchVal`.|
|`lessThan`|`(target: number, searchVal: number)`|Returns true if `target` is less than `searchVal`.|
|`greaterThanOrEqualTo`|`(target: number, searchVal: number)`|Returns true if `target` is greater than or equal to `searchVal`.|
|`lessThanOrEqualTo`|`(target: number, searchVal: number)`|Returns true if `target` is less than or equal to `searchVal`.|
|`null`|`(target: any)`|Returns true if `target` is `null`.|
|`notNull`|`(target: any)`|Returns true if `target` is not `null`.|
|`empty`|`(target: any)`|Returns true if `target` is either `null`, `undefined` or `NaN`.|
|`notEmpty`|`(target: any)`|Returns true if `target` is not `null`, `undefined` or `NaN`.|


### Boolean types

|Name|Signature|Description|
|--- |--- |--- |
|`all`|`(target: boolean)`|Returns all rows.|
|`true`|`(target: boolean)`|Returns if `target` is truthy.|
|`false`|`(target: boolean)`|Returns true if `target` is falsy.|
|`null`|`(target: any)`|Returns true if `target` is `null`.|
|`notNull`|`(target: any)`|Returns true if `target` is not `null`.|
|`empty`|`(target: any)`|Returns true if `target` is either `null` or `undefined`.|
|`notEmpty`|`(target: any)`|Returns true if target is not `null` or `undefined`.|

### Date types

|Name|Signature|Description|
|--- |--- |--- |
|`equals`|`(target: Date, searchVal: Date)`|Returns `true` if `target` equals `searchVal`.|
|`doesNotEqual`|`(target: Date, searchVal: Date)`|Returns `true` if `target` does not equal `searchVal`.|
|`before`|`(target: Date, searchVal: Date)`|Returns `true` if `target` is earlier than `searchVal`.|
|`after`|`(target: Date, searchVal: Date)`|Returns `true` if `target` is after `searchVal`.|
|`today`|`(target: Date)`|Returns `true` if `target` is the current date.|
|`yesterday`|`(target: Date)`|Returns `true` if `target` is the day before the current date.|
|`thisMonth`|`(target: Date)`|Returns `true` if `target` is contained in the current month.|
|`lastMonth`|`(target: Date)`|Returns `true` if `target` is contained in the month before the current month.|
|`nextMonth`|`(target: Date)`|Returns `true` if `target` is contained in the month following the current month.|
|`thisYear`|`(target: Date)`|Returns `true` if `target` is contained in the current year.|
|`lastYear`|`(target: Date)`|Returns `true` if `target` is contained in the year before the current year.|
|`nextYear`|`(target: Date)`|Returns `true` if `target` is contained in the year following the current year.|
|`null`|`(target: any)`|Returns true if `target` is `null`.|
|`notNull`|`(target: any)`|Returns true if `target` is not `null`.|
|`empty`|`(target: any)`|Returns true if `target` is either `null` or `undefined`.|
|`notEmpty`|`(target: any)`|Returns true if target is not `null` or `undefined`.|

## IgxGridRowComponent

### Getters/Setters

|Name|Type|Getter|Setter|Description|
|--- |--- |--- |--- |--- |
|`rowData`|Array|Yes|No|The data passed to the row component.|
|`index`|number|Yes|No|The index of the row.|
|`cells`|QueryList|Yes|No|The rendered cells in the row component.|
|`grid`|IgxGridComponent|Yes|No|A reference to the grid containing the row.|
|`nativeElement`|HTMLElement|Yes|No|The native DOM element representing the row. Could be `null` in certain environments.|

## IgxGridGroupByRowComponent

### Getters/Setters

|Name|Type|Getter|Setter|Description|
|--- |--- |--- |--- |--- |
|`index` | number | Yes | No | The index of the row in the rows list. |
|`grid`|IgxGridComponent|Yes|No|A reference to the grid containing the group row. |
|`groupRow` | IGroupByRecord | Yes | No | The group row data. Contains the related group expression, level, sub-records and group value. |
|`expanded` | boolean | Yes | No | Whether the row is expanded or not. |
|`groupContent` | ElementRef | Yes | No | The container for the group row template. Holds the group row content. |
|`focused` | boolean | Yes | No | Returns whether the group row is currently focused. |

### Methods

|Name|Return Type|Description|
|--- |--- |--- |
|`toggle()`|void| Toggles the expand state of the group row. |

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

## IgxGridState Directive

### Getters/Setters

|Name|Type|Getter|Setter|Description|
|--- |--- |--- |--- |--- |
|`options`|IGridStateOptions|Yes|Yes|Features to be exluded from tracking in the IgxGridState directive.|

### Methods

|Name|Return Type|Description|
|--- |--- |--- |
|`getState(serialize: boolean, feature?: string | string[])`|IGridState, string|Gets the state of a feature or states of all grid features, unless a certain feature is disabled through the `options` property..|
|`setState(val: IGridState | string)`|void|Restores grid features' state based on the IGridState object passed as an argument.|
