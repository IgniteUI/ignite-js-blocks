import {
    Component,
    ChangeDetectionStrategy,
    AfterViewInit,
    Input,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    ViewChild,
    OnDestroy
} from '@angular/core';
import { IgxColumnComponent } from '../../column.component';
import { ExpressionUI } from '../grid-filtering.service';
import { IgxButtonGroupComponent } from '../../../buttonGroup/buttonGroup.component';
import { IgxDropDownItemComponent, IgxDropDownComponent } from '../../../drop-down';
import { IgxInputGroupComponent, IgxInputDirective } from '../../../input-group';
import { DataType } from '../../../data-operations/data-util';
import { IFilteringOperation } from '../../../data-operations/filtering-condition';
import { OverlaySettings, ConnectedPositioningStrategy, CloseScrollStrategy } from '../../../services';
import { KEYS } from '../../../core/utils';
import { FilteringLogic } from '../../../data-operations/filtering-expression.interface';
import { IgxGridBaseComponent } from '../../grid';
import { IgxForOfDirective } from '../../../directives/for-of/for_of.directive';
import { IgxExcelStyleDropDownComponent } from './excel-style-drop-down.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * @hidden
 */
export interface ILogicOperatorChangedArgs {
    target: ExpressionUI;
    newValue: FilteringLogic;
}

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-excel-style-default-expression',
    templateUrl: './excel-style-default-expression.component.html'
})
export class IgxExcelStyleDefaultExpressionComponent implements AfterViewInit, OnDestroy {

