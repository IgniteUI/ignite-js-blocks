import { Component, ViewChild, TemplateRef } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    IgxColumnComponent,
    IgxGridCellComponent,
    IgxGridModule,
    IgxGridRowComponent,
    IgxGridGroupByRowComponent,
} from './index';
import { IgxGridComponent } from './grid.component';
import { DataParent } from '../../test-utils/sample-test-data.spec';
import { IGridCellEventArgs } from '../common/events';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { HelperUtils, setupGridScrollDetection } from '../../test-utils/helper-utils.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    PinOnInitAndSelectionComponent, PinningComponent,
    VirtualGridComponent, ScrollsComponent,
    GridWithPrimaryKeyComponent, SelectionComponent
} from '../../test-utils/grid-samples.spec';
import { GridSelectionMode } from '../common/enums';
import { GridFunctions } from '../../test-utils/grid-functions.spec';

const DEBOUNCETIME = 30;
const CELL_CSS_CLASS = '.igx-grid__td';

describe('IgxGrid - Keyboard navigation #grid', () => {
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultGridComponent,
                CtrlKeyKeyboardNagivationComponent,
                VirtualGridComponent,
                GridWithPrimaryKeyComponent,
                DefaultGroupBYGridComponent,
                ScrollsComponent,
                SelectionComponent,
                PinOnInitAndSelectionComponent,
                PinningComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule]
        }).compileComponents();
    }));

    it('should move selected cell with arrow keys', (async () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        let topLeft;
        let topRight;
        let bottomLeft;
        let bottomRight;
        [topLeft, topRight, bottomLeft, bottomRight] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

        topLeft.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('index');

        UIInteractions.triggerKeyDownWithBlur('arrowdown', topLeft.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(2);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('index');

        UIInteractions.triggerKeyDownWithBlur('arrowright', bottomLeft.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(2);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('value');

        UIInteractions.triggerKeyDownWithBlur('arrowup', bottomRight.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('value');

        UIInteractions.triggerKeyDownWithBlur('arrowleft', topRight.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('index');
    }));

    it('should  jump to first/last cell with Ctrl', (async () => {
        const fix = TestBed.createComponent(CtrlKeyKeyboardNagivationComponent);
        fix.detectChanges();

        const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const rv2 = fix.debugElement.query(By.css(`${CELL_CSS_CLASS}:last-child`));

        rv.nativeElement.dispatchEvent(new Event('focus'));
        await wait();
        fix.detectChanges();

        UIInteractions.triggerKeyDownWithBlur('arrowright', rv.nativeElement, true, false, false, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('another');

        UIInteractions.triggerKeyDownWithBlur('arrowleft', rv2.nativeElement, true, false, false, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual(1);
        expect(fix.componentInstance.selectedCell.column.field).toMatch('index');
    }));

    it('Should properly blur the focused cell when scroll with mouse wheeel', (async () => {
        pending('This scenario need to be tested manually');
        const fix = TestBed.createComponent(ScrollsComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        const firstCell = grid.rowList.first.cells.toArray()[0];

        firstCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(firstCell.selected).toBeTruthy();
        expect(firstCell.focused).toBeTruthy();

        const displayContainer = grid.nativeElement.querySelector('.igx-grid__tbody >.igx-display-container');
        const event = new WheelEvent('wheel', { deltaX: 0, deltaY: 500 });
        displayContainer.dispatchEvent(event);
        await wait(300);

        expect(firstCell.selected).toBeFalsy();
        expect(firstCell.focused).toBeFalsy();
    }));

    it('Should properly handle TAB / SHIFT + TAB on row selectors', (async () => {
        const fix = TestBed.createComponent(ScrollsComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        setupGridScrollDetection(fix, grid);

        const firstRow = grid.getRowByIndex(0);
        const firstRowCheckbox: HTMLElement = firstRow.nativeElement.querySelector('.igx-checkbox');
        const secondRow = grid.getRowByIndex(1);
        const secondRowCheckbox: HTMLElement = secondRow.nativeElement.querySelector('.igx-checkbox');
        let cell = grid.getCellByColumn(1, 'ID');

        cell.nativeElement.dispatchEvent(new Event('focus'));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(cell.selected).toBeTruthy();
        UIInteractions.triggerKeyDownEvtUponElem('space', cell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(cell.selected).toBeTruthy();
        expect(secondRow.selected).toBeTruthy();
        expect(secondRowCheckbox.classList.contains('igx-checkbox--checked')).toBeTruthy();

        UIInteractions.triggerKeyDownEvtUponElem('space', cell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(cell.selected).toBeTruthy();
        expect(secondRow.selected).toBeFalsy();
        expect(secondRowCheckbox.classList.contains('igx-checkbox--checked')).toBeFalsy();

        cell = grid.getCellByColumn(1, 'ID');
        UIInteractions.triggerKeyDownWithBlur('tab', cell.nativeElement, true, false, true);
        await wait(100);
        fix.detectChanges();
        expect(secondRowCheckbox.classList.contains('igx-checkbox--focused')).toBeFalsy();

        cell = grid.getCellByColumn(0, 'Column 15');
        expect(cell.selected).toBeTruthy();
        expect(cell.focused).toBeTruthy();
        expect(secondRowCheckbox.classList.contains('igx-checkbox--focused')).toBeFalsy();

        UIInteractions.triggerKeyDownEvtUponElem('space', cell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(firstRow.selected).toBeTruthy();
        expect(firstRowCheckbox.classList.contains('igx-checkbox--checked')).toBeTruthy();

        UIInteractions.triggerKeyDownEvtUponElem('space', cell.nativeElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(cell.selected).toBeTruthy();
        expect(firstRow.selected).toBeFalsy();
        expect(firstRowCheckbox.classList.contains('igx-checkbox--checked')).toBeFalsy();

        UIInteractions.triggerKeyDownWithBlur('tab', cell.nativeElement, true);
        await wait(100);
        fix.detectChanges();
        expect(secondRowCheckbox.classList.contains('igx-checkbox--focused')).toBeFalsy();

        cell = grid.getCellByColumn(1, 'ID');
        expect(cell.selected).toBeTruthy();
        expect(cell.focused).toBeTruthy();
        expect(secondRowCheckbox.classList.contains('igx-checkbox--focused')).toBeFalsy();
    }));

    it('Should properly handle TAB / SHIFT + TAB on edge cell, triggering virt scroll', (async () => {
        const fix = TestBed.createComponent(ScrollsComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        const virtualizationSpy = spyOn<any>(grid.parentVirtDir.onChunkLoad, 'emit').and.callThrough();
        // Focus left right cell
        const gridFirstRow = grid.rowList.first;
        const cellsLength = grid.rowList.first.cells.length;
        const mockEvent = jasmine.createSpyObj('mockEvt', ['preventDefault', 'stopPropagation']);

        // Focus last right cell
        const lastVisibleCell = gridFirstRow.cells.toArray()[cellsLength - 3];

        lastVisibleCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait(30);
        fix.detectChanges();

        expect(lastVisibleCell.selected).toBeTruthy();
        UIInteractions.triggerKeyDownWithBlur('tab', lastVisibleCell.nativeElement, true);
        await wait(30);
        fix.detectChanges();
        expect(virtualizationSpy).toHaveBeenCalledTimes(1);

        const targetCell = gridFirstRow.cells.toArray()[cellsLength - 3];
        targetCell.nativeElement.dispatchEvent(new Event('focus'));
        await wait(30);
        fix.detectChanges();

        expect(targetCell.selected).toBeTruthy();

        // Focus second last right cell, TAB will NOT trigger virtualization;
        UIInteractions.triggerKeyDownWithBlur('tab', targetCell.nativeElement, true);
        await wait(30);
        fix.detectChanges();

        expect(virtualizationSpy).toHaveBeenCalledTimes(1);
        expect(lastVisibleCell.selected).toBeTruthy();

        // Focus leftmost cell, SHIFT + TAB will NOT trigger virtualization
        gridFirstRow.cells.first.nativeElement.dispatchEvent(new Event('focus'));
        await wait(30);
        fix.detectChanges();

        expect(gridFirstRow.cells.first.selected).toBeTruthy();
        UIInteractions.triggerKeyDownWithBlur('tab', gridFirstRow.cells.first.nativeElement, true, false, true);
        await wait(30);
        fix.detectChanges();

        // There are not cells prior to the first cell - no scrolling will be done, spy will not be called;
        expect(virtualizationSpy).toHaveBeenCalledTimes(1);
    }));

    it('Should handle keydown events on cells properly even when primaryKey is specified', (async () => {
        const fix = TestBed.createComponent(GridWithPrimaryKeyComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        expect(grid.primaryKey).toBeTruthy();
        expect(grid.rowList.length).toEqual(10, 'All 10 rows should initialized');

        const targetCell = grid.getCellByKey(2, 'Name');
        const targetCellElement: HTMLElement = grid.getCellByKey(2, 'Name').nativeElement;
        spyOn(grid.getCellByKey(2, 'Name'), 'onFocus').and.callThrough();
        expect(targetCell.focused).toEqual(false);

        targetCellElement.dispatchEvent(new FocusEvent('focus'));
        await wait(DEBOUNCETIME);

        spyOn(grid.getCellByKey(3, 'Name'), 'onFocus').and.callThrough();
        fix.detectChanges();

        expect(targetCell.onFocus).toHaveBeenCalledTimes(1);
        expect(targetCell.focused).toEqual(true);

        UIInteractions.triggerKeyDownWithBlur('arrowdown', targetCellElement, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(grid.getCellByKey(3, 'Name').onFocus).toHaveBeenCalledTimes(1);
        expect(grid.getCellByKey(3, 'Name').focused).toEqual(true);
        expect(targetCell.focused).toEqual(false);
        expect(grid.selectedCells.length).toEqual(1);
        expect(grid.selectedCells[0].row.rowData[grid.primaryKey]).toEqual(3);
    }));

    it('Should properly move focus when loading new row chunk', (async () => {
        const fix = TestBed.createComponent(SelectionComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        const lastRowIndex = grid.rowList.length - 2;
        let targetCell = grid.getCellByColumn(lastRowIndex, 'Column1');
        const initialValue = targetCell.value;
        const targetCellElement: HTMLElement = targetCell.nativeElement;
        spyOn(targetCell, 'onFocus').and.callThrough();
        expect(targetCell.focused).toEqual(false);
        targetCellElement.focus();
        spyOn(targetCell.gridAPI, 'get_cell_by_visible_index').and.callThrough();
        fix.detectChanges();
        targetCell = grid.getCellByColumn(lastRowIndex, 'Column1');
        expect(targetCell.focused).toEqual(true);
        UIInteractions.triggerKeyDownWithBlur('arrowdown', targetCellElement, true);
        await wait(100);
        fix.detectChanges();
        const newLastRowIndex = lastRowIndex + 1;
        expect(grid.getCellByColumn(newLastRowIndex, 'Column1').value === initialValue).toBeFalsy();
        expect(grid.getCellByColumn(newLastRowIndex, 'Column1').focused).toEqual(true);
        expect(grid.getCellByColumn(newLastRowIndex, 'Column1').selected).toEqual(true);
        expect(grid.getCellByColumn(newLastRowIndex, 'Column1').nativeElement.classList).toContain('igx-grid__td--selected');
        expect(grid.getCellByColumn(lastRowIndex, 'Column1').focused).toEqual(false);
        expect(grid.selectedCells.length).toEqual(1);
    }));

    it('should allow keyboard navigation to first/last cell with Ctrl when there are the pinned columns.', async () => {
        const fix = TestBed.createComponent(PinningComponent);
        fix.detectChanges();

        await wait();
        const grid = fix.componentInstance.grid;
        grid.getColumnByName('CompanyName').pinned = true;
        grid.getColumnByName('ContactName').pinned = true;
        await wait(DEBOUNCETIME);
        fix.detectChanges();
        const cells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
        let cell = cells[0];

        cell.nativeElement.dispatchEvent(new Event('focus'));
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual('Maria Anders');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

        UIInteractions.triggerKeyDownWithBlur('arrowright', cell.nativeElement, true, false, false, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual('030-0076545');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

        cell = cells[cells.length - 1];
        UIInteractions.triggerKeyDownWithBlur('arrowleft', cell.nativeElement, true, false, false, true);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // It won't scroll left since the next selected cell will be in the pinned area
        expect(fix.componentInstance.selectedCell.value).toEqual('Maria Anders');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
    });

    it('should allow horizontal keyboard navigation between start pinned area and unpinned area.', fakeAsync(() => {
        const fix = TestBed.createComponent(PinningComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;

        fix.detectChanges();
        tick();

        grid.getColumnByName('CompanyName').pinned = true;
        grid.getColumnByName('ContactName').pinned = true;
        fix.detectChanges();

        const cells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
        let cell = cells[0];

        cell.nativeElement.dispatchEvent(new Event('focus'));
        tick();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual('Maria Anders');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

        UIInteractions.triggerKeyDownWithBlur('arrowright', cell.nativeElement, true);
        tick();
        fix.detectChanges();
        expect(fix.componentInstance.selectedCell.value).toEqual('Alfreds Futterkiste');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
        cell = cells[1];

        UIInteractions.triggerKeyDownWithBlur('arrowright', cell.nativeElement, true);
        tick();

        fix.detectChanges();
        expect(fix.componentInstance.selectedCell.value).toEqual('ALFKI');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');
        cell = cells[2];

        UIInteractions.triggerKeyDownWithBlur('arrowleft', cell.nativeElement, true);
        tick();
        fix.detectChanges();
        expect(fix.componentInstance.selectedCell.value).toEqual('Alfreds Futterkiste');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
        cell.triggerEventHandler('blur', {});
        tick();
        cell = cells[0];

        UIInteractions.triggerKeyDownWithBlur('arrowright', cell.nativeElement, true);
        tick();
        fix.detectChanges();
        cell = cells[1];

        UIInteractions.triggerKeyDownWithBlur('arrowright', cell.nativeElement, true);
        tick();
        fix.detectChanges();
        expect(fix.componentInstance.selectedCell.value).toEqual('ALFKI');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');
    }));

    it('should allow vertical keyboard navigation in pinned area.', fakeAsync(() => {
        const fix = TestBed.createComponent(PinOnInitAndSelectionComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        fix.detectChanges();
        const cells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
        let cell = cells[0];

        cell.nativeElement.dispatchEvent(new Event('focus'));
        // cell.triggerEventHandler('focus', {});

        tick();
        fix.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual('Alfreds Futterkiste');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

        UIInteractions.triggerKeyDownWithBlur('arrowdown', cell.nativeElement, true);

        tick();
        grid.cdr.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual('Ana Trujillo Emparedados y helados');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
        cell = cells[5];

        UIInteractions.triggerKeyDownWithBlur('arrowup', cell.nativeElement, true);

        tick();
        grid.cdr.detectChanges();

        expect(fix.componentInstance.selectedCell.value).toEqual('Alfreds Futterkiste');
        expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
    }));

    describe('in virtualized grid', () => {
        // configureTestSuite();
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(VirtualGridComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            setupGridScrollDetection(fix, grid);
            fix.detectChanges();
        }));

        it('should allow navigating down', async () => {
            const cell = grid.getCellByColumn(4, 'index');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(50);
            fix.detectChanges();
            // navigate down to 50th row.
            await GridFunctions.navigateVerticallyToIndex(grid, 4, 50);
            await wait(100);
            fix.detectChanges();
            expect(fix.componentInstance.selectedCell.rowIndex).toEqual(50);
        });

        it('should allow navigating up', async () => {
            grid.verticalScrollContainer.addScrollTop(5100);

            await wait(200);
            fix.detectChanges();

            const cell = grid.getCellByColumn(104, 'index');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            await GridFunctions.navigateVerticallyToIndex(grid, 104, 0);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.rowIndex).toEqual(0);
        });

        it('should allow horizontal navigation', async () => {
            const cols = [];
            for (let i = 0; i < 10; i++) {
                cols.push({ field: 'col' + i });
            }
            fix.componentInstance.columns = cols;
            fix.detectChanges();
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            fix.detectChanges();

            const cell = grid.getCellByColumn(0, 'col3');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            await GridFunctions.navigateHorizontallyToIndex(grid, cell, 9);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.columnIndex).toEqual(9);
            await GridFunctions.navigateHorizontallyToIndex(grid, fix.componentInstance.selectedCell, 1);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.columnIndex).toEqual(1);
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

            const cell = grid.getCellByColumn(0, 'col1');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            await GridFunctions.navigateHorizontallyToIndex(grid, cell, 9);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.visibleColumnIndex).toEqual(9);
            await GridFunctions.navigateHorizontallyToIndex(grid, fix.componentInstance.selectedCell, 1);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(fix.componentInstance.selectedCell.visibleColumnIndex).toEqual(1);
        });

        it('should allow vertical navigation in virtualized grid with pinned cols.', async () => {
            grid.pinColumn('index');
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const cell = grid.getCellByColumn(4, 'index');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(50);
            fix.detectChanges();
            // navigate down to 20th row.
            await GridFunctions.navigateVerticallyToIndex(grid, 4, 20);
            await wait(50);
            fix.detectChanges();
            expect(fix.componentInstance.selectedCell.rowIndex).toEqual(20);
        });

        it('should scroll into view the not fully visible cells when navigating down', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(100);
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            fix.detectChanges();

            const rows = fix.nativeElement.querySelectorAll('igx-grid-row');
            const cell = rows[3].querySelectorAll('igx-grid-cell')[1];
            const bottomRowHeight = rows[4].offsetHeight;
            const displayContainer = fix.nativeElement.querySelectorAll('igx-display-container')[1];
            const bottomCellVisibleHeight = displayContainer.parentElement.offsetHeight % bottomRowHeight;

            cell.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);

            fix.detectChanges();
            expect(fix.componentInstance.selectedCell.value).toEqual(30);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
            const curCell = grid.getCellByColumn(3, '1');
            UIInteractions.triggerKeyDownWithBlur('arrowdown', curCell.nativeElement, true);
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
            const displayContainer = fix.nativeElement.querySelectorAll('igx-display-container')[1];
            fix.componentInstance.scrollTop(25);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(displayContainer.style.top).toEqual('-25px');
            const rows = fix.nativeElement.querySelectorAll('igx-grid-row');
            const cell = rows[1].querySelectorAll('igx-grid-cell')[1];
            cell.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(10);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');

            const curCell = grid.getCellByColumn(1, '1');
            UIInteractions.triggerKeyDownWithBlur('arrowup', curCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            fix.detectChanges();
            expect(displayContainer.style.top).toEqual('0px');
            expect(fix.componentInstance.selectedCell.value).toEqual(0);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
        });

        it('should allow navigating first/last cell in column with down/up and Ctrl key.', async () => {
            grid.verticalScrollContainer.addScrollTop(5100);

            await wait(DEBOUNCETIME);
            fix.detectChanges();

            let cell = grid.getCellByColumn(104, 'value');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(cell.selected).toBe(true);
            expect(cell.focused).toBe(true);
            UIInteractions.triggerKeyDownWithBlur('arrowdown', cell.nativeElement, true, false, false, true);
            await wait(100);
            fix.detectChanges();

            let selectedCellFromGrid = grid.selectedCells[0];
            let selectedCell = fix.componentInstance.selectedCell;
            expect(selectedCell.value).toEqual(9990);
            expect(selectedCell.column.field).toMatch('value');
            expect(selectedCell.rowIndex).toEqual(999);
            expect(selectedCellFromGrid.value).toEqual(9990);
            expect(selectedCellFromGrid.column.field).toMatch('value');
            expect(selectedCellFromGrid.rowIndex).toEqual(999);

            cell = grid.getCellByColumn(998, 'other');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(cell.selected).toBe(true);
            expect(cell.focused).toBe(true);
            UIInteractions.triggerKeyDownWithBlur('arrowup', cell.nativeElement, true, false, false, true);
            await wait(100);
            fix.detectChanges();

            selectedCellFromGrid = grid.selectedCells[0];
            selectedCell = fix.componentInstance.selectedCell;
            expect(selectedCell.value).toEqual(0);
            expect(selectedCell.column.field).toMatch('other');
            expect(selectedCell.rowIndex).toEqual(0);
            expect(grid.verticalScrollContainer.getScroll().scrollTop).toEqual(0);
            expect(selectedCellFromGrid.value).toEqual(0);
            expect(selectedCellFromGrid.column.field).toMatch('other');
            expect(selectedCellFromGrid.rowIndex).toEqual(0);
        });

        it('should allow navigating first/last cell in column with home/end and Cntr key.', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(50);
            fix.componentInstance.data = fix.componentInstance.generateData(500);
            fix.detectChanges();

            grid.verticalScrollContainer.addScrollTop(5000);

            await wait(DEBOUNCETIME);
            fix.detectChanges();

            let cell = grid.getCellByColumn(101, '2');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(cell.selected).toBe(true);
            expect(cell.focused).toBe(true);
            UIInteractions.triggerKeyDownWithBlur('home', cell.nativeElement, true, false, false, true);
            await wait(100);
            fix.detectChanges();

            let selectedCellFromGrid = grid.selectedCells[0];
            let selectedCell = fix.componentInstance.selectedCell;
            expect(selectedCell.value).toEqual(0);
            expect(selectedCell.column.field).toMatch('0');
            expect(selectedCell.rowIndex).toEqual(0);
            expect(selectedCellFromGrid.value).toEqual(0);
            expect(selectedCellFromGrid.column.field).toMatch('0');
            expect(selectedCellFromGrid.rowIndex).toEqual(0);
            expect(grid.verticalScrollContainer.getScroll().scrollTop).toEqual(0);

            cell = grid.getCellByColumn(4, '2');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            UIInteractions.triggerKeyDownWithBlur('end', cell.nativeElement, true, false, false, true);
            await wait(100);
            fix.detectChanges();

            selectedCell = fix.componentInstance.selectedCell;
            expect(selectedCell.value).toEqual(244510);
            expect(selectedCell.column.field).toMatch('49');
            expect(selectedCell.rowIndex).toEqual(499);

            selectedCellFromGrid = grid.selectedCells[0];
            expect(selectedCellFromGrid.value).toEqual(244510);
            expect(selectedCellFromGrid.column.field).toMatch('49');
            expect(selectedCellFromGrid.rowIndex).toEqual(499);
        });

        it('should scroll into view the not fully visible cells when navigating left', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(100);
            fix.detectChanges();
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            fix.detectChanges();

            const rows = fix.nativeElement.querySelectorAll('igx-grid-row');
            const rowDisplayContainer = rows[1].querySelector('igx-display-container');
            fix.componentInstance.scrollLeft(50);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(rowDisplayContainer.style.left).toEqual('-50px');
            const cell = rows[1].querySelectorAll('igx-grid-cell')[1];
            cell.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);

            fix.detectChanges();
            expect(fix.componentInstance.selectedCell.value).toEqual(10);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('1');
            const curCell = grid.getCellByColumn(1, '1');
            UIInteractions.triggerKeyDownWithBlur('arrowleft', curCell.nativeElement, true);
            await wait(DEBOUNCETIME);

            fix.detectChanges();
            expect(rowDisplayContainer.style.left).toEqual('0px');
            expect(fix.componentInstance.selectedCell.value).toEqual(0);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('0');
        });

        it('should scroll into view the not fully visible cells when navigating right', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(100);
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            fix.detectChanges();

            const rows = fix.nativeElement.querySelectorAll('igx-grid-row');
            const rowDisplayContainer = rows[1].querySelector('igx-display-container');
            expect(rowDisplayContainer.style.left).toEqual('0px');
            const cell = rows[1].querySelectorAll('igx-grid-cell')[2];
            cell.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(20);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('2');
            const curCell = grid.getCellByColumn(1, '2');
            UIInteractions.triggerKeyDownWithBlur('arrowright', curCell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(30);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('3');
        });

        it('should scroll first row into view when pressing arrow up', (async () => {
            grid.reflow();
            fix.componentInstance.scrollTop(25);
            await wait(100);
            fix.detectChanges();

            let scrollContainer = grid.verticalScrollContainer.dc.instance._viewContainer;
            let scrollContainerOffset = scrollContainer.element.nativeElement.offsetTop;

            expect(scrollContainerOffset).toEqual(-25);

            const cell = fix.debugElement.queryAll(By.css(`${CELL_CSS_CLASS}:nth-child(2)`))[1];

            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait();
            fix.detectChanges();

            expect(fix.componentInstance.selectedCell.value).toEqual(10);
            expect(fix.componentInstance.selectedCell.column.field).toMatch('value');

            UIInteractions.triggerKeyDownWithBlur('arrowup', cell.nativeElement, true);
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

            grid.nativeElement.dispatchEvent(new Event('focus'));
            await wait();
            fix.detectChanges();

            // testing the pagedown key
            UIInteractions.triggerKeyDownEvtUponElem('PageDown', grid.nativeElement, true);
            grid.cdr.detectChanges();

            await wait();
            let currScrollTop = grid.verticalScrollContainer.getScroll().scrollTop;
            expect(currScrollTop).toEqual(grid.verticalScrollContainer.igxForContainerSize);

            // testing the pageup key
            UIInteractions.triggerKeyDownEvtUponElem('PageUp', grid.nativeElement, true);
            grid.cdr.detectChanges();
            await wait();
            currScrollTop = grid.headerContainer.getScroll().scrollTop;
            expect(currScrollTop).toEqual(0);
        });

        it('Custom KB navigation: should be able to scroll to a random cell in the grid', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(25);
            fix.componentInstance.data = fix.componentInstance.generateData(25);
            fix.detectChanges();

            grid.navigateTo(15, 1, (args) => { args.target.nativeElement.focus(); });
            fix.detectChanges();
            await wait(200);
            fix.detectChanges();

            const target = grid.getCellByColumn(15, '1');
            expect(target).toBeDefined();
            expect(document.activeElement).toBe(target.nativeElement);
        });

        it('Custom KB navigation: should be able to scroll horizontally and vertically to a cell in the grid', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(100);
            fix.componentInstance.data = fix.componentInstance.generateData(100);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            grid.navigateTo(50, 50, (args) => { args.target.nativeElement.focus(); });
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const target = grid.getCellByColumn(50, '50');
            expect(target).toBeDefined();
            expect(document.activeElement).toBe(target.nativeElement);
        });

        it('Custom KB navigation: onGridKeydown should be emitted', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(25);
            fix.detectChanges();
            fix.componentInstance.data = fix.componentInstance.generateData(25);
            fix.detectChanges();
            const gridKeydown = spyOn<any>(grid.onGridKeydown, 'emit').and.callThrough();

            const cell = grid.getCellByColumn(1, '2');
            UIInteractions.triggerKeyDownWithBlur('arrowup', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(gridKeydown).toHaveBeenCalledTimes(1);
            expect(gridKeydown).toHaveBeenCalledWith({
                targetType: 'dataCell', target: cell, cancel: false, event: new KeyboardEvent('keydown')
            });
        });

        it('should scroll into view not visible cell when in row edit and move from pinned to unpinned column', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(100, 50);
            fix.componentInstance.data = fix.componentInstance.generateData(100);

            fix.detectChanges();
            await wait(DEBOUNCETIME);

            grid.primaryKey = '0';
            grid.rowEditable = true;
            grid.columns.every(c => c.editable = true);

            grid.getColumnByName('2').pinned = true;
            grid.getColumnByName('3').pinned = true;
            grid.getColumnByName('3').editable = false;
            grid.getColumnByName('0').editable = false;

            await wait(DEBOUNCETIME);
            fix.detectChanges();

            grid.navigateTo(0, 99);

            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const rows = fix.nativeElement.querySelectorAll('igx-grid-row');
            const cell = rows[0].querySelectorAll('igx-grid-cell')[0];
            cell.dispatchEvent(new Event('focus'));
            UIInteractions.triggerKeyDownEvtUponElem('F2', cell, true);

            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(grid.crudService.cell.column.header).toBe('2');
            UIInteractions.triggerKeyDownEvtUponElem('tab', cell, true);

            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(grid.crudService.cell.column.header).toBe('1');
        });
    });

    describe('Group By navigation ', () => {
        // configureTestSuite();
        let fix;
        let grid: IgxGridComponent;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(DefaultGroupBYGridComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            fix.componentInstance.width = '600px';
            fix.componentInstance.height = '600px';
            grid.columnWidth = '100px';
            setupGridScrollDetection(fix, grid);
            fix.detectChanges();
        }));

        it('should toggle expand/collapse state of group row with ArrowRight/ArrowLeft key.', async(() => {
            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
            const gRow = grid.groupsRowList.toArray()[0];
            expect(gRow.expanded).toBe(true);
            const evtArrowLeft = new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true });

            const evtArrowRight = new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true });
            gRow.element.nativeElement.dispatchEvent(evtArrowLeft);
            fix.detectChanges();

            expect(gRow.expanded).toBe(false);

            gRow.element.nativeElement.dispatchEvent(evtArrowRight);
            fix.detectChanges();
            expect(gRow.expanded).toBe(true);
        }));

        it('should toggle expand/collapse state of group row with ArrowUp/ArrowDown key.', async(() => {
            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
            const gRow = grid.groupsRowList.toArray()[0];
            expect(gRow.expanded).toBe(true);
            const evtArrowUp = new KeyboardEvent('keydown', { key: 'ArrowUp', altKey: true });

            const evtArrowDown = new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true });
            gRow.element.nativeElement.dispatchEvent(evtArrowUp);
            fix.detectChanges();

            expect(gRow.expanded).toBe(false);

            gRow.element.nativeElement.dispatchEvent(evtArrowDown);
            fix.detectChanges();
            expect(gRow.expanded).toBe(true);
        }));

        it(`focus should stay over the group row when expanding/collapsing
        with keyboard and the grid is scrolled to the bottom`, (async () => {
                grid.groupBy({
                    fieldName: 'ProductName', dir: SortingDirection.Desc,
                    ignoreCase: false, strategy: DefaultSortingStrategy.instance()
                });
                fix.detectChanges();

                grid.verticalScrollContainer.scrollTo(grid.dataView.length - 1);
                await wait(100);
                fix.detectChanges();

                const groupRows = grid.nativeElement.querySelectorAll('igx-grid-groupby-row');
                let lastGroupRow = groupRows[groupRows.length - 1];
                const lastGroupRowIndex = parseInt(lastGroupRow.dataset.rowindex, 10);
                lastGroupRow.dispatchEvent(new FocusEvent('focus'));
                fix.detectChanges();

                expect(lastGroupRow.classList.contains('igx-grid__group-row--active')).toBeTruthy();
                lastGroupRow.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true }));

                fix.detectChanges();
                lastGroupRow = grid.nativeElement.querySelector(`igx-grid-groupby-row[data-rowindex="${lastGroupRowIndex}"]`);
                expect(lastGroupRow).toBeDefined();
                expect(lastGroupRow.classList.contains('igx-grid__group-row--active')).toBeTruthy();
                expect(lastGroupRow.getAttribute('aria-expanded')).toBe('false');
            }));

        it(`should be able to navigate down to the next row when expand the last group row
    and grid is scrolled to bottom`, (async () => {
                grid.groupBy({
                    fieldName: 'ProductName', dir: SortingDirection.Desc,
                    ignoreCase: false, strategy: DefaultSortingStrategy.instance()
                });
                fix.detectChanges();

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
                UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', grid.groupsRowList.last.nativeElement, true);
                await wait(100);
                fix.detectChanges();

                const selectedCell = grid.nativeElement.querySelector('.igx-grid__td--selected');
                expect(selectedCell).toBeDefined();
                expect(parseInt(selectedCell.dataset.rowindex, 10)).toBe(groupRowIndex + 1);
                expect(parseInt(selectedCell.dataset.visibleindex, 10)).toBe(0);

            }));

        it('should allow keyboard navigation through group rows.', (async () => {
            fix.componentInstance.width = '400px';
            fix.componentInstance.height = '300px';
            grid.columnWidth = '200px';
            await wait();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            grid.groupBy({
                fieldName: 'Released', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
            let row = grid.getRowByIndex(0);
            row.nativeElement.dispatchEvent(new Event('focus'));

            await GridFunctions.navigateVerticallyToIndex(grid, 0, 9);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            row = grid.getRowByIndex(9);
            expect(row instanceof IgxGridRowComponent).toBe(true);
            expect(row.focused).toBe(true);
            expect(row.cells.toArray()[0].selected).toBe(true);

            await GridFunctions.navigateVerticallyToIndex(grid, 9, 0);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            row = grid.getRowByIndex(0);
            expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
            expect(row.focused).toBe(true);
        }));

        it('should persist last selected cell column index when navigation down through group rows.', async () => {
            fix.componentInstance.width = '400px';
            fix.componentInstance.height = '300px';
            grid.columnWidth = '200px';
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            grid.groupBy({
                fieldName: 'Released', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();

            grid.headerContainer.getScroll().scrollLeft = 1000;
            await wait(DEBOUNCETIME);
            let cell = grid.getCellByColumn(2, 'Released');
            cell.nativeElement.dispatchEvent(new Event('focus'));

            await GridFunctions.navigateVerticallyToIndex(grid, 0, 9, 4);

            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const row = grid.getRowByIndex(9);
            cell = grid.getCellByColumn(9, 'Released');
            expect(row instanceof IgxGridRowComponent).toBe(true);
            expect(row.focused).toBe(true);
            expect(cell.selected).toBe(true);
        });

        it('should focus grouped row when press Tab key and Shift + Tab on a cell', (async () => {
            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
            let cell = grid.getCellByColumn(2, 'Released');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('tab', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            let groupRow = grid.groupsRowList.toArray()[1];
            cell = grid.getCellByColumn(2, 'Released');
            await GridFunctions.expandCollapceGroupRow(fix, groupRow, cell);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', groupRow.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            cell = grid.getCellByColumn(2, 'Released');
            expect(groupRow.focused).toBe(false);
            expect(groupRow.nativeElement.classList.contains('igx-grid__group-row--active')).toBe(false);
            expect(cell.selected).toBe(true);
            expect(cell.focused).toBe(true);

            cell = grid.getCellByColumn(7, 'Downloads');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            fix.detectChanges();

            expect(groupRow.focused).toBe(false);
            expect(groupRow.nativeElement.classList.contains('igx-grid__group-row--active')).toBe(false);
            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'tab', shiftKey: true }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            groupRow = grid.groupsRowList.toArray()[2];
            cell = grid.getCellByColumn(7, 'Downloads');
            await GridFunctions.expandCollapceGroupRow(fix, groupRow, cell);
        }));

        it('should correct work when press tab and sft+tab on a grouped row', (async () => {
            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();

            let groupRow = grid.groupsRowList.toArray()[0];
            groupRow.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            groupRow = grid.groupsRowList.toArray()[0];
            expect(groupRow.focused).toBe(true);
            expect(groupRow.nativeElement.classList.contains('igx-grid__group-row--active')).toBe(true);
            UIInteractions.triggerKeyDownEvtUponElem('tab', groupRow.nativeElement, true);
            await wait(100);
            fix.detectChanges();

            let cell = grid.getCellByColumn(1, 'Downloads');
            expect(cell.selected).toBe(true);
            expect(cell.focused).toBe(true);

            groupRow = grid.groupsRowList.toArray()[1];
            groupRow.nativeElement.dispatchEvent(new Event('focus'));
            await wait(100);
            fix.detectChanges();

            groupRow = grid.groupsRowList.toArray()[1];
            expect(groupRow.focused).toBe(true);
            expect(groupRow.nativeElement.classList.contains('igx-grid__group-row--active')).toBe(true);
            groupRow.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'tab', shiftKey: true }));
            await wait(100);
            fix.detectChanges();

            cell = grid.getCellByColumn(2, 'Released');
            expect(cell.selected).toBe(true);
            expect(cell.focused).toBe(true);
        }));

        it('should correct work when press tab and sft+tab on a grouped row when have row selectors', (async () => {
            grid.rowSelection = GridSelectionMode.multiple;
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const groupRow = grid.groupsRowList.toArray()[0];
            const firstRow = grid.getRowByIndex(1);
            const firstRowCheckbox: HTMLElement = firstRow.nativeElement.querySelector('.igx-checkbox');
            const cell = grid.getCellByColumn(1, 'Downloads');

            groupRow.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(groupRow.focused).toBe(true);
            expect(groupRow.nativeElement.classList.contains('igx-grid__group-row--active')).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('tab', groupRow.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(cell.selected).toBeTruthy();
            expect(cell.focused).toBeTruthy();
            expect(firstRowCheckbox.classList.contains('igx-checkbox--focused')).toBeFalsy();

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'tab', shiftKey: true }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(cell.selected).toBeTruthy();
            expect(cell.focused).toBeFalsy();
            expect(firstRowCheckbox.classList.contains('igx-checkbox--focused')).toBeFalsy();

            await GridFunctions.expandCollapceGroupRow(fix, groupRow, cell);
        }));

        it('expand/colapse row with arrow keys', (async () => {
            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();

            const groupRow = grid.groupsRowList.toArray()[0];
            groupRow.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            await GridFunctions.expandCollapceGroupRow(fix, groupRow, null);
        }));

        it('should focus grouped row when press arrow keys up or down', (async () => {
            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
            let cell = grid.getCellByColumn(1, 'ID');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(cell.selected).toBe(true);
            expect(cell.focused).toBe(true);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', cell.nativeElement, true);
            await wait(100);
            fix.detectChanges();

            let groupRow = grid.groupsRowList.toArray()[0];
            cell = grid.getCellByColumn(1, 'ID');
            await GridFunctions.expandCollapceGroupRow(fix, groupRow, cell);

            cell = grid.getCellByColumn(2, 'ProductName');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(100);
            fix.detectChanges();

            expect(cell.focused).toBe(true);
            expect(cell.selected).toBe(true);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', cell.nativeElement, true);
            await wait(100);
            fix.detectChanges();

            cell = grid.getCellByColumn(2, 'ProductName');
            groupRow = grid.groupsRowList.toArray()[1];

            await GridFunctions.expandCollapceGroupRow(fix, groupRow, cell);
        }));

        it('should correct work when press tab and sft+tab when there is a horizontal scroll', (async () => {
            grid.columnWidth = '200px';
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const groupRow = grid.groupsRowList.toArray()[1];
            let cell;

            groupRow.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(groupRow.focused).toBe(true);
            groupRow.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'tab', shiftKey: true }));
            await wait(100);
            fix.detectChanges();

            cell = grid.getCellByColumn(2, 'Released');
            expect(cell.focused).toBe(true);
            expect(cell.selected).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('Tab', cell.nativeElement, true);
            await wait(100);
            fix.detectChanges();
            expect(cell.selected).toBe(true);

            await GridFunctions.expandCollapceGroupRow(fix, groupRow, cell);

            UIInteractions.triggerKeyDownEvtUponElem('Tab', groupRow.nativeElement, true);
            await wait(100);
            fix.detectChanges();

            cell = grid.getCellByColumn(4, 'Downloads');
            expect(cell.focused).toBe(true);
            expect(cell.selected).toBe(true);

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'tab', shiftKey: true }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(cell.selected).toBe(true);
            expect(groupRow.focused).toBe(true);
        }));


        it('should persist last selected cell column index when navigation up through group rows.', async () => {
            fix.componentInstance.width = '400px';
            fix.componentInstance.height = '300px';
            grid.columnWidth = '200px';
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            grid.groupBy({
                fieldName: 'Released', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
            grid.headerContainer.getScroll().scrollLeft = 1000;
            await wait(100);
            fix.detectChanges();
            grid.verticalScrollContainer.addScrollTop(1000);
            await wait(200);
            fix.detectChanges();
            const cell = grid.getCellByColumn(20, 'Released');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await GridFunctions.navigateVerticallyToIndex(grid, 20, 0, 4);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const row = grid.getRowByIndex(0);
            expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
            expect(row.focused).toBe(true);
        });

        it('should NOT clear selection from data cells when a group row is focused via KB navigation.', async () => {
            fix.componentInstance.width = '800px';
            fix.componentInstance.height = '300px';
            grid.columnWidth = '200px';
            await wait(100);
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            grid.groupBy({
                fieldName: 'Released', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
            const cell = grid.getCellByColumn(2, 'Downloads');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            await wait(100);
            expect(cell.selected).toBe(true);
            await GridFunctions.navigateVerticallyToIndex(grid, 2, 0);

            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const row = grid.getRowByIndex(0);
            expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
            expect(row.focused).toBe(true);
            expect(cell.selected).toBe(true);
        });

        it('Custom KB navigation:  should be able to scroll to a random row and pass a cb', async () => {
            fix.componentInstance.width = '600px';
            fix.componentInstance.height = '500px';
            grid.columnWidth = '200px';
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();

            grid.navigateTo(9, -1, (args) => { args.target.nativeElement.focus(); });
            await wait(100);
            fix.detectChanges();

            const target = grid.rowList.find(r => r.index === 9);
            expect(target).toBeDefined();
            expect(target.focused).toBe(true);
        });

        it('Custom KB navigation: onGridKeydown should be emitted for ', async () => {
            fix.componentInstance.width = '600px';
            fix.componentInstance.height = '500px';
            grid.columnWidth = '200px';
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc,
                ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
            const gridKeydown = spyOn<any>(grid.onGridKeydown, 'emit').and.callThrough();

            const rowEl = grid.rowList.find(r => r.index === 0);
            rowEl.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: false }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(gridKeydown).toHaveBeenCalledTimes(1);
            expect(gridKeydown).toHaveBeenCalledWith({
                targetType: 'groupRow', target: rowEl, cancel: false, event: new KeyboardEvent('keydown')
            });

            rowEl.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: false }));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(gridKeydown).toHaveBeenCalledTimes(2);
            expect(gridKeydown).toHaveBeenCalledWith({
                targetType: 'groupRow', target: rowEl, cancel: false, event: new KeyboardEvent('keydown')
            });
        });

    });

});

