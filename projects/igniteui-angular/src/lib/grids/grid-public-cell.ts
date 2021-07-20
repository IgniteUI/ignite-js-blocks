import { CellType } from './common/cell.interface';
import { RowType } from './common/row.interface';
import { IgxGridComponent } from './grid/public_api';
import { IgxHierarchicalGridComponent } from './hierarchical-grid/public_api';
import { IgxColumnComponent } from './public_api';
import { ISelectionNode } from './selection/selection.service';
import { IgxTreeGridComponent } from './tree-grid/public_api';

export class IgxGridCell implements CellType {

	/**
	 * Returns the grid containing the cell.
	 *
	 * @memberof IgxGridCell
	 */
	public grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent;
	private _row: RowType;
	private _rowIndex: number;
	private _column: IgxColumnComponent;
	private _columnField: string;

	/**
	 * @hidden
	 */
	constructor(
			grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent,
			row: number | RowType,
			column: string | IgxColumnComponent);
	constructor(grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent,
			row: RowType,
			column: IgxColumnComponent)	{
		this.grid = grid;
		if (typeof row === 'number') {
			this._rowIndex = row;
		} else {
			this._row = row;
		}
		if (typeof column === 'string') {
			this._columnField = column;
		} else {
			this._column = column;
		}
		}

	/**
	 * Returns the row containing the cell.
	 * ```typescript
	 * let row = this.cell.row;
	 * ```
	 *
	 * @memberof IgxGridCell
	 */
	public get row(): RowType {
		return this._row || this.grid.createRow(this._rowIndex);
	}

	/**
	 * Returns the column of the cell.
	 * ```typescript
	 * let column = this.cell.column;
	 * ```
	 *
	 * @memberof IgxGridCell
	 */
	public get column(): IgxColumnComponent {
		return this._column || this.grid.getColumnByName(this._columnField);
	}

	/**
	 * Gets the current edit value while a cell is in edit mode.
	 * ```typescript
	 * let editValue = this.cell.editValue;
	 * ```
	 *
	 * @memberof IgxGridCell
	 */
	public get editValue(): any {
		if (this.grid.crudService.cellInEditMode) {
			return this.grid.crudService.cell.editValue;
		}
	}

	/**
	 * Sets the current edit value while a cell is in edit mode.
	 * Only for cell editing mode.
	 * ```typescript
	 * this.cell.editValue = value;
	 * ```
	 *
	 * @memberof IgxGridCell
	 */
	public set editValue(value: any) {
		if (this.grid.crudService.cellInEditMode) {
			this.grid.crudService.cell.editValue = value;
		}
	}

	/**
	 * Returns whether the cell is editable..
	 *
	 * @memberof IgxGridCell
	 */
	public get editable(): boolean {
		return this.column.editable && !this.row?.disabled;
	}

	/**
	 * Gets the width of the cell.
	 * ```typescript
	 * let cellWidth = this.cell.width;
	 * ```
	 *
	 * @memberof IgxGridCell
	 */
	public get width(): string {
		return this.column.width;
	}

	/**
	 * Returns the cell value.
	 *
	 * @memberof IgxGridCell
	 */
	public get value(): any {
		// TODO remove
		// will return undefined for a column layout, because getCellByColumnVisibleIndex may return the column layout at that index.
		// getCellByColumnVisibleIndex is deprecated and will be removed in future version
		return this.column.field ? this.row?.data[this.column.field] : undefined;
	}

	/**
	 * Gets the cellID key.
	 * A cell in the grid is identified by:
	 * - rowID - primaryKey data value or the whole rowData, if the primaryKey is omitted.
	 * - rowIndex - the row index
	 * - columnID - column index
	 *
	 * ```typescript
	 * let rowKey = row.key;
	 * ```
	 *
	 * @memberof IgxGridCell
	 */
	public get cellID(): any {
		const primaryKey = this.grid.primaryKey;
		const rowID = primaryKey ? this.row?.data[primaryKey] : this.row?.data;
		return { rowID, columnID: this.column.index, rowIndex: this._rowIndex || this.row?.index};
	}

	/**
	 * Returns if the row is currently in edit mode.
	 *
	 * @memberof IgxGridCell
	 */
	public get editMode(): boolean {
		if (this.grid.crudService.cellInEditMode) {
		  const cellInEditMode = this.grid.crudService.cell.id;
			const isCurrentCell = cellInEditMode.rowID === this.cellID.rowID &&
				cellInEditMode.rowIndex === this.cellID.rowIndex &&
				cellInEditMode.columnID === this.cellID.columnID;
			return isCurrentCell;
		} else {
			return false;
		}
	}

	/**
	 * Starts/ends edit mode for the cell.
	 *
	 * ```typescript
	 * cell.editMode  = !cell.editMode;
	 * ```
	 *
	 * @memberof IgxGridCell
	 */
	public set editMode(value: boolean) {
		if (!this.row || this.row?.deleted) {
			return;
		}
		if (this.editable && value) {
			if (this.grid.crudService.cellInEditMode) {
				this.grid.gridAPI.update_cell(this.grid.crudService.cell);
				this.grid.crudService.endCellEdit();
			}
			this.grid.crudService.enterEditMode(this);
		} else {
			this.grid.crudService.endCellEdit();
		}
		this.grid.notifyChanges();
	}

	/**
	 * Gets whether the cell is selected.
	 * ```typescript
	 * let isSelected = this.cell.selected;
	 * ```
	 *
	 *
	 * @memberof IgxGridCell
	 */
	public get selected(): boolean {
		return this.grid.selectionService.selected(this.selectionNode);
	}

	/**
	 * Selects/deselects the cell.
	 * ```typescript
	 * this.cell.selected = true.
	 * ```
	 *
	 *
	 * @memberof IgxGridCell
	 */
	public set selected(val: boolean) {
		const node = this.selectionNode;
		if (val) {
			this.grid.selectionService.add(node);
		} else {
			this.grid.selectionService.remove(node);
		}
		this.grid.notifyChanges();
	}

	public get active() {
			const node = this.grid.navigation.activeNode;
			return node ? node.row === this.row?.index && node.column === this.column.visibleIndex : false;
	}


	/**
	 * Updates the cell value.
	 *
	 * ```typescript
	 * cell.update(newValue);
	 * ```
	 *
	 * @memberof IgxGridCell
	 */
	public update(val: any): void {
		if (this.row?.deleted) {
			return;
		}

		let cell = this.grid.crudService.cell;
		if (!cell) {
			cell = this.grid.crudService.createCell(this);
		}
		cell.editValue = val;
		this.grid.gridAPI.update_cell(cell);
		this.grid.crudService.endCellEdit();
		this.grid.notifyChanges();
	}

	protected get selectionNode(): ISelectionNode {
		return {
			row: this.row?.index,
			column: this.column.columnLayoutChild ? this.column.parent.visibleIndex : this.column.visibleIndex,
			layout: this.column.columnLayoutChild ? {
				rowStart: this.column.rowStart,
				colStart: this.column.colStart,
				rowEnd: this.column.rowEnd,
				colEnd: this.column.colEnd,
				columnVisibleIndex: this.column.visibleIndex
			} : null
		};
	}
}
