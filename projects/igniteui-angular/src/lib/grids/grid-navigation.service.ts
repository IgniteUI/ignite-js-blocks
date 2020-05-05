import { Injectable } from '@angular/core';
import { first } from 'rxjs/operators';
import { IgxForOfDirective } from '../directives/for-of/for_of.directive';
import { GridType } from './common/grid.interface';
import { NAVIGATION_KEYS, ROW_COLLAPSE_KEYS, ROW_EXPAND_KEYS, SUPPORTED_KEYS, HORIZONTAL_NAV_KEYS, HEADER_KEYS } from '../core/utils';
import { IgxGridBaseDirective } from './grid-base.directive';
import { IMultiRowLayoutNode } from './selection/selection.service';
import { GridKeydownTargetType, GridSelectionMode, FilterMode } from './common/enums';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxGridExcelStyleFilteringComponent } from './filtering/excel-style/grid.excel-style-filtering.component';
export interface ColumnGroupsCache {
    level: number;
    visibleIndex: number;
}
export interface IActiveNode {
    gridID?: string;
    row: number;
    column?: number;
    level?: number;
    mchCache?: ColumnGroupsCache;
    layout?: IMultiRowLayoutNode;
}

/** @hidden */
@Injectable()
export class IgxGridNavigationService {
    public grid: IgxGridBaseDirective & GridType;
    public activeNode: IActiveNode;

    dispatchEvent(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (!this.activeNode || !(SUPPORTED_KEYS.has(key) || (key === 'tab' && this.grid.crudService.cell))) { return; }
        const shift = event.shiftKey;
        const ctrl = event.ctrlKey;

        const type = this.isDataRow(this.activeNode.row) ? GridKeydownTargetType.dataCell :
            this.isDataRow(this.activeNode.row, true) ? GridKeydownTargetType.summaryCell : GridKeydownTargetType.groupRow;
        const cancel = this.emitKeyDown(type, this.activeNode.row, event);
        if (cancel) {
            return;
        }
        if (event.altKey) {
            this.handleAlt(key, event);
            return;
        }
        if ([' ', 'spacebar', 'space'].indexOf(key) === -1) {
            this.grid.selectionService.keyboardStateOnKeydown(this.activeNode, shift, shift && key === 'tab');
        }
        if (this.grid.crudService.cell && NAVIGATION_KEYS.has(key)) { return; }

        const position = this.getNextPosition(this.activeNode.row, this.activeNode.column, key, shift, ctrl, event);
        if (NAVIGATION_KEYS.has(key)) {
            event.preventDefault();
            this.navigateInBody(position.rowIndex, position.colIndex, (obj) => { obj.target.activate(event); });
        }
        this.grid.cdr.detectChanges();
    }

