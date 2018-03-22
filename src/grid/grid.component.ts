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
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef
} from "@angular/core";
import { of } from "rxjs/observable/of";
import { debounceTime, delay, merge, repeat, take, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs/Subject";
import { cloneArray } from "../core/utils";
import { DataType } from "../data-operations/data-util";
import { FilteringLogic, IFilteringExpression } from "../data-operations/filtering-expression.interface";
import { ISortingExpression, SortingDirection } from "../data-operations/sorting-expression.interface";
import { IgxForOfDirective } from "../directives/for-of/for_of.directive";
import { IgxGridAPIService } from "./api.service";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { IgxGridRowComponent } from "./row.component";

let NEXT_ID = 0;
const DEBOUNCE_TIME = 16;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid",
    templateUrl: "./grid.component.html"
})
export class IgxGridComponent implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {

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
        this.cdr.markForCheck();
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

    get headerWidth() {
        return parseInt(this.width, 10) - 17;
    }

    @Input()
    public evenRowCSS = "";

    @Input()
    public oddRowCSS = "";

    @Input()
    public rowHeight = 50;

    @Output()
    public onSelection = new EventEmitter<any>();

    @Output()
    public onColumnPinning = new EventEmitter<any>();

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

    @ViewChild("scrollContainer", { read: IgxForOfDirective })
    public parentVirtDir: IgxForOfDirective<any>;

    @ViewChild("verticalScrollContainer", { read: IgxForOfDirective })
    public verticalScrollContainer: IgxForOfDirective<any>;

    @ViewChild("scr", { read: ElementRef })
    public scr: ElementRef;

    @ViewChild("headerContainer", { read: IgxForOfDirective })
    public headerContainer: IgxForOfDirective<any>;

    @ViewChild("theadRow")
    public theadRow: ElementRef;

    @ViewChild("tfoot")
    public tfoot: ElementRef;

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
    public calcWidth: number;
    public calcHeight: number;

    public cellInEditMode: IgxGridCellComponent;

    public eventBus = new Subject<boolean>();
    protected destroy$ = new Subject<boolean>();

    protected _perPage = 15;
    protected _page = 0;
    protected _paging = false;
    protected _pipeTrigger = 0;
    protected _columns: IgxColumnComponent[] = [];
    protected _pinnedColumns: IgxColumnComponent[] = [];
    protected _unpinnedColumns: IgxColumnComponent[] = [];
    protected _filteringLogic = FilteringLogic.And;
    protected _filteringExpressions = [];
    protected _sortingExpressions = [];
    private resizeHandler;

    constructor(
        private gridAPI: IgxGridAPIService,
        private elementRef: ElementRef,
        private zone: NgZone,
        @Inject(DOCUMENT) private document,
        public cdr: ChangeDetectorRef,
        private resolver: ComponentFactoryResolver,
        private viewRef: ViewContainerRef) {

        this.resizeHandler = () => {
            this.calculateGridSizes();
            this.zone.run(() => this.markForCheck());
        };
    }

    public ngOnInit() {
        this.gridAPI.register(this);
        this.calcWidth = this.width && this.width.indexOf("%") === -1 ? parseInt(this.width, 10) : 0;
        this.calcHeight = 0;
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
        this._pinnedColumns = this._columns.filter((c) => c.pinned);
        this._unpinnedColumns = this._columns.filter((c) => !c.pinned);
    }

    public ngAfterViewInit() {
        this.zone.runOutsideAngular(() => {
            this.document.defaultView.addEventListener("resize", this.resizeHandler);
        });

        this.calculateGridSizes();
        this.setEventBusSubscription();
        this.setVerticalScrollSubscription();
        this.cdr.detectChanges();
    }

