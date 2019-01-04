import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    forwardRef,
    NgModule,
    QueryList,
    OnInit,
    Output,
    EventEmitter,
    Input,
    OnDestroy,
    AfterViewInit,
} from '@angular/core';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxDropDownItemComponent } from './drop-down-item.component';
import { IgxDropDownBase } from './drop-down.base';
import { IgxDropDownItemNavigationDirective, DropDownActionKeys } from './drop-down-navigation.directive';
import { IGX_DROPDOWN_BASE, IDropDownBase } from './drop-down-utils';
import { IToggleView } from '../core/navigation/IToggleView';
import { ISelectionEventArgs, Navigate } from './drop-down.common';
import { CancelableEventArgs } from '../core/utils';
import { IgxSelectionAPIService } from '../core/selection';
import { Subject } from 'rxjs';
import { IgxDropDownSelectionService } from './drop-down.selection';
import { IgxDropDownItemBase } from './drop-down-item.base';


/**
 * **Ignite UI for Angular DropDown** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/drop-down.html)
 *
 * The Ignite UI for Angular Drop Down displays a scrollable list of items which may be visually grouped and
 * supports selection of a single item. Clicking or tapping an item selects it and closes the Drop Down
 *
 * Example:
 * ```html
 * <igx-drop-down>
 *   <igx-drop-down-item *ngFor="let item of items" disabled={{item.disabled}} isHeader={{item.header}}>
 *     {{ item.value }}
 *   </igx-drop-down-item>
 * </igx-drop-down>
 * ```
 */
@Component({
    selector: 'igx-drop-down',
    templateUrl: './drop-down.component.html',
    providers: [{ provide: IGX_DROPDOWN_BASE, useExisting: IgxDropDownComponent }]
})
export class IgxDropDownComponent extends IgxDropDownBase implements IDropDownBase, OnInit, IToggleView, OnDestroy {
    @ContentChildren(forwardRef(() => IgxDropDownItemComponent))
    protected children: QueryList<IgxDropDownItemBase>;

    protected destroy$ = new Subject<boolean>();
    /**
     * Gets/sets whether items take focus. Disabled by default.
     * When enabled, drop down items gain tab index and are focused when active -
     * this includes activating the selected item when opening the drop down and moving with keyboard navigation.
     *
     * Note: Keep that focus shift in mind when using the igxDropDownItemNavigation directive
     * and ensure it's placed either on each focusable item or a common ancestor to allow it to handle keyboard events.
     *
     * ```typescript
     * // get
     * let dropDownAllowsItemFocus = this.dropdown.allowItemsFocus;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-drop-down [allowItemsFocus]='true'></igx-drop-down>
     * ```
     */
    @Input()
    public allowItemsFocus = false;

    @Input()
    get id(): string {
        return this._id;
    }
    set id(value: string) {
        this.toggleDirective.id = value;
        this.selection.set(value, this.selection.get(this.id));
        this.selection.clear(this.id);
        this._id = value;
    }

    /**
     * Get currently selected item
     *
     * ```typescript
     * let currentItem = this.dropdown.selectedItem;
     * ```
     */
    public get selectedItem(): any {
        const selectedItem = this.selection.first_item(this.id);
        if (selectedItem) {
            if (selectedItem.isSelected) {
                return selectedItem;
            }
            this.selection.clear(this.id);
        }
        return null;
    }

    /**
     * Get all header items
     *
     * ```typescript
     * let myDropDownHeaderItems = this.dropdown.headers;
     * ```
     */
    public get headers(): IgxDropDownItemBase[] {
        const headers: IgxDropDownItemBase[] = [];
        if (this.children !== undefined) {
            for (const child of this.children.toArray()) {
                if (child.isHeader) {
                    headers.push(child);
                }
            }
        }

        return headers;
    }

    /**
     * Select an item by index
     * @param index of the item to select
     */
    public setSelectedItem(index: number) {
        if (index < 0 || index >= this.items.length) {
            return;
        }
        const newSelection = this.items[index];
        this.selectItem(newSelection);
    }

    navigateItem(index: number) {
        super.navigateItem(index);
        if (this.allowItemsFocus && this.focusedItem) {
            this.focusedItem.element.nativeElement.focus();
            this.cdr.markForCheck();
        }
    }

    public onToggleOpening(e: CancelableEventArgs) {
        super.onToggleOpening(e);
        this.scrollToItem(this.selectedItem);
    }

    public onToggleOpened() {
        this._focusedItem = this.selectedItem;
        if (this._focusedItem) {
            this._focusedItem.isFocused = true;
        } else if (this.allowItemsFocus) {
            const firstItemIndex = this.getNearestSiblingFocusableItemIndex(-1, Navigate.Down);
            if (firstItemIndex !== -1) {
                this.navigateItem(firstItemIndex);
            }
        }
        super.onToggleOpened();
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
        this.selection.clear(this.id);
    }

    /**
     * @hidden
     */
    protected scrollToItem(item: IgxDropDownItemBase) {
        const itemPosition = this.calculateScrollPosition(item);
        this.scrollContainer.scrollTop = (itemPosition);
    }

    /**
     * @hidden
     */
    protected calculateScrollPosition(item: IgxDropDownItemBase): number {
        if (!item) {
            return 0;
        }

        const elementRect = item.element.nativeElement.getBoundingClientRect();
        const parentRect = this.scrollContainer.getBoundingClientRect();
        const scrollDelta = parentRect.top - elementRect.top;
        let scrollPosition = this.scrollContainer.scrollTop - scrollDelta;

        const dropDownHeight = this.scrollContainer.clientHeight;
        scrollPosition -= dropDownHeight / 2;
        scrollPosition += item.elementHeight / 2;

        return Math.floor(scrollPosition);
    }

    public handleKeyDown(key: DropDownActionKeys, event?: Event) {
        switch (key) {
            case DropDownActionKeys.ENTER:
            case DropDownActionKeys.SPACE:
            case DropDownActionKeys.TAB:
                this.selectItem(this.focusedItem, event);
                this.close();
                break;
            case DropDownActionKeys.ESCAPE:
                this.close();
        }
    }

    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected selection: IgxDropDownSelectionService) {
        super(elementRef, cdr);
        if (!selection) {
            this.selection = new IgxDropDownSelectionService();
        }
    }

    /**
     * Handles the `onSelection` emit and the drop down toggle when selection changes
     * @hidden
     * @internal
     * @param newSelection
     * @param event
     */
    public selectItem(newSelection?: IgxDropDownItemBase, event?: Event) {
        const oldSelection = this.selectedItem;
        if (!newSelection) {
            newSelection = this._focusedItem;
        }
        if (newSelection === null) {
            return;
        }
        if (newSelection.isHeader) {
            return;
        }
        const args: ISelectionEventArgs = { oldSelection, newSelection, cancel: false };
        this.onSelection.emit(args);

        if (!args.cancel) {
            this.selection.set(this.id, new Set([newSelection]));
            if (oldSelection) {
                oldSelection.isSelected = false;
            }
            if (newSelection) {
                newSelection.isSelected = true;
            }
            if (event) {
                this.toggleDirective.close();
            }
        }
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxDropDownComponent, IgxDropDownItemComponent, IgxDropDownItemNavigationDirective],
    exports: [IgxDropDownComponent, IgxDropDownItemComponent, IgxDropDownItemNavigationDirective],
    imports: [CommonModule, IgxToggleModule],
    providers: [IgxSelectionAPIService]
})
export class IgxDropDownModule { }

export { ISelectionEventArgs } from './drop-down.common';
