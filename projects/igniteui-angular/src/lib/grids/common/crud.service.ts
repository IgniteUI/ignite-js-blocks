import { Injectable } from '@angular/core';
import { first } from 'rxjs/operators';
import { IGridEditDoneEventArgs, IGridEditEventArgs, IgxGridBaseDirective, IRowDataEventArgs } from '../grid/public_api';
import { IgxRowDirective } from '../row.directive';
import { GridType } from './grid.interface';
import { Subject } from 'rxjs';
import { isEqual } from '../../core/utils';

export class IgxRow {
    public transactionState: any;
    public state: any;
    public newData: any;
    public isAddRow: boolean;

    constructor(public id: any, public index: number, public data: any, public grid: IgxGridBaseDirective & GridType) { }

    public createEditEventArgs(includeNewValue = true, event?: Event): IGridEditEventArgs {
        const args: IGridEditEventArgs = {
            rowID: this.id,
            rowData: this.data,
            oldValue: this.data,
            cancel: false,
            owner: this.grid,
            isAddRow: this.isAddRow || false,
            event
        };
        if (includeNewValue) {
            args.newValue = this.newData;
        }
        return args;
    }

    public createDoneEditEventArgs(cachedRowData: any, event?: Event): IGridEditDoneEventArgs {
        const updatedData = this.grid.transactions.enabled ?
            this.grid.transactions.getAggregatedValue(this.id, true) : this.grid.gridAPI.getRowData(this.id);
        const rowData = updatedData === null ? this.grid.gridAPI.getRowData(this.id) : updatedData;
        const args: IGridEditDoneEventArgs = {
            rowID: this.id,
            rowData,
            oldValue: cachedRowData,
            newValue: updatedData,
            owner: this.grid,
            isAddRow: this.isAddRow || false,
            event
        };

        return args;
    }
}

export class IgxCell {
    public primaryKey: any;
    public state: any;

    constructor(
        public id,
        public rowIndex: number,
        public column,
        public value: any,
        public editValue: any,
        public rowData: any,
        public grid: IgxGridBaseDirective & GridType) { }

    public castToNumber(value: any): any {
        if (this.column.dataType === 'number' && !this.column.inlineEditorTemplate) {
            const v = parseFloat(value);
            return !isNaN(v) && isFinite(v) ? v : 0;
        }
        return value;
    }

    public createEditEventArgs(includeNewValue = true, event?: Event): IGridEditEventArgs {
        const args: IGridEditEventArgs = {
            rowID: this.id.rowID,
            cellID: this.id,
            rowData: this.rowData,
            oldValue: this.value,
            cancel: false,
            column: this.column,
            owner: this.grid,
            event
        };
        if (includeNewValue) {
            args.newValue = this.castToNumber(this.editValue);
        }
        return args;
    }

    public createDoneEditEventArgs(value: any, event?: Event): IGridEditDoneEventArgs {
        const updatedData = this.grid.transactions.enabled ?
            this.grid.transactions.getAggregatedValue(this.id.rowID, true) : this.rowData;
        const rowData = updatedData === null ? this.grid.gridAPI.getRowData(this.id.rowID) : updatedData;
        const args: IGridEditDoneEventArgs = {
            rowID: this.id.rowID,
            cellID: this.id,
            // rowData - should be the updated/committed rowData - this effectively should be the newValue
            // the only case we use this.rowData directly, is when there is no rowEditing or transactions enabled
            rowData,
            oldValue: this.value,
            newValue: value,
            column: this.column,
            owner: this.grid,
            event
        };
        return args;
    }
}

export interface IgxRowParent {
    rowID: string;
    index: number;
    asChild: boolean;
    isPinned: boolean;
}
export class IgxCellCrudState {
    public grid: IgxGridBaseDirective & GridType;
    public cell: IgxCell | null = null;
    public row: IgxRow | null = null;
    public isInCompositionMode = false;
    public cancelAddMode = false;

    public createCell(cell): IgxCell {
        return this.cell = new IgxCell(cell.cellID, cell.rowIndex, cell.column, cell.value, cell.value, cell.intRow.rowData, cell.grid);
    }