    protected getNextPosition(rowIndex: number, colIndex: number, key: string, shift: boolean, ctrl: boolean, event: KeyboardEvent) {
        if (!this.isDataRow(rowIndex, true) && (key.indexOf('down') < 0 || key.indexOf('up') < 0) && ctrl) {
            return { rowIndex, colIndex };
        }
        switch (key) {
            case 'pagedown':
            case 'pageup':
                event.preventDefault();
                key === 'pagedown' ? this.grid.verticalScrollContainer.scrollNextPage() :
                    this.grid.verticalScrollContainer.scrollPrevPage();
                break;
            case 'tab':
                this.handleEditing(shift, event);
                break;
            case 'end':
                rowIndex = ctrl ? this.findLastDataRowIndex() : this.activeNode.row;
                colIndex = this.lastColumnIndex;
                break;
            case 'home':
                rowIndex = ctrl ? this.findFirstDataRowIndex() : this.activeNode.row;
                colIndex = 0;
                break;
            case 'arrowleft':
            case 'left':
                colIndex = ctrl ? 0 : this.activeNode.column - 1;
                break;
            case 'arrowright':
            case 'right':
                colIndex = ctrl ? this.lastColumnIndex : this.activeNode.column + 1;
                break;
            case 'arrowup':
            case 'up':
                if (ctrl && !this.isDataRow(rowIndex)) { break; }
                colIndex = this.activeNode.column !== undefined ? this.activeNode.column : 0;
                rowIndex = ctrl ? this.findFirstDataRowIndex() : this.activeNode.row - 1;
                break;
            case 'arrowdown':
            case 'down':
                if (ctrl && !this.isDataRow(rowIndex)) { break; }
                colIndex = this.activeNode.column !== undefined ? this.activeNode.column : 0;
                rowIndex = ctrl ? this.findLastDataRowIndex() : this.activeNode.row + 1;
                break;
            case 'enter':
            case 'f2':
                const cell = this.grid.getCellByColumnVisibleIndex(this.activeNode.row, this.activeNode.column);
                if (!this.isDataRow(rowIndex) || !cell.editable) { break; }
                this.grid.crudService.enterEditMode(cell);
                break;
            case 'escape':
            case 'esc':
                if (!this.isDataRow(rowIndex)) { break; }
                this.grid.crudService.exitEditMode();
                break;
            case ' ':
            case 'spacebar':
            case 'space':
                const rowObj = this.grid.getRowByIndex(this.activeNode.row);
                if (this.grid.isRowSelectable && this.isDataRow(rowIndex)) {
                    rowObj && rowObj.selected ? this.grid.selectionService.deselectRow(rowObj.rowID, event) :
                        this.grid.selectionService.selectRowById(rowObj.rowID, false, event);
                }
                break;
            default:
                return;
        }
        return { rowIndex, colIndex };
    }

    summaryNav(event: KeyboardEvent) {
        this.horizontalNav(event, event.key.toLowerCase(), this.grid.dataView.length);
    }

    headerNavigation(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (!HEADER_KEYS.has(key)) { return; }
        event.preventDefault();

        const column = this.currentActiveColumn;
        const ctrl = event.ctrlKey;
        const shift = event.shiftKey;
        const alt = event.altKey;
        let direction =  this.grid.sortingExpressions.find(expr => expr.fieldName === column.field)?.dir;

        if (ctrl && key.includes('up') && column.sortable && !column.columnGroup) {
            direction = direction === SortingDirection.Asc ? SortingDirection.None : SortingDirection.Asc;
            this.grid.sort({ fieldName:  column.field, dir: direction, ignoreCase: false });
            return;
        }
        if (ctrl && key.includes('down') && column.sortable && !column.columnGroup) {
            direction = direction === SortingDirection.Desc ? SortingDirection.None : SortingDirection.Desc;
            this.grid.sort({ fieldName:  column.field, dir: direction, ignoreCase: false });
            return;
        }
        if (shift && alt && this.isToggleKey(key) && !column.columnGroup && column.groupable) {
            direction = direction ? SortingDirection.Desc : SortingDirection.Asc;
            key.includes('right') ? (this.grid as any).groupBy({ fieldName: column.field, dir: direction, ignoreCase: false }) :
                (this.grid as any).clearGrouping(column.field);
            this.activeNode.column = key.includes('right') && (this.grid as any).hideGroupedColumns &&
                column.visibleIndex === this.lastColumnIndex ? this.lastColumnIndex - 1 : this.activeNode.column;
            return;
        }
        if (alt && (ROW_EXPAND_KEYS.has(key) || ROW_COLLAPSE_KEYS.has(key))) {
            this.handleMCHExpandCollapse(key, column);
            return;
        }
        if ([' ', 'spacebar', 'space'].indexOf(key) !== -1) {
            this.handleColumnSelection(column, event);
        }
        if (alt && key === 'l' && this.grid.allowAdvancedFiltering) {
            this.grid.openAdvancedFilteringDialog();
        }
        if (ctrl && shift && key === 'l' && this.grid.allowFiltering && !column.columnGroup && column.filterable) {
            if (this.grid.filterMode === FilterMode.excelStyleFilter) {
                const headerEl = this.grid.nativeElement.querySelector(`.igx-grid__th--active`);
                this.grid.filteringService.toggleFilterDropdown(headerEl, column, IgxGridExcelStyleFilteringComponent);
            } else {
                this.performHorizontalScrollToCell(column.visibleIndex);
                this.grid.filteringService.filteredColumn = column;
                this.grid.filteringService.isFilterRowVisible = true;
            }
        }
        if (shift || alt || (ctrl && (key.includes('down') || key.includes('down')))) { return; }
        !this.grid.hasColumnGroups ? this.horizontalNav(event, key, -1) : this.handleMCHeaderNav(key, ctrl);
    }

