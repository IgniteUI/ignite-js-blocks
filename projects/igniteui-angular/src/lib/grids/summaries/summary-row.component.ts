import { Component, Input,
    ViewChildren, QueryList,
    HostBinding, ViewChild,
    ElementRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    DoCheck} from '@angular/core';
import { IgxSummaryResult } from './grid-summary';
import { IgxSummaryCellComponent } from './summary-cell.component';
import { IgxGridForOfDirective } from '../../directives/for-of/for_of.directive';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseComponent, IGridDataBindable } from '../grid-base.component';
import { IgxColumnComponent } from '../column.component';
import { DisplayDensity } from '../../core/density';
import { IgxForOfSyncService } from '../../directives/for-of/for_of.sync.service';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-summary-row',
    templateUrl: './summary-row.component.html',
    providers: [IgxForOfSyncService]
})
export class IgxSummaryRowComponent implements DoCheck  {

    @Input()
    public summaries: Map<string, IgxSummaryResult[]>;

    @Input()
    public gridID;

    @Input()
    public index: number;

    @Input()
    public indentation = 0;

    @Input()
    public firstCellIndentation = -1;

    @HostBinding('attr.data-rowIndex')
    get dataRowIndex() {
        return this.index;
    }

    get minHeight() {
        return this.grid.summaryService.calcMaxSummaryHeight() - 1;
    }

    @ViewChildren(IgxSummaryCellComponent, { read: IgxSummaryCellComponent })
    public summaryCells: QueryList<IgxSummaryCellComponent>;

    /**
     * @hidden
     */
    @ViewChild('igxDirRef', { read: IgxGridForOfDirective })
    public virtDirRow: IgxGridForOfDirective<any>;

    constructor(public gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>,
                public element: ElementRef,
                public cdr: ChangeDetectorRef) {}

    public ngDoCheck() {
        this.cdr.detectChanges();
    }

    public get grid() {
        return this.gridAPI.get(this.gridID);
    }
    public get nativeElement() {
        return this.element.nativeElement;
    }

    public getColumnSummaries(columnName) {
        if (!this.summaries.get(columnName)) {
            return [];
        }
        return this.summaries.get(columnName);

    }
    /**
     * @hidden
     */
    public notGroups(columns) {
        return columns.filter(c => !c.columnGroup);
    }

    /**
     * @hidden
     */
    public get pinnedColumns(): IgxColumnComponent[] {
        return this.grid.pinnedColumns;
    }

    /**
     * @hidden
     */
    public get unpinnedColumns(): IgxColumnComponent[] {
        return this.grid.unpinnedColumns;
    }
}
