import { AnimationBuilder } from '@angular/animations';
import {
    AfterViewInit, ContentChildren, Directive, EventEmitter,
    HostBinding,
    Input, OnDestroy, Output, QueryList
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Direction, IgxCarouselComponentBase } from '../carousel/carousel-base';
import { IBaseEventArgs } from '../core/utils';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabContentBase, IgxTabsBase } from './tabs.base';

export interface ITabsBaseEventArgs extends IBaseEventArgs {
    readonly owner: IgxTabsDirective;
}

export interface ITabsSelectedIndexChangingEventArgs extends ITabsBaseEventArgs {
    cancel: boolean;
    readonly oldIndex: number;
    newIndex: number;
}

export interface ITabsSelectedItemChangeEventArgs extends ITabsBaseEventArgs {
    readonly oldItem: IgxTabItemDirective;
    readonly newItem: IgxTabItemDirective;
}

@Directive()
export abstract class IgxTabsDirective extends IgxCarouselComponentBase implements IgxTabsBase, AfterViewInit, OnDestroy {

    /** @hidden */
    @HostBinding('attr.role')
    public role = 'tabs';

    /**
     * An @Input property that gets/sets the index of the selected item.
     * Default value is 0 if contents are defined otherwise defaults to -1.
     */
    @Input()
    public get selectedIndex(): number {
        return this._selectedIndex;
    }

    public set selectedIndex(value: number) {
        if (this._selectedIndex !== value) {
            let newIndex = value;
            const oldIndex = this._selectedIndex;
            const args: ITabsSelectedIndexChangingEventArgs = {
                owner: this,
                cancel: false,
                oldIndex,
                newIndex
            };
            this.selectedIndexChanging.emit(args);

            if (!args.cancel) {
                newIndex = args.newIndex;
                this._selectedIndex = newIndex;
                this.selectedIndexChange.emit(this._selectedIndex);
            }

            this.updateSelectedTabs(oldIndex);
        }
    }

    /**
     * Enables/disables the transition animation of the contents.
     */
    @Input()
    public get disableAnimation() {
        return this._disableAnimation;
    }

    public set disableAnimation(value: boolean) {
        this._disableAnimation = value;
    }

    /**
     * Output to enable support for two-way binding on [(selectedIndex)]
     */
    @Output()
    public selectedIndexChange = new EventEmitter<number>();

    /**
     * Emitted when the selected index is about to change.
     */
    @Output()
    public selectedIndexChanging = new EventEmitter<ITabsSelectedIndexChangingEventArgs>();

    /**
     * Emitted when the selected item is changed.
     */
    @Output()
    public selectedItemChange = new EventEmitter<ITabsSelectedItemChangeEventArgs>();

    /**
     * Returns the items.
     */
    @ContentChildren(IgxTabItemDirective)
    public items: QueryList<IgxTabItemDirective>;

    /**
     * Gets the selected item.
     */
    public get selectedItem(): IgxTabItemDirective {
        return this.items && this.selectedIndex >= 0 && this.selectedIndex < this.items.length ?
            this.items.get(this.selectedIndex) : null;
    }

    /** @hidden */
    @ContentChildren(IgxTabContentBase, { descendants: true })
    public panels: QueryList<IgxTabContentBase>;

    /** @hidden */
    protected _disableAnimation = false;
    /** @hidden */
    protected currentItem: IgxTabItemDirective;
    /** @hidden */
    protected previousItem: IgxTabItemDirective;
    /** @hidden */
    protected componentName: string;

    private _selectedIndex = -1;
    private _itemChanges$: Subscription;

    /** @hidden */
    constructor(builder: AnimationBuilder) {
        super(builder);
    }

    /** @hidden */
    public ngAfterViewInit(): void {
        if (this._selectedIndex === -1) {
            const hasSelectedTab = this.items.some((tab, i) => {
                if (tab.selected) {
                    this._selectedIndex = i;
                }
                return tab.selected;
            });

            if (!hasSelectedTab && this.hasPanels) {
                this._selectedIndex = 0;
            }
        }

        // Use promise to avoid expression changed after check error
        Promise.resolve().then(() => {
            this.updateSelectedTabs(null, false);
        });

        this._itemChanges$ = this.items.changes.subscribe(() => {
            this.onItemChanges();
        });

        this.setAttributes();
    }

    /** @hidden */
    public ngOnDestroy(): void {
        if (this._itemChanges$) {
            this._itemChanges$.unsubscribe();
        }
    }

