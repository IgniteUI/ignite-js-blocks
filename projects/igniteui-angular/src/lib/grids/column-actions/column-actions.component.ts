import {
    Component,
    HostBinding,
    Input,
    ViewChildren,
    QueryList,
    DoCheck,
    KeyValueDiffers,
    EventEmitter,
    Output
} from '@angular/core';
import { IgxColumnComponent } from '../columns/column.component';
import { ColumnDisplayOrder } from '../common/enums';
import { IgxColumnActionsBaseDirective } from './column-actions-base.directive';
import { IgxCheckboxComponent, IChangeCheckboxEventArgs } from '../../checkbox/checkbox.component';
import { IColumnToggledEventArgs } from '../common/events';

let NEXT_ID = 0;
/**
 * Providing reference to `IgxColumnActionsComponent`:
 * ```typescript
 *  @ViewChild('columnActions', { read: IgxColumnActionsComponent })
 *  public columnActions: IgxColumnActionsComponent;
 */
@Component({
    selector: 'igx-column-actions',
    templateUrl: './column-actions.component.html'
})
export class IgxColumnActionsComponent implements DoCheck {


    /* todo
        <!-- (onColumnVisibilityChanged)="onVisibilityChanged($event)" -->
    */

    private _columnDifferMap = new Map<IgxColumnComponent, any>();

    /**
     * @hidden @internal
     */
    public actionableColumns: IgxColumnComponent[] = [];

    /**
     * @hidden @internal
     */
    public filteredColumns: IgxColumnComponent[] = [];

    /**
     * @hidden @internal
     */
    private _columns: IgxColumnComponent[] = [];
    /**
     * Gets the grid columns to provide an action for.
     * @example
     * ```typescript
     * let gridColumns = this.columnActions.columns;
     * ```
     */
    @Input()
    public get columns() {
        return this._columns;
    }
    /**
     * Sets the grid columns to provide an action for.
     * @example
     * ```html
     * <igx-column-actions [columns]="grid.columns"></igx-column-actions>
     * ```
     */
    public set columns(value: IgxColumnComponent[]) {
        if (value) {
            this._columns = value;
            this._columnDifferMap.clear();
            this._columns.forEach(col => {
                this._columnDifferMap.set(col, this._differs.find(col).create());
            });
            this._pipeTrigger++;
        }
    }

    /**
     * Gets/sets the title of the column actions component.
     * @example
     * ```html
     * <igx-column-actions [title]="'Pin Columns'"></igx-column-actions>
     * ```
     */
    @Input()
    public title = '';

    /**
     * @hidden @internal
     */
    private _filterColumnsPrompt = '';
    /**
     * Gets the prompt that is displayed in the filter input.
     * @example
     * ```typescript
     * let filterColumnsPrompt = this.columnActions.filterColumnsPrompt;
     * ```
     */
    @Input()
    public get filterColumnsPrompt(): string {
        return this._filterColumnsPrompt;
    }
    /**
     * Sets the prompt that is displayed in the filter input.
     * @example
     * ```html
     * <igx-column-actions [filterColumnsPrompt]="'Type here to search'"></igx-column-actions>
     * ```
     */
    public set filterColumnsPrompt(value: string) {
        this._filterColumnsPrompt = value || '';
    }

    /**
     * Shows/hides the columns filtering input from the UI.
     * @example
     * ```html
     *  <igx-column-actions [hideFilter]="true"></igx-column-actions>
     * ```
     */
    @Input()
    public hideFilter = false;

    /**
     * Gets the checkbox components representing column items currently present in the dropdown
     * @example
     * ```typescript
     * let columnItems =  this.columnActions.columnItems;
     * ```
     */
    @ViewChildren(IgxCheckboxComponent)
    public columnItems: QueryList<IgxCheckboxComponent>;

    /**
     * @hidden @internal
     */
    private _filterCriteria = '';
    /**
     * Gets the value which filters the columns list.
     * @example
     * ```typescript
     * let filterCriteria =  this.columnActions.filterCriteria;
     * ```
     */
    @Input()
    public get filterCriteria() {
        return this._filterCriteria;
    }
    /**
     * Sets the value which filters the columns list.
     * @example
     * ```html
     *  <igx-column-actions [filterCriteria]="'ID'"></igx-column-actions>
     * ```
     */
    public set filterCriteria(value: string) {
        value = value || '';
        if (value !== this._filterCriteria) {
            this._filterCriteria = value;
            this._pipeTrigger++;
        }
    }

    /**
     * @hidden @internal
     */
    private _columnDisplayOrder: ColumnDisplayOrder = ColumnDisplayOrder.DisplayOrder;
    /**
     * Gets the display order of the columns.
     * @example
     * ```typescript
     * let columnDisplayOrder = this.columnActions.columnDisplayOrder;
     * ```
     */
    @Input()
    public get columnDisplayOrder() {
        return this._columnDisplayOrder;
    }
    /**
     * Sets the display order of the columns.
     * @example
     * ```typescript
     * this.columnActions.columnDisplayOrder = ColumnDisplayOrder.Alphabetical;
     * ```
     */
    public set columnDisplayOrder(value: ColumnDisplayOrder) {
        if (value && value !== this._columnDisplayOrder) {
            this._columnDisplayOrder = value;
            this._pipeTrigger++;
        }
    }

