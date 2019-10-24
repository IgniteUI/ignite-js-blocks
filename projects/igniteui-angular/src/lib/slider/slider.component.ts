import { CommonModule } from '@angular/common';
import {
    AfterViewInit, Component, ElementRef, EventEmitter,
    HostBinding, Input, NgModule, OnInit, Output, Renderer2,
    ViewChild,
    TemplateRef,
    ContentChild,
    OnDestroy,
    HostListener,
    ViewChildren,
    QueryList,
    ChangeDetectorRef,
    AfterContentChecked
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditorProvider } from '../core/edit-provider';
import { DeprecateProperty } from '../core/deprecateDecorators';
import { IgxSliderThumbComponent } from './thumb/thumb-slider.component';
import { Subject, merge, Observable, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SliderHandle,
    IgxThumbFromTemplateDirective,
    IgxThumbToTemplateDirective,
    IRangeSliderValue,
    SliderType,
    ISliderValueChangeEventArgs
} from './slider.common';
import { IgxThumbLabelComponent } from './label/thumb-label.component';


const noop = () => {
};

let NEXT_ID = 0;

/**
 * **Ignite UI for Angular Slider** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/slider.html)
 *
 * The Ignite UI Slider allows selection in a given range by moving the thumb along the track. The track
 * can be defined as continuous or stepped, and you can choose between single and range slider types.
 *
 * Example:
 * ```html
 * <igx-slider id="slider"
 *            [minValue]="0" [maxValue]="100"
 *            [continuous]=true [(ngModel)]="volume">
 * </igx-slider>
 * ```
 */
