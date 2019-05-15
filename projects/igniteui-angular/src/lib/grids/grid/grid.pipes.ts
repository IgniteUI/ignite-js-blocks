import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { IGroupByResult } from '../../data-operations/grouping-strategy';
import { IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';
import { IgxGridAPIService } from './grid-api.service';
import { IgxGridComponent } from './grid.component';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseComponent, IGridDataBindable } from '../grid-base.component';

/**
 *@hidden
 */
@Pipe({
    name: 'gridSort',
    pure: true
})
export class IgxGridSortingPipe implements PipeTransform {
    private gridAPI: IgxGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>) {
        this.gridAPI = <IgxGridAPIService>gridAPI;
    }

    public transform(collection: any[], expressions: ISortingExpression[], id: string, pipeTrigger: number): any[] {
        const grid = this.gridAPI.grid;
        let result: any[];

        if (!expressions.length) {
            result = collection;
        } else {
            result = DataUtil.sort(cloneArray(collection), expressions);
        }
        grid.filteredSortedData = result;

        return result;
    }
}

/**
 *@hidden
 */
@Pipe({
    name: 'gridPreGroupBy',
    pure: true
})
export class IgxGridPreGroupingPipe implements PipeTransform {
    private gridAPI: IgxGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>) {
        this.gridAPI = <IgxGridAPIService>gridAPI;
    }

    public transform(collection: any[], expression: IGroupingExpression | IGroupingExpression[],
        expansion: IGroupByExpandState | IGroupByExpandState[], defaultExpanded: boolean,
        id: string, groupsRecords: any[], pipeTrigger: number): IGroupByResult {

        const state = { expressions: [], expansion: [], defaultExpanded };
        const grid: IgxGridComponent = this.gridAPI.grid;
        state.expressions = grid.groupingExpressions;

        if (!state.expressions.length) {
            // empty the array without changing reference
            groupsRecords.splice(0, groupsRecords.length);
            return {
                data: collection,
                metadata: collection
            };
        }

        state.expansion = grid.groupingExpansionState;
        state.defaultExpanded = grid.groupsExpanded;

        return DataUtil.group(cloneArray(collection), state, grid, groupsRecords);
    }
}

/**
 *@hidden
 */
@Pipe({
    name: 'gridPostGroupBy',
    pure: true
})
export class IgxGridPostGroupingPipe implements PipeTransform {
    private gridAPI: IgxGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>) {
        this.gridAPI = <IgxGridAPIService>gridAPI;
    }

    public transform(collection: IGroupByResult, expression: IGroupingExpression | IGroupingExpression[],
        expansion: IGroupByExpandState | IGroupByExpandState[], defaultExpanded: boolean,
        id: string, pipeTrigger: number): any[] {

        const state = { expressions: [], expansion: [], defaultExpanded };
        const grid: IgxGridComponent = this.gridAPI.grid;
        state.expressions = grid.groupingExpressions;

        if (!state.expressions.length) {
            return collection.data;
        }

        state.expansion = grid.groupingExpansionState;
        state.defaultExpanded = grid.groupsExpanded;

        return DataUtil.restoreGroups({
            data: cloneArray(collection.data),
            metadata: cloneArray(collection.metadata)
        }, state);
    }
}

/**
 *@hidden
 */
@Pipe({
    name: 'gridPaging',
    pure: true
})
export class IgxGridPagingPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>) { }

    public transform(collection: IGroupByResult, page = 0, perPage = 15, id: string, pipeTrigger: number): IGroupByResult {

        if (!this.gridAPI.grid.paging) {
            return collection;
        }

        const state = {
            index: page,
            recordsPerPage: perPage
        };

        const result: IGroupByResult = {
            data: DataUtil.page(cloneArray(collection.data), state),
            metadata: DataUtil.page(cloneArray(collection.metadata), state)
        };
        this.gridAPI.grid.pagingState = state;
        return result;
    }
}

/**
 *@hidden
 */
@Pipe({
    name: 'gridFiltering',
    pure: true
})
export class IgxGridFilteringPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>) { }

    public transform(collection: any[], expressionsTree: IFilteringExpressionsTree,
        id: string, pipeTrigger: number) {
        const grid = this.gridAPI.grid;
        const state = { expressionsTree: expressionsTree };

        if (!state.expressionsTree ||
            !state.expressionsTree.filteringOperands ||
            state.expressionsTree.filteringOperands.length === 0) {
            return collection;
        }

        const result = DataUtil.filter(cloneArray(collection), state);
        grid.filteredData = result;
        return result;
    }
}