    public createRow(cell: IgxCell): IgxRow {
        return this.row = new IgxRow(cell.id.rowID, cell.rowIndex, cell.rowData, cell.grid);
    }

    public sameRow(rowID): boolean {
        return this.row && this.row.id === rowID;
    }

    public sameCell(cell: IgxCell): boolean {
        return (this.cell.id.rowID === cell.id.rowID &&
            this.cell.id.columnID === cell.id.columnID);
    }

    public get cellInEditMode(): boolean {
        return !!this.cell;
    }

    public beginCellEdit(event?: Event) {
        const args = this.cell.createEditEventArgs(false, event);
        this.grid.cellEditEnter.emit(args);

        if (args.cancel) {
            this.endCellEdit();
        }

    }

    public cellEdit(event?: Event) {
        const args = this.cell.createEditEventArgs(true, event);
        this.grid.cellEdit.emit(args);
        return args;
    }

    public updateCell(exit: boolean, event?: Event): IGridEditEventArgs {
        if (!this.cell) {
            return;
        }

        let doneArgs;
        if (isEqual(this.cell.value, this.cell.editValue)) {
            doneArgs = this.exitCellEdit(event);
            return doneArgs;
        }

        const args = this.cellEdit(event);
        if (args.cancel) {
            return args;
        }

        this.grid.gridAPI.update_cell(this.cell);

        doneArgs = this.cellEditDone(event, false);
        if (exit) {
            doneArgs = this.exitCellEdit(event);
        }

        return { ...args, ...doneArgs };
    }

    public cellEditDone(event, addRow: boolean): IGridEditDoneEventArgs {
        const newValue = this.cell.castToNumber(this.cell.editValue);
        const doneArgs = this.cell.createDoneEditEventArgs(newValue, event);
        this.grid.cellEditDone.emit(doneArgs);
        if (addRow) {
            doneArgs.rowData = this.row.data;
        }
        return doneArgs;
    }

    /** Exit cell edit mode */
    public exitCellEdit(event?: Event): IGridEditDoneEventArgs {
        if (!this.cell) {
            return;
        }

        const newValue = this.cell.castToNumber(this.cell.editValue);
        const args = this.cell?.createDoneEditEventArgs(newValue, event);

        this.cell.value = newValue;

        this.grid.cellEditExit.emit(args);
        this.endCellEdit();
        return args;
    }

    /** Clears cell editing state */
    public endCellEdit() {
        this.cell = null;
    }

    /** Returns whether the targeted cell is in edit mode */
    public targetInEdit(rowIndex: number, columnIndex: number): boolean {
        if (!this.cell) {
            return false;
        }
        const res = this.cell.column.index === columnIndex && this.cell.rowIndex === rowIndex;
        return res;
    }
}
export class IgxRowCrudState extends IgxCellCrudState {
    public row: IgxRow | null = null;
    public closeRowEditingOverlay = new Subject();

    private _rowEditingBlocked = false;

    public get primaryKey(): any {
        return this.grid.primaryKey;
    }

    public get rowInEditMode(): IgxRowDirective<IgxGridBaseDirective & GridType> {
        const editRowState = this.row;
        return editRowState !== null ? this.grid.rowList.find(e => e.rowID === editRowState.id) : null;
    }

    public get rowEditing(): boolean {
        return this.grid.rowEditable;
    }

    public get rowEditingBlocked() {
        return this._rowEditingBlocked;
    }

    public set rowEditingBlocked(val: boolean) {
        this._rowEditingBlocked = val;
    }

    /** Enters row edit mode */
    public beginRowEdit(event?: Event) {
        if (this.grid.rowEditable && (this.grid.primaryKey === undefined || this.grid.primaryKey === null)) {
            console.warn('The grid must have a `primaryKey` specified when using `rowEditable`!');
        }

        if (!this.row) {
            this.createRow(this.cell);
            const rowArgs = this.row.createEditEventArgs(false, event);

            this.grid.rowEditEnter.emit(rowArgs);
            if (rowArgs.cancel) {
                this.endEditMode();
                return true;
            }

            this.row.transactionState = this.grid.transactions.getAggregatedValue(this.row.id, true);
            this.grid.transactions.startPending();
            this.grid.openRowOverlay(this.row.id);
        }
    }