    /**
     * Gets/sets the max height of the columns area.
     * @remarks
     * The default max height is 100%.
     * @example
     * ```html
     * <igx-column-actions [columnsAreaMaxHeight]="200px"></igx-column-actions>
     * ```
     */
    @Input()
    public columnsAreaMaxHeight = '100%';

    /**
     * @hidden @internal
     */
    private _uncheckAllText: string;
    /**
     * Gets the text of the button that unchecks all columns.
     * @remarks
     * If unset it is obtained from the IgxColumnActionsBased derived directive applied.
     * @example
     * ```typescript
     * let uncheckAllText = this.columnActions.uncheckAllText;
     * ```
     */
    @Input()
    public get uncheckAllText() {
        return this._uncheckAllText || this.actionsDirective.uncheckAllLabel;
    }
    /**
     * Sets the text of the button that unchecks all columns.
     * @example
     * ```html
     * <igx-column-actions [uncheckAllText]="'Show All'"></igx-column-actions>
     * ```
     */
    public set uncheckAllText(value: string) {
        this._uncheckAllText = value;
    }

    /**
     * @hidden @internal
     */
    private _checkAllText: string;
    /**
     * Gets the text of the button that checks all columns.
     * @remarks
     * If unset it is obtained from the IgxColumnActionsBased derived directive applied.
     * @example
     * ```typescript
     * let uncheckAllText = this.columnActions.uncheckAllText;
     * ```
     */
    @Input()
    public get checkAllText() {
        return this._checkAllText || this.actionsDirective.checkAllLabel;
    }
    /**
     * Sets the text of the button that checks all columns.
     * @remarks
     * If unset it is obtained from the IgxColumnActionsBased derived directive applied.
     * @example
     * ```html
     * <igx-column-actions [checkAllText]="'Hide All'"></igx-column-actions>
     * ```
     */
    public set checkAllText(value: string) {
        this._checkAllText = value;
    }

    /**
     * Gets/sets the indentation of columns in the column list based on their hierarchy level.
     * @example
     * ```
     * <igx-column-actions [indentation]="15"></igx-column-actions>
     * ```
     */
    @Input()
    public indentation = 30;

    /**
     * An event that is emitted after a column's checked state is changed.
     * Provides references to the `column` and the `checked` properties as event arguments.
     * ```html
     *  <igx-column-actions (onColumnToggled)="onColumnToggled($event)"></igx-column-actions>
     * ```
     */
    @Output()
    public onColumnToggled = new EventEmitter<IColumnToggledEventArgs>();

    /**
     * @hidden @internal
     */
    private _pipeTrigger = 0;
    /**
     * @hidden @internal
     */
    public get pipeTrigger(): number {
        return this._pipeTrigger;
    }

    /**
     * @hidden @internal
     */
    public actionsDirective: IgxColumnActionsBaseDirective;

    /**
     * Sets/Gets the css class selector.
     * By default the value of the `class` attribute is `"igx-column-hiding"`.
     * ```typescript
     * let cssCLass =  this.columnHidingUI.cssClass;
     * ```
     * ```typescript
     * this.columnHidingUI.cssClass = 'column-chooser';
     * ```
     */
    @HostBinding('attr.class')
    public cssClass = 'igx-column-actions';

    /**
     * @hidden @internal
     */
    public get checkAllDisabled(): boolean {
        return !this.filteredColumns.some(col => !this.actionsDirective.columnChecked(col));

    }
    /**
     * @hidden @internal
     */
    public get uncheckAllDisabled(): boolean {
        return !this.filteredColumns.some(col => this.actionsDirective.columnChecked(col));

    }

    /**
     * @hidden @internal
     */
    public get grid() {
        return this.actionableColumns[0]?.grid ?? null;
    }

    /**
     * @hidden @internal
     */
    private _id = `igx-column-actions-${NEXT_ID++}`;

    /**
     * Gets/Sets the value of the `id` attribute.
     * @remarks
     * If not provided it will be automatically generated.
     * @example
     * ```html
     * <igx-column-actions [id]="'igx-actions-1'"></igx-column-actions>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }

    /**
     * @hidden @internal
     */
    get titleID() {
        return this.id + '_title';
    }

    /**
     * @hidden
     */
    ngDoCheck() {
        for (const [col, colDiffer] of this._columnDifferMap) {
            const colDiffers = colDiffer.diff(col);
            if (colDiffers) {
                this._pipeTrigger++;
            }
        }
    }

    constructor(private _differs: KeyValueDiffers) { }

    /**
     * Unchecks all columns and performs the appropriate action.
     * @example
     * ```typescript
     * this.columnActions.uncheckAllColumns();
     * ```
     */
    public uncheckAllColumns() {
        this.actionsDirective.uncheckAll();
    }

    /**
     * Checks all columns and performs the appropriate action.
     * @example
     * ```typescript
     * this.columnActions.checkAllColumns();
     * ```
     */
    public checkAllColumns() {
        this.actionsDirective.checkAll();
    }

    /**
     * @hidden @internal
     */
    public toggleColumn(event: IChangeCheckboxEventArgs, column: IgxColumnComponent) {
        this.onColumnToggled.emit({
            column: column,
            checked: event.checked
        });
        this.actionsDirective.toggleColumn(column);
    }
}