@Component({
    template: `
        <igx-grid
            (onSelection)="cellSelected($event)"
            (onCellClick)="cellClick($event)"
            (onContextMenu)="cellRightClick($event)"
            (onDoubleClick)="doubleClick($event)"
            [data]="data"
            [autoGenerate]="true">
        </igx-grid>
    `
})
export class DefaultGridComponent {

    public data = [
        { index: 1, value: 1 },
        { index: 2, value: 2 }
    ];

    public selectedCell: IgxGridCellComponent;
    public clickedCell: IgxGridCellComponent;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;

    public cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }

    public cellClick(evt) {
        this.clickedCell = evt.cell;
    }

    public cellRightClick(evt) {
        this.clickedCell = evt.cell;
    }

    public doubleClick(evt) {
        this.clickedCell = evt.cell;
    }
}

@Component({
    template: `
        <igx-grid (onSelection)="cellSelected($event)" [data]="data" [autoGenerate]="true"></igx-grid>
    `
})
export class CtrlKeyKeyboardNagivationComponent {

    public data = [
        { index: 1, value: 1, other: 1, another: 1 },
        { index: 2, value: 2, other: 2, another: 2 }
    ];

    public selectedCell: IgxGridCellComponent;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;

    public cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }
}

@Component({
    template: `
        <igx-grid
            [width]='width'
            [height]='height'
            [data]="data"
            [autoGenerate]="true" (onColumnInit)="columnsCreated($event)" (onGroupingDone)="onGroupingDoneHandler($event)">
        </igx-grid>
        <ng-template #dropArea>
            <span> Custom template </span>
        </ng-template>
    `
})
export class DefaultGroupBYGridComponent extends DataParent {
    public width = '800px';
    public height = null;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild('dropArea', { read: TemplateRef, static: true })
    public dropAreaTemplate: TemplateRef<any>;

    public enableSorting = false;
    public enableFiltering = false;
    public enableResizing = false;
    public enableEditing = false;
    public enableGrouping = true;
    public currentSortExpressions;

    public columnsCreated(column: IgxColumnComponent) {
        column.sortable = this.enableSorting;
        column.filterable = this.enableFiltering;
        column.resizable = this.enableResizing;
        column.editable = this.enableEditing;
        column.groupable = this.enableGrouping;
    }
    public onGroupingDoneHandler(sortExpr) {
        this.currentSortExpressions = sortExpr;
    }
}
