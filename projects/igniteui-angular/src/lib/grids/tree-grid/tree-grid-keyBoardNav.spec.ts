import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTreeGridModule, IgxTreeGridComponent } from './public_api';
import { IgxTreeGridWithNoScrollsComponent, IgxTreeGridWithScrollsComponent } from '../../test-utils/tree-grid-components.spec';
import { TreeGridFunctions } from '../../test-utils/tree-grid-functions.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { setupGridScrollDetection } from '../../test-utils/helper-utils.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { DebugElement } from '@angular/core';
import { IgxGridCellComponent } from '../cell.component';

const DEBOUNCETIME = 30;

describe('IgxTreeGrid - Key Board Navigation #tGrid', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridWithNoScrollsComponent,
                IgxTreeGridWithScrollsComponent
            ],
            imports: [IgxTreeGridModule, NoopAnimationsModule],
        }).compileComponents();
    }));

    describe('Navigation with no scroll', () => {
        let fix;
        let treeGrid: IgxTreeGridComponent;
        let gridContent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridWithNoScrollsComponent);
            fix.detectChanges();
            tick(16);
            treeGrid = fix.componentInstance.treeGrid;
            gridContent = GridFunctions.getGridContent(fix);
        }));

        it('should navigate with arrow keys', () => {
            spyOn(treeGrid.selected, 'emit').and.callThrough();
            let cell = treeGrid.gridAPI.get_cell_by_index(0, 'ID');

            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDown('arrowdown', gridContent);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(1, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDown('arrowright', gridContent);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(1, 'Name');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDown('arrowup', gridContent);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(0, 'Name');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDown('arrowleft', gridContent);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(0, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(5);
        });

        it('should move to the top/bottom cell when navigate with Ctrl + arrow Up/Down keys', () => {
            spyOn(treeGrid.selected, 'emit').and.callThrough();
            let cell = treeGrid.gridAPI.get_cell_by_index(5, 'ID');
            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDown('arrowdown', gridContent, false, false, true);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(9, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            // press Ctrl+Arrow down on the last cell
            UIInteractions.triggerEventHandlerKeyDown('arrowdown', gridContent, false, false, true);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDown('arrowup', gridContent, false, false, true);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(0, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            // press Ctrl+Arrow up on the first cell
            UIInteractions.triggerEventHandlerKeyDown('arrowup', gridContent, false, false, true);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(3);
        });

        it('should move to the leftmost/rightmost cell when navigate with Ctrl + arrow Left/Right keys', () => {
            spyOn(treeGrid.selected, 'emit').and.callThrough();
            let cell = treeGrid.gridAPI.get_cell_by_index(0, 'HireDate');
            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDown('arrowright', gridContent, false, false, true);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(0, 'OnPTO');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            // press Ctrl+Arrow right on the last cell
            UIInteractions.triggerEventHandlerKeyDown('arrowright', gridContent, false, false, true);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDown('arrowleft', gridContent, false, false, true);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(0, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            // press Ctrl+Arrow left on the first cell
            UIInteractions.triggerEventHandlerKeyDown('arrowleft', gridContent, false, false, true);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(3);
        });

        it('should move to the top left/bottom right cell when navigate with Ctrl + Home/End keys', () => {
            spyOn(treeGrid.selected, 'emit').and.callThrough();
            let cell = treeGrid.gridAPI.get_cell_by_index(4, 'Name');
            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDown('end', gridContent, false, false, true);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(9, 'OnPTO');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            // press Ctrl+end on the last cell
            UIInteractions.triggerEventHandlerKeyDown('end', gridContent, false, false, true);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDown('home', gridContent, false, false, true);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(0, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            // press Ctrl+home on the first cell
            UIInteractions.triggerEventHandlerKeyDown('home', gridContent, false, false, true);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(3);
        });

        it('should expand/collapse row when Alt + arrow Left/Right keys are pressed', () => {
            spyOn(treeGrid.rowToggle, 'emit').and.callThrough();
            const cell = treeGrid.gridAPI.get_cell_by_index(0, 'ID');
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);

            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);
            TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.rowToggle.emit).toHaveBeenCalledTimes(1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);
            TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.rowToggle.emit).toHaveBeenCalledTimes(1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);
            TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.rowToggle.emit).toHaveBeenCalledTimes(2);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);
            TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.rowToggle.emit).toHaveBeenCalledTimes(2);
        });

        it('should expand/collapse row when Alt + arrow Up/Down keys are pressed', () => {
            spyOn(treeGrid.rowToggle, 'emit').and.callThrough();
            const cell = treeGrid.gridAPI.get_cell_by_index(3, 'HireDate');
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);

            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7);
            TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[3]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.rowToggle.emit).toHaveBeenCalledTimes(1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7);
            TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[3]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.rowToggle.emit).toHaveBeenCalledTimes(1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);
            TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[3]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.rowToggle.emit).toHaveBeenCalledTimes(2);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);
            TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[3]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.rowToggle.emit).toHaveBeenCalledTimes(2);
        });

        it('should not change selection when press Alt + arrow Left/Right keys on a cell in a row without children', () => {
            spyOn(treeGrid.rowToggle, 'emit').and.callThrough();
            const cell = treeGrid.gridAPI.get_cell_by_index(1, 'Name');
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);

            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.rowToggle.emit).toHaveBeenCalledTimes(0);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent, true);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.rowToggle.emit).toHaveBeenCalledTimes(0);
        });

        it('should change editable cell when Tab key is pressed', () => {
            treeGrid.getColumnByName('ID').editable = true;
            treeGrid.getColumnByName('HireDate').editable = true;
            treeGrid.getColumnByName('Age').editable = true;
            treeGrid.getColumnByName('OnPTO').editable = true;
            fix.detectChanges();

            let cell = treeGrid.gridAPI.get_cell_by_index(3, 'Age');
            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDown('Enter', gridContent);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.editMode).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('Tab', gridContent);
            fix.detectChanges();

            expect(cell.editMode).toBe(false);
            cell = treeGrid.gridAPI.get_cell_by_index(3, 'OnPTO');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.editMode).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('Tab', gridContent);
            fix.detectChanges();

            expect(cell.editMode).toBe(false);
            cell = treeGrid.gridAPI.get_cell_by_index(4, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.editMode).toBe(true);

            // Press tab when next cell is not editable
            UIInteractions.triggerEventHandlerKeyDown('Tab', gridContent);
            fix.detectChanges();

            // The next editable cell should be opened in edit mode
            expect(cell.editMode).toBe(false);
            cell = treeGrid.gridAPI.get_cell_by_index(4, 'HireDate');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.editMode).toBe(true);
        });

        it('should change editable cell when Shift + Tab keys are pressed', () => {
            treeGrid.getColumnByName('ID').editable = true;
            treeGrid.getColumnByName('Name').editable = true;
            treeGrid.getColumnByName('HireDate').editable = true;
            treeGrid.getColumnByName('OnPTO').editable = true;
            fix.detectChanges();

            let cell = treeGrid.gridAPI.get_cell_by_index(3, 'Name');

            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDown('Enter', gridContent);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.editMode).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('Tab', gridContent, false, true);
            fix.detectChanges();

            expect(cell.editMode).toBe(false);
            cell = treeGrid.gridAPI.get_cell_by_index(3, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.editMode).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('Tab', gridContent, false, true);
            fix.detectChanges();

            expect(cell.editMode).toBe(false);
            cell = treeGrid.gridAPI.get_cell_by_index(2, 'OnPTO');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.editMode).toBe(true);

            // Press Shift+Tab when next cell is not editable
            UIInteractions.triggerEventHandlerKeyDown('Tab', gridContent, false, true);
            fix.detectChanges();

            expect(cell.editMode).toBe(false);
            cell = treeGrid.gridAPI.get_cell_by_index(2, 'HireDate');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(cell.editMode).toBe(true);
        });
    });

    describe('Navigation with scrolls', () => {
        let fix;
        let treeGrid: IgxTreeGridComponent;
        let gridContent: DebugElement;
        const treeColumns = ['ID', 'Name', 'HireDate', 'Age', 'OnPTO'];

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridWithScrollsComponent);
            fix.detectChanges();
            tick(16);
            treeGrid = fix.componentInstance.treeGrid;
            gridContent = GridFunctions.getGridContent(fix);
            setupGridScrollDetection(fix, treeGrid);
            tick(16);
        }));

        it('should navigate with arrow Up and Down keys', async () => {
            spyOn(treeGrid.selected, 'emit').and.callThrough();
            const firstCell: IgxGridCellComponent = treeGrid.gridAPI.get_cell_by_index(5, 'ID');
            UIInteractions.simulateClickAndSelectEvent(firstCell);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, treeGrid.gridAPI.get_cell_by_index(5, 'ID'));
            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(1);

            for (let i = 5; i < 9; i++) {
                let cell = treeGrid.gridAPI.get_cell_by_index(i, 'ID');
                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.gridAPI.get_cell_by_index(i + 1, 'ID');
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            }

            for (let i = 9; i > 0; i--) {
                let cell = treeGrid.gridAPI.get_cell_by_index(i, 'ID');
                UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.gridAPI.get_cell_by_index(i - 1, 'ID');
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            }
            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(14);
        });

        it('should navigate with arrow Left and Right', async () => {
            const firstCell = treeGrid.gridAPI.get_cell_by_index(3, treeColumns[0]);
            spyOn(treeGrid.selected, 'emit').and.callThrough();

            UIInteractions.simulateClickAndSelectEvent(firstCell);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, firstCell);

            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(1);

            for (let i = 0; i < treeColumns.length - 1; i++) {
                let cell = treeGrid.gridAPI.get_cell_by_index(3, treeColumns[i]);
                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.gridAPI.get_cell_by_index(3, treeColumns[i + 1]);
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
                expect(treeGrid.selected.emit).toHaveBeenCalledTimes(i + 2);
            }

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent);
            await wait();
            fix.detectChanges();

            let lastCell = treeGrid.gridAPI.get_cell_by_index(3, treeColumns[treeColumns.length - 1]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, lastCell);

            for (let i = treeColumns.length - 1; i > 0; i--) {
                let cell = treeGrid.gridAPI.get_cell_by_index(3, treeColumns[i]);
                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.gridAPI.get_cell_by_index(3, treeColumns[i - 1]);
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
                expect(treeGrid.selected.emit).toHaveBeenCalledTimes(2 * treeColumns.length - i);
            }

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent);
            await wait();
            fix.detectChanges();

            lastCell = treeGrid.gridAPI.get_cell_by_index(3, treeColumns[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, lastCell);
            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(2 * treeColumns.length - 1);
        });

        it('should move to the top/bottom cell when navigate with Ctrl + arrow Up/Down', async () => {
            spyOn(treeGrid.selected, 'emit').and.callThrough();
            let cell = treeGrid.gridAPI.get_cell_by_index(1, 'Name');

            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent, false, false, true);
            await wait(100);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(9, 'Name');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(2);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent, false, false, true);
            await wait(100);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(0, 'Name');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(3);
        });

        it('should move to the leftmost/rightmost cell when navigate with Ctrl + arrow Left/Right keys', async () => {
            spyOn(treeGrid.selected, 'emit').and.callThrough();
            let cell = treeGrid.gridAPI.get_cell_by_index(4, treeColumns[1]);

            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(4, treeColumns[treeColumns.length - 1]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(2);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(4, treeColumns[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(3);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(4, treeColumns[treeColumns.length - 1]);
            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(4);
        });

        it('should move to the top left/bottom right cell when navigate with Ctrl + Home/End keys', async () => {
            spyOn(treeGrid.selected, 'emit').and.callThrough();
            let cell = treeGrid.gridAPI.get_cell_by_index(2, treeColumns[2]);

            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(1);

            UIInteractions.triggerEventHandlerKeyDown('End', gridContent, false, false, true);
            await wait(100);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(9, treeColumns[treeColumns.length - 1]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(2);

            UIInteractions.triggerEventHandlerKeyDown('Home', gridContent, false, false, true);
            await wait(100);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(0, treeColumns[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            expect(treeGrid.selected.emit).toHaveBeenCalledTimes(3);
        });

        it('should expand/collapse row when Alt + arrow Left/Right keys are pressed', async () => {
            treeGrid.headerContainer.scrollTo(4);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const cell = treeGrid.gridAPI.get_cell_by_index(3, 'OnPTO');
            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7);
            TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[3]);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(8);
            TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[3]);
        });

        it('should allow pageup/pagedown navigation when the treeGrid is focused', async () => {
            let currScrollTop;
            const cell = treeGrid.gridAPI.get_cell_by_index(1, 'Name');
            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            // testing the pagedown key
            UIInteractions.triggerEventHandlerKeyDown('PageDown', gridContent);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            currScrollTop = treeGrid.verticalScrollContainer.getScroll().scrollTop;
            expect(currScrollTop).toBeGreaterThan(100);

            // testing the pageup key
            UIInteractions.triggerEventHandlerKeyDown('PageUp', gridContent);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            currScrollTop = treeGrid.headerContainer.getScroll().scrollTop;
            expect(currScrollTop).toEqual(0);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
        });

        it('should change editable cell and scroll when Tab and Shift + Tab keys are pressed', async () => {
            treeGrid.getColumnByName('ID').editable = true;
            treeGrid.getColumnByName('Name').editable = true;
            treeGrid.getColumnByName('HireDate').editable = true;
            treeGrid.getColumnByName('Age').editable = true;
            treeGrid.getColumnByName('OnPTO').editable = true;
            fix.detectChanges();

            const firstCell = treeGrid.gridAPI.get_cell_by_index(5, treeColumns[2]);
            UIInteractions.simulateDoubleClickAndSelectEvent(firstCell);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, firstCell);
            expect(firstCell.editMode).toBe(true);

            for (let i = 2; i < treeColumns.length - 1; i++) {
                let cell = treeGrid.gridAPI.get_cell_by_index(5, treeColumns[i]);
                UIInteractions.triggerEventHandlerKeyDown('Tab', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                cell = treeGrid.gridAPI.get_cell_by_index(5, treeColumns[i + 1]);
                expect(cell.editMode).toBe(true);
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            }

            let newCell = treeGrid.gridAPI.get_cell_by_index(5, treeColumns[4]);
            UIInteractions.triggerEventHandlerKeyDown('Tab', gridContent);
            await wait(DEBOUNCETIME * 2);
            fix.detectChanges();

            newCell = treeGrid.gridAPI.get_cell_by_index(6, treeColumns[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, newCell);
            expect(newCell.editMode).toBe(true);
            expect( treeGrid.verticalScrollContainer.getScroll().scrollTop).toBeGreaterThan(0);

            UIInteractions.triggerEventHandlerKeyDown('Tab', gridContent, false, true);
            await wait(DEBOUNCETIME * 2);
            fix.detectChanges();

            newCell = treeGrid.gridAPI.get_cell_by_index(5, treeColumns[4]);
            expect(newCell.editMode).toBe(true);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, newCell);

            for (let i = 4; i > 0; i--) {
                let cell = treeGrid.gridAPI.get_cell_by_index(5, treeColumns[i]);
                UIInteractions.triggerEventHandlerKeyDown('Tab', gridContent, false, true);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.gridAPI.get_cell_by_index(5, treeColumns[i - 1]);
                expect(cell.editMode).toBe(true);
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            }
        });

        it('should navigate with arrow Left key when there is a pinned column', async () => {
            treeGrid.getColumnByName('HireDate').pinned = true;
            fix.detectChanges();

            const columns = ['HireDate', 'ID', 'Name', 'Age', 'OnPTO'];

            const firstCell = treeGrid.gridAPI.get_cell_by_index(3, 'HireDate');
            UIInteractions.simulateClickAndSelectEvent(firstCell);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('End', gridContent);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const lastCell = treeGrid.gridAPI.get_cell_by_index(3, columns[4]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, lastCell);
            expect(treeGrid.headerContainer.getScroll().scrollLeft).toBeGreaterThan(0);

            for (let i = 4; i > 0 ; i--) {
                let cell = treeGrid.gridAPI.get_cell_by_index(3, columns[i]);
                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.gridAPI.get_cell_by_index(3, columns[i - 1]);
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            }

            expect(treeGrid.headerContainer.getScroll().scrollLeft).toEqual(0);
        });

        it('should navigate with arrow Right key when there is a pinned column', async () => {
            treeGrid.getColumnByName('HireDate').pinned = true;
            fix.detectChanges();

            const columns = ['HireDate', 'ID', 'Name', 'Age', 'OnPTO'];

            const firstCell = treeGrid.gridAPI.get_cell_by_index(0, 'HireDate');
            UIInteractions.simulateClickAndSelectEvent(firstCell);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('End', gridContent);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            let newCell = treeGrid.gridAPI.get_cell_by_index(0, columns[4]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, newCell);
            const scrollLeft = treeGrid.headerContainer.getScroll().scrollLeft;
            expect(treeGrid.headerContainer.getScroll().scrollLeft).toBeGreaterThan(0);

            UIInteractions.simulateClickAndSelectEvent(firstCell);
            fix.detectChanges();

            for (let i = 0; i < columns.length - 1; i++) {
                let cell = treeGrid.gridAPI.get_cell_by_index(0, columns[i]);
                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
                cell = treeGrid.gridAPI.get_cell_by_index(0, columns[i + 1]);
                TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
            }

            UIInteractions.triggerEventHandlerKeyDown('Home', gridContent);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            newCell = treeGrid.gridAPI.get_cell_by_index(0, columns[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, newCell);
            expect(treeGrid.headerContainer.getScroll().scrollLeft).toEqual(scrollLeft);
        });

        it('should select correct cells after expand/collapse row', async () => {
            // Select first cell and expand collapse
            let rows;
            let cell = treeGrid.gridAPI.get_cell_by_index(0, 'ID');
            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);
            TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            TreeGridFunctions.moveCellUpDown(fix, treeGrid, 0, 'ID', true);

            TreeGridFunctions.moveCellUpDown(fix, treeGrid, 1, 'ID', false);

            TreeGridFunctions.moveCellLeftRight(fix, treeGrid, 0, 'ID', 'Name', true);

            TreeGridFunctions.moveCellLeftRight(fix, treeGrid, 0, 'Name', 'ID', false);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            cell = treeGrid.gridAPI.get_cell_by_index(0, 'ID');
            expect(rows.length).toBe(8);
            TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[0]);
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            TreeGridFunctions.moveCellUpDown(fix, treeGrid, 0, 'ID', true);

            TreeGridFunctions.moveCellUpDown(fix, treeGrid, 1, 'ID', false);

            TreeGridFunctions.moveCellLeftRight(fix, treeGrid, 0, 'ID', 'Name', true);

            TreeGridFunctions.moveCellLeftRight(fix, treeGrid, 0, 'Name', 'ID', false);

            // Go to the last parent row and expand collapse
            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            cell = treeGrid.gridAPI.get_cell_by_index(9, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            TreeGridFunctions.moveCellUpDown(fix, treeGrid, 9, 'ID', false);
            cell = treeGrid.gridAPI.get_cell_by_index(8, 'ID');

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(8);
            TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[7]);
            cell = treeGrid.gridAPI.get_cell_by_index(8, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);

            TreeGridFunctions.moveCellLeftRight(fix, treeGrid, 8, 'ID', 'Name', true);
            TreeGridFunctions.moveCellLeftRight(fix, treeGrid, 8, 'Name', 'ID', false);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(8);
            TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[6]);
            cell = treeGrid.gridAPI.get_cell_by_index(8, 'ID');
            TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell);
        });
    });
});
