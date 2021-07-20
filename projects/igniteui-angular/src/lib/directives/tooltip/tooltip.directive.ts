import {
    Directive, ElementRef, HostListener, Input, NgModule, ChangeDetectorRef, OnInit,
    Output, EventEmitter, Optional, HostBinding, Inject, OnDestroy
} from '@angular/core';
import { useAnimation } from '@angular/animations';
import { scaleInCenter } from '../../animations/scale/index';
import { fadeOut } from '../../animations/fade/index';
import { IgxOverlayService } from '../../services/overlay/overlay';
import { HorizontalAlignment, AutoPositionStrategy, PositionSettings, OverlaySettings } from '../../services/public_api';
import { CommonModule } from '@angular/common';
import { IgxNavigationService } from '../../core/navigation';
import { IgxToggleDirective, IgxToggleActionDirective } from '../toggle/toggle.directive';
import { IBaseEventArgs } from '../../core/utils';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface ITooltipShowEventArgs extends IBaseEventArgs {
    target: IgxTooltipTargetDirective;
    tooltip: IgxTooltipDirective;
    cancel: boolean;
}
export interface ITooltipHideEventArgs extends IBaseEventArgs {
    target: IgxTooltipTargetDirective;
    tooltip: IgxTooltipDirective;
    cancel: boolean;
}

/**
 * **Ignite UI for Angular Tooltip Target** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tooltip)
 *
 * The Ignite UI for Angular Tooltip Target directive is used to mark an HTML element in the markup as one that has a tooltip.
 * The tooltip target is used in combination with the Ignite UI for Angular Tooltip by assigning the exported tooltip reference to the
 * target's selector property.
 *
 * Example:
 * ```html
 * <button [igxTooltipTarget]="tooltipRef">Hover me</button>
 * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
 * ```
 */
@Directive({
    exportAs: 'tooltipTarget',
    selector: '[igxTooltipTarget]'
})
export class IgxTooltipTargetDirective extends IgxToggleActionDirective implements OnInit, OnDestroy {
    /**
     * Gets/sets the amount of milliseconds that should pass before showing the tooltip.
     *
     * ```typescript
     * // get
     * let tooltipShowDelay = this.tooltipTarget.showDelay;
     * ```
     *
     * ```html
     * <!--set-->
     * <button [igxTooltipTarget]="tooltipRef" showDelay="1500">Hover me</button>
     * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
     * ```
     */
    @Input('showDelay')
    public showDelay = 500;

    /**
     * Gets/sets the amount of milliseconds that should pass before hiding the tooltip.
     *
     * ```typescript
     * // get
     * let tooltipHideDelay = this.tooltipTarget.hideDelay;
     * ```
     *
     * ```html
     * <!--set-->
     * <button [igxTooltipTarget]="tooltipRef" hideDelay="1500">Hover me</button>
     * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
     * ```
     */
    @Input('hideDelay')
    public hideDelay = 500;

    /**
     * Specifies if the tooltip should not show when hovering its target with the mouse. (defaults to false)
     * While setting this property to 'true' will disable the user interactions that shows/hides the tooltip,
     * the developer will still be able to show/hide the tooltip through the API.
     *
     * ```typescript
     * // get
     * let tooltipDisabledValue = this.tooltipTarget.tooltipDisabled;
     * ```
     *
     * ```html
     * <!--set-->
     * <button [igxTooltipTarget]="tooltipRef" [tooltipDisabled]="true">Hover me</button>
     * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
     * ```
     */
    @Input('tooltipDisabled')
    public tooltipDisabled = false;

    /**
     * @hidden
     */
    @Input('igxTooltipTarget')
    public set target(target: any) {
        if (target !== null && target !== '') {
            this._target = target;
        }
    }

    /**
     * @hidden
     */
    public get target(): any {
        if (typeof this._target === 'string') {
            return this._navigationService.get(this._target);
        }
        return this._target;
    }

