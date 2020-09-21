import { Injectable, OnDestroy, NgModuleRef } from '@angular/core';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IFilteringExpression, FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { IForOfState } from '../../directives/for-of/for_of.directive';
import { IgxColumnComponent } from '../columns/column.component';
import { IFilteringOperation } from '../../data-operations/filtering-condition';
import { GridBaseAPIService } from '../api.service';
import { IColumnResizeEventArgs } from '../common/events';
import { GridType } from '../common/grid.interface';
import { IgxDatePipeComponent } from '../common/pipes';
import { OverlaySettings, PositionSettings, VerticalAlignment } from '../../services/overlay/utilities';
import { IgxOverlayService } from '../../services/overlay/overlay';
import { useAnimation } from '@angular/animations';
import { fadeIn, fadeOut } from '../../animations/main';
import { ExcelStylePositionStrategy } from './excel-style/excel-style-position-strategy';
import { AbsoluteScrollStrategy } from '../../services/overlay/scroll/absolute-scroll-strategy';
import { IgxGridIconService } from '../common/grid-icon.service';
import { GridIconsFeature } from '../common/enums';
import { FILTERING_ICONS_FONT_SET, FILTERING_ICONS} from './grid-filtering-icons';
import { PINNING_ICONS_FONT_SET, PINNING_ICONS} from '../pinning/pinning-icons';
import { IgxGridExcelStyleFilteringComponent } from './excel-style/grid.excel-style-filtering.component';

/**
 * @hidden
 */
export class ExpressionUI {
    public expression: IFilteringExpression;
    public beforeOperator: FilteringLogic;
    public afterOperator: FilteringLogic;
    public isSelected = false;
    public isVisible = true;
}

/**
 * @hidden
 */
@Injectable()
export class IgxFilteringService implements OnDestroy {

    private columnsWithComplexFilter = new Set<string>();
    private areEventsSubscribed = false;
    private destroy$ = new Subject<boolean>();
    private isFiltering = false;
    private columnToExpressionsMap = new Map<string, ExpressionUI[]>();
    private _datePipe: IgxDatePipeComponent;
    private columnStartIndex = -1;
    private _componentOverlayId: string;
    private _filterMenuPositionSettings: PositionSettings;
    private _filterMenuOverlaySettings: OverlaySettings;
    private column;
    private lastActiveNode;

