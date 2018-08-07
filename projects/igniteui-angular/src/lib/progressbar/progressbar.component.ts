import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    OnChanges,
    Output,
    Renderer2,
    ViewChild
} from '@angular/core';

const ONE_PERCENT = 0.01;

export enum IgxTextAlign {
    START = 'start',
    CENTER = 'center',
    END = 'end'
}

export interface IChangeProgressEventArgs {
    previousValue: number;
    currentValue: number;
}

export abstract class BaseProgress {
    /**
     * @hidden
     */
    protected requestAnimationId: number = undefined;

    /**
     * @hidden
     */
    protected _valueInPercent = 0;
    /**
     * @hidden
     */
    protected _max = 100;
    /**
     * @hidden
     */
    protected _value = 0;
    /**
     * @hidden
     */
    protected _animate = true;

    /**
     * @hidden
     */
    protected _step;

    /**
     *Returns the `IgxLinearProgressBarComponent`/`IgxCircularProgressBarComponent` value in percentage.
     *```typescript
     *@ViewChild("MyProgressBar")
     *public progressBar: IgxLinearProgressBarComponent; // IgxCircularProgressBarComponent
     *public valuePercent(event){
     *    let percentValue = this.progressBar.valueInPercent;
     *    alert(percentValue);
     *}
     *```
     */
    public get valueInPercent(): number {
        return this._valueInPercent;
    }

    /**
     *Sets the `IgxLinearProgressBarComponent`/`IgxCircularProgressBarComponent` value in percentage.
     *```typescript
     *@ViewChild("MyProgressBar")
     *public progressBar: IgxLinearProgressBarComponent; // IgxCircularProgressBarComponent
     *    public setValue(event){
     *    this.progressBar.valueInPercent = 56;
     *}
     * //...
     *```
     *```html
     *<button igxButton="fab" igxRipple="" (click)="setValue()">setValue</button>
     *```
     */
    public set valueInPercent(value: number) {
        const valueInRange = getValueInProperRange(value, this._max);
        const valueIntoPercentage = convertInPercentage(valueInRange, this._max);
        this._valueInPercent = valueIntoPercentage;
    }

    /**
     * @hidden
     */
    protected runAnimation(val: number, step: number) {
        // const direction = this.directionFlow(this._value, val, step);

        if (!this.requestAnimationId) {
            this.requestAnimationId = requestAnimationFrame(
                () => this.updateProgressSmoothly.call(this, val, step));
        }

    }

    /**
     * @hidden
     */
    protected updateProgressSmoothly(val: number, step: number) {
        const convertPassedValIntoPercent = convertInPercentage(val, this._max);
        if (this.valueInPercent === convertPassedValIntoPercent ||
            (this.valueInPercent > convertPassedValIntoPercent && step > 0) ||
            (this.valueInPercent < convertPassedValIntoPercent && step < 0)) {
                this.requestAnimationId = undefined;
                return;
        }

        this._value += step;
        this.valueInPercent = this._value;

        requestAnimationFrame(() => this.updateProgressSmoothly.call(this, val, step));
    }

    /**
     * @hidden
     */
    protected updateProgressDirectly(val: number) {
        this._value = val;
        this.valueInPercent = this._value;
    }

    /**
     * @hidden
     */
    protected directionFlow(currentValue: number, prevValue: number, step: number): number {
        if (currentValue < prevValue) {
            return step;
        }

        return -step;
    }
}
let NEXT_LINEAR_ID = 0;
let NEXT_CIRCULAR_ID = 0;
@Component({
    selector: 'igx-linear-bar',
    templateUrl: 'templates/linear-bar.component.html'
})
export class IgxLinearProgressBarComponent extends BaseProgress {

    /**An @Input property that sets the value of `id` attribute. If not provided it will be automatically generated.
     * ```html
     *<igx-linear-bar [id]="'igx-linear-bar-55'" [striped]="true" [max]="200" [value]="50"></igx-linear-bar>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-linear-bar-${NEXT_LINEAR_ID++}`;

    /**
     *Set the position that defines where the text is aligned.
     Possible options - `IgxTextAlign.START` (default), `IgxTextAlign.CENTER`, `IgxTextAlign.END`.
     *```typescript
     *public positionCenter: IgxTextAlign;
     *public ngOnInit() {
     *    this.positionCenter = IgxTextAlign.CENTER;
     *}
     * //...
     *```
     * ```html
     *<igx-linear-bar type="warning" [text]="'Custom text'" [textAlign]="positionCenter" [striped]="true"></igx-linear-bar>
     *```
     */
    @Input()
    public textAlign: IgxTextAlign = IgxTextAlign.START;

