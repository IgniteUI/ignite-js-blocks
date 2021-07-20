import { TemplateRef } from '@angular/core';
import { GridColumnDataType } from '../../data-operations/data-util';
import { ISortingStrategy } from '../../data-operations/sorting-strategy';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IColumnPipeArgs } from '../columns/interfaces';

/**
 * @hidden
 * @internal
 */
export interface ColumnType {
    field: string;
    header?: string;
    index: number;
    dataType: GridColumnDataType;
    inlineEditorTemplate: TemplateRef<any>;
    visibleIndex: number;
    editable: boolean;
    resizable: boolean;
    searchable: boolean;
    columnGroup: boolean;
    movable: boolean;
    groupable: boolean;
    sortable: boolean;
    filterable: boolean;
    hidden: boolean;
    disablePinning: boolean;
    sortStrategy: ISortingStrategy;
    filteringIgnoreCase: boolean;
    filteringExpressionsTree: FilteringExpressionsTree;
    hasSummary: boolean;
    summaries: any;
    pinned: boolean;
    selected: boolean;
    selectable: boolean;
    level: number;
    rowStart: number;
    rowEnd: number;
    colStart: number;
    colEnd: number;
    gridRowSpan: number;
    gridColumnSpan: number;
    columnLayoutChild: boolean;
    width: string;
    topLevelParent?: ColumnType;
    parent?: ColumnType;
    pipeArgs: IColumnPipeArgs;
    hasNestedPath: boolean;
    defaultTimeFormat: string;
    defaultDateTimeFormat: string;
    additionalTemplateContext: any;
    getGridTemplate(isRow: boolean, isIE: boolean): string;
}