    /**
     * Gets the respective native element of the directive.
     *
     * ```typescript
     * let tooltipTargetElement = this.tooltipTarget.nativeElement;
     * ```
     */
    public get nativeElement() {
        return this._element.nativeElement;
    }

    /**
     * Indicates if the tooltip that is is associated with this target is currently hidden.
     *
     * ```typescript
     * let tooltipHiddenValue = this.tooltipTarget.tooltipHidden;
     * ```
     */
    public get tooltipHidden(): boolean {
        return !this.target || this.target.collapsed;
    }

    /**
     * Emits an event when the tooltip that is associated with this target starts showing.
     * This event is fired before the start of the countdown to showing the tooltip.
     *
     * ```typescript
     * tooltipShowing(args: ITooltipShowEventArgs) {
     *    alert("Tooltip started showing!");
     * }
     * ```
     *
     * ```html
     * <button [igxTooltipTarget]="tooltipRef"
     *         (tooltipShow)='tooltipShowing($event)'>Hover me</button>
     * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
     * ```
     */
    @Output()
    public tooltipShow = new EventEmitter<ITooltipShowEventArgs>();

    /**
     * Emits an event when the tooltip that is associated with this target starts hiding.
     * This event is fired before the start of the countdown to hiding the tooltip.
     *
     * ```typescript
     * tooltipHiding(args: ITooltipHideEventArgs) {
     *    alert("Tooltip started hiding!");
     * }
     * ```
     *
     * ```html
     * <button [igxTooltipTarget]="tooltipRef"
     *         (tooltipHide)='tooltipHiding($event)'>Hover me</button>
     * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
     * ```
     */
    @Output()
    public tooltipHide = new EventEmitter<ITooltipHideEventArgs>();

    private destroy$ = new Subject();

    constructor(private _element: ElementRef,
        @Optional() private _navigationService: IgxNavigationService) {
        super(_element, _navigationService);
    }

    /**
     * @hidden
     */
    @HostListener('click')
    public onClick() {
        if (!this.target.collapsed) {
            this.target.forceClose(this.mergedOverlaySettings);
        }
    }

    /**
     * @hidden
     */
    @HostListener('mouseenter')
    public onMouseEnter() {
        if (this.tooltipDisabled) {
            return;
        }

        this.checkOutletAndOutsideClick();
        const shouldReturn = this.preMouseEnterCheck();
        if (shouldReturn) {
            return;
        }

        const showingArgs = { target: this, tooltip: this.target, cancel: false };
        this.tooltipShow.emit(showingArgs);

        if (showingArgs.cancel) {
            return;
        }

        this.target.toBeShown = true;
        this.target.timeoutId = setTimeout(() => {
            this.target.open(this.mergedOverlaySettings); // Call open() of IgxTooltipDirective
            this.target.toBeShown = false;
        }, this.showDelay);
    }

    /**
     * @hidden
     */
    @HostListener('mouseleave')
    public onMouseLeave() {
        if (this.tooltipDisabled) {
            return;
        }

        this.checkOutletAndOutsideClick();
        const shouldReturn = this.preMouseLeaveCheck();
        if (shouldReturn || this.target.collapsed) {
            return;
        }

        this.target.toBeHidden = true;
        this.target.timeoutId = setTimeout(() => {
            this.target.close(); // Call close() of IgxTooltipDirective
            this.target.toBeHidden = false;
        }, this.hideDelay);


    }

    /**
     * @hidden
     */
    @HostListener('touchstart')
    public onTouchStart() {
        if (this.tooltipDisabled) {
            return;
        }

        this.showTooltip();
    }