    /**
     *Set the text to be visible. By default it is set to true.
     * ```html
     *<igx-linear-bar type="default" [textVisibility]="false"></igx-linear-bar>
     *```
     */
    @Input()
    public textVisibility = true;

    /**
     *Set the position that defines if the text should be aligned above the progress line. By default is set to false.
     *```html
     *<igx-linear-bar type="danger" [textTop]="true"></igx-linear-bar>
     *```
     */
    @Input()
    public textTop = false;

    /**
     *Set a custom text that is displayed according to the defined position.
     * ```html
     *<igx-linear-bar type="warning" [text]="'Custom text'" [textAlign]="positionCenter" [striped]="true"></igx-linear-bar>
     *```
     */
    @Input()
    public text: string;

    /**
     *Set `IgxLinearProgressBarComponent` to have striped style. By default it is set to false.
     *```html
     *<igx-linear-bar [striped]="true" [max]="200" [value]="50"></igx-linear-bar>
     *```
     */
    @Input()
    public striped = false;

    /**
     *Set type of the `IgxLinearProgressBarComponent`. Possible options - `default`, `success`, `info`, `warning`, and `danger`.
     *```html
     *<igx-linear-bar [striped]="false" [max]="100" [value]="0" type="danger"></igx-linear-bar>
     *```
     */
    @Input()
    public type = 'default';

    /**
     *Animation on progress `IgxLinearProgressBarComponent`. By default it is set to true.
     *```html
     *<igx-linear-bar [animate]="false" [striped]="true" [max]="200" [value]="50"></igx-linear-bar>
     *```
     */
    @Input()
    set animate(animate: boolean) {
        this._animate = animate;
    }

    /**
     *Returns whether the `IgxLinearProgressBarComponent` has animation true/false.
     *```typescript
     *@ViewChild("MyProgressBar")
     *public progressBar: IgxLinearProgressBarComponent;
     *public animationStatus(event) {
     *    let animationStatus = this.progressBar.animate;
     *    alert(animationStatus);
     *}
     *```
     */
    get animate(): boolean {
        return this._animate;
    }

    /**
     *Set maximum value that can be passed. By default it is set to 100.
     *```html
     *<igx-linear-bar [striped]="false" [max]="200" [value]="0"></igx-linear-bar>
     *```
     */
    @Input()
    set max(maxNum: number) {
        this._max = maxNum;
    }

    /**
     *Returns the the maximum progress value of the `IgxLinearProgressBarComponent`.
     *```typescript
     *@ViewChild("MyProgressBar")
     *public progressBar: IgxLinearProgressBarComponent;
     *public maxValue(event) {
     *    let max = this.progressBar.max;
     *    alert(max);
     *}
     *```
     */
    get max() {
        return this._max;
    }

    /**
     *Returns the value which update the progress indicator of the `IgxLinearProgressBarComponent`.
     *```typescript
     *@ViewChild("MyProgressBar")
     *public progressBar: IgxLinearProgressBarComponent;
     *public stepValue(event) {
     *    let step = this.progressBar.step;
     *    alert(step);
     *}
     *```
     */
    @Input()
    get step(): number {
        if (this._step) {
            return this._step;
        }

        return this._max * ONE_PERCENT;
    }

    /**
     *Sets the value by which progress indicator is updated. By default it is 1% of the maximum value.
     *```html
     *<igx-linear-bar [striped]="false" [max]="200" [value]="0" [step]="1"></igx-linear-bar>
     *```
     */
    set step(val: number) {
        this._step = val;
    }

    /**
     *Returns value that indicates the current `IgxLinearProgressBarComponent` position.
     *```typescript
     *@ViewChild("MyProgressBar")
     *public progressBar: IgxLinearProgressBarComponent;
     *public getValue(event) {
     *    let value = this.progressBar.value;
     *    alert(value);
     *}
     *```
     */
    @Input()
    get value(): number {
        return this._value;
    }

