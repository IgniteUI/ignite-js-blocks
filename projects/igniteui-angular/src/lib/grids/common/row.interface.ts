import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { CellType } from '../hierarchical-grid/public_api';
import { IgxSummaryResult } from '../summaries/grid-summary';
import { ITreeGridRecord } from '../tree-grid/tree-grid.interfaces';
import { GridType } from './grid.interface';

export interface RowType {
    index: number;
    viewIndex: number;
    isGroupByRow?: boolean;
    isSummaryRow?: boolean;
    summaries?: Map<string, IgxSummaryResult[]>;
    groupRow?: IGroupByRecord;
    /** Deprecated, will be removed. key is the new property */
    rowID?: any;
    key?: any;
    /** Deprecated, will be removed. data is the new property */
    rowData?: any;
    data?: any;
    cells?: CellType[];
    disabled?: boolean;
    pinned?: boolean;
    selected?: boolean;
    expanded?: boolean;
    deleted?: boolean;
    inEditMode?: boolean;
    children?: RowType[];
    parent?: RowType;
    hasChildren?: boolean;
    treeRow? : ITreeGridRecord;
    grid: GridType;
    update?: (value: any) => void;
    delete?: () => any;
    pin?: () => void;
    unpin?: () => void;
}

