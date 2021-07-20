import { IgxColumnComponent } from '../columns/column.component';
import { IgxGridComponent } from '../grid/grid.component';
import { IgxHierarchicalGridComponent } from '../hierarchical-grid/hierarchical-grid.component';
import { IgxTreeGridComponent } from '../tree-grid/tree-grid.component';
import { RowType } from './row.interface';

export interface CellType {
	value: any;
	editValue: any;
	selected: boolean;
	active: boolean;
	editable: boolean;
	editMode: boolean;
	column: IgxColumnComponent;
	row: RowType;
	grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent;
	cellID: { rowID: any; columnID: number; rowIndex: number };
	width: string;
	update?: (value: any) => void;
}