    /**
     *Set value that indicates the current `IgxLinearProgressBarComponent` position.
     *```html
     *<igx-linear-bar [striped]="false" [max]="200" [value]="50"></igx-linear-bar>
     *```
     */
    set value(val) {
        if (this._value === val) {
            return;
        }

        const valueInRange = getValueInProperRange(val, this.max);
        if (isNaN(valueInRange)) {
            return;
        }
        const changedValues = {
            currentValue: valueInRange,
            previousValue: this._value
        };

        const updateValue = super.directionFlow(this._value, val, this.step);
        if (this._animate) {
            super.runAnimation(valueInRange, updateValue);
        } else {
            super.updateProgressDirectly(valueInRange);
        }

        this.onProgressChanged.emit(changedValues);
    }

    /**
     *An event, which is triggered after a progress is changed.
     *```typescript
     *public progressChange(event) {
     *    alert("Progress made!");
     *}
     * //...
     *```
     *```html
     *<igx-linear-bar (onProgressChanged)="progressChange($event)" type="success">
     *```
     */
    @Output() public onProgressChanged = new EventEmitter<IChangeProgressEventArgs>();

    constructor(private elementRef: ElementRef) {
        super();
    }
}

@Component({
    selector: 'igx-circular-bar',
    templateUrl: 'templates/circular-bar.component.html'
})
export class IgxCircularProgressBarComponent extends BaseProgress implements AfterViewInit {

    private readonly STROKE_OPACITY_DVIDER = 100;
    private readonly STROKE_OPACITY_ADDITION = .2;

    /**
     *An event, which is triggered after a progress is changed.
     *```typescript
     *public progressChange(event) {
     *    alert("Progress made!");
     *}
     * //...
     *```
     *```html
     *<igx-circular-bar [value]="currentValue" (onProgressChanged)="progressChange($event)"></igx-circular-bar>
     *```
     */
    @Output()
    public onProgressChanged = new EventEmitter<IChangeProgressEventArgs>();

    /**
     *An @Input property that sets the value of `id` attribute. If not provided it will be automatically generated.
     *```html
     *<igx-circular-bar [id]="'igx-circular-bar-55'" [value]="50"></igx-circular-bar>
     *```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-circular-bar-${NEXT_CIRCULAR_ID++}`;

    /**
     *Sets the text visibility. By default it is set to true.
     *```html
     *<igx-circular-bar [textVisibility]="false"></igx-circular-bar>
     *```
     */
    @Input()
    public textVisibility = true;


    /**
     *Animation on progress `IgxCircularProgressBarComponent`. By default it is set to true.
     *```html
     *<igx-circular-bar [animate]="false" [value]="50"></igx-circular-bar>
     *```
     */
    @Input()
    set animate(animate: boolean) {
        this._animate = animate;
    }

    /**
     *Returns whether the `IgxCircularProgressBarComponent` has animation true/false.
     *```typescript
     *@ViewChild("MyProgressBar")
     *public progressBar: IgxCircularProgressBarComponent;
     *public animationStatus(event) {
     *    let animationStatus = this.progressBar.animate;
     *    alert(animationStatus);
     *}
     *```
     */
    get animate(): boolean {
        return this._animate;
    }

    /**
     *Set maximum value that can be passed. By default it is set to 100.
     *```html
     *<igx-circular-bar [max]="200" [value]="0"></igx-circular-bar>
     *```
     */
    @Input()
    set max(maxNum: number) {
        this._max = maxNum;
    }

    /**
     *Returns the the maximum progress value of the `IgxCircularProgressBarComponent`.
     *```typescript
     *@ViewChild("MyProgressBar")
     *public progressBar: IgxCircularProgressBarComponent;
     *public maxValue(event) {
     *    let max = this.progressBar.max;
     *    alert(max);
     *}
     *```
     *```html
     *<igx-circular-bar [max]="245" [animate]="false" [value]="currentValue"></igx-circular-bar>
     *```
     */
    get max(): number {
        return this._max;
    }

