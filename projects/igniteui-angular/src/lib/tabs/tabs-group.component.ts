import { CommonModule } from '@angular/common';
import {
    AfterContentInit,
    AfterViewChecked,
    Component,
    ContentChild,
    Directive,
    ElementRef,
    forwardRef,
    HostBinding,
    Inject,
    Input,
    TemplateRef
} from '@angular/core';

import { IgxTabItemComponent } from './tab-item.component';
import { IgxTabsComponent } from './tabs.component';
import { IgxTabItemTemplateDirective } from './tabs.directives';

@Component({
    selector: 'igx-tabs-group',
    templateUrl: 'tabs-group.component.html'
})

export class IgxTabsGroupComponent implements AfterContentInit, AfterViewChecked {
    private _itemStyle = 'igx-tabs-group';
    public isSelected = false;

    @Input()
    public label: string;

    @Input()
    public icon: string;

    @Input()
    public isDisabled: boolean;

    @HostBinding('attr.role') public role = 'tabpanel';

    @HostBinding('class.igx-tabs__group')
    get styleClass(): boolean {
        return true;
    }

    public get itemStyle(): string {
        return this._itemStyle;
    }

    get relatedTab(): IgxTabItemComponent {
        if (this._tabs.tabs) {
            return this._tabs.tabs.toArray()[this.index];
        }
    }

    get index() {
        if (this._tabs.groups) {
            return this._tabs.groups.toArray().indexOf(this);
        }
    }

    get customTabTemplate(): TemplateRef<any> {
        return this._tabTemplate;
    }

    set customTabTemplate(template: TemplateRef<any>) {
        this._tabTemplate = template;
    }

    private _tabTemplate: TemplateRef<any>;

    @ContentChild(IgxTabItemTemplateDirective, { read: IgxTabItemTemplateDirective })
    protected tabTemplate: IgxTabItemTemplateDirective;

    constructor(
        @Inject(forwardRef(() => IgxTabsComponent))
        private _tabs: IgxTabsComponent,
        private _element: ElementRef) {
    }

    public ngAfterContentInit(): void {
        if (this.tabTemplate) {
            this._tabTemplate = this.tabTemplate.template;
        }
    }

    public ngAfterViewChecked() {
        this._element.nativeElement.setAttribute('aria-labelledby', `igx-tab-item-${this.index}`);
        this._element.nativeElement.setAttribute('id', `igx-tabs__group-${this.index}`);
    }

    public select(focusDelay = 50, onInit = false) {
        if (this.isDisabled || this._tabs.selectedIndex === this.index) {
            return;
        }

        this.isSelected = true;
        this.relatedTab.tabindex = 0;

        if (!onInit) {
            setTimeout(() => {
                this.relatedTab.nativeTabItem.nativeElement.focus();
            }, focusDelay);
        }
        this._handleSelection();
        this._tabs.onTabItemSelected.emit({ tab: this._tabs.tabs.toArray()[this.index], group: this });
    }

    private _handleSelection() {
        const tabElement = this.relatedTab.nativeTabItem.nativeElement;
        const viewPortOffsetWidth = this._tabs.viewPort.nativeElement.offsetWidth;

        if (tabElement.offsetLeft < this._tabs.offset) {
            this._tabs.scrollElement(tabElement, false);
        } else if (tabElement.offsetLeft + tabElement.offsetWidth > viewPortOffsetWidth + this._tabs.offset) {
            this._tabs.scrollElement(tabElement, true);
        }

        const contentOffset = this._tabs.tabsContainer.nativeElement.offsetWidth * this.index;
        this._tabs.contentsContainer.nativeElement.style.transform = `translate(${-contentOffset}px)`;

        this._tabs.selectedIndicator.nativeElement.style.width = `${tabElement.offsetWidth}px`;
        this._tabs.selectedIndicator.nativeElement.style.transform = `translate(${tabElement.offsetLeft}px)`;
    }
}