    protected horizontalNav(event: KeyboardEvent, key: string, rowIndex: number) {
        const ctrl = event.ctrlKey;
        if (!HORIZONTAL_NAV_KEYS.has(event.key.toLowerCase())) { return; }
        event.preventDefault();
        this.activeNode.row = rowIndex;
        if (rowIndex > 0) {
            if (this.emitKeyDown(GridKeydownTargetType.summaryCell, this.activeNode.row, event)) {
                return;
            }
        }
        if ((key.includes('left') || key === 'home') && this.activeNode.column > 0) {
            this.activeNode.column = ctrl || key === 'home' ? 0 : this.activeNode.column - 1;
        }
        if ((key.includes('right') || key === 'end') && this.activeNode.column < this.lastColumnIndex) {
            this.activeNode.column = ctrl || key === 'end' ? this.lastColumnIndex : this.activeNode.column + 1;
        }
        this.performHorizontalScrollToCell(this.activeNode.column);
    }

    focusTbody(event) {
        this.activeNode = !this.activeNode ? { row: 0, column: 0 } : this.activeNode;
        if (!(this.activeNode.row < 0 || this.activeNode.row > this.grid.dataView.length - 1)) { return; }
        this.navigateInBody(0, 0, (obj) => {
            this.grid.clearCellSelection();
            obj.target.activate(event);
        });
    }

    focusFirstCell(header = true) {
        if (this.activeNode && (this.activeNode.row === -1 || this.activeNode.row === this.grid.dataView.length)) { return; }
        this.activeNode = { row: header ? -1 : this.grid.dataView.length, column: 0,
                level: this.grid.hasColumnLayouts ? 1 : 0, mchCache: { level: 0, visibleIndex: 0} };
        this.performHorizontalScrollToCell(0);
    }