    /**
     *Returns the value which update the progress indicator of the `IgxCircularProgressBarComponent`.
     *```typescript
     *@ViewChild("MyProgressBar")
     *public progressBar: IgxCircularProgressBarComponent;
     *public stepValue(event) {
     *    let step = this.progressBar.step;
     *    alert(step);
     *}
     *```
     */
    @Input()
    get step() {
        if (this._step) {
            return this._step;
        }

        return this._max * ONE_PERCENT;
    }

    /**
     *Sets the value by which progress indicator is updated. By default it is 1% of the maximum value.
     *```html
     *<igx-circular-bar [striped]="false" [max]="200" [value]="0" [step]="1"></igx-circular-bar>
     *```
    */
    set step(val: number) {
        this._step = val;
    }

    /**
     *Returns value that indicates the current `IgxCircularProgressBarComponent` position.
     *```typescript
     *@ViewChild("MyProgressBar")
     *public progressBar: IgxCircularProgressBarComponent;
     *public getValue(event) {
     *    let value = this.progressBar.value;
     *    alert(value);
     *}
     *```
     *```html
     *<button igxButton="fab" igxRipple="" (click)="getValue()">Click</button>
     *```
     */
    @Input()
    get value() {
        return this._value;
    }

    /**
     *Set value that indicates the current `IgxCircularProgressBarComponent` position.
     *```html
     *<igx-circular-bar [value]="50"></igx-circular-bar>
     *```
     */
    set value(val) {
        if (this._value === val) {
            return;
        }

        const valueInProperRange = getValueInProperRange(val, this.max);
        if (isNaN(valueInProperRange)) {
            return;
        }

        const changedValues = {
            currentValue: valueInProperRange,
            previousValue: this._value
        };

        const updateValue = super.directionFlow(this._value, val, this.step);
        if (this.animate) {
            super.runAnimation(valueInProperRange, updateValue);
        } else {
            this.updateProgressDirectly(valueInProperRange);
        }

        this.onProgressChanged.emit(changedValues);
    }

    private _radius = 0;
    private _circumference: number;

    @ViewChild('circle') private _svgCircle: ElementRef;
    @ViewChild('text') private _svgText: ElementRef;

    constructor(private elementRef: ElementRef, private renderer: Renderer2) {
        super();
    }

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        this._radius = parseInt(this._svgCircle.nativeElement.getAttribute('r'), 10);
        this._circumference = 2 * Math.PI * this._radius;
    }

    /**
     * @hidden
     */
    public updateProgressSmoothly(val: number, step: number) {
        // Set frames for the animation
        const FRAMES = [{
            strokeDashoffset: this.getProgress(this._value),
            strokeOpacity: (this._value / this.STROKE_OPACITY_DVIDER) + this.STROKE_OPACITY_ADDITION
        }, {
            strokeDashoffset: this.getProgress(this.valueInPercent),
            strokeOpacity: (this.valueInPercent / this.STROKE_OPACITY_DVIDER) + this.STROKE_OPACITY_ADDITION
        }];
        this._svgCircle.nativeElement.animate(FRAMES, {
            easing: 'ease-out',
            fill: 'forwards'
        });

        super.updateProgressSmoothly(val, step);
    }

    /**
     * @hidden
     */
    public updateProgressDirectly(val: number) {
        super.updateProgressDirectly(val);

        this.renderer.setStyle(
            this._svgCircle.nativeElement,
            'stroke-dashoffset',
            this.getProgress(this.valueInPercent));

        this.renderer.setStyle(
            this._svgCircle.nativeElement,
            'stroke-opacity',
            (this.valueInPercent / this.STROKE_OPACITY_DVIDER) + this.STROKE_OPACITY_ADDITION);
    }

    private getProgress(percentage: number) {
        return this._circumference - (percentage * this._circumference / 100);
    }
}

export function getValueInProperRange(value: number, max: number, min = 0): number {
    return Math.max(Math.min(value, max), min);
}

export function convertInPercentage(value: number, max: number) {
    return Math.floor(100 * value / max);
}

/**
 * The IgxProgressBarModule provides the {@link IgxLinearProgressBarComponent},
 * {@link IgxCircularProgressBarComponent} inside your application.
 */
@NgModule({
    declarations: [IgxLinearProgressBarComponent, IgxCircularProgressBarComponent],
    exports: [IgxLinearProgressBarComponent, IgxCircularProgressBarComponent],
    imports: [CommonModule]
})
export class IgxProgressBarModule {
}