    public rowEdit(event: Event): IGridEditEventArgs {
        const args = this.row.createEditEventArgs(true, event);
        this.grid.rowEdit.emit(args);
        return args;
    }

    public updateRow(commit: boolean, event?: Event): IGridEditEventArgs {
        if (!this.grid.rowEditable ||
            this.grid.rowEditingOverlay &&
            this.grid.rowEditingOverlay.collapsed || !this.row) {
            return {} as IGridEditEventArgs;
        }

        let args;
        if (commit) {
            this.row.newData = this.grid.transactions.getAggregatedValue(this.row.id, true);
            this.updateRowEditData(this.row, this.row.newData);
            args = this.rowEdit(event);
            if (args.cancel) {
                return args;
            }
        }

        args = this.endRowTransaction(commit, event);

        return args;
    }

    /**
     * @hidden @internal
     */
    public endRowTransaction(commit: boolean, event?: Event): IGridEditEventArgs {
        this.row.newData = this.grid.transactions.getAggregatedValue(this.row.id, true);
        let rowEditArgs = this.row.createEditEventArgs(true, event);

        let nonCancelableArgs;
        if (!commit) {
            this.grid.transactions.endPending(false);
        } else {
            rowEditArgs = this.grid.gridAPI.update_row(this.row, this.row.newData, event);
            nonCancelableArgs = this.rowEditDone(rowEditArgs.oldValue, event);
        }

        nonCancelableArgs = this.exitRowEdit(rowEditArgs.oldValue, event);

        return { ...nonCancelableArgs, ...rowEditArgs };
    }

    public rowEditDone(cachedRowData, event: Event) {
        const doneArgs = this.row.createDoneEditEventArgs(cachedRowData, event);
        this.grid.rowEditDone.emit(doneArgs);
        return doneArgs;
    }


    /** Exit row edit mode */
    public exitRowEdit(cachedRowData, event?: Event): IGridEditDoneEventArgs {
        const nonCancelableArgs = this.row.createDoneEditEventArgs(cachedRowData, event);
        this.grid.rowEditExit.emit(nonCancelableArgs);
        this.grid.closeRowEditingOverlay();

        this.endRowEdit();
        return nonCancelableArgs;
    }

    /** Clears row editing state */
    public endRowEdit() {
        this.row = null;
        this.rowEditingBlocked = false;
    }

    /** Clears cell and row editing state and closes row editing template if it is open */
    public endEditMode() {
        this.endCellEdit();
        if (this.grid.rowEditable) {
            this.endRowEdit();
            this.grid.closeRowEditingOverlay();
        }
    }

    public updateRowEditData(row: IgxRow, value?: any) {
        const grid = this.grid;

        const rowInEditMode = grid.gridAPI.crudService.row;
        row.newData = value ?? rowInEditMode.transactionState;


        if (rowInEditMode && row.id === rowInEditMode.id) {
            row.data = { ...row.data, ...rowInEditMode.transactionState };
            // TODO: Workaround for updating a row in edit mode through the API
        } else if (this.grid.transactions.enabled) {
            const state = grid.transactions.getState(row.id);
            row.data = state ? Object.assign({}, row.data, state.value) : row.data;
        }
    }

}

export class IgxRowAddCrudState extends IgxRowCrudState {
    public addRowParent: IgxRowParent = null;
    public addRow: IgxRow | null = null;

    /**
     * @hidden @internal
     */
    public createRow(cell: IgxCell): IgxRow {
        this.row = super.createRow(cell);
        this.row.isAddRow = this.addRow ? this.addRow.id === this.row.id : false;
        return this.row;
    }

