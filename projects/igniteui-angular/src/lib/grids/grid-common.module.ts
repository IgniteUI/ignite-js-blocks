import { NgModule } from '@angular/core';
import { IgxGridCellComponent } from './cell.component';
import { IgxGridFooterComponent } from './grid-footer/grid-footer.component';
import {
    IgxGridBodyDirective
} from './grid.common';
import { IgxGridTransaction } from './grid-base.directive';
import { IgxBaseTransactionService } from '../services/transaction/base-transaction';
import {
    IgxRowEditTemplateDirective,
    IgxRowEditActionsDirective,
    IgxRowEditTextDirective,
    IgxRowEditTabStopDirective
} from './grid.rowEdit.directive';
import { IgxPaginatorModule } from '../paginator/paginator.component';
import { IgxGridPipesModule } from './common/grid-pipes.module';
import { IgxGridExcelStyleFilteringModule } from './filtering/excel-style/grid.excel-style-filtering.module';
import { IgxRowDragModule } from './row-drag.directive';
import { IgxAdvancedFilteringDialogComponent } from './filtering/advanced-filtering/advanced-filtering-dialog.component';
import { IgxGridSelectionModule } from './selection/selection.module';
import { IgxGridResizingModule } from './resizing/resize.module';
import { IgxColumnMovingModule } from './moving/moving.module';
import { IgxGridSharedModules } from './common/shared.module';
import { IgxGridSummaryModule } from './summaries/summary.module';
import { IgxGridToolbarModule } from './toolbar/toolbar.module';
import { IgxColumnActionsModule } from './column-actions/column-actions.module';
import { IgxGridColumnModule } from './columns/column.module';
import { IgxGridHeadersModule } from './headers/headers.module';
import { IgxGridFilteringModule } from './filtering/base/filtering.module';
import { IgxRowDirective } from './row.directive';
import {
    IgxExcelStyleHeaderIconDirective,
    IgxHeaderCollapseIndicatorDirective,
    IgxHeaderExpandIndicatorDirective,
    IgxRowCollapsedIndicatorDirective,
    IgxRowExpandedIndicatorDirective
} from './grid/grid.directives';
/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxRowDirective,
        IgxGridCellComponent,
        IgxRowEditTemplateDirective,
        IgxRowEditActionsDirective,
        IgxRowEditTextDirective,
        IgxRowEditTabStopDirective,
        IgxGridBodyDirective,
        IgxGridFooterComponent,
        IgxAdvancedFilteringDialogComponent,
        IgxRowExpandedIndicatorDirective,
        IgxRowCollapsedIndicatorDirective,
        IgxHeaderExpandIndicatorDirective,
        IgxHeaderCollapseIndicatorDirective,
        IgxExcelStyleHeaderIconDirective,
    ],
    entryComponents: [
        IgxAdvancedFilteringDialogComponent
    ],
    exports: [
        IgxGridCellComponent,
        IgxRowEditTemplateDirective,
        IgxRowEditActionsDirective,
        IgxRowEditTextDirective,
        IgxRowEditTabStopDirective,
        IgxGridBodyDirective,
        IgxColumnActionsModule,
        IgxGridColumnModule,
        IgxGridHeadersModule,
        IgxGridPipesModule,
        IgxGridFilteringModule,
        IgxGridExcelStyleFilteringModule,
        IgxRowDragModule,
        IgxPaginatorModule,
        IgxGridFooterComponent,
        IgxGridResizingModule,
        IgxColumnMovingModule,
        IgxGridSelectionModule,
        IgxGridSummaryModule,
        IgxGridToolbarModule,
        IgxAdvancedFilteringDialogComponent,
        IgxGridSharedModules,
        IgxRowExpandedIndicatorDirective,
        IgxRowCollapsedIndicatorDirective,
        IgxHeaderExpandIndicatorDirective,
        IgxHeaderCollapseIndicatorDirective,
        IgxExcelStyleHeaderIconDirective,
    ],
    imports: [
        IgxGridColumnModule,
        IgxGridHeadersModule,
        IgxColumnMovingModule,
        IgxGridResizingModule,
        IgxGridSelectionModule,
        IgxGridSummaryModule,
        IgxGridToolbarModule,
        IgxColumnActionsModule,
        IgxGridPipesModule,
        IgxGridFilteringModule,
        IgxGridExcelStyleFilteringModule,
        IgxRowDragModule,
        IgxPaginatorModule,
        IgxGridSharedModules
    ],
    providers: [
        { provide: IgxGridTransaction, useClass: IgxBaseTransactionService }
    ]
})
export class IgxGridCommonModule { }
