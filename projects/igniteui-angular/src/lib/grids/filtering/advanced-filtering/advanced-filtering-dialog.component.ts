import {
    Component, Input, ViewChild, ChangeDetectorRef, ViewChildren, QueryList, ElementRef, AfterViewInit, OnDestroy, HostBinding
} from '@angular/core';
import { VerticalAlignment, HorizontalAlignment, Point, OverlaySettings } from '../../../services/overlay/utilities';
import { ConnectedPositioningStrategy } from '../../../services/overlay/position/connected-positioning-strategy';
import { IgxFilteringService } from '../grid-filtering.service';
import { IgxOverlayService } from '../../../services/overlay/overlay';
import { IgxGridBaseComponent, IgxColumnComponent } from '../../grid';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../../data-operations/filtering-expressions-tree';
import { FilteringLogic, IFilteringExpression } from '../../../data-operations/filtering-expression.interface';
import { IgxChipComponent } from '../../../chips/chip.component';
import { IgxSelectComponent } from '../../../select/select.component';
import { IDragStartEventArgs, IDragBaseEventArgs } from '../../../directives/drag-drop/drag-drop.directive';
import { CloseScrollStrategy } from '../../../services/overlay/scroll/close-scroll-strategy';
import { IgxToggleDirective, IgxOverlayOutletDirective } from '../../../directives/toggle/toggle.directive';
import { IButtonGroupEventArgs } from '../../../buttonGroup/buttonGroup.component';
import { takeUntil, first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { KEYS } from '../../../core/utils';
import { AbsoluteScrollStrategy, AutoPositionStrategy } from '../../../services/index';

/**
 *@hidden
 */
class ExpressionItem {
    constructor(parent?: ExpressionGroupItem) {
        this.parent = parent;
    }
    parent: ExpressionGroupItem;
    selected: boolean;
}

/**
 *@hidden
 */
class ExpressionGroupItem extends ExpressionItem {
    constructor(operator: FilteringLogic, parent?: ExpressionGroupItem) {
        super(parent);
        this.operator = operator;
        this.children = [];
    }
    operator: FilteringLogic;
    children: ExpressionItem[];
}

/**
 *@hidden
 */
class ExpressionOperandItem extends ExpressionItem {
    constructor(expression: IFilteringExpression, parent: ExpressionGroupItem) {
        super(parent);
        this.expression = expression;
    }
    expression: IFilteringExpression;
    inEditMode: boolean;
    inAddMode: boolean;
    hovered: boolean;
}

/**
 * @hidden
 */
@Component({
    selector: 'igx-advanced-filtering-dialog',
    templateUrl: './advanced-filtering-dialog.component.html'
})
export class IgxAdvancedFilteringDialogComponent implements AfterViewInit, OnDestroy {
    @Input()
    public filteringService: IgxFilteringService;

    @Input()
    public overlayComponentId: string;

    @Input()
    public overlayService: IgxOverlayService;

    public rootGroup: ExpressionGroupItem;

    public selectedExpressions: ExpressionOperandItem[] = [];

    public selectedGroups: ExpressionGroupItem[] = [];

    public currentGroup: ExpressionGroupItem;

    public editedExpression: ExpressionOperandItem;

    public addModeExpression: ExpressionOperandItem;

    public contextualGroup: ExpressionGroupItem;

    public filteringLogics;

    public selectedCondition: string;
    public searchValue: any;

    public _positionSettings = {
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalStartPoint: VerticalAlignment.Top
    };
    public _overlaySettings: OverlaySettings = {
        closeOnOutsideClick: false,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy(this._positionSettings),
        scrollStrategy: new CloseScrollStrategy()
    };

    public columnSelectOverlaySettings: OverlaySettings = {
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: false,
        excludePositionTarget: true
    };

    public conditionSelectOverlaySettings: OverlaySettings = {
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: false,
        excludePositionTarget: true
    };

    @ViewChild('columnSelect', { read: IgxSelectComponent, static: false })
    public columnSelect: IgxSelectComponent;

    @ViewChild('conditionSelect', { read: IgxSelectComponent, static: false })
    public conditionSelect: IgxSelectComponent;

    @ViewChild('searchValueInput', { read: ElementRef, static: false })
    public searchValueInput: ElementRef;

    @ViewChild('addRootAndGroupButton', { read: ElementRef, static: false })
    public addRootAndGroupButton: ElementRef;

    @ViewChild('addConditionButton', { read: ElementRef, static: false })
    public addConditionButton: ElementRef;

    @ViewChild('editingInputsContainer', { read: ElementRef, static: false })
    public set editingInputsContainer(value: ElementRef) {
        if ((value && !this._editingInputsContainer) ||
            (value && this._editingInputsContainer && this._editingInputsContainer.nativeElement !== value.nativeElement)) {
            requestAnimationFrame(() => {
                this.scrollElementIntoView(value.nativeElement);
            });
        }

        this._editingInputsContainer = value;
    }

    public get editingInputsContainer(): ElementRef {
        return this._editingInputsContainer;
    }

    @ViewChild('addModeContainer', { read: ElementRef, static: false })
    public set addModeContainer(value: ElementRef) {
        if ((value && !this._addModeContainer) ||
            (value && this._addModeContainer && this._addModeContainer.nativeElement !== value.nativeElement)) {
            requestAnimationFrame(() => {
                this.scrollElementIntoView(value.nativeElement);
            });
        }

        this._addModeContainer = value;
    }

    public get addModeContainer(): ElementRef {
        return this._addModeContainer;
    }

    @ViewChild('currentGroupButtonsContainer', { read: ElementRef, static: false })
    public set currentGroupButtonsContainer(value: ElementRef) {
        if ((value && !this._currentGroupButtonsContainer) ||
            (value && this._currentGroupButtonsContainer && this._currentGroupButtonsContainer.nativeElement !== value.nativeElement)) {
            requestAnimationFrame(() => {
                this.scrollElementIntoView(value.nativeElement);
            });
        }

        this._currentGroupButtonsContainer = value;
    }

    public get currentGroupButtonsContainer(): ElementRef {
        return this._currentGroupButtonsContainer;
    }

    @ViewChild(IgxToggleDirective, { static: true })
    public contextMenuToggle: IgxToggleDirective;

    @ViewChildren(IgxChipComponent)
    public chips: QueryList<IgxChipComponent>;

    @ViewChild('expressionsContainer', { static: true })
    protected expressionsContainer: ElementRef;

    @ViewChild('overlayOutlet', { read: IgxOverlayOutletDirective, static: true })
    public overlayOutlet: IgxOverlayOutletDirective;

    @HostBinding('style.display')
    display = 'block';

    private destroy$ = new Subject<any>();
    private _selectedColumn: IgxColumnComponent;
    private _clickTimer;
    private _dblClickDelay = 200;
    private _preventChipClick = false;
    private _editingInputsContainer: ElementRef;
    private _addModeContainer: ElementRef;
    private _currentGroupButtonsContainer: ElementRef;

    constructor(private element: ElementRef, public cdr: ChangeDetectorRef) { }

    public ngAfterViewInit(): void {
        this._overlaySettings.outlet = this.overlayOutlet;
        this.columnSelectOverlaySettings.outlet = this.overlayOutlet;
        this.conditionSelectOverlaySettings.outlet = this.overlayOutlet;

        this.contextMenuToggle.onClosed.pipe(takeUntil(this.destroy$)).subscribe((args) => {
            this.contextualGroup = null;
        });
    }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public get displayDensity() {
        return this.grid.displayDensity;
    }

    public get selectedColumn(): IgxColumnComponent {
        return this._selectedColumn;
    }

    public set selectedColumn(value: IgxColumnComponent) {
        const oldValue = this._selectedColumn;

        if (this._selectedColumn !== value) {
            this._selectedColumn = value;
            if (oldValue && this._selectedColumn && this._selectedColumn.dataType !== oldValue.dataType) {
                this.selectedCondition = null;
                this.searchValue = null;
                this.cdr.detectChanges();
            }
        }
    }

    get grid(): IgxGridBaseComponent {
        return this.filteringService.grid;
    }

    get filterableColumns(): IgxColumnComponent[] {
        return this.grid.columns.filter((col) => !col.columnGroup && col.filterable);
    }

    public dragStart(dragArgs: IDragStartEventArgs) {
        if (!this.contextMenuToggle.collapsed) {
            this.contextMenuToggle.element.style.display = 'none';
        }
    }

    public dragEnd(dragArgs: IDragBaseEventArgs) {
        if (!this.contextMenuToggle.collapsed) {
            this.calculateContextMenuTarget();
            this.contextMenuToggle.reposition();
            this.contextMenuToggle.element.style.display = '';
        }
    }

    public addCondition(parent: ExpressionGroupItem, afterExpression?: ExpressionItem) {
        this.cancelOperandAdd();

        const operandItem = new ExpressionOperandItem({
            fieldName: null,
            condition: null,
            ignoreCase: true,
            searchVal: null
        }, parent);

        if (afterExpression) {
            const index = parent.children.indexOf(afterExpression);
            parent.children.splice(index + 1, 0, operandItem);
        } else {
            parent.children.push(operandItem);
        }

        this.enterExpressionEdit(operandItem);
    }

    public addAndGroup(parent?: ExpressionGroupItem, afterExpression?: ExpressionItem) {
        this.addGroup(FilteringLogic.And, parent, afterExpression);
    }

    public addOrGroup(parent?: ExpressionGroupItem, afterExpression?: ExpressionItem) {
        this.addGroup(FilteringLogic.Or, parent, afterExpression);
    }

    public endGroup(groupItem: ExpressionGroupItem) {
        this.currentGroup = groupItem.parent;
    }

    public commitOperandEdit() {
        if (this.editedExpression) {
            this.editedExpression.expression.fieldName = this.selectedColumn.field;
            this.editedExpression.expression.condition = this.selectedColumn.filters.condition(this.selectedCondition);
            this.editedExpression.expression.searchVal = this.searchValue;

            this.editedExpression.inEditMode = false;
            this.editedExpression = null;
        }
    }

    public cancelOperandAdd() {
        if (this.addModeExpression) {
            this.addModeExpression.inAddMode = false;
            this.addModeExpression = null;
        }
    }

    public cancelOperandEdit() {
        if (this.editedExpression) {
            this.editedExpression.inEditMode = false;

            if (!this.editedExpression.expression.fieldName) {
                this.deleteItem(this.editedExpression);
            }

            this.editedExpression = null;
        }
    }

    public operandCanBeCommitted(): boolean {
        return this.selectedColumn && this.selectedCondition &&
            (!!this.searchValue || this.selectedColumn.filters.condition(this.selectedCondition).isUnary);
    }

    public exitOperandEdit() {
        if (!this.editedExpression) {
            return;
        }

        if (this.operandCanBeCommitted()) {
            this.commitOperandEdit();
        } else {
            this.cancelOperandEdit();
        }
    }

    public isExpressionGroup(expression: ExpressionItem): boolean {
        return expression instanceof ExpressionGroupItem;
    }

    private addGroup(operator: FilteringLogic, parent?: ExpressionGroupItem, afterExpression?: ExpressionItem) {
        this.cancelOperandAdd();

        const groupItem = new ExpressionGroupItem(operator, parent);

        if (parent) {
            if (afterExpression) {
                const index = parent.children.indexOf(afterExpression);
                parent.children.splice(index + 1, 0, groupItem);
            } else {
                parent.children.push(groupItem);
            }
        } else {
            this.rootGroup = groupItem;
        }

        this.addCondition(groupItem);
        this.currentGroup = groupItem;
    }

    private createExpressionGroupItem(expressionTree: IFilteringExpressionsTree, parent?: ExpressionGroupItem): ExpressionGroupItem {
        let groupItem: ExpressionGroupItem;
        if (expressionTree) {
            groupItem = new ExpressionGroupItem(expressionTree.operator, parent);

            for (const expr of expressionTree.filteringOperands) {
                if (expr instanceof FilteringExpressionsTree) {
                    groupItem.children.push(this.createExpressionGroupItem(expr, groupItem));
                } else {
                    const filteringExpr = expr as IFilteringExpression;
                    const exprCopy: IFilteringExpression = {
                        fieldName: filteringExpr.fieldName,
                        condition: filteringExpr.condition,
                        searchVal: filteringExpr.searchVal,
                        ignoreCase: filteringExpr.ignoreCase
                    };
                    const operandItem = new ExpressionOperandItem(exprCopy, groupItem);
                    groupItem.children.push(operandItem);
                }
            }
        }

        return groupItem;
    }

    private createExpressionsTreeFromGroupItem(groupItem: ExpressionGroupItem): FilteringExpressionsTree {
        if (!groupItem) {
            return null;
        }

        const expressionsTree = new FilteringExpressionsTree(groupItem.operator);

        for (const item of groupItem.children) {
            if (item instanceof ExpressionGroupItem) {
                const subTree = this.createExpressionsTreeFromGroupItem((item as ExpressionGroupItem));
                expressionsTree.filteringOperands.push(subTree);
            } else {
                expressionsTree.filteringOperands.push((item as ExpressionOperandItem).expression);
            }
        }

        return expressionsTree;
    }

    public onChipRemove(expressionItem: ExpressionItem) {
       this.deleteItem(expressionItem);
    }

    public onChipClick(expressionItem: ExpressionOperandItem) {
        this._clickTimer = setTimeout(() => {
            if (!this._preventChipClick) {
                this.onToggleExpression(expressionItem);
            }
            this._preventChipClick = false;
        }, this._dblClickDelay);
    }

    public onChipDblClick(expressionItem: ExpressionOperandItem) {
        clearTimeout(this._clickTimer);
        this._preventChipClick = true;
        this.enterExpressionEdit(expressionItem);
    }

    public enterExpressionEdit(expressionItem: ExpressionOperandItem) {
        this.clearSelection();
        this.exitOperandEdit();
        this.cancelOperandAdd();

        if (this.editedExpression) {
            this.editedExpression.inEditMode = false;
        }

        expressionItem.hovered = false;

        this.selectedColumn = expressionItem.expression.fieldName ?
            this.grid.getColumnByName(expressionItem.expression.fieldName) : null;
        this.selectedCondition = expressionItem.expression.condition ?
            expressionItem.expression.condition.name : null;
        this.searchValue = expressionItem.expression.searchVal;

        expressionItem.inEditMode = true;
        this.editedExpression = expressionItem;

        this.cdr.detectChanges();

        this.columnSelectOverlaySettings.positionStrategy = new AutoPositionStrategy({target: this.columnSelect.element});
        this.conditionSelectOverlaySettings.positionStrategy = new AutoPositionStrategy({target: this.conditionSelect.element});

        if (!this.selectedColumn) {
            this.columnSelect.input.nativeElement.focus();
        } else if (this.selectedColumn.filters.condition(this.selectedCondition).isUnary) {
            this.conditionSelect.input.nativeElement.focus();
        } else {
            this.searchValueInput.nativeElement.focus();
        }
    }

    public clearSelection() {
        for (const group of this.selectedGroups) {
            group.selected = false;
        }
        this.selectedGroups = [];

        for (const expr of this.selectedExpressions) {
            expr.selected = false;
        }
        this.selectedExpressions = [];

        this.toggleContextMenu();
    }

    public enterExpressionAdd(expressionItem: ExpressionOperandItem) {
        this.clearSelection();
        this.exitOperandEdit();

        if (this.addModeExpression) {
            this.addModeExpression.inAddMode = false;
        }

        expressionItem.inAddMode = true;
        this.addModeExpression = expressionItem;
        if (expressionItem.selected) {
            this.toggleExpression(expressionItem);
        }
    }

    private onToggleExpression(expressionItem: ExpressionOperandItem) {
        this.exitOperandEdit();
        this.toggleExpression(expressionItem);

        this.toggleContextMenu();
    }

    private toggleExpression(expressionItem: ExpressionOperandItem) {
        expressionItem.selected = !expressionItem.selected;

        if (expressionItem.selected) {
            this.selectedExpressions.push(expressionItem);
        } else {
            const index = this.selectedExpressions.indexOf(expressionItem);
            this.selectedExpressions.splice(index, 1);
            this.deselectParentRecursive(expressionItem);
        }
    }

    private toggleContextMenu() {
        const contextualGroup = this.findSingleSelectedGroup();

        if (contextualGroup || this.selectedExpressions.length > 1) {
            this.contextualGroup = contextualGroup;

            if (contextualGroup) {
                this.filteringLogics = [
                    {
                        label: this.grid.resourceStrings.igx_grid_filter_operator_and,
                        selected: contextualGroup.operator === FilteringLogic.And
                    },
                    {
                        label: this.grid.resourceStrings.igx_grid_filter_operator_or,
                        selected: contextualGroup.operator === FilteringLogic.Or
                    }
                ];
            }
        } else {
            this.contextMenuToggle.close();
        }
    }

    private findSingleSelectedGroup(): ExpressionGroupItem {
        for (const group of this.selectedGroups) {
            const containsAllSelectedExpressions = this.selectedExpressions.every(op => this.isInsideGroup(op, group));

            if (containsAllSelectedExpressions) {
                return group;
            }
        }

        return null;
    }

    private isInsideGroup(item: ExpressionItem, group: ExpressionGroupItem): boolean {
        if (!item) {
            return false;
        }

        if (item.parent === group) {
            return true;
        }

        return this.isInsideGroup(item.parent, group);
    }

    private deleteItem(expressionItem: ExpressionItem) {
        if (!expressionItem.parent) {
            this.rootGroup = null;
            this.currentGroup = null;
            return;
        }

        if (expressionItem === this.currentGroup) {
            this.currentGroup = this.currentGroup.parent;
        }

        const children = expressionItem.parent.children;
        const index = children.indexOf(expressionItem);
        children.splice(index, 1);

        if (!children.length) {
            this.deleteItem(expressionItem.parent);
        }
    }

    public onKeyDown(eventArgs: KeyboardEvent) {
        eventArgs.stopPropagation();
        if (!this.contextMenuToggle.collapsed &&
            (eventArgs.key === KEYS.ESCAPE || eventArgs.key === KEYS.ESCAPE_IE)) {
            this.clearSelection();
        }
    }

    public createAndGroup() {
        this.createGroup(FilteringLogic.And);
    }

    public createOrGroup() {
        this.createGroup(FilteringLogic.Or);
    }

    private createGroup(operator: FilteringLogic) {
        const chips = this.chips.toArray();
        const minIndex = this.selectedExpressions.reduce((i, e) => Math.min(i, chips.findIndex(c => c.data === e)), Number.MAX_VALUE);
        const firstExpression = chips[minIndex].data;

        const parent = firstExpression.parent;
        const groupItem = new ExpressionGroupItem(operator, parent);

        const index = parent.children.indexOf(firstExpression);
        parent.children.splice(index, 0, groupItem);

        for (const expr of this.selectedExpressions) {
            this.deleteItem(expr);
            groupItem.children.push(expr);
            expr.parent = groupItem;
        }

        this.clearSelection();
    }

    public deleteFilters() {
        for (const expr of this.selectedExpressions) {
            this.deleteItem(expr);
        }

        this.clearSelection();
    }

    public onGroupClick(groupItem: ExpressionGroupItem) {
        this.toggleGroup(groupItem);
    }

    private toggleGroup(groupItem: ExpressionGroupItem) {
        this.exitOperandEdit();
        if (groupItem.children && groupItem.children.length) {
            this.toggleGroupRecursive(groupItem, !groupItem.selected);
            if (!groupItem.selected) {
                this.deselectParentRecursive(groupItem);
            }
            this.toggleContextMenu();
        }
    }

    private toggleGroupRecursive(groupItem: ExpressionGroupItem, selected: boolean) {
        if (groupItem.selected !== selected) {
            groupItem.selected = selected;

            if (groupItem.selected) {
                this.selectedGroups.push(groupItem);
            } else {
                const index = this.selectedGroups.indexOf(groupItem);
                this.selectedGroups.splice(index, 1);
            }
        }

        for (const expr of groupItem.children) {
            if (expr instanceof ExpressionGroupItem) {
                this.toggleGroupRecursive(expr, selected);
            } else {
                const operandExpression = expr as ExpressionOperandItem;
                if (operandExpression.selected !== selected) {
                    this.toggleExpression(operandExpression);
                }
            }
        }
    }

    private deselectParentRecursive(expressionItem: ExpressionItem) {
        const parent = expressionItem.parent;
        if (parent) {
            if (parent.selected) {
                parent.selected = false;
                const index = this.selectedGroups.indexOf(parent);
                this.selectedGroups.splice(index, 1);
            }
            this.deselectParentRecursive(parent);
        }
    }

    private calculateContextMenuTarget() {
        const containerRect = this.expressionsContainer.nativeElement.getBoundingClientRect();
        const chips = this.chips.filter(c => this.selectedExpressions.indexOf(c.data) !== -1);
        let minTop = chips.reduce((t, c) =>
            Math.min(t, c.elementRef.nativeElement.getBoundingClientRect().top), Number.MAX_VALUE);
        minTop = Math.max(containerRect.top, minTop);
        minTop = Math.min(containerRect.bottom, minTop);
        let maxRight = chips.reduce((r, c) =>
            Math.max(r, c.elementRef.nativeElement.getBoundingClientRect().right), 0);
        maxRight = Math.max(maxRight, containerRect.left);
        maxRight = Math.min(maxRight, containerRect.right);
        this._overlaySettings.positionStrategy.settings.target = new Point(maxRight, minTop);
    }

    private scrollElementIntoView(target: HTMLElement) {
        const container = this.expressionsContainer.nativeElement;
        const targetOffset = target.offsetTop - container.offsetTop;
        const delta = 10;

        if (container.scrollTop + delta > targetOffset) {
            container.scrollTop = targetOffset - delta;
        } else if (container.scrollTop + container.clientHeight < targetOffset + target.offsetHeight + delta) {
            container.scrollTop = targetOffset + target.offsetHeight + delta - container.clientHeight;
        }
    }

    public ungroup() {
        const selectedGroup = this.contextualGroup;
        const parent = selectedGroup.parent;
        if (parent) {
            const index = parent.children.indexOf(selectedGroup);
            parent.children.splice(index, 1, ...selectedGroup.children);

            for (const expr of selectedGroup.children) {
                expr.parent = parent;
            }
        }

        this.clearSelection();
    }

    public deleteGroup() {
        const selectedGroup = this.contextualGroup;
        const parent = selectedGroup.parent;
        if (parent) {
            const index = parent.children.indexOf(selectedGroup);
            parent.children.splice(index, 1);
        } else {
            this.rootGroup = null;
        }

        this.clearSelection();
    }

    public selectFilteringLogic(event: IButtonGroupEventArgs) {
        this.contextualGroup.operator = event.index as FilteringLogic;
    }

    public getConditionFriendlyName(name: string): string {
        return this.grid.resourceStrings[`igx_grid_filter_${name}`] || name;
    }

    public isDate(value: any) {
        return value instanceof Date;
    }

    public onExpressionsScrolled() {
        if (!this.contextMenuToggle.collapsed) {
            this.calculateContextMenuTarget();
            this.contextMenuToggle.reposition();
        }
    }

    public invokeClick(eventArgs: KeyboardEvent) {
        if (eventArgs.key === KEYS.ENTER || eventArgs.key === KEYS.SPACE || eventArgs.key === KEYS.SPACE_IE) {
            eventArgs.preventDefault();
            (eventArgs.currentTarget as HTMLElement).click();
        }
    }

    public onOutletPointerDown(event) {
        // This prevents closing the select's dropdown when clicking the scroll
        event.preventDefault();
    }

    public getConditionList(): string[] {
        return this.selectedColumn ? this.selectedColumn.filters.conditionList() : [];
    }

    public initialize(filteringService: IgxFilteringService, overlayService: IgxOverlayService,
        overlayComponentId: string) {
        this.filteringService = filteringService;
        this.overlayService = overlayService;
        this.overlayComponentId = overlayComponentId;

        this.filteringService.registerSVGIcons();

        // Set pointer-events to none of the overlay content element which blocks the grid interaction after dragging
        this.overlayService.onOpened.pipe(first()).subscribe(() => {
            if (this.element.nativeElement.parentElement) {
                this.element.nativeElement.parentElement.style['pointer-events'] = 'none';
            }
        });

        if (this.grid.advancedFilteringExpressionsTree) {
            this.rootGroup = this.createExpressionGroupItem(this.grid.advancedFilteringExpressionsTree);
            this.currentGroup = this.rootGroup;
        }
    }

    /**
     * @hidden @internal
     */
    public setAddButtonFocus() {
        if (this.addRootAndGroupButton) {
            this.addRootAndGroupButton.nativeElement.focus();
        } else if (this.addConditionButton) {
            this.addConditionButton.nativeElement.focus();
        }
    }

    public context(expression: ExpressionItem, afterExpression?: ExpressionItem) {
        return {
            $implicit: expression,
            afterExpression
        };
    }

    public onClearButtonClick() {
        this.clearSelection();
        this.cancelOperandAdd();
        this.cancelOperandEdit();
        this.currentGroup = null;
        this.rootGroup = null;
        this.grid.advancedFilteringExpressionsTree = null;
    }

    public closeDialog() {
        if (this.overlayComponentId) {
            this.overlayService.hide(this.overlayComponentId);
        }
    }

    public applyChanges() {
        this.exitOperandEdit();
        this.grid.advancedFilteringExpressionsTree = this.createExpressionsTreeFromGroupItem(this.rootGroup);
    }

    public onApplyButtonClick() {
        this.applyChanges();
        this.closeDialog();
    }

    public onChipSelectionEnd() {
        const contextualGroup = this.findSingleSelectedGroup();
        if (contextualGroup || this.selectedExpressions.length > 1) {
            this.contextualGroup = contextualGroup;
            this.calculateContextMenuTarget();
            if (this.contextMenuToggle.collapsed) {
                this.contextMenuToggle.open(this._overlaySettings);
            } else {
                this.contextMenuToggle.reposition();
            }
        }
    }
}
