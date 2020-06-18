import { IgxRowDirective } from './../row.directive';
import { DebugElement } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridAPIService } from './grid-api.service';
import { IgxGridComponent } from './grid.component';
import { IGridEditEventArgs } from '../common/events';
import { IgxColumnComponent } from '../columns/column.component';
import { IgxGridModule, IgxGridBaseDirective } from './public_api';
import { DisplayDensity } from '../../core/displayDensity';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { IgxStringFilteringOperand, IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxGridCellComponent } from '../cell.component';
import { TransactionType, Transaction } from '../../services/public_api';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { setupGridScrollDetection } from '../../test-utils/helper-utils.spec';
import { GridFunctions, GridSummaryFunctions } from '../../test-utils/grid-functions.spec';
import {
    IgxGridRowEditingComponent,
    IgxGridRowEditingTransactionComponent,
    IgxGridWithEditingAndFeaturesComponent,
    IgxGridRowEditingWithoutEditableColumnsComponent,
    IgxGridCustomOverlayComponent,
    IgxGridEmptyRowEditTemplateComponent,
    VirtualGridComponent
} from '../../test-utils/grid-samples.spec';
import { IgxCell } from '../selection/selection.service';

const CELL_CLASS = '.igx-grid__td';
const ROW_EDITED_CLASS = 'igx-grid__tr--edited';
const ROW_DELETED_CLASS = 'igx-grid__tr--deleted';
const SUMMARY_ROW = 'igx-grid-summary-row';
const COLUMN_HEADER_GROUP_CLASS = '.igx-grid__thead-item';
const DEBOUNCETIME = 30;

