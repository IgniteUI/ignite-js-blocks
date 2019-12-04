import { IgxCalendarBaseDirective } from './calendar-base';
import { ViewChild, ElementRef, HostBinding, Directive } from '@angular/core';
import { KEYS } from '../core/utils';

/**
 * Sets the calender view - days, months or years.
 */
export enum CalendarView {
    DEFAULT,
    YEAR,
    DECADE
}
@Directive({
    selector: '[igxMonthPickerBase]'
})
export class IgxMonthPickerBaseDirective extends IgxCalendarBaseDirective {

    /**
     * @hidden
     */
    @ViewChild('yearsBtn')
    public yearsBtn: ElementRef;

    /**
     * The default `tabindex` attribute for the component.
     *
     * @hidden
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

    /**
     * Gets the current active view.
     */
    public get activeView(): CalendarView {
        return this._activeView;
    }

    /**
     * Sets the current active view.
     */
    public set activeView(val: CalendarView) {
        this._activeView = val;
    }

    /**
     * @hidden
     */
    public get isDefaultView(): boolean {
        return this._activeView === CalendarView.DEFAULT;
    }

    /**
     * @hidden
     */
    public get isDecadeView(): boolean {
        return this._activeView === CalendarView.DECADE;
    }

    /**
     *@hidden
     */
    private _activeView = CalendarView.DEFAULT;

    /**
     * @hidden
     */
    public changeYear(event: Date) {
        this.viewDate = new Date(event.getFullYear(), this.viewDate.getMonth());
        this._activeView = CalendarView.DEFAULT;

        requestAnimationFrame(() => {
            if (this.yearsBtn) { this.yearsBtn.nativeElement.focus(); }
        });
    }

    /**
     * @hidden
     */
    public activeViewDecade(args?: Date): void {
        this._activeView = CalendarView.DECADE;
    }

    /**
     * @hidden
     */
    public activeViewDecadeKB(event, args?: Date) {
        if (event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE || event.key === KEYS.ENTER) {
            event.preventDefault();
            this.activeViewDecade(args);
        }
    }

    /**
     * Returns the locale representation of the year in the year view if enabled,
     * otherwise returns the default `Date.getFullYear()` value.
     *
     * @hidden
     */
    public formattedYear(value: Date): string {
        if (this.formatViews.year) {
            return this.formatterYear.format(value);
        }
        return `${value.getFullYear()}`;
    }
}
