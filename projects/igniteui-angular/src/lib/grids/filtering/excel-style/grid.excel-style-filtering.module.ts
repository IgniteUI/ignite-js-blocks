import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxExcelStyleLoadingValuesTemplateDirective } from './excel-style-search.component';
import {
    IgxGridExcelStyleFilteringComponent,
    IgxExcelStyleSortingTemplateDirective,
    IgxExcelStyleHidingTemplateDirective,
    IgxExcelStyleMovingTemplateDirective,
    IgxExcelStylePinningTemplateDirective,
    IgxExcelStyleSelectingTemplateDirective
} from './grid.excel-style-filtering.component';
import { IgxExcelStyleSortingComponent } from './excel-style-sorting.component';
import { IgxExcelStyleColumnMovingComponent } from './excel-style-column-moving.component';
import { IgxExcelStyleSearchComponent } from './excel-style-search.component';
import { IgxExcelStyleCustomDialogComponent } from './excel-style-custom-dialog.component';
import { IgxExcelStyleDefaultExpressionComponent } from './excel-style-default-expression.component';
import { IgxExcelStyleDateExpressionComponent } from './excel-style-date-expression.component';
import { IgxSelectionAPIService } from '../../../core/selection';
import { FormsModule } from '@angular/forms';
import { IgxGridPipesModule } from '../../common/grid-pipes.module';
import { IgxButtonModule } from '../../../directives/button/button.directive';
import { IgxButtonGroupModule } from '../../../buttonGroup/buttonGroup.component';
import { IgxDatePickerModule } from '../../../date-picker/date-picker.component';
import { IgxIconModule } from '../../../icon/public_api';
import { IgxRippleModule } from '../../../directives/ripple/ripple.directive';
import { IgxInputGroupModule } from '../../../input-group/input-group.component';
import { IgxDropDownModule } from '../../../drop-down/public_api';
import { IgxForOfModule } from '../../../directives/for-of/for_of.directive';
import { IgxCheckboxModule } from '../../../checkbox/checkbox.component';
import { IgxFilterModule } from '../../../directives/filter/filter.directive';
import { IgxToggleModule } from '../../../directives/toggle/toggle.directive';
import { IgxListModule } from '../../../list/list.component';
import { IgxExcelStyleSearchFilterPipe } from './excel-style-search.pipe';
import { IgxProgressBarModule } from '../../../progressbar/progressbar.component';
import { IgxSelectModule } from './../../../select/select.module';

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxGridExcelStyleFilteringComponent,
        IgxExcelStyleSortingComponent,
        IgxExcelStyleColumnMovingComponent,
        IgxExcelStyleSearchComponent,
        IgxExcelStyleCustomDialogComponent,
        IgxExcelStyleDefaultExpressionComponent,
        IgxExcelStyleDateExpressionComponent,
        IgxExcelStyleSortingTemplateDirective,
        IgxExcelStyleHidingTemplateDirective,
        IgxExcelStyleMovingTemplateDirective,
        IgxExcelStylePinningTemplateDirective,
        IgxExcelStyleSelectingTemplateDirective,
        IgxExcelStyleLoadingValuesTemplateDirective,
        IgxExcelStyleSearchFilterPipe
    ],
    exports: [
        IgxGridExcelStyleFilteringComponent,
        IgxExcelStyleSortingTemplateDirective,
        IgxExcelStyleHidingTemplateDirective,
        IgxExcelStyleMovingTemplateDirective,
        IgxExcelStylePinningTemplateDirective,
        IgxExcelStyleSelectingTemplateDirective,
        IgxExcelStyleLoadingValuesTemplateDirective,
        IgxExcelStyleDateExpressionComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        IgxGridPipesModule,
        IgxButtonModule,
        IgxButtonGroupModule,
        IgxDatePickerModule,
        IgxIconModule,
        IgxRippleModule,
        IgxInputGroupModule,
        IgxDropDownModule,
        IgxForOfModule,
        IgxCheckboxModule,
        IgxFilterModule,
        IgxToggleModule,
        IgxListModule,
        IgxProgressBarModule,
        IgxSelectModule,
    ],
    entryComponents: [
        IgxGridExcelStyleFilteringComponent
    ],
    providers: [
        IgxSelectionAPIService
    ]
})
export class IgxGridExcelStyleFilteringModule {

}
