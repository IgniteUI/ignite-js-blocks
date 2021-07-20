/* eslint-disable @angular-eslint/no-conflicting-lifecycle */
import {
  Directive, Input, ElementRef,
  Renderer2, NgModule, Output, EventEmitter, Inject,
  LOCALE_ID, OnChanges, SimpleChanges, HostListener, OnInit
} from '@angular/core';
import {
  ControlValueAccessor,
  Validator, AbstractControl, ValidationErrors, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { IgxMaskDirective } from '../mask/mask.directive';
import { MaskParsingService } from '../mask/mask-parsing.service';
import { isDate, PlatformUtil } from '../../core/utils';
import { IgxDateTimeEditorEventArgs, DatePartInfo, DatePart } from './date-time-editor.common';
import { noop } from 'rxjs';
import { DatePartDeltas } from './date-time-editor.common';
import { DateTimeUtil } from '../../date-common/util/date-time.util';

/**
 * Date Time Editor provides a functionality to input, edit and format date and time.
 *
 * @igxModule IgxDateTimeEditorModule
 *
 * @igxParent IgxInputGroup
 *
 * @igxTheme igx-input-theme
 *
 * @igxKeywords date, time, editor
 *
 * @igxGroup Scheduling
 *
 * @remarks
 *
 * The Ignite UI Date Time Editor Directive makes it easy for developers to manipulate date/time user input.
 * It requires input in a specified or default input format which is visible in the input element as a placeholder.
 * It allows the input of only date (ex: 'dd/MM/yyyy'), only time (ex:'HH:mm tt') or both at once, if needed.
 * Supports display format that may differ from the input format.
 * Provides methods to increment and decrement any specific/targeted `DatePart`.
 *
 * @example
 * ```html
 * <igx-input-group>
 *   <input type="text" igxInput [igxDateTimeEditor]="'dd/MM/yyyy'" [displayFormat]="'shortDate'" [(ngModel)]="date"/>
 * </igx-input-group>
 * ```
 */
@Directive({
  selector: '[igxDateTimeEditor]',
  exportAs: 'igxDateTimeEditor',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: IgxDateTimeEditorDirective, multi: true },
    { provide: NG_VALIDATORS, useExisting: IgxDateTimeEditorDirective, multi: true }
  ]
})
export class IgxDateTimeEditorDirective extends IgxMaskDirective implements OnChanges, OnInit, Validator, ControlValueAccessor {
  /**
   * Locale settings used for value formatting.
   *
   * @remarks
   * Uses Angular's `LOCALE_ID` by default. Affects both input mask and display format if those are not set.
   * If a `locale` is set, it must be registered via `registerLocaleData`.
   * Please refer to https://angular.io/guide/i18n#i18n-pipes.
   * If it is not registered, `Intl` will be used for formatting.
   *
   * @example
   * ```html
   * <input igxDateTimeEditor [locale]="'en'">
   * ```
   */
  @Input()
  public locale: string;

  /**
   * Minimum value required for the editor to remain valid.
   *
   * @remarks
   * If a `string` value is passed, it must be in the defined input format.
   *
   * @example
   * ```html
   * <input igxDateTimeEditor [minValue]="minDate">
   * ```
   */
  public get minValue(): string | Date {
    return this._minValue;
  }

  @Input()
  public set minValue(value: string | Date) {
    this._minValue = value;
    this.onValidatorChange();
  }

  /**
   * Maximum value required for the editor to remain valid.
   *
   * @remarks
   * If a `string` value is passed in, it must be in the defined input format.
   *
   * @example
   * ```html
   * <input igxDateTimeEditor [maxValue]="maxDate">
   * ```
   */
  public get maxValue(): string | Date {
    return this._maxValue;
  }

  @Input()
  public set maxValue(value: string | Date) {
    this._maxValue = value;
    this.onValidatorChange();
  }

