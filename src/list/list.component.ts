import { CommonModule } from "@angular/common";
import {
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
    Input,
    NgModule,
    Output,
    QueryList,
    TemplateRef,
    ViewChild
} from "@angular/core";

import { IgxRippleModule } from "../directives/ripple/ripple.directive";

import { IgxListItemComponent } from "./list-item.component";
import { IgxEmptyListTemplateDirective } from "./list.common";

/**
 * **Ignite UI for Angular List** - [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/list.html)  
 * The Ignite UI List displays rows of items and supports one or more header items as well as search and filtering of list items. Each list item is completely templateable and will support any valid HTML or Angular component.
 *
 * Example:
 * ```html
 * <igx-list>
 *   <igx-list-item isHeader="true">Contacts</igx-list-item>
 *   <igx-list-item *ngFor="let contact of contacts">
 *     <span class="name">{{ contact.name }}</span>
 *     <span class="phone">{{ contact.phone }}</span>
 *   </igx-list-item>
 * </igx-list>
 * ```
 */
@Component({
    selector: "igx-list",
    templateUrl: "list.component.html"
})
export class IgxListComponent {

    constructor(private element: ElementRef) {
    }

    @ContentChildren(forwardRef(() => IgxListItemComponent))
    public children: QueryList<IgxListItemComponent>;

    @ContentChild(IgxEmptyListTemplateDirective, { read: IgxEmptyListTemplateDirective })
    public emptyListTemplate: IgxEmptyListTemplateDirective;

    @ViewChild("defaultEmptyList", { read: TemplateRef })
    protected defaultEmptyListTemplate: TemplateRef<any>;

    @Input()
    public allowLeftPanning = false;
    @Input()
    public allowRightPanning = false;

    @Output()
    public onLeftPan = new EventEmitter();
    @Output()
    public onRightPan = new EventEmitter();
    @Output()
    public onPanStateChange = new EventEmitter();
    @Output()
    public onItemClicked = new EventEmitter();

    @HostBinding("attr.role")
    public get role() {
        return "list";
    }

    @HostBinding("class")
    public get innerStyle(): string {
        return !this.children || this.children.length === 0 ? "igx-list-empty" : "igx-list";
    }

    public get items(): IgxListItemComponent[] {
        const items: IgxListItemComponent[] = [];
        if (this.children !== undefined) {
            for (const child of this.children.toArray()) {
                if (!child.isHeader) {
                    items.push(child);
                }
            }
        }

        return items;
    }

    public get headers(): IgxListItemComponent[] {
        const headers: IgxListItemComponent[] = [];
        if (this.children !== undefined) {
            for (const child of this.children.toArray()) {
                if (child.isHeader) {
                    headers.push(child);
                }
            }
        }

        return headers;
    }

    public get context(): any {
        return {
            $implicit: this
        };
    }

    public get template(): TemplateRef<any> {
        return this.emptyListTemplate ? this.emptyListTemplate.template : this.defaultEmptyListTemplate;
    }
}

@NgModule({
    declarations: [IgxListComponent, IgxListItemComponent, IgxEmptyListTemplateDirective],
    exports: [IgxListComponent, IgxListItemComponent, IgxEmptyListTemplateDirective],
    imports: [CommonModule, IgxRippleModule]
})
export class IgxListModule {
}
