import { Component, ViewChild, DebugElement, EventEmitter, QueryList } from '@angular/core';
import { TestBed, fakeAsync, tick, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { FormControl, FormsModule, NgForm } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTimePickerComponent, IgxTimePickerModule, IgxTimePickerValidationFailedEventArgs } from './time-picker.component';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import {
    IgxHintDirective, IgxInputGroupComponent, IgxInputGroupModule, IgxInputState, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective
} from '../input-group/public_api';
import { configureTestSuite } from '../test-utils/configure-suite';
import { PickerInteractionMode } from '../date-common/types';
import { IgxIconModule } from '../icon/public_api';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { PlatformUtil } from '../core/utils';
import { DatePart, IgxDateTimeEditorDirective } from '../directives/date-time-editor/public_api';
import { DateTimeUtil } from '../date-common/util/date-time.util';
import { IgxTimeItemDirective } from './time-picker.directives';
import { IgxPickerClearComponent, IgxPickerToggleComponent } from '../date-common/public_api';
import { Subscription } from 'rxjs';

const CSS_CLASS_TIMEPICKER = 'igx-time-picker';
const CSS_CLASS_INPUTGROUP = 'igx-input-group';
const CSS_CLASS_INPUTGROUP_DISABLED = 'igx-input-group--disabled';
const CSS_CLASS_INPUT = '.igx-input-group__input';
const CSS_CLASS_DROPDOWN = '.igx-time-picker--dropdown';
const CSS_CLASS_HOURLIST = 'igx-time-picker__hourList';
const CSS_CLASS_MINUTELIST = 'igx-time-picker__minuteList';
const CSS_CLASS_SECONDSLIST = '.igx-time-picker__secondsList';
const CSS_CLASS_AMPMLIST = 'igx-time-picker__ampmList';
const CSS_CLASS_SELECTED_ITEM = '.igx-time-picker__item--selected';
const CSS_CLASS_HEADER_HOUR = '.igx-time-picker__header-hour';
const CSS_CLASS_OVERLAY = 'igx-overlay';
const CSS_CLASS_OVERLAY_WRAPPER = 'igx-overlay__wrapper';
const TIME_PICKER_TOGGLE_ICON = 'access_time';
const TIME_PICKER_CLEAR_ICON = 'clear';