  /**
   * Specify if the currently spun date segment should loop over.
   *
   * @example
   * ```html
   * <input igxDateTimeEditor [spinLoop]="false">
   * ```
   */
  @Input()
  public spinLoop = true;

  /**
   * Set both pre-defined format options such as `shortDate` and `longDate`,
   * as well as constructed format string using characters supported by `DatePipe`, e.g. `EE/MM/yyyy`.
   *
   * @example
   * ```html
   * <input igxDateTimeEditor [displayFormat]="'shortDate'">
   * ```
   */
  @Input()
  public displayFormat: string;

  /**
   * Expected user input format (and placeholder).
   *
   * @example
   * ```html
   * <input [igxDateTimeEditor]="'dd/MM/yyyy'">
   * ```
   */
  @Input(`igxDateTimeEditor`)
  public set inputFormat(value: string) {
    if (value) {
      this.setMask(value);
      this._inputFormat = value;
    }
  }

  public get inputFormat(): string {
    return this._inputFormat || this._defaultInputFormat;
  }

  /**
   * Editor value.
   *
   * @example
   * ```html
   * <input igxDateTimeEditor [value]="date">
   * ```
   */
  @Input()
  public set value(value: Date | string) {
    this._value = value;
    this.setDateValue(value);
    this.onChangeCallback(value);
    this.updateMask();
  }

  public get value(): Date | string {
    return this._value;
  }

  /**
   * Delta values used to increment or decrement each editor date part on spin actions.
   * All values default to `1`.
   *
   * @example
   * ```html
   * <input igxDateTimeEditor [spinDelta]="{date: 5, minute: 30}">
   * ```
   */
  @Input()
  public spinDelta: DatePartDeltas;

  /**
   * Emitted when the editor's value has changed.
   *
   * @example
   * ```html
   * <input igxDateTimeEditor (valueChange)="valueChange($event)"/>
   * ```
   */
  @Output()
  public valueChange = new EventEmitter<Date | string>();

  /**
   * Emitted when the editor is not within a specified range or when the editor's value is in an invalid state.
   *
   * @example
   * ```html
   * <input igxDateTimeEditor [minValue]="minDate" [maxValue]="maxDate" (validationFailed)="onValidationFailed($event)"/>
   * ```
   */
  @Output()
  public validationFailed = new EventEmitter<IgxDateTimeEditorEventArgs>();

  private _inputFormat: string;
  private _oldValue: Date;
  private _dateValue: Date;
  private _onClear: boolean;
  private document: Document;
  private _isFocused: boolean;
  private _defaultInputFormat: string;
  private _value: Date | string;
  private _minValue: Date | string;
  private _maxValue: Date | string;
  private _inputDateParts: DatePartInfo[];
  private _datePartDeltas: DatePartDeltas = {
    date: 1,
    month: 1,
    year: 1,
    hours: 1,
    minutes: 1,
    seconds: 1
  };
  private onTouchCallback: (...args: any[]) => void = noop;
  private onChangeCallback: (...args: any[]) => void = noop;
  private onValidatorChange: (...args: any[]) => void = noop;

  private get datePartDeltas(): DatePartDeltas {
    return Object.assign({}, this._datePartDeltas, this.spinDelta);
  }

  private get emptyMask(): string {
    return this.maskParser.applyMask(null, this.maskOptions);
  }

  private get targetDatePart(): DatePart {
    if (this.document.activeElement === this.nativeElement) {
      return this._inputDateParts
        .find(p => p.start <= this.selectionStart && this.selectionStart <= p.end && p.type !== DatePart.Literal)?.type;
    } else {
      if (this._inputDateParts.some(p => p.type === DatePart.Date)) {
        return DatePart.Date;
      } else if (this._inputDateParts.some(p => p.type === DatePart.Hours)) {
        return DatePart.Hours;
      }
    }
  }

  private get hasDateParts(): boolean {
    return this._inputDateParts.some(
      p => p.type === DatePart.Date
        || p.type === DatePart.Month
        || p.type === DatePart.Year);
  }

