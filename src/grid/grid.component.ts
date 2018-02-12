import { DOCUMENT } from "@angular/common";
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactory,
    ComponentFactoryResolver,
    ComponentRef,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostBinding,
    Inject,
    Input,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef
} from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { cloneArray } from "../core/utils";
import { DataType } from "../data-operations/data-util";
import { FilteringLogic, IFilteringExpression } from "../data-operations/filtering-expression.interface";
import { ISortingExpression, SortingDirection } from "../data-operations/sorting-expression.interface";
import { IgxGridAPIService } from "./api.service";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { IgxGridRowComponent } from "./row.component";

let NEXT_ID = 0;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid",
    templateUrl: "./grid.component.html"
})
export class IgxGridComponent implements OnInit, AfterContentInit, AfterViewInit {

    @Input()
    public data = [];

    @Input()
    public autoGenerate = false;

    @Input()
    public id = `igx-grid-${NEXT_ID++}`;

    @Input()
    public filteringLogic = FilteringLogic.And;

    @Input()
    get filteringExpressions() {
        return this._filteringExpressions;
    }

    set filteringExpressions(value) {
        this._filteringExpressions = cloneArray(value);
        this.cdr.markForCheck();
    }

    @Input()
    get paging(): boolean {
        return this._paging;
    }

    set paging(value: boolean) {
        this._paging = value;
        this._pipeTrigger++;
        this.cdr.markForCheck();
    }

    @Input()
    get page(): number {
        return this._page;
    }

    set page(val: number) {
        if (val < 0) {
            return;
        }
        this.onPagingDone.emit({ previous: this._page, current: val });
        this._page = val;
    }

    @Input()
    get perPage(): number {
        return this._perPage;
    }

    set perPage(val: number) {
        if (val < 0) {
            return;
        }
        this._perPage = val;
        this.page = 0;
    }

    @Input()
    public paginationTemplate: TemplateRef<any>;

    @HostBinding("style.height")
    @Input()
    public height;

    @HostBinding("style.width")
    @Input()
    public width;

    @Input()
    public evenRowCSS = "";

    @Input()
    public oddRowCSS = "";

    @Output()
    public onSelection = new EventEmitter<any>();

    @Output()
    public onEditDone = new EventEmitter<any>();

    @Output()
    public onColumnInit = new EventEmitter<any>();

    @Output()
    public onSortingDone = new EventEmitter<any>();

    @Output()
    public onFilteringDone = new EventEmitter<any>();

    @Output()
    public onPagingDone = new EventEmitter<any>();

    @Output()
    public onRowAdded = new EventEmitter<any>();

