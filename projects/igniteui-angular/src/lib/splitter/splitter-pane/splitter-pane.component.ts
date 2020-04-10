import { Component, HostBinding, Input, ElementRef, Output, EventEmitter } from '@angular/core';

/**
 * Provides reference to `SplitPaneComponent` component.
 * Represents individual resizable panes. Users can control the resize behavior via the min and max size properties.
 * @export
 * @class SplitPaneComponent
 */
@Component({
    selector: 'igx-splitter-pane',
    templateUrl: './splitter-pane.component.html'
})
export class IgxSplitterPaneComponent {

    public _size = 'auto';
    /**
     * Sets/gets the size of the current `IgxSplitterPaneComponent`.
     */
    @Input()
    get size() {
        return this._size;
    }

    set size(value) {
        this._size = value;
        this.el.nativeElement.style.flex = this.flex;
        this.sizeChange.emit(value);
    }

    /**
     * @hidden @internal
     */
    @Output()
    public sizeChange = new EventEmitter<string>();

    /**
     * Sets/gets the minimum allowable size of the current `IgxSplitterPaneComponent`.
     */
    @Input()
    public minSize!: string;

    /**
     * Sets/gets the maximum allowable size of the current `IgxSplitterPaneComponent`.
     */
    @Input()
    public maxSize!: string;

    /**
     * Sets/Gets whether pane is resizable.
     */
    @Input()
    public resizable = true;


    /**
     * Sets/gets the `order` property of the current `IgxSplitterPaneComponent`.
     */
    @Input()
    @HostBinding('style.order')
    public order!: number;

    /**
     * Gets the host native element.
     * @readonly
     * @type *
     */
    public get element(): any {
        return this.el.nativeElement;
    }

    /**
     * Sets/gets the `overflow` property of the current `IgxSplitterPaneComponent`.
     */
    @HostBinding('style.overflow')
    public overflow = 'auto';

    /**
     * Sets/gets the `minHeight` and `minWidth` propertis of the current `IgxSplitterPaneComponent`.
     */
    @HostBinding('style.min-height')
    @HostBinding('style.min-width')
    public minHeight = 0;

    /**
     * Sets/gets the `maxHeight` and `maxWidth` propertis of the current `IgxSplitterPaneComponent`.
     */
    @HostBinding('style.max-height')
    @HostBinding('style.max-width')
    public maxHeight = '100%';

    /**
     * Gets the `flex` property of the current `IgxSplitterPaneComponent`.
     * @readonly
     */
    @HostBinding('style.flex')
    public get flex() {
        const grow = this.size !== 'auto' ? 0 : 1;
        const shrink = this.size !== 'auto' ? 0 : 1;

        return `${grow} ${shrink} ${this.size}`;
    }

    /**
     * Sets/gets the 'display' property of the current `IgxSplitterPaneComponent`
     */
    @HostBinding('style.display')
    public display = 'flex';

    private _hidden = false;

    /**
     * Sets/gets whether current `IgxSplitterPanecomponent` is hidden
     */
    @Input()
    public set hidden(value) {
        this._hidden = value;
        this.display = this._hidden ? 'none' : 'flex' ;
    }

    public get hidden() {
        return this._hidden;
    }

    /**
     * Event fired when collapsing and changing the hidden state of the current pane
     */
    @Output()
    public onPaneToggle = new EventEmitter<IgxSplitterPaneComponent>();

    constructor(private el: ElementRef) { }
}
