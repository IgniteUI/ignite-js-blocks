import {
    Component,
    ContentChild,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    TemplateRef,
    ViewChild,
    NgZone,
    AfterViewInit,
    OnDestroy
} from '@angular/core';
import { KEYS } from '../core/utils';
import { IgxTabsGroupComponent } from './tabs-group.component';
import { IgxTabItemBase, IgxTabsBase } from './tabs.common';
import { IgxTabItemTemplateDirective } from './tabs.directives';
import ResizeObserver from 'resize-observer-polyfill';

@Component({
    selector: 'igx-tab-item',
    templateUrl: 'tab-item.component.html'
})

export class IgxTabItemComponent extends IgxTabItemBase implements AfterViewInit, OnDestroy {
    /**
     * @hidden @internal
     * Set to true when the tab item is automatically generated from the IgxTabsComponent when tab groups are defined.
     */
    @Input()
    public autoGenerated: boolean;

    /**
     * Gets the group associated with the tab.
     * ```html
     * const relatedGroup = this.tabbar.tabs.toArray()[1].relatedGroup;
     * ```
     */
    @Input()
    public relatedGroup: IgxTabsGroupComponent;

    /**
     * @hidden @internal
     */
    @HostBinding('attr.role')
    public role = 'tab';

    /**
     * @hidden @internal
     */
    @HostBinding('attr.tabindex')
    public tabindex = -1;

    /**
     * @hidden @internal
     */
    @HostBinding('attr.aria-label')
    public ariaLabel = this.label;

    /**
     * @hidden @internal
     */
    @HostBinding('attr.aria-disabled')
    public ariaDisabled = this.disabled;

    /**
     * @hidden @internal
     */
    @HostBinding('attr.aria-selected')
    public ariaSelected = this.isSelected;

    /** @hidden */
    @ViewChild('defaultTabTemplate', { read: TemplateRef, static: true })
    protected defaultTabTemplate: TemplateRef<any>;

    /** @hidden */
    @ContentChild(IgxTabItemTemplateDirective, { read: IgxTabItemTemplateDirective })
    protected customTabTemplateDir: IgxTabItemTemplateDirective;

    /** @hidden */
    private _icon: string;

    /**
     * An @Input property that sets the value of the `icon`.
     * The value should be valid icon name from {@link https://material.io/tools/icons/?style=baseline}.
     * ```html
     * <igx-tab-item label="Tab 1" icon="home">
     * ```
     */
    @Input()
    public get icon(): string {
        return this.relatedGroup ? this.relatedGroup.icon : this._icon;
    }
    public set icon(newValue: string) {
        if (this.relatedGroup) {
            this.relatedGroup.icon = newValue;
        }
        this._icon = newValue;
    }

    /**
     * An @Input property that sets the value of the `label`.
     * ```html
     * <igx-tabs-item label="Tab 2" icon="folder">
     * ```
     */
    @Input()
    public get label(): string {
        return this.relatedGroup ? this.relatedGroup.label : this._label;
    }
    public set label(newValue: string) {
        if (this.relatedGroup) {
            this.relatedGroup.label = newValue;
        }
        this._label = newValue;
    }

    /** @hidden */
    private _label: string;
    private _nativeTabItem: ElementRef;
    private _changesCount = 0; // changes and updates accordingly applied to the tab.
    private _isSelected = false;
    private _disabled = false;
    private _resizeObserver: ResizeObserver;

    constructor(private _tabs: IgxTabsBase, private _element: ElementRef, private _ngZone: NgZone) {
        super();
        this._nativeTabItem = _element;
    }

    @HostBinding('class.igx-tabs__header-menu-item--selected')
    public get provideCssClassSelected(): boolean {
        return this.isSelected;
    }

    @HostBinding('class.igx-tabs__header-menu-item--disabled')
    public get provideCssClassDisabled(): boolean {
        return this.disabled;
    }

    @HostBinding('class.igx-tabs__header-menu-item')
    public get provideCssClass(): boolean {
        return (!this.disabled && !this.isSelected);
    }