    /**
     * @hidden @internal
     */
    public createAddRow(parentRow: IgxRowDirective<IgxGridBaseDirective & GridType>, asChild?: boolean) {
        this.createAddRowParent(parentRow, asChild);

        const newRec = this.grid.getEmptyRecordObjectFor(parentRow ? parentRow.rowData : null);
        const addRowIndex = this.addRowParent.index + 1;
        return this.addRow = new IgxRow(newRec[this.primaryKey], addRowIndex, newRec, this.grid);
    }

    /**
     * @hidden @internal
     */
    public createAddRowParent(row: IgxRowDirective<IgxGridBaseDirective & GridType>, newRowAsChild?: boolean) {
        const rowIndex = row ? row.index : this.grid.rowList.length - 1;
        const rowId = row ? row.rowID : (rowIndex >= 0 ? this.grid.rowList.last.rowID : null);

        const isInPinnedArea = this.grid.isRecordPinnedByViewIndex(rowIndex);
        const pinIndex = this.grid.pinnedRecords.findIndex(x => x[this.primaryKey] === rowId);
        const unpinIndex = this.grid.unpinnedRecords.findIndex(x => x[this.primaryKey] === rowId);
        this.addRowParent = {
            rowID: rowId,
            index: isInPinnedArea ? pinIndex : unpinIndex,
            asChild: newRowAsChild,
            isPinned: isInPinnedArea
        };
    }

    /**
     * @hidden @internal
     */
    public endRowTransaction(commit: boolean, event?: Event): IGridEditEventArgs {
        if (this.addRow) {
            this.grid.rowAdded.pipe(first()).subscribe((addRowArgs: IRowDataEventArgs) => {
                const rowData = addRowArgs.data;
                const pinnedIndex = this.grid.pinnedRecords.findIndex(x => x[this.primaryKey] === rowData[this.primaryKey]);
                // A check whether the row is in the current view
                const viewIndex = pinnedIndex !== -1 ? pinnedIndex : this._findRecordIndexInView(rowData);
                const dataIndex = this.grid.filteredSortedData.findIndex(data => data[this.primaryKey] === rowData[this.primaryKey]);
                const isInView = viewIndex !== -1 && !this.grid.navigation.shouldPerformVerticalScroll(viewIndex, 0);
                const showIndex = isInView ? -1 : dataIndex;
                this.grid.showSnackbarFor(showIndex);
            });

            this.addRow.newData = this.row.newData;
        }

        const args = super.endRowTransaction(commit, event);

        if (this.addRow) {
            this.grid.transactions.endPending(true);

            if (commit) {
                args.isAddRow = true;

                if (!this.grid.transactions.enabled) {
                    this.grid.gridAPI.addRowToData(this.addRow.newData || this.addRow.data);
                }

                this.grid.rowAddedNotifier.next(this.addRow.newData || this.addRow.data);
                this.grid.rowAdded.emit({ data: this.addRow.newData || this.addRow.data });
            } else if (this.grid.transactions.enabled) {
                this.grid.transactions.clear(this.addRow.id);
            }

            this.endAddRow();
        }

        return args;
    }

    /**
     * @hidden @internal
     */
    public endAddRow() {
        this.addRow = null;
        this.addRowParent = null;
        this.grid.triggerPipes();
    }

    /**
     * @hidden
     * @internal
     * TODO: consider changing modifier
     */
    public _findRecordIndexInView(rec) {
        return this.grid.dataView.findIndex(data => data[this.primaryKey] === rec[this.primaryKey]);
    }

    protected _getParentRecordId() {
        if (this.addRowParent.asChild) {
            return this.addRowParent.asChild ? this.addRowParent.rowID : undefined;;
        } else if (this.addRowParent.rowID !== null && this.addRowParent.rowID !== undefined) {
            const spawnedForRecord = this.grid.gridAPI.get_rec_by_id(this.addRowParent.rowID);
            return spawnedForRecord?.parent?.rowID;
        }
    }
}

@Injectable()
export class IgxGridCRUDService extends IgxRowAddCrudState {

