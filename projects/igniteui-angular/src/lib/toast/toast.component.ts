import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Optional,
    Output
} from '@angular/core';
import { IgxNavigationService, IToggleView } from '../core/navigation';
import { DeprecateProperty } from '../core/deprecateDecorators';

let NEXT_ID = 0;
/**
 * **Ignite UI for Angular Toast** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/toast.html)
 *
 * The Ignite UI Toast provides information and warning messages that are non-interactive and cannot
 * be dismissed by the user. Toasts can be displayed at the bottom, middle, or top of the page.
 *
 * Example:
 * ```html
 * <button (click)="toast.show()">Show notification</button>
 * <igx-toast #toast
 *           message="Notification displayed"
 *           displayTime="1000">
 * </igx-toast>
 * ```
 */
@Component({
        animations: [
        trigger('animate', [
            state('visible', style({
                opacity: 1
            })),
            transition('invisible => visible', animate('.20s ease')),
            transition('visible => invisible', animate('.40s ease-out'))
        ])
    ],
    selector: 'igx-toast',
    templateUrl: 'toast.component.html',
    styles: [`
        :host {
            display: block;
        }
    `]
})
export class IgxToastComponent implements IToggleView, OnInit, OnDestroy {
    private _isVisible = false;

    /**
     * @hidden
     */
    @HostBinding('@animate')
    public animationState = 'invisible';

    /**
     * Sets/gets the `id` of the toast.
     * If not set, the `id` will have value `"igx-toast-0"`.
     * ```html
     * <igx-toast id = "my-first-toast"></igx-toast>
     * ```
     * ```typescript
     * let toastId = this.toast.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-toast-${NEXT_ID++}`;

    /**
     * Emits an event prior the toast is shown.
     * Provides reference to the `IgxToastComponent` as event argument.
     * ```html
     * <igx-toast (onShowing) = "onShowing($event)"></igx-toast>
     * ```
     * @memberof IgxToastComponent
     */
    @Output()
    public onShowing = new EventEmitter<IgxToastComponent>();

    /**
     * Emits an event when the toast is shown.
     * Provides reference to the `IgxToastComponent` as event argument.
     * ```html
     * <igx-toast (onShown) = "onShown($event)"></igx-toast>
     * ```
     * @memberof IgxToastComponent
     */
    @Output()
    public onShown = new EventEmitter<IgxToastComponent>();

    /**
     * Emits an event prior the toast is hidden.
     * Provides reference to the `IgxToastComponent` as event argument.
     * ```html
     * <igx-toast (onHiding) = "onHiding($event)"></igx-toast>
     * ```
     * @memberof IgxToastComponent
     */
    @Output()
    public onHiding = new EventEmitter<IgxToastComponent>();

    /**
     *  Emits an event when the toast is hidden.
     *  Provides reference to the `IgxToastComponent` as event argument.
     * ```html
     * <igx-toast (onHidden) = "onHidden($event)"></igx-toast>
     * ```
     * @memberof IgxToastComponent
     */
    @Output()
    public onHidden = new EventEmitter<IgxToastComponent>();

    /**
     * Sets/gets the `role` attribute.
     * If not set, `role` will have value `"alert"`.
     * ```html
     * <igx-toast [role] = "'notify'"></igx-toast>
     * ```
     * ```typescript
     * let toastRole = this.toast.role;
     * ```
     * @memberof IgxToastComponent
     */
    @Input()
    public role = 'alert';

    /**
     * Sets/gets whether the toast will be hidden after the `displayTime` is over.
     * Default value is `true`.
     * ```html
     * <igx-toast [autoHide] = "false"></igx-toast>
     * ```
     * ```typescript
     * let autoHide = this.toast.autoHide;
     * ```
     * @memberof IgxToastComponent
     */
    @Input()
    public autoHide = true;

    /**
     * Sets/gets the duration of time span(in milliseconds) which the toast will be visible
     * after it is being shown.
     * Default value is `4000`.
     * ```html
     * <igx-toast [displayTime] = "2500"></igx-toast>
     * ```
     * ```typescript
     * let displayTime = this.toast.displayTime;
     * ```
     * @memberof IgxToastComponent
     */
    @Input()
    public displayTime = 4000;

