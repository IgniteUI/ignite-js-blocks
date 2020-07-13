import { Component, OnInit, ViewChild } from '@angular/core';
import { IgxCalendarComponent, DateRangeType, CalendarView } from 'igniteui-angular';
import { IViewDateChangeEventArgs } from '../../../projects/igniteui-angular/src/lib/calendar/calendar-base';

@Component({
    selector: 'app-calendar-sample',
    templateUrl: 'calendar.sample.html',
    styleUrls: ['calendar.sample.scss']
})
export class CalendarSampleComponent implements OnInit {
    @ViewChild('calendar', { static: true }) calendar: IgxCalendarComponent;
    @ViewChild('calendar1', { read: IgxCalendarComponent, static: true }) calendar1: IgxCalendarComponent;

    ngOnInit() {
        this.calendar.disabledDates = [{
            type: DateRangeType.Specific, dateRange: [
                new Date(2019, 5, 13),
                new Date(2019, 5, 27),
                new Date(2019, 5, 30),
                new Date(2019, 6, 1),
                new Date(2019, 5, 1),
                new Date(2019, 4, 31)
            ]
        }];

        this.calendar.specialDates = [{
            type: DateRangeType.Specific, dateRange: [
                new Date(2019, 7, 1),
                new Date(2019, 7, 4),
                new Date(2019, 7, 15),
                new Date(2019, 7, 14)
            ]
        }];
    }

    public showHide() {
        this.calendar.hideOutsideDays = !this.calendar.hideOutsideDays;
    }

    public onSelection(event: Date) {
        const date = event;
    }

    public onViewDateChanged(event: IViewDateChangeEventArgs) {
        console.log(event);
    }

    public onActiveViewChanged(event: CalendarView) {
    }

    public setSelection(args: string) {
        this.calendar.selection = args;
    }

    public setMonthsViewNumber(args: HTMLInputElement) {
        this.calendar.monthsViewNumber = parseInt(args.value, 10);
    }

    public multiSelect() {
        this.calendar.selectDate([new Date('2018-09-29'), new Date('2018-09-20'), new Date('2018-09-26'), new Date('2018-09-05')]);
    }

    public multiDeselect() {
        this.calendar.deselectDate();
    }

    public select() {
        // Working with range selection type
        this.calendar1.selectDate([new Date('2018-09-20'), new Date('2018-09-26'), new Date('2018-09-28')]);

        // Working with range/multi selection type
        // this.calendar1.selectDate([new Date('2018-09-29'), new Date('2018-09-20'), new Date('2018-09-26'), new Date('2018-09-05')]);

        // Deselect on Range should deselect the range not only passed dates
        // this.calendar1.selectDate([new Date('2018-09-26'), new Date('2018-09-28'), new Date('2018-09-22'), new Date('2018-09-10')]);
    }

    public deselect() {
        // Working with range selection type
        // this.calendar1.deselectDate([new Date('2018-09-20'), new Date('2018-09-26'), new Date('2018-09-28')]);

        // Working with range/multi selection type
        // this.calendar1.deselectDate([new Date('2018-09-29'), new Date('2018-09-20'), new Date('2018-09-26'), new Date('2018-09-05')]);

        // Working
        // this.calendar1.deselectDate();

        // Working - deselect only fraction of the range
        // this.calendar1.deselectDate([new Date('2018-09-26'), new Date('2018-09-28')]);

        // Deselect today
        this.calendar1.deselectDate([new Date(), new Date('2018-09-26')]);

        // Deselect today array
        // this.calendar1.deselectDate([new Date()]);

        // Invalid date
        // this.calendar1.deselectDate(new Date('22/09/18'));

        // Deselect single selection with array of date
        // this.calendar1.deselectDate([new Date()]);

        // Deselect multi selection with array of date
        // this.calendar1.deselectDate([new Date()]);

        // Deselect multi selection with array of date that is in the array and one that isn't
        // this.calendar1.deselectDate(new Date('2018-09-20'));
    }
}