    public enterEditMode(cell, event?: Event) {
        if (this.isInCompositionMode) {
            return;
        }

        if (this.cellInEditMode) {
            // TODO: case solely for f2/enter nav that uses enterEditMode as toggle. Refactor.
            const canceled = this.endEdit(true, event);

            if (!canceled || !this.cell) {
                this.grid.tbody.nativeElement.focus();
            }
        } else {

            this.createCell(cell);
            if (this.rowEditing) {
                if (this.row && !this.sameRow(this.cell?.id?.rowID)) {
                    this.rowEditingBlocked = this.endEdit(true, event);
                    if (this.rowEditingBlocked) {
                        return true;
                    }

                    // If enters here, @endEdit clears the new reference of the cell edit.
                    this.createCell(cell);
                    this.rowEditingBlocked = false;
                    this.endRowEdit();
                }

                const canceled = this.beginRowEdit(event);
                if (!canceled) {
                    this.beginCellEdit(event);
                }

            } else {
                this.beginCellEdit(event);
            }
        }
    }

    /**
     * Enters add row mode by creating temporary dummy so the user can fill in new row cells.
     *
     * @param parentRow Parent row after which the Add Row UI will be rendered.
     *                  If `null` will show it at the bottom after all rows (or top if there are not rows).
     * @param asChild Specifies if the new row should be added as a child to a tree row.
     * @param event Base event that triggered the add row mode.
     */
    public enterAddRowMode(parentRow: IgxRowDirective<IgxGridBaseDirective & GridType>, asChild?: boolean, event?: Event) {
        if (!this.rowEditing && (this.grid.primaryKey === undefined || this.grid.primaryKey === null)) {
            console.warn('The grid must use row edit mode to perform row adding! Please set rowEditable to true.');
            return;
        }
        this.endEdit(true, event);
        this.cancelAddMode = false;

        if (parentRow != null && this.grid.expansionStates.get(parentRow.rowID)) {
            this.grid.collapseRow(parentRow.rowID);
        }

        this.createAddRow(parentRow, asChild);

        this.grid.transactions.startPending();
        this.grid.gridAPI.addRowToData(this.addRow.data, parentRow ? parentRow.rowID : null, this.addRow.index);
        if (this.addRowParent.isPinned) {
            // If parent is pinned, add the new row to pinned records
            (this.grid as any)._pinnedRecordIDs.splice(this.addRow.index, 0, this.addRow.id);
        }

        this.grid.triggerPipes();
        this.grid.notifyChanges(true);

        this.grid.navigateTo(this.addRow.index, -1);
        const dummyRow = this.grid.gridAPI.get_row_by_index(this.addRow.index);
        dummyRow.triggerAddAnimation();
        dummyRow.addAnimationEnd.pipe(first()).subscribe(() => {
            const cell = dummyRow.cells.find(c => c.editable);
            if (cell) {
                this.grid.gridAPI.update_cell(this.cell);
                this.enterEditMode(cell, event);
                cell.activate();
            }
        });
    }

    /**
     * Finishes the row transactions on the current row.
     *
     * @remarks
     * If `commit === true`, passes them from the pending state to the data (or transaction service)
     * @example
     * ```html
     * <button igxButton (click)="grid.endEdit(true)">Commit Row</button>
     * ```
     * @param commit
     */
    // TODO: Implement the same representation of the method without evt emission.
    public endEdit(commit = true, event?: Event) {
        if (!this.row && !this.cell) {
            return;
        }

        let args;
        if (commit) {
            args = this.updateCell(true, event);
            if (args && args.cancel) {
                return args.cancel;
            }
        } else {
            this.exitCellEdit(event);
        }

        args = this.updateRow(commit, event);
        this.rowEditingBlocked = args.cancel;
        if (args.cancel) {
            return true;
        }

        const activeCell = this.grid.selectionService.activeElement;
        if (event && activeCell) {
            const rowIndex = activeCell.row;
            const visibleColIndex = activeCell.layout ? activeCell.layout.columnVisibleIndex : activeCell.column;
            this.grid.navigateTo(rowIndex, visibleColIndex);
        }

        return false;
    }
}