describe('IgxTimePicker', () => {
    let timePicker: IgxTimePickerComponent;

    describe('Unit tests', () => {
        let mockControlInstance: any;
        let elementRef;
        let mockNgControl;
        let mockInjector;
        let mockDateTimeEditorDirective;
        let mockInputGroup: Partial<IgxInputGroupComponent>;
        let mockInputDirective;

        beforeEach(() => {
            mockDateTimeEditorDirective = {
                _value: null,
                get value() {
                    return this._value;
                },
                clear() {
                    this.valueChange.emit(null);
                },
                increment: () => { },
                decrement: () => { },
                set value(val: any) {
                    this._value = val;
                },
                valueChange: new EventEmitter<any>(),
                validationFailed: new EventEmitter<any>()
            };
            spyOn(mockDateTimeEditorDirective, 'increment');
            spyOn(mockDateTimeEditorDirective, 'decrement');

            mockInputGroup = {
                _isFocused: false,
                get isFocused() {
                    return this._isFocused;
                },
                set isFocused(val: boolean) {
                    this._isFocused = val;
                },
                _isRequired: false,
                get isRequired() {
                    return this._isRequired;
                },
                set isRequired(val: boolean) {
                    this._isRequired = val;
                },
                element: {
                    nativeElement: jasmine.createSpyObj('mockElement',
                        ['focus', 'blur', 'click', 'addEventListener', 'removeEventListener'])
                }
            } as any;

            elementRef = {
                nativeElement: jasmine.createSpyObj<HTMLElement>('mockElement', ['blur', 'click', 'focus'])
            };
            mockControlInstance = {
                _touched: false,
                get touched() {
                    return this._touched;
                },
                set touched(val: boolean) {
                    this._touched = val;
                },
                _dirty: false,
                get dirty() {
                    return this._dirty;
                },
                set dirty(val: boolean) {
                    this._dirty = val;
                },
                _asyncValidator: () => { },
                get asyncValidator() {
                    return this._asyncValidator;
                },
                set asyncValidator(val: () => boolean) {
                    this._asyncValidator = val;
                },
                _validator: () => { },
                get validator() {
                    return this._validator;
                },
                set validator(val: () => boolean) {
                    this._validator = val;
                }
            };
            mockNgControl = {
                registerOnChangeCb: () => { },
                registerOnTouchedCb: () => { },
                registerOnValidatorChangeCb: () => { },
                statusChanges: new EventEmitter(),
                _control: mockControlInstance,
                get control() {
                    return this._control;
                },
                set control(val: any) {
                    this._control = val;
                },
                valid: true
            };
            mockInputDirective = {
                valid: 'mock',
                nativeElement: {
                    _listeners: {
                        none: []
                    },
                    addEventListener(event: string, cb: () => void) {
                        let target = this._listeners[event];
                        if (!target) {
                            this._listeners[event] = [];
                            target = this._listeners[event];
                        }
                        target.push(cb);
                    },
                    removeEventListener(event: string, cb: () => void) {
                        const target = this._listeners[event];
                        if (!target) {
                            return;
                        }
                        const index = target.indexOf(cb);
                        if (index !== -1) {
                            target.splice(index, 1);
                        }
                    },
                    dispatchEvent(event: string) {
                        const target = this._listeners[event];
                        if (!target) {
                            return;
                        }
                        target.forEach(e => {
                            e();
                        });
                    },
                    focus() {
                        this.dispatchEvent('focus');
                    },
                    click() {
                        this.dispatchEvent('click');
                    },
                    blur() {
                        this.dispatchEvent('blur');
                    }
                },
                focus: () => { }
            };
            mockInjector = jasmine.createSpyObj('Injector', {
                get: mockNgControl
            });
            timePicker = new IgxTimePickerComponent(elementRef, null, null, null, mockInjector, null);
            (timePicker as any).dateTimeEditor = mockDateTimeEditorDirective;
            (timePicker as any)._inputGroup = mockInputGroup;
            (timePicker as any).inputDirective = mockInputDirective;
            timePicker.toggleComponents = new QueryList<any>();
            timePicker.clearComponents = new QueryList<any>();
        });

        it('should properly initialize w/ ngControl', () => {
            const mockSub = jasmine.createSpyObj<Subscription>('mockSub', ['unsubscribe']);
            spyOn(mockNgControl.statusChanges, 'subscribe').and.returnValue(mockSub);
            timePicker.ngOnInit();
            timePicker.ngAfterViewInit();
            expect(mockNgControl.statusChanges.subscribe).toHaveBeenCalledTimes(1);
            timePicker.ngOnDestroy();
            expect(mockSub.unsubscribe).toHaveBeenCalledTimes(1);
        });

        it('should properly subscribe to ngControl status changes', () => {
            timePicker.ngOnInit();
            timePicker.ngAfterViewInit();
            const touchedSpy = spyOnProperty(mockControlInstance, 'touched', 'get');
            const dirtySpy = spyOnProperty(mockControlInstance, 'dirty', 'get');
            const validatorSpy = spyOnProperty(mockControlInstance, 'validator');
            const asyncValidatorSpy = spyOnProperty(mockControlInstance, 'asyncValidator');
            const inputGroupFocusedSpy = spyOnProperty(mockInputGroup, 'isFocused', 'get');
            const inputGroupRequiredGet = spyOnProperty(mockInputGroup, 'isRequired', 'get');
            const inputGroupRequiredSet = spyOnProperty(mockInputGroup, 'isRequired', 'set');
            inputGroupRequiredGet.and.returnValue(false);
            inputGroupFocusedSpy.and.returnValue(false);
            expect(touchedSpy).not.toHaveBeenCalled();
            expect(dirtySpy).not.toHaveBeenCalled();
            expect(validatorSpy).not.toHaveBeenCalled();
            expect(asyncValidatorSpy).not.toHaveBeenCalled();

            touchedSpy.and.returnValue(false);
            dirtySpy.and.returnValue(false);
            mockNgControl.statusChanges.emit();
            expect(touchedSpy).toHaveBeenCalledTimes(1);
            expect(dirtySpy).toHaveBeenCalledTimes(1);
            // required getter
            expect(validatorSpy).toHaveBeenCalledTimes(1);

            touchedSpy.and.returnValue(true);
            dirtySpy.and.returnValue(true);
            validatorSpy.and.returnValue(false);
            asyncValidatorSpy.and.returnValue(false);
            mockNgControl.statusChanges.emit();
            expect(validatorSpy).toHaveBeenCalledTimes(3);
            expect(asyncValidatorSpy).toHaveBeenCalledTimes(1);
            expect(inputGroupFocusedSpy).not.toHaveBeenCalled();

            validatorSpy.and.returnValue(() => { });
            asyncValidatorSpy.and.returnValue(() => { });

            mockNgControl.statusChanges.emit();
            expect(inputGroupFocusedSpy).toHaveBeenCalledTimes(1);
            expect(inputGroupRequiredSet).not.toHaveBeenCalled();

            inputGroupRequiredGet.and.returnValue(false);
            validatorSpy.and.returnValue(() => ({ required: true }));
            mockNgControl.statusChanges.emit();
            expect(inputGroupFocusedSpy).toHaveBeenCalledTimes(2);
            expect(inputGroupRequiredSet).toHaveBeenCalledTimes(1);
            expect(inputGroupRequiredSet).toHaveBeenCalledWith(true);
            console.log(inputGroupRequiredSet.calls);
            inputGroupRequiredGet.and.returnValue(true);

            mockNgControl.statusChanges.emit();
            expect(inputGroupFocusedSpy).toHaveBeenCalledTimes(3);

            expect(mockInputDirective.valid).toBe(IgxInputState.INITIAL);
            mockNgControl.valid = false;

            mockNgControl.statusChanges.emit();
            expect(mockInputDirective.valid).toBe(IgxInputState.INVALID);

            inputGroupFocusedSpy.and.returnValue(true);
            mockNgControl.statusChanges.emit();
            expect(mockInputDirective.valid).toBe(IgxInputState.INVALID);

            mockNgControl.valid = true;
            mockNgControl.statusChanges.emit();
            expect(mockInputDirective.valid).toBe(IgxInputState.VALID);
            timePicker.ngOnDestroy();
        });

        it('should open/close the dropdown with open()/close() method', () => {
            const mockToggleDirective = jasmine.createSpyObj('IgxToggleDirective', ['open', 'close'], { collapsed: true });
            (timePicker as any).toggleRef = mockToggleDirective;
            timePicker.ngOnInit();

            timePicker.open();
            expect(mockToggleDirective.open).toHaveBeenCalledTimes(1);

            (Object.getOwnPropertyDescriptor(mockToggleDirective, 'collapsed')?.get as jasmine.Spy<() => boolean>).and.returnValue(false);
            timePicker.close();
            expect(mockToggleDirective.close).toHaveBeenCalledTimes(1);
        });

        it('should open/close the dropdown with toggle() method', () => {
            timePicker = new IgxTimePickerComponent(elementRef, null, null, null, mockInjector, null);
            (timePicker as any).dateTimeEditor = mockDateTimeEditorDirective;
            const mockToggleDirective = jasmine.createSpyObj('IgxToggleDirective', ['open', 'close'], { collapsed: true });
            (timePicker as any).toggleRef = mockToggleDirective;
            timePicker.ngOnInit();

            timePicker.toggle();
            expect(mockToggleDirective.open).toHaveBeenCalledTimes(1);

            (Object.getOwnPropertyDescriptor(mockToggleDirective, 'collapsed')?.get as jasmine.Spy<() => boolean>).and.returnValue(false);
            timePicker.toggle();
            expect(mockToggleDirective.close).toHaveBeenCalledTimes(1);
        });

        it('should reset value and emit valueChange with clear() method', () => {
            timePicker = new IgxTimePickerComponent(elementRef, null, null, null, mockInjector, null);
            (timePicker as any).dateTimeEditor = mockDateTimeEditorDirective;
            const mockToggleDirective = jasmine.createSpyObj('IgxToggleDirective', { collapsed: true });
            (timePicker as any).toggleRef = mockToggleDirective;
            timePicker.minDropdownValue = timePicker.minDateValue;
            timePicker.maxDropdownValue = timePicker.maxDateValue;

            const date = new Date(2020, 12, 12, 10, 30, 30);
            timePicker.value = new Date(date);
            date.setHours(0, 0, 0);
            spyOn(timePicker.valueChange, 'emit').and.callThrough();

            timePicker.clear();
            expect(timePicker.value).toEqual(date);
            expect(timePicker.valueChange.emit).toHaveBeenCalled();
            expect(timePicker.valueChange.emit).toHaveBeenCalledWith(date);

            const stringDate = '09:20:00';
            timePicker.value = stringDate;

            timePicker.clear();
            expect(timePicker.value).toBeNull();
            expect(timePicker.valueChange.emit).toHaveBeenCalled();
            expect(timePicker.valueChange.emit).toHaveBeenCalledWith(null);
        });

        it('should not emit valueChange when value is \'00:00:00\' and is cleared', () => {
            timePicker = new IgxTimePickerComponent(elementRef, null, null, null, mockInjector, null);
            (timePicker as any).dateTimeEditor = mockDateTimeEditorDirective;
            const mockToggleDirective = jasmine.createSpyObj('IgxToggleDirective', { collapsed: true });
            (timePicker as any).toggleRef = mockToggleDirective;

            const date = new Date(2020, 12, 12, 0, 0, 0);
            timePicker.value = date;
            spyOn(timePicker.valueChange, 'emit').and.callThrough();

            timePicker.ngOnInit();

            timePicker.clear();
            expect(timePicker.valueChange.emit).not.toHaveBeenCalled();
        });

        it('should not emit valueChange when value is null and is cleared', () => {
            timePicker = new IgxTimePickerComponent(elementRef, null, null, null, mockInjector, null);
            (timePicker as any).dateTimeEditor = mockDateTimeEditorDirective;
            const mockToggleDirective = jasmine.createSpyObj('IgxToggleDirective', { collapsed: true });
            (timePicker as any).toggleRef = mockToggleDirective;
            timePicker.value = null;
            timePicker.ngOnInit();
            spyOn(timePicker.valueChange, 'emit').and.callThrough();

            timePicker.clear();
            expect(timePicker.valueChange.emit).not.toHaveBeenCalled();
        });

        it('should select time and trigger valueChange event with select() method', () => {
            timePicker = new IgxTimePickerComponent(elementRef, null, null, null, mockInjector, null);
            (timePicker as any).dateTimeEditor = mockDateTimeEditorDirective;

            const date = new Date(2020, 12, 12, 10, 30, 30);
            timePicker.value = new Date(date);
            timePicker.minDropdownValue = timePicker.minDateValue;
            timePicker.maxDropdownValue = timePicker.maxDateValue;

            const selectedDate = new Date(2020, 12, 12, 6, 45, 0);
            spyOn(timePicker.valueChange, 'emit').and.callThrough();

            timePicker.select(selectedDate);
            expect(timePicker.value).toEqual(selectedDate);
            expect(timePicker.valueChange.emit).toHaveBeenCalled();
            expect(timePicker.valueChange.emit).toHaveBeenCalledWith(selectedDate);
        });

        it('should correctly implement ControlValueAccessor methods', () => {
            const date = new Date(2020, 12, 12, 10, 30, 30);
            const updatedDate = new Date(2020, 12, 12, 11, 30, 30);

            timePicker = new IgxTimePickerComponent(elementRef, null, null, null, mockInjector, null);
            const mockToggleDirective = jasmine.createSpyObj('IgxToggleDirective', ['close'], { collapsed: true });
            timePicker['dateTimeEditor'] = mockDateTimeEditorDirective;
            timePicker['inputDirective'] = mockInputDirective;
            timePicker['toggleRef'] = mockToggleDirective;
            timePicker.minDropdownValue = timePicker.minDateValue;
            timePicker.maxDropdownValue = timePicker.maxDateValue;
            timePicker.ngOnInit();
            spyOn(mockNgControl, 'registerOnChangeCb');
            spyOn(mockNgControl, 'registerOnTouchedCb');
            timePicker.registerOnChange(mockNgControl.registerOnChangeCb);
            timePicker.registerOnTouched(mockNgControl.registerOnTouchedCb);

            expect(timePicker.value).toBeUndefined();
            expect(mockNgControl.registerOnChangeCb).not.toHaveBeenCalled();
            timePicker.writeValue(date);
            expect(timePicker.value).toBe(date);

            timePicker.nextHour(100);
            timePicker.okButtonClick();
            expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledTimes(1);
            expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledWith(updatedDate);
            (timePicker as any).updateValidityOnBlur();
            expect(mockNgControl.registerOnTouchedCb).toHaveBeenCalledTimes(1);

            timePicker.setDisabledState(true);
            expect(timePicker.disabled).toBe(true);
            timePicker.setDisabledState(false);
            expect(timePicker.disabled).toBe(false);
        });

        it('should validate correctly minValue and maxValue', () => {
            timePicker = new IgxTimePickerComponent(elementRef, null, null, null, mockInjector, null);
            timePicker['dateTimeEditor'] = mockDateTimeEditorDirective;
            timePicker['inputDirective'] = mockInputDirective;
            timePicker.ngOnInit();

            spyOn(mockNgControl, 'registerOnChangeCb');
            spyOn(mockNgControl, 'registerOnValidatorChangeCb');

            timePicker.registerOnChange(mockNgControl.registerOnChangeCb);
            timePicker.registerOnValidatorChange(mockNgControl.registerOnValidatorChangeCb);

            timePicker.minValue = new Date(2020, 4, 7, 6, 0, 0);
            expect(mockNgControl.registerOnValidatorChangeCb).toHaveBeenCalledTimes(1);
            timePicker.maxValue = new Date(2020, 4, 7, 16, 0, 0);
            expect(mockNgControl.registerOnValidatorChangeCb).toHaveBeenCalledTimes(2);

            const date = new Date(2020, 4, 7, 8, 50, 0);
            timePicker.writeValue(date);
            const mockFormControl = new FormControl(timePicker.value);
            expect(timePicker.validate(mockFormControl)).toBeNull();

            date.setHours(3);
            expect(timePicker.validate(mockFormControl)).toEqual({ minValue: true });

            date.setHours(20);
            expect(timePicker.validate(mockFormControl)).toEqual({ maxValue: true });
        });
    });

    describe('Interaction tests', () => {
        let timePickerElement: DebugElement;
        let timePickerDebElement: DebugElement;
        let inputGroup: DebugElement;
        let input: DebugElement;
        let hourColumn: DebugElement;
        let minutesColumn: DebugElement;
        let secondsColumn: DebugElement;
        let ampmColumn: DebugElement;
        let toggleDirectiveElement: DebugElement;

        describe('Dropdown/dialog mode', () => {
            let fixture: ComponentFixture<IgxTimePickerTestComponent>;
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxTimePickerTestComponent
                    ],
                    imports: [IgxTimePickerModule,
                        IgxInputGroupModule,
                        IgxIconModule,
                        FormsModule,
                        NoopAnimationsModule],
                    providers: [PlatformUtil]
                }).compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxTimePickerTestComponent);
                fixture.detectChanges();
                timePicker = fixture.componentInstance.timePicker;
                timePickerDebElement = fixture.debugElement.query(By.css(CSS_CLASS_TIMEPICKER));
                timePickerElement = fixture.debugElement.query(By.css(CSS_CLASS_TIMEPICKER)).nativeElement;
                inputGroup = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP}`));
                input = fixture.debugElement.query(By.css(CSS_CLASS_INPUT));
                hourColumn = fixture.debugElement.query(By.css(`.${CSS_CLASS_HOURLIST}`));
                minutesColumn = fixture.debugElement.query(By.css(`.${CSS_CLASS_MINUTELIST}`));
                secondsColumn = fixture.debugElement.query(By.css(CSS_CLASS_SECONDSLIST));
                ampmColumn = fixture.debugElement.query(By.css(`.${CSS_CLASS_AMPMLIST}`));
                toggleDirectiveElement = fixture.debugElement.query(By.directive(IgxToggleDirective));
            }));
            it('should open/close the dropdown and keep the current selection on toggle icon click', fakeAsync(() => {
                const toggleIcon = fixture.debugElement.query(By.css('igx-prefix'));
                toggleIcon.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeFalsy();

                const event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
                hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges();

                toggleIcon.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeTruthy();
                const pickerValue = new Date(fixture.componentInstance.date);
                pickerValue.setHours(pickerValue.getHours() - 1);
                expect(timePicker.value).toEqual(pickerValue);
            }));

            it('should open the dropdown with `ArrowDown` + `Alt` key press and close it on outside click', fakeAsync(() => {
                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', timePickerDebElement, true);
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeFalsy();

                const event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
                hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges();

                const overlay = document.getElementsByClassName(CSS_CLASS_OVERLAY_WRAPPER)[0];
                UIInteractions.simulateClickEvent(overlay);
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeTruthy();
                const pickerValue = new Date(fixture.componentInstance.date);
                pickerValue.setHours(pickerValue.getHours() - 1);
                expect(timePicker.value).toEqual(pickerValue);
            }));

            it('should close the dropdown and keep the current selection on outside click in dialog mode', fakeAsync(() => {
                fixture.componentInstance.mode = PickerInteractionMode.Dialog;
                fixture.detectChanges();

                inputGroup.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeFalsy();

                const event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
                hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges();

                const overlay = document.getElementsByClassName(CSS_CLASS_OVERLAY)[0];
                const overlayWrapper = overlay.children[0];
                UIInteractions.simulateClickEvent(overlayWrapper);
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeTruthy();
                const pickerValue = new Date(fixture.componentInstance.date);
                pickerValue.setHours(pickerValue.getHours() - 1);
                expect(timePicker.value).toEqual(pickerValue);
            }));

            it('should not assign value on dropdown open and outside click without interaction', fakeAsync(() => {
                timePicker.value = null;
                fixture.detectChanges();

                timePicker.open();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeFalsy();

                const overlay = document.getElementsByClassName(CSS_CLASS_OVERLAY_WRAPPER)[0];
                UIInteractions.simulateClickEvent(overlay);
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeTruthy();
                expect(timePicker.value).toEqual(null);
            }));

            it('should assign Date value after interaction when initial value is null', fakeAsync(() => {
                timePicker.value = null;
                fixture.detectChanges();

                timePicker.open();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeFalsy();

                const event = new WheelEvent('wheel', { deltaX: 0, deltaY: 100 });
                hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges();

                const overlay = document.getElementsByClassName(CSS_CLASS_OVERLAY_WRAPPER)[0];
                UIInteractions.simulateClickEvent(overlay);
                tick();
                fixture.detectChanges();
                const expectedDate = new Date();
                expectedDate.setHours(1, 0, 0, 0);
                expect(timePicker.collapsed).toBeTruthy();
                expect((timePicker.value as Date).getTime()).toEqual(expectedDate.getTime());
            }));

            it('should open/close the dropdown and keep the current selection on Space/Enter key press', fakeAsync(() => {
                UIInteractions.triggerEventHandlerKeyDown(' ', timePickerDebElement);
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeFalsy();

                const event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
                hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('Enter', hourColumn.nativeElement);
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeTruthy();
                const pickerValue = new Date(fixture.componentInstance.date);
                pickerValue.setHours(pickerValue.getHours() - 1);
                expect(timePicker.value).toEqual(pickerValue);
            }));

            it('should reset selection to the value when dropdown was opened on Escape key press', fakeAsync(() => {
                fixture.componentInstance.minValue = new Date(2021, 24, 2, 9, 45, 0);
                fixture.componentInstance.maxValue = new Date(2021, 24, 2, 13, 45, 0);
                fixture.detectChanges();

                timePicker.open();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeFalsy();

                const event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
                hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges();
                hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges(); hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges();
                let selectedHour = fixture.componentInstance.date.getHours() + 2;
                const selectedAmpm = selectedHour < 12 ? 'AM' : 'PM';
                selectedHour = selectedHour > 12 ? selectedHour - 12 : selectedHour;
                const selectedMinutes = fixture.componentInstance.date.getMinutes();
                const dateTimeEditor = fixture.debugElement.query(By.directive(IgxDateTimeEditorDirective)).nativeElement;
                expect((dateTimeEditor.value)).toEqual(`0${selectedHour}:${selectedMinutes} ${selectedAmpm}`);

                UIInteractions.triggerEventHandlerKeyDown('Escape', timePickerDebElement);
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeTruthy();
                expect(timePicker.value).toEqual(fixture.componentInstance.date);
            }));

            it('should not change the current selection and close the dropdown on OK button click', fakeAsync(() => {
                timePicker.open();
                tick();
                fixture.detectChanges();

                const event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
                hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges();

                const okButton = fixture.debugElement.queryAll(By.css('button'))[1];
                okButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();

                expect(timePicker.collapsed).toBeTruthy();
                const pickerValue = new Date(fixture.componentInstance.date);
                pickerValue.setHours(pickerValue.getHours() - 1);
                expect(timePicker.value).toEqual(pickerValue);
            }));

            it('should close the dropdown and discard the current selection on Cancel button click', fakeAsync(() => {
                timePicker.open();
                tick();
                fixture.detectChanges();

                const event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
                hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges();

                const cancelButton = fixture.debugElement.queryAll(By.css('button'))[0];
                cancelButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();

                expect(timePicker.collapsed).toBeTruthy();
                expect(timePicker.value).toEqual(fixture.componentInstance.date);
            }));

            it('should fire opening/closing event on open/close', fakeAsync(() => {
                spyOn(timePicker.opening, 'emit').and.callThrough();
                spyOn(timePicker.opened, 'emit').and.callThrough();
                spyOn(timePicker.closing, 'emit').and.callThrough();
                spyOn(timePicker.closed, 'emit').and.callThrough();

                timePicker.open();
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeFalsy();
                expect(timePicker.opening.emit).toHaveBeenCalled();
                expect(timePicker.opened.emit).toHaveBeenCalled();

                timePicker.close();
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeTruthy();
                expect(timePicker.closing.emit).toHaveBeenCalled();
                expect(timePicker.closed.emit).toHaveBeenCalled();
            }));

            it('should be able to cancel opening/closing events', fakeAsync(() => {
                spyOn(timePicker.opening, 'emit').and.callThrough();
                spyOn(timePicker.opened, 'emit').and.callThrough();
                spyOn(timePicker.closing, 'emit').and.callThrough();
                spyOn(timePicker.closed, 'emit').and.callThrough();

                const openingSub = timePicker.opening.subscribe((event) => event.cancel = true);

                timePicker.open();
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeTruthy();
                expect(timePicker.opening.emit).toHaveBeenCalled();
                expect(timePicker.opened.emit).not.toHaveBeenCalled();

                openingSub.unsubscribe();

                const closingSub = timePicker.closing.subscribe((event) => event.cancel = true);

                timePicker.open();
                tick();
                fixture.detectChanges();

                timePicker.close();
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeFalsy();
                expect(timePicker.closing.emit).toHaveBeenCalled();
                expect(timePicker.closed.emit).not.toHaveBeenCalled();

                closingSub.unsubscribe();
            }));

            it('should change date parts correctly and emit valueChange with increment() and decrement() methods', () => {
                const date = new Date(2020, 12, 12, 10, 30, 30);
                timePicker.value = new Date(date);
                timePicker.minValue = new Date(2020, 12, 12, 6, 0, 0);
                timePicker.maxValue = new Date(2020, 12, 12, 16, 0, 0);
                timePicker.itemsDelta = { hours: 2, minutes: 20, seconds: 15 };
                fixture.detectChanges();
                spyOn(timePicker.valueChange, 'emit').and.callThrough();

                timePicker.increment(DatePart.Hours);
                date.setHours(date.getHours() + timePicker.itemsDelta.hours);
                expect(timePicker.value).toEqual(date);
                expect(timePicker.valueChange.emit).toHaveBeenCalledTimes(1);
                expect(timePicker.valueChange.emit).toHaveBeenCalledWith(date);

                timePicker.increment(DatePart.Minutes);
                date.setMinutes(date.getMinutes() + timePicker.itemsDelta.minutes);
                expect(timePicker.value).toEqual(date);
                expect(timePicker.valueChange.emit).toHaveBeenCalledTimes(2);
                expect(timePicker.valueChange.emit).toHaveBeenCalledWith(date);

                timePicker.decrement(DatePart.Seconds);
                date.setSeconds(date.getSeconds() - timePicker.itemsDelta.seconds);
                expect(timePicker.value).toEqual(date);
                expect(timePicker.valueChange.emit).toHaveBeenCalledTimes(3);
                expect(timePicker.valueChange.emit).toHaveBeenCalledWith(date);
            });

            it('should fire vallidationFailed on incrementing time outside min/max range', () => {
                const date = new Date(2020, 12, 12, 15, 30, 30);
                const selectedDate = new Date(date);
                selectedDate.setHours(date.getHours() + 2);
                timePicker.value = new Date(date);
                timePicker.minValue = new Date(2020, 12, 12, 6, 0, 0);
                timePicker.maxValue = new Date(2020, 12, 12, 16, 0, 0);
                timePicker.itemsDelta = { hours: 2, minutes: 20, seconds: 15 };
                fixture.detectChanges();
                spyOn(timePicker.validationFailed, 'emit').and.callThrough();

                timePicker.increment(DatePart.Hours);
                fixture.detectChanges();

                const args: IgxTimePickerValidationFailedEventArgs = {
                    owner: timePicker,
                    previousValue: date,
                    currentValue: selectedDate
                };
                expect(timePicker.value).toEqual(selectedDate);
                expect(timePicker.validationFailed.emit).toHaveBeenCalled();
                expect(timePicker.validationFailed.emit).toHaveBeenCalledWith(args);
            });

            it('should scroll trough hours/minutes/seconds/AM PM based on default or set itemsDelta', fakeAsync(() => {
                timePicker.inputFormat = 'hh:mm:ss tt';
                fixture.detectChanges();

                secondsColumn = fixture.debugElement.query(By.css(CSS_CLASS_SECONDSLIST));
                timePicker.open();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeFalsy();

                // spin all columns with default delta
                const eventScrollDown = new WheelEvent('wheel', { deltaX: 0, deltaY: 100 });
                const eventScrollUp = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
                hourColumn.triggerEventHandler('wheel', eventScrollDown);
                minutesColumn.triggerEventHandler('wheel', eventScrollDown);
                secondsColumn.triggerEventHandler('wheel', eventScrollDown);
                ampmColumn.triggerEventHandler('wheel', eventScrollUp);
                fixture.detectChanges();

                const expectedValuedHour = 0;
                const expectedDisplayHour = 12;
                const expectedMinute = 46;
                const expectedSecond = 1;
                const expectedAmPm = 'AM';
                const expectedPrependZero = '0';

                // test rendered display value
                const selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                const selectedHour = selectedItems[0].nativeElement.innerText;
                const selectedMinute = selectedItems[1].nativeElement.innerText;
                const selectedSecond = selectedItems[2].nativeElement.innerText;
                const selectedAMPM = selectedItems[3].nativeElement.innerText;

                expect(selectedHour).toEqual(expectedDisplayHour.toString());
                expect(selectedMinute).toEqual(expectedMinute.toString());
                expect(selectedSecond).toEqual(expectedPrependZero + expectedSecond.toString());
                expect(selectedAMPM).toEqual(expectedAmPm);

                // apply selected value on toggle btn click
                const toggleIcon = fixture.debugElement.query(By.css('igx-prefix'));
                toggleIcon.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeTrue();

                expect((timePicker.value as Date).getHours()).toEqual(expectedValuedHour);
                expect((timePicker.value as Date).getMinutes()).toEqual(expectedMinute);
                expect((timePicker.value as Date).getSeconds()).toEqual(expectedSecond);
            }));

            it('should scroll trough hours/minutes/seconds/AM PM based on custom itemsDelta', fakeAsync(() => {
                const newDate = new Date(2021, 24, 2, 10, 20, 0);
                fixture.componentInstance.date = newDate;
                timePicker.inputFormat = 'hh:mm:ss tt';
                timePicker.itemsDelta = { hours: 2, minutes: 20, seconds: 20 };
                fixture.detectChanges();

                timePicker.open();
                fixture.detectChanges();
                secondsColumn = fixture.debugElement.query(By.css(CSS_CLASS_SECONDSLIST));
                expect(timePicker.collapsed).toBeFalsy();

                // spin all columns with the custom itemsDelta
                const eventScrollDown = new WheelEvent('wheel', { deltaX: 0, deltaY: 100 });
                const eventScrollUp = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
                hourColumn.triggerEventHandler('wheel', eventScrollDown);
                minutesColumn.triggerEventHandler('wheel', eventScrollDown);
                secondsColumn.triggerEventHandler('wheel', eventScrollDown);
                ampmColumn.triggerEventHandler('wheel', eventScrollUp);
                fixture.detectChanges();

                const expectedValuedHour = 0;
                const expectedDisplayHour = 12;
                const expectedMinute = 40;
                const expectedSecond = 20;
                const expectedAmPm = 'AM';

                // test rendered display value
                const selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                const selectedHour = selectedItems[0].nativeElement.innerText;
                const selectedMinute = selectedItems[1].nativeElement.innerText;
                const selectedSecond = selectedItems[2].nativeElement.innerText;
                const selectedAMPM = selectedItems[3].nativeElement.innerText;

                expect(selectedHour).toEqual(expectedDisplayHour.toString());
                expect(selectedMinute).toEqual(expectedMinute.toString());
                expect(selectedSecond).toEqual(expectedSecond.toString());
                expect(selectedAMPM).toEqual(expectedAmPm);

                // apply selected value on toggle btn click
                const toggleIcon = fixture.debugElement.query(By.css('igx-prefix'));
                toggleIcon.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeTrue();

                expect((timePicker.value as Date).getHours()).toEqual(expectedValuedHour);
                expect((timePicker.value as Date).getMinutes()).toEqual(expectedMinute);
                expect((timePicker.value as Date).getSeconds()).toEqual(expectedSecond);
            }));

            it('should navigate through columns with arrow keys', () => {
                timePicker.open();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeFalsy();

                hourColumn.nativeElement.focus();
                fixture.detectChanges();
                expect(document.activeElement.classList).toContain(CSS_CLASS_HOURLIST);

                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', hourColumn.nativeElement, true);
                fixture.detectChanges();
                expect(document.activeElement.classList).toContain(CSS_CLASS_MINUTELIST);

                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', minutesColumn.nativeElement, true);
                fixture.detectChanges();
                expect(document.activeElement.classList).toContain(CSS_CLASS_AMPMLIST);

                UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', ampmColumn.nativeElement, true);
                fixture.detectChanges();
                expect(document.activeElement.classList).toContain(CSS_CLASS_MINUTELIST);

                UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', minutesColumn.nativeElement, true);
                fixture.detectChanges();
                expect(document.activeElement.children[3].innerHTML.trim()).toBe('46');

                UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', minutesColumn.nativeElement, true);
                fixture.detectChanges();
                expect(document.activeElement.classList).toContain(CSS_CLASS_HOURLIST);

                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', hourColumn.nativeElement, true);
                fixture.detectChanges();
                expect(document.activeElement.children[3].innerHTML.trim()).toBe('10');
            });


            it('should navigate through items with arrow keys', () => {
                timePicker.itemsDelta = { hours: 4, minutes: 7, seconds: 1 };
                fixture.detectChanges();

                timePicker.open();
                fixture.detectChanges();

                let selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                let selectedHour = selectedItems[0].nativeElement.innerText;
                let selectedMinutes = selectedItems[1].nativeElement.innerText;
                let selectedAMPM = selectedItems[2].nativeElement.innerText;
                expect(selectedHour).toEqual('12');
                expect(selectedMinutes).toEqual('00');
                expect(selectedAMPM).toEqual('PM');

                hourColumn.nativeElement.focus();
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', hourColumn.nativeElement, true);
                fixture.detectChanges();

                selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                selectedHour = selectedItems[0].nativeElement.innerText;
                selectedMinutes = selectedItems[1].nativeElement.innerText;
                selectedAMPM = selectedItems[2].nativeElement.innerText;
                expect(selectedHour).toEqual('08');
                expect(selectedMinutes).toEqual('00');
                expect(selectedAMPM).toEqual('AM');

                UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', hourColumn.nativeElement, true);
                fixture.detectChanges();

                selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                selectedHour = selectedItems[0].nativeElement.innerText;
                selectedMinutes = selectedItems[1].nativeElement.innerText;
                selectedAMPM = selectedItems[2].nativeElement.innerText;
                expect(selectedHour).toEqual('12');
                expect(selectedMinutes).toEqual('00');
                expect(selectedAMPM).toEqual('PM');

                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', hourColumn.nativeElement, true);
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', minutesColumn.nativeElement, true);
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', ampmColumn.nativeElement, true);
                fixture.detectChanges();

                selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                selectedHour = selectedItems[0].nativeElement.innerText;
                selectedMinutes = selectedItems[1].nativeElement.innerText;
                selectedAMPM = selectedItems[2].nativeElement.innerText;
                expect(selectedHour).toEqual('12');
                expect(selectedMinutes).toEqual('00');
                expect(selectedAMPM).toEqual('AM');

                UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', ampmColumn.nativeElement, true);
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', minutesColumn.nativeElement, true);
                fixture.detectChanges();

                selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                selectedHour = selectedItems[0].nativeElement.innerText;
                selectedMinutes = selectedItems[1].nativeElement.innerText;
                selectedAMPM = selectedItems[2].nativeElement.innerText;
                expect(selectedHour).toEqual('12');
                expect(selectedMinutes).toEqual('56');
                expect(selectedAMPM).toEqual('AM');

                UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', minutesColumn.nativeElement, true);
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', minutesColumn.nativeElement, true);
                fixture.detectChanges();

                selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                selectedHour = selectedItems[0].nativeElement.innerText;
                selectedMinutes = selectedItems[1].nativeElement.innerText;
                selectedAMPM = selectedItems[2].nativeElement.innerText;
                expect(selectedHour).toEqual('12');
                expect(selectedMinutes).toEqual('07');
                expect(selectedAMPM).toEqual('AM');
            });

            it('should navigate to min/max items with arrow keys when selected value is outside the min/max range', () => {
                timePicker.itemsDelta = { hours: 2, minutes: 20, seconds: 15 };
                timePicker.minValue = new Date(2020, 12, 12, 9, 30, 0);
                timePicker.maxValue = new Date(2020, 12, 12, 14, 35, 0);
                fixture.detectChanges();

                timePicker.open();
                fixture.detectChanges();

                let selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                let selectedHour = selectedItems[0].nativeElement.innerText;
                let selectedMinutes = selectedItems[1].nativeElement.innerText;
                let selectedAMPM = selectedItems[2].nativeElement.innerText;
                expect(selectedHour).toEqual('12');
                expect(selectedMinutes).toEqual('00');
                expect(selectedAMPM).toEqual('PM');

                hourColumn.nativeElement.focus();
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', hourColumn.nativeElement, true);
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', minutesColumn.nativeElement, true);
                fixture.detectChanges();

                selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                selectedHour = selectedItems[0].nativeElement.innerText;
                selectedMinutes = selectedItems[1].nativeElement.innerText;
                selectedAMPM = selectedItems[2].nativeElement.innerText;
                expect(selectedHour).toEqual('12');
                expect(selectedMinutes).toEqual('40');
                expect(selectedAMPM).toEqual('PM');

                UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', minutesColumn.nativeElement, true);
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', hourColumn.nativeElement, true);
                fixture.detectChanges();

                selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                selectedHour = selectedItems[0].nativeElement.innerText;
                selectedMinutes = selectedItems[1].nativeElement.innerText;
                selectedAMPM = selectedItems[2].nativeElement.innerText;
                expect(selectedHour).toEqual('02');
                expect(selectedMinutes).toEqual('20');
                expect(selectedAMPM).toEqual('PM');

                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', hourColumn.nativeElement, true);
                fixture.detectChanges();
                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', minutesColumn.nativeElement, true);
                fixture.detectChanges();
                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', ampmColumn.nativeElement, true);
                fixture.detectChanges();

                selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                selectedHour = selectedItems[0].nativeElement.innerText;
                selectedMinutes = selectedItems[1].nativeElement.innerText;
                selectedAMPM = selectedItems[2].nativeElement.innerText;
                expect(selectedHour).toEqual('10');
                expect(selectedMinutes).toEqual('00');
                expect(selectedAMPM).toEqual('AM');
            });
        });

        describe('Rendering tests', () => {
            let fixture: ComponentFixture<IgxTimePickerTestComponent>;
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxTimePickerTestComponent
                    ],
                    imports: [IgxTimePickerModule,
                        IgxInputGroupModule,
                        IgxIconModule,
                        NoopAnimationsModule]
                }).compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxTimePickerTestComponent);
                fixture.detectChanges();
                timePicker = fixture.componentInstance.timePicker;
                timePickerElement = fixture.debugElement.query(By.css(CSS_CLASS_TIMEPICKER)).nativeElement;
                inputGroup = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP}`));
                hourColumn = fixture.debugElement.query(By.css(`.${CSS_CLASS_HOURLIST}`));
                minutesColumn = fixture.debugElement.query(By.css(`.${CSS_CLASS_MINUTELIST}`));
                ampmColumn = fixture.debugElement.query(By.css(`.${CSS_CLASS_AMPMLIST}`));
                toggleDirectiveElement = fixture.debugElement.query(By.directive(IgxToggleDirective));
            }));

            it('Should render default toggle and clear icons', () => {
                fixture = TestBed.createComponent(IgxTimePickerTestComponent);
                fixture.detectChanges();
                inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent));
                const prefix = inputGroup.queryAll(By.directive(IgxPrefixDirective));
                expect(prefix).toHaveSize(1);
                expect(prefix[0].nativeElement.innerText).toEqual(TIME_PICKER_TOGGLE_ICON);
                const suffix = inputGroup.queryAll(By.directive(IgxSuffixDirective));
                expect(suffix).toHaveSize(1);
                expect(suffix[0].nativeElement.innerText).toEqual(TIME_PICKER_CLEAR_ICON);
            });

            it('should initialize all input properties with their default values', () => {
                expect(timePicker.mode).toEqual(PickerInteractionMode.DropDown);
                expect(timePicker.inputFormat).toEqual(DateTimeUtil.DEFAULT_TIME_INPUT_FORMAT);
                expect(timePicker.itemsDelta.hours).toEqual(1);
                expect(timePicker.itemsDelta.minutes).toEqual(1);
                expect(timePicker.itemsDelta.seconds).toEqual(1);
                expect(timePicker.disabled).toEqual(false);
            });

            it('should initialize all IgxDateTimeEditorDirective input properties correctly', () => {
                timePicker.itemsDelta = { hours: 2, minutes: 20, seconds: 15 };
                timePicker.displayFormat = 'hh:mm';
                fixture.componentInstance.minValue = new Date(2020, 12, 12, 9, 30, 0);
                fixture.componentInstance.maxValue = new Date(2020, 12, 12, 14, 35, 0);
                fixture.detectChanges();

                const dateTimeEditor = fixture.debugElement.query(By.directive(IgxDateTimeEditorDirective)).
                    injector.get(IgxDateTimeEditorDirective);
                expect(dateTimeEditor.value).toEqual(fixture.componentInstance.date);
                expect(dateTimeEditor.minValue).toEqual(fixture.componentInstance.minValue);
                expect(dateTimeEditor.maxValue).toEqual(fixture.componentInstance.maxValue);
                expect(dateTimeEditor.spinDelta).toEqual(timePicker.itemsDelta);
                expect(dateTimeEditor.spinLoop).toEqual(true);

                expect(dateTimeEditor.inputFormat).toEqual(DateTimeUtil.DEFAULT_TIME_INPUT_FORMAT);
                expect(dateTimeEditor.displayFormat).toEqual('hh:mm');
                expect(dateTimeEditor.mask).toEqual('00:00 LL');
            });

            it('should be able to change the mode at runtime', fakeAsync(() => {
                fixture.componentInstance.timePicker.mode = PickerInteractionMode.DropDown;
                fixture.detectChanges();

                timePicker.open();
                tick();
                fixture.detectChanges();

                let dropdown = fixture.debugElement.query(By.css(CSS_CLASS_DROPDOWN));
                expect(dropdown).toBeDefined();

                timePicker.close();
                tick();
                fixture.detectChanges();

                fixture.componentInstance.timePicker.mode = PickerInteractionMode.Dialog;
                fixture.detectChanges();

                timePicker.open();
                tick();
                fixture.detectChanges();

                dropdown = fixture.debugElement.query(By.css(CSS_CLASS_DROPDOWN));
                expect(dropdown).toBeNull();
            }));

            it('should apply disabled class when component is disabled', () => {
                fixture.componentInstance.timePicker.disabled = true;
                fixture.detectChanges();

                expect(inputGroup.classes[CSS_CLASS_INPUTGROUP_DISABLED]).toEqual(true);

                fixture.componentInstance.timePicker.disabled = false;
                fixture.detectChanges();

                expect(inputGroup.classes[CSS_CLASS_INPUTGROUP_DISABLED]).toBeFalsy();
            });

            it('should highlight selected time', fakeAsync(() => {
                fixture.componentInstance.timePicker.mode = PickerInteractionMode.DropDown;
                fixture.detectChanges();

                timePicker.open();
                tick();
                fixture.detectChanges();

                const selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                const selectedHour = selectedItems[0].nativeElement.innerText;
                const selectedMinutes = selectedItems[1].nativeElement.innerText;
                const selectedAMPM = selectedItems[2].nativeElement.innerText;

                const hours = fixture.componentInstance.date.getHours();
                const minutes = fixture.componentInstance.date.getMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';

                expect(selectedHour).toEqual(hours.toString());
                expect(selectedMinutes).toEqual(minutes.toString());
                expect(selectedAMPM).toEqual(ampm);
            }));

            it('should display correctly non-zero padded time format', fakeAsync(() => {
                fixture.componentInstance.date = new Date(2021, 24, 2, 8, 5, 5);
                fixture.componentInstance.timePicker.mode = PickerInteractionMode.DropDown;
                timePicker.inputFormat = 'h:m:s';
                fixture.detectChanges();

                timePicker.open();
                tick();
                fixture.detectChanges();

                const selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                const selectedHour = selectedItems[0].nativeElement.innerText;
                const selectedMinutes = selectedItems[1].nativeElement.innerText;
                const selectedAMPM = selectedItems[2].nativeElement.innerText;

                const hours = fixture.componentInstance.date.getHours();
                const minutes = fixture.componentInstance.date.getMinutes();
                const seconds = fixture.componentInstance.date.getSeconds();

                expect(selectedHour).toEqual(hours.toString());
                expect(selectedMinutes).toEqual(minutes.toString());
                expect(selectedAMPM).toEqual(seconds.toString());
            }));

            it('should display selected time in dialog header', fakeAsync(() => {
                fixture.componentInstance.timePicker.mode = PickerInteractionMode.Dialog;
                fixture.detectChanges();

                timePicker.open();
                tick();
                fixture.detectChanges();

                const hourHeader = fixture.debugElement.query(By.css(CSS_CLASS_HEADER_HOUR));
                const selectedTime = hourHeader.children[0].nativeElement.innerText;


                const hours = fixture.componentInstance.date.getHours();
                const minutes = fixture.componentInstance.date.getMinutes().toString();
                const ampm = hours >= 12 ? 'PM' : 'AM';

                expect(selectedTime).toEqual(`${hours}:${minutes} ${ampm}`);
            }));

            it('should apply all aria attributes correctly', fakeAsync(() => {
                const inputEl = fixture.nativeElement.querySelector(CSS_CLASS_INPUT);
                expect(inputEl.getAttribute('role')).toEqual('combobox');
                expect(inputEl.getAttribute('aria-haspopup')).toEqual('dialog');
                expect(inputEl.getAttribute('aria-labelledby')).toEqual(timePicker.label.id);
                expect(inputEl.getAttribute('aria-expanded')).toEqual('false');

                timePicker.open();
                tick();
                fixture.detectChanges();
                expect(inputEl.getAttribute('aria-expanded')).toEqual('true');

                let selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                let selectedHour = selectedItems[0];
                let selectedMinute = selectedItems[1];
                let selectedAMPM = selectedItems[2];

                expect(selectedHour.attributes['role']).toEqual('spinbutton');
                expect(selectedHour.attributes['aria-label']).toEqual('hour');
                expect(selectedHour.attributes['aria-valuenow']).toEqual('11 AM');
                expect(selectedHour.attributes['aria-valuemin']).toEqual('12 AM');
                expect(selectedHour.attributes['aria-valuemax']).toEqual('11 PM');

                expect(selectedMinute.attributes['role']).toEqual('spinbutton');
                expect(selectedMinute.attributes['aria-label']).toEqual('minutes');
                expect(selectedMinute.attributes['aria-valuenow']).toEqual('45');
                expect(selectedMinute.attributes['aria-valuemin']).toEqual('00');
                expect(selectedMinute.attributes['aria-valuemax']).toEqual('59');

                expect(selectedAMPM.attributes['role']).toEqual('spinbutton');
                expect(selectedAMPM.attributes['aria-label']).toEqual('ampm');
                expect(selectedAMPM.attributes['aria-valuenow']).toEqual('AM');
                expect(selectedAMPM.attributes['aria-valuemin']).toEqual('AM');
                expect(selectedAMPM.attributes['aria-valuemax']).toEqual('PM');

                timePicker.close();
                tick();
                fixture.detectChanges();
                expect(inputEl.getAttribute('aria-expanded')).toEqual('false');

                timePicker.value = new Date(2021, 24, 2, 6, 42, 0);
                fixture.componentInstance.minValue = '06:30:00';
                fixture.componentInstance.maxValue = '18:30:00';
                timePicker.itemsDelta = { hours: 3, minutes: 7, seconds: 1 };
                fixture.detectChanges();

                timePicker.open();
                tick();
                fixture.detectChanges();

                selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                selectedHour = selectedItems[0];
                selectedMinute = selectedItems[1];
                selectedAMPM = selectedItems[2];

                expect(selectedHour.attributes['aria-valuenow']).toEqual('06 AM');
                expect(selectedHour.attributes['aria-valuemin']).toEqual('06 AM');
                expect(selectedHour.attributes['aria-valuemax']).toEqual('06 PM');

                expect(selectedMinute.attributes['aria-valuenow']).toEqual('42');
                expect(selectedMinute.attributes['aria-valuemin']).toEqual('35');
                expect(selectedMinute.attributes['aria-valuemax']).toEqual('56');

                const item = ampmColumn.queryAll(By.directive(IgxTimeItemDirective))[4];
                item.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();

                selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                selectedHour = selectedItems[0];
                selectedMinute = selectedItems[1];
                selectedAMPM = selectedItems[2];

                expect(selectedHour.attributes['aria-valuenow']).toEqual('06 PM');
                expect(selectedHour.attributes['aria-valuemin']).toEqual('06 AM');
                expect(selectedHour.attributes['aria-valuemax']).toEqual('06 PM');

                expect(selectedMinute.attributes['aria-valuenow']).toEqual('28');
                expect(selectedMinute.attributes['aria-valuemin']).toEqual('00');
                expect(selectedMinute.attributes['aria-valuemax']).toEqual('28');

                timePicker.close();
                tick();
                fixture.detectChanges();
            }));

            it('should select closest value when value does not match dropdown values', fakeAsync(() => {
                fixture.componentInstance.minValue = new Date(2021, 24, 2, 9, 0, 0);
                fixture.componentInstance.maxValue = new Date(2021, 24, 2, 16, 0, 0);
                timePicker.itemsDelta = { hours: 2, minutes: 15, seconds: 30 };
                fixture.detectChanges();

                timePicker.open();
                tick();
                fixture.detectChanges();

                const selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                const selectedHour = selectedItems[0].nativeElement.innerText;
                const selectedMinutes = selectedItems[1].nativeElement.innerText;
                const selectedAMPM = selectedItems[2].nativeElement.innerText;

                expect(selectedHour).toEqual('12');
                expect(selectedMinutes).toEqual('00');
                expect(selectedAMPM).toEqual('PM');
            }));

            it('should select minValue when value is outside the min/max range', fakeAsync(() => {
                fixture.componentInstance.minValue = new Date(2021, 24, 2, 13, 0, 0);
                fixture.componentInstance.maxValue = new Date(2021, 24, 2, 19, 0, 0);
                timePicker.itemsDelta = { hours: 2, minutes: 15, seconds: 30 };
                fixture.detectChanges();

                timePicker.open();
                tick();
                fixture.detectChanges();

                const selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                const selectedHour = selectedItems[0].nativeElement.innerText;
                const selectedMinutes = selectedItems[1].nativeElement.innerText;
                const selectedAMPM = selectedItems[2].nativeElement.innerText;

                expect(selectedHour).toEqual('02');
                expect(selectedMinutes).toEqual('00');
                expect(selectedAMPM).toEqual('PM');
            }));

            it('should select minValue when value is null', fakeAsync(() => {
                fixture.componentInstance.date = null;
                fixture.componentInstance.minValue = new Date(2021, 24, 2, 13, 0, 0);
                fixture.componentInstance.maxValue = new Date(2021, 24, 2, 19, 0, 0);
                timePicker.itemsDelta = { hours: 2, minutes: 15, seconds: 30 };
                fixture.detectChanges();

                timePicker.open();
                tick();
                fixture.detectChanges();

                const selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                const selectedHour = selectedItems[0].nativeElement.innerText;
                const selectedMinutes = selectedItems[1].nativeElement.innerText;
                const selectedAMPM = selectedItems[2].nativeElement.innerText;

                expect(selectedHour).toEqual('02');
                expect(selectedMinutes).toEqual('00');
                expect(selectedAMPM).toEqual('PM');
            }));
            it('should select hour/minute/second/AMPM via the drop down list (throw onItemClick event)', fakeAsync(() => {
                timePicker.inputFormat = 'hh:mm:ss tt';
                fixture.detectChanges();

                secondsColumn = fixture.debugElement.query(By.css(CSS_CLASS_SECONDSLIST));
                timePicker.open();
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeFalsy();

                const expectedHour = '12';
                const expectedMinute = '46';
                const expectedSecond = '01';
                const expectedAmPm = 'PM';

                let item; let selectedItems;
                item = ampmColumn.queryAll(By.directive(IgxTimeItemDirective))[4];
                item.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                const selectedAMPM = selectedItems[3].nativeElement.innerText;
                expect(selectedAMPM).toEqual(expectedAmPm);

                item = hourColumn.queryAll(By.directive(IgxTimeItemDirective))[4];
                item.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                const selectedHour = selectedItems[0].nativeElement.innerText;
                expect(selectedHour).toEqual(expectedHour);

                item = minutesColumn.queryAll(By.directive(IgxTimeItemDirective))[4];
                item.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                const selectedMinute = selectedItems[1].nativeElement.innerText;
                expect(selectedMinute).toEqual(expectedMinute);

                item = secondsColumn.queryAll(By.directive(IgxTimeItemDirective))[4];
                item.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                const selectedSecond = selectedItems[2].nativeElement.innerText;
                expect(selectedSecond).toEqual(expectedSecond);
            }));
        });

        describe('Keyboard navigation', () => {
            let fixture: ComponentFixture<IgxTimePickerTestComponent>;
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxTimePickerTestComponent
                    ],
                    imports: [IgxTimePickerModule,
                        IgxInputGroupModule,
                        IgxIconModule,
                        NoopAnimationsModule]
                }).compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxTimePickerTestComponent);
                fixture.detectChanges();
                timePicker = fixture.componentInstance.timePicker;
                timePickerDebElement = fixture.debugElement.query(By.css(CSS_CLASS_TIMEPICKER));
                timePickerElement = fixture.debugElement.query(By.css(CSS_CLASS_TIMEPICKER)).nativeElement;
                inputGroup = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP}`));
                hourColumn = fixture.debugElement.query(By.css(`.${CSS_CLASS_HOURLIST}`));
                minutesColumn = fixture.debugElement.query(By.css(`.${CSS_CLASS_MINUTELIST}`));
                ampmColumn = fixture.debugElement.query(By.css(`.${CSS_CLASS_AMPMLIST}`));
                toggleDirectiveElement = fixture.debugElement.query(By.directive(IgxToggleDirective));
            }));

            it('should toggle the dropdown with ALT + DOWN/UP ARROW key', fakeAsync(() => {
                spyOn(timePicker.opening, 'emit').and.callThrough();
                spyOn(timePicker.opened, 'emit').and.callThrough();
                spyOn(timePicker.closing, 'emit').and.callThrough();
                spyOn(timePicker.closed, 'emit').and.callThrough();
                expect(timePicker.collapsed).toBeTruthy();

                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', timePickerDebElement, true);

                tick();
                fixture.detectChanges();

                expect(timePicker.collapsed).toBeFalsy();
                expect(timePicker.opening.emit).toHaveBeenCalledTimes(1);
                expect(timePicker.opened.emit).toHaveBeenCalledTimes(1);

                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', timePickerElement, true, true);
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeTruthy();
                expect(timePicker.closing.emit).toHaveBeenCalledTimes(1);
                expect(timePicker.closed.emit).toHaveBeenCalledTimes(1);
            }));

            it('should open the dropdown with SPACE key', fakeAsync(() => {
                spyOn(timePicker.opening, 'emit').and.callThrough();
                spyOn(timePicker.opened, 'emit').and.callThrough();
                expect(timePicker.collapsed).toBeTruthy();

                UIInteractions.triggerEventHandlerKeyDown(' ', timePickerDebElement);
                tick();
                fixture.detectChanges();

                expect(timePicker.collapsed).toBeFalsy();
                expect(timePicker.opening.emit).toHaveBeenCalledTimes(1);
                expect(timePicker.opened.emit).toHaveBeenCalledTimes(1);
            }));

            it('should close the dropdown with ESC', fakeAsync(() => {
                spyOn(timePicker.closing, 'emit').and.callThrough();
                spyOn(timePicker.closed, 'emit').and.callThrough();

                expect(timePicker.collapsed).toBeTruthy();
                timePicker.open();
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeFalsy();

                UIInteractions.triggerKeyDownEvtUponElem('Escape', timePickerElement, true);
                tick();
                fixture.detectChanges();
                expect(timePicker.collapsed).toBeTruthy();
                expect(timePicker.closing.emit).toHaveBeenCalledTimes(1);
                expect(timePicker.closed.emit).toHaveBeenCalledTimes(1);
            }));
        });

        describe('Projected elements', () => {
            let fixture: ComponentFixture<IgxTimePickerWithProjectionsComponent>;
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxTimePickerWithProjectionsComponent
                    ],
                    imports: [IgxTimePickerModule,
                        IgxInputGroupModule,
                        IgxIconModule,
                        NoopAnimationsModule]
                }).compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxTimePickerWithProjectionsComponent);
                fixture.detectChanges();
            }));

            it('Should project label/hint and additional prefix/suffix in the correct location', () => {
                fixture.componentInstance.timePicker.value = new Date();
                fixture.detectChanges();
                inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent));

                const label = inputGroup.queryAll(By.directive(IgxLabelDirective));
                expect(label).toHaveSize(1);
                expect(label[0].nativeElement.innerText).toEqual('Label');
                const hint = inputGroup.queryAll(By.directive(IgxHintDirective));
                expect(hint).toHaveSize(1);
                expect(hint[0].nativeElement.innerText).toEqual('Hint');

                const prefix = inputGroup.queryAll(By.directive(IgxPrefixDirective));
                expect(prefix).toHaveSize(2);
                expect(prefix[0].nativeElement.innerText).toEqual(TIME_PICKER_TOGGLE_ICON);
                expect(prefix[1].nativeElement.innerText).toEqual('Prefix');
                const suffix = inputGroup.queryAll(By.directive(IgxSuffixDirective));
                expect(suffix).toHaveSize(2);
                expect(suffix[0].nativeElement.innerText).toEqual(TIME_PICKER_CLEAR_ICON);
                expect(suffix[1].nativeElement.innerText).toEqual('Suffix');
            });

            it('Should project custom toggle/clear and hide defaults', () => {
                fixture.componentInstance.timePicker.value = new Date();
                fixture.componentInstance.showCustomClear = true;
                fixture.componentInstance.showCustomToggle = true;
                fixture.detectChanges();
                inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent));

                const prefix = inputGroup.queryAll(By.directive(IgxPrefixDirective));
                expect(prefix).toHaveSize(2);
                expect(prefix[0].nativeElement.innerText).toEqual('CustomToggle');
                expect(prefix[1].nativeElement.innerText).toEqual('Prefix');
                const suffix = inputGroup.queryAll(By.directive(IgxSuffixDirective));
                expect(suffix).toHaveSize(2);
                expect(suffix[0].nativeElement.innerText).toEqual('CustomClear');
                expect(suffix[1].nativeElement.innerText).toEqual('Suffix');
            });

            it('Should correctly sub/unsub to custom toggle and clear', () => {
                timePicker = fixture.componentInstance.timePicker;
                timePicker.value = new Date();
                fixture.componentInstance.showCustomClear = true;
                fixture.componentInstance.showCustomToggle = true;
                fixture.detectChanges();
                spyOn(timePicker, 'open');
                spyOn(timePicker, 'clear');

                inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent));
                const toggleElem = inputGroup.query(By.directive(IgxPickerToggleComponent));
                const clearElem = inputGroup.query(By.directive(IgxPickerClearComponent));
                let toggle = fixture.componentInstance.customToggle;
                let clear = fixture.componentInstance.customClear;

                expect(toggle.clicked.observers).toHaveSize(1);
                expect(clear.clicked.observers).toHaveSize(1);
                const event = jasmine.createSpyObj('event', ['stopPropagation']);
                toggleElem.triggerEventHandler('click', event);
                expect(timePicker.open).toHaveBeenCalledTimes(1);
                clearElem.triggerEventHandler('click', event);
                expect(timePicker.clear).toHaveBeenCalledTimes(1);

                // hide
                fixture.componentInstance.showCustomToggle = false;
                fixture.detectChanges();
                expect(toggle.clicked.observers).toHaveSize(0);
                expect(clear.clicked.observers).toHaveSize(1);
                fixture.componentInstance.showCustomClear = false;
                fixture.detectChanges();
                expect(toggle.clicked.observers).toHaveSize(0);
                expect(clear.clicked.observers).toHaveSize(0);

                // show again
                fixture.componentInstance.showCustomClear = true;
                fixture.componentInstance.showCustomToggle = true;
                fixture.detectChanges();
                toggle = fixture.componentInstance.customToggle;
                clear = fixture.componentInstance.customClear;
                expect(toggle.clicked.observers).toHaveSize(1);
                expect(clear.clicked.observers).toHaveSize(1);

                timePicker.ngOnDestroy();
                expect(toggle.clicked.observers).toHaveSize(0);
                expect(clear.clicked.observers).toHaveSize(0);
            });
        });

        describe('FormControl integration', () => {
            let fixture: ComponentFixture<IgxTimePickerInFormComponent>;
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxTimePickerInFormComponent
                    ],
                    imports: [IgxTimePickerModule, IgxInputGroupModule, FormsModule, NoopAnimationsModule]
                }).compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxTimePickerInFormComponent);
                fixture.detectChanges();
                timePicker = fixture.componentInstance.timePicker;
            }));

            it('should set validity to initial when the form is reset', fakeAsync(() => {
                const tpInput = document.getElementsByClassName('igx-input-group__input')[0] as HTMLInputElement;
                tpInput.focus();
                tick();
                fixture.detectChanges();

                tpInput.blur();
                tick();
                fixture.detectChanges();
                expect((timePicker as any).inputDirective.valid).toEqual(IgxInputState.INVALID);

                fixture.componentInstance.form.resetForm();
                tick();
                expect((timePicker as any).inputDirective.valid).toEqual(IgxInputState.INITIAL);
            }));
        });
    });
});

@Component({
    template: `
        <igx-time-picker #picker [value]="date" [mode]="mode" [minValue]="minValue" [maxValue]="maxValue">
        <label igxLabel>Select time</label>
        </igx-time-picker>`
})
export class IgxTimePickerTestComponent {
    @ViewChild('picker', { read: IgxTimePickerComponent, static: true })
    public timePicker: IgxTimePickerComponent;
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;
    public date = new Date(2021, 24, 2, 11, 45, 0);
    public minValue;
    public maxValue;
}

@Component({
    template: `
        <igx-time-picker [mode]="mode">
            <label igxLabel>Label</label>
            <igx-picker-toggle igxPrefix *ngIf="showCustomToggle">CustomToggle</igx-picker-toggle>
            <igx-prefix>Prefix</igx-prefix>
            <igx-picker-clear igxSuffix *ngIf="showCustomClear">CustomClear</igx-picker-clear>
            <igx-suffix>Suffix</igx-suffix>
            <igx-hint>Hint</igx-hint>
        </igx-time-picker>
`
})
export class IgxTimePickerWithProjectionsComponent {
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
    @ViewChild(IgxPickerToggleComponent) public customToggle: IgxPickerToggleComponent;
    @ViewChild(IgxPickerClearComponent) public customClear: IgxPickerClearComponent;
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;
    public showCustomToggle = false;
    public showCustomClear = false;
}

@Component({
    template: `
    <form #form="ngForm">
        <igx-time-picker name="timePicker" [minValue]="minValue" [(ngModel)]="date" [required]="true"></igx-time-picker>
    </form>
    `
})
export class IgxTimePickerInFormComponent {
    @ViewChild('form')
    public form: NgForm;

    @ViewChild(IgxTimePickerComponent)
    public timePicker: IgxTimePickerComponent;

    public minValue = new Date(2010, 3, 3, 13, 0, 0);
    public date: Date = new Date(2010, 3, 3, 12, 0, 0);;
}