    get lastColumnIndex() {
        return Math.max(...this.grid.visibleColumns.map(col => col.visibleIndex));
    }
    get displayContainerWidth() {
        return Math.round(this.grid.parentVirtDir.dc.instance._viewContainer.element.nativeElement.offsetWidth);
    }
    get displayContainerScrollLeft() {
        return Math.ceil(this.grid.headerContainer.scrollPosition);
    }
    get containerTopOffset() {
        return parseInt(this.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
    }

    public isColumnFullyVisible(columnIndex: number) {
        if (this.isColumnPinned(columnIndex, this.forOfDir())) {
            return true;
        }
        const index = this.getColumnUnpinnedIndex(columnIndex);
        const width = this.forOfDir().getColumnScrollLeft(index + 1) - this.forOfDir().getColumnScrollLeft(index);
        if (this.displayContainerWidth < width && this.displayContainerScrollLeft === this.forOfDir().getColumnScrollLeft(index)) {
            return true;
        }
        return this.displayContainerWidth >= this.forOfDir().getColumnScrollLeft(index + 1) - this.displayContainerScrollLeft &&
            this.displayContainerScrollLeft <= this.forOfDir().getColumnScrollLeft(index);
    }

    protected getColumnUnpinnedIndex(visibleColumnIndex: number) {
        const column = this.grid.unpinnedColumns.find((col) => !col.columnGroup && col.visibleIndex === visibleColumnIndex);
        return this.grid.pinnedColumns.length ? this.grid.unpinnedColumns.filter((c) => !c.columnGroup).indexOf(column) :
            visibleColumnIndex;
    }

    protected forOfDir(): IgxForOfDirective<any> {
        const forOfDir = this.grid.dataRowList.length > 0 ? this.grid.dataRowList.first.virtDirRow : this.grid.headerContainer;
        return forOfDir as IgxForOfDirective<any>;
    }

    protected handleAlt(key: string, event: KeyboardEvent) {
        event.preventDefault();
        const row = this.grid.getRowByIndex(this.activeNode.row) as any;
        if (!this.isToggleKey(key) || !row) { return; }

        if (!row.expanded && ROW_EXPAND_KEYS.has(key)) {
            row.rowID === undefined ? row.toggle() :
                this.grid.gridAPI.set_row_expansion_state(row.rowID, true, event);
        } else if (row.expanded && ROW_COLLAPSE_KEYS.has(key)) {
            row.rowID === undefined ? row.toggle() :
                this.grid.gridAPI.set_row_expansion_state(row.rowID, false, event);
        }
        this.grid.notifyChanges();
    }

    protected handleEditing(shift: boolean, event: KeyboardEvent) {
        const next = shift ? this.grid.getPreviousCell(this.activeNode.row, this.activeNode.column, col => col.editable) :
            this.grid.getNextCell(this.activeNode.row, this.activeNode.column, col => col.editable);
        if (!this.grid.rowInEditMode && this.isActiveNode(next.rowIndex, next.visibleColumnIndex)) {
            this.grid.endEdit(true);
            return;
        }
        event.preventDefault();
        if ((this.grid.rowInEditMode && this.grid.rowEditTabs.length) &&
            (this.activeNode.row !== next.rowIndex || this.isActiveNode(next.rowIndex, next.visibleColumnIndex))) {
            this.grid.gridAPI.submit_value();
            shift ? this.grid.rowEditTabs.last.element.nativeElement.focus() :
                this.grid.rowEditTabs.first.element.nativeElement.focus();
            return;
        }

        if (this.grid.rowInEditMode && !this.grid.rowEditTabs.length) {
            if (shift && next.rowIndex === this.activeNode.row && next.visibleColumnIndex === this.activeNode.column) {
                next.visibleColumnIndex = this.grid.lastEditableColumnIndex;
            } else if ( !shift && next.rowIndex === this.activeNode.row && next.visibleColumnIndex === this.activeNode.column) {
                next.visibleColumnIndex = this.grid.firstEditableColumnIndex;
            } else {
                next.rowIndex = this.activeNode.row;
            }
        }

        this.navigateInBody(next.rowIndex, next.visibleColumnIndex, (obj) => {
            obj.target.activate(event);
            this.grid.cdr.detectChanges();
        });
    }

    public shouldPerformHorizontalScroll(visibleColIndex: number, rowIndex = -1) {
        if (rowIndex < 0 || rowIndex > this.grid.dataView.length - 1) {
            return !this.isColumnFullyVisible(visibleColIndex);
        }
        const row = this.grid.dataView[rowIndex];
        return row.expression || row.detailsData ? false : !this.isColumnFullyVisible(visibleColIndex);
    }

    public shouldPerformVerticalScroll(targetRowIndex: number, visibleColIndex: number): boolean {
        if (this.grid.isRecordPinnedByIndex(targetRowIndex)) { return false; }
        const scrollRowIndex = this.grid.hasPinnedRecords && this.grid.isRowPinningToTop ?
            targetRowIndex - this.grid.pinnedDataView.length : targetRowIndex;
        const targetRow = this.getRowElementByIndex(targetRowIndex);
        const rowHeight = this.grid.verticalScrollContainer.getSizeAt(scrollRowIndex);
        const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
        const endTopOffset = targetRow ? targetRow.offsetTop + rowHeight + this.containerTopOffset : containerHeight + rowHeight;
        return !targetRow || targetRow.offsetTop < Math.abs(this.containerTopOffset)
        || containerHeight && containerHeight < endTopOffset;
    }

    protected navigateInBody(rowIndex, visibleColIndex, cb: Function = null): void {
        if (!this.isValidPosition(rowIndex, visibleColIndex) || this.isActiveNode(rowIndex, visibleColIndex)) { return; }
        this.grid.navigateTo(this.activeNode.row = rowIndex, this.activeNode.column = visibleColIndex, cb);
    }

    public performVerticalScrollToCell(rowIndex: number, visibleColIndex = -1, cb?: () => void) {
        // Only for top pinning we need to subtract pinned count because virtualization indexing doesn't count pinned rows.
        const scrollRowIndex = this.grid.hasPinnedRecords && this.grid.isRowPinningToTop ?
            rowIndex - this.grid.pinnedDataView.length : rowIndex;
        this.grid.verticalScrollContainer.scrollTo(scrollRowIndex);
        this.grid.verticalScrollContainer.onChunkLoad
            .pipe(first()).subscribe(() => {
                if (cb) { cb(); }
            });
    }

    public performHorizontalScrollToCell(visibleColumnIndex: number, cb?: () => void) {
        if (!this.shouldPerformHorizontalScroll(visibleColumnIndex)) { return; }
        this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                if (cb) { cb(); }
            });
        this.forOfDir().scrollTo(this.getColumnUnpinnedIndex(visibleColumnIndex));
    }

    public isDataRow(rowIndex: number, includeSummary = false) {
        if (rowIndex < 0 || rowIndex > this.grid.dataView.length - 1) { return true; }
        const curRow = this.grid.dataView[rowIndex];
        return curRow && !this.grid.isGroupByRecord(curRow) && !this.grid.isDetailRecord(curRow)
            && !curRow.childGridsData && (includeSummary || !curRow.summaries);
    }

    protected emitKeyDown(type: GridKeydownTargetType, rowIndex, event) {
        const row = this.grid.summariesRowList.toArray().concat(this.grid.rowList.toArray()).find(r => r.index === rowIndex);
        if (!row) { return; }

        const target = type === GridKeydownTargetType.groupRow ? row :
            type === GridKeydownTargetType.dataCell ? row.cells?.find(c => c.visibleColumnIndex === this.activeNode.column) :
                row.summaryCells?.find(c => c.visibleColumnIndex === this.activeNode.column);
        const keydownArgs = { targetType: type, event: event, cancel: false, target: target };
        this.grid.onGridKeydown.emit(keydownArgs);
        if (keydownArgs.cancel && type === GridKeydownTargetType.dataCell) {
            this.grid.selectionService.clear();
            this.grid.selectionService.keyboardState.active = true;
            return keydownArgs.cancel;
        }
    }

    protected isColumnPinned(columnIndex: number, forOfDir: IgxForOfDirective<any>): boolean {
        const horizontalScroll = forOfDir.getScroll();
        const column = this.grid.visibleColumns.filter(c => !c.columnGroup).find(c => c.visibleIndex === columnIndex);
        return (!horizontalScroll.clientWidth || (column && column.pinned));
    }

    protected findFirstDataRowIndex(): number {
        return this.grid.dataView.findIndex(rec => !this.grid.isGroupByRecord(rec) && !this.grid.isDetailRecord(rec));
    }

    protected findLastDataRowIndex(): number {
        let i = this.grid.dataView.length;
        while (i--) {
            if (this.isDataRow(i)) {
                return i;
            }
        }
    }

    protected getRowElementByIndex(index) {
        if (this.grid.hasDetails) {
            const detail = this.grid.nativeElement.querySelector(`[detail="true"][data-rowindex="${index}"]`);
            if (detail) { return detail; }
        }
        return this.grid.rowList.toArray().concat(this.grid.summariesRowList.toArray()).find(r => r.index === index)?.nativeElement;
    }

    protected isValidPosition(rowIndex: number, colIndex: number): boolean {
        if (rowIndex < 0 || colIndex < 0 || this.grid.dataView.length - 1 < rowIndex || this.lastColumnIndex < colIndex) {
            return false;
        }
        return this.activeNode.column !== colIndex && !this.isDataRow(rowIndex, true) ? false : true;
    }

    private handleMCHeaderNav(key: string, ctrl: boolean) {
        const activeCol = this.currentActiveColumn;
        const lastGroupIndex = Math.max(... this.grid.visibleColumns.
                filter(c => c.level === this.activeNode.level).map(col => col.visibleIndex));
        let nextCol = activeCol;
        if ((key.includes('left') || key === 'home') && this.activeNode.column > 0) {
            const index = ctrl || key === 'home' ? 0 : this.activeNode.column - 1;
            nextCol =  this.getNextColumnMCH(index);
            this.activeNode.mchCache.visibleIndex = nextCol.visibleIndex;
        }
        if ((key.includes('right') || key === 'end') && activeCol.visibleIndex < lastGroupIndex) {
            const nextVIndex = activeCol.children ? Math.max(...activeCol.allChildren.map(c => c.visibleIndex)) + 1 :
            activeCol.visibleIndex + 1;
            nextCol = ctrl || key === 'end' ? this.getNextColumnMCH(this.lastColumnIndex) : this.getNextColumnMCH(nextVIndex);
            this.activeNode.mchCache.visibleIndex = nextCol.visibleIndex;
        }
        if (key.includes('up') && this.activeNode.level > 0) {
            nextCol = activeCol.parent;
            this.activeNode.mchCache.level = nextCol.level;
        }
        if (key.includes('down') && activeCol.children) {
            nextCol = activeCol.children.find(c => c.visibleIndex === this.activeNode.mchCache.visibleIndex) ||
            activeCol.children.toArray().sort((a, b) => b.visibleIndex - a.visibleIndex)
            .filter(col => col.visibleIndex < this.activeNode.mchCache.visibleIndex)[0];
            this.activeNode.mchCache.level = nextCol.level;
        }
        this.activeNode.column = nextCol.visibleIndex;
        this.activeNode.level = nextCol.level;
        this.performHorizontalScrollToCell(this.activeNode.column);
    }

    private handleMCHExpandCollapse(key, column) {
        if (!column.children || !column.collapsible) { return; }
        if (!column.expanded && ROW_EXPAND_KEYS.has(key)) {
            column.expanded = true;
        } else if (column.expanded && ROW_COLLAPSE_KEYS.has(key)) {
            column.expanded = false;
        }
    }

    private handleColumnSelection(column, event) {
        if (!column.selectable || this.grid.columnSelection === GridSelectionMode.none ) { return; }
        const clearSelection = this.grid.columnSelection === GridSelectionMode.single;
        const columnsToSelect = !column.children ? [column.field] :
            column.allChildren.filter(c => !c.hidden && c.selectable && !c.columnGroup).map(c => c.field);
        column.selected ? this.grid.selectionService.deselectColumns(columnsToSelect, event) :
        this.grid.selectionService.selectColumns(columnsToSelect, clearSelection, false, event);
    }

    private getNextColumnMCH(visibleIndex) {
        let col = this.grid.getColumnByVisibleIndex(visibleIndex);
        let parent = col.parent;
        while (parent && col.level > this.activeNode.mchCache.level) {
            col = col.parent;
            parent = col.parent;
        }
        return col;
    }

    private get currentActiveColumn() {
        return this.grid.visibleColumns.find(c => c.visibleIndex === this.activeNode.column && c.level === this.activeNode.level);
    }

    private isActiveNode(rIndex: number, cIndex: number): boolean {
        return this.activeNode ? this.activeNode.row === rIndex && this.activeNode.column === cIndex : false;
    }

    private isToggleKey(key: string): boolean {
        return ROW_COLLAPSE_KEYS.has(key) || ROW_EXPAND_KEYS.has(key);
    }
}
