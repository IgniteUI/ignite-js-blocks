import { ContentChild, Directive, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { Direction, IgxSlideComponentBase } from '../carousel/carousel-base';
import { IgxTabHeaderBase, IgxTabItemBase, IgxTabContentBase, IgxTabsBase } from './tabs.base';

@Directive()
export abstract class IgxTabItemDirective implements IgxTabItemBase, IgxSlideComponentBase {

    /** @hidden */
    @ContentChild(IgxTabHeaderBase)
    public headerComponent: IgxTabHeaderBase;

    /** @hidden */
    @ContentChild(IgxTabContentBase)
    public panelComponent: IgxTabContentBase;

    /** @hidden */
    @ViewChild('headerTemplate', { static: true })
    public headerTemplate: TemplateRef<any>;

    /** @hidden */
    @ViewChild('panelTemplate', { static: true })
    public panelTemplate: TemplateRef<any>;

    /**
     * Output to enable support for two-way binding on [(selected)]
     */
    @Output()
    public selectedChange = new EventEmitter<boolean>();

    /**
     * An @Input property that allows you to enable/disable the item.
     */
    @Input()
    public disabled = false;

    /** @hidden */
    public direction = Direction.NONE;
    /** @hidden */
    public previous: boolean;

    private _selected = false;

    /**
     * An @Input property which determines whether an item is selected.
     */
    @Input()
    public get selected(): boolean {
        return this._selected;
    };

    public set selected(value: boolean) {
        if (this._selected !== value) {
            this._selected = value;
            this.tabs.selectTab(this, this._selected);
            this.selectedChange.emit(this._selected);
        }
    }

    /** @hidden */
    constructor(private tabs: IgxTabsBase) {
    }
}
