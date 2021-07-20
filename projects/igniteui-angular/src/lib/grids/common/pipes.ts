import { Pipe, PipeTransform, Inject } from '@angular/core';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { DataUtil } from '../../data-operations/data-util';
import { cloneArray, resolveNestedPath } from '../../core/utils';
import { GridType } from './grid.interface';
import { IgxColumnComponent } from '../columns/column.component';
import { ColumnDisplayOrder } from './enums';
import { IgxColumnActionsComponent } from '../column-actions/column-actions.component';
import { IgxSummaryOperand, IgxSummaryResult } from '../grid/public_api';

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'igxCellStyleClasses'
})
export class IgxGridCellStyleClassesPipe implements PipeTransform {

    public transform(cssClasses: { [prop: string]: any }, _: any, data: any, field: string, index: number, __: number): string {
        if (!cssClasses) {
            return '';
        }

        const result = [];

        for (const cssClass of Object.keys(cssClasses)) {
            const callbackOrValue = cssClasses[cssClass];
            const apply = typeof callbackOrValue === 'function' ?
                callbackOrValue(data, field, resolveNestedPath(data, field), index) : callbackOrValue;
            if (apply) {
                result.push(cssClass);
            }
        }

        return result.join(' ');
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'igxCellStyles'
})
export class IgxGridCellStylesPipe implements PipeTransform {

    public transform(styles: { [prop: string]: any }, _: any, data: any, field: string, index: number, __: number):
     { [prop: string]: any } {
        const css = {};
        if (!styles) {
            return css;
        }

        for (const prop of Object.keys(styles)) {
            const res = styles[prop];
            css[prop] = typeof res === 'function' ? res(data, field, resolveNestedPath(data, field), index) : res;
        }

        return css;
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'igxNotGrouped'
})
export class IgxGridNotGroupedPipe implements PipeTransform {

    public transform(value: any[]): any[] {
        return value.filter(item => !item.columnGroup);
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'igxTopLevel'
})
export class IgxGridTopLevelColumns implements PipeTransform {

    public transform(value: any[]): any[] {
        return value.filter(item => item.level === 0);
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'filterCondition',
    pure: true
})
export class IgxGridFilterConditionPipe implements PipeTransform {

    public transform(value: string): string {
        return value.split(/(?=[A-Z])/).join(' ');
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'gridTransaction',
    pure: true
})
export class IgxGridTransactionPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>) { }

    public transform(collection: any[], _id: string, _pipeTrigger: number) {
        const grid: IgxGridBaseDirective = this.gridAPI.grid;

        if (grid.transactions.enabled) {
            const result = DataUtil.mergeTransactions(
                cloneArray(collection),
                grid.transactions.getAggregatedChanges(true),
                grid.primaryKey);
            return result;
        }
        return collection;
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'paginatorOptions',
    pure: true,
})
export class IgxGridPaginatorOptionsPipe implements PipeTransform {
    public transform(values: Array<number>) {
        return Array.from(new Set([...values])).sort((a, b) => a - b);
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'visibleColumns',
    pure: true
})
export class IgxHasVisibleColumnsPipe implements PipeTransform {
    public transform(values: any[], hasVisibleColumns) {
        if (!(values && values.length)) {
            return values;
        }
        return hasVisibleColumns ? values : [];
    }

}

/**
 * @hidden
 */
@Pipe({
    name: 'gridRowPinning',
    pure: true
})
export class IgxGridRowPinningPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>) { }

    public transform(collection: any[], id: string, isPinned = false, _pipeTrigger: number) {
        const grid = this.gridAPI.grid;

        if (grid.hasPinnedRecords && isPinned) {
            const result = collection.filter(rec => !grid.isSummaryRow(rec) && grid.isRecordPinned(rec));
            result.sort((rec1, rec2) => grid.getInitialPinnedIndex(rec1) - grid.getInitialPinnedIndex(rec2));
            return result;
        }

        grid.unpinnedRecords = collection;
        if (!grid.hasPinnedRecords) {
            grid.pinnedRecords = [];
            return isPinned ? [] : collection;
        }

        return collection.map((rec) => !grid.isSummaryRow(rec) &&
            grid.isRecordPinned(rec) ? { recordRef: rec, ghostRecord: true } : rec);
    }
}

@Pipe({
    name: 'columnActionEnabled',
    pure: true
})
export class IgxColumnActionEnabledPipe implements PipeTransform {

    constructor(@Inject(IgxColumnActionsComponent) protected columnActions: IgxColumnActionsComponent) { }

    public transform(
        collection: IgxColumnComponent[],
        actionFilter: (value: IgxColumnComponent, index: number, array: IgxColumnComponent[]) => boolean,
        _pipeTrigger: number
    ): IgxColumnComponent[] {
        if (!collection) {
            return collection;
        }
        let copy = collection.slice(0);
        if (copy.length && copy[0].grid.hasColumnLayouts) {
            copy = copy.filter(c => c.columnLayout);
        }
        if (actionFilter) {
            copy = copy.filter(actionFilter);
        }
        // Preserve the actionable collection for use in the component
        this.columnActions.actionableColumns = copy;
        return copy;
    }
}

