import { Component, HostBinding, Input } from '@angular/core';
import { IgxGridActionsBaseDirective } from './grid-actions-base.directive';
import { showMessage } from '../../core/deprecateDecorators';
import { addRow } from '@igniteui/material-icons-extended';

@Component({
    selector: 'igx-grid-editing-actions',
    templateUrl: 'grid-editing-actions.component.html',
    providers: [{ provide: IgxGridActionsBaseDirective, useExisting: IgxGridEditingActionsComponent }]
})

export class IgxGridEditingActionsComponent extends IgxGridActionsBaseDirective {
    /**
     * Host `class.igx-action-strip` binding.
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-action-strip__editing-actions')
    public cssClass = 'igx-action-strip__editing-actions';

    private isMessageShown = false;
    private _addRow = false;
    private iconsRendered = false;

    /**
     * An input to enable/disable action strip row adding button
     */
    @Input()
    public set addRow(value: boolean) {
        this._addRow = value;
    }
    public get addRow(): boolean {
        if (!this.iconsRendered) {
            this.registerIcons();
            this.iconsRendered = true;
        }
        return this._addRow;
    }

    /**
     * Enter row or cell edit mode depending the grid rowEditable option
     * @example
     * ```typescript
     * this.gridEditingActions.startEdit();
     * ```
     */
    public startEdit(event?): void {
        if (event) {
            event.stopPropagation();
        }
        if (!this.isRow(this.strip.context)) {
            return;
        }
        const row = this.strip.context;
        const firstEditable = row.cells.filter(cell => cell.editable)[0];
        const grid = row.grid;
        if (!grid.hasEditableColumns) {
            this.isMessageShown = showMessage(
                'The grid should be editable in order to use IgxGridEditingActionsComponent',
                this.isMessageShown);
                return;
        }
        // be sure row is in view
        if (grid.rowList.filter(r => r === row).length !== 0) {
            grid.crudService.begin(firstEditable);
        }
        this.strip.hide();
    }

    /**
     * Delete a row according to the context
     * @example
     * ```typescript
     * this.gridEditingActions.deleteRow();
     * ```
     */
    public deleteRow(event?): void {
        if (event) {
            event.stopPropagation();
        }
        if (!this.isRow(this.strip.context)) {
            return;
        }
        const context = this.strip.context;
        const grid = context.grid;
        grid.deleteRow(context.rowID);
        this.strip.hide();
    }

    public addChild(event?): void {
        if (event) {
            event.stopPropagation();
        }
        if (!this.isRow(this.strip.context)) {
            return;
        }
        const context = this.strip.context;
        const grid = context.grid;
        if (!grid.rowEditable) {
            console.warn('The grid must be in row edit mode to perform row adding!');
            return;
        }
        grid.beginAddRowByIndex(context.rowID, context.index);
        this.strip.hide();
    }

    /**
     * Getter if the row is disabled
     * @hidden
     * @internal
     */
    get disabled(): boolean {
        if (!this.isRow(this.strip.context)) {
            return;
        }
        return this.strip.context.disabled;
    }

    /**
     * @hidden
     * @internal
     */
    private registerIcons() {
        this.iconService.addSvgIconFromText(addRow.name, addRow.value, 'imx-icons');
    }
}