    private _dropDownOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy(),
        scrollStrategy: new CloseScrollStrategy()
    };

    protected _isDropdownValuesOpening = false;
    protected _isDropdownOpened = false;
    protected _valuesData: any[];
    protected _scrollTop = 0;
    protected destroy$ = new Subject<boolean>();

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public columnData: any[];

    @Input()
    public expressionUI: ExpressionUI;

    @Input()
    public expressionsList: Array<ExpressionUI>;

    @Input()
    public grid: IgxGridBaseComponent;

    @Output()
    public onExpressionRemoved = new EventEmitter<ExpressionUI>();

    @Output()
    public onLogicOperatorChanged = new EventEmitter<ILogicOperatorChangedArgs>();

    @ViewChild('inputGroupValues', { read: IgxInputGroupComponent })
    protected inputGroupValues: IgxInputGroupComponent;

    @ViewChild('inputGroupConditions', { read: IgxInputGroupComponent })
    private inputGroupConditions: IgxInputGroupComponent;

    @ViewChild('inputValues', { read: IgxInputDirective })
    protected inputValuesDirective: IgxInputDirective;

    @ViewChild('dropdownValues', { read: IgxExcelStyleDropDownComponent })
    protected dropdownValues: IgxExcelStyleDropDownComponent;

    @ViewChild('dropdownConditions', { read: IgxDropDownComponent })
    protected dropdownConditions: IgxDropDownComponent;

    @ViewChild('logicOperatorButtonGroup', { read: IgxButtonGroupComponent })
    protected logicOperatorButtonGroup: IgxButtonGroupComponent;

    @ViewChild(IgxForOfDirective)
    protected valuesForOfDirective: IgxForOfDirective<IgxDropDownItemComponent>;

    protected get inputValuesElement() {
        return this.inputValuesDirective;
    }

    get isLast(): boolean {
        return this.expressionsList[this.expressionsList.length - 1] === this.expressionUI;
    }

    get isSingle(): boolean {
        return this.expressionsList.length === 1;
    }

    get inputConditionsPlaceholder(): string {
        return this.grid.resourceStrings['igx_grid_filter_condition_placeholder'];
    }

    get inputValuePlaceholder(): string {
        return this.grid.resourceStrings['igx_grid_filter_row_placeholder'];
    }

    get valuesData(): any[] {
        if (!this._valuesData) {
            this._valuesData = this.columnData.filter(x => x !== null && x !== undefined && x !== '');
        }

        return this._valuesData;
    }

    constructor(public cdr: ChangeDetectorRef) {}

    ngAfterViewInit(): void {
        this._dropDownOverlaySettings.outlet = this.column.grid.outletDirective;

        this.valuesForOfDirective.onChunkLoad.pipe(takeUntil(this.destroy$)).subscribe(() => {
            const isSearchValNumber = typeof (this.valuesForOfDirective.igxForOf[0]) === 'number';
            if (isSearchValNumber) {
                const searchVal = parseFloat(this.expressionUI.expression.searchVal);
                const selectedItemIndex = this.dropdownValues.items.findIndex(x => x.value === searchVal);

                if (selectedItemIndex !== -1) {
                    this.dropdownValues.setSelectedItem(selectedItemIndex);
                } else if (this.dropdownValues.selectedItem) {
                    this.dropdownValues.selectedItem.selected = false;
                }
            }
        });
    }

    public ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public focus() {
        // use requestAnimationFrame to focus the values input because when initializing the component
        // datepicker's input group is not yet fully initialized
        requestAnimationFrame(() => this.inputValuesElement.focus());
    }

    public onValuesChanged(eventArgs: any) {
        if (!this._isDropdownValuesOpening) {
            const value = (eventArgs.newSelection as IgxDropDownItemComponent).value;
            this.expressionUI.expression.searchVal = value;

            this.focus();
        }
    }

    public onDropdownValuesOpening() {
        this._isDropdownValuesOpening = true;

        if (this.expressionUI.expression.searchVal) {
            const isSearchValNumber = typeof(this.valuesForOfDirective.igxForOf[0]) === 'number';
            const searchVal = isSearchValNumber ? parseFloat(this.expressionUI.expression.searchVal)
                                                : this.expressionUI.expression.searchVal;
            const selectedItemIndex = this.valuesForOfDirective.igxForOf.indexOf(searchVal);

            if (selectedItemIndex > -1) {
                this._scrollTop = this.valuesForOfDirective.getScrollForIndex(selectedItemIndex);
            }
        }

        (this.valuesForOfDirective as any).vh.instance.scrollTop = this._scrollTop;
    }

    public onDropdownClosing() {
        this._scrollTop =  this.valuesForOfDirective.getVerticalScroll().scrollTop;
    }

    public onDropdownValuesOpened() {
        this._isDropdownValuesOpening = false;
    }

    public isConditionSelected(conditionName: string): boolean {
        return this.expressionUI.expression.condition && this.expressionUI.expression.condition.name === conditionName;
    }

    public getConditionName(condition: IFilteringOperation) {
        return condition ? condition.name : null;
    }

    public getInputWidth(parent: any) {
        return parent ? parent.element.nativeElement.offsetWidth + 'px' : null;
    }

    get conditions() {
        return this.column.filters.conditionList();
    }

    public translateCondition(value: string): string {
        return this.grid.resourceStrings[`igx_grid_filter_${this.getCondition(value).name}`] || value;
    }

    public getIconName(): string {
        if (this.column.dataType === DataType.Boolean && this.expressionUI.expression.condition === null) {
            return this.getCondition(this.conditions[0]).iconName;
        } else if (!this.expressionUI.expression.condition) {
            return 'filter_list';
        } else {
            return this.expressionUI.expression.condition.iconName;
        }
    }

    public onDropdownClosed() {
        this._isDropdownOpened = false;
        (this.valuesForOfDirective as any).vh.instance.scrollTop = null;
    }

    public toggleCustomDialogDropDown(input: IgxInputGroupComponent, targetDropDown: IgxDropDownComponent) {
        if (!this._isDropdownOpened) {
            this._dropDownOverlaySettings.positionStrategy.settings.target = input.element.nativeElement;
            targetDropDown.toggle(this._dropDownOverlaySettings);
            this._isDropdownOpened = true;
        }
    }

    public getCondition(value: string): IFilteringOperation {
        return this.column.filters.condition(value);
    }

    public onConditionsChanged(eventArgs: any) {
        const value = (eventArgs.newSelection as IgxDropDownItemComponent).value;
        this.expressionUI.expression.condition = this.getCondition(value);

        this.focus();
    }

    public isValueSelected(value: string): boolean {
        if (this.expressionUI.expression.searchVal) {
            return this.expressionUI.expression.searchVal === value;
        } else {
            return false;
        }
    }

    public onLogicOperatorButtonClicked(eventArgs, buttonIndex: number) {
        if (this.logicOperatorButtonGroup.selectedButtons.length === 0) {
            eventArgs.stopPropagation();
            this.logicOperatorButtonGroup.selectButton(buttonIndex);
        } else {
            this.onLogicOperatorChanged.emit({
                target: this.expressionUI,
                newValue: buttonIndex as FilteringLogic
            });
        }
    }

    public onLogicOperatorKeyDown(eventArgs, buttonIndex: number) {
        if (eventArgs.key === KEYS.ENTER) {
            this.logicOperatorButtonGroup.selectButton(buttonIndex);
            this.onLogicOperatorChanged.emit({
                target: this.expressionUI,
                newValue: buttonIndex as FilteringLogic
            });
        }
    }

    public onRemoveButtonClick() {
        this.onExpressionRemoved.emit(this.expressionUI);
    }

    public onInputValuesKeydown(event: KeyboardEvent) {
        if (event.altKey && (event.key === KEYS.DOWN_ARROW || event.key === KEYS.DOWN_ARROW_IE)) {
            this.toggleCustomDialogDropDown(this.inputGroupValues, this.dropdownValues);
        }

        event.stopPropagation();
    }

    public onInputKeyDown(eventArgs) {
        if (eventArgs.altKey && (eventArgs.key === KEYS.DOWN_ARROW || eventArgs.key === KEYS.DOWN_ARROW_IE)) {
            this.toggleCustomDialogDropDown(this.inputGroupConditions, this.dropdownConditions);
        }

        if (eventArgs.key === KEYS.TAB && eventArgs.shiftKey && this.expressionsList[0] === this.expressionUI) {
            eventArgs.preventDefault();
        }

        event.stopPropagation();
    }
}