describe('IgxGrid - Row Editing #grid', () => {
    configureTestSuite();
    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridRowEditingComponent,
                IgxGridRowEditingTransactionComponent,
                IgxGridWithEditingAndFeaturesComponent,
                IgxGridRowEditingWithoutEditableColumnsComponent,
                IgxGridCustomOverlayComponent,
                IgxGridEmptyRowEditTemplateComponent,
                VirtualGridComponent
            ],
            imports: [
                NoopAnimationsModule, IgxGridModule]
        }).compileComponents();
    }));

    describe('General tests', () => {
        let fix;
        let grid: IgxGridComponent;
        let cell: IgxGridCellComponent;
        let cellDebug: DebugElement;
        let gridContent: DebugElement;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxGridRowEditingComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fix);
            cell = grid.getCellByColumn(2, 'ProductName');
            cellDebug = GridFunctions.getRowCells(fix, 2)[2];
            // row = grid.getRowByIndex(2);
        }));

        it('Should throw a warning when [rowEditable] is set on a grid w/o [primaryKey]', () => {
            grid.primaryKey = null;
            grid.rowEditable = false;
            fix.detectChanges();

            spyOn(console, 'warn');
            grid.rowEditable = true;
            fix.detectChanges();

            // Throws warning but still sets the property correctly
            expect(grid.rowEditable).toBeTruthy();

            spyOn(grid, 'openRowOverlay');
            UIInteractions.simulateDoubleClickAndSelectEvent(cell);


            fix.detectChanges();
            expect(console.warn).toHaveBeenCalledWith('The grid must have a `primaryKey` specified when using `rowEditable`!');
            expect(console.warn).toHaveBeenCalledTimes(1);
            // Still calls openRowOverlay, just logs the warning
            expect(grid.openRowOverlay).toHaveBeenCalled();
        });

        it('Should be able to enter edit mode on dblclick, enter and f2', () => {
            fix.detectChanges();
            const row = grid.getRowByIndex(2);

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fix.detectChanges();
            expect(row.inEditMode).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('escape', gridContent);
            fix.detectChanges();
            expect(row.inEditMode).toBe(false);

            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fix.detectChanges();
            expect(row.inEditMode).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('escape', gridContent);
            fix.detectChanges();
            expect(row.inEditMode).toBe(false);

            UIInteractions.triggerEventHandlerKeyDown('f2', gridContent);
            fix.detectChanges();
            expect(row.inEditMode).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fix.detectChanges();
            expect(row.inEditMode).toBe(false);
        });

        it('Emit all events with proper arguments', () => {
            const row = grid.getRowByIndex(2);
            spyOn(grid.onCellEditEnter, 'emit').and.callThrough();
            spyOn(grid.onCellEdit, 'emit').and.callThrough();
            spyOn(grid.onCellEditCancel, 'emit').and.callThrough();
            spyOn(grid.onRowEditEnter, 'emit').and.callThrough();
            spyOn(grid.onRowEdit, 'emit').and.callThrough();
            spyOn(grid.onRowEditCancel, 'emit').and.callThrough();

            let cellInput = null;
            let igxCell: IgxCell;

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fix.detectChanges();
            expect(row.inEditMode).toBe(true);
            igxCell = grid.crudService.createCell(cell);
            igxCell.primaryKey = grid.primaryKey;
            let cellArgs: IGridEditEventArgs = {
                cellID: cell.cellID,
                rowID: cell.row.rowID,
                oldValue: cell.value,
                cancel: false,
                cell: igxCell,
                column: cell.column,
                owner: grid
            };
            let rowArgs: IGridEditEventArgs = {
                rowID: row.rowID,
                oldValue: row.rowData,
                cancel: false,
                owner: grid
            };
            expect(grid.onCellEditEnter.emit).toHaveBeenCalledWith(cellArgs);
            expect(grid.onRowEditEnter.emit).toHaveBeenCalledWith(rowArgs);


            UIInteractions.triggerEventHandlerKeyDown('escape', gridContent);
            fix.detectChanges();

            expect(row.inEditMode).toBe(false);
            igxCell = grid.crudService.createCell(cell);
            igxCell.primaryKey = grid.primaryKey;
            cellArgs = {
                cellID: cell.cellID,
                rowID: cell.row.rowID,
                oldValue: cell.value,
                newValue: cell.value,
                cancel: false,
                cell: igxCell,
                column: cell.column,
                owner: grid
            };
            // no change, new value is null
            rowArgs = {
                rowID: row.rowID,
                newValue: null,
                oldValue: row.rowData,
                cancel: false,
                owner: grid
            };
            expect(grid.onCellEditCancel.emit).toHaveBeenCalledWith(cellArgs);
            expect(grid.onRowEditCancel.emit).toHaveBeenCalledWith(rowArgs);

            UIInteractions.simulateDoubleClickAndSelectEvent(cellDebug);
            fix.detectChanges();
            expect(row.inEditMode).toBe(true);

            const newCellValue = 'Aaaaa';
            cellInput = cell.nativeElement.querySelector('[igxinput]');
            UIInteractions.setInputElementValue(cellInput, newCellValue);
            fix.detectChanges();

            igxCell = grid.crudService.createCell(cell);
            igxCell.primaryKey = grid.primaryKey;
            igxCell.editValue = 'Aaaaa';
            igxCell.rowData.ProductName = 'Aaaaa';
            cellArgs = {
                cellID: cell.cellID,
                rowID: cell.row.rowID,
                oldValue: cell.value,
                newValue: newCellValue,
                cancel: false,
                cell: igxCell,
                column: cell.column,
                owner: grid
            };
            rowArgs = {
                rowID: row.rowID,
                newValue: Object.assign({}, row.rowData, { ProductName: newCellValue }),
                oldValue: row.rowData,
                cancel: false,
                owner: grid
            };
            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);

            fix.detectChanges();

            expect(grid.onCellEdit.emit).toHaveBeenCalledWith(cellArgs);
            expect(grid.onRowEdit.emit).toHaveBeenCalledWith(rowArgs);
        });

        it('Should display the banner below the edited row if it is not the last one', () => {
            cell.setEditMode(true);
            const editRow = cell.row.nativeElement;
            const banner = GridFunctions.getRowEditingOverlay(fix);

            fix.detectChanges();

            const bannerTop = banner.getBoundingClientRect().top;
            const editRowBottom = editRow.getBoundingClientRect().bottom;

            // The banner appears below the row
            expect(bannerTop).toBeGreaterThanOrEqual(editRowBottom);

            // No much space between the row and the banner
            expect(bannerTop - editRowBottom).toBeLessThan(2);
        });

        it('Should display the banner after the edited row if it is the last one, but has room underneath it', () => {
            const lastItemIndex = 6;
            cell = grid.getCellByColumn(lastItemIndex, 'ProductName');
            cell.setEditMode(true);

            const editRow = cell.row.nativeElement;
            const banner = GridFunctions.getRowEditingOverlay(fix);
            fix.detectChanges();

            const bannerTop = banner.getBoundingClientRect().top;
            const editRowBottom = editRow.getBoundingClientRect().bottom;

            // The banner appears below the row
            expect(bannerTop).toBeGreaterThanOrEqual(editRowBottom);

            // No much space between the row and the banner
            expect(bannerTop - editRowBottom).toBeLessThan(2);
        });

        it('Should display the banner above the edited row if it is the last one', () => {
            cell = grid.getCellByColumn(grid.data.length - 1, 'ProductName');
            cell.setEditMode(true);

            const editRow = cell.row.nativeElement;
            const banner = GridFunctions.getRowEditingOverlay(fix);
            fix.detectChanges();

            const bannerBottom = banner.getBoundingClientRect().bottom;
            const editRowTop = editRow.getBoundingClientRect().top;

            // The banner appears above the row
            expect(bannerBottom).toBeLessThanOrEqual(editRowTop);

            // No much space between the row and the banner
            expect(editRowTop - bannerBottom).toBeLessThan(2);
        });

        it(`Should preserve updated value inside the cell when it enters edit mode again`, () => {
            cell.setEditMode(true);
            cell.update('IG');

            fix.detectChanges();
            cell.setEditMode(false);

            cell.setEditMode(true);

            expect(cell.value).toEqual('IG');
        });

        it(`Should correctly get column.editable for grid with no transactions`, () => {
            grid.columnList.forEach(c => {
                c.editable = true;
            });

            const primaryKeyColumn = grid.columnList.find(c => c.field === grid.primaryKey);
            const nonPrimaryKeyColumn = grid.columnList.find(c => c.field !== grid.primaryKey);
            expect(primaryKeyColumn).toBeDefined();
            expect(nonPrimaryKeyColumn).toBeDefined();

            grid.rowEditable = false;
            expect(primaryKeyColumn.editable).toBeTruthy();
            expect(nonPrimaryKeyColumn.editable).toBeTruthy();

            grid.rowEditable = true;
            expect(primaryKeyColumn.editable).toBeFalsy();
            expect(nonPrimaryKeyColumn.editable).toBeTruthy();
        });

        it('Should properly exit pending state when committing row edit w/o changes', () => {
            const initialDataLength = grid.data.length;
            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();
            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fix.detectChanges();
            expect(cell.editMode).toBeTruthy();
            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fix.detectChanges();
            expect(cell.editMode).toBeFalsy();
            grid.deleteRow(2);

            fix.detectChanges();
            expect(grid.data.length).toEqual(initialDataLength - 1);
        });

        it('Overlay position: Open overlay for top row', () => {
            grid.height = '300px';
            fix.detectChanges();


            let row: HTMLElement = grid.getRowByIndex(0).nativeElement;
            cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);


            let overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(row.getBoundingClientRect().bottom === overlayContent.getBoundingClientRect().top).toBeTruthy();
            cell.setEditMode(false);


            row = grid.getRowByIndex(2).nativeElement;
            cell = grid.getCellByColumn(2, 'ProductName');
            cell.setEditMode(true);

            overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(row.getBoundingClientRect().bottom === overlayContent.getBoundingClientRect().top).toBeTruthy();
            cell.setEditMode(false);


            row = grid.getRowByIndex(3).nativeElement;
            cell = grid.getCellByColumn(3, 'ProductName');
            cell.setEditMode(true);

            overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(row.getBoundingClientRect().top === overlayContent.getBoundingClientRect().bottom).toBeTruthy();
            cell.setEditMode(false);


            row = grid.getRowByIndex(0).nativeElement;
            cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);

            overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(row.getBoundingClientRect().bottom === overlayContent.getBoundingClientRect().top).toBeTruthy();
            cell.setEditMode(false);

        });

        it('should end row editing when clearing or applying advanced filter', () => {
            fix.detectChanges();
            const row = grid.getRowByIndex(2);

            // Enter row edit mode
            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fix.detectChanges();
            expect(row.inEditMode).toBe(true);

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Clear the filters.
            GridFunctions.clickAdvancedFilteringClearFilterButton(fix);
            fix.detectChanges();

            expect(row.inEditMode).toBe(false);

            // Close the dialog.
            GridFunctions.clickAdvancedFilteringCancelButton(fix);
            fix.detectChanges();

            // Enter row edit mode
            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fix.detectChanges();
            expect(row.inEditMode).toBe(true);

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            fix.detectChanges();

            expect(row.inEditMode).toBe(false);
        });
    });

    describe('Navigation - Keyboard', () => {
        let fix;
        let grid: IgxGridComponent;
        let gridContent: DebugElement;
        let targetCell: IgxGridCellComponent;
        let targetCellDebug: DebugElement;
        let editedCell: IgxGridCellComponent;
        let editedCellDebug: DebugElement;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxGridWithEditingAndFeaturesComponent);
            fix.detectChanges();

            grid = fix.componentInstance.grid;
            setupGridScrollDetection(fix, grid);
            gridContent = GridFunctions.getGridContent(fix);

        }));

        it(`Should jump from first editable columns to overlay buttons`, () => {
            targetCell = grid.getCellByColumn(0, 'Downloads');
            UIInteractions.simulateDoubleClickAndSelectEvent(targetCell);
            fix.detectChanges();

            // TO button
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent, false, true);
            fix.detectChanges();

            expect(targetCell.editMode).toBeFalsy();

            const doneButtonElement = GridFunctions.getRowEditingDoneButton(fix);
            expect(document.activeElement).toEqual(doneButtonElement);

            // FROM button to last cell
            grid.rowEditTabs.last.handleTab(UIInteractions.getKeyboardEvent('keydown', 'tab'));

            fix.detectChanges();

            expect(targetCell.editMode).toBeTruthy();
        });

        it(`Should jump from last editable columns to overlay buttons`, (async () => {
            grid.tbody.nativeElement.focus();
            fix.detectChanges();

            GridFunctions.scrollLeft(grid, 800);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            targetCell =  grid.getCellByColumn(0, 'Test');
            UIInteractions.simulateClickAndSelectEvent(targetCell);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('f2', gridContent);
            fix.detectChanges();

            // TO button
            expect(targetCell.editMode).toBeTruthy();
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fix.detectChanges();

            expect(targetCell.editMode).toBeFalsy();
            const cancelButtonElementDebug = GridFunctions.getRowEditingCancelDebugElement(fix);
            expect(document.activeElement).toEqual(cancelButtonElementDebug.nativeElement);

            // FROM button to last cell
            grid.rowEditTabs.first.handleTab(UIInteractions.getKeyboardEvent('keydown', 'tab', false, true));

            fix.detectChanges();
            await wait(DEBOUNCETIME * 2);
            fix.detectChanges();
            expect(targetCell.editMode).toBeTruthy();
        }));

        it(`Should scroll editable column into view when navigating from buttons`, (async () => {
            let cell = grid.getCellByColumn(0, 'Downloads');
            // let cellDebug;
            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();


            // go to 'Cancel'
            const doneButtonElement = GridFunctions.getRowEditingDoneButton(fix);
            expect(document.activeElement).toEqual(doneButtonElement);
            grid.rowEditTabs.last.handleTab(UIInteractions.getKeyboardEvent('keydown', 'tab', false, true));
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            // go to LAST editable cell

            grid.rowEditTabs.first.handleTab(UIInteractions.getKeyboardEvent('keydown', 'tab', false, true));
            fix.detectChanges();
            await wait(DEBOUNCETIME * 2);
            fix.detectChanges();

            cell = grid.getCellByColumn(0, 'Test');
            expect(cell.editMode).toBeTruthy();
            expect(grid.headerContainer.getScroll().scrollLeft).toBeGreaterThan(0);

            // move to Cancel
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            // Focus cancel
            const cancelButtonElement = GridFunctions.getRowEditingCancelButton(fix);
            cancelButtonElement.focus();
            await wait(DEBOUNCETIME);
            grid.rowEditTabs.first.handleTab(UIInteractions.getKeyboardEvent('keydown', 'tab'));
            await wait();
            fix.detectChanges();

            // move to FIRST editable cell
            grid.rowEditTabs.last.handleTab(UIInteractions.getKeyboardEvent('keydown', 'tab'));
            fix.detectChanges();
            await wait(DEBOUNCETIME * 2);
            fix.detectChanges();

            cell = grid.getCellByColumn(0, 'Downloads');
            expect(cell.editMode).toBeTruthy();
            expect(grid.headerContainer.getScroll().scrollLeft).toEqual(0);
        }));

        it(`Should skip non-editable columns`, () => {
            const cellID = grid.getCellByColumn(0, 'ID');
            const cellReleaseDate = grid.getCellByColumn(0, 'ReleaseDate');
            targetCell = grid.getCellByColumn(0, 'Downloads');
            targetCellDebug = GridFunctions.getRowCells(fix, 0)[0];

            UIInteractions.simulateDoubleClickAndSelectEvent(targetCell);
            fix.detectChanges();

            expect(targetCell.editMode).toBeTruthy();
            // Move forwards
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fix.detectChanges();
            fix.detectChanges();

            expect(targetCell.editMode).toBeFalsy();
            expect(cellID.editMode).toBeFalsy();
            expect(cellReleaseDate.editMode).toBeTruthy();

            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent, false, true);

            fix.detectChanges();
            expect(targetCell.editMode).toBeTruthy();
            expect(cellID.editMode).toBeFalsy();
            expect(cellReleaseDate.editMode).toBeFalsy();
        });

        it(`Should skip non-editable columns when column pinning is enabled`, () => {
            fix.componentInstance.pinnedFlag = true;
            fix.detectChanges();

            targetCell = grid.getCellByColumn(0, 'Downloads');
            UIInteractions.simulateDoubleClickAndSelectEvent(targetCell);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fix.detectChanges();

            // EXPECT focused cell to be 'Released'
            editedCell = grid.getCellByColumn(0, 'Released');
            editedCellDebug = GridFunctions.getRowCells(fix, 0)[2];
            expect(editedCell.editMode).toBeTruthy();
            // from pinned to unpinned
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fix.detectChanges();
            // EXPECT focused cell to be 'ReleaseDate'
            editedCell = grid.getCellByColumn(0, 'ReleaseDate');
            editedCellDebug = GridFunctions.getRowCells(fix, 0)[4];
            expect(editedCell.editMode).toBeTruthy();
            // from unpinned to pinned
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent, false, true);
            fix.detectChanges();
            // EXPECT edited cell to be 'Released'
            editedCell = grid.getCellByColumn(0, 'Released');
            expect(editedCell.editMode).toBeTruthy();
        });

        it(`Should skip non-editable columns when column hiding is enabled`, () => {
            fix.componentInstance.hiddenFlag = true;
            fix.detectChanges();

            targetCell = grid.getCellByColumn(0, 'Downloads');
            UIInteractions.simulateDoubleClickAndSelectEvent(targetCell);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fix.detectChanges();

            // EXPECT focused cell to be 'Released'
            editedCell = grid.getCellByColumn(0, 'Released');
            editedCellDebug = GridFunctions.getRowCells(fix, 0)[1];
            expect(editedCell.editMode).toBeTruthy();

            // jump over 1 hidden, editable
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fix.detectChanges();
            // EXPECT focused cell to be 'Items'
            editedCell = grid.getCellByColumn(0, 'Items');
            editedCellDebug = GridFunctions.getRowCells(fix, 0)[2];
            expect(editedCell.editMode).toBeTruthy();
            // jump over 1 hidden, editable
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent, false, true, false);
            fix.detectChanges();
            // EXPECT edited cell to be 'Released'
            editedCell = grid.getCellByColumn(0, 'Released');
            editedCellDebug = GridFunctions.getRowCells(fix, 0)[1];
            expect(editedCell.editMode).toBeTruthy();
            // jump over 3 hidden, both editable and not
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent, false, true, false);
            fix.detectChanges();
            // EXPECT edited cell to be 'Downloads'
            editedCell = grid.getCellByColumn(0, 'Downloads');
            expect(editedCell.editMode).toBeTruthy();
        });

        it(`Should skip non-editable columns when column pinning & hiding is enabled`, () => {
            fix.componentInstance.hiddenFlag = true;
            fix.detectChanges();
            fix.componentInstance.pinnedFlag = true;
            fix.detectChanges();
            // jump over 1 hidden, pinned

            targetCell = grid.getCellByColumn(0, 'Downloads');
            UIInteractions.simulateDoubleClickAndSelectEvent(targetCell);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fix.detectChanges();

            // EXPECT focused cell to be 'Released'
            editedCell = grid.getCellByColumn(0, 'Released');
            editedCellDebug = GridFunctions.getRowCells(fix, 0)[1];
            expect(editedCell.editMode).toBeTruthy();
            // jump over 3 hidden, both editable and not
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fix.detectChanges();
            // EXPECT focused cell to be 'Items'
            editedCell = grid.getCellByColumn(0, 'Items');
            editedCellDebug = GridFunctions.getRowCells(fix, 0)[2];
            expect(editedCell.editMode).toBeTruthy();
            // jump back to pinned
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent, false, true);
            fix.detectChanges();

            // EXPECT edited cell to be 'Released'
            editedCell = grid.getCellByColumn(0, 'Released');
            editedCellDebug = GridFunctions.getRowCells(fix, 0)[1];
            expect(editedCell.editMode).toBeTruthy();
            // jump over 1 hidden, pinned
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent, false, true);
            fix.detectChanges();
            // EXPECT edited cell to be 'Downloads'
            editedCell = grid.getCellByColumn(0, 'Downloads');
            expect(editedCell.editMode).toBeTruthy();
        });

        it(`Should skip non-editable columns when column grouping is enabled`, (async () => {
            fix.componentInstance.columnGroupingFlag = true;
            fix.detectChanges();

            targetCell = grid.getCellByColumn(0, 'ReleaseDate');
            UIInteractions.simulateDoubleClickAndSelectEvent(targetCell);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fix.detectChanges();

            // Should disregards the Igx-Column-Group component
            // EXPECT focused cell to be 'Released'
            editedCell = grid.getCellByColumn(0, 'Released');
            expect(editedCell.editMode).toBeTruthy();
            // Go forwards, jump over Category and group end
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            // EXPECT focused cell to be 'Items'
            editedCell = grid.getCellByColumn(0, 'Items');
            expect(editedCell.editMode).toBeTruthy();
            // Go backwards, jump over group end and return to 'Released'
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent, false, true);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            // EXPECT focused cell to be 'Released'
            editedCell = grid.getCellByColumn(0, 'Released');
            expect(editedCell.editMode).toBeTruthy();

            // Go to release date
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent, false, true);
            fix.detectChanges();

            editedCell = grid.getCellByColumn(0, 'ReleaseDate');
            expect(editedCell.editMode).toBeTruthy();
        }));

        it(`Should skip non-editable columns when all column features are enabled`, () => {
            fix.componentInstance.hiddenFlag = true;
            fix.componentInstance.pinnedFlag = true;
            fix.componentInstance.columnGroupingFlag = true;
            fix.detectChanges();

            targetCell = grid.getCellByColumn(0, 'Downloads');
            UIInteractions.simulateDoubleClickAndSelectEvent(targetCell);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fix.detectChanges();
            // Move from Downloads over hidden to Released in Column Group
            editedCell = grid.getCellByColumn(0, 'Released');
            expect(editedCell.editMode).toBeTruthy();
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fix.detectChanges();

            // Move from pinned 'Released' (in Column Group) to unpinned 'Items'
            editedCell = grid.getCellByColumn(0, 'Items');
            expect(editedCell.editMode).toBeTruthy();
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent, false, true);
            fix.detectChanges();

            // Move back to pinned 'Released' (in Column Group)
            editedCell = grid.getCellByColumn(0, 'Released');
            expect(editedCell.editMode).toBeTruthy();
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent, false, true);
            fix.detectChanges();
            // Move back to pinned 'Downloads'
            editedCell = grid.getCellByColumn(0, 'Downloads');
            expect(editedCell.editMode).toBeTruthy();
        });

        it(`Should update row changes when focus overlay buttons on tabbing`, (async () => {
            grid.tbody.nativeElement.focus();
            fix.detectChanges();

            targetCell = grid.getCellByColumn(0, 'Downloads');
            fix.detectChanges();

            UIInteractions.simulateClickAndSelectEvent(targetCell);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('Enter', gridContent);
            fix.detectChanges();

            // change first editable cell value
            targetCell.editValue = '500';
            fix.detectChanges();

            // go to Done
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent, false, true);
            fix.detectChanges();

            expect(GridFunctions.getRowEditingBannerText(fix)).toBe('You have 1 changes in this row');

            // go to last editable cell
            grid.rowEditTabs.first.handleTab(UIInteractions.getKeyboardEvent('keydown', 'tab', false, true));
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const currentEditCell = grid.getCellByColumn(0, 'Test');
            expect(currentEditCell.editMode).toBeTruthy();
            expect(grid.headerContainer.getScroll().scrollLeft).toBeGreaterThan(0);

            // change last editable cell value
            currentEditCell.editValue = 'No test';
            fix.detectChanges();

            // move to Cancel
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fix.detectChanges();

            expect(GridFunctions.getRowEditingBannerText(fix)).toBe('You have 2 changes in this row');
        }));

        it(`Should focus last edited cell after click on editable buttons`, (async () => {
            targetCell = grid.getCellByColumn(0, 'Downloads');
            UIInteractions.simulateDoubleClickAndSelectEvent(targetCell);
            fix.detectChanges();

            // Scroll the grid
            GridFunctions.scrollLeft(grid, 750);

            // Focus done button
            const doneButtonElement = GridFunctions.getRowEditingDoneButton(fix);
            const doneButtonElementDebug = GridFunctions.getRowEditingDoneDebugElement(fix);
            doneButtonElement.focus();
            fix.detectChanges();

            expect(document.activeElement).toEqual(doneButtonElement);
            doneButtonElementDebug.triggerEventHandler('click', new Event('click'));

            fix.detectChanges();

            expect(targetCell.active).toBeTruthy();
        }));

    });

    describe('Exit row editing', () => {
        let fix;
        let grid: IgxGridComponent;
        let gridContent: DebugElement;
        let cell: IgxGridCellComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxGridRowEditingComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fix);
            cell = grid.getCellByColumn(0, 'ProductName');
        }));
        it(`Should call correct methods on clicking DONE and CANCEL buttons in row edit overlay`, () => {
            const mockEvent = new MouseEvent('click');
            spyOn(grid, 'endEdit');

            // put cell in edit mode
            cell.setEditMode(true);
            fix.detectChanges();

            //  ged CANCEL button and click it
            const cancelButtonElement = GridFunctions.getRowEditingCancelButton(fix);
            cancelButtonElement.dispatchEvent(mockEvent);
            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(false, mockEvent);

            cell.setEditMode(true);
            fix.detectChanges();

            //  ged DONE button and click it
            const doneButtonElement = GridFunctions.getRowEditingDoneButton(fix);
            doneButtonElement.dispatchEvent(mockEvent);
            fix.detectChanges();
            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true, mockEvent);
        });

        it(`Should exit row editing AND do not commit when press Escape key on Done and Cancel buttons`, () => {
            const mockEvent = new KeyboardEvent('keydown', { key: 'escape' });
            spyOn(grid, 'endEdit').and.callThrough();

            // put cell in edit mode
            cell.setEditMode(true);
            fix.detectChanges();

            // press Escape on Done button
            const doneButtonElement = GridFunctions.getRowEditingDoneButton(fix);
            // const doneButtonElementDebug = GridFunctions.getRowEditingDoneDebugElement(fix);
            doneButtonElement.dispatchEvent(mockEvent);
            fix.detectChanges();

            const overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(cell.editMode).toEqual(false);
            expect(overlayContent).toBeFalsy();
            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(false, mockEvent);

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fix.detectChanges();
            // press Escape on Cancel button
            const cancelButtonElement = GridFunctions.getRowEditingDoneButton(fix);
            cancelButtonElement.dispatchEvent(mockEvent);
            fix.detectChanges();

            expect(cell.editMode).toEqual(false);
            expect(overlayContent).toBeFalsy();
            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(false, mockEvent);
        });

        it(`Should exit row editing AND COMMIT on add row`, () => {
            spyOn(grid, 'endEdit').and.callThrough();

            // put cell in edit mode
            cell.setEditMode(true);

            grid.addRow({ ProductID: 99, ProductName: 'ADDED', InStock: true, UnitsInStock: 20000, OrderDate: new Date('2018-03-01') });
            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true);
            expect(cell.editMode).toBeFalsy();
        });

        it(`Should exit row editing AND COMMIT on delete row`, () => {
            spyOn(grid, 'endEdit').and.callThrough();

            // put cell in edit mode
            cell.setEditMode(true);
            fix.detectChanges();
            grid.deleteRow(grid.getRowByIndex(2).rowID);
            fix.detectChanges();

            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true);
            expect(cell.editMode).toBeFalsy();
        });

        it(`Should exit row editing AND DISCARD on filter`, () => {
            const gridAPI: IgxGridAPIService = (<any>grid).gridAPI;

            spyOn(gridAPI, 'submit_value').and.callThrough();
            spyOn(gridAPI, 'escape_editMode').and.callThrough();
            spyOn(grid, 'endEdit').and.callThrough();

            // put cell in edit mode
            // const cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);

            grid.filter('ProductName', 'a', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            expect(gridAPI.submit_value).toHaveBeenCalled();
            expect(gridAPI.submit_value).toHaveBeenCalledWith();
            expect(gridAPI.escape_editMode).toHaveBeenCalled();
            expect(gridAPI.escape_editMode).toHaveBeenCalledWith();
            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(false);
            expect(cell.editMode).toBeFalsy();
        });

        it(`Should exit row editing AND DISCARD on sort`, () => {
            const gridAPI: IgxGridAPIService = (<any>grid).gridAPI;
            spyOn(grid, 'endEdit').and.callThrough();
            spyOn(gridAPI, 'submit_value').and.callThrough();
            spyOn(gridAPI, 'escape_editMode').and.callThrough();

            // put cell in edit mode
            cell.setEditMode(true);


            cell.update('123');
            grid.sort({
                fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });

            fix.detectChanges();

            expect(cell.editMode).toBe(false);
            expect(cell.value).toBe('Aniseed Syrup'); // SORT does not submit

            expect(gridAPI.escape_editMode).toHaveBeenCalled();
            expect(gridAPI.escape_editMode).toHaveBeenCalledWith();
            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(false);
        });

        it(`Should exit row editing AND COMMIT on displayDensity change`, () => {
            grid.displayDensity = DisplayDensity.comfortable;
            fix.detectChanges();

            cell.setEditMode(true);
            fix.detectChanges();

            let overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(overlayContent).toBeTruthy();
            expect(cell.editMode).toBeTruthy();

            grid.displayDensity = DisplayDensity.cosy;
            fix.detectChanges();

            overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(overlayContent).toBeFalsy();
            expect(cell.editMode).toBeFalsy();
        });

        it(`Should NOT exit row editing on click on non-editable cell in same row`, () => {
            spyOn(grid, 'endEdit').and.callThrough();

            // put cell in edit mode
            cell.setEditMode(true);

            fix.detectChanges();

            let overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(overlayContent).toBeTruthy();
            expect(cell.editMode).toBeTruthy();

            const nonEditableCell = grid.getCellByColumn(0, 'ProductID');
            UIInteractions.simulateClickAndSelectEvent(nonEditableCell);
            fix.detectChanges();

            expect(grid.endEdit).not.toHaveBeenCalled();
            overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(overlayContent).toBeTruthy();
            expect(cell.editMode).toBeFalsy();
            expect(nonEditableCell.editMode).toBeFalsy();
        });

        it(`Should exit row editing AND COMMIT on click on non-editable cell in other row`, () => {
            spyOn(grid, 'endEdit').and.callThrough();

            // put cell in edit mode
            cell.setEditMode(true);

            fix.detectChanges();

            let overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(overlayContent).toBeTruthy();
            const nonEditableCell = grid.getCellByColumn(2, 'ProductID');
            UIInteractions.simulateClickAndSelectEvent(nonEditableCell);
            fix.detectChanges();

            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true);
            overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(overlayContent).toBeFalsy();
            expect(cell.editMode).toBeFalsy();
        });

        it(`Should exit row editing AND COMMIT on click on editable cell in other row`, () => {
            spyOn(grid, 'endEdit').and.callThrough();

            // put cell in edit mode
            cell.setEditMode(true);
            fix.detectChanges();


            let overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(overlayContent).toBeTruthy();

            const otherEditableCell = grid.getCellByColumn(2, 'ProductName');
            UIInteractions.simulateClickAndSelectEvent(otherEditableCell);
            fix.detectChanges();

            overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(overlayContent).toBeTruthy();
            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true);
            expect(cell.editMode).toBeFalsy();
            expect(otherEditableCell.editMode).toBeTruthy();
        });

        it(`Should exit row editing AND COMMIT on ENTER KEYDOWN`, () => {
            const gridAPI: IgxGridAPIService = (<any>grid).gridAPI;

            grid.tbody.nativeElement.focus();
            fix.detectChanges();

            const targetCell = grid.getCellByColumn(0, 'ProductName');
            UIInteractions.simulateDoubleClickAndSelectEvent(targetCell);
            fix.detectChanges();

            spyOn(gridAPI, 'submit_value').and.callThrough();
            spyOn(gridAPI, 'escape_editMode').and.callThrough();

            UIInteractions.triggerKeyDownEvtUponElem('enter', grid.tbody.nativeElement, true);

            expect(gridAPI.submit_value).toHaveBeenCalled();
            expect(gridAPI.escape_editMode).toHaveBeenCalled();
            expect(cell.editMode).toBeFalsy();
        });

        it(`Should exit row editing AND DISCARD on ESC KEYDOWN`, () => {
            const gridAPI: IgxGridAPIService = (<any>grid).gridAPI;

            const targetCell = grid.getCellByColumn(0, 'ProductName');
            UIInteractions.simulateDoubleClickAndSelectEvent(targetCell);
            fix.detectChanges();

            spyOn(gridAPI, 'submit_value').and.callThrough();
            spyOn(gridAPI, 'escape_editMode').and.callThrough();

            UIInteractions.triggerKeyDownEvtUponElem('escape', grid.tbody.nativeElement, true);
            fix.detectChanges();

            expect(gridAPI.submit_value).not.toHaveBeenCalled();
            expect(gridAPI.escape_editMode).toHaveBeenCalled();
            expect(cell.editMode).toBeFalsy();
        });

        it(`Should exit edit mode when edited row is being deleted`, () => {
            const row = grid.getRowByIndex(0);
            spyOn(grid, 'endEdit').and.callThrough();
            cell.setEditMode(true);
            fix.detectChanges();
            expect(grid.rowEditingOverlay.collapsed).toBeFalsy();
            row.delete();
            fix.detectChanges();
            expect(grid.rowEditingOverlay.collapsed).toBeTruthy();
            expect(grid.endEdit).toHaveBeenCalledTimes(1);
            expect(grid.endEdit).toHaveBeenCalledWith(true);
        });
    });

    describe('Integration', () => {
        let fix;
        let grid: IgxGridComponent;
        let gridContent: DebugElement;
        let cell: IgxGridCellComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxGridRowEditingComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fix);
            cell = grid.getCellByColumn(0, 'ProductName');
        }));
        it(`Paging: Should preserve the changes after page navigation`, () => {
            grid.paging = true;
            grid.perPage = 7;
            fix.detectChanges();

            let rowElement = grid.getRowByIndex(0).nativeElement;
            expect(rowElement.classList).not.toContain(ROW_EDITED_CLASS);

            cell.setEditMode(true);

            cell.update('IG');
            cell.setEditMode(false);
            fix.detectChanges();


            expect(rowElement.classList).toContain(ROW_EDITED_CLASS);

            // Next page button click
            GridFunctions.navigateToNextPage(grid.nativeElement);
            fix.detectChanges();
            expect(grid.page).toEqual(1);
            expect(cell.value).toBe('Tofu');
            rowElement = grid.getRowByIndex(0).nativeElement;
            expect(rowElement.classList).not.toContain(ROW_EDITED_CLASS);

            // Previous page button click
            GridFunctions.navigateToPrevPage(grid.nativeElement);
            fix.detectChanges();
            expect(cell.value).toBe('IG');
            rowElement = grid.getRowByIndex(0).nativeElement;
            expect(rowElement.classList).not.toContain(ROW_EDITED_CLASS);
        });

        it(`Paging: Should save changes when changing page while editing`, () => {
            grid.paging = true;
            grid.perPage = 7;
            fix.detectChanges();

            cell.setEditMode(true);
            cell.update('IG');

            // Do not exit edit mode

            // Next page button click
            GridFunctions.navigateToNextPage(grid.nativeElement);

            fix.detectChanges();
            expect(grid.page).toEqual(1);
            expect(cell.value).toBe('Tofu');

            // Previous page button click
            GridFunctions.navigateToPrevPage(grid.nativeElement);

            fix.detectChanges();

            expect(cell.editMode).toBeFalsy();
            expect(cell.value).toBe('IG');
        });

        it(`Paging: Should exit edit mode when changing the page size while editing`, () => {
            grid.paging = true;
            grid.perPage = 7;
            fix.detectChanges();

            const select = GridFunctions.getGridPageSelectElement(fix);

            cell.setEditMode(true);
            // cell.update('IG');
            // cell.update exits edit mode of the CELL
            // Do not exit edit mode

            fix.detectChanges();

            expect(GridFunctions.getRowEditingOverlay(fix)).toBeTruthy();
            expect(GridFunctions.getRowEditingBanner(fix)).toBeTruthy();
            // Change page size
            select.click();
            fix.detectChanges();
            const selectList = fix.debugElement.query(By.css('.igx-drop-down__list-scroll'));
            selectList.children[2].nativeElement.click();

            fix.detectChanges();

            expect(cell.editMode).toEqual(false);
            expect(GridFunctions.getRowEditingOverlay(fix)).toBeFalsy();
            // Element is still there in the grid template, but is hidden
            expect(GridFunctions.getRowEditingBanner(fix).parentElement.attributes['aria-hidden']).toBeTruthy();
        });

        it(`Paging: Should exit edit mode when changing the page size resulting in the edited cell going to the next page`,
            () => {
                grid.paging = true;
                grid.perPage = 7;
                fix.detectChanges();

                const select = GridFunctions.getGridPageSelectElement(fix);

                cell.setEditMode(true);

                (<any>grid).gridAPI.get_cell_inEditMode().editValue = 'IG';
                // cell.update('IG');
                // Do not exit edit mode
                fix.detectChanges();

                expect(GridFunctions.getRowEditingOverlay(fix)).toBeTruthy();
                expect(GridFunctions.getRowEditingBanner(fix)).toBeTruthy();

                // Change page size
                select.click();
                fix.detectChanges();
                const selectList = fix.debugElement.query(By.css('.igx-drop-down__list-scroll'));
                selectList.children[0].nativeElement.click();

                fix.detectChanges();

                // Next page button click
                GridFunctions.navigateToNextPage(grid.nativeElement);

                fix.detectChanges();

                expect(grid.page).toEqual(1);
                cell = grid.getCellByColumn(1, 'ProductName');

                fix.detectChanges();

                expect(cell.editMode).toEqual(false);

                expect(GridFunctions.getRowEditingOverlay(fix)).toBeFalsy();
                // banner is still present in grid template, just not visible
                expect(GridFunctions.getRowEditingBanner(fix)).toBeTruthy();
            });

        it(`Filtering: Should exit edit mode on filter applied`, () => {
            spyOn(grid, 'endEdit').and.callThrough();

            cell.setEditMode(true);
            // flush();

            // search if the targeted column contains the keyword, ignoring case
            grid.filter('ProductName', 'bob', IgxStringFilteringOperand.instance().condition('contains'), false);
            // flush();
            fix.detectChanges();

            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(false);
        });

        it(`Filtering: Should NOT include the new value in the results when filtering`, () => {
            const newValue = 'My Awesome Product';
            cell.setEditMode(true);

            cell.update(newValue);
            fix.detectChanges();

            // loop over the grid's data to see if any cell contains the new value
            const editedCell = grid.data.filter(el => el.ProductName === newValue);

            // a cell with the updated value is NOT found (filter does NOT submit)
            expect(editedCell.length).toEqual(0);
        });

        it(`Filtering: Should preserve the cell's data if it has been modified while being filtered out`, () => {
            // Steps:
            // 1) Filter by any value
            // 2) Edit any of the filtered rows so that the row is removed from the filtered columns
            // 3) Remove filtering
            // 4) Verify the update is preserved

            const targetColumnName = 'ProductName';
            const keyword = 'ch';
            const newValue = 'My Awesome Product';

            // search if the targeted column contains the keyword, ignoring case
            grid.filter(targetColumnName, keyword, IgxStringFilteringOperand.instance().condition('contains'), true);


            fix.detectChanges();
            cell.update(newValue);


            // remove filtering
            grid.clearFilter();

            fix.detectChanges();
            expect(cell.value).toEqual(newValue);
        });

        it(`GroupBy: Should exit edit mode when Grouping`, () => {
            const gridAPI: IgxGridAPIService = (<any>grid).gridAPI;

            spyOn(gridAPI, 'submit_value').and.callThrough();
            spyOn(gridAPI, 'escape_editMode').and.callThrough();

            cell.setEditMode(true);

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });

            expect(gridAPI.escape_editMode).toHaveBeenCalled();
            expect(gridAPI.submit_value).toHaveBeenCalled();
        });

        it(`Sorting: Should NOT include the new value in the results when sorting`, () => {
            const newValue = 'Don Juan De Marco';
            cell.setEditMode(true);

            cell.update(newValue);

            grid.sort({
                fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });

            fix.detectChanges();

            // loop over the grid's data to see if any cell contains the new value
            const editedCell = grid.data.filter(el => el.ProductName === newValue);

            // a cell with the updated value is found
            // sorting DOES NOT submit
            expect(editedCell.length).toEqual(0);
        });

        it(`Sorting: Editing a sorted row`, () => {
            // Sort any column
            grid.sort({
                fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });

            fix.detectChanges();

            // Edit any of the sorted rows so that the row position is changed
            cell.setEditMode(true);

            // Cell will always be first
            cell.update('AAAAAAAAAAA Don Juan De Marco');
            cell.setEditMode(false);

            fix.detectChanges();

            cell = grid.getCellByColumn(0, 'ProductName');
            expect(cell.value).toBe('AAAAAAAAAAA Don Juan De Marco');
        });

        it(`Summaries: Should update summaries after row editing completes`, fakeAsync(() => {
            grid.enableSummaries('OrderDate');
            tick(16);
            fix.detectChanges();

            let summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['10', 'May 17, 1990', 'Dec 25, 2025']);

            cell = grid.getCellByColumn(0, 'OrderDate');
            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            tick(16);
            // Cell will always be first
            const editTemplate = fix.debugElement.query(By.css('input'));
            UIInteractions.clickAndSendInputElementValue(editTemplate, '01/01/1901');
            tick(16);
            fix.detectChanges();
            GridFunctions.simulateGridContentKeydown(fix, 'tab', false, true);
            tick(16);
            fix.detectChanges();

            cell = grid.getCellByColumn(0, 'ProductName');
            expect(cell.editMode).toBeTruthy();
            summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['10', 'May 17, 1990', 'Dec 25, 2025']);

            GridFunctions.simulateGridContentKeydown(fix, 'enter');
            tick(16);
            fix.detectChanges();

            summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['10', 'Jan 1, 1901', 'Dec 25, 2025']);
        }));

        it(`Moving: Should exit edit mode when moving a column`, () => {
            const column = grid.columnList.filter(c => c.field === 'ProductName')[0];
            const targetColumn = grid.columnList.filter(c => c.field === 'ProductID')[0];
            column.movable = true;

            fix.detectChanges();

            spyOn(grid, 'endEdit').and.callThrough();

            // put cell in edit mode
            cell.setEditMode(true);


            expect(cell.editMode).toEqual(true);
            expect(grid.rowEditingOverlay.collapsed).toEqual(false);
            grid.moveColumn(column, targetColumn);

            fix.detectChanges();

            expect(cell.editMode).toBeFalsy();
            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true);
            expect(grid.rowEditingOverlay.collapsed).toEqual(true);
        });

        it(`Pinning: Should exit edit mode when pinning/unpinning a column`, () => {
            spyOn(grid, 'endEdit').and.callThrough();

            // put cell in edit mode
            cell.setEditMode(true);

            grid.pinColumn('ProductName');

            fix.detectChanges();

            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true);
            expect(grid.endEdit).toHaveBeenCalledTimes(1);
            expect(cell.editMode).toBeFalsy();

            // put cell in edit mode
            cell = grid.getCellByColumn(2, 'ProductName');
            cell.setEditMode(true);


            grid.unpinColumn('ProductName');

            fix.detectChanges();

            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true);
            expect(grid.endEdit).toHaveBeenCalledTimes(2);
            expect(cell.editMode).toBeFalsy();
        });

        it(`Resizing: Should exit edit mode when resizing a column`, fakeAsync(() => {
            spyOn(grid, 'endEdit').and.callThrough();

            // put cell in edit mode
            cell.setEditMode(true);

            const column = grid.columnList.filter(c => c.field === 'ProductName')[0];
            column.resizable = true;
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));
            const headerResArea = headers[2].children[1].nativeElement;
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 500, 0);
            tick(200);
            const resizer = fix.debugElement.queryAll(By.css('.igx-grid__th-resize-line'))[0].nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 550, 0);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 550, 0);
            fix.detectChanges();

            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true);
            expect(cell.editMode).toBeFalsy();
        }));

        it(`Hiding: Should exit edit mode when hiding a column`, () => {
            const gridAPI: IgxGridAPIService = (<any>grid).gridAPI;

            cell.setEditMode(true);

            fix.detectChanges();
            expect(gridAPI.get_cell_inEditMode()).toBeTruthy(); // check if there is cell in edit mode
            spyOn(gridAPI, 'escape_editMode').and.callThrough();

            cell.column.hidden = true;

            fix.detectChanges();

            expect(gridAPI.escape_editMode).toHaveBeenCalled();
            expect(grid.rowEditingOverlay.collapsed).toBeTruthy();
        });

        it(`Hiding: Should show correct value when showing the column again`, () => {
            grid.showToolbar = true;
            grid.columnHiding = true;

            fix.detectChanges();

            const targetCbText = 'Product Name';
            cell.setEditMode(true);

            cell.update('Tea');

            // hide column
            grid.toolbar.columnHidingButton.nativeElement.click();
            fix.detectChanges();
            const columnChooser = GridFunctions.getColumnHidingElement(fix);

            GridFunctions.clickColumnChooserItem(columnChooser, targetCbText);
            fix.detectChanges();

            // show column
            GridFunctions.clickColumnChooserItem(columnChooser, targetCbText);
            fix.detectChanges();

            grid.toolbar.toggleColumnHidingUI();


            expect(cell.value).toEqual('Chai');
        });

        it(`Hiding: Should be possible to update a cell that is hidden programmatically`, () => {
            pending('This is NOT possible');
            const columnChooser = GridFunctions.getColumnHidingElement(fix);
            const targetCbText = 'Product Name';
            const newValue = 'Tea';
            cell.setEditMode(true);
            cell.column.hidden = true;

            cell.update(newValue);

            // show column
            grid.toolbar.columnHidingButton.nativeElement.click();
            GridFunctions.clickColumnChooserItem(columnChooser, targetCbText);

            fix.detectChanges();

            expect(cell.value).toEqual(newValue);
        });
    });

    describe('Events', () => {
        let fix;
        let grid: IgxGridComponent;
        let cell: IgxGridCellComponent;
        let initialRow: IgxRowDirective<IgxGridBaseDirective>;
        let initialData: any;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxGridRowEditingComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            cell = grid.getCellByColumn(0, 'ProductName');
            initialRow = grid.getRowByIndex(0);
            initialData = Object.assign({}, initialRow.rowData);
            fix.componentInstance.pinnedFlag = true;
            fix.detectChanges();
        }));

        it(`Should properly emit 'onRowEdit' event - Button Click`, () => {

            spyOn(grid.onRowEditCancel, 'emit').and.callThrough();
            spyOn(grid.onRowEdit, 'emit').and.callThrough();

            cell.setEditMode(true);

            fix.detectChanges();

            cell.editValue = 'New Name';
            fix.detectChanges();
            // On button click
            const doneButtonElement = GridFunctions.getRowEditingDoneButton(fix);
            doneButtonElement.click();

            fix.detectChanges();

            expect(grid.onRowEditCancel.emit).not.toHaveBeenCalled();
            expect(grid.onRowEdit.emit).toHaveBeenCalled();
            expect(grid.onRowEdit.emit).toHaveBeenCalledWith({
                rowID: 1,
                newValue: Object.assign({}, initialData, { ProductName: 'New Name' }),
                oldValue: initialData,
                cancel: false,
                owner: grid
            });
        });

        it(`Should be able to cancel 'onRowEdit' event `, () => {
            spyOn(grid.onRowEdit, 'emit').and.callThrough();

            grid.onRowEdit.subscribe((e: IGridEditEventArgs) => {
                e.cancel = true;
            });
            const gridContent = GridFunctions.getGridContent(fix);
            const targetCell = grid.getCellByColumn(0, 'ProductName');
            UIInteractions.simulateDoubleClickAndSelectEvent(targetCell);
            fix.detectChanges();

            let overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(cell.editMode).toEqual(true);
            expect(overlayContent).toBeTruthy();
            cell.editValue = 'New Name';
            fix.detectChanges();

            // On button click
            const doneButtonElement = GridFunctions.getRowEditingDoneButton(fix);
            doneButtonElement.click();

            fix.detectChanges();

            overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(overlayContent).toBeTruthy();
            expect(cell.editMode).toEqual(false);
            expect(grid.onRowEdit.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowEdit.emit).toHaveBeenCalledWith({
                rowID: 1,
                newValue: Object.assign({}, initialData, { ProductName: 'New Name' }),
                oldValue: initialData,
                cancel: true,
                owner: grid
            });

            // Enter cell edit mode again
            UIInteractions.simulateDoubleClickAndSelectEvent(targetCell);

            fix.detectChanges();

            // Press enter on cell
            UIInteractions.triggerEventHandlerKeyDown('Enter', gridContent);
            fix.detectChanges();

            overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(overlayContent).toBeTruthy();
            expect(cell.editMode).toEqual(false);
            expect(grid.onRowEdit.emit).toHaveBeenCalledTimes(2);
            expect(grid.onRowEdit.emit).toHaveBeenCalledWith({
                rowID: 1,
                newValue: Object.assign({}, initialData, { ProductName: 'New Name' }),
                oldValue: initialData,
                cancel: true,
                owner: grid
            });
        });

        it(`Should properly emit 'onRowEditCancel' event - Button Click`, () => {

            spyOn(grid.onRowEditCancel, 'emit').and.callThrough();
            spyOn(grid.onRowEdit, 'emit').and.callThrough();

            cell.setEditMode(true);

            fix.detectChanges();

            cell.editValue = 'New Name';
            fix.detectChanges();
            // On button click
            const cancelButtonElement = GridFunctions.getRowEditingCancelButton(fix);
            cancelButtonElement.click();

            fix.detectChanges();

            expect(grid.onRowEdit.emit).not.toHaveBeenCalled();
            expect(grid.onRowEditCancel.emit).toHaveBeenCalled();
            expect(grid.onRowEditCancel.emit).toHaveBeenCalledWith({
                rowID: 1,
                newValue: null,
                oldValue: initialData,
                cancel: false,
                owner: grid
            });
        });

        it(`Should be able to cancel 'onRowEditCancel' event `, () => {
            spyOn(grid.onRowEditCancel, 'emit').and.callThrough();

            grid.onRowEditCancel.subscribe((e: IGridEditEventArgs) => {
                e.cancel = true;
            });

            const gridContent = GridFunctions.getGridContent(fix);
            const targetCell = grid.getCellByColumn(0, 'ProductName');
            UIInteractions.simulateDoubleClickAndSelectEvent(targetCell);
            fix.detectChanges();

            let overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(cell.editMode).toEqual(true);
            expect(overlayContent).toBeTruthy();
            cell.editValue = 'New Name';
            fix.detectChanges();

            // On button click
            const cancelButtonElement = GridFunctions.getRowEditingCancelButton(fix);
            cancelButtonElement.click();

            fix.detectChanges();

            overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(overlayContent).toBeTruthy();
            expect(cell.editMode).toEqual(false);
            expect(grid.onRowEditCancel.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowEditCancel.emit).toHaveBeenCalledWith({
                rowID: 1,
                newValue: null,
                oldValue: initialData,
                cancel: true,
                owner: grid
            });

            // Enter cell edit mode again
            UIInteractions.simulateDoubleClickAndSelectEvent(targetCell);
            fix.detectChanges();

            // Press enter on cell
            UIInteractions.triggerEventHandlerKeyDown('escape', gridContent);


            fix.detectChanges();

            overlayContent = GridFunctions.getRowEditingOverlay(fix);
            expect(overlayContent).toBeTruthy();
            expect(cell.editMode).toEqual(false);
            expect(grid.onRowEditCancel.emit).toHaveBeenCalledTimes(2);
            expect(grid.onRowEditCancel.emit).toHaveBeenCalledWith({
                rowID: 1,
                newValue: null,
                oldValue: initialData,
                cancel: true,
                owner: grid
            });
        });

        it(`Should properly emit 'onRowEditEnter' event`, () => {

            spyOn(grid.onRowEditEnter, 'emit').and.callThrough();

            grid.tbody.nativeElement.focus();
            fix.detectChanges();

            const targetCell = grid.getCellByColumn(0, 'ProductName');
            UIInteractions.simulateClickAndSelectEvent(targetCell);
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('enter', grid.tbody.nativeElement, true);
            fix.detectChanges();

            expect(grid.onRowEditEnter.emit).toHaveBeenCalled();
            expect(grid.onRowEditEnter.emit).toHaveBeenCalledWith({
                rowID: 1,
                oldValue: initialData,
                cancel: false,
                owner: grid
            });
        });

        it(`Should be able to cancel 'onRowEditEnter' event `, () => {
            spyOn(grid.onRowEditEnter, 'emit').and.callThrough();

            grid.onRowEditEnter.subscribe((e: IGridEditEventArgs) => {
                e.cancel = true;
            });

            const targetCell = grid.getCellByColumn(0, 'ProductName');
            UIInteractions.simulateClickAndSelectEvent(targetCell);
            fix.detectChanges();

            targetCell.nativeElement.dispatchEvent(new Event('dblclick'));
            fix.detectChanges();

            expect(cell.editMode).toEqual(true);
            expect(GridFunctions.getRowEditingOverlay(fix)).toBeFalsy();

            expect(grid.onRowEditEnter.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowEditEnter.emit).toHaveBeenCalledWith({
                rowID: 1,
                oldValue: initialData,
                cancel: true,
                owner: grid
            });
        });

        it(`Should properly emit 'onRowEditCancel' event - Filtering`, () => {

            spyOn(grid.onRowEditCancel, 'emit').and.callThrough();

            const gridContent = GridFunctions.getGridContent(fix);
            const targetCell = grid.getCellByColumn(0, 'ProductName');
            UIInteractions.simulateDoubleClickAndSelectEvent(targetCell);
            fix.detectChanges();

            cell.editValue = 'New Name';
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);

            fix.detectChanges();
            // On filter
            grid.filter('ProductID', 0, IgxNumberFilteringOperand.instance().condition('greaterThan'), true);
            fix.detectChanges();

            expect(grid.onRowEditCancel.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowEditCancel.emit).toHaveBeenCalledWith({
                rowID: 1,
                newValue: Object.assign({}, initialData, { ProductName: 'New Name' }),
                oldValue: initialData,
                cancel: false,
                owner: grid
            });
        });

        it(`Should properly emit 'onRowEditCancel' event - Sorting`, () => {

            spyOn(grid.onRowEditCancel, 'emit').and.callThrough();
            spyOn(grid.onRowEdit, 'emit').and.callThrough();

            cell.setEditMode(true);

            fix.detectChanges();

            cell.editValue = 'New Name';
            fix.detectChanges();
            // On sort
            grid.sort({
                fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();

            expect(grid.onRowEditCancel.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowEditCancel.emit).toHaveBeenCalledWith({
                rowID: 1,
                newValue: null,
                oldValue: initialData,
                cancel: false,
                owner: grid
            });
        });

        it(`Should properly emit 'onCellEdit' event `, () => {

            spyOn(grid.onRowEdit, 'emit').and.callThrough();
            spyOn(grid.onCellEdit, 'emit').and.callThrough();
            const igxCell: IgxCell = grid.crudService.createCell(cell);
            igxCell.primaryKey = grid.primaryKey;
            igxCell.editValue = 'New Value';
            const cellArgs = {
                cellID: cell.cellID,
                rowID: cell.row.rowID,
                oldValue: 'Chai',
                newValue: 'New Value',
                cancel: false,
                cell: igxCell,
                column: cell.column,
                owner: grid
            };

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fix.detectChanges();

            expect(cell.editMode).toBe(true);
            const editTemplate = fix.debugElement.query(By.css('input'));
            UIInteractions.clickAndSendInputElementValue(editTemplate, 'New Value');
            fix.detectChanges();

            // Click on cell in different row
            cell = grid.getCellByColumn(2, 'ProductName');
            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            expect(grid.onRowEdit.emit).toHaveBeenCalledTimes(1);
            expect(grid.onCellEdit.emit).toHaveBeenCalledTimes(1);
            expect(grid.onCellEdit.emit).toHaveBeenCalledWith(cellArgs);
        });
    });

    describe('Column editable property', () => {
        let fix;
        let grid: IgxGridComponent;
        let gridContent: DebugElement;

        it('Default column editable value is correct, when row editing is enabled', () => {
            fix = TestBed.createComponent(IgxGridRowEditingWithoutEditableColumnsComponent);
            fix.detectChanges();

            grid = fix.componentInstance.grid;

            let columns: IgxColumnComponent[] = grid.columnList.toArray();
            expect(columns[0].editable).toBeTruthy(); // column.editable not set
            expect(columns[1].editable).toBeFalsy(); // column.editable not set. Primary column
            expect(columns[2].editable).toBeTruthy(); // column.editable set to true
            expect(columns[3].editable).toBeTruthy(); // column.editable not set
            expect(columns[4].editable).toBeFalsy();  // column.editable set to false

            grid.rowEditable = false;
            columns = grid.columnList.toArray();
            expect(columns[0].editable).toBeFalsy(); // column.editable not set
            expect(columns[1].editable).toBeFalsy(); // column.editable not set. Primary column
            expect(columns[2].editable).toBeTruthy(); // column.editable set to true
            expect(columns[3].editable).toBeFalsy(); // column.editable not set
            expect(columns[4].editable).toBeFalsy();  // column.editable set to false

            grid.rowEditable = true;
            columns = grid.columnList.toArray();
            expect(columns[0].editable).toBeTruthy(); // column.editable not set
            expect(columns[1].editable).toBeFalsy(); // column.editable not set. Primary column
            expect(columns[2].editable).toBeTruthy(); // column.editable set to true
            expect(columns[3].editable).toBeTruthy(); // column.editable not set
            expect(columns[4].editable).toBeFalsy();  // column.editable set to false
        });

        it('should scroll into view not visible cell when in row edit and move from pinned to unpinned column', (async () => {
            fix = TestBed.createComponent(VirtualGridComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fix);
            setupGridScrollDetection(fix, grid);
            fix.detectChanges();

            fix.componentInstance.columns = fix.componentInstance.generateCols(100);
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

            const cell = grid.getCellByColumn(0, '2');
            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(grid.crudService.cell.column.header).toBe('2');
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);

            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(grid.crudService.cell.column.header).toBe('1');
        }));
    });

    describe('Custom overlay', () => {

        it('Custom overlay', fakeAsync(/** height/width setter rAF */() => {
            const fix = TestBed.createComponent(IgxGridCustomOverlayComponent);
            fix.detectChanges();
            const gridContent = GridFunctions.getGridContent(fix);

            const grid = fix.componentInstance.grid;
            let cell = grid.getCellByColumn(0, 'ProductName');
            spyOn(grid, 'endEdit').and.callThrough();
            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fix.detectChanges();

            expect(parseInt(GridFunctions.getRowEditingBannerText(fix), 10)).toEqual(0);
            fix.componentInstance.cellInEditMode.editValue = 'Spiro';
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fix.detectChanges();

            cell = grid.getCellByColumn(0, 'ReorderLevel');
            expect(parseInt(GridFunctions.getRowEditingBannerText(fix), 10)).toEqual(1);

            fix.componentInstance.buttons.last.element.nativeElement.click();
            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledTimes(1);
        }));

        it('Empty template', fakeAsync(/** height/width setter rAF */() => {
            const fix = TestBed.createComponent(IgxGridEmptyRowEditTemplateComponent);
            fix.detectChanges();
            const gridContent = GridFunctions.getGridContent(fix);


            const grid = fix.componentInstance.grid;
            let cell = grid.getCellByColumn(0, 'ProductName');
            UIInteractions.simulateDoubleClickAndSelectEvent(cell);

            fix.detectChanges();


            cell.editValue = 'Spiro';
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);

            fix.detectChanges();

            fix.detectChanges();


            expect(cell.editMode).toBe(false);
            cell = grid.getCellByColumn(0, 'ReorderLevel');
            expect(cell.editMode).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent, false, true);
            fix.detectChanges();

            fix.detectChanges();


            expect(cell.editMode).toBe(false);
            cell = grid.getCellByColumn(0, 'ProductName');
            expect(cell.editMode).toBe(true);
        }));
    });

    describe('Transaction', () => {
        let fix;
        let grid;
        let cell: IgxGridCellComponent;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridRowEditingTransactionComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            cell = grid.getCellByColumn(0, 'ProductName');
        }));

        it('Should add correct class to the edited row', () => {
            const row: HTMLElement = grid.getRowByIndex(0).nativeElement;
            expect(row.classList).not.toContain(ROW_EDITED_CLASS);

            cell.setEditMode(true);
            fix.detectChanges();

            cell.editValue = 'IG';
            grid.endEdit(true);
            fix.detectChanges();

            expect(row.classList).toContain(ROW_EDITED_CLASS);
        });

        it(`Should correctly get column.editable for grid with transactions`, () => {
            grid.columnList.forEach(c => {
                c.editable = true;
            });

            const primaryKeyColumn = grid.columnList.find(c => c.field === grid.primaryKey);
            const nonPrimaryKeyColumn = grid.columnList.find(c => c.field !== grid.primaryKey);
            expect(primaryKeyColumn).toBeDefined();
            expect(nonPrimaryKeyColumn).toBeDefined();

            grid.rowEditable = false;
            expect(primaryKeyColumn.editable).toBeFalsy();
            expect(nonPrimaryKeyColumn.editable).toBeTruthy();

            grid.rowEditable = true;
            expect(primaryKeyColumn.editable).toBeFalsy();
            expect(nonPrimaryKeyColumn.editable).toBeTruthy();
        });

        it(`Should not allow editing a deleted row`, () => {
            grid.deleteRow(grid.getRowByIndex(0).rowID);
            fix.detectChanges();

            cell.setEditMode(true);

            fix.detectChanges();
            expect(cell.editMode).toBeFalsy();
        });

        it(`Should exit row editing when clicking on a cell from a deleted row`, () => {
            grid.deleteRow(1);

            fix.detectChanges();
            spyOn(grid, 'endRowTransaction').and.callThrough();

            const firstCell = grid.getCellByColumn(2, 'ProductName');
            UIInteractions.simulateDoubleClickAndSelectEvent(firstCell);
            fix.detectChanges();
            expect(grid.endRowTransaction).toHaveBeenCalledTimes(0);

            const targetCell = grid.getCellByColumn(0, 'ProductName');
            UIInteractions.simulateClickAndSelectEvent(targetCell);
            fix.detectChanges();
            expect(grid.endRowTransaction).toHaveBeenCalledTimes(1);
            expect(cell.selected).toBeTruthy();
            expect(firstCell.selected).toBeFalsy();
        });

        it(`Paging: Should not apply edited classes to the same row on a different page`, () => {
            // This is not a valid scenario if the grid does not have transactions enabled
            fix.componentInstance.paging = true;
            fix.detectChanges();

            const rowEl: HTMLElement = grid.getRowByIndex(0).nativeElement;

            expect(rowEl.classList).not.toContain(ROW_EDITED_CLASS);

            cell.setEditMode(true);

            cell.editValue = 'IG';

            fix.detectChanges();
            grid.endEdit(true);

            fix.detectChanges();
            expect(rowEl.classList).toContain(ROW_EDITED_CLASS);

            // Next page button click
            GridFunctions.navigateToNextPage(grid.nativeElement);
            fix.detectChanges();
            expect(grid.page).toEqual(1);
            expect(rowEl.classList).not.toContain(ROW_EDITED_CLASS);
        });

        it('Transaction Update, Delete, Add, Undo, Redo, Commit check transaction and grid state', () => {
            const trans = grid.transactions;
            spyOn(trans.onStateUpdate, 'emit').and.callThrough();
            let row = null;
            let updateValue = 'Chaiiii';
            cell.setEditMode(true);
            fix.detectChanges();
            cell.editValue = updateValue;
            fix.detectChanges();
            expect(trans.onStateUpdate.emit).not.toHaveBeenCalled();
            let state = trans.getAggregatedChanges(false);
            expect(state.length).toEqual(0);

            cell = grid.getCellByColumn(1, 'ProductName');
            updateValue = 'Sirop';
            cell.setEditMode(true);
            fix.detectChanges();
            cell.editValue = updateValue;
            fix.detectChanges();

            // Called once because row edit ended on row 1;
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(1);
            state = trans.getAggregatedChanges(false);
            expect(state.length).toEqual(1);
            expect(state[0].type).toEqual(TransactionType.UPDATE);
            expect(state[0].newValue['ProductName']).toEqual('Chaiiii');

            grid.endEdit(true);
            fix.detectChanges();
            state = trans.getAggregatedChanges(false);
            expect(trans.onStateUpdate.emit).toHaveBeenCalled();
            expect(state.length).toEqual(2);
            expect(state[0].type).toEqual(TransactionType.UPDATE);
            expect(state[0].newValue['ProductName']).toEqual('Chaiiii');
            expect(state[1].type).toEqual(TransactionType.UPDATE);
            expect(state[1].newValue['ProductName']).toEqual(updateValue);
            grid.deleteRow(grid.getRowByIndex(2).rowID);
            fix.detectChanges();

            expect(trans.onStateUpdate.emit).toHaveBeenCalled();
            state = trans.getAggregatedChanges(false);
            expect(state.length).toEqual(3);
            expect(state[2].type).toEqual(TransactionType.DELETE);
            expect(state[2].newValue).toBeNull();

            trans.undo();
            fix.detectChanges();

            expect(trans.onStateUpdate.emit).toHaveBeenCalled();
            state = trans.getAggregatedChanges(false);
            expect(state.length).toEqual(2);
            expect(state[1].type).toEqual(TransactionType.UPDATE);
            expect(state[1].newValue['ProductName']).toEqual(updateValue);
            row = grid.getRowByIndex(2).nativeElement;
            expect(row.classList).not.toContain('igx -grid__tr--deleted');

            trans.redo();
            fix.detectChanges();

            expect(trans.onStateUpdate.emit).toHaveBeenCalled();
            state = trans.getAggregatedChanges(false);
            expect(state.length).toEqual(3);
            expect(state[2].type).toEqual(TransactionType.DELETE);
            expect(state[2].newValue).toBeNull();
            expect(row.classList).toContain(ROW_DELETED_CLASS);

            trans.commit(grid.data);
            fix.detectChanges();
            state = trans.getAggregatedChanges(false);
            expect(state.length).toEqual(0);
            expect(row.classList).not.toContain(ROW_DELETED_CLASS);

            cell = grid.getCellByColumn(0, 'ProductName');
            updateValue = 'Chaiwe';
            cell.setEditMode(true);
            fix.detectChanges();
            cell.update(updateValue);
            cell.setEditMode(false);
            fix.detectChanges();
            trans.clear();
            fix.detectChanges();
            state = trans.getAggregatedChanges(false);
            expect(state.length).toEqual(0);
            expect(cell.nativeElement.classList).not.toContain(ROW_EDITED_CLASS);
        });

        it('Should allow to change value of a cell with initial value of 0', () => {
            expect(cell.value).toBe('Chai');

            cell.update('Awesome Tea');

            fix.detectChanges();
            expect(cell.value).toBe('Awesome Tea');
        });

        it('Should allow to change value of a cell with initial value of false', () => {
            cell = grid.getCellByColumn(3, 'InStock');
            expect(cell.value).toBeFalsy();

            cell.update(true);

            fix.detectChanges();
            expect(cell.value).toBeTruthy();
        });

        it('Should allow to change value of a cell with initial value of empty string', () => {
            expect(cell.value).toBe('Chai');

            cell.update('');

            fix.detectChanges();
            expect(cell.value).toBe('');

            cell.update('Updated value');

            fix.detectChanges();
            expect(cell.value).toBe('Updated value');
        });

        it(`Should not log a transaction when a cell's value does not change`, () => {
            const initialState = grid.transactions.getAggregatedChanges(false);
            expect(cell.value).toBe('Chai');

            // Set to same value
            cell.update('Chai');

            fix.detectChanges();
            expect(cell.value).toBe('Chai');
            expect(grid.transactions.getAggregatedChanges(false)).toEqual(initialState);

            // Change value and check if it's logged
            cell.update('Updated value');

            fix.detectChanges();
            expect(cell.value).toBe('Updated value');
            const expectedTransaction: Transaction = {
                id: 1,
                newValue: { ProductName: 'Updated value' },
                type: TransactionType.UPDATE
            };
            expect(grid.transactions.getAggregatedChanges(false)).toEqual([expectedTransaction]);
        });

        it(`Should not log a transaction when a cell's value does not change - Date`, () => {
            let cellDate = grid.getCellByColumn(0, 'OrderDate');
            const initialState = grid.transactions.getAggregatedChanges(false);
            const gridContent = GridFunctions.getGridContent(fix);

            // Enter edit mode
            UIInteractions.simulateDoubleClickAndSelectEvent(cellDate);
            fix.detectChanges();
            // Exit edit mode without change
            UIInteractions.triggerEventHandlerKeyDown('escape', gridContent);

            fix.detectChanges();
            cellDate = grid.getCellByColumn(0, 'UnitsInStock');
            UIInteractions.simulateDoubleClickAndSelectEvent(cellDate);
            fix.detectChanges();
            expect(grid.transactions.getAggregatedChanges(true)).toEqual(initialState);
            GridFunctions.simulateGridContentKeydown(fix, 'Esc');

            cellDate = grid.getCellByColumn(0, 'OrderDate');
            const newValue = new Date('01/01/2000');
            cellDate.update(newValue);

            fix.detectChanges();

            const expectedTransaction: Transaction = {
                id: 1,
                newValue: { OrderDate: newValue },
                type: TransactionType.UPDATE
            };
            expect(grid.transactions.getAggregatedChanges(false)).toEqual([expectedTransaction]);
        });

        it('Should allow to change of a cell in added row in grid with transactions', () => {
            const addRowData = {
                ProductID: 99,
                ProductName: 'Added product',
                InStock: false,
                UnitsInStock: 0,
                OrderDate: new Date()
            };
            grid.addRow(addRowData);

            fix.detectChanges();

            cell = grid.getCellByColumn(10, 'ProductName');
            expect(cell.value).toBe(addRowData.ProductName);

            cell.update('Changed product');

            fix.detectChanges();
            expect(cell.value).toBe('Changed product');
        });

        it('Should properly mark cell/row as dirty if new value evaluates to `false`', () => {
            const targetRow = grid.getRowByIndex(0);
            let targetRowElement = targetRow.element.nativeElement;
            let targetCellElement = targetRow.cells.toArray()[1].nativeElement;
            expect(targetRowElement.classList).not.toContain(ROW_EDITED_CLASS, 'row contains edited class w/o edits');
            expect(targetCellElement.classList).not.toContain('igx-grid__td--edited', 'cell contains edited class w/o edits');

            targetRow.cells.toArray()[1].update('');

            fix.detectChanges();

            targetRowElement = targetRow.element.nativeElement;
            targetCellElement = targetRow.cells.toArray()[1].nativeElement;
            expect(targetRowElement.classList).toContain(ROW_EDITED_CLASS, 'row does not contain edited class w/ edits');
            expect(targetCellElement.classList).toContain('igx-grid__td--edited', 'cell does not contain edited class w/ edits');
        });

        it('Should change pages when the only item on the last page is a pending added row that gets deleted', () => {
            expect(grid.data.length).toEqual(10);
            grid.paging = true;
            grid.perPage = 5;
            fix.detectChanges();

            expect(grid.totalPages).toEqual(2);
            grid.addRow({
                ProductID: 123,
                ProductName: 'DummyItem',
                InStock: true,
                UnitsInStock: 1,
                OrderDate: new Date()
            });
            fix.detectChanges();

            expect(grid.totalPages).toEqual(3);
            grid.page = 2;

            fix.detectChanges();
            expect(grid.page).toEqual(2);
            grid.deleteRowById(123);

            fix.detectChanges();
            // This is behaving incorrectly - if there is only 1 transaction and it is an ADD transaction on the last page
            // Deleting the ADD transaction on the last page will trigger grid.page-- TWICE
            expect(grid.page).toEqual(1); // Should be 1
            expect(grid.totalPages).toEqual(2);
        });

        it('Should change pages when committing deletes on the last page', () => {
            expect(grid.data.length).toEqual(10);
            grid.paging = true;
            grid.perPage = 5;
            fix.detectChanges();

            expect(grid.totalPages).toEqual(2);
            grid.page = 1;

            fix.detectChanges();
            expect(grid.page).toEqual(1);
            for (let i = 0; i < grid.data.length / 2; i++) {
                grid.deleteRowById(grid.data.reverse()[i].ProductID);
            }
            fix.detectChanges();

            expect(grid.page).toEqual(1);
            grid.transactions.commit(grid.data);
            fix.detectChanges();

            expect(grid.page).toEqual(0);
            expect(grid.totalPages).toEqual(1);
        });

        it('Should NOT change pages when deleting a row on the last page', () => {
            grid.paging = true;
            grid.perPage = 5;
            fix.detectChanges();

            expect(grid.totalPages).toEqual(2);
            expect(grid.data.length).toEqual(10);
            grid.page = 1;

            fix.detectChanges();
            expect(grid.page).toEqual(1);
            grid.deleteRowById(grid.data[grid.data.length - 1].ProductID);
            fix.detectChanges();

            expect(grid.page).toEqual(1);
            expect(grid.totalPages).toEqual(2);
        });

        it('Should not log transaction when exit edit mode on row with state and with no changes', () => {
            const trans = grid.transactions;
            const updateValue = 'Chaiiii';
            cell.setEditMode(true);


            cell.editValue = updateValue;

            fix.detectChanges();

            grid.endEdit(true);

            fix.detectChanges();

            expect(trans.getTransactionLog().length).toBe(1);

            cell.setEditMode(true);


            cell.editValue = updateValue;

            fix.detectChanges();

            grid.endEdit(true);

            fix.detectChanges();

            // should not log new transaction as there is no change in the row's cells
            expect(trans.getTransactionLog().length).toBe(1);
        });
    });

    describe('Row Editing - Grouping', () => {
        let fix;
        let grid: IgxGridComponent;
        let cell: IgxGridCellComponent;
        let groupRows;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridWithEditingAndFeaturesComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            grid.getColumnByName('ProductName').editable = true;
            fix.detectChanges();
            grid.groupBy({
                fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
        }));

        it('Hide row editing dialog with group collapsing/expanding', () => {
            // fix.detectChanges();
            // grid = fix.componentInstance.grid;
            // fix.detectChanges();

            // fix.detectChanges();
            cell = grid.getCellByColumn(1, 'ProductName');

            expect(grid.crudService.inEditMode).toBeFalsy();

            // set cell in second group in edit mode
            cell.setEditMode(true);
            fix.detectChanges();

            expect(grid.crudService.inEditMode).toBeTruthy();
            groupRows = grid.groupsRowList.toArray();
            expect(groupRows[0].expanded).toBeTruthy();

            // collapse first group
            grid.toggleGroup(groupRows[0].groupRow);
            fix.detectChanges();

            expect(groupRows[0].expanded).toBeFalsy();
            expect(grid.crudService.inEditMode).toBeFalsy();

            // expand first group
            grid.toggleGroup(groupRows[0].groupRow);
            fix.detectChanges();

            expect(groupRows[0].expanded).toBeTruthy();
            expect(grid.crudService.inEditMode).toBeFalsy();

            // collapse first group
            grid.toggleGroup(groupRows[0].groupRow);
            fix.detectChanges();

            expect(groupRows[0].expanded).toBeFalsy();
            expect(grid.crudService.inEditMode).toBeFalsy();

            // set cell in second group in edit mode
            cell.setEditMode(true);
            fix.detectChanges();

            expect(grid.crudService.inEditMode).toBeTruthy();

            // expand first group
            grid.toggleGroup(groupRows[0].groupRow);
            fix.detectChanges();

            expect(groupRows[0].expanded).toBeTruthy();
            expect(grid.crudService.inEditMode).toBeFalsy();

            // set cell in first group in edit mode
            cell = grid.getCellByColumn(1, 'ProductName');
            cell.setEditMode(true);
            fix.detectChanges();

            expect(grid.crudService.inEditMode).toBeTruthy();
            expect(groupRows[0].expanded).toBeTruthy();

            // collapse first group
            grid.toggleGroup(groupRows[0].groupRow);
            fix.detectChanges();

            expect(groupRows[0].expanded).toBeFalsy();
            expect(grid.crudService.inEditMode).toBeFalsy();

            // expand first group
            grid.toggleGroup(groupRows[0].groupRow);
            fix.detectChanges();

            expect(groupRows[0].expanded).toBeTruthy();
            expect(grid.crudService.inEditMode).toBeFalsy();
        });

        it('Hide row editing dialog when hierarchical group is collapsed/expanded',
            () => {
                // fix.detectChanges();
                // grid = fix.componentInstance.grid;
                // fix.detectChanges();

                grid.groupBy({
                    fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false,
                    strategy: DefaultSortingStrategy.instance()
                });
                fix.detectChanges();
                expect(grid.crudService.inEditMode).toBeFalsy();
                cell = grid.getCellByColumn(2, 'ProductName');
                cell.setEditMode(true);
                fix.detectChanges();
                expect(grid.crudService.inEditMode).toBeTruthy();
                groupRows = grid.groupsRowList.toArray();

                grid.toggleGroup(groupRows[0].groupRow);
                fix.detectChanges();
                expect(grid.crudService.inEditMode).toBeFalsy();
                grid.toggleGroup(groupRows[0].groupRow);
                fix.detectChanges();
                expect(grid.crudService.inEditMode).toBeFalsy();
            });
    });

    describe('Transactions service', () => {
        let trans;
        let fix;
        let grid;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridRowEditingTransactionComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            trans = grid.transactions;
        }));


        it(`Should not commit added row to grid's data in grid with transactions`, () => {
            spyOn(trans, 'add').and.callThrough();

            const addRowData = {
                ProductID: 100,
                ProductName: 'Added',
                InStock: true,
                UnitsInStock: 20000,
                OrderDate: new Date(1)
            };

            grid.addRow(addRowData);

            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(1);
            expect(trans.add).toHaveBeenCalledWith({ id: 100, type: 'add', newValue: addRowData });
            expect(grid.data.length).toBe(10);
        });

        it(`Should not delete deleted row from grid's data in grid with transactions`, () => {
            spyOn(trans, 'add').and.callThrough();

            grid.deleteRow(5);

            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(1);
            expect(trans.add).toHaveBeenCalledWith({ id: 5, type: 'delete', newValue: null }, grid.data[4]);
            expect(grid.data.length).toBe(10);
        });

        it(`Should not update updated cell in grid's data in grid with transactions`, () => {
            spyOn(trans, 'add').and.callThrough();

            grid.updateCell('Updated Cell', 3, 'ProductName');

            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(1);
            expect(trans.add).toHaveBeenCalledWith({ id: 3, type: 'update', newValue: { ProductName: 'Updated Cell' } }, grid.data[2]);
            expect(grid.data.length).toBe(10);
        });

        it(`Should not update updated row in grid's data in grid with transactions`, () => {
            spyOn(trans, 'add').and.callThrough();

            const updateRowData = {
                ProductID: 100,
                ProductName: 'Added',
                InStock: true,
                UnitsInStock: 20000,
                OrderDate: new Date(1)
            };
            const oldRowData = grid.data[2];

            grid.updateRow(updateRowData, 3);

            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(1);
            expect(trans.add).toHaveBeenCalledWith({ id: 3, type: 'update', newValue: updateRowData }, oldRowData);
            expect(grid.data[2]).toBe(oldRowData);
        });

        it(`Should be able to add a row if another row is in edit mode`, () => {
            const rowCount = grid.rowList.length;
            grid.rowEditable = true;
            fix.detectChanges();

            const targetRow = fix.debugElement.query(By.css(`${CELL_CLASS}:last-child`));
            UIInteractions.simulateClickAndSelectEvent(targetRow);
            fix.detectChanges();

            grid.addRow({
                ProductID: 1000,
                ProductName: 'New Product',
                InStock: true,
                UnitsInStock: 1,
                OrderDate: new Date()
            });
            fix.detectChanges();

            expect(grid.rowList.length).toBeGreaterThan(rowCount);
        });

        it(`Should be able to add a row if a cell is in edit mode`, () => {
            const rowCount = grid.rowList.length;
            const cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);

            fix.detectChanges();

            grid.addRow({
                ProductID: 1000,
                ProductName: 'New Product',
                InStock: true,
                UnitsInStock: 1,
                OrderDate: new Date()
            });
            fix.detectChanges();


            expect(grid.rowList.length).toBeGreaterThan(rowCount);
        });
    });
});
