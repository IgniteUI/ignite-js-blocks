import { Pipe, PipeTransform } from '@angular/core';
import { DataUtil } from '../../data-operations/data-util';
import { GridBaseAPIService } from '../api.service';
import { IgxTreeGridComponent } from './tree-grid.component';
import { BaseFilteringStrategy, IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IFilteringState } from '../../data-operations/filtering-state.interface';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { IgxGridBaseDirective } from '../grid/public_api';
import { GridType } from '../common/grid.interface';

/** @hidden */
export class TreeGridFilteringStrategy extends BaseFilteringStrategy {
    public filter(data: ITreeGridRecord[], expressionsTree: IFilteringExpressionsTree,
        advancedExpressionsTree?: IFilteringExpressionsTree): ITreeGridRecord[] {
        return this.filterImpl(data, expressionsTree, advancedExpressionsTree, undefined);
    }

    private filterImpl(data: ITreeGridRecord[], expressionsTree: IFilteringExpressionsTree,
        advancedExpressionsTree: IFilteringExpressionsTree, parent: ITreeGridRecord): ITreeGridRecord[] {
        let i: number;
        let rec: ITreeGridRecord;
        const len = data.length;
        const res: ITreeGridRecord[] = [];
        if ((FilteringExpressionsTree.empty(expressionsTree) && FilteringExpressionsTree.empty(advancedExpressionsTree)) || !len) {
            return data;
        }
        for (i = 0; i < len; i++) {
            rec = DataUtil.cloneTreeGridRecord(data[i]);
            rec.parent = parent;
            if (rec.children) {
                const filteredChildren = this.filterImpl(rec.children, expressionsTree, advancedExpressionsTree, rec);
                rec.children = filteredChildren.length > 0 ? filteredChildren : null;
            }

            if (this.matchRecord(rec, expressionsTree) && this.matchRecord(rec, advancedExpressionsTree)) {
                res.push(rec);
            } else if (rec.children && rec.children.length > 0) {
                rec.isFilteredOutParent = true;
                res.push(rec);
            }
        }
        return res;
    }

    protected getFieldValue(rec: object, fieldName: string): any {
        const hierarchicalRecord = <ITreeGridRecord>rec;
        return hierarchicalRecord.data[fieldName];
    }
}

/** @hidden */
@Pipe({
    name: 'treeGridFiltering',
    pure: true
})
export class IgxTreeGridFilteringPipe implements PipeTransform {
    private gridAPI: IgxTreeGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>) {
        this.gridAPI = <IgxTreeGridAPIService>gridAPI;
     }

    public transform(hierarchyData: ITreeGridRecord[], expressionsTree: IFilteringExpressionsTree,
        filterStrategy: IFilteringStrategy,
        advancedFilteringExpressionsTree: IFilteringExpressionsTree, id: string,
        pipeTrigger: number, filteringPipeTrigger: number, pinned?): ITreeGridRecord[] {
        const grid: IgxTreeGridComponent = this.gridAPI.grid;
        const state: IFilteringState = {
            expressionsTree: expressionsTree,
            advancedExpressionsTree: advancedFilteringExpressionsTree,
            strategy: new TreeGridFilteringStrategy()
        };

        if (filterStrategy) {
            state.strategy = filterStrategy;
        }

        this.resetFilteredOutProperty(grid.records);

        if (FilteringExpressionsTree.empty(state.expressionsTree) && FilteringExpressionsTree.empty(state.advancedExpressionsTree)) {
            grid.setFilteredData(null, pinned);
            return hierarchyData;
        }

        const result = this.filter(hierarchyData, state);
        const filteredData: any[] = [];
        this.expandAllRecursive(grid, result, grid.expansionStates, filteredData);
        grid.setFilteredData(filteredData, pinned);

        return result;
    }

    private resetFilteredOutProperty(map: Map<any, ITreeGridRecord>) {
        const keys = Array.from(map.keys());
        for (let i = 0; i < keys.length; i++) {
            map.get(keys[i]).isFilteredOutParent = undefined;
        }
    }

    private expandAllRecursive(grid: IgxTreeGridComponent, data: ITreeGridRecord[],
        expandedStates: Map<any, boolean>, filteredData: any[]) {
        for (let i = 0; i < data.length; i++) {
            const rec: any = data[i];
            filteredData.push(rec.data);
            this.updateNonProcessedRecord(grid, rec);

            if (rec.children && rec.children.length > 0) {
                expandedStates.set(rec.rowID, true);
                this.expandAllRecursive(grid, rec.children, expandedStates, filteredData);
            }
        }
    }

    private updateNonProcessedRecord(grid: IgxTreeGridComponent, record: ITreeGridRecord) {
        const rec = grid.records.get(record.rowID);
        rec.isFilteredOutParent = record.isFilteredOutParent;
    }

    private filter(data: ITreeGridRecord[], state: IFilteringState): ITreeGridRecord[] {
        return state.strategy.filter(data, state.expressionsTree, state.advancedExpressionsTree);
    }
}
