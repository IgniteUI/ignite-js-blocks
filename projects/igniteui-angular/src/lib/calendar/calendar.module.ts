import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxIconModule } from '../icon/public_api';
import { IgxCalendarComponent } from './calendar.component';
import {
    IgxCalendarHeaderTemplateDirective,
    IgxCalendarMonthDirective,
    IgxCalendarSubheaderTemplateDirective,
    IgxCalendarYearDirective,
    IgxCalendarScrollMonthDirective
} from './calendar.directives';
import { IgxMonthsViewComponent } from './months-view/months-view.component';
import { IgxYearsViewComponent } from './years-view/years-view.component';
import { IgxDaysViewComponent } from './days-view/days-view.component';
import { IgxDayItemComponent } from './days-view/day-item.component';
import { IgxMonthPickerComponent } from './month-picker/month-picker.component';
import { IgxCalendarBaseDirective } from './calendar-base';
import { IgxMonthPickerBaseDirective } from './month-picker-base';
import { IgxMonthViewSlotsCalendar, IgxGetViewDateCalendar } from './months-view.pipe';

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxCalendarBaseDirective,
        IgxMonthPickerBaseDirective,
        IgxDayItemComponent,
        IgxDaysViewComponent,
        IgxCalendarComponent,
        IgxCalendarHeaderTemplateDirective,
        IgxCalendarMonthDirective,
        IgxCalendarYearDirective,
        IgxCalendarSubheaderTemplateDirective,
        IgxCalendarScrollMonthDirective,
        IgxMonthsViewComponent,
        IgxYearsViewComponent,
        IgxMonthPickerComponent,
        IgxMonthViewSlotsCalendar,
        IgxGetViewDateCalendar
    ],
    exports: [
        IgxCalendarComponent,
        IgxDaysViewComponent,
        IgxMonthsViewComponent,
        IgxYearsViewComponent,
        IgxMonthPickerComponent,
        IgxCalendarHeaderTemplateDirective,
        IgxCalendarMonthDirective,
        IgxCalendarYearDirective,
        IgxCalendarSubheaderTemplateDirective
    ],
    imports: [CommonModule, FormsModule, IgxIconModule]
})
export class IgxCalendarModule { }