@Pipe({
    name: 'filterActionColumns',
    pure: true
})
export class IgxFilterActionColumnsPipe implements PipeTransform {

    constructor(@Inject(IgxColumnActionsComponent) protected columnActions: IgxColumnActionsComponent) { }

    public transform(collection: IgxColumnComponent[], filterCriteria: string, _pipeTrigger: number): IgxColumnComponent[] {
        if (!collection) {
            return collection;
        }
        let copy = collection.slice(0);
        if (filterCriteria && filterCriteria.length > 0) {
            const filterFunc = (c) => {
                const filterText = c.header || c.field;
                if (!filterText) {
                    return false;
                }
                return filterText.toLocaleLowerCase().indexOf(filterCriteria.toLocaleLowerCase()) >= 0 ||
                    (c.children?.some(filterFunc) ?? false);
            };
            copy = collection.filter(filterFunc);
        }
        // Preserve the filtered collection for use in the component
        this.columnActions.filteredColumns = copy;
        return copy;
    }
}

@Pipe({
    name: 'sortActionColumns',
    pure: true
})
export class IgxSortActionColumnsPipe implements PipeTransform {

    public transform(collection: IgxColumnComponent[], displayOrder: ColumnDisplayOrder, _pipeTrigger: number): IgxColumnComponent[] {
        if (displayOrder === ColumnDisplayOrder.Alphabetical) {
            return collection.sort((a, b) => (a.header || a.field).localeCompare(b.header || b.field));
        }
        return collection;
    }
}

@Pipe({ name: 'dataMapper' })
export class IgxGridDataMapperPipe implements PipeTransform {

    public transform(data: any[], field: string, _: number, val: any, isNestedPath: boolean) {
        return isNestedPath ? resolveNestedPath(data, field) : val;
    }
}

@Pipe({ name: 'igxStringReplace' })
export class IgxStringReplacePipe implements PipeTransform {

    public transform(value: string, search: string | RegExp, replacement: string): string {
        return value.replace(search, replacement);
    }
}

@Pipe({ name: 'transactionState' })
export class IgxGridTransactionStatePipe implements PipeTransform {

    public transform(row_id: any, field: string, rowEditable: boolean, transactions: any, _: any, __: any, ___: any) {
        if (rowEditable) {
            const rowCurrentState = transactions.getAggregatedValue(row_id, false);
            if (rowCurrentState) {
                const value = resolveNestedPath(rowCurrentState, field);
                return value !== undefined && value !== null;
            }
        } else {
            const transaction = transactions.getState(row_id);
            const value = resolveNestedPath(transaction?.value ?? {}, field);
            return transaction && transaction.value && (value || value === 0 || value === false);
        }
    }
}

@Pipe({ name: 'columnFormatter' })
export class IgxColumnFormatterPipe implements PipeTransform {

    public transform(value: any, formatter: (v: any) => any) {
        return formatter(value);
    }
}

@Pipe({ name: 'summaryFormatter' })
export class IgxSummaryFormatterPipe implements PipeTransform {

    public transform(summaryResult: IgxSummaryResult, summaryOperand: IgxSummaryOperand,
        summaryFormatter: (s: IgxSummaryResult, o: IgxSummaryOperand) => any) {
        return summaryFormatter(summaryResult, summaryOperand);
    }
}

@Pipe({ name: 'gridAddRow' })
export class IgxGridAddRowPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>) { }

    public transform(collection: any, isPinned = false, _pipeTrigger: number) {
        const grid = this.gridAPI.grid;
        if (!grid.rowEditable || !grid.gridAPI.crudService.addRowParent || grid.gridAPI.crudService.cancelAddMode ||
            isPinned !== grid.gridAPI.crudService.addRowParent.isPinned) {
            return collection;
        }
        const copy = collection.slice(0);
        const parentIndex = grid.gridAPI.crudService.addRowParent.index;
        const row = grid.getEmptyRecordObjectFor(collection[parentIndex]);
        const rec = {
            recordRef: row,
            addRow: true
        };
        copy.splice(parentIndex + 1, 0, rec);
        if (isPinned) {
            grid.pinnedRecords = copy;
        } else {
            grid.unpinnedRecords = copy;
        }
        return copy;
    }
}

@Pipe({ name: 'igxHeaderGroupWidth' })
export class IgxHeaderGroupWidthPipe implements PipeTransform {

    public transform(width: any, minWidth: any, hasLayout: boolean ) {
        return hasLayout ? '' : `${Math.max(parseFloat(width), minWidth)}px`;
    }
}
