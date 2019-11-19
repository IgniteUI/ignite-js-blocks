import { IgxDropDownItemComponent } from './../drop-down/drop-down-item.component';
import { Component, DoCheck, Input } from '@angular/core';

@Component({
    selector: 'igx-select-item',
    template: '<ng-content></ng-content>'
})
export class IgxSelectItemComponent extends IgxDropDownItemComponent implements DoCheck {

    private _text: any;

    /**
     * An @Input property that gets/sets the item's text to be displayed in the select component's input when the item is selected.
     *
     * ```typescript
     *  //get
     *  let mySelectedItem = this.dropDown.selectedItem;
     *  let selectedItemText = mySelectedItem.text;
     * ```

     * ```html
     * // set
     * <igx-select-item [text]="'London'"></igx-select-item>
     * ```
     */
    @Input()
    public get text(): string {
        return this._text;
    }

    public set text(text: string) {
        this._text = text;
    }

    /** @hidden @internal */
    public get itemText() {
        if (this._text !== undefined) {
            return this._text;
        }
        return this.elementRef.nativeElement.innerText.trim();
    }

    /**
     * Sets/Gets if the item is the currently selected one in the select
     *
     * ```typescript
     *  let mySelectedItem = this.select.selectedItem;
     *  let isMyItemSelected = mySelectedItem.selected; // true
     * ```
     */
    public get selected() {
        return !this.isHeader && !this.disabled && this.selection.is_item_selected(this.dropDown.id, this);
    }

    public set selected(value: any) {
        if (value && !this.isHeader && !this.disabled) {
            this.dropDown.selectItem(this);
        }
    }

    /** @hidden @internal */
    public isHeader: boolean;

    ngDoCheck(): void {
    }
}