    public ngOnDestroy() {
        this.zone.runOutsideAngular(() => this.document.defaultView.removeEventListener("resize", this.resizeHandler));
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    get pinnedWidth() {
        return this.getPinnedWidth();
    }

    get unpinnedWidth() {
        return this.getUnpinnedWidth();
    }

    get columns(): IgxColumnComponent[] {
        return this._columns;
    }

    get pinnedColumns(): IgxColumnComponent[] {
        return this._pinnedColumns.filter((col) => !col.hidden);
    }

    get unpinnedColumns(): IgxColumnComponent[] {
        return this._unpinnedColumns.filter((col) => !col.hidden).sort((col1, col2) => col1.index - col2.index);
    }

    public getColumnByName(name: string): IgxColumnComponent {
        return this.columnList.find((col) => col.field === name);
    }

    public getRowByIndex(index: number): IgxGridRowComponent {
        return this.rowList.toArray()[index];
    }

    get visibleColumns(): IgxColumnComponent[] {
        return this.columnList.filter((col) => !col.hidden);
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
        if (this.rowList) {
            this.rowList.forEach((row) => row.cdr.markForCheck());
        }
        this.cdr.detectChanges();
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

    public pinColumn(columnName: string): boolean {
        const col = this.getColumnByName(columnName);

        /**
         * If the column that we want to pin is bigger or equal than the unpinned area we should not pin it.
         * It should be also unpinned before pinning, since changing left/right pin area doesn't affect unpinned area.
         */
        if (parseInt(col.width, 10) >= this.getUnpinnedWidth(true) && !col.pinned) {
            return false;
        }

        col.pinned = true;
        const index = this._pinnedColumns.length;

        const args = { column: col, insertAtIndex: index };
        this.onColumnPinning.emit(args);

        // update grid collections.
        if (this._pinnedColumns.indexOf(col) === -1) {
            this._pinnedColumns.splice(args.insertAtIndex, 0, col);

            if (this._unpinnedColumns.indexOf(col) !== -1) {
                this._unpinnedColumns.splice(this._unpinnedColumns.indexOf(col), 1);
            }
        }

        this.markForCheck();
        return true;
    }

    public unpinColumn(columnName: string) {
        const col = this.getColumnByName(columnName);
        col.pinned = false;
        this._unpinnedColumns.splice(col.index, 0, col);
        if (this._pinnedColumns.indexOf(col) !== -1) {
            this._pinnedColumns.splice(this._pinnedColumns.indexOf(col), 1);
        }
        this.markForCheck();
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

    protected calculateGridSizes() {
        const computed = this.document.defaultView.getComputedStyle(this.nativeElement);
        if (!this.width) {
            /*no width specified.*/
            this.calcWidth = null;
        } else if (this.width && this.width.indexOf("%") !== -1) {
            /* width in %*/
            this.calcWidth = parseInt(computed.getPropertyValue("width"), 10);
        }
        if (!this.height) {
            /*no height specified.*/
            this.calcHeight = null;
        } else if (this.height && this.height.indexOf("%") !== -1) {
            /*height in %*/
            const footerHeight = this.tfoot.nativeElement.firstElementChild ?
                this.tfoot.nativeElement.firstElementChild.clientHeight : 0;
            this.calcHeight = parseInt(computed.getPropertyValue("height"), 10) -
                this.theadRow.nativeElement.clientHeight -
                footerHeight -
                this.scr.nativeElement.clientHeight;
        } else {
            const footerHeight = this.tfoot.nativeElement.firstElementChild ?
                this.tfoot.nativeElement.firstElementChild.clientHeight : 0;
            this.calcHeight = parseInt(this.height, 10) -
                this.theadRow.nativeElement.clientHeight -
                footerHeight -
                this.scr.nativeElement.clientHeight;
        }
    }

    /**
     * Gets calculated width of the start pinned area
     * @param takeHidden If we should take into account the hidden columns in the pinned area
     */
    protected getPinnedWidth(takeHidden = false) {
        const fc = takeHidden ? this._pinnedColumns : this.pinnedColumns;
        let sum = 0;
        for (const col of fc) {
            sum += parseInt(col.width, 10);
        }
        return sum;
    }

    /**
     * Gets calculated width of the unpinned area
     * @param takeHidden If we should take into account the hidden columns in the pinned area
     */
    protected getUnpinnedWidth(takeHidden = false) {
        const width = this.width && this.width.indexOf("%") !== -1 ?
            this.calcWidth :
            parseInt(this.width, 10);
        return width - this.getPinnedWidth(takeHidden);
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

    protected setEventBusSubscription() {
        this.eventBus.pipe(
            debounceTime(DEBOUNCE_TIME),
            takeUntil(this.destroy$)
        ).subscribe(() => this.cdr.detectChanges());
    }

    protected setVerticalScrollSubscription() {
        /*
            Until the grid component is destroyed,
            Take the first event and unsubscribe
            then merge with an empty observable after DEBOUNCE_TIME,
            re-subscribe and repeat the process
        */
        this.parentVirtDir.onChunkLoad.pipe(
            takeUntil(this.destroy$),
            take(1),
            merge(of({})),
            delay(DEBOUNCE_TIME),
            repeat()
        ).subscribe(() => {
            if (this.cellInEditMode) {
                this.cellInEditMode.inEditMode = false;
            }
        });
    }
}
