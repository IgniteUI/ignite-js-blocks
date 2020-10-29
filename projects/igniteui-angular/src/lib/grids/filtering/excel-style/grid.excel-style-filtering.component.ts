import {
    ChangeDetectorRef,
    Component,
    ViewChild,
    HostBinding,
    ChangeDetectionStrategy,
    TemplateRef,
    Directive,
    OnDestroy,
    ElementRef,
    Input,
    ViewRef,
    ContentChild,
    Output,
    EventEmitter,
} from '@angular/core';
import { IgxOverlayService } from '../../../services/public_api';
import { IgxFilteringService, ExpressionUI } from '../grid-filtering.service';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../../data-operations/filtering-expressions-tree';
import { cloneArray, KEYS, resolveNestedPath } from '../../../core/utils';
import { DataType, DataUtil } from '../../../data-operations/data-util';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IgxColumnComponent } from '../../columns/column.component';
import { IgxGridBaseDirective } from '../../grid-base.directive';
import { DisplayDensity } from '../../../core/density';
import { GridSelectionMode } from '../../common/enums';

/**
 * @hidden
 */
export class FilterListItem {
    public value: any;
    public label: any;
    public isSelected: boolean;
    public indeterminate: boolean;
    public isFiltered: boolean;
    public isSpecial = false;
    public isBlanks = false;
}

@Directive({
    selector: 'igx-excel-style-column-operations,[igxExcelStyleColumnOperations]'
})
export class IgxExcelStyleColumnOperationsTemplateDirective {
    constructor() {}
}

@Directive({
    selector: 'igx-excel-style-filter-operations,[igxExcelStyleFilterOperations]'
})
export class IgxExcelStyleFilterOperationsTemplateDirective {
    constructor() {}
}

