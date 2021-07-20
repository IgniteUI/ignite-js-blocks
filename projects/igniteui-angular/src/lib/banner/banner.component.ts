import { Component, NgModule, EventEmitter, Output, Input, ViewChild, ElementRef,
    ContentChild, HostBinding } from '@angular/core';
import { IgxExpansionPanelModule } from '../expansion-panel/expansion-panel.module';
import { IgxExpansionPanelComponent } from '../expansion-panel/public_api';
import { IgxIconModule, IgxIconComponent } from '../icon/public_api';
import { IToggleView } from '../core/navigation';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxBannerActionsDirective } from './banner.directives';
import { CommonModule } from '@angular/common';
import { CancelableEventArgs, IBaseEventArgs } from '../core/utils';
import { ToggleAnimationSettings } from '../expansion-panel/toggle-animation-component';

export interface BannerEventArgs extends IBaseEventArgs {
    /**
     * @deprecated
     * To get a reference to the banner, use `owner` instead.
     */
    banner: IgxBannerComponent;
    event?: Event;
}

export interface BannerCancelEventArgs extends BannerEventArgs, CancelableEventArgs {
}
/**
 * **Ignite UI for Angular Banner** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/banner.html)
 *
 * The Ignite UI Banner provides a highly template-able and easy to use banner that can be shown in your application.
 *
 * Usage:
 *
 * ```html
 * <igx-banner #banner>
 *   Our privacy settings have changed.
 *  <igx-banner-actions>
 *      <button igxButton="raised">Read More</button>
 *      <button igxButton="raised">Accept and Continue</button>
 *  </igx-banner-actions>
 * </igx-banner>
 * ```
 */
@Component({
    selector: 'igx-banner',
    templateUrl: 'banner.component.html'
})
export class IgxBannerComponent implements IToggleView {
    /**
     * @hidden
     */
    @ContentChild(IgxIconComponent)
    public bannerIcon: IgxIconComponent;

    /**
     * Fires after the banner shows up
     * ```typescript
     * public handleOpened(event) {
     *  ...
     * }
     * ```
     * ```html
     * <igx-banner (opened)="handleOpened($event)"></igx-banner>
     * ```
     */
    @Output()
    public opened = new EventEmitter<BannerEventArgs>();

    /**
     * Fires before the banner shows up
     * ```typescript
     * public handleOpening(event) {
     *  ...
     * }
     * ```
     * ```html
     * <igx-banner (opening)="handleOpening($event)"></igx-banner>
     * ```
     */
    @Output()
    public opening = new EventEmitter<BannerCancelEventArgs>();

    /**
     * Fires after the banner hides
     * ```typescript
     * public handleClosed(event) {
     *  ...
     * }
     * ```
     * ```html
     * <igx-banner (closed)="handleClosed($event)"></igx-banner>
     * ```
     */
    @Output()
    public closed = new EventEmitter<BannerEventArgs>();

    /**
     * Fires before the banner hides
     * ```typescript
     * public handleClosing(event) {
     *  ...
     * }
     * ```
     * ```html
     * <igx-banner (closing)="handleClosing($event)"></igx-banner>
     * ```
     */
    @Output()
    public closing = new EventEmitter<BannerCancelEventArgs>();

    /** @hidden */
    public get useDefaultTemplate(): boolean {
        return !this._bannerActionTemplate;
    }

    /**
     * Get the animation settings used by the banner open/close methods
     * ```typescript
     * let currentAnimations: ToggleAnimationSettings = banner.animationSettings
     * ```
     */
    @Input()
    public get animationSettings(): ToggleAnimationSettings {
        return this._animationSettings ? this._animationSettings : this._expansionPanel.animationSettings;
    }

    /**
     * Set the animation settings used by the banner open/close methods
     * ```typescript
     * import { slideInLeft, slideOutRight } from 'igniteui-angular';
     * ...
     * banner.animationSettings: ToggleAnimationSettings = { openAnimation: slideInLeft, closeAnimation: slideOutRight };
     * ```
     */
    public set animationSettings(settings: ToggleAnimationSettings) {
        this._animationSettings = settings;
    }
    /**
     * Gets whether banner is collapsed
     *
     * ```typescript
     * const isCollapsed: boolean = banner.collapsed;
     * ```
     */
    public get collapsed() {
        return this._expansionPanel.collapsed;
    }

    /**
     * Returns the native element of the banner component
     * ```typescript
     *  const myBannerElement: HTMLElement = banner.element;
     * ```
     */
    public get element() {
        return this.elementRef.nativeElement;
    }

    /**
     * @hidden
     */
    @HostBinding('style.display')
    public get displayStyle(): string {
        return this.collapsed ? '' : 'block';
    }

    @ViewChild('expansionPanel', { static: true })
    private _expansionPanel: IgxExpansionPanelComponent;

    @ContentChild(IgxBannerActionsDirective)
    private _bannerActionTemplate: IgxBannerActionsDirective;

    private _bannerEvent: BannerEventArgs;
    private _animationSettings: ToggleAnimationSettings;

    constructor(public elementRef: ElementRef) { }

    /**
     * Opens the banner
     *
     * ```typescript
     *  myBanner.open();
     * ```
     *
     * ```html
     * <igx-banner #banner>
     * ...
     * </igx-banner>
     * <button (click)="banner.open()">Open Banner</button>
     * ```
     */
    public open(event?: Event) {
        this._bannerEvent = { banner: this, owner: this, event};
        const openingArgs: BannerCancelEventArgs = {
            banner: this,
            owner: this,
            event,
            cancel: false
        };
        this.opening.emit(openingArgs);
        if (openingArgs.cancel) {
            return;
        }
        this._expansionPanel.open(event);
    }

    /**
     * Closes the banner
     *
     * ```typescript
     *  myBanner.close();
     * ```
     *
     * ```html
     * <igx-banner #banner>
     * ...
     * </igx-banner>
     * <button (click)="banner.close()">Close Banner</button>
     * ```
     */
    public close(event?: Event) {
        this._bannerEvent = { banner: this, owner: this, event};
        const closingArgs: BannerCancelEventArgs = {
            banner: this,
            owner: this,
            event,
            cancel: false
        };
        this.closing.emit(closingArgs);
        if (closingArgs.cancel) {
            return;
        }
        this._expansionPanel.close(event);
    }

    /**
     * Toggles the banner
     *
     * ```typescript
     *  myBanner.toggle();
     * ```
     *
     * ```html
     * <igx-banner #banner>
     * ...
     * </igx-banner>
     * <button (click)="banner.toggle()">Toggle Banner</button>
     * ```
     */
    public toggle(event?: Event) {
        if (this.collapsed) {
            this.open(event);
        } else {
            this.close(event);
        }
    }

    /** @hidden */
    public onExpansionPanelOpen() {
        this.opened.emit(this._bannerEvent);
    }

    /** @hidden */
    public onExpansionPanelClose() {
        this.closed.emit(this._bannerEvent);
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxBannerComponent, IgxBannerActionsDirective],
    exports: [IgxBannerComponent, IgxBannerActionsDirective],
    imports: [CommonModule, IgxExpansionPanelModule, IgxIconModule, IgxButtonModule, IgxRippleModule]
})
export class IgxBannerModule { }
