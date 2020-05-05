import {
    Component,
    Directive,
    HostBinding,
    Input,
    Renderer2,
    ViewContainerRef,
    Optional,
    Inject,
    ContentChildren,
    QueryList,
    ViewChild,
    TemplateRef
} from '@angular/core';
import { DisplayDensityBase, DisplayDensityToken, IDisplayDensityOptions } from '../core/density';
import { IgxDropDownComponent } from '../drop-down';
import { CloseScrollStrategy, OverlaySettings } from '../services';

@Directive({
    selector: '[igxActionStripMenuItem]'
})
export class IgxActionStripMenuItemDirective {
    constructor(
        public templateRef: TemplateRef<any>
    ) { }
}

/**
 * Action Strip provides templatable area for one or more actions.
 *
 * @igxModule IgxActionStripModule
 *
 * @igxTheme igx-action-strip-theme
 *
 * @igxKeywords action, strip, actionStrip, pinning, editing
 *
 * @igxGroup Data Entry & Display
 *
 * @remarks
 * The Ignite UI Action Strip is a container, overlaying its parent container,
 * and displaying action buttons with action applicable to the parent component the strip is instantiated or shown for.
 *
 * @example
 * ```html
 * <igx-action-strip #actionStrip>
 *     <igx-icon (click)="doSomeAction()"></igx-icon>
 * </igx-action-strip>
 */
@Component({
    selector: 'igx-action-strip',
    templateUrl: 'action-strip.component.html'
})

export class IgxActionStripComponent extends DisplayDensityBase {
    constructor(
        private _viewContainer: ViewContainerRef,
        private renderer: Renderer2,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
        super(_displayDensityOptions);
    }

    /**
     * Getter for the 'display' property of the current `IgxActionStrip`
     * @hidden
     * @internal
     */
    @HostBinding('style.display')
    get display(): string {
        return this._hidden ? 'none' : 'flex';
    }

    private _hidden = false;

    /**
     * An @Input property that set the visibility of the Action Strip.
     * Could be used to set if the Action Strip will be initially hidden.
     * @example
     * ```html
     *  <igx-action-strip [hidden]="false">
     * ```
     */
    @Input()
    public set hidden(value) {
        this._hidden = value;
    }

    public get hidden() {
        return this._hidden;
    }

    /**
     * Host `class.igx-action-strip` binding.
     * @hidden
     * @internal
     */
    @Input('class')
    hostClass: string;

    /**
     * Host `attr.class` binding.
     * @hidden
     * @internal
     */
    @HostBinding('attr.class')
    get hostClasses(): string {
        const classes = [this.getComponentDensityClass('igx-action-strip')];
        // The custom classes should be at the end.
        if (!classes.includes('igx-action-strip')) {
            classes.push('igx-action-strip');
        }
        classes.push(this.hostClass);
        return classes.join(' ');
    }

    /**
     * Sets the context of an action strip.
     * The context should be an instance of a @Component, that has element property.
     * This element will be the placeholder of the action strip.
     * @example
     * ```html
     * <igx-action-strip [context]="cell"></igx-action-strip>
     * ```
     */
    @Input()
    public context: any;
    /**
     * Menu Items ContentChildren inside the Action Strip
     * @hidden
     * @internal
     */
    @ContentChildren(IgxActionStripMenuItemDirective)
    public menuItems: QueryList<IgxActionStripMenuItemDirective>;

    /**
     * Reference to the menu
     * @hidden
     * @internal
     */
    @ViewChild('dropdown')
    private menu: IgxDropDownComponent;

    /**
     * Showing the Action Strip and appending it the specified context element.
     * @param context
     * @example
     * ```typescript
     * this.actionStrip.show(row);
     * ```
     */
    public show(context?: any): void {
        this.hidden = false;
        if (!context) {
            return;
        }
        // when shown for different context make sure the menu won't stay opened
        if (this.context !== context) {
            this.closeMenu();
        }
        this.context = context;
        if (this.context && this.context.element) {
            this.renderer.appendChild(context.element.nativeElement, this._viewContainer.element.nativeElement);
        }
    }

    /**
     * Hiding the Action Strip and removing it from its current context element.
     * @example
     * ```typescript
     * this.actionStrip.hide();
     * ```
     */
    public hide(): void {
        this.hidden = true;
        this.closeMenu();
        if (this.context && this.context.element) {
            this.renderer.removeChild(this.context.element.nativeElement, this._viewContainer.element.nativeElement);
        }
    }

    /**
     * Getter for menu overlay settings
     * @hidden
     * @internal
     */
    get menuOverlaySettings (): OverlaySettings {
        return { scrollStrategy: new CloseScrollStrategy() };
    }

    /**
     * Close the menu if opened
     * @hidden
     * @internal
     */
    private closeMenu(): void {
        if (this.menu && !this.menu.collapsed) {
            this.menu.close();
        }
    }
}

