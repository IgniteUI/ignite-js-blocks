import {
    Component,
    HostBinding,
    Input,
    Optional,
    Inject,
    ElementRef,
    ContentChild
} from '@angular/core';
import { IDisplayDensityOptions, DisplayDensityToken, DisplayDensityBase } from '../../core/displayDensity';
import { IgxGridIconService } from '../common/grid-icon.service';
import { PINNING_ICONS_FONT_SET, PINNING_ICONS } from '../pinning/pinning-icons';
import { GridIconsFeature } from '../common/enums';
import { IgxGridToolbarTitleDirective, IgxGridToolbarActionsDirective } from './common';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { GridType } from '../common/grid.interface';

 /**
  * Provides a context-aware container component for UI operations for the grid components.
  *
  * @igxModule IgxGridToolbarModule
  *
  */
@Component({
    selector: 'igx-grid-toolbar',
    templateUrl: './grid-toolbar.component.html'
})
export class IgxGridToolbarComponent extends DisplayDensityBase {

    /**
     * When enabled, shows the indeterminate progress bar.
     *
     * @remarks
     * By default this will be toggled, when the default exporter component is present
     * and an exporting is in progress.
     */
    @Input()
    public showProgress = false;

    /**
     * Gets/sets the grid component for the toolbar component.
     *
     * @remarks
     * Usually you should not set this property in the context of the default grid/tree grid.
     * The only grids that demands this to be set are the hierarchical child grids. For additional
     * information check the toolbar topic.
     */
    @Input()
    get grid() {
        if (this._grid) {
            return this._grid;
        }
        return this.api.grid;
    }

    set grid(value: IgxGridBaseDirective) {
        this._grid = value;
    }

    /** Returns the native DOM element of the toolbar component */
    public get nativeElement() {
        return this.element.nativeElement;
    }

    /**
     * @hidden
     * @internal
     */
    @ContentChild(IgxGridToolbarTitleDirective)
    public hasTitle: IgxGridToolbarTitleDirective;

    /**
     * @hidden
     * @internal
     */
    @ContentChild(IgxGridToolbarActionsDirective)
    public hasActions: IgxGridToolbarActionsDirective;

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-grid-toolbar')
    defaultStyle = true;

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-grid-toolbar--cosy')
    get cosyStyle() { return this.displayDensity === 'cosy'; }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-grid-toolbar--compact')
    get compactStyle() { return this.displayDensity === 'compact'; }

    protected _grid: IgxGridBaseDirective;

    constructor(
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions,
        private api: GridBaseAPIService<IgxGridBaseDirective & GridType>,
        private iconService: IgxGridIconService,
        private element: ElementRef<HTMLElement>
    ) {
        super(_displayDensityOptions);
        this.iconService.registerSVGIcons(GridIconsFeature.RowPinning, PINNING_ICONS, PINNING_ICONS_FONT_SET);
    }


    /**
     * @hidden @internal
     */
    // public onClosingColumnHiding(args) {
    //     const activeElem = document.activeElement;

    //     if (!args.event && activeElem !== this.grid.nativeElement &&
    //         !this.columnHidingButton.nativeElement.contains(activeElem)) {
    //         args.cancel = true;
    //     }
    // }

    // /**
    //  * @hidden @internal
    //  */
    // public onClosingColumnPinning(args) {
    //     const activeElem = document.activeElement;

    //     if (!args.event && activeElem !== this.grid.nativeElement &&
    //         !this.columnPinningButton.nativeElement.contains(activeElem)) {
    //         args.cancel = true;
    //     }
    // }
}