    /**
     * @hidden
     */
    @HostListener('document:touchstart', ['$event'])
    public onDocumentTouchStart(event) {
        if (this.tooltipDisabled) {
            return;
        }

        if (this.nativeElement !== event.target &&
            !this.nativeElement.contains(event.target)
        ) {
            this.hideTooltip();
        }
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        super.ngOnInit();

        const positionSettings: PositionSettings = {
            horizontalDirection: HorizontalAlignment.Center,
            horizontalStartPoint: HorizontalAlignment.Center,
            openAnimation: useAnimation(scaleInCenter, { params: { duration: '150ms' } }),
            closeAnimation: useAnimation(fadeOut, { params: { duration: '75ms' } })
        };

        this._overlayDefaults.positionStrategy = new AutoPositionStrategy(positionSettings);
        this._overlayDefaults.closeOnOutsideClick = false;
        this._overlayDefaults.closeOnEscape = true;

        this.target.closing.pipe(takeUntil(this.destroy$)).subscribe((event) => {
            const hidingArgs = { target: this, tooltip: this.target, cancel: false };
            this.tooltipHide.emit(hidingArgs);

            if (hidingArgs.cancel) {
                event.cancel = true;
            }
        });
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Shows the tooltip by respecting the 'showDelay' property.
     *
     * ```typescript
     * this.tooltipTarget.showTooltip();
     * ```
     */
    public showTooltip() {
        clearTimeout(this.target.timeoutId);

        if (!this.target.collapsed) {
            //  if close animation has started finish it, or close the tooltip with no animation
            this.target.forceClose(this.mergedOverlaySettings);
            this.target.toBeHidden = false;
        }

        const showingArgs = { target: this, tooltip: this.target, cancel: false };
        this.tooltipShow.emit(showingArgs);

        if (showingArgs.cancel) {
            return;
        }

        this.target.toBeShown = true;
        this.target.timeoutId = setTimeout(() => {
            this.target.open(this.mergedOverlaySettings); // Call open() of IgxTooltipDirective
            this.target.toBeShown = false;
        }, this.showDelay);
    }

    /**
     * Hides the tooltip by respecting the 'hideDelay' property.
     *
     * ```typescript
     * this.tooltipTarget.hideTooltip();
     * ```
     */
    public hideTooltip() {
        if (this.target.collapsed && this.target.toBeShown) {
            clearTimeout(this.target.timeoutId);
        }

        if (this.target.collapsed || this.target.toBeHidden) {
            return;
        }

        this.target.toBeHidden = true;
        this.target.timeoutId = setTimeout(() => {
            this.target.close(); // Call close() of IgxTooltipDirective
            this.target.toBeHidden = false;
        }, this.hideDelay);
    }

    private checkOutletAndOutsideClick() {
        if (this.outlet) {
            this._overlayDefaults.outlet = this.outlet;
        }
    }

    private get mergedOverlaySettings() {
        return Object.assign({}, this._overlayDefaults, this.overlaySettings);
    }

    // Return true if the execution in onMouseEnter should be terminated after this method
    private preMouseEnterCheck() {
        // If tooltip is about to be opened
        if (this.target.toBeShown) {
            clearTimeout(this.target.timeoutId);
            this.target.toBeShown = false;
        }

        // If Tooltip is opened or about to be hidden
        if (!this.target.collapsed || this.target.toBeHidden) {
            clearTimeout(this.target.timeoutId);

            //  if close animation has started finish it, or close the tooltip with no animation
            this.target.forceClose(this.mergedOverlaySettings);
            this.target.toBeHidden = false;
        }

        return false;
    }

    // Return true if the execution in onMouseLeave should be terminated after this method
    private preMouseLeaveCheck(): boolean {
        clearTimeout(this.target.timeoutId);

        // If tooltip is about to be opened
        if (this.target.toBeShown) {
            this.target.toBeShown = false;
            this.target.toBeHidden = false;
            return true;
        }

        return false;
    }
}

let NEXT_ID = 0;
/**
 * **Ignite UI for Angular Tooltip** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tooltip)
 *
 * The Ignite UI for Angular Tooltip directive is used to mark an HTML element in the markup as one that should behave as a tooltip.
 * The tooltip is used in combination with the Ignite UI for Angular Tooltip Target by assigning the exported tooltip reference to the
 * respective target's selector property.
 *
 * Example:
 * ```html
 * <button [igxTooltipTarget]="tooltipRef">Hover me</button>
 * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
 * ```
 */
@Directive({
    exportAs: 'tooltip',
    selector: '[igxTooltip]'
})
export class IgxTooltipDirective extends IgxToggleDirective {
    /**
     * @hidden
     */
    @HostBinding('class.igx-tooltip--hidden')
    public get hiddenClass() {
        return this.collapsed;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-tooltip--desktop')
    public get defaultClass() {
        return !this.collapsed;
    }

    /**
     * Gets/sets any tooltip related data.
     * The 'context' can be used for storing any information that is necessary
     * to access when working with the tooltip.
     *
     * ```typescript
     * // get
     * let tooltipContext = this.tooltip.context;
     * ```
     *
     * ```typescript
     * // set
     * this.tooltip.context = "Tooltip's context";
     * ```
     */
    @Input('context')
    public context;

    /**
     * Identifier for the tooltip.
     * If this is property is not explicitly set, it will be automatically generated.
     *
     * ```typescript
     * let tooltipId = this.tooltip.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-tooltip-${NEXT_ID++}`;

    /**
     * Get the role attribute of the tooltip.
     *
     * ```typescript
     * let tooltipRole = this.tooltip.role;
     * ```
     */
    @HostBinding('attr.role')
    public get role() {
        return 'tooltip';
    }

    /**
     * @hidden
     */
    public timeoutId;

    /**
     * @hidden
     * Returns whether close time out has started
     */
    public toBeHidden = false;

    /**
     * @hidden
     * Returns whether open time out has started
     */
    public toBeShown = false;

    /** @hidden */
    constructor(
        elementRef: ElementRef,
        cdr: ChangeDetectorRef,
        @Inject(IgxOverlayService) overlayService: IgxOverlayService,
        @Optional() navigationService: IgxNavigationService) {
        // D.P. constructor duplication due to es6 compilation, might be obsolete in the future
        super(elementRef, cdr, overlayService, navigationService);
    }

    /**
     * If there is open animation in progress this method will finish is.
     * If there is no open animation in progress this method will open the toggle with no animation.
     *
     * @param overlaySettings setting to use for opening the toggle
     */
    protected forceOpen(overlaySettings?: OverlaySettings) {
        const info = this.overlayService.getOverlayById(this._overlayId);
        const hasOpenAnimation = info ? info.openAnimationPlayer : false;
        if (hasOpenAnimation) {
            info.openAnimationPlayer.finish();
            info.openAnimationPlayer.reset();
            info.openAnimationPlayer = null;
        } else if (this.collapsed) {
            const animation = overlaySettings.positionStrategy.settings.openAnimation;
            overlaySettings.positionStrategy.settings.openAnimation = null;
            this.open(overlaySettings);
            overlaySettings.positionStrategy.settings.openAnimation = animation;
        }
    }

    /**
     * If there is close animation in progress this method will finish is.
     * If there is no close animation in progress this method will close the toggle with no animation.
     *
     * @param overlaySettings settings to use for closing the toggle
     */
    protected forceClose(overlaySettings?: OverlaySettings) {
        const info = this.overlayService.getOverlayById(this._overlayId);
        const hasCloseAnimation = info ? info.closeAnimationPlayer : false;

        if (hasCloseAnimation) {
            info.closeAnimationPlayer.finish();
            info.closeAnimationPlayer.reset();
            info.closeAnimationPlayer = null;
        } else if (!this.collapsed) {
            const animation = overlaySettings.positionStrategy.settings.closeAnimation;
            overlaySettings.positionStrategy.settings.closeAnimation = null;
            this.close();
            overlaySettings.positionStrategy.settings.closeAnimation = animation;
        }
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxTooltipDirective, IgxTooltipTargetDirective],
    exports: [IgxTooltipDirective, IgxTooltipTargetDirective],
    imports: [CommonModule],
    providers: [IgxOverlayService]
})
export class IgxTooltipModule { }

