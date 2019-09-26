import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IgxGroupAreaDropDirective,
    IgxGroupByRowTemplateDirective,
    IgxRowExpandedIndicatorDirective,
    IgxRowCollapsedIndicatorDirective,
    IgxHeaderExpandIndicatorDirective,
    IgxHeaderCollapseIndicatorDirective
} from './grid.directives';
import { IgxGridComponent } from './grid.component';
import {
    IgxGridPagingPipe,
    IgxGridGroupingPipe,
    IgxGridSortingPipe,
    IgxGridFilteringPipe
} from './grid.pipes';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { IgxGridRowComponent } from './grid-row.component';
import { IgxChipsModule } from '../../chips/chips.module';
import { IgxGridCommonModule } from '../grid-common.module';
import { DeprecateMethod } from '../../core/deprecateDecorators';
import { IgxGridSummaryPipe } from './grid.summary.pipe';
import { IgxSelectModule } from '../../select/index';

/**
 * @hidden
 */
@NgModule({
  declarations: [
    IgxGridComponent,
    IgxGridRowComponent,
    IgxGridGroupByRowComponent,
    IgxGroupByRowTemplateDirective,
    IgxRowExpandedIndicatorDirective,
    IgxRowCollapsedIndicatorDirective,
    IgxHeaderExpandIndicatorDirective,
    IgxHeaderCollapseIndicatorDirective,
    IgxGroupAreaDropDirective,
    IgxGridGroupingPipe,
    IgxGridPagingPipe,
    IgxGridSortingPipe,
    IgxGridFilteringPipe,
    IgxGridSummaryPipe
  ],
  exports: [
    IgxGridComponent,
    IgxGridGroupByRowComponent,
    IgxGridRowComponent,
    IgxGroupByRowTemplateDirective,
    IgxRowExpandedIndicatorDirective,
    IgxRowCollapsedIndicatorDirective,
    IgxHeaderExpandIndicatorDirective,
    IgxHeaderCollapseIndicatorDirective,
    IgxGroupAreaDropDirective,
    IgxGridCommonModule,
    IgxGridGroupingPipe,
    IgxGridPagingPipe,
    IgxGridSortingPipe,
    IgxGridFilteringPipe,
    IgxGridSummaryPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    IgxChipsModule,
    IgxGridCommonModule,
    IgxSelectModule
  ]
})
export class IgxGridModule {
  @DeprecateMethod('IgxGridModule.forRoot method is deprecated. Use IgxGridModule instead.')
  public static forRoot() {
    return {
        ngModule: IgxGridModule
    };
  }
}