    public isFilterRowVisible = false;
    public filteredColumn: IgxColumnComponent = null;
    public selectedExpression: IFilteringExpression = null;
    public columnToMoreIconHidden = new Map<string, boolean>();
    public activeFilterCell = 0;
    grid: IgxGridBaseDirective;

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>, private _moduleRef: NgModuleRef<any>,
        private iconService: IgxGridIconService,  private _overlayService: IgxOverlayService) {}

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public toggleFilterDropdown(element, column, classRef) {
        if (!this._componentOverlayId || (this.column  && this.column.field !== column.field)) {
            this.column = column;
            const filterIcon = this.column.filteringExpressionsTree ? 'igx-excel-filter__icon--filtered' : 'igx-excel-filter__icon';
            const filterIconTarget = element.querySelector('.' + filterIcon);

            this._filterMenuOverlaySettings.target = filterIconTarget;
            this._filterMenuOverlaySettings.outlet = (this.grid as any).outlet;

            if (this.grid.excelStyleFilteringComponent) {
                this._componentOverlayId =
                    this._overlayService.attach(this.grid.excelStyleFilteringComponent.element, this._filterMenuOverlaySettings);
            } else {
                this._componentOverlayId =
                    this._overlayService.attach(classRef, this._filterMenuOverlaySettings, this._moduleRef);
            }

            this._overlayService.show(this._componentOverlayId, this._filterMenuOverlaySettings);
        }
    }

    public initFilteringSettings() {
        this._filterMenuPositionSettings = {
            verticalStartPoint: VerticalAlignment.Bottom,
            openAnimation: useAnimation(fadeIn, { params: { duration: '250ms' }}),
            closeAnimation: null
        };
        this._filterMenuOverlaySettings = {
            closeOnOutsideClick: true,
            modal: false,
            positionStrategy: new ExcelStylePositionStrategy(this._filterMenuPositionSettings),
            scrollStrategy: new AbsoluteScrollStrategy()
        };
        this._overlayService.onOpening.pipe(
            filter((overlay) => overlay.id === this._componentOverlayId),
            takeUntil(this.destroy$)).subscribe((eventArgs) => {
                const instance = this.grid.excelStyleFilteringComponent ?
                    this.grid.excelStyleFilteringComponent :
                    eventArgs.componentRef.instance as IgxGridExcelStyleFilteringComponent;

                if (instance) {
                    this.lastActiveNode = this.grid.navigation.activeNode;
                    instance.initialize(this.column, this._overlayService, eventArgs.id);
                }
            });

        this._overlayService.onClosed.pipe(
            filter(overlay => overlay.id === this._componentOverlayId),
            takeUntil(this.destroy$)).subscribe((eventArgs) => {
                const instance = this.grid.excelStyleFilteringComponent ?
                    this.grid.excelStyleFilteringComponent :
                    eventArgs.componentRef.instance as IgxGridExcelStyleFilteringComponent;

                if (instance) {
                    instance.column = null;
                }
                this._componentOverlayId = null;
                this.grid.navigation.activeNode = this.lastActiveNode;
                this.grid.theadRow.nativeElement.focus();
            });
    }

    public hideExcelFiltering() {
        if (this._componentOverlayId) {
            this._overlayService.hide(this._componentOverlayId);
        }
    }

    public get datePipe(): IgxDatePipeComponent {
        if (!this._datePipe) {
            this._datePipe = new IgxDatePipeComponent(this.grid.locale);
        }
        return this._datePipe;
    }

    /**
     * Subscribe to grid's events.
     */
    public subscribeToEvents() {
        if (!this.areEventsSubscribed) {
            this.areEventsSubscribed = true;

            this.grid.onColumnResized.pipe(takeUntil(this.destroy$)).subscribe((eventArgs: IColumnResizeEventArgs) => {
                this.updateFilteringCell(eventArgs.column);
            });

            this.grid.parentVirtDir.onChunkLoad.pipe(takeUntil(this.destroy$)).subscribe((eventArgs: IForOfState) => {
                if (eventArgs.startIndex !== this.columnStartIndex) {
                    this.columnStartIndex = eventArgs.startIndex;
                    this.grid.filterCellList.forEach((filterCell) => {
                        filterCell.updateFilterCellArea();
                    });
                }
            });

            this.grid.onColumnMovingEnd.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.grid.filterCellList.forEach((filterCell) => {
                    filterCell.updateFilterCellArea();
                });
            });
        }
    }

    /**
     * Close filtering row if a column is hidden.
     */
    public hideFilteringRowOnColumnVisibilityChange(col: IgxColumnComponent) {
        const filteringRow = this.grid.filteringRow;

        if (filteringRow && filteringRow.column && filteringRow.column === col) {
            filteringRow.close();
        }
    }

    /**
     * Internal method to create expressionsTree and filter grid used in both filter modes.
     */
    public filterInternal(field: string, expressions: FilteringExpressionsTree | Array<ExpressionUI> = null): void {
        this.isFiltering = true;

        let expressionsTree;
        if (expressions instanceof FilteringExpressionsTree) {
            expressionsTree = expressions;
        } else {
            expressionsTree = this.createSimpleFilteringTree(field, expressions);
        }

        if (expressionsTree.filteringOperands.length === 0) {
            this.clearFilter(field);
        } else {
            this.filter(field, null, expressionsTree);
        }

        this.isFiltering = false;
    }

    /**
     * Execute filtering on the grid.
     */
    public filter(field: string, value: any, conditionOrExpressionTree?: IFilteringOperation | IFilteringExpressionsTree,
        ignoreCase?: boolean) {
        const col = this.gridAPI.get_column_by_name(field);
        const filteringIgnoreCase = ignoreCase || (col ? col.filteringIgnoreCase : false);

        if (conditionOrExpressionTree) {
            this.gridAPI.filter(field, value, conditionOrExpressionTree, filteringIgnoreCase);
        } else {
            const expressionsTreeForColumn = this.grid.filteringExpressionsTree.find(field);
            if (!expressionsTreeForColumn) {
                throw new Error('Invalid condition or Expression Tree!');
            } else if (expressionsTreeForColumn instanceof FilteringExpressionsTree) {
                this.gridAPI.filter(field, value, expressionsTreeForColumn, filteringIgnoreCase);
            } else {
                const expressionForColumn = expressionsTreeForColumn as IFilteringExpression;
                this.gridAPI.filter(field, value, expressionForColumn.condition, filteringIgnoreCase);
            }
        }

        // Wait for the change detection to update filtered data through the pipes and then emit the event.
        requestAnimationFrame(() => this.grid.onFilteringDone.emit(col.filteringExpressionsTree));
    }

    /**
     * Clears the filter of a given column if name is provided. Otherwise clears the filters of all columns.
     */
    public clearFilter(field: string): void {
        if (field) {
            const column = this.gridAPI.get_column_by_name(field);
            if (!column) {
                return;
            }
        }

        this.isFiltering = true;

        this.gridAPI.clear_filter(field);

        // Wait for the change detection to update filtered data through the pipes and then emit the event.
        requestAnimationFrame(() => this.grid.onFilteringDone.emit(null));

        if (field) {
            const expressions = this.getExpressions(field);
            expressions.length = 0;
        } else {
            this.grid.columns.forEach(c => {
                const expressions = this.getExpressions(c.field);
                expressions.length = 0;
            });
        }

        this.isFiltering = false;
    }

    /**
     * Filters all the `IgxColumnComponent` in the `IgxGridComponent` with the same condition.
     */
    public filterGlobal(value: any, condition, ignoreCase?) {
        this.gridAPI.filter_global(value, condition, ignoreCase);

        // Wait for the change detection to update filtered data through the pipes and then emit the event.
        requestAnimationFrame(() => this.grid.onFilteringDone.emit(this.grid.filteringExpressionsTree));
    }

    /**
     * Register filtering SVG icons in the icon service.
     */
    public registerSVGIcons(): void {
        this.iconService.registerSVGIcons(GridIconsFeature.Filtering, FILTERING_ICONS, FILTERING_ICONS_FONT_SET);
        this.iconService.registerSVGIcons(GridIconsFeature.RowPinning, PINNING_ICONS, PINNING_ICONS_FONT_SET);
    }

    /**
     * Returns the ExpressionUI array for a given column.
     */
    public getExpressions(columnId: string): ExpressionUI[] {
        if (!this.columnToExpressionsMap.has(columnId)) {
            const column = this.grid.columns.find((col) => col.field === columnId);
            const expressionUIs = new Array<ExpressionUI>();
            if (column) {
                this.generateExpressionsList(column.filteringExpressionsTree, this.grid.filteringExpressionsTree.operator, expressionUIs);
                this.columnToExpressionsMap.set(columnId, expressionUIs);
            }
            return expressionUIs;
        }

        return this.columnToExpressionsMap.get(columnId);
    }

    /**
     * Recreates all ExpressionUIs for all columns. Executed after filtering to refresh the cache.
     */
    public refreshExpressions() {
        if (!this.isFiltering) {
            this.columnsWithComplexFilter.clear();

            this.columnToExpressionsMap.forEach((value: ExpressionUI[], key: string) => {
                const column = this.grid.columns.find((col) => col.field === key);
                if (column) {
                    value.length = 0;

                    this.generateExpressionsList(column.filteringExpressionsTree, this.grid.filteringExpressionsTree.operator, value);

                    const isComplex = this.isFilteringTreeComplex(column.filteringExpressionsTree);
                    if (isComplex) {
                        this.columnsWithComplexFilter.add(key);
                    }

                    this.updateFilteringCell(column);
                } else {
                    this.columnToExpressionsMap.delete(key);
                }
            });
        }
    }

    /**
     * Remove an ExpressionUI for a given column.
     */
    public removeExpression(columnId: string, indexToRemove: number) {
        const expressionsList = this.getExpressions(columnId);

        if (indexToRemove === 0 && expressionsList.length > 1) {
            expressionsList[1].beforeOperator = null;
        } else if (indexToRemove === expressionsList.length - 1) {
            expressionsList[indexToRemove - 1].afterOperator = null;
        } else {
            expressionsList[indexToRemove - 1].afterOperator = expressionsList[indexToRemove + 1].beforeOperator;
            expressionsList[0].beforeOperator = null;
            expressionsList[expressionsList.length - 1].afterOperator = null;
        }

        expressionsList.splice(indexToRemove, 1);
    }

    /**
     * Generate filtering tree for a given column from existing ExpressionUIs.
     */
    public createSimpleFilteringTree(columnId: string, expressionUIList = null): FilteringExpressionsTree {
        const expressionsList = expressionUIList ? expressionUIList : this.getExpressions(columnId);
        const expressionsTree = new FilteringExpressionsTree(FilteringLogic.Or, columnId);
        let currAndBranch: FilteringExpressionsTree;
        let currExpressionUI: ExpressionUI;

        for (let i = 0; i < expressionsList.length; i++) {
            currExpressionUI = expressionsList[i];

            if (!currExpressionUI.expression.condition.isUnary && currExpressionUI.expression.searchVal === null) {
                if (currExpressionUI.afterOperator === FilteringLogic.And && !currAndBranch) {
                    currAndBranch = new FilteringExpressionsTree(FilteringLogic.And, columnId);
                    expressionsTree.filteringOperands.push(currAndBranch);
                }
                continue;
            }

            if ((currExpressionUI.beforeOperator === undefined || currExpressionUI.beforeOperator === null ||
                 currExpressionUI.beforeOperator === FilteringLogic.Or) &&
                currExpressionUI.afterOperator === FilteringLogic.And) {

                currAndBranch = new FilteringExpressionsTree(FilteringLogic.And, columnId);
                expressionsTree.filteringOperands.push(currAndBranch);
                currAndBranch.filteringOperands.push(currExpressionUI.expression);

            } else if (currExpressionUI.beforeOperator === FilteringLogic.And) {
                currAndBranch.filteringOperands.push(currExpressionUI.expression);
            } else {
                expressionsTree.filteringOperands.push(currExpressionUI.expression);
                currAndBranch = null;
            }
        }

        return expressionsTree;
    }

    /**
     * Returns whether a complex filter is applied to a given column.
     */
    public isFilterComplex(columnId: string) {
        if (this.columnsWithComplexFilter.has(columnId)) {
            return true;
        }

        const column = this.grid.columns.find((col) => col.field === columnId);
        const isComplex = column && this.isFilteringTreeComplex(column.filteringExpressionsTree);
        if (isComplex) {
            this.columnsWithComplexFilter.add(columnId);
        }

        return isComplex;
    }

    /**
     * Returns the string representation of the FilteringLogic operator.
     */
    public getOperatorAsString(operator: FilteringLogic): any {
        if (operator === 0) {
            return this.grid.resourceStrings.igx_grid_filter_operator_and;
        } else {
            return this.grid.resourceStrings.igx_grid_filter_operator_or;
        }
    }

    /**
     * Generate the label of a chip from a given filtering expression.
     */
    public getChipLabel(expression: IFilteringExpression): any {
        if (expression.condition.isUnary) {
            return this.grid.resourceStrings[`igx_grid_filter_${expression.condition.name}`] || expression.condition.name;
        } else if (expression.searchVal instanceof Date) {
            return this.datePipe.transform(expression.searchVal, this.grid.locale);
        } else {
            return expression.searchVal;
        }
    }

    /**
     * Updates the content of a filterCell.
     */
    public updateFilteringCell(column: IgxColumnComponent) {
        const filterCell = column.filterCell;
        if (filterCell) {
            filterCell.updateFilterCellArea();
        }
    }

    public get filteredData() {
        return this.grid.filteredData;
    }

    private isFilteringTreeComplex(expressions: IFilteringExpressionsTree | IFilteringExpression): boolean {
        if (!expressions) {
            return false;
        }

        if (expressions instanceof FilteringExpressionsTree) {
            const expressionsTree = expressions as FilteringExpressionsTree;
            if (expressionsTree.operator === FilteringLogic.Or) {
                const andOperatorsCount = this.getChildAndOperatorsCount(expressionsTree);

                // having more that 'And' and operator in the sub-tree means that the filter could not be represented without parentheses.
                return andOperatorsCount > 1;
            }

            let isComplex = false;
            for (let i = 0; i < expressionsTree.filteringOperands.length; i++) {
                isComplex = isComplex || this.isFilteringTreeComplex(expressionsTree.filteringOperands[i]);
            }

            return isComplex;
        }

        return false;
    }

    private getChildAndOperatorsCount(expressions: IFilteringExpressionsTree): number {
        let count = 0;
        let operand;
        for (let i = 0; i < expressions.filteringOperands.length; i++) {
            operand = expressions[i];
            if (operand instanceof FilteringExpressionsTree) {
                if (operand.operator === FilteringLogic.And) {
                    count++;
                }

                count = count + this.getChildAndOperatorsCount(operand);
            }
        }

        return count;
    }

    public generateExpressionsList(expressions: IFilteringExpressionsTree | IFilteringExpression,
        operator: FilteringLogic,
        expressionsUIs: ExpressionUI[]): void {
        this.generateExpressionsListRecursive(expressions, operator, expressionsUIs);

        // The beforeOperator of the first expression and the afterOperator of the last expression should be null
        if (expressionsUIs.length) {
            expressionsUIs[expressionsUIs.length - 1].afterOperator = null;
        }
    }

    private generateExpressionsListRecursive(expressions: IFilteringExpressionsTree | IFilteringExpression,
                                    operator: FilteringLogic,
                                    expressionsUIs: ExpressionUI[]): void {
        if (!expressions) {
            return;
        }

        if (expressions instanceof FilteringExpressionsTree) {
            const expressionsTree = expressions as FilteringExpressionsTree;
            for (let i = 0; i < expressionsTree.filteringOperands.length; i++) {
                this.generateExpressionsListRecursive(expressionsTree.filteringOperands[i], expressionsTree.operator, expressionsUIs);
            }
            if (expressionsUIs.length) {
                expressionsUIs[expressionsUIs.length - 1].afterOperator = operator;
            }
        } else {
            const exprUI = new ExpressionUI();
            exprUI.expression = expressions as IFilteringExpression;
            exprUI.afterOperator = operator;

            const prevExprUI = expressionsUIs[expressionsUIs.length - 1];
            if (prevExprUI) {
                exprUI.beforeOperator = prevExprUI.afterOperator;
            }

            expressionsUIs.push(exprUI);
        }
    }

    public isFilteringExpressionsTreeEmpty(expressionTree: IFilteringExpressionsTree): boolean {
        if (FilteringExpressionsTree.empty(expressionTree)) {
            return true;
        }

        let expr: any;

        for (let i = 0; i < expressionTree.filteringOperands.length; i++) {
            expr = expressionTree.filteringOperands[i];

            if ((expr instanceof FilteringExpressionsTree)) {
                const exprTree = expr as FilteringExpressionsTree;
                if (exprTree.filteringOperands && exprTree.filteringOperands.length) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    }
}