    /** @hidden */
    public selectTab(tab: IgxTabItemDirective, selected: boolean): void {
        if (!this.items) {
            return;
        }

        const tabs = this.items.toArray();

        if (selected) {
            const index = tabs.indexOf(tab);
            if (index > -1) {
                this.selectedIndex = index;
            }
        } else {
            if (tabs.every(t => !t.selected)) {
                this.selectedIndex = -1;
            }
        }
    }

    /** @hidden */
    protected getPreviousElement(): HTMLElement {
        return this.previousItem.panelComponent.nativeElement;
    }

    /** @hidden */
    protected getCurrentElement(): HTMLElement {
        return this.currentItem.panelComponent.nativeElement;
    }

    /** @hidden */
    protected scrollTabHeaderIntoView() {
    }

    /** @hidden */
    protected onItemChanges() {
        this.setAttributes();

        // Check if there is selected tab
        let selectedIndex = -1;
        this.items.some((tab, i) => {
            if (tab.selected) {
                selectedIndex = i;
            }
            return tab.selected;
        });

        if (selectedIndex >= 0) {
            // Set the selected index to the tab that has selected=true
            Promise.resolve().then(() => {
                this.selectedIndex = selectedIndex;
            });
        } else {
            if (this.selectedIndex >= 0 && this.selectedIndex < this.items.length) {
                // Select the tab on the same index the previous selected tab was
                Promise.resolve().then(() => {
                    this.updateSelectedTabs(null);
                });
            } else if (this.selectedIndex >= this.items.length) {
                // Select the last tab
                Promise.resolve().then(() => {
                    this.selectedIndex = this.items.length - 1;
                });
            }
        }
    }

    private setAttributes() {
        this.items.forEach(item => {
            if (item.panelComponent && !item.headerComponent.nativeElement.getAttribute('id')) {
                const id = this.getNextTabId();
                const tabHeaderId = `${this.componentName}-header-${id}`;
                const tabPanelId = `${this.componentName}-content-${id}`;

                this.setHeaderAttribute(item, 'id', tabHeaderId);
                this.setHeaderAttribute(item, 'aria-controls', tabPanelId);
                this.setPanelAttribute(item, 'id', tabPanelId);
                this.setPanelAttribute(item, 'aria-labelledby', tabHeaderId);
            }
        });
    }

    private setHeaderAttribute(item: IgxTabItemDirective, attrName: string, value: string) {
        item.headerComponent.nativeElement.setAttribute(attrName, value);
    }

    private setPanelAttribute(item: IgxTabItemDirective, attrName: string, value: string) {
        item.panelComponent.nativeElement.setAttribute(attrName, value);
    }

    private get hasPanels() {
        return this.panels && this.panels.length;
    }

    private updateSelectedTabs(oldSelectedIndex: number, raiseEvent = true) {
        if (!this.items) {
            return;
        }

        let newTab: IgxTabItemDirective;
        const oldTab = this.currentItem;

        // First select the new tab
        if (this._selectedIndex >= 0 && this._selectedIndex < this.items.length) {
            newTab = this.items.get(this._selectedIndex);
            newTab.selected = true;
        }
        // Then unselect the other tabs
        this.items.forEach((tab, i) => {
            if (i !== this._selectedIndex) {
                tab.selected = false;
            }
        });

        if (this._selectedIndex !== oldSelectedIndex) {
            this.scrollTabHeaderIntoView();
            this.triggerPanelAnimations(oldSelectedIndex);

            if (raiseEvent && newTab !== oldTab) {
                this.selectedItemChange.emit({
                    owner: this,
                    newItem: newTab,
                    oldItem: oldTab
                });
            }
        }
    }

    private triggerPanelAnimations(oldSelectedIndex: number) {
        const item = this.items.get(this._selectedIndex);

        if (item &&
            !this.disableAnimation &&
            this.hasPanels &&
            this.currentItem &&
            !this.currentItem.selected) {
            item.direction = this._selectedIndex > oldSelectedIndex ? Direction.NEXT : Direction.PREV;

            if (this.previousItem && this.previousItem.previous) {
                this.previousItem.previous = false;
            }
            this.currentItem.direction = item.direction;

            this.previousItem = this.currentItem;
            this.currentItem = item;
            this.triggerAnimations();
        } else {
            this.currentItem = item;
        }
    }

    /** @hidden */
    protected abstract getNextTabId();
}
