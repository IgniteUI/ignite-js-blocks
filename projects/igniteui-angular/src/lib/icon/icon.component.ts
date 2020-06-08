import { Component, ElementRef, HostBinding, Input, OnInit, TemplateRef, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { IgxIconService } from './icon.service';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

/**
 * Icon provides a way to include material icons to markup
 *
 * @igxModule IgxIconModule
 *
 * @igxTheme igx-icon-theme
 *
 * @igxKeywords icon, picture
 *
 * @igxGroup Display
 *
 * @remarks
 *
 * The Ignite UI Icon makes it easy for developers to include material design icons directly in their markup. The icons
 * support custom colors and can be marked as active or disabled using the `isActive` property. This will change the appearance
 * of the icon.
 *
 * @example
 * ```html
 * <igx-icon color="#00ff00" isActive="true">home</igx-icon>
 * ```
 */
let NEXT_ID = 0;

@Component({
    selector: 'igx-icon',
    templateUrl: 'icon.component.html'
})
export class IgxIconComponent implements OnInit, OnDestroy {
    @ViewChild('noLigature', { read: TemplateRef, static: true })
    private noLigature: TemplateRef<HTMLElement>;

    @ViewChild('explicitLigature', { read: TemplateRef, static: true })
    private explicitLigature: TemplateRef<HTMLElement>;

    @ViewChild('svgImage', { read: TemplateRef, static: true })
    private svgImage: TemplateRef<HTMLElement>;

    private destroy$ = new Subject<void>();

    /**
     *  This allows you to change the value of `class.igx-icon`. By default it's `igx-icon`.
     *
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-icon')
    public cssClass = 'igx-icon';

    /**
     *  This allows you to disable the `aria-hidden` attribute. By default it's applied.
     * @example
     * ```typescript
     * @ViewChild("MyIcon") public icon: IgxIconComponent;
     * constructor(private cdRef:ChangeDetectorRef) {}
     * ngAfterViewInit() {
     *     this.icon.ariaHidden = false;
     *     this.cdRef.detectChanges();
     * }
     * ```
     */
    @HostBinding('attr.aria-hidden')
    public ariaHidden = true;

    /**
     * An @Input property that sets the value of the `id` attribute.
     * @example
     * ```html
     * <igx-icon id="igx-icon-1" fontSet="material">settings</igx-icon>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-icon-${NEXT_ID++}`;

    /**
     * An @Input property that sets the value of the `fontSet`. By default it's "material".
     * @example
     * ```html
     * <igx-icon fontSet="material">settings</igx-icon>
     * ```
     */
    @Input('fontSet')
    public font: string;

    /**
     * An @Input property that allows you to disable the `active` property. By default it's applied.
     * @example
     * ```html
     * <igx-icon [isActive]="false">settings</igx-icon>
     * ```
     */
    @Input('isActive')
    public active = true;

    /**
     * An @Input property that allows you to change the `iconColor` of the icon.
     * @example
     * ```html
     * <igx-icon color="blue">settings</igx-icon>
     * ```
     */
    @Input('color')
    public iconColor: string;

    /**
     *  An @Input property that allows you to set the `iconName` of the icon.
     *  @example
     * ```html
     * <igx-icon name="contains" fontSet="filter-icons"></igx-icon>
     * ```
     */
    @Input('name')
    public iconName: string;

    /**
     * An ElementRef property of the `igx-icon` component.
     */
    public el: ElementRef;

    constructor(
            private _el: ElementRef,
            private iconService: IgxIconService,
            private ref: ChangeDetectorRef) {
        this.el = _el;
        this.font = this.iconService.defaultFontSet;
        this.iconService.registerFontSetAlias('material', 'material-icons');
        this.iconService.iconLoaded.pipe(
            first(e => e.name === this.iconName && e.fontSet === this.font),
            takeUntil(this.destroy$)
        )
        .subscribe(_ => this.ref.detectChanges());
    }

    /**
     * @hidden
     * @internal
     */
    ngOnInit() {
        this.updateIconClass();
    }

    /**
     * @hidden
     * @internal
     */
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     *  An accessor that returns the value of the font property.
     * @example
     * ```typescript
     *  @ViewChild("MyIcon")
     * public icon: IgxIconComponent;
     * ngAfterViewInit() {
     *    let iconFont = this.icon.getFontSet;
     * }
     * ```
     */
    get getFontSet(): string {
        return this.font;
    }

    /**
     *  An accessor that returns the value of the active property.
     * @example
     * ```typescript
     * @ViewChild("MyIcon")
     * public icon: IgxIconComponent;
     * ngAfterViewInit() {
     *    let iconActive = this.icon.getActive;
     * }
     * ```
     */
    get getActive(): boolean {
        return this.active;
    }

    /**
     *  An accessor that returns inactive property.
     * @example
     * ```typescript
     * @ViewChild("MyIcon")
     * public icon: IgxIconComponent;
     * ngAfterViewInit() {
     *    let iconActive = this.icon.getInactive;
     * }
     * ```
     */
    @HostBinding('class.igx-icon--inactive')
    get getInactive(): boolean {
        return !this.active;
    }

    /**
     * An accessor that returns the opposite value of the `iconColor` property.
     * @example
     * ```typescript
     * @ViewChild("MyIcon")
     * public icon: IgxIconComponent;
     * ngAfterViewInit() {
     *    let iconColor = this.icon.getIconColor;
     * }
     * ```
     */
    @HostBinding('style.color')
    get getIconColor(): string {
        return this.iconColor;
    }

    /**
     * An accessor that returns the value of the iconName property.
     * @example
     * ```typescript
     * @ViewChild("MyIcon")
     * public icon: IgxIconComponent;
     * ngAfterViewInit() {
     *    let iconName = this.icon.getIconName;
     * }
     * ```
     */
    get getIconName(): string {
        return this.iconName;
    }

    /**
     *  An accessor that returns the key of the SVG image.
     *  The key consists of the fontSet and the iconName separated by underscore.
     * @example
     * ```typescript
     * @ViewChild("MyIcon")
     * public icon: IgxIconComponent;
     * ngAfterViewInit() {
     *    let svgKey = this.icon.getSvgKey;
     * }
     * ```
     */
    get getSvgKey(): string {
        if (this.iconService.isSvgIconCached(this.iconName, this.font)) {
            return '#' + this.iconService.getSvgIconKey(this.iconName, this.font);
        }

        return null;
    }

    /**
     *   An accessor that returns a TemplateRef to explicit, svg or no ligature.
     * @example
     * ```typescript
     * @ViewChild("MyIcon")
     * public icon: IgxIconComponent;
     * ngAfterViewInit() {
     *    let iconTemplate = this.icon.template;
     * }
     * ```
     */
    get template(): TemplateRef<HTMLElement> {
        if (this.iconName) {
            if (this.iconService.isSvgIconCached(this.iconName, this.font)) {
                return this.svgImage;
            }

            return this.noLigature;
        }

        return this.explicitLigature;
    }

    /**
     * @hidden
     * @internal
     */
    private updateIconClass() {
        const className = this.iconService.fontSetClassName(this.font);
        this.el.nativeElement.classList.add(className);

        if (this.iconName && !this.iconService.isSvgIconCached(this.iconName, this.font)) {
            this.el.nativeElement.classList.add(this.iconName);
        }
    }
}
