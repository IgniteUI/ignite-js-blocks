import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxGridModule } from './public_api';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { ColumnPinningPosition, GridSelectionMode } from '../common/enums';
import { IPinningConfig } from '../grid.common';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import {
    CELL_PINNED_CLASS,
    GRID_MRL_BLOCK_CLASS,
    GRID_SCROLL_CLASS,
    GridFunctions,
    GridSelectionFunctions,
    GridSummaryFunctions,
    HEADER_PINNED_CLASS,
    PINNED_SUMMARY
} from '../../test-utils/grid-functions.spec';
import {
    GridFeaturesComponent,
    GridPinningMRLComponent,
    MultiColumnHeadersWithGroupingComponent,
    PinningComponent,
    PinOnInitAndSelectionComponent
} from '../../test-utils/grid-samples.spec';
import { IgxGridComponent } from './grid.component';
import { DropPosition } from '../moving/moving.service';
import { setupGridScrollDetection } from '../../test-utils/helper-utils.spec';
/* eslint-disable @typescript-eslint/no-use-before-define */

describe('IgxGrid - Column Pinning #grid', () => {

    const DEBOUNCETIME = 30;

    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                PinningComponent,
                PinOnInitAndSelectionComponent,
                GridFeaturesComponent,
                MultiColumnHeadersWithGroupingComponent,
                GridPinningMRLComponent

            ],
            imports: [NoopAnimationsModule, IgxGridModule]
        });
    }));

    describe('To Start', () => {

        describe('Initially pinned columns', () => {

            let fix;
            let grid: IgxGridComponent;
            beforeEach(fakeAsync(() => {
                fix = TestBed.createComponent(PinOnInitAndSelectionComponent);
                fix.detectChanges();
                grid = fix.componentInstance.grid;
                fix.detectChanges();
            }));

            it('should correctly initialize when there are initially pinned columns.', () => {

                // verify pinned/unpinned collections
                expect(grid.pinnedColumns.length).toEqual(2);
                expect(grid.unpinnedColumns.length).toEqual(9);

                // verify DOM
                const firstIndexCell = grid.gridAPI.get_cell_by_index(0, 'CompanyName');
                expect(firstIndexCell.visibleColumnIndex).toEqual(0);

                const lastIndexCell = grid.gridAPI.get_cell_by_index(0, 'ContactName');
                expect(lastIndexCell.visibleColumnIndex).toEqual(1);
                expect(GridFunctions.isCellPinned(lastIndexCell)).toBe(true);

                const headers = GridFunctions.getColumnHeaders(fix);

                expect(headers[0].context.column.field).toEqual('CompanyName');

                expect(headers[1].context.column.field).toEqual('ContactName');
                expect(GridFunctions.isHeaderPinned(headers[1].parent)).toBe(true);

                // verify container widths
                GridFunctions.verifyPinnedAreaWidth(grid, 400);
                GridFunctions.verifyUnpinnedAreaWidth(grid, 400);
            });

            it('should allow pinning/unpinning via the grid API', () => {

                // Unpin column
                grid.unpinColumn('CompanyName');
                fix.detectChanges();

                // verify column is unpinned
                expect(grid.pinnedColumns.length).toEqual(1);
                expect(grid.unpinnedColumns.length).toEqual(10);

                const col = grid.getColumnByName('CompanyName');
                expect(col.pinned).toBe(false);
                expect(col.visibleIndex).toEqual(2);

                // verify DOM
                let cell = grid.gridAPI.get_cell_by_index(0, 'CompanyName');
                expect(cell.visibleColumnIndex).toEqual(2);
                expect(GridFunctions.isCellPinned(cell)).toBe(false);

                const thirdHeader = GridFunctions.getColumnHeaders(fix)[2];

                expect(thirdHeader.context.column.field).toEqual('CompanyName');
                expect(GridFunctions.isHeaderPinned(thirdHeader)).toBe(false);

                // verify container widths
                GridFunctions.verifyPinnedAreaWidth(grid, 200);
                GridFunctions.verifyUnpinnedAreaWidth(grid, 600);

                // pin back the column.
                grid.pinColumn('CompanyName');
                fix.detectChanges();

                // verify column is pinned
                expect(grid.pinnedColumns.length).toEqual(2);
                expect(grid.unpinnedColumns.length).toEqual(9);

                // verify container widths
                GridFunctions.verifyPinnedAreaWidth(grid, 400);
                GridFunctions.verifyUnpinnedAreaWidth(grid, 400);

                expect(col.pinned).toBe(true);
                expect(col.visibleIndex).toEqual(1);

                cell = grid.gridAPI.get_cell_by_index(0, 'CompanyName');
                expect(cell.visibleColumnIndex).toEqual(1);
                expect(GridFunctions.isCellPinned(cell)).toBe(true);
            });

           it('should allow pinning/unpinning via the column API', () => {
                const col = grid.getColumnByName('ID');

                col.pinned = true;
                fix.detectChanges();

                // verify column is pinned
                expect(col.pinned).toBe(true);
                expect(col.visibleIndex).toEqual(2);

                expect(grid.pinnedColumns.length).toEqual(3);
                expect(grid.unpinnedColumns.length).toEqual(8);

                // verify container widths
                GridFunctions.verifyPinnedAreaWidth(grid, 600);
                GridFunctions.verifyUnpinnedAreaWidth(grid, 200);

                col.pinned = false;
                fix.detectChanges();

                // verify column is unpinned
                expect(col.pinned).toBe(false);
                expect(col.visibleIndex).toEqual(2);

                expect(grid.pinnedColumns.length).toEqual(2);
                expect(grid.unpinnedColumns.length).toEqual(9);

                // verify container widths
                GridFunctions.verifyPinnedAreaWidth(grid, 400);
                GridFunctions.verifyUnpinnedAreaWidth(grid, 400);
            });

            it('on unpinning should restore the original location(index) of the column', () => {

                const col = grid.getColumnByName('ContactName');
                expect(col.index).toEqual(2);

                // unpin
                col.pinned = false;
                fix.detectChanges();

                // check props
                expect(col.index).toEqual(2);
                expect(col.visibleIndex).toEqual(2);

                // check DOM
                const thirdHeader = GridFunctions.getColumnHeaders(fix)[2];

                expect(thirdHeader.context.column.field).toEqual('ContactName');
                expect(GridFunctions.isHeaderPinned(thirdHeader)).toBe(false);

            });

            it('should correctly initialize pinned columns z-index values.', () => {

                const headers = GridFunctions.getColumnHeaders(fix);

                // First two headers are pinned
                expect(headers[0].parent.componentInstance.zIndex).toEqual(9999);
                expect(headers[1].parent.componentInstance.zIndex).toEqual(9998);

                grid.pinColumn('Region');
                fix.detectChanges();

                // First three headers are pinned
                const secondColumnGroupHeader = GridFunctions.getColumnHeaders(fix)[2];
                expect(secondColumnGroupHeader.parent.componentInstance.zIndex).toEqual(9997);
            });

            it('should not pin/unpin columns which are already pinned/unpinned', () => {

                const pinnedColumnsLength = grid.pinnedColumns.length;
                const unpinnedColumnsLength = grid.unpinnedColumns.length;

                let result = grid.pinColumn('CompanyName');
                fix.detectChanges();

                expect(grid.pinnedColumns.length).toEqual(pinnedColumnsLength);
                expect(result).toBe(false);

                result = grid.unpinColumn('City');
                fix.detectChanges();

                expect(grid.unpinnedColumns.length).toEqual(unpinnedColumnsLength);
                expect(result).toBe(false);
            });

            it('should fix column when grid width is 100% and column width is set', fakeAsync(() => {
                fix.componentInstance.grid.width = '100%';
                tick(DEBOUNCETIME);
                fix.detectChanges();

                expect(grid.pinnedColumns.length).toEqual(2);
                expect(grid.unpinnedColumns.length).toEqual(9);
            }));

            it('should allow navigating to/from pinned area', (async () => {

                const cellContactName = grid.gridAPI.get_cell_by_index(0, 'ContactName');
                const range = {
                    rowStart: cellContactName.rowIndex,
                    rowEnd: cellContactName.rowIndex,
                    columnStart: cellContactName.visibleColumnIndex,
                    columnEnd: cellContactName.visibleColumnIndex
                };
                grid.selectRange(range);
                grid.navigation.activeNode = { row: cellContactName.rowIndex, column: cellContactName.visibleColumnIndex };
                fix.detectChanges();

                grid.navigation.dispatchEvent(UIInteractions.getKeyboardEvent('keydown', 'ArrowRight'));
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                const cellID = grid.gridAPI.get_cell_by_index(0, 'ID');
                expect(cellID.active).toBe(true);
                expect(cellContactName.active).toBe(false);

                grid.navigation.dispatchEvent(UIInteractions.getKeyboardEvent('keydown', 'ArrowLeft'));
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                expect(cellID.active).toBe(false);
                expect(cellContactName.active).toBe(true);
            }));
        });

        describe('Features', () => {

            let fix;
            let grid: IgxGridComponent;

            beforeEach(fakeAsync(() => {
                fix = TestBed.createComponent(GridFeaturesComponent);
                fix.detectChanges();
                grid = fix.componentInstance.grid;
            }));

            it('should allow filter pinned columns', () => {

                // Contains filter
                grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('contains'), true);
                fix.detectChanges();
                const firstCell = grid.gridAPI.get_cell_by_index(0, 'ID');
                const secondCell = grid.gridAPI.get_cell_by_index(1, 'ID');

                expect(grid.rowList.length).toEqual(2);
                expect(parseInt(GridFunctions.getValueFromCellElement(firstCell), 10)).toEqual(1);
                expect(parseInt(GridFunctions.getValueFromCellElement(secondCell), 10)).toEqual(3);

                // Unpin column
                grid.unpinColumn('ProductName');
                fix.detectChanges();
                expect(grid.rowList.length).toEqual(2);
                expect(parseInt(GridFunctions.getValueFromCellElement(firstCell), 10)).toEqual(1);
                expect(parseInt(GridFunctions.getValueFromCellElement(secondCell), 10)).toEqual(3);
            });

            it('should allow sorting pinned columns', () => {

                const currentColumn = 'ProductName';
                const releasedColumn = 'Released';

                grid.sort({ fieldName: currentColumn, dir: SortingDirection.Asc, ignoreCase: true });

                fix.detectChanges();

                expect(grid.getCellByColumn(0, currentColumn).value).toEqual(null);
                expect(grid.getCellByColumn(0, releasedColumn).value).toEqual(true);
                expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual('Some other item with Script');
                expect(grid.getCellByColumn(grid.data.length - 1, releasedColumn).value).toEqual(null);

                // Unpin column
                grid.unpinColumn('ProductName');
                fix.detectChanges();

                expect(grid.getCellByColumn(0, currentColumn).value).toEqual(null);
                expect(grid.getCellByColumn(0, releasedColumn).value).toEqual(true);
                expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual('Some other item with Script');
                expect(grid.getCellByColumn(grid.data.length - 1, releasedColumn).value).toEqual(null);
            });

        });

        describe('', () => {

            let fix;
            let grid: IgxGridComponent;

            beforeEach(fakeAsync(() => {
                fix = TestBed.createComponent(PinningComponent);
                fix.detectChanges();
                grid = fix.componentInstance.grid;
            }));

            it('should emit columnPin event and allow changing the insertAtIndex param.', () => {

                spyOn(grid.columnPin, 'emit').and.callThrough();

                const idCol = grid.getColumnByName('ID');
                const idColIndex = idCol.index;
                idCol.pinned = true;
                fix.detectChanges();
                expect(grid.columnPin.emit).toHaveBeenCalledTimes(1);
                expect(grid.columnPin.emit).toHaveBeenCalledWith({
                    column: idCol,
                    insertAtIndex: 0,
                    isPinned: false,
                    cancel: false
                });
                expect(idCol.visibleIndex).toEqual(0);

                const cityCol = grid.getColumnByName('City');
                cityCol.pinned = true;
                fix.detectChanges();
                expect(grid.columnPin.emit).toHaveBeenCalledTimes(2);
                expect(grid.columnPin.emit).toHaveBeenCalledWith({
                    column: cityCol,
                    insertAtIndex: 0,
                    isPinned: false,
                    cancel: false
                });
                expect(cityCol.visibleIndex).toEqual(0);

                idCol.pinned = false;
                fix.detectChanges();
                expect(grid.columnPin.emit).toHaveBeenCalledTimes(3);
                expect(grid.columnPin.emit).toHaveBeenCalledWith({
                    column: idCol,
                    insertAtIndex: idColIndex,
                    isPinned: true,
                    cancel: false
                });
                expect(cityCol.visibleIndex).toEqual(0);

                // check DOM
                const headers = GridFunctions.getColumnHeaders(fix);
                expect(headers[0].context.column.field).toEqual('City');
                expect(headers[1].context.column.field).toEqual('ID');
            });

            it('should allow hiding/showing pinned column.', () => {

                const col = grid.getColumnByName('CompanyName');
                col.pinned = true;
                fix.detectChanges();
                expect(grid.pinnedColumns.length).toEqual(1);
                expect(grid.unpinnedColumns.length).toEqual(9);

                col.hidden = true;
                fix.detectChanges();

                expect(grid.pinnedColumns.length).toEqual(0);
                expect(grid.unpinnedColumns.length).toEqual(9);

                let firstHeader = GridFunctions.getColumnHeaders(fix)[0];

                expect(firstHeader.context.column.field).toEqual('ID');
                expect(GridFunctions.isHeaderPinned(firstHeader)).toBe(false);

                col.hidden = false;
                fix.detectChanges();

                expect(grid.pinnedColumns.length).toEqual(1);
                expect(grid.unpinnedColumns.length).toEqual(9);

                firstHeader = GridFunctions.getColumnHeaders(fix)[0];

                expect(firstHeader.context.column.field).toEqual('CompanyName');
                expect(GridFunctions.isHeaderPinned(firstHeader.parent)).toBe(true);
            });

            it('should allow pinning a hidden column.', () => {

                const col = grid.getColumnByName('CompanyName');

                col.hidden = true;
                col.pinned = true;
                fix.detectChanges();

                expect(grid.pinnedColumns.length).toEqual(0);
                expect(grid.unpinnedColumns.length).toEqual(9);

                col.hidden = false;
                fix.detectChanges();

                expect(grid.pinnedColumns.length).toEqual(1);
                expect(grid.unpinnedColumns.length).toEqual(9);
            });

            it('should allow hiding columns in the unpinned area.', () => {

                const col1 = grid.getColumnByName('CompanyName');
                const col2 = grid.getColumnByName('ID');

                col1.pinned = true;
                col2.hidden = true;
                fix.detectChanges();

                expect(grid.pinnedColumns.length).toEqual(1);
                expect(grid.unpinnedColumns.length).toEqual(8);

                const headers = GridFunctions.getColumnHeaders(fix);

                expect(headers[0].context.column.field).toEqual('CompanyName');
                expect(headers[1].context.column.field).toEqual('ContactName');
            });


            it('should not reject pinning a column if unpinned area width is less than 20% of the grid width', () => {

                grid.columns.forEach((column) => {
                    switch (column.index) {
                        case 0:
                        case 1:
                        case 4:
                        case 6:
                            column.pinned = true;
                    }
                });

                fix.detectChanges();

                grid.columns.forEach((column) => {
                    switch (column.index) {
                        case 0:
                        case 1:
                        case 4:
                        case 6:
                            expect(column.pinned).toBe(true);
                    }
                });
            });
        });
    });

    describe('To End', () => {
        let fix;
        let grid: IgxGridComponent;
        const pinningConfig: IPinningConfig = { columns: ColumnPinningPosition.End };

        describe('', () => {

            beforeEach(fakeAsync(() => {
                fix = TestBed.createComponent(PinOnInitAndSelectionComponent);
                fix.componentInstance.grid.pinning = pinningConfig;
                fix.detectChanges();
                grid = fix.componentInstance.grid;
                fix.detectChanges();
            }));

            it('should correctly initialize when there are initially pinned columns.', () => {

                const firstPinnedIndex = grid.unpinnedColumns.length;
                const secondPinnedIndex = grid.unpinnedColumns.length + 1;
                // verify pinned/unpinned collections
                expect(grid.pinnedColumns.length).toEqual(2);
                expect(grid.unpinnedColumns.length).toEqual(9);

                // verify DOM
                const firstIndexCell = grid.gridAPI.get_cell_by_index(0, 'CompanyName');
                expect(firstIndexCell.visibleColumnIndex).toEqual(firstPinnedIndex);
                expect(GridFunctions.isCellPinned(firstIndexCell)).toBe(true);

                const lastIndexCell = grid.gridAPI.get_cell_by_index(0, 'ContactName');
                expect(lastIndexCell.visibleColumnIndex).toEqual(secondPinnedIndex);

                // const headers = GridFunctions.getColumnHeaders(fix);
                const headers = grid.headerCellList;
                const penultimateColumnHeader = headers[headers.length - 2];
                const lastColumnHeader = headers[headers.length - 1];
                expect(penultimateColumnHeader.column.field).toEqual('CompanyName');

                expect(lastColumnHeader.column.field).toEqual('ContactName');

                // verify container widths
                GridFunctions.verifyPinnedAreaWidth(grid, 400);
                GridFunctions.verifyUnpinnedAreaWidth(grid, 400);
            });

            it('should allow pinning/unpinning via the grid API', () => {

                // Unpin column
                grid.unpinColumn('CompanyName');
                fix.detectChanges();

                // verify column is unpinned
                expect(grid.pinnedColumns.length).toEqual(1);
                expect(grid.unpinnedColumns.length).toEqual(10);

                const col = grid.getColumnByName('CompanyName');
                expect(col.pinned).toBe(false);
                expect(col.visibleIndex).toEqual(1);

                // verify DOM
                let cell = grid.gridAPI.get_cell_by_index(0, 'CompanyName');
                expect(cell.visibleColumnIndex).toEqual(1);
                expect(GridFunctions.isCellPinned(cell)).toBe(false);

                const secondHeader = GridFunctions.getColumnHeaders(fix)[1];

                expect(secondHeader.context.column.field).toEqual('CompanyName');
                expect(GridFunctions.isHeaderPinned(secondHeader)).toBe(false);

                // verify container widths
                GridFunctions.verifyPinnedAreaWidth(grid, 200);
                GridFunctions.verifyUnpinnedAreaWidth(grid, 600);

                // pin back the column.
                grid.pinColumn('CompanyName');
                fix.detectChanges();

                // verify column is pinned
                expect(grid.pinnedColumns.length).toEqual(2);
                expect(grid.unpinnedColumns.length).toEqual(9);

                // verify container widths
                GridFunctions.verifyPinnedAreaWidth(grid, 400);
                GridFunctions.verifyUnpinnedAreaWidth(grid, 400);

                expect(col.pinned).toBe(true);
                expect(col.visibleIndex).toEqual(grid.unpinnedColumns.length + 1);

                cell = grid.gridAPI.get_cell_by_index(0, 'CompanyName');
                expect(cell.visibleColumnIndex).toEqual(grid.unpinnedColumns.length + 1);
                expect(GridFunctions.isCellPinned(cell)).toBe(true);
            });

            it('should correctly pin column to right when row selectors are enabled.', () => {
                grid.rowSelection =  GridSelectionMode.multiple;
                fix.detectChanges();

                // check row DOM
                const row = grid.gridAPI.get_row_by_index(0).nativeElement;

                GridSelectionFunctions.verifyRowHasCheckbox(row);
                expect(GridFunctions.getRowDisplayContainer(fix, 0)).toBeDefined();
                expect(row.children[2].getAttribute('aria-describedby')).toBe(grid.id + '_CompanyName');
                expect(row.children[3].getAttribute('aria-describedby')).toBe(grid.id + '_ContactName');

                // check scrollbar DOM
                const scrBarStartSection = fix.debugElement.query(By.css(`.${GRID_SCROLL_CLASS}-start`));
                const scrBarMainSection = fix.debugElement.query(By.css(`.${GRID_SCROLL_CLASS}-main`));
                const scrBarEndSection = fix.debugElement.query(By.css(`.${GRID_SCROLL_CLASS}-end`));

                // The default pinned-border-width in px
                expect(scrBarStartSection.nativeElement.offsetWidth).toEqual(grid.featureColumnsWidth());

                GridFunctions.verifyPinnedAreaWidth(grid, scrBarEndSection.nativeElement.offsetWidth);
                GridFunctions.verifyUnpinnedAreaWidth(grid, scrBarMainSection.nativeElement.offsetWidth, false);
            });

            it('should pin an unpinned column when drag/drop it among pinned columns.', () => {

                // move 'ID' column to the pinned area
                grid.moveColumn(grid.getColumnByName('ID'), grid.getColumnByName('ContactName'), DropPosition.BeforeDropTarget);
                fix.detectChanges();

                // verify column is pinned at the correct place
                expect(grid.pinnedColumns[0].field).toEqual('CompanyName');
                expect(grid.pinnedColumns[1].field).toEqual('ID');
                expect(grid.pinnedColumns[2].field).toEqual('ContactName');
                expect(grid.getColumnByName('ID').pinned).toBeTruthy();
            });

            it('should correctly pin columns with their summaries to end.', () => {

                grid.columns.forEach(col => {
                    if (col.field === 'CompanyName' || col.field === 'ContactName') {
                        col.hasSummary = true;
                    }
                });
                fix.detectChanges();

                const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 9,
                    ['Count'], ['27']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 10,
                    ['Count'], ['27']);

                const pinnedSummaryCells = GridSummaryFunctions.getRootPinnedSummaryCells(fix);
                expect(pinnedSummaryCells[0].classes[`${PINNED_SUMMARY}-first`])
                    .toBeTruthy();
                expect(pinnedSummaryCells[1].classes[`${PINNED_SUMMARY}-first`])
                    .toBeFalsy();
            });

            it('should allow navigating to/from pinned area', (async () => {
                setupGridScrollDetection(fix, grid);
                const cellCompanyName = grid.gridAPI.get_cell_by_index(0, 'CompanyName');
                const range = { rowStart: 0, rowEnd: 0, columnStart: 9, columnEnd: 9 };
                grid.selectRange(range);
                grid.navigation.activeNode = { row: 0, column: 9 };
                fix.detectChanges();
                expect(cellCompanyName.active).toBe(true);

                grid.navigation.dispatchEvent(UIInteractions.getKeyboardEvent('keydown', 'ArrowLeft'));
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                const cellFax = grid.gridAPI.get_cell_by_index(0, 'Fax');
                expect(cellFax.active).toBe(true);
                expect(cellCompanyName.active).toBe(false);

                grid.navigation.dispatchEvent(UIInteractions.getKeyboardEvent('keydown', 'ArrowRight'));
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                expect(cellFax.active).toBe(false);
                expect(cellCompanyName.active).toBe(true);
            }));

            it('should allow navigating to/from pinned area using Ctrl+Left/Right', (async () => {

                const cellCompanyName = grid.gridAPI.get_cell_by_index(0, 'CompanyName');
                const range = { rowStart: 0, rowEnd: 0, columnStart: 9, columnEnd: 9 };
                grid.selectRange(range);
                grid.navigation.activeNode = { row: 0, column: 9 };
                fix.detectChanges();
                expect(cellCompanyName.active).toBe(true);

                grid.navigation.dispatchEvent(UIInteractions.getKeyboardEvent('keydown', 'ArrowLeft', false, false, true));
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                const cellID = grid.gridAPI.get_cell_by_index(0, 'ID');
                expect(cellID.active).toBe(true);
                expect(cellCompanyName.active).toBe(false);

                grid.navigation.dispatchEvent(UIInteractions.getKeyboardEvent('keydown', 'ArrowRight', false, false, true));
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                const cellContactName = grid.gridAPI.get_cell_by_index(0, 'ContactName');
                expect(cellID.active).toBe(false);
                expect(cellContactName.active).toBe(true);
            }));
        });

        describe('MRL/MCH', () => {
            it('should correctly pin column groups to end.', fakeAsync(() => {

                fix = TestBed.createComponent(MultiColumnHeadersWithGroupingComponent);
                fix.componentInstance.isPinned = true;
                fix.componentInstance.grid.pinning = pinningConfig;
                fix.detectChanges();
                grid = fix.componentInstance.grid;

                const pinnedCols = grid.pinnedColumns.filter(x => !x.columnGroup);
                expect(pinnedCols.length).toBe(3);

                expect(grid.getColumnByName('CompanyName').isFirstPinned).toBeTruthy();
                const row = grid.gridAPI.get_row_by_index(0).nativeElement;
                // check cells are rendered after main display container and have left offset
                for (let i = 0; i <= pinnedCols.length - 1; i++) {
                    const elem = row.children[i + 1];
                    expect(parseInt((elem as any).style.left, 10)).toBe(-330);
                    expect(elem.getAttribute('aria-describedby')).toBe(grid.id + '_' + pinnedCols[i].field);
                }

                // check correct headers have left border
                const pinnedHeaders = grid.headerGroupsList.filter(group => group.isPinned);
                expect(pinnedHeaders[0].nativeElement.querySelector('[aria-label="General Information"]')).not.toBeNull();
                expect(pinnedHeaders[1].column.field).toBe('CompanyName');
            }));

            it('should correctly pin multi-row-layouts to end.', fakeAsync(() => {

                fix = TestBed.createComponent(GridPinningMRLComponent);
                fix.componentInstance.grid.pinning = pinningConfig;
                fix.detectChanges();
                grid = fix.componentInstance.grid;
                // check row DOM
                const row = grid.gridAPI.get_row_by_index(0).nativeElement;
                expect(GridFunctions.getRowDisplayContainer(fix, 0)).toBeTruthy();

                expect(row.children[1].classList.contains(`${CELL_PINNED_CLASS}-first`)).toBeTruthy();
                expect(row.children[1].classList.contains(GRID_MRL_BLOCK_CLASS)).toBeTruthy();
                expect(parseInt((row.children[1] as any).style.left, 10)).toEqual(-408);

                // check correct headers have left border
                const firstPinnedHeader = grid.headerGroupsList.find(group => group.isPinned);
                // The first child of the header is the <div> wrapping the MRL block
                expect(firstPinnedHeader.nativeElement.firstElementChild.classList.contains(GRID_MRL_BLOCK_CLASS)).toBeTrue();
                expect(firstPinnedHeader.nativeElement.firstElementChild.classList.contains(`${HEADER_PINNED_CLASS}-first`)).toBeTrue();
            }));

            it('should correctly add pinned columns to the right of the already fixed one', () => {
                fix = TestBed.createComponent(GridPinningMRLComponent);
                fix.componentInstance.grid.pinning = { columns: ColumnPinningPosition.Start };
                fix.detectChanges();
                grid = fix.componentInstance.grid;
                grid.unpinColumn('ID');
                fix.detectChanges();

                grid.pinColumn('Country');
                grid.pinColumn('ID');
                fix.detectChanges();
                expect(grid.pinnedColumns).toBeTruthy();
                expect(grid.pinnedColumns[1].field).toBe('Country');
                expect(grid.pinnedColumns[6].field).toBe('ID');
            });
        });
    });
});
