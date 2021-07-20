import { TestBed, fakeAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridModule } from './public_api';
import { IgxGridComponent } from './grid.component';
import { IGridCellEventArgs, IActiveNodeChangeEventArgs } from '../common/events';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { setupGridScrollDetection } from '../../test-utils/helper-utils.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    VirtualGridComponent,
    NoScrollsComponent,
    IgxGridGroupByComponent
} from '../../test-utils/grid-samples.spec';

import { GridFunctions, GridSelectionFunctions } from '../../test-utils/grid-functions.spec';
import { DebugElement } from '@angular/core';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { CellType } from '../tree-grid/public_api';

const DEBOUNCETIME = 30;

describe('IgxGrid - Keyboard navigation #grid', () => {

    describe('in not virtualized grid', () => {
        let fix;
        let grid: IgxGridComponent;
        let gridContent: DebugElement;
        configureTestSuite((() => {
            TestBed.configureTestingModule({
                declarations: [
                    NoScrollsComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule],
            });
        }));

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(NoScrollsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fix);
        }));

        it('should move selected cell with arrow keys', () => {
            let selectedCell: CellType;

            grid.selected.subscribe((event: IGridCellEventArgs) => {
                selectedCell = event.cell;
            });

            // Focus and select first cell
            GridFunctions.focusFirstCell(fix, grid);

            UIInteractions.triggerEventHandlerKeyDown('arrowdown', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual(2);
            expect(selectedCell.column.field).toMatch('ID');

            UIInteractions.triggerEventHandlerKeyDown('arrowright', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Gilberto Todd');
            expect(selectedCell.column.field).toMatch('Name');

            UIInteractions.triggerEventHandlerKeyDown('arrowup', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Casey Houston');
            expect(selectedCell.column.field).toMatch('Name');

            UIInteractions.triggerEventHandlerKeyDown('arrowleft', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual(1);
            expect(selectedCell.column.field).toMatch('ID');
        });

        it('should  jump to first/last cell with Ctrl', () => {
            let selectedCell: CellType;
            grid.selected.subscribe((event: IGridCellEventArgs) => {
                selectedCell = event.cell;
            });

            GridFunctions.focusFirstCell(fix, grid);

            UIInteractions.triggerEventHandlerKeyDown('arrowright', gridContent, false, false, true);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Company A');
            expect(selectedCell.column.field).toMatch('Company');

            UIInteractions.triggerEventHandlerKeyDown('arrowleft', gridContent, false, false, true);
            fix.detectChanges();

            expect(selectedCell.value).toEqual(1);
            expect(selectedCell.column.field).toMatch('ID');
        });

        it('should allow vertical keyboard navigation in pinned area.', () => {
            grid.getColumnByName('Name').pinned = true;
            fix.detectChanges();

            let selectedCell;
            grid.selected.subscribe((event: IGridCellEventArgs) => {
                selectedCell = event.cell;
            });
            GridFunctions.focusFirstCell(fix, grid);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('arrowdown', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Gilberto Todd');
            expect(selectedCell.column.field).toMatch('Name');

            UIInteractions.triggerEventHandlerKeyDown('arrowup', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Casey Houston');
            expect(selectedCell.column.field).toMatch('Name');
        });

        it('Should emit when activeNode ref is changed', () => {
            spyOn(grid.activeNodeChange, 'emit').and.callThrough();

            const args: IActiveNodeChangeEventArgs = {
                row: 0,
                column: 0,
                level: 0,
                tag: 'dataCell'
            };

            gridContent.triggerEventHandler('focus', null);
            fix.detectChanges();
            expect(grid.activeNodeChange.emit).toHaveBeenCalledWith(args);

            UIInteractions.triggerEventHandlerKeyDown('arrowright', gridContent);
            fix.detectChanges();
            args.column += 1;
            expect(grid.activeNodeChange.emit).toHaveBeenCalledWith(args);

            UIInteractions.triggerEventHandlerKeyDown('arrowright', gridContent);
            fix.detectChanges();
            args.column += 1;
            expect(grid.activeNodeChange.emit).toHaveBeenCalledWith(args);

            UIInteractions.triggerEventHandlerKeyDown('arrowdown', gridContent);
            fix.detectChanges();
            args.row += 1;
            expect(grid.activeNodeChange.emit).toHaveBeenCalledWith(args);

            UIInteractions.triggerEventHandlerKeyDown('arrowleft', gridContent);
            fix.detectChanges();
            args.column -= 1;
            expect(grid.activeNodeChange.emit).toHaveBeenCalledWith(args);

            expect(grid.activeNodeChange.emit).toHaveBeenCalledTimes(5);
        });


        it('should emit activeNodeChange once when you click over the same element', () => {
            spyOn(grid.activeNodeChange, 'emit').and.callThrough();

            gridContent.triggerEventHandler('focus', null);
            fix.detectChanges();

            const activeNode = grid.navigation.activeNode;
            const cell = grid.gridAPI.get_cell_by_index(activeNode.row, activeNode.column);
            UIInteractions.simulateMouseEvent('mousedown', cell.nativeElement, 0, 0);
            fix.detectChanges();

            expect(grid.activeNodeChange.emit).toHaveBeenCalledTimes(1);
        });

        it('should allow horizontal keyboard navigation between start pinned area and unpinned area.', () => {
            grid.getColumnByName('Name').pinned = true;
            grid.getColumnByName('Company').pinned = true;
            fix.detectChanges();

            let selectedCell;
            grid.selected.subscribe((event: IGridCellEventArgs) => {
                selectedCell = event.cell;
            });
            GridFunctions.focusFirstCell(fix, grid);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('arrowright', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Company A');
            expect(selectedCell.column.field).toMatch('Company');

            UIInteractions.triggerEventHandlerKeyDown('arrowright', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual(1);
            expect(selectedCell.column.field).toMatch('ID');

            UIInteractions.triggerEventHandlerKeyDown('arrowleft', gridContent);
            fix.detectChanges();

            expect(selectedCell.value).toEqual('Company A');
            expect(selectedCell.column.field).toMatch('Company');
        });
    });

    describe('in virtualized grid', () => {
        let fix;
        let grid: IgxGridComponent;
        let gridContent: DebugElement;
        configureTestSuite((() => {
            TestBed.configureTestingModule({
                declarations: [
                    VirtualGridComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule],
            });
        }));

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(VirtualGridComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            setupGridScrollDetection(fix, grid);
            fix.detectChanges();
            gridContent = GridFunctions.getGridContent(fix);
        }));

        it('should focus the first cell when focus the grid body', async () => {
            GridFunctions.getGridHeader(grid).nativeElement.focus();
            fix.detectChanges();
            const cols = [];
            for (let i = 0; i < 10; i++) {
                cols.push({ field: 'col' + i });
            }
            fix.componentInstance.columns = cols;
            fix.componentInstance.data = fix.componentInstance.generateData(100);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            grid.headerContainer.getScroll().scrollLeft = 1000;
            await wait(100);
            fix.detectChanges();

            grid.verticalScrollContainer.getScroll().scrollTop = 200;
            await wait(100);
            fix.detectChanges();

            gridContent.triggerEventHandler('focus', null);
            await wait(200);
            fix.detectChanges();

            const cell = grid.gridAPI.get_cell_by_index(4, 'col5');
            expect(cell).toBeDefined();
            GridSelectionFunctions.verifyCellActive(cell);
            GridSelectionFunctions.verifyCellSelected(cell);
        });

        it('should allow navigating down', async () => {
            GridFunctions.focusFirstCell(fix, grid);
            await wait();
            fix.detectChanges();

            // Navigate to the 10th row
            for (let index = 0; index < 10; index++) {
                UIInteractions.triggerEventHandlerKeyDown('arrowdown', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }
            expect(fix.componentInstance.selectedCell.row.index).toEqual(10);
        });

        it('should allow navigating up', async () => {
            grid.verticalScrollContainer.scrollTo(104);
            await wait();
            fix.detectChanges();

            const cell = grid.gridAPI.get_cell_by_index(100, 'value');
            UIInteractions.simulateClickAndSelectEvent(cell);
            await wait();
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.row.index).toEqual(100);
            // Navigate to the 94th row
            for (let index = 0; index < 10; index++) {
                UIInteractions.triggerEventHandlerKeyDown('arrowup', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }
            expect(fix.componentInstance.selectedCell.row.index).toEqual(90);
        });

        it('should allow horizontal navigation', async () => {
            const cols = [];
            for (let i = 0; i < 10; i++) {
                cols.push({ field: 'col' + i });
            }
            fix.componentInstance.columns = cols;
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            GridFunctions.focusFirstCell(fix, grid);
            await wait();
            fix.detectChanges();

            for (let index = 0; index < 9; index++) {
                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            expect(fix.componentInstance.selectedCell.column.index).toEqual(9);

            for (let index = 9; index > 1; index--) {
                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }
            expect(fix.componentInstance.selectedCell.column.index).toEqual(1);
        });

        it('should allow horizontal navigation in virtualized grid with pinned cols.', async () => {
            const cols = [];
            for (let i = 0; i < 10; i++) {
                cols.push({ field: 'col' + i });
            }
            fix.componentInstance.columns = cols;
            fix.detectChanges();
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            fix.detectChanges();

            grid.pinColumn('col1');
            grid.pinColumn('col3');
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            GridFunctions.focusFirstCell(fix, grid);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            for (let index = 0; index < 9; index++) {
                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            expect(fix.componentInstance.selectedCell.column.visibleIndex).toEqual(9);
            // Verify columns
            let cells = grid.gridAPI.get_row_by_index(0).cells.toArray();
            expect(cells.length).toEqual(5);
            expect(cells[0].column.field).toEqual('col1');
            expect(cells[1].column.field).toEqual('col3');
            expect(cells[3].column.field).toEqual('col8');
            expect(cells[4].column.field).toEqual('col9');

            for (let index = 9; index > 1; index--) {
                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }
            expect(fix.componentInstance.selectedCell.column.visibleIndex).toEqual(1);

            cells = grid.gridAPI.get_row_by_index(0).cells.toArray();
            expect(cells.length).toEqual(5);
            expect(cells[0].column.field).toEqual('col1');
            expect(cells[1].column.field).toEqual('col3');
            expect(cells[2].column.field).toEqual('col0');
            expect(cells[3].column.field).toEqual('col2');
        });

        it('should scroll into view the not fully visible cells when navigating down', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(100);
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            fix.detectChanges();

            const rows = GridFunctions.getRows(fix);
            const cell = grid.gridAPI.get_cell_by_index(3, '1');
            const bottomRowHeight = rows[4].nativeElement.offsetHeight;
            const displayContainer = GridFunctions.getGridDisplayContainer(fix).nativeElement;
            const bottomCellVisibleHeight = displayContainer.parentElement.offsetHeight % bottomRowHeight;
            UIInteractions.simulateClickAndSelectEvent(cell);
            await wait();
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(30);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
            UIInteractions.triggerEventHandlerKeyDown('arrowdown', gridContent);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(parseInt(displayContainer.style.top, 10)).toBeLessThanOrEqual(-1 * (grid.rowHeight - bottomCellVisibleHeight));
            expect(displayContainer.parentElement.scrollTop).toEqual(0);
            expect(fix.componentInstance.selectedCell.value).toEqual(40);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
        });

        it('should scroll into view the not fully visible cells when navigating up', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(100);
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            fix.detectChanges();

            const displayContainer = GridFunctions.getGridDisplayContainer(fix).nativeElement;
            fix.componentInstance.scrollTop(25);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(displayContainer.style.top).toEqual('-25px');
            const cell = grid.gridAPI.get_cell_by_index(1, '1');
            UIInteractions.simulateClickAndSelectEvent(cell);
            await wait();
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(10);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');

            UIInteractions.triggerEventHandlerKeyDown('arrowup', gridContent);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            fix.detectChanges();
            expect(displayContainer.style.top).toEqual('0px');
            expect(fix.componentInstance.selectedCell.value).toEqual(0);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
        });

        it('should allow navigating first/last cell in column with down/up and Ctrl key.', async () => {
            let cell = grid.gridAPI.get_cell_by_index(1, 'value');
            UIInteractions.simulateClickAndSelectEvent(cell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', cell.nativeElement, true, false, false, true);
            await wait(100);
            fix.detectChanges();


            let cell2 = grid.getCellByColumn(999, 'value');
            GridSelectionFunctions.verifyGridCellSelected(fix, cell2);

            cell = grid.gridAPI.get_cell_by_index(998, 'other');
            UIInteractions.simulateClickAndSelectEvent(cell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('arrowup', cell.nativeElement, true, false, false, true);
            await wait(100);
            fix.detectChanges();

            cell2 = grid.getCellByColumn(0, 'other');
            GridSelectionFunctions.verifyGridCellSelected(fix, cell2);
        });

        it('should allow navigating first/last cell in column with home/end and Cntr key.', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(50);
            fix.componentInstance.data = fix.componentInstance.generateData(500);
            fix.detectChanges();

            grid.verticalScrollContainer.addScrollTop(5000);
            await wait(100);
            fix.detectChanges();

            let cell = grid.gridAPI.get_cell_by_index(101, '2');
            UIInteractions.simulateClickAndSelectEvent(cell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('home', cell.nativeElement, true, false, false, true);
            await wait(150);
            fix.detectChanges();

            let cell2 = grid.getCellByColumn(0, '0');
            GridSelectionFunctions.verifyGridCellSelected(fix, cell2);
            expect(grid.verticalScrollContainer.getScroll().scrollTop).toEqual(0);

            cell = grid.gridAPI.get_cell_by_index(4, '2');
            UIInteractions.simulateClickAndSelectEvent(cell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('end', cell.nativeElement, true, false, false, true);
            await wait(200);
            fix.detectChanges();

            cell2 = grid.getCellByColumn(499, '49');
            GridSelectionFunctions.verifyGridCellSelected(fix, cell2);
        });

        it('should scroll into view the not fully visible cells when navigating left', async () => {
            grid.tbody.nativeElement.focus();
            fix.detectChanges();

            fix.componentInstance.columns = fix.componentInstance.generateCols(100);
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            fix.detectChanges();

            const rowDisplayContainer = GridFunctions.getRowDisplayContainer(fix, 1).nativeElement;
            fix.componentInstance.scrollLeft(50);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(rowDisplayContainer.style.left).toEqual('-50px');
            const curCell = grid.gridAPI.get_cell_by_index(1, '1');
            UIInteractions.simulateClickAndSelectEvent(curCell);
            await wait();
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(10);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
            UIInteractions.triggerKeyDownEvtUponElem('arrowleft', grid.tbody.nativeElement, true);
            await wait(DEBOUNCETIME);

            fix.detectChanges();
            expect(rowDisplayContainer.style.left).toEqual('0px');
            expect(fix.componentInstance.selectedCell.value).toEqual(0);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('0');
        });

        it('should scroll into view the not fully visible cells when navigating right', async () => {
            grid.tbody.nativeElement.focus();
            fix.detectChanges();

            fix.componentInstance.columns = fix.componentInstance.generateCols(100);
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            fix.detectChanges();

            const rowDisplayContainer = GridFunctions.getRowDisplayContainer(fix, 1).nativeElement;
            expect(rowDisplayContainer.style.left).toEqual('0px');
            const curCell = grid.gridAPI.get_cell_by_index(1, '2');
            UIInteractions.simulateClickAndSelectEvent(curCell);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(20);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('2');

            UIInteractions.triggerKeyDownEvtUponElem('arrowright', grid.tbody.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(30);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('3');
            expect(parseInt(rowDisplayContainer.style.left, 10)).toBeLessThanOrEqual(-40);
        });

        it('should scroll first row into view when pressing arrow up', (async () => {
            grid.reflow();
            fix.componentInstance.scrollTop(25);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            let scrollContainer = grid.verticalScrollContainer.dc.instance._viewContainer;
            let scrollContainerOffset = scrollContainer.element.nativeElement.offsetTop;
            expect(scrollContainerOffset).toEqual(-25);

            const cell = grid.gridAPI.get_cell_by_index(1, 'value');
            UIInteractions.simulateClickAndSelectEvent(cell);
            await wait();
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(10);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('value');
            UIInteractions.triggerEventHandlerKeyDown('arrowup', gridContent);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            scrollContainer = grid.verticalScrollContainer.dc.instance._viewContainer;
            scrollContainerOffset = scrollContainer.element.nativeElement.offsetTop;

            expect(scrollContainerOffset).toEqual(0);
            expect(fix.componentInstance.selectedCell.value).toEqual(0);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('value');
        }));

        it('should allow pageup/pagedown navigation when the grid is focused', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(25);
            fix.componentInstance.data = fix.componentInstance.generateData(25);
            fix.detectChanges();

            GridFunctions.focusFirstCell(fix, grid);
            await wait();
            fix.detectChanges();

            // testing the pagedown key
            UIInteractions.triggerEventHandlerKeyDown('PageDown', gridContent);
            grid.cdr.detectChanges();
            await wait();

            let currScrollTop = grid.verticalScrollContainer.getScroll().scrollTop;
            expect(currScrollTop).toEqual(grid.verticalScrollContainer.igxForContainerSize);

            // testing the pageup key
            UIInteractions.triggerEventHandlerKeyDown('PageUp', gridContent);
            grid.cdr.detectChanges();
            await wait();
            currScrollTop = grid.headerContainer.getScroll().scrollTop;
            expect(currScrollTop).toEqual(0);
        });

        it('Custom KB navigation: should be able to scroll to a random cell in the grid', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(25);
            fix.componentInstance.data = fix.componentInstance.generateData(25);
            fix.detectChanges();

            GridFunctions.focusFirstCell(fix, grid);

            grid.navigateTo(15, 1, (args) => {
                args.target.activate(null);
            });
            fix.detectChanges();
            await wait(200);
            fix.detectChanges();

            const target = grid.gridAPI.get_cell_by_index(15, '1');
            expect(target).toBeDefined();
            GridSelectionFunctions.verifyCellSelected(target);
            GridSelectionFunctions.verifyCellActive(target);
        });

        it('Custom KB navigation: should be able to scroll horizontally and vertically to a cell in the grid', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(100);
            fix.componentInstance.data = fix.componentInstance.generateData(100);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            GridFunctions.focusFirstCell(fix, grid);

            grid.navigateTo(50, 50, (args) => {
 args.target.activate(null);
});
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const target = grid.gridAPI.get_cell_by_index(50, '50');
            expect(target).toBeDefined();
            GridSelectionFunctions.verifyCellSelected(target);
            GridSelectionFunctions.verifyCellActive(target);
        });

        it('Custom KB navigation: gridKeydown should be emitted', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(25);
            fix.componentInstance.data = fix.componentInstance.generateData(25);
            fix.detectChanges();
            const gridKeydown = spyOn<any>(grid.gridKeydown, 'emit').and.callThrough();

            const cell = grid.gridAPI.get_cell_by_index(1, '2');
            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('arrowup', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(gridKeydown).toHaveBeenCalledTimes(1);
            expect(gridKeydown).toHaveBeenCalledWith({
                targetType: 'dataCell', target: cell, cancel: false, event: new KeyboardEvent('keydown')
            });
        });
    });

    describe('Group By navigation ', () => {
        configureTestSuite((() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxGridGroupByComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule],
            });
        }));

        let fix;
        let grid: IgxGridComponent;
        let gridContent;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxGridGroupByComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fix);
            setupGridScrollDetection(fix, grid);
            fix.detectChanges();
        }));

        it('should focus the first cell when focus the grid body and there is a grouped column', async () => {
            GridFunctions.getGridHeader(grid).nativeElement.focus();
            fix.detectChanges();
            grid.columnWidth = '200px';
            await wait();
            fix.detectChanges();

            grid.headerContainer.getScroll().scrollLeft = 1000;
            await wait(100);
            fix.detectChanges();

            grid.verticalScrollContainer.getScroll().scrollTop = 200;
            await wait(100);
            fix.detectChanges();

            gridContent.triggerEventHandler('focus', null);
            await wait(200);
            fix.detectChanges();

            expect(grid.verticalScrollContainer.getScroll().scrollTop).toBeGreaterThanOrEqual(100);
        });

        it('should toggle expand/collapse state of group row with ArrowRight/ArrowLeft key.', () => {
            const gRow = grid.groupsRowList.toArray()[0];
            const gRowElement = GridFunctions.getGroupedRows(fix)[0];
            gRowElement.triggerEventHandler('pointerdown', {});
            fix.detectChanges();
            expect(gRow.expanded).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('arrowleft', gridContent, true);
            fix.detectChanges();

            expect(gRow.expanded).toBe(false);

            UIInteractions.triggerEventHandlerKeyDown('arrowright', gridContent, true);
            fix.detectChanges();
            expect(gRow.expanded).toBe(true);
        });

        it('should toggle expand/collapse state of group row with ArrowUp/ArrowDown key.', () => {
            const gRow = grid.groupsRowList.toArray()[0];
            const gRowElement = GridFunctions.getGroupedRows(fix)[0];
            gRowElement.triggerEventHandler('pointerdown', {});
            fix.detectChanges();

            expect(gRow.expanded).toBe(true);
            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent, true);
            fix.detectChanges();

            expect(gRow.expanded).toBe(false);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent, true);
            fix.detectChanges();
            expect(gRow.expanded).toBe(true);
        });

        it(`focus should stay over the group row when expanding/collapsing
        with keyboard and the grid is scrolled to the bottom`, (async () => {

            grid.verticalScrollContainer.scrollTo(grid.dataView.length - 1);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            let groupedRowsCount = grid.groupsRowList.length;
            let groupRow = grid.groupsRowList.toArray()[groupedRowsCount - 1];
            const groupRowElement = GridFunctions.getGroupedRows(fix)[groupedRowsCount - 1];
            groupRowElement.triggerEventHandler('pointerdown', null);
            fix.detectChanges();

            GridFunctions.verifyGroupRowIsFocused(groupRow);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            groupedRowsCount = grid.groupsRowList.length;
            groupRow = grid.groupsRowList.toArray()[groupedRowsCount - 1];
            expect(groupRow.index).toEqual(11);
            expect(groupRow.expanded).toBeFalsy();
            GridFunctions.verifyGroupRowIsFocused(groupRow);
        }));

        it(`should be able to navigate down to the next row when expand the last group row
    and grid is scrolled to bottom`, (async () => {
            grid.verticalScrollContainer.scrollTo(grid.dataView.length - 1);
            await wait(100);
            fix.detectChanges();

            grid.groupsRowList.last.toggle();
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(grid.groupsRowList.last.expanded).toBeFalsy();

            grid.groupsRowList.last.toggle();
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(grid.groupsRowList.last.expanded).toBeTruthy();

            const groupRowIndex = grid.groupsRowList.last.index;
            grid.groupsRowList.last.nativeElement.dispatchEvent(new Event('pointerdown'));
            await wait();
            fix.detectChanges();
            UIInteractions.triggerEventHandlerKeyDown('arrowDown', gridContent);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const cell = grid.gridAPI.get_cell_by_index(groupRowIndex + 1, 'Downloads');
            GridSelectionFunctions.verifyCellSelected(cell);
        }));

        it('should allow keyboard navigation through group rows.', (async () => {
            fix.componentInstance.width = '400px';
            fix.componentInstance.height = '300px';
            await wait();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'Released', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            await wait();
            fix.detectChanges();

            let row = grid.gridAPI.get_row_by_index(1);
            row.nativeElement.dispatchEvent(new Event('pointerdown'));
            await wait();
            fix.detectChanges();

            for (let index = 1; index < 9; index++) {
                UIInteractions.triggerEventHandlerKeyDown('arrowDown', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }
            row = grid.gridAPI.get_row_by_index(9);
            expect(row.cells.toArray()[0].selected).toBe(true);

            for (let index = 9; index > 1; index--) {
                UIInteractions.triggerEventHandlerKeyDown('arrowUp', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            row = grid.gridAPI.get_row_by_index(1);
            expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
            GridFunctions.verifyGroupRowIsFocused(row);

            row = grid.gridAPI.get_row_by_index(2);
            expect(row.cells.toArray()[0].selected).toBe(true);
        }));

        it('should persist last selected cell column index when navigate through group rows.', async () => {
            fix.componentInstance.width = '400px';
            fix.componentInstance.height = '300px';
            grid.columnWidth = '200px';
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            grid.groupBy({
                fieldName: 'Released', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();

            grid.headerContainer.getScroll().scrollLeft = 1000;
            await wait(DEBOUNCETIME);

            const cell = grid.gridAPI.get_cell_by_index(2, 'Released');
            UIInteractions.simulateClickAndSelectEvent(cell);
            await wait();
            fix.detectChanges();
            let row;
            for (let index = 2; index < 9; index++) {
                row = grid.gridAPI.get_row_by_index(index);

                if (!(row instanceof IgxGridGroupByRowComponent)) {
                    const selectedCell = grid.selectedCells[0];
                    expect(selectedCell.row.index).toEqual(index);
                    expect(selectedCell.column.field).toEqual('Released');
                }
                UIInteractions.triggerEventHandlerKeyDown('arrowDown', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }
            let cell2 = grid.getCellByColumn(9, 'Released');
            expect(cell2.selected).toBe(true);

            for (let index = 9; index > 1; index--) {
                row = grid.gridAPI.get_row_by_index(index);
                if (!(row instanceof IgxGridGroupByRowComponent)) {
                    const selectedCell = grid.selectedCells[0];
                    expect(selectedCell.row.index).toEqual(index);
                    expect(selectedCell.column.field).toEqual('Released');
                }
                UIInteractions.triggerEventHandlerKeyDown('arrowUp', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            row = grid.gridAPI.get_row_by_index(1);
            expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
            expect(row.focused).toBe(true);

            cell2 = grid.getCellByColumn(2, 'Released');
            expect(cell2.selected).toBe(true);
        });

        it('should focus grouped row when press arrow keys up or down', (async () => {
            grid.tbody.nativeElement.focus();
            fix.detectChanges();

            let cell = grid.gridAPI.get_cell_by_index(1, 'ID');
            UIInteractions.simulateClickAndSelectEvent(cell);
            await wait();
            fix.detectChanges();

            expect(cell.selected).toBe(true);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', grid.tbody.nativeElement, true);
            await wait();
            fix.detectChanges();

            let groupRow = grid.groupsRowList.toArray()[0];
            cell = grid.gridAPI.get_cell_by_index(1, 'ID');
            GridFunctions.verifyGroupRowIsFocused(groupRow);

            cell = grid.gridAPI.get_cell_by_index(2, 'ProductName');
            UIInteractions.simulateClickAndSelectEvent(cell);
            await wait();
            fix.detectChanges();

            expect(cell.active).toBe(true);
            expect(cell.selected).toBe(true);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', grid.tbody.nativeElement, true);
            await wait();
            fix.detectChanges();

            groupRow = grid.groupsRowList.toArray()[1];
            GridFunctions.verifyGroupRowIsFocused(groupRow);
            expect(cell.selected).toBe(true);
        }));

        it('should keep selected cell when expand/collapse grouped row ', (async () => {
            grid.tbody.nativeElement.focus();
            fix.detectChanges();

            const cell = grid.gridAPI.get_cell_by_index(2, 'Released');
            UIInteractions.simulateClickAndSelectEvent(cell);
            await wait();
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', grid.tbody.nativeElement, true);
            await wait();
            fix.detectChanges();

            const groupRow = grid.groupsRowList.toArray()[1];
            GridFunctions.verifyGroupRowIsFocused(groupRow);
            expect(cell.selected).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', groupRow.nativeElement, true, true);
            await wait();
            fix.detectChanges();

            expect(cell.selected).toBe(true);
            expect(groupRow.expanded).toBe(false);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', groupRow.nativeElement, true, true);
            await wait();
            fix.detectChanges();

            expect(cell.selected).toBe(true);
            expect(groupRow.expanded).toBe(true);
        }));

        it('Custom KB navigation:  should be able to scroll to a random row and pass a cb', async () => {
            fix.componentInstance.width = '600px';
            fix.componentInstance.height = '500px';
            grid.columnWidth = '200px';
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            grid.navigateTo(9, -1, (args) => {
 args.target.nativeElement.dispatchEvent(new Event('pointerdown'));
});
            await wait(100);
            fix.detectChanges();
            await wait(100);
            fix.detectChanges();

            const target = grid.rowList.find(r => r.index === 9);
            expect(target).toBeDefined();
            GridFunctions.verifyGroupRowIsFocused(target);
        });

        it('Custom KB navigation: gridKeydown should be emitted for ', async () => {
            fix.componentInstance.width = '600px';
            fix.componentInstance.height = '500px';
            grid.columnWidth = '200px';
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const rowEl = grid.rowList.find(r => r.index === 0);
            UIInteractions.simulateClickAndSelectEvent(rowEl);
            fix.detectChanges();

            const gridKeydown = spyOn<any>(grid.gridKeydown, 'emit').and.callThrough();
            UIInteractions.triggerKeyDownEvtUponElem('Enter', rowEl.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(gridKeydown).toHaveBeenCalledTimes(1);
            expect(gridKeydown).toHaveBeenCalledWith({
                targetType: 'groupRow', target: rowEl, cancel: false, event: new KeyboardEvent('keydown')
            });

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', rowEl.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(gridKeydown).toHaveBeenCalledTimes(2);
            expect(gridKeydown).toHaveBeenCalledWith({
                targetType: 'groupRow', target: rowEl, cancel: false, event: new KeyboardEvent('keydown')
            });
        });
    });
});