    @Output()
    public onRowDeleted = new EventEmitter<any>();

    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent })
    public columnList: QueryList<IgxColumnComponent>;

    @ViewChildren(IgxGridRowComponent, { read: IgxGridRowComponent })
    public rowList: QueryList<IgxGridRowComponent>;

    @HostBinding("attr.tabindex")
    public tabindex = 0;

    @HostBinding("attr.class")
    public hostClass = "igx-grid";

    @HostBinding("attr.role")
    public hostRole = "grid";

    get pipeTrigger(): number {
        return this._pipeTrigger;
    }

    @Input()
    get sortingExpressions() {
        return this._sortingExpressions;
    }

    set sortingExpressions(value) {
        this._sortingExpressions = cloneArray(value);
        this.cdr.markForCheck();
    }

    public pagingState;

    public cellInEditMode: IgxGridCellComponent;

    protected _perPage = 15;
    protected _page = 0;
    protected _paging = false;
    protected _pipeTrigger = 0;
    protected _columns = [];
    protected _filteringLogic = FilteringLogic.And;
    protected _filteringExpressions = [];
    protected _sortingExpressions = [];

    constructor(
        private gridAPI: IgxGridAPIService,
        private elementRef: ElementRef,
        @Inject(DOCUMENT) private document,
        public cdr: ChangeDetectorRef,
        private resolver: ComponentFactoryResolver,
        private viewRef: ViewContainerRef) {
    }

    public ngOnInit() {
        this.gridAPI.register(this);
    }

    public ngAfterContentInit() {
        if (this.autoGenerate) {
            this.autogenerateColumns();
        }
        this.columnList.forEach((col, idx) => {
            col.index = idx;
            col.gridID = this.id;
            this.onColumnInit.emit(col);
        });
        this._columns = this.columnList.toArray();
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            const computed = this.document.defaultView.getComputedStyle(this.nativeElement);
            this.width = computed.getPropertyValue("width");
            this.height = computed.getPropertyValue("height");
            this.markForCheck();
        });
    }

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    get columns(): IgxColumnComponent[] {
        return this._columns;
    }

    public getColumnByName(name: string): IgxColumnComponent {
        return this.columnList.find((col) => col.field === name);
    }

    get visibleColumns(): IgxColumnComponent[] {
        return this.columnList.filter((col) => !col.hidden).sort((col1, col2) => col1.index - col2.index);
    }

    public getCellByColumn(rowIndex: number, columnField: string): IgxGridCellComponent {
        return this.gridAPI.get_cell_by_field(this.id, rowIndex, columnField);
    }

    get totalPages(): number {
        if (this.pagingState) {
            return this.pagingState.metadata.countPages;
        }
        return -1;
    }

    get totalRecords(): number {
        if (this.pagingState) {
            return this.pagingState.metadata.countRecords;
        }
    }

    get isFirstPage(): boolean {
        return this.page === 0;
    }

    get isLastPage(): boolean {
        return this.page + 1 >= this.totalPages;
    }

    public nextPage(): void {
        if (!this.isLastPage) {
            this.page += 1;
        }
    }

    public previousPage(): void {
        if (!this.isFirstPage) {
            this.page -= 1;
        }
    }

    public paginate(val: number): void {
        if (val < 0) {
            return;
        }
        this.page = val;
    }

    public markForCheck() {
        this.gridAPI.mark_for_check(this.id);
    }

    public addRow(data: any): void {
        this.data.push(data);
        this.onRowAdded.emit({ data });
        this._pipeTrigger++;
        this.cdr.markForCheck();
    }

    public deleteRow(rowIndex: number): void {
        const row = this.gridAPI.get_row(this.id, rowIndex);
        if (row) {
            const index = this.data.indexOf(row.rowData);
            this.data.splice(index, 1);
            this.onRowDeleted.emit({ row });
            this._pipeTrigger++;
            this.cdr.markForCheck();
        }
    }

    public updateCell(value: any, rowIndex: number, column: string): void {
        const cell = this.gridAPI.get_cell_by_field(this.id, rowIndex, column);
        if (cell) {
            cell.update(value);
            this._pipeTrigger++;
        }
    }

    public updateRow(value: any, rowIndex: number): void {
        const row = this.gridAPI.get_row(this.id, rowIndex);
        if (row) {
            this.gridAPI.update_row(value, this.id, row);
            this._pipeTrigger++;
            this.cdr.markForCheck();
        }
    }

    public sort(...rest): void {
        if (rest.length === 1 && rest[0] instanceof Array) {
            this._sortMultiple(rest[0]);
        } else {
            this._sort(rest[0], rest[1], rest[2]);
        }
    }

    public filter(...rest): void {
        if (rest.length === 1 && rest[0] instanceof Array) {
            this._filterMultiple(rest[0]);
        } else {
            this._filter(rest[0], rest[1], rest[2], rest[3]);
        }
    }

    public filterGlobal(value: any, condition?, ignoreCase?) {
        this.gridAPI.filter_global(this.id, value, condition, ignoreCase);
    }

    public clearFilter(name?: string) {

        if (!name) {
            this.filteringExpressions = [];
            return;
        }
        if (!this.gridAPI.get_column_by_name(this.id, name)) {
            return;
        }
        this.gridAPI.clear_filter(this.id, name);
    }

    public clearSort(name?: string) {
        if (!name) {
            this.sortingExpressions = [];
            return;
        }
        if (!this.gridAPI.get_column_by_name(this.id, name)) {
            return;
        }
        this.gridAPI.clear_sort(this.id, name);
    }

    get hasSortableColumns(): boolean {
        return this.columnList.some((col) => col.sortable);
    }

    get hasEditableColumns(): boolean {
        return this.columnList.some((col) => col.editable);
    }

    get hasFilterableColumns(): boolean {
        return this.columnList.some((col) => col.filterable);
    }

    get selectedCells(): IgxGridCellComponent[] | any[] {
        if (this.rowList) {
            return this.rowList.map((row) => row.cells.filter((cell) => cell.selected))
                .reduce((a, b) => a.concat(b), []);
        }
        return [];
    }

    protected _sort(name: string, direction = SortingDirection.Asc, ignoreCase = true) {
        this.gridAPI.sort(this.id, name, direction, ignoreCase);
    }

    protected _sortMultiple(expressions: ISortingExpression[]) {
        this.gridAPI.sort_multiple(this.id, expressions);
    }

    protected _filter(name: string, value: any, condition?, ignoreCase?) {
        const col = this.gridAPI.get_column_by_name(this.id, name);
        if (col) {
            this.gridAPI
                .filter(this.id, name, value,
                condition || col.filteringCondition, ignoreCase || col.filteringIgnoreCase);
        } else {
            this.gridAPI.filter(this.id, name, value, condition, ignoreCase);
        }
    }

    protected _filterMultiple(expressions: IFilteringExpression[]) {
        this.gridAPI.filter_multiple(this.id, expressions);
    }

    protected resolveDataTypes(rec) {
        if (typeof rec === "number") {
            return DataType.Number;
        } else if (typeof rec === "boolean") {
            return DataType.Boolean;
        } else if (typeof rec === "object" && rec instanceof Date) {
            return DataType.Date;
        }
        return DataType.String;
    }

    protected autogenerateColumns() {
        const factory = this.resolver.resolveComponentFactory(IgxColumnComponent);
        const fields = Object.keys(this.data[0]);
        const columns = [];

        fields.forEach((field) => {
            const ref = this.viewRef.createComponent(factory);
            ref.instance.field = field;
            ref.instance.dataType = this.resolveDataTypes(this.data[0][field]);
            ref.changeDetectorRef.detectChanges();
            columns.push(ref.instance);
        });

        this.columnList.reset(columns);
    }
}
