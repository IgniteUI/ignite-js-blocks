import { Component, forwardRef, Input, HostBinding, ChangeDetectorRef, ElementRef, ViewChild, Inject } from '@angular/core';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxRowComponent } from '../row.component';
import { IgxGridCellComponent } from '../cell.component';
import { IgxTreeGridRowComponent } from './tree-grid-row.component';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { GridBaseAPIService } from '../api.service';
import { IgxSelectionAPIService } from '../../core/selection';
import { valToPxlsUsingRange } from '../../core/utils';
import { DOCUMENT } from '@angular/common';
import { IgxGridBaseComponent } from '../grid';

@Component({
    selector: 'igx-tree-grid-cell',
    templateUrl: 'tree-cell.component.html'
})
export class IgxTreeGridCellComponent extends IgxGridCellComponent {
    private treeGridAPI: IgxTreeGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseComponent>,
                selection: IgxSelectionAPIService,
                cdr: ChangeDetectorRef,
                element: ElementRef,
                @Inject(DOCUMENT) public document) {
        super(gridAPI, selection, cdr, element);
        this.treeGridAPI = <IgxTreeGridAPIService>gridAPI;
    }

    @ViewChild('indicator', { read: ElementRef })
    public indicator: ElementRef;

    @ViewChild('indentationDiv', { read: ElementRef })
    public indentationDiv: ElementRef;

    /**
     * @hidden
     */
    protected resolveStyleClasses(): string {
        return super.resolveStyleClasses() + ' igx-grid__td--tree-cell';
    }

    public get indentation() {
        return this.row.indentation;
    }

    public get hasChildren() {
        return this.row.treeRow.children && this.row.treeRow.children.length > 0;
    }

    get expanded(): boolean {
        return this.row.expanded;
    }

    public toggle(event: Event) {
        event.stopPropagation();
        this.treeGridAPI.trigger_row_expansion_toggle(this.gridID, this.row, event);
    }

    /**
     * @hidden
     */
    public onIndicatorFocus(event: Event) {
        event.stopPropagation();
    }

    /**
     * @hidden
     */
    public calculateSizeToFit(range: any): number {
        const indicatorWidth = this.indicator.nativeElement.getBoundingClientRect().width;
        const indicatorStyle = this.document.defaultView.getComputedStyle(this.indicator.nativeElement);
        const indicatorMargin = parseFloat(indicatorStyle.marginRight);
        let leftPadding = 0;
        if (this.indentationDiv) {
            const indentationStyle = this.document.defaultView.getComputedStyle(this.indentationDiv.nativeElement);
            leftPadding = parseFloat(indentationStyle.paddingLeft);
        }
        const largestWidth = Math.max(...Array.from(this.nativeElement.children)
            .map((child) => valToPxlsUsingRange(range, child)));
        return largestWidth + indicatorWidth + indicatorMargin + leftPadding;
    }
}