  private get hasTimeParts(): boolean {
    return this._inputDateParts.some(
      p => p.type === DatePart.Hours
        || p.type === DatePart.Minutes
        || p.type === DatePart.Seconds);
  }

  private get dateValue(): Date {
    return this._dateValue;
  }

  constructor(
    protected renderer: Renderer2,
    protected elementRef: ElementRef,
    protected maskParser: MaskParsingService,
    protected platform: PlatformUtil,
    @Inject(DOCUMENT) private _document: any,
    @Inject(LOCALE_ID) private _locale: any) {
    super(elementRef, maskParser, renderer, platform);
    this.document = this._document as Document;
    this.locale = this.locale || this._locale;
  }

  @HostListener('wheel', ['$event'])
  public onWheel(event: WheelEvent): void {
    if (!this._isFocused) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (event.deltaY > 0) {
      this.decrement();
    } else {
      this.increment();
    }
  }

  public ngOnInit(): void {
    this.updateDefaultFormat();
    this.setMask(this.inputFormat);
    this.updateMask();
  }

  /** @hidden @internal */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['locale'] && !changes['locale'].firstChange) {
      this.updateDefaultFormat();
      if (!this._inputFormat) {
        this.setMask(this.inputFormat);
        this.updateMask();
      }
    }
    if (changes['inputFormat'] && !changes['inputFormat'].firstChange) {
      this.updateMask();
    }
  }


  /** Clear the input element value. */
  public clear(): void {
    this._onClear = true;
    this.updateValue(null);
    this.setSelectionRange(0, this.inputValue.length);
    this._onClear = false;
  }

  /**
   * Increment specified DatePart.
   *
   * @param datePart The optional DatePart to increment. Defaults to Date or Hours (when Date is absent from the inputFormat - ex:'HH:mm').
   * @param delta The optional delta to increment by. Overrides `spinDelta`.
   */
  public increment(datePart?: DatePart, delta?: number): void {
    const targetPart = datePart || this.targetDatePart;
    if (!targetPart) {
      return;
    }
    const newValue = this.trySpinValue(targetPart, delta);
    this.updateValue(newValue);
  }

  /**
   * Decrement specified DatePart.
   *
   * @param datePart The optional DatePart to decrement. Defaults to Date or Hours (when Date is absent from the inputFormat - ex:'HH:mm').
   * @param delta The optional delta to decrement by. Overrides `spinDelta`.
   */
  public decrement(datePart?: DatePart, delta?: number): void {
    const targetPart = datePart || this.targetDatePart;
    if (!targetPart) {
      return;
    }
    const newValue = this.trySpinValue(targetPart, delta, true);
    this.updateValue(newValue);
  }

  /** @hidden @internal */
  public writeValue(value: any): void {
    this._value = value;
    this.setDateValue(value);
    this.updateMask();
  }

  /** @hidden @internal */
  public validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    // InvalidDate handling
    if (isDate(control.value) && !DateTimeUtil.isValidDate(control.value)) {
      return { value: true };
    }

    let errors = {};
    const value = DateTimeUtil.isValidDate(control.value) ? control.value : DateTimeUtil.parseIsoDate(control.value);
    const minValueDate = DateTimeUtil.isValidDate(this.minValue) ? this.minValue : this.parseDate(this.minValue);
    const maxValueDate = DateTimeUtil.isValidDate(this.maxValue) ? this.maxValue : this.parseDate(this.maxValue);
    if (minValueDate || maxValueDate) {
      errors = DateTimeUtil.validateMinMax(value,
        minValueDate, maxValueDate,
        this.hasTimeParts, this.hasDateParts);
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  /** @hidden @internal */
  public registerOnValidatorChange?(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  /** @hidden @internal */
  public registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  /** @hidden @internal */
  public registerOnTouched(fn: any): void {
    this.onTouchCallback = fn;
  }

  /** @hidden @internal */
  public setDisabledState?(_isDisabled: boolean): void { }

  /** @hidden @internal */
  public onCompositionEnd(): void {
    super.onCompositionEnd();

    this.updateValue(this.parseDate(this.inputValue));
    this.updateMask();
  }

  /** @hidden @internal */
  public onInputChanged(event): void {
    super.onInputChanged(event);
    if (this._composing) {
      return;
    }

    if (this.inputIsComplete()) {
      const parsedDate = this.parseDate(this.inputValue);
      if (DateTimeUtil.isValidDate(parsedDate)) {
        this.updateValue(parsedDate);
      } else {
        const oldValue = this.value && new Date(this.dateValue.getTime());
        const args: IgxDateTimeEditorEventArgs = { oldValue, newValue: parsedDate, userInput: this.inputValue };
        this.validationFailed.emit(args);
        if (DateTimeUtil.isValidDate(args.newValue)) {
          this.updateValue(args.newValue);
        } else {
          this.updateValue(null);
        }
      }
    } else {
      this.updateValue(null);
    }
  }

  /** @hidden @internal */
  public onKeyDown(event: KeyboardEvent): void {
    if (this.nativeElement.readOnly) {
      return;
    }
    super.onKeyDown(event);
    const key = event.key;

    if (event.altKey) {
      return;
    }

    if (key === this.platform.KEYMAP.ARROW_DOWN || key === this.platform.KEYMAP.ARROW_UP) {
      this.spin(event);
      return;
    }

    if (event.ctrlKey && key === this.platform.KEYMAP.SEMICOLON) {
      this.updateValue(new Date());
    }

    this.moveCursor(event);
  }

  /** @hidden @internal */
  public onFocus(): void {
    if (this.nativeElement.readOnly) {
      return;
    }
    this._isFocused = true;
    this.onTouchCallback();
    this.updateMask();
    super.onFocus();
  }

  /** @hidden @internal */
  public onBlur(value: string): void {
    this._isFocused = false;
    if (!this.inputIsComplete() && this.inputValue !== this.emptyMask) {
      this.updateValue(this.parseDate(this.inputValue));
    } else {
      this.updateMask();
    }

    // TODO: think of a better way to set displayValuePipe in mask directive
    if (this.displayValuePipe) {
      return;
    }

    super.onBlur(value);
  }

  // the date editor sets its own inputFormat as its placeholder if none is provided
  /** @hidden */
  protected setPlaceholder(_value: string): void { }

  private updateDefaultFormat(): void {
    this._defaultInputFormat = DateTimeUtil.getDefaultInputFormat(this.locale);
  }

  private updateMask(): void {
    if (this._isFocused) {
      // store the cursor position as it will be moved during masking
      const cursor = this.selectionEnd;
      this.inputValue = this.getMaskedValue();
      this.setSelectionRange(cursor);
    } else {
      if (!this.dateValue || !DateTimeUtil.isValidDate(this.dateValue)) {
        this.inputValue = '';
        return;
      }
      if (this.displayValuePipe) {
        // TODO: remove when formatter func has been deleted
        this.inputValue = this.displayValuePipe.transform(this.value);
        return;
      }
      const format = this.displayFormat || this.inputFormat;
      if (format) {
        this.inputValue = DateTimeUtil.formatDate(this.dateValue, format.replace('tt', 'aa'), this.locale);
      } else {
        this.inputValue = this.dateValue.toLocaleString();
      }
    }
  }

  private setMask(inputFormat: string): void {
    const oldFormat = this._inputDateParts?.map(p => p.format).join('');
    this._inputDateParts = DateTimeUtil.parseDateTimeFormat(inputFormat);
    inputFormat = this._inputDateParts.map(p => p.format).join('');
    const mask = (inputFormat || DateTimeUtil.DEFAULT_INPUT_FORMAT)
      .replace(new RegExp(/(?=[^t])[\w]/, 'g'), '0');
    this.mask = mask.indexOf('tt') !== -1 ? mask.replace(new RegExp('tt', 'g'), 'LL') : mask;

    const placeholder = this.nativeElement.placeholder;
    if (!placeholder || oldFormat === placeholder) {
      this.renderer.setAttribute(this.nativeElement, 'placeholder', inputFormat);
    }
  }

  private parseDate(val: string): Date | null {
    if (!val) {
      return null;
    }

    return DateTimeUtil.parseValueFromMask(val, this._inputDateParts, this.promptChar);
  }

  private getMaskedValue(): string {
    let mask = this.emptyMask;
    if (DateTimeUtil.isValidDate(this.value)) {
      for (const part of this._inputDateParts) {
        if (part.type === DatePart.Literal) {
          continue;
        }
        const targetValue = this.getPartValue(part, part.format.length);
        mask = this.maskParser.replaceInMask(mask, targetValue, this.maskOptions, part.start, part.end).value;
      }
      return mask;
    }
    if (!this.inputIsComplete() || !this._onClear) {
      return this.inputValue;
    }
    return mask;
  }


  private valueInRange(value: Date): boolean {
    if (!value) {
      return false;
    }

    let errors = {};
    const minValueDate = DateTimeUtil.isValidDate(this.minValue) ? this.minValue : this.parseDate(this.minValue);
    const maxValueDate = DateTimeUtil.isValidDate(this.maxValue) ? this.maxValue : this.parseDate(this.maxValue);
    if (minValueDate || maxValueDate) {
      errors = DateTimeUtil.validateMinMax(value,
        this.minValue, this.maxValue,
        this.hasTimeParts, this.hasDateParts);
    }

    return Object.keys(errors).length === 0;
  }

  private spinValue(datePart: DatePart, delta: number): Date {
    if (!this.dateValue || !DateTimeUtil.isValidDate(this.dateValue)) {
      return null;
    }
    const newDate = new Date(this.dateValue.getTime());
    switch (datePart) {
      case DatePart.Date:
        DateTimeUtil.spinDate(delta, newDate, this.spinLoop);
        break;
      case DatePart.Month:
        DateTimeUtil.spinMonth(delta, newDate, this.spinLoop);
        break;
      case DatePart.Year:
        DateTimeUtil.spinYear(delta, newDate);
        break;
      case DatePart.Hours:
        DateTimeUtil.spinHours(delta, newDate, this.spinLoop);
        break;
      case DatePart.Minutes:
        DateTimeUtil.spinMinutes(delta, newDate, this.spinLoop);
        break;
      case DatePart.Seconds:
        DateTimeUtil.spinSeconds(delta, newDate, this.spinLoop);
        break;
      case DatePart.AmPm:
        const formatPart = this._inputDateParts.find(dp => dp.type === DatePart.AmPm);
        const amPmFromMask = this.inputValue.substring(formatPart.start, formatPart.end);
        return DateTimeUtil.spinAmPm(newDate, this.dateValue, amPmFromMask);
    }

    return newDate;
  }

  private trySpinValue(datePart: DatePart, delta?: number, negative = false): Date {
    if (!delta) {
      // default to 1 if a delta is set to 0 or any other falsy value
      delta = this.datePartDeltas[datePart] || 1;
    }
    const spinValue = negative ? -Math.abs(delta) : Math.abs(delta);
    return this.spinValue(datePart, spinValue) || new Date();
  }

  private setDateValue(value: Date | string): void {
    this._dateValue = DateTimeUtil.isValidDate(value)
      ? value
      : DateTimeUtil.parseIsoDate(value);
  }

  private updateValue(newDate: Date): void {
    this._oldValue = this.dateValue;
    this.value = newDate;

    // TODO: should we emit events here?
    if (this.inputIsComplete() || this.inputValue === this.emptyMask) {
      this.valueChange.emit(this.dateValue);
    }
    if (this.dateValue && !this.valueInRange(this.dateValue)) {
      this.validationFailed.emit({ oldValue: this._oldValue, newValue: this.dateValue, userInput: this.inputValue });
    }
  }

  private toTwelveHourFormat(value: string): number {
    let hour = parseInt(value.replace(new RegExp(this.promptChar, 'g'), '0'), 10);
    if (hour > 12) {
      hour -= 12;
    } else if (hour === 0) {
      hour = 12;
    }

    return hour;
  }

  private getPartValue(datePartInfo: DatePartInfo, partLength: number): string {
    let maskedValue;
    const datePart = datePartInfo.type;
    switch (datePart) {
      case DatePart.Date:
        maskedValue = this.dateValue.getDate();
        break;
      case DatePart.Month:
        // months are zero based
        maskedValue = this.dateValue.getMonth() + 1;
        break;
      case DatePart.Year:
        if (partLength === 2) {
          maskedValue = this.prependValue(
            parseInt(this.dateValue.getFullYear().toString().slice(-2), 10), partLength, '0');
        } else {
          maskedValue = this.dateValue.getFullYear();
        }
        break;
      case DatePart.Hours:
        if (datePartInfo.format.indexOf('h') !== -1) {
          maskedValue = this.prependValue(
            this.toTwelveHourFormat(this.dateValue.getHours().toString()), partLength, '0');
        } else {
          maskedValue = this.dateValue.getHours();
        }
        break;
      case DatePart.Minutes:
        maskedValue = this.dateValue.getMinutes();
        break;
      case DatePart.Seconds:
        maskedValue = this.dateValue.getSeconds();
        break;
      case DatePart.AmPm:
        maskedValue = this.dateValue.getHours() >= 12 ? 'PM' : 'AM';
        break;
    }

    if (datePartInfo.type !== DatePart.AmPm) {
      return this.prependValue(maskedValue, partLength, '0');
    }

    return maskedValue;
  }

  private prependValue(value: number, partLength: number, prependChar: string): string {
    return (prependChar + value.toString()).slice(-partLength);
  }

  private spin(event: KeyboardEvent): void {
    event.preventDefault();
    switch (event.key) {
      case this.platform.KEYMAP.ARROW_UP:
        this.increment();
        break;
      case this.platform.KEYMAP.ARROW_DOWN:
        this.decrement();
        break;
    }
  }

  private inputIsComplete(): boolean {
    return this.inputValue.indexOf(this.promptChar) === -1;
  }

  private moveCursor(event: KeyboardEvent): void {
    const value = (event.target as HTMLInputElement).value;
    switch (event.key) {
      case this.platform.KEYMAP.ARROW_LEFT:
        if (event.ctrlKey) {
          event.preventDefault();
          this.setSelectionRange(this.getNewPosition(value));
        }
        break;
      case this.platform.KEYMAP.ARROW_RIGHT:
        if (event.ctrlKey) {
          event.preventDefault();
          this.setSelectionRange(this.getNewPosition(value, 1));
        }
        break;
    }
  }

  /**
   * Move the cursor in a specific direction until it reaches a date/time separator.
   * Then return its index.
   *
   * @param value The string it operates on.
   * @param direction 0 is left, 1 is right. Default is 0.
   */
  private getNewPosition(value: string, direction = 0): number {
    const literals = this._inputDateParts.filter(p => p.type === DatePart.Literal);
    let cursorPos = this.selectionStart;
    if (!direction) {
      do {
        cursorPos = cursorPos > 0 ? --cursorPos : cursorPos;
      } while (!literals.some(l => l.end === cursorPos) && cursorPos > 0);
      return cursorPos;
    } else {
      do {
        cursorPos++;
      } while (!literals.some(l => l.start === cursorPos) && cursorPos < value.length);
      return cursorPos;
    }
  }
}

@NgModule({
  declarations: [IgxDateTimeEditorDirective],
  exports: [IgxDateTimeEditorDirective]
})
export class IgxDateTimeEditorModule { }