/**
 * A component used for presenting Excel style filtering UI for a specific column.
 * It is used internally in the Grid, but could also be hosted in a container outside of it.
 *
 * Example:
 * ```html
 * <igx-grid-excel-style-filtering
 *     [column]="grid1.columns[0]">
 * </igx-grid-excel-style-filtering>
 * ```
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-excel-style-filtering',
    templateUrl: './grid.excel-style-filtering.component.html'
})
export class IgxGridExcelStyleFilteringComponent implements OnDestroy {
    private destroy$ = new Subject<boolean>();
    private containsNullOrEmpty = false;
    private selectAllSelected = true;
    private selectAllIndeterminate = false;
    private filterValues = new Set<any>();
    private _column: IgxColumnComponent;
    private _columnPinning: Subscription;
    private _columnVisibilityChanged: Subscription;
    private _sortingChanged: Subscription;
    private _filteringChanged: Subscription;
    private _densityChanged: Subscription;
    private _columnMoved: Subscription;
    private _originalDisplay: string;

    /**
     * An @Input property that sets the column.
     */
    @Input()
    public set column(value: IgxColumnComponent) {
        this._column = value;
        this.listData = new Array<FilterListItem>();
        this.columnChange.emit(this._column);

        if (this._columnPinning) {
            this._columnPinning.unsubscribe();
        }

        if (this._columnVisibilityChanged) {
            this._columnVisibilityChanged.unsubscribe();
        }

        if (this._sortingChanged) {
            this._sortingChanged.unsubscribe();
        }

        if (this._filteringChanged) {
            this._filteringChanged.unsubscribe();
        }

        if (this._densityChanged) {
            this._densityChanged.unsubscribe();
        }

        if (this._columnMoved) {
            this._columnMoved.unsubscribe();
        }

        if (this._column) {
            this._column.grid.filteringService.registerSVGIcons();
            this.init();
            this.sortingChanged.emit();

            this._columnPinning = this.grid.onColumnPinning.pipe(takeUntil(this.destroy$)).subscribe(() => {
                requestAnimationFrame(() => {
                    if (!(this.cdr as ViewRef).destroyed) {
                        this.cdr.detectChanges();
                    }
                });
            });
            this._columnVisibilityChanged = this.grid.onColumnVisibilityChanged.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.cdr.detectChanges();
            });
            this._sortingChanged =  this.grid.sortingExpressionsChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.sortingChanged.emit();
            });
            this._filteringChanged = this.grid.filteringExpressionsTreeChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.init();
            });
            this._densityChanged = this.grid.onDensityChanged.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.cdr.detectChanges();
            });
            this._columnMoved = this.grid.onColumnMovingEnd.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.cdr.detectChanges();
            });
        }
    }

    /**
     * Returns the current column.
     */
    public get column(): IgxColumnComponent {
        return this._column;
    }

    /**
     * @hidden @internal
     */
    public get filteringService(): IgxFilteringService {
        return this.grid.filteringService;
    }

    /**
     * @hidden @internal
     */
    public expressionsList = new Array<ExpressionUI>();
    /**
     * @hidden @internal
     */
    public listData = new Array<FilterListItem>();
    /**
     * @hidden @internal
     */
    public uniqueValues = [];
    /**
     * @hidden @internal
     */
    public overlayService: IgxOverlayService;
    /**
     * @hidden @internal
     */
    public overlayComponentId: string;

    private _minHeight;

    /**
     * Gets the minimum height.
     */
    @Input()
    get minHeight(): string {
        if (this._minHeight || this._minHeight === 0) {
            return this._minHeight;
        }

        if (!this.inline) {
            let minHeight = 645;
            switch (this.displayDensity) {
                case DisplayDensity.cosy: minHeight = 465; break;
                case DisplayDensity.compact: minHeight = 330; break;
                default: break;
            }
            return `${minHeight}px`;
        }
    }

    /**
     * Sets the minimum height.
     */
    set minHeight(value: string) {
        this._minHeight = value;
    }


    private _maxHeight;

    /**
     * Gets the maximum height.
     */
    @Input()
    @HostBinding('style.max-height')
    get maxHeight(): string {
        if (this._maxHeight) {
            return this._maxHeight;
        }

        if (!this.inline) {
            let maxHeight = 775;
            switch (this.displayDensity) {
                case DisplayDensity.cosy: maxHeight = 565; break;
                case DisplayDensity.compact: maxHeight = 405; break;
                default: break;
            }
            return `${maxHeight}px`;
        }
    }

    /**
     * Sets the maximum height.
     */
    set maxHeight(value: string) {
        this._maxHeight = value;
    }

    /**
     * @hidden @internal
     */
    @HostBinding('class.igx-excel-filter')
    className = 'igx-excel-filter';

    /**
     * @hidden @internal
     */
    @HostBinding('class.igx-excel-filter--inline')
    public inline = true;

    /**
     * @hidden @internal
     */
    @Output()
    public loadingStart = new EventEmitter();

    /**
     * @hidden @internal
     */
    @Output()
    public loadingEnd = new EventEmitter();

    /**
     * @hidden @internal
     */
    @Output()
    public initialized = new EventEmitter();

    /**
     * @hidden @internal
     */
    @Output()
    public sortingChanged = new EventEmitter();

    /**
     * @hidden @internal
     */
    @Output()
    public columnChange = new EventEmitter<IgxColumnComponent>();

    /**
     * @hidden @internal
     */
    @Output()
    public listDataLoaded = new EventEmitter();

    /**
     * @hidden @internal
     */
    @ViewChild('defaultExcelColumnOperations', { read: TemplateRef, static: true })
    protected defaultExcelColumnOperations: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('defaultExcelFilterOperations', { read: TemplateRef, static: true })
    protected defaultExcelFilterOperations: TemplateRef<any>;

    @ViewChild('mainDropdown', { read: ElementRef })
    public mainDropdown: ElementRef;

    /**
     * @hidden @internal
     */
    @ContentChild(IgxExcelStyleColumnOperationsTemplateDirective, { read: IgxExcelStyleColumnOperationsTemplateDirective })
    public excelColumnOperationsDirective: IgxExcelStyleColumnOperationsTemplateDirective;

    /**
     * @hidden @internal
     */
    @ContentChild(IgxExcelStyleFilterOperationsTemplateDirective, { read: IgxExcelStyleFilterOperationsTemplateDirective })
    public excelFilterOperationsDirective: IgxExcelStyleFilterOperationsTemplateDirective;

    /**
     * @hidden @internal
     */
    get grid(): IgxGridBaseDirective {
        return this.column?.grid;
    }

    /**
     * @hidden @internal
     */
    get displayDensity() {
        return this.column?.grid.displayDensity;
    }

    constructor(private cdr: ChangeDetectorRef, public element: ElementRef) {}

    /**
     * @hidden @internal
     */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    private init() {
        this.expressionsList = new Array<ExpressionUI>();
        this.filteringService.generateExpressionsList(this.column.filteringExpressionsTree, this.grid.filteringLogic, this.expressionsList);
        this.populateColumnData();
    }

    /**
     * @hidden @internal
     */
    public selectedClass() {
        return this.column.selected ? 'igx-excel-filter__actions-selected' : 'igx-excel-filter__actions-select';
    }

    /**
     * @hidden @internal
     */
    public initialize(column: IgxColumnComponent, overlayService: IgxOverlayService,
        overlayComponentId: string) {
        this.inline = false;
        this.column = column;
        this.overlayService = overlayService;
        this.overlayComponentId = overlayComponentId;
        if (this._originalDisplay) {
            this.element.nativeElement.style.display = this._originalDisplay;
        }

        this.initialized.emit();
        this.grid.onColumnMoving.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.closeDropdown();
        });
    }

    /**
     * @hidden @internal
     */
    public onPin() {
        this.column.pinned = !this.column.pinned;
        this.closeDropdown();
    }

    /**
     * @hidden @internal
     */
    public onSelect() {
        if (!this.column.selected) {
            this.grid.selectionService.selectColumn(this.column.field, this.grid.columnSelection === GridSelectionMode.single);
        } else {
            this.grid.selectionService.deselectColumn(this.column.field);
        }
        this.grid.notifyChanges();
    }

    /**
     * @hidden @internal
     */
    public columnSelectable() {
        return this.grid?.columnSelection !== GridSelectionMode.none && this.column?.selectable;
    }

    /**
     * @hidden @internal
     */
    public onHideToggle() {
        this.column.hidden = !this.column.hidden;
        this.grid.onColumnVisibilityChanged.emit({ column: this.column, newValue: this.column.hidden });
        this.closeDropdown();
    }

    private areExpressionsSelectable () {
        if (this.expressionsList.length === 1 &&
            (this.expressionsList[0].expression.condition.name === 'equals' ||
                this.expressionsList[0].expression.condition.name === 'true' ||
                this.expressionsList[0].expression.condition.name === 'false' ||
                this.expressionsList[0].expression.condition.name === 'empty' ||
                this.expressionsList[0].expression.condition.name === 'in')) {
            return true;
        }

        const selectableExpressionsCount = this.expressionsList.filter(exp =>
            (exp.beforeOperator === 1 || exp.afterOperator === 1) &&
            (exp.expression.condition.name === 'equals' ||
                exp.expression.condition.name === 'true' ||
                exp.expression.condition.name === 'false' ||
                exp.expression.condition.name === 'empty' ||
                exp.expression.condition.name === 'in')).length;

        return selectableExpressionsCount === this.expressionsList.length;
    }

    private areExpressionsValuesInTheList() {
        if (this.column.dataType === DataType.Boolean) {
            return true;
        }

        if (this.filterValues.size === 1) {
            const firstValue = this.filterValues.values().next().value;

            if (!firstValue && firstValue !== 0) {
                return true;
            }
        }

        for (let index = 0; index < this.uniqueValues.length; index++) {
            if (this.filterValues.has(this.uniqueValues[index])) {
                return true;
            }
        }

        return false;
    }

    private populateColumnData() {
        if (this.grid.uniqueColumnValuesStrategy) {
            this.cdr.detectChanges();
            this.renderColumnValuesRemotely();
        } else {
            this.renderColumnValuesFromData();
        }
    }

    private renderColumnValuesRemotely() {
        this.loadingStart.emit();
        const expressionsTree: FilteringExpressionsTree = this.getColumnFilterExpressionsTree();

        const prevColumn = this.column;
        this.grid.uniqueColumnValuesStrategy(this.column, expressionsTree, (colVals: any[]) => {
            if (!this.column || this.column !== prevColumn) {
                return;
            }

            const columnValues = (this.column.dataType === DataType.Date) ?
                colVals.map(val => val ? val.toDateString() : val) : colVals;

            this.renderValues(columnValues);
            this.loadingEnd.emit();
        });
    }

    private renderColumnValuesFromData() {
        let data = this.column.gridAPI.get_all_data((this.grid as any).id);
        const expressionsTree = this.getColumnFilterExpressionsTree();

        if (expressionsTree.filteringOperands.length) {
            const state = { expressionsTree: expressionsTree };
            data = DataUtil.filter(cloneArray(data), state);
        }

        const columnField = this.column.field;
        const columnValues = (this.column.dataType === DataType.Date) ?
            data.map(record => resolveNestedPath(record, columnField) ?
                resolveNestedPath(record, columnField).toDateString() : resolveNestedPath(record, columnField)) :
            data.map(record => resolveNestedPath(record, columnField));

        this.renderValues(columnValues);
    }

    private renderValues(columnValues: any[]) {
        this.generateUniqueValues(columnValues);
        this.generateFilterValues(this.column.dataType === DataType.Date);
        this.generateListData();
    }

    private generateUniqueValues(columnValues: any[]) {
        if (this.column.dataType === DataType.String && this.column.filteringIgnoreCase) {
            const filteredUniqueValues = columnValues.map(s => s?.toString().toLowerCase())
                .reduce((map, val, i) => map.get(val) ? map : map.set(val, columnValues[i]),
                    new Map);

            this.uniqueValues = Array.from(filteredUniqueValues.values());
        } else {
            this.uniqueValues = Array.from(new Set(columnValues));
        }
    }

    private generateFilterValues(isDateColumn: boolean = false) {
        if (isDateColumn) {
            this.filterValues = new Set<any>(this.expressionsList.reduce((arr, e) => {
                if (e.expression.condition.name === 'in') {
                    return [ ...arr, ...Array.from((e.expression.searchVal as Set<any>).values()).map(v =>
                        new Date(v).toDateString()) ];
                }
                return [ ...arr, ...[e.expression.searchVal ? e.expression.searchVal.toDateString() : e.expression.searchVal] ];
            }, []));
        } else {
            this.filterValues = new Set<any>(this.expressionsList.reduce((arr, e) => {
                if (e.expression.condition.name === 'in') {
                    return [ ...arr, ...Array.from((e.expression.searchVal as Set<any>).values()) ];
                }
                return [ ...arr, ...[e.expression.searchVal] ];
            }, []));
        }
    }

    private generateListData() {
        this.listData = new Array<FilterListItem>();

        const shouldUpdateSelection = this.areExpressionsSelectable() && this.areExpressionsValuesInTheList();

        if (this.column.dataType === DataType.Boolean) {
            this.addBooleanItems();
        } else {
            this.addItems(shouldUpdateSelection);
        }

        this.listData.sort((a, b) => this.sortData(a, b));

        if (this.column.dataType === DataType.Date) {
            this.uniqueValues = this.uniqueValues.map(value => new Date(value));
        }

        if (this.containsNullOrEmpty) {
            this.addBlanksItem(shouldUpdateSelection);
        }

        if (this.listData.length > 0) {
            this.addSelectAllItem();
        }

        if (!(this.cdr as any).destroyed) {
            this.cdr.detectChanges();
        }

        this.listDataLoaded.emit();
    }

    private getColumnFilterExpressionsTree() {
        const gridExpressionsTree: IFilteringExpressionsTree = this.grid.filteringExpressionsTree;
        const expressionsTree = new FilteringExpressionsTree(gridExpressionsTree.operator, gridExpressionsTree.fieldName);

        for (const operand of gridExpressionsTree.filteringOperands) {
            if (operand instanceof FilteringExpressionsTree) {
                const columnExprTree = operand as FilteringExpressionsTree;
                if (columnExprTree.fieldName === this.column.field) {
                    break;
                }
            }
            expressionsTree.filteringOperands.push(operand);
        }

        return expressionsTree;
    }

    private addBooleanItems() {
        this.selectAllSelected = true;
        this.selectAllIndeterminate = false;
        this.uniqueValues.forEach(element => {
            const filterListItem = new FilterListItem();
            if (element !== undefined && element !== null && element !== '') {
                if (this.column.filteringExpressionsTree) {
                    if (element === true && this.expressionsList.find(exp => exp.expression.condition.name === 'true' )) {
                        filterListItem.isSelected = true;
                        filterListItem.isFiltered = true;
                        this.selectAllIndeterminate = true;
                    } else if (element === false && this.expressionsList.find(exp => exp.expression.condition.name === 'false' )) {
                        filterListItem.isSelected = true;
                        filterListItem.isFiltered = true;
                        this.selectAllIndeterminate = true;
                    } else {
                        filterListItem.isSelected = false;
                        filterListItem.isFiltered = false;
                    }
                } else {
                    filterListItem.isSelected = true;
                    filterListItem.isFiltered = true;
                }
                filterListItem.value = element;
                filterListItem.label = element;
                filterListItem.indeterminate = false;
                this.listData.push(filterListItem);
            } else {
                this.containsNullOrEmpty = true;
            }
        });
    }

    private addItems(shouldUpdateSelection: boolean) {
        this.selectAllSelected = true;
        this.selectAllIndeterminate = false;

        this.uniqueValues.forEach(element => {
            if (element !== undefined && element !== null && element !== '') {
                const filterListItem = new FilterListItem();
                if (this.column.filteringExpressionsTree) {
                    if (shouldUpdateSelection) {
                        if (this.filterValues.has(element)) {
                            filterListItem.isSelected = true;
                            filterListItem.isFiltered = true;
                        } else {
                            filterListItem.isSelected = false;
                            filterListItem.isFiltered = false;
                        }
                        this.selectAllIndeterminate = true;
                    } else {
                        filterListItem.isSelected = false;
                        filterListItem.isFiltered = false;
                        this.selectAllSelected = false;
                    }
                } else {
                    filterListItem.isSelected = true;
                    filterListItem.isFiltered = true;
                }
                if (this.column.dataType === DataType.Date) {
                    const date = new Date(element);

                    filterListItem.value = date;

                    filterListItem.label = this.column.formatter ?
                        this.column.formatter(date) :
                        this.grid.datePipe.transform(date);

                } else if (this.column.dataType === DataType.Number) {
                    filterListItem.value = element;

                    filterListItem.label = this.column.formatter ?
                        this.column.formatter(element) :
                        this.grid.decimalPipe.transform(element);

                } else {
                    filterListItem.value = element;

                    filterListItem.label = this.column.formatter ?
                        this.column.formatter(element) :
                        element;
                }

                filterListItem.indeterminate = false;
                this.listData.push(filterListItem);
            } else {
                this.containsNullOrEmpty = true;
            }
        });
    }

    private addSelectAllItem() {
        const selectAll =  new FilterListItem();
        selectAll.isSelected = this.selectAllSelected;
        selectAll.value = this.grid.resourceStrings.igx_grid_excel_select_all;
        selectAll.label = this.grid.resourceStrings.igx_grid_excel_select_all;
        selectAll.indeterminate = this.selectAllIndeterminate;
        selectAll.isSpecial = true;
        selectAll.isFiltered = this.selectAllSelected;
        this.listData.unshift(selectAll);
    }

    private addBlanksItem(shouldUpdateSelection) {
        const blanks =  new FilterListItem();
        if (this.column.filteringExpressionsTree) {
            if (shouldUpdateSelection) {
                if (this.filterValues.has(null)) {
                    blanks.isSelected = true;
                    blanks.isFiltered = true;
                } else {
                    blanks.isSelected = false;
                    blanks.isFiltered = false;
                }
            }
        } else {
            blanks.isSelected = true;
            blanks.isFiltered = true;
        }
        blanks.value = null;
        blanks.label = this.grid.resourceStrings.igx_grid_excel_blanks;
        blanks.indeterminate = false;
        blanks.isSpecial = true;
        blanks.isBlanks = true;
        this.listData.unshift(blanks);
    }

    private sortData(a: FilterListItem, b: FilterListItem) {
        let valueA = a.value;
        let valueB = b.value;
        if (typeof(a) === DataType.String) {
            valueA = a.value.toUpperCase();
            valueB = b.value.toUpperCase();
        }
        if (valueA < valueB) {
            return -1;
        } else if (valueA > valueB) {
            return 1;
        } else {
            return 0;
        }
    }

    // TODO: sort members by access modifier

    /**
     * @hidden @internal
     */
    public cancel() {
        if (!this.overlayComponentId) {
            this.init();
        }
        this.closeDropdown();
    }

    /**
     * @hidden @internal
     */
    public closeDropdown() {
        if (this.overlayComponentId) {
            this.overlayService.hide(this.overlayComponentId);
            this.overlayComponentId = null;
        }
    }

    /**
     * @hidden @internal
     */
    public onKeyDown(eventArgs) {
        if (eventArgs.key === KEYS.ESCAPE || eventArgs.key === KEYS.ESCAPE_IE ||
            eventArgs.ctrlKey && eventArgs.shiftKey && eventArgs.key.toLowerCase() === 'l') {
            this.closeDropdown();
        }
        eventArgs.stopPropagation();
    }

    /**
     * @hidden @internal
     */
    public hide() {
        this._originalDisplay = document.defaultView.getComputedStyle(this.element.nativeElement).display;
        this.element.nativeElement.style.display = 'none';
    }

    /**
     * @hidden @internal
     */
    public detectChanges() {
        this.cdr.detectChanges();
    }
}