    /**
     * Enables/Disables the visibility of the toast.
     * If not set, the `isVisible` attribute will have value `false`.
     * ```html
     * <igx-toast [isVisible] = "true"></igx-toast>
     * ```
     * ```typescript
     * let isVisible = this.toast.isVisible;
     * ```
     *
     * Two-way data binding.
     * ```html
     * <igx-toast [(isVisible)] = "model.isVisible"></igx-toast>
     * ```
     * @memberof IgxToastComponent
     */
    @Input()
    public get isVisible() {
        return this._isVisible;
    }
    public set isVisible(value) {
        this._isVisible = value;
        this.isVisibleChange.emit(this._isVisible);
    }

    /**
     * @hidden
     */
    @Output()
    public isVisibleChange = new EventEmitter<boolean>();

    /**
     * @hidden
     */
    @Input()
    public message = '';

    /**
     * Sets/gets the position of the toast.
     * If not set, the `position` attribute will have value `IgxToastPosition.Bottom`.
     * ```html
     * <igx-toast [position] = "top"></igx-toast>
     * ```
     * ```typescript
     * let toastPosition = this.toast.position;
     * ```
     * @memberof IgxToastComponent
     */
    @Input()
    public position: IgxToastPosition = IgxToastPosition.Bottom;

    /**
     * Gets the nativeElement of the toast.
     * ```typescript
     * let nativeElement = this.toast.element;
     * ```
     * @memberof IgxToastComponent
     */
    public get element() {
        return this.elementRef.nativeElement;
    }

    /**
     * @hidden
     */
    private timeoutId: number;

    constructor(
        private elementRef: ElementRef,
        @Optional() private navService: IgxNavigationService) { }

    /**
     * Shows the toast.
     * If `autoHide` is enabled, the toast will hide after `displayTime` is over.
     * ```typescript
     * this.toast.show();
     * ```
     * @memberof IgxToastComponent
     */
    public show(): void {
        clearInterval(this.timeoutId);
        this.onShowing.emit(this);
        this.isVisible = true;
        this.animationState = 'visible';

        if (this.autoHide) {
            this.timeoutId = window.setTimeout(() => {
                this.hide();
            }, this.displayTime);
        }

        this.onShown.emit(this);
    }

    /**
     * Hides the toast.
     * ```typescript
     * this.toast.hide();
     * ```
     * @memberof IgxToastComponent
     */
    public hide(): void {
        this.onHiding.emit(this);
        this.isVisible = false;
        this.onHidden.emit(this);
        this.animationState = 'invisible';

        clearInterval(this.timeoutId);
    }

    /**
     * Wraps @show() method due @IToggleView interface implementation.
     * @hidden
     */
    public open() {
        this.show();
    }

    /**
     * Wraps @hide() method due @IToggleView interface implementation.
     * @hidden
     */
    public close() {
        this.hide();
    }

    /**
     * Toggles the visible state of the toast.
     * ```typescript
     * this.toast.toggle();
     * ```
     * @memberof IgxToastComponent
     */
    public toggle() {
        this.isVisible ? this.close() : this.open();
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-toast--top')
    public get cssClassTop() {
       return this.position === IgxToastPosition.Top;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-toast--middle')
    public get cssClassMiddle() {
       return this.position === IgxToastPosition.Middle;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-toast--bottom')
    public get cssClassBottom() {
       return this.position === IgxToastPosition.Bottom;
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        if (this.navService && this.id) {
            this.navService.add(this.id, this);
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        if (this.navService && this.id) {
            this.navService.remove(this.id);
        }
    }
}

/**
 * Enumeration for toast position
 * Can be:
 * Bottom
 * Middle
 * Top
 */
export enum IgxToastPosition {
    Bottom,
    Middle,
    Top
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxToastComponent],
    exports: [IgxToastComponent],
    imports: [CommonModule]
})
export class IgxToastModule { }