@Component({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxSliderComponent, multi: true }],
    selector: 'igx-slider',
    templateUrl: 'slider.component.html',
    styles: [`
        :host {
            display: block;
        }
    `]
})
export class IgxSliderComponent implements
    ControlValueAccessor,
    EditorProvider,
    OnInit,
    AfterViewInit,
    AfterContentChecked,
    OnDestroy {

    // Limit handle travel zone
    private _pMin = 0;
    private _pMax = 1;

    // From/upperValue in percent values
    private _hasViewInit = false;
    private _minValue = 0;
    private _maxValue = 100;
    private _lowerBound?: number;
    private _upperBound?: number;
    private _lowerValue?: number;
    private _upperValue?: number;
    private _continuous = false;
    private _disabled = false;
    private _step = 1;

    private _labels = new Array<number|string|boolean|null|undefined>();
    private _type = SliderType.SLIDER;

    private _destroyer$ = new Subject<boolean>();
    private _indicatorsDestroyer$ = new Subject<boolean>();
    private _indicatorsTimer: Observable<any>;


    private _onChangeCallback: (_: any) => void = noop;
    private _onTouchedCallback: () => void = noop;

    /**
     * @hidden
     */
    @ViewChild('track', { static: true })
    private track: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('ticks', { static: true })
    private ticks: ElementRef;

    /**
     * @hidden
     */
    @ViewChildren(IgxSliderThumbComponent)
    private thumbs: QueryList<IgxSliderThumbComponent> = new QueryList<IgxSliderThumbComponent>();

    /**
     * @hidden
     */
    @ViewChildren(IgxThumbLabelComponent)
    private labelRefs: QueryList<IgxThumbLabelComponent> = new QueryList<IgxThumbLabelComponent>();

    private get thumbFrom(): IgxSliderThumbComponent {
        return this.thumbs.find(thumb => thumb.type === SliderHandle.FROM);
    }

    private get thumbTo(): IgxSliderThumbComponent {
        return this.thumbs.find(thumb => thumb.type === SliderHandle.TO);
    }

    private get labelFrom(): IgxThumbLabelComponent {
        return this.labelRefs.find(label => label.type === SliderHandle.FROM);
    }

    private get labelTo(): IgxThumbLabelComponent {
        return this.labelRefs.find(label => label.type === SliderHandle.TO);
    }

    /**
     * @hidden
     */
    public stepDistance = this._step;

    /**
     * @hidden
     */
    public onPan: Subject<number> = new Subject<number>();

    /**
     * @hidden
     */
    @ContentChild(IgxThumbFromTemplateDirective, { read: TemplateRef, static: false })
    public thumbFromTemplateRef: TemplateRef<any>;

    /**
     * @hidden
     */
    @ContentChild(IgxThumbToTemplateDirective, { read: TemplateRef, static: false })
    public thumbToTemplateRef: TemplateRef<any>;

    /**
     * @hidden
     */
    @HostBinding(`attr.role`)
    public role = 'slider';

    /**
     * @hidden
     */
    @HostBinding(`attr.aria-valuemin`)
    public get valuemin() {
        return this.minValue;
    }

    /**
     * @hidden
     */
    @HostBinding(`attr.aria-valuemax`)
    public get valuemax() {
        return this.maxValue;
    }

    /**
     * @hidden
     */
    @HostBinding(`attr.aria-readonly`)
    public get readonly() {
        return this.disabled;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-slider')
    public slierClass = true;

    /**
     * @hidden
     */
    @HostBinding('class.igx-slider--disabled')
    public get disabledClass() {
        return this.disabled;
    }

    /**
     * An @Input property that sets the value of the `id` attribute.
     * If not provided it will be automatically generated.
     * ```html
     * <igx-slider [id]="'igx-slider-32'" [(ngModel)]="task.percentCompleted" [step]="5" [lowerBound]="20">
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-slider-${NEXT_ID++}`;

    /**
     * An @Input property that gets the type of the `IgxSliderComponent`. The slider can be SliderType.SLIDER(default) or SliderType.RANGE.
     * ```typescript
     * @ViewChild("slider2")
     * public slider: IgxSliderComponent;
     * ngAfterViewInit(){
     *     let type = this.slider.type;
     * }
     */
    @Input()
    public get type() {
        return this._type;
    }

    /**
     * An @Input property that sets the type of the `IgxSliderComponent`. The slider can be SliderType.SLIDER(default) or SliderType.RANGE.
     * ```typescript
     * sliderType: SliderType = SliderType.RANGE;
     * ```
     * ```html
     * <igx-slider #slider2 [type]="sliderType" [(ngModel)]="rangeValue" [minValue]="0" [maxValue]="100">
     * ```
     */
    public set type(type: SliderType) {
        this._type = type;

        if (type === SliderType.SLIDER) {
            this.lowerValue = 0;
        }

        if (this.labelsViewEnabled && this.upperValue > this.maxValue) {
            this.upperValue = this.labels.length - 1;
        }

        if (this._hasViewInit) {
            this.updateTrack();
        }
    }

    /**
     *An @Input property that sets the duration visibility of thumbs labels. The default value is 750 milliseconds.
     *```html
     *<igx-slider #slider [thumbLabelVisibilityDuration]="3000" [(ngModel)]="task.percentCompleted" [step]="5">
     *```
     */
    @Input()
    public thumbLabelVisibilityDuration = 750;


    /**
     * Enables `labelView`, by accepting a collection of primitive values with more than one element.
     * Each element will be equally spread over the slider and it will serve as a thumb label.
     * Once the property is set, it will precendence over {@link maxValue}, {@link minValue}, {@link step}.
     * This means that the manipulation for those properties won't be allowed.
     */
    @Input()
    public get labels() {
        return this._labels;
    }

    public set labels(labels: Array<number|string|boolean|null|undefined>) {
        this._labels = labels;

        this._pMax = 1;

        if (this._hasViewInit) {
            this.stepDistance = this.calculateStepDistance();
            this.positionHandlesAndUpdateTrack();
            this.setTickInterval(labels);
        }
    }

    /**
     * Returns the template context corresponding
     * to {@link IgxThumbFromTemplateDirective} and {@link IgxThumbToTemplateDirective} templates.
     *
     * return {
     *  $implicit: {@link value},
     *  labels: {@link labels}
     * }
     * ```
     */
    public get context(): any {
        return {
            $implicit: this.value,
            labels: this.labels
        };
    }

    /**
     * An @Input property that sets the incremental/decremental step of the value when dragging the thumb.
     * The default step is 1, and step should not be less or equal than 0.
     * ```html
     * <igx-slider #slider [(ngModel)]="task.percentCompleted" [step]="5">
     * ```
     */
    @Input()
    public set step(step: number) {
        this._step = step;

        if (this._hasViewInit) {
            this.stepDistance = this.calculateStepDistance();
            this.normalizeByStep(this.value);
            this.setTickInterval(this.labels);
        }
    }

    /**
     * Returns the incremental/decremental dragging step of the {@link IgxSliderComponent}.
     * ```typescript
     * @ViewChild("slider2")
     * public slider: IgxSliderComponent;
     * ngAfterViewInit(){
     *     let step = this.slider.step;
     * }
     * ```
     */
    public get step() {
        return this.labelsViewEnabled ? 1 : this._step;
    }

    /**
     * Returns if the {@link IgxSliderComponent} is disabled.
     * ```typescript
     * @ViewChild("slider2")
     * public slider: IgxSliderComponent;
     * ngAfterViewInit(){
     *     let isDisabled = this.slider.disabled;
     * }
     * ```
     */
    @Input()
    public get disabled(): boolean {
        return this._disabled;
    }

    /**
     *An @Input property that disables or enables UI interaction.
     *```html
     *<igx-slider #slider [disabled]="'true'" [(ngModel)]="task.percentCompleted" [step]="5" [lowerBound]="20">
     *```
     */
    public set disabled(disable: boolean) {
        this._disabled = disable;

        if (this._hasViewInit) {
            this.changeThumbFocusableState(disable);
        }
    }

    /**
     * Returns if the {@link IgxSliderComponent} is set as continuous.
     * ```typescript
     * @ViewChild("slider2")
     * public slider: IgxSliderComponent;
     * ngAfterViewInit(){
     *     let continuous = this.slider.continuous;
     * }
     * ```
     */
    @Input()
    public get continuous(): boolean {
        return this._continuous;
    }

    /**
     * An @Input property that marks the {@link IgxSliderComponent} as continuous.
     * By default is considered that the {@link IgxSliderComponent} is discrete.
     * Discrete {@link IgxSliderComponent} does not have ticks and does not show bubble labels for values.
     * ```html
     * <igx-slider #slider [continuous]="'true'" [(ngModel)]="task.percentCompleted" [step]="5" [lowerBound]="20">
     * ```
     */
    public set continuous(continuous: boolean) {
        this._continuous = continuous;
        if (this._hasViewInit) {
            this.setTickInterval(null);
        }
    }

    /**
     * Returns if the {@link IgxSliderComponent} is set as continuous.
     * ```typescript
     * @ViewChild("slider2")
     * public slider: IgxSliderComponent;
     * ngAfterViewInit(){
     *     let continuous = this.slider.continuous;
     * }
     * ```
     */
    @Input()
    @DeprecateProperty(`IgxSliderComponent \`isContinuous\` property is deprecated.\nUse \`continuous\` instead.`)
    public get isContinuous(): boolean {
        return this.continuous;
    }

    /**
     * @hidden
     * @internal
     */
    public set isContinuous(continuous: boolean) {
        this.continuous = continuous;
    }

    /**
     * Returns the maximum value for the {@link IgxSliderComponent}.
     * ```typescript
     *@ViewChild("slider")
     *public slider: IgxSliderComponent;
     *ngAfterViewInit(){
     *    let sliderMax = this.slider.maxValue;
     *}
     * ```
     */
    public get maxValue(): number {
        return this.labelsViewEnabled ?
            this.labels.length - 1 :
            this._maxValue;
    }

    /**
     * Sets the maximal value for the `IgxSliderComponent`.
     * The default maximum value is 100.
     * ```html
     * <igx-slider [type]="sliderType" [minValue]="56" [maxValue]="256">
     * ```
     */
    @Input()
    public set maxValue(value: number) {
        if (value <= this._minValue) {
            this._maxValue = this._minValue + 1;
        } else {
            this._maxValue = value;
        }

        if (value < this.lowerBound) {
            this.updateLowerBoundAndMinTravelZone();
            this.upperBound = value;
        }

        // refresh max travel zone limits.
        this._pMax = 1;
        // recalculate step distance.
        this.stepDistance = this.calculateStepDistance();
        this.positionHandlesAndUpdateTrack();
        if (this._hasViewInit) {
            this.setTickInterval(null);
        }
    }

    /**
     *Returns the minimal value of the `IgxSliderComponent`.
     *```typescript
     *@ViewChild("slider2")
     *public slider: IgxSliderComponent;
     *ngAfterViewInit(){
     *    let sliderMin = this.slider.minValue;
     *}
     *```
     */
    public get minValue(): number {
        if (this.labelsViewEnabled) {
            return 0;
        }

        return this._minValue;
    }

    /**
     * Sets the minimal value for the `IgxSliderComponent`.
     * The default minimal value is 0.
     * ```html
     * <igx-slider [type]="sliderType" [minValue]="56" [maxValue]="100">
     * ```
     */
    @Input()
    public set minValue(value: number) {
        if (value >= this.maxValue) {
            this._minValue = this.maxValue - 1;
        } else {
            this._minValue = value;
        }

        if (value > this.upperBound) {
            this.updateUpperBoundAndMaxTravelZone();
            this.lowerBound = value;
        }

        // Refresh min travel zone limit.
        this._pMin = 0;
        // Recalculate step distance.
        this.stepDistance = this.calculateStepDistance();
        this.positionHandlesAndUpdateTrack();
        if (this._hasViewInit) {
            this.setTickInterval(null);
        }
    }

    /**
     * Returns the lower boundary of the `IgxSliderComponent`.
     *```typescript
     *@ViewChild("slider")
     *public slider: IgxSliderComponent;
     *ngAfterViewInit(){
     *    let sliderLowBound = this.slider.lowerBound;
     *}
     *```
     */
    public get lowerBound(): number {
        if (!Number.isNaN(this._lowerBound) && this._lowerBound !== undefined) {
            return this.valueInRange(this._lowerBound, this.minValue, this.maxValue);
        }

        return this.minValue;
    }

    /**
     * Sets the lower boundary of the `IgxSliderComponent`.
     * If not set is the same as min value.
     * ```html
     * <igx-slider [step]="5" [lowerBound]="20">
     * ```
     */
    @Input()
    public set lowerBound(value: number) {
        if (value >= this.upperBound || (this.labelsViewEnabled && value < 0)) {
            return;
        }

        this._lowerBound = this.valueInRange(value, this.minValue, this.maxValue);

        // Refresh time travel zone.
        this._pMin = this.valueToFraction(this._lowerBound) || 0;
        this.positionHandlesAndUpdateTrack();
    }

    /**
     * Returns the upper boundary of the `IgxSliderComponent`.
     * ```typescript
     *@ViewChild("slider")
     *public slider: IgxSliderComponent;
     *ngAfterViewInit(){
     *    let sliderUpBound = this.slider.upperBound;
     *}
     * ```
     */
    public get upperBound(): number {
        if (!Number.isNaN(this._upperBound) && this._upperBound !== undefined) {
            return this.valueInRange(this._upperBound, this.minValue, this.maxValue);
        }

        return this.maxValue;
    }

    /**
     * Sets the upper boundary of the `IgxSliderComponent`.
     * If not set is the same as max value.
     * ```html
     * <igx-slider [step]="5" [upperBound]="20">
     * ```
     */
    @Input()
    public set upperBound(value: number) {
        if (value <= this.lowerBound || (this.labelsViewEnabled && value > this.labels.length - 1)) {
            return;
        }

        this._upperBound = this.valueInRange(value, this.minValue, this.maxValue);
        // Refresh time travel zone.
        this._pMax = this.valueToFraction(this._upperBound) || 1;
        this.positionHandlesAndUpdateTrack();
    }

    /**
     * Returns the slider value. If the slider is of type {@link SliderType.SLIDER} the returned value is number.
     * If the slider type is {@link SliderType.RANGE} the returned value represents an object of {@link lowerValue} and {@link upperValue}.
     *```typescript
     *@ViewChild("slider2")
     *public slider: IgxSliderComponent;
     *public sliderValue(event){
     *    let sliderVal = this.slider.value;
     *}
     *```
     */
    public get value(): number | IRangeSliderValue {
        if (this.isRange) {
            return {
                lower: this.valueInRange(this.lowerValue, this.lowerBound, this.upperBound),
                upper: this.valueInRange(this.upperValue, this.lowerBound, this.upperBound)
            };
        } else {
            return this.valueInRange(this.upperValue, this.lowerBound, this.upperBound);
        }
    }

    /**
     * Sets the slider value.
     * If the slider is of type {@link SliderType.SLIDER} the argument is number. By default the {@link value} gets the {@link lowerBound}.
     * If the slider type is {@link SliderType.RANGE} the argument
     * represents an object of {@link lowerValue} and {@link upperValue} properties.
     * By default the object is associated with the {@link lowerBound} and {@link upperBound} property values.
     * ```typescript
     *rangeValue = {
     *   lower: 30,
     *   upper: 60
     *};
     * ```
     * ```html
     * <igx-slider [type]="sliderType" [(ngModel)]="rangeValue" [minValue]="56" [maxValue]="256">
     * ```
     */
    @Input()
    public set value(value: number | IRangeSliderValue) {
        if (!this.isRange) {
            this.upperValue = value as number;
        } else {
            value = this.validateInitialValue(value as IRangeSliderValue);
            this.upperValue = (value as IRangeSliderValue).upper;
            this.lowerValue = (value as IRangeSliderValue).lower;
        }

        this._onChangeCallback(this.value);

        if (this._hasViewInit) {
            this.positionHandlesAndUpdateTrack();
        }
    }

    /**
     * This event is emitted when user has stopped interacting the thumb and value is changed.
     * ```typescript
     * public change(event){
     *    alert("The value has been changed!");
     *}
     * ```
     * ```html
     * <igx-slider (onValueChange)="change($event)" #slider [(ngModel)]="task.percentCompleted" [step]="5">
     * ```
     */
    @Output()
    public onValueChange = new EventEmitter<ISliderValueChangeEventArgs>();


    constructor(private renderer: Renderer2, private _el: ElementRef, private _cdr: ChangeDetectorRef) { }

    /**
     * @hidden
     */
    @HostListener('pointerdown', ['$event'])
    public onPointerDown($event: PointerEvent) {
        this.findClosestThumb($event);

        if (!this.thumbTo.isActive && this.thumbFrom === undefined) {
            return;
        }

        const activeThumb = this.thumbTo.isActive ? this.thumbTo : this.thumbFrom;
        activeThumb.nativeElement.setPointerCapture($event.pointerId);
        this.showSliderIndicators();

        $event.preventDefault();
    }


    /**
     * @hidden
     */
    @HostListener('pointerup', ['$event'])
    public onPointerUp($event) {
        if (!this.thumbTo.isActive && this.thumbFrom === undefined) {
            return;
        }

        const activeThumb = this.thumbTo.isActive ? this.thumbTo : this.thumbTo;
        activeThumb.nativeElement.releasePointerCapture($event.pointerId);

        this.hideSliderIndicators();
    }

    /**
     * @hidden
     */
    @HostListener('focus')
    public onFocus() {
        this.toggleSliderIndicators();
    }

    /**
     * @hidden
     */
    @HostListener('pan', ['$event'])
    public onPanListener($event) {
        this.update($event.srcEvent.clientX);
    }

    @HostListener('panstart')
    public onPanStart() {
        this.showSliderIndicators();
    }

    @HostListener('panend')
    public onPanEnd() {
        this.hideSliderIndicators();
    }

    /**
     *Returns whether the `IgxSliderComponent` type is RANGE.
     *```typescript
     *@ViewChild("slider")
     *public slider: IgxSliderComponent;
     *ngAfterViewInit(){
     *    let sliderRange = this.slider.isRange;
     *}
     * ```
     */
    public get isRange(): boolean {
        return this.type === SliderType.RANGE;
    }

    /**
     * Returns the lower value of the `IgxSliderComponent`.
     * ```typescript
     * @ViewChild("slider")
     * public slider: IgxSliderComponent;
     * public lowValue(event){
     *    let sliderLowValue = this.slider.lowerValue;
     *}
     *```
     */
    public get lowerValue(): number {
        if (!Number.isNaN(this._lowerValue) && this._lowerValue !== undefined && this._lowerValue >= this.lowerBound) {
            return this._lowerValue;
        }

        return this.lowerBound;
    }

    /**
     *Sets the lower value of the `IgxSliderComponent`.
     *```typescript
     *@ViewChild("slider2")
     *public slider: IgxSliderComponent;
     *public lowValue(event){
     *    this.slider.lowerValue = 120;
     *}
     *```
     */
    public set lowerValue(value: number) {
        value = this.valueInRange(value, this.lowerBound, this.upperBound);
        this._lowerValue = value;

    }

    /**
     *Returns the upper value of the `IgxSliderComponent`.
     *```typescript
     *@ViewChild("slider2")
     *public slider: IgxSliderComponent;
     *public upperValue(event){
     *    let upperValue = this.slider.upperValue;
     *}
     *```
     */
    public get upperValue() {
        if (!Number.isNaN(this._upperValue) && this._upperValue !== undefined && this._upperValue <= this.upperBound) {
            return this._upperValue;
        }

        return this.upperBound;
    }

    /**
     *Sets the upper value of the `IgxSliderComponent`.
     *```typescript
     *@ViewChild("slider2")
     *public slider: IgxSliderComponent;
     *public upperValue(event){
     *    this.slider.upperValue = 120;
     *}
     *```
     */
    public set upperValue(value: number) {
        value = this.valueInRange(value, this.lowerBound, this.upperBound);
        this._upperValue = value;
    }

    /**
     * Returns the value corresponding the lower label.
     *```typescript
     * @ViewChild("slider")
     * public slider: IgxSliderComponent;
     * let label = this.slider.lowerLabel;
     *```
     */
    public get lowerLabel() {
        return this.labelsViewEnabled ?
            this.labels[this.lowerValue] :
            this.lowerValue;
    }

    /**
     * Returns the value corresponding the upper label.
     *```typescript
     * @ViewChild("slider")
     * public slider: IgxSliderComponent;
     * let label = this.slider.upperLabel;
     *```
     */
    public get upperLabel() {
        return this.labelsViewEnabled ?
            this.labels[this.upperValue] :
            this.upperValue;
    }

    /**
     * Returns if label view is enabled.
     * If the {@link labels} is set, the view is automatically activated.
     *```typescript
     * @ViewChild("slider")
     * public slider: IgxSliderComponent;
     * let labelView = this.slider.labelsViewEnabled;
     *```
     */
    public get labelsViewEnabled(): boolean {
        return !!(this.labels && this.labels.length > 1);
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        this.sliderSetup();

        // Set track travel zone
        this._pMin = this.valueToFraction(this.lowerBound) || 0;
        this._pMax = this.valueToFraction(this.upperBound) || 1;
    }

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        this._hasViewInit = true;
        this.positionHandlesAndUpdateTrack();
        this.setTickInterval(this.labels);
        this.changeThumbFocusableState(this.disabled);

        this.subscribeTo(this.thumbFrom, this.thumbChanged.bind(this));
        this.subscribeTo(this.thumbTo, this.thumbChanged.bind(this));

        this.thumbs.changes.pipe(takeUntil(this._destroyer$)).subscribe(change => {
            const thumbFrom = change.find((thumb: IgxSliderThumbComponent) => thumb.type === SliderHandle.FROM);
            const labelFrom = this.labelRefs.find((label: IgxThumbLabelComponent) => label.type === SliderHandle.FROM);
            this.positionHandle(thumbFrom, labelFrom, this.lowerValue);
            this.subscribeTo(thumbFrom, this.thumbChanged.bind(this));
            this.changeThumbFocusableState(this.disabled);
        });
    }

    /**
     * @hidden
     */
    public ngAfterContentChecked() {
        // Calculates the distance between every step in pixels.
        this.stepDistance = this.calculateStepDistance();
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this._destroyer$.next(true);
        this._destroyer$.complete();

        this._indicatorsDestroyer$.next(true);
        this._indicatorsDestroyer$.complete();
    }

    /**
     * @hidden
     */
    public writeValue(value: IRangeSliderValue | number): void {
        if (!value) {
            return;
        }

        this.normalizeByStep(value);
    }

    /**
     * @hidden
     */
    public registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    /**
     * @hidden
     */
    public registerOnTouched(fn: any): void {
        this._onTouchedCallback = fn;
    }

    /** @hidden */
    public getEditElement() {
        return this.isRange ? this.thumbFrom.nativeElement : this.thumbTo.nativeElement;
    }

    /**
     *
     * @hidden
     */
    public update(mouseX) {
        if (this.disabled) {
            return;
        }

        // Update To/From Values
        this.onPan.next(mouseX);

        // Finally do positionHandlesAndUpdateTrack the DOM
        // based on data values
        this.positionHandlesAndUpdateTrack();
        this._onTouchedCallback();
    }

    /**
     * @hidden
     */
    public thumbChanged(value: number, thumbType: number) {
        const oldValue = this.value;

        let newVal: IRangeSliderValue;
        if (this.isRange) {
            if (thumbType === SliderHandle.FROM) {
                newVal = {
                    lower: (this.value as IRangeSliderValue).lower + value,
                    upper: (this.value as IRangeSliderValue).upper
                };
            } else {
                newVal = {
                    lower: (this.value as IRangeSliderValue).lower,
                    upper: (this.value as IRangeSliderValue).upper + value
                };
            }

            // Swap the thumbs if a collision appears.
            if (newVal.lower >= newVal.upper) {
                this.value = this.swapThumb(newVal);
            } else {
                this.value = newVal;
            }

        } else {
            this.value = this.value as number + value;
        }

        if (this.hasValueChanged(oldValue)) {
            this.emitValueChanged(oldValue);
        }
    }

    /**
     * @hidden
     */
    public onThumbChange() {
        this.toggleSliderIndicators();
    }

    public onHoverChange(state: boolean) {
        return state ? this.showSliderIndicators() : this.hideSliderIndicators();
    }

    private swapThumb(value: IRangeSliderValue) {
        if (this.thumbFrom.isActive) {
            value.upper = this.upperValue;
            value.lower = this.upperValue;
        } else {
            value.upper = this.lowerValue;
            value.lower = this.lowerValue;
        }

        this.toggleThumb();

        return value;
    }

    private findClosestThumb(event: PointerEvent) {
        if (this.isRange) {
            this.closestHandle(event);
        } else {
            this.thumbTo.nativeElement.focus();
        }

        this.update(event.clientX);
    }

    private updateLowerBoundAndMinTravelZone() {
        this.lowerBound = this.minValue;
        this._pMin = 0;
    }

    private updateUpperBoundAndMaxTravelZone() {
        this.upperBound = this.maxValue;
        this._pMax = 1;
    }

    private sliderSetup() {
        /**
         * if {@link SliderType.SLIDER} than the initial value shold be the lowest one.
         */
        if (!this.isRange && this.value === this.upperBound) {
            this.value = this.lowerBound;
        }
    }

    private calculateStepDistance() {
        return this._el.nativeElement.getBoundingClientRect().width / (this.maxValue - this.minValue) * this.step;
    }

    private toggleThumb() {
        return this.thumbFrom.isActive ?
            this.thumbTo.nativeElement.focus() :
            this.thumbFrom.nativeElement.focus();
    }

    private valueInRange(value, min = 0, max = 100) {
        return Math.max(Math.min(value, max), min);
    }

    private generateTickMarks(color: string, interval: number) {
        return interval !== null ? `repeating-linear-gradient(
            ${'to left'},
            ${color},
            ${color} 1.5px,
            transparent 1.5px,
            transparent ${interval}%
        ), repeating-linear-gradient(
            ${'to right'},
            ${color},
            ${color} 1.5px,
            transparent 1.5px,
            transparent ${interval}%
        )` : interval;
    }

    private positionHandle(thumbHandle: ElementRef, labelHandle: ElementRef, position: number) {
        const positionLeft = `${this.valueToFraction(position) * 100}%`;

        if (thumbHandle) {
            thumbHandle.nativeElement.style.left = positionLeft;
        }

        if (labelHandle) {
            labelHandle.nativeElement.style.left = positionLeft;
        }
    }

    private positionHandlesAndUpdateTrack() {
        if (!this.isRange) {
            this.positionHandle(this.thumbTo, this.labelTo, this.value as number);
        } else {
            this.positionHandle(this.thumbTo, this.labelTo, (this.value as IRangeSliderValue).upper);
            this.positionHandle(this.thumbFrom, this.labelFrom, (this.value as IRangeSliderValue).lower);
        }

        if (this._hasViewInit) {
            this.updateTrack();
        }
    }

    private closestHandle(event: PointerEvent) {
        const fromOffset = this.thumbFrom.nativeElement.offsetLeft + this.thumbFrom.nativeElement.offsetWidth / 2;
        const toOffset = this.thumbTo.nativeElement.offsetLeft + this.thumbTo.nativeElement.offsetWidth / 2;
        const xPointer = event.clientX - this._el.nativeElement.getBoundingClientRect().left;
        const match = this.closestTo(xPointer, [fromOffset, toOffset]);

        if (fromOffset === toOffset && toOffset < xPointer) {
            this.thumbTo.nativeElement.focus();
        } else if (fromOffset === toOffset && toOffset > xPointer ) {
            this.thumbFrom.nativeElement.focus();
        } else if (match === fromOffset) {
            this.thumbFrom.nativeElement.focus();
        } else {
            this.thumbTo.nativeElement.focus();
        }
    }

    private setTickInterval(labels) {
        let interval;
        const trackProgress = 100;
        if (this.labelsViewEnabled) {
            // Calc ticks depending on the labels length;
            interval = ((trackProgress / (this.labels.length - 1) * 10)) / 10;
        } else {
            const trackRange = this.maxValue - this.minValue;
            interval = this.step > 1 ?
                (trackProgress / ((trackRange / this.step)) * 10) / 10
                : null;
        }

        const renderCallbackExecution = !this.continuous ? this.generateTickMarks('white', interval) : null;
        this.renderer.setStyle(this.ticks.nativeElement, 'background', renderCallbackExecution);
    }

    private showSliderIndicators() {
        if (this.disabled) {
            return;
        }

        if (this._indicatorsTimer) {
            this._indicatorsDestroyer$.next(true);
            this._indicatorsTimer = null;
        }

        this.thumbTo.showThumbIndicators();
        this.labelTo.active = true;
        if (this.thumbFrom) {
            this.thumbFrom.showThumbIndicators();
        }

        if (this.labelFrom) {
            this.labelFrom.active = true;
        }

    }

    private hideSliderIndicators() {
        if (this.disabled) {
            return;
        }

        this._indicatorsTimer = timer(this.thumbLabelVisibilityDuration);
        this._indicatorsTimer.pipe(takeUntil(this._indicatorsDestroyer$)).subscribe(() => {
            this.thumbTo.hideThumbIndicators();
            this.labelTo.active = false;
            if (this.thumbFrom) {
                this.thumbFrom.hideThumbIndicators();
            }

            if (this.labelFrom) {
                this.labelFrom.active = false;
            }
        });
    }

    private toggleSliderIndicators() {
        this.showSliderIndicators();
        this.hideSliderIndicators();
    }

    private changeThumbFocusableState(state: boolean) {
        const value = state ? -1 : 1;

        if (this.isRange) {
            this.thumbFrom.tabindex = value;
        }

        this.thumbTo.tabindex = value;

        this._cdr.detectChanges();
    }

    private closestTo(goal: number, positions: number[]): number {
        return positions.reduce((previous, current) => {
            return (Math.abs(goal - current) < Math.abs(goal - previous) ? current : previous);
        });
    }

    private valueToFraction(value: number, pMin = this._pMin, pMax = this._pMax) {
        return this.valueInRange((value - this.minValue) / (this.maxValue - this.minValue), pMin, pMax);
    }

    /**
     * @hidden
     * Normalizе the value when two-way data bind is used and {@link this.step} is set.
     * @param value
     */
    private normalizeByStep(value: IRangeSliderValue | number) {
        if (this.isRange) {
            this.value =  {
                lower: (value as IRangeSliderValue).lower - ((value as IRangeSliderValue).lower % this.step),
                upper: (value as IRangeSliderValue).upper - ((value as IRangeSliderValue).upper % this.step)
            };
        } else {
            this.value = (value as number) - ((value as number) % this.step);
        }
    }

    private updateTrack() {
        const fromPosition = this.valueToFraction(this.lowerValue);
        const toPosition = this.valueToFraction(this.upperValue);
        const positionGap = toPosition - fromPosition;

        let trackLeftIndention = fromPosition;
        if (this.isRange) {
            if (positionGap) {
                trackLeftIndention = Math.round((1 / positionGap * fromPosition) * 100);
            }

            this.renderer.setStyle(this.track.nativeElement, 'transform', `scaleX(${positionGap}) translateX(${trackLeftIndention}%)`);
        } else {
            this.renderer.setStyle(this.track.nativeElement, 'transform', `scaleX(${toPosition})`);
        }
    }

    private validateInitialValue(value: IRangeSliderValue) {
        if (value.lower < this.lowerBound && value.upper < this.lowerBound) {
            value.upper = this.lowerBound;
            value.lower = this.lowerBound;
        }

        if (value.lower > this.upperBound && value.upper > this.upperBound) {
            value.upper = this.upperBound;
            value.lower = this.upperBound;
        }

        if (value.upper < value.lower) {
            value.upper = this.upperValue;
            value.lower = this.lowerValue;
        }

        return value;
    }

    private subscribeTo(thumb: IgxSliderThumbComponent, callback: (a: number, b: number) => void) {
        if (!thumb) {
            return;
        }

        thumb.onThumbValueChange
            .pipe(takeUntil(this.unsubscriber(thumb)))
            .subscribe(value => callback(value, thumb.type));
    }

    private unsubscriber(thumb: IgxSliderThumbComponent) {
        return merge(this._destroyer$, thumb.destroy);
    }

    private hasValueChanged(oldValue) {
        const isSliderWithDifferentValue: boolean = !this.isRange && oldValue !== this.value;
        const isRangeWithOneDifferentValue: boolean = this.isRange &&
            ((oldValue as IRangeSliderValue).lower !== (this.value as IRangeSliderValue).lower ||
                (oldValue as IRangeSliderValue).upper !== (this.value as IRangeSliderValue).upper);

        return isSliderWithDifferentValue || isRangeWithOneDifferentValue;
    }

    private emitValueChanged(oldValue: number | IRangeSliderValue) {
        this.onValueChange.emit({ oldValue, value: this.value });
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxSliderComponent,
        IgxThumbFromTemplateDirective,
        IgxThumbToTemplateDirective,
        IgxSliderThumbComponent,
        IgxThumbLabelComponent],
    exports: [
        IgxSliderComponent,
        IgxThumbFromTemplateDirective,
        IgxThumbToTemplateDirective,
        IgxSliderThumbComponent,
        IgxThumbLabelComponent],
    imports: [CommonModule]
})
export class IgxSliderModule {
}