    /**
     * @hidden
     */
    @HostListener('click')
    public onClick() {
        if (this.autoGenerated) {
            this.select();
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown', ['$event'])
    public onKeydown(event: KeyboardEvent) {
        const tabsArray = this._tabs.tabs.toArray();
        const startIndex = tabsArray.indexOf(this);
        let finalIndex = -1;
        let currentIndex = startIndex;

        switch (event.key) {
            case KEYS.RIGHT_ARROW:
            case KEYS.RIGHT_ARROW_IE:
                do {
                    currentIndex++;
                    if (currentIndex === tabsArray.length) {
                        currentIndex = -1;
                        continue;
                    } else if ((tabsArray[currentIndex] as IgxTabItemComponent).disabled === false) {
                        finalIndex = currentIndex;
                        break;
                    }
                }
                while (currentIndex !== startIndex);
                break;
            case KEYS.LEFT_ARROW:
            case KEYS.LEFT_ARROW_IE:
                do {
                    currentIndex--;
                    if (currentIndex === -1) {
                        currentIndex = tabsArray.length;
                        continue;
                    } else if ((tabsArray[currentIndex] as IgxTabItemComponent).disabled === false) {
                        finalIndex = currentIndex;
                        break;
                    }
                }
                while (currentIndex !== startIndex);
                break;
            case KEYS.HOME:
                event.preventDefault();
                finalIndex = tabsArray.find(t => (t as IgxTabItemComponent).disabled === false).index;
                break;
            case KEYS.END:
                event.preventDefault();
                finalIndex = tabsArray.slice().reverse().find(t => (t as IgxTabItemComponent).disabled === false).index;
                break;
            case KEYS.ENTER:
                if (!this.autoGenerated) {
                    this.nativeTabItem.nativeElement.click();
                }
                break;
            case KEYS.SPACE:
            case KEYS.SPACE_IE:
                event.preventDefault();
                if (!this.autoGenerated) {
                    this.nativeTabItem.nativeElement.click();
                }
                break;
            default:
                break;
        }

        if (finalIndex > -1) {
            const tab = tabsArray[finalIndex];
            tab.nativeTabItem.nativeElement.focus();

            if (this.autoGenerated) {
                tab.select();
            }
        }
    }

    public ngAfterViewInit(): void {
        this._ngZone.runOutsideAngular(() => {
            this._resizeObserver = new ResizeObserver(() => {
                this._tabs.transformIndicatorAnimation(this._nativeTabItem.nativeElement, 0);
            });
        });
    }

    public ngOnDestroy(): void {
        this._ngZone.runOutsideAngular(() => {
            this._resizeObserver.disconnect();
        });
    }

    /**
     * @hidden
     */
    public get changesCount(): number {
        return this._changesCount;
    }

    /**
     * @hidden
     */
    public get nativeTabItem(): ElementRef {
        return this._nativeTabItem;
    }

    /**
     * 	Gets whether the tab is disabled.
     * ```
     * const disabledItem = this.myTabComponent.tabs.first.disabled;
     * ```
     */
    @Input()
    public get disabled(): boolean {
        return this.relatedGroup ? this.relatedGroup.disabled : this._disabled;
    }
    public set disabled(newValue: boolean) {
        if (this.relatedGroup) {
            this.relatedGroup.disabled = newValue;
        } else {
            this._disabled = newValue;
        }
    }

    /**
     * Gets whether the tab is selected.
     * ```typescript
     * const selectedItem = this.myTabComponent.tabs.first.isSelected;
     * ```
     */
    @Input()
    public get isSelected(): boolean {
        return this.relatedGroup ? this.relatedGroup.isSelected : this._isSelected;
    }
    public set isSelected(newValue: boolean) {
        if (!this.disabled && this.isSelected !== newValue) {
            this._tabs.performSelectionChange(newValue ? this : null);
        }
    }

    /**
     * @hidden
     */
    public select(): void {
        if (!this.disabled && !this.isSelected) {
            this._tabs.performSelectionChange(this);
        }
    }

    /**
     * @hidden
     */
    public get index(): number {
        if (this._tabs.tabs) {
            return this._tabs.tabs.toArray().indexOf(this);
        }
        return -1;
    }

    /**
     * @hidden
     */
    public setSelectedInternal(newValue: boolean) {
        this._isSelected = newValue;
        this._ngZone.runOutsideAngular(() => {
            if (this._resizeObserver) {
                if (this._isSelected) {
                    this._resizeObserver.observe(this._element.nativeElement);
                } else {
                    this._resizeObserver.disconnect();
                }
            }
        });
        this.tabindex = newValue ? 0 : -1;
    }

    /**
     * @hidden
     */
    public get template(): TemplateRef<any> {
        if (this.relatedGroup && this.relatedGroup.customTabTemplate) {
            return this.relatedGroup.customTabTemplate;
        }
        if (this.customTabTemplateDir) {
            return this.customTabTemplateDir.template;
        }
        return this.defaultTabTemplate;
    }

    /**
     * @hidden
     */
    public get context(): any {
        return this.relatedGroup ? this.relatedGroup : this;
    }
}
