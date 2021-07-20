import { Component, ViewChild } from '@angular/core';
import { TestBed, ComponentFixture, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridModule, IGridCellEventArgs } from './public_api';
import { IgxGridComponent } from './grid.component';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { wait, UIInteractions, waitForSelectionChange } from '../../test-utils/ui-interactions.spec';
import { setupGridScrollDetection } from '../../test-utils/helper-utils.spec';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { CellType } from '../tree-grid/public_api';

const DEBOUNCETIME = 30;
const CELL_CSS_CLASS = '.igx-grid__td';
const ROW_CSS_CLASS = '.igx-grid__tr';
const CELL_BLOCK = '.igx-grid__mrl-block';

describe('IgxGrid Multi Row Layout - Keyboard navigation #grid', () => {
    let fix: ComponentFixture<ColumnLayoutTestComponent>;

    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                ColumnLayoutTestComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule],
        });
    }));

    beforeEach(fakeAsync(() => {
        fix = TestBed.createComponent(ColumnLayoutTestComponent);
    }));

    describe('Navigation without scrolling', () => {
        describe('General', () => {
            it('should navigate through a single layout with right and left arrow keys', () => {
                fix.detectChanges();

                const [firstCell, _secondCell, _thirdCell, _fourthCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
                UIInteractions.simulateClickAndSelectEvent(firstCell);

                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                fix.detectChanges();

                // reached the end shouldn't stay on the same cell
                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');
            });

            it('should navigate between column layouts with right arrow key', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ContactName', rowStart: 1, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 1 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'Phone', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }];
                fix.detectChanges();

                const [_firstCell, secondCell, _thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
                UIInteractions.simulateClickAndSelectEvent(secondCell);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
            });

            it('should navigate between column layouts with left key', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ContactName', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'Phone', rowStart: 1, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 1 }
                    ]
                }];
                fix.detectChanges();

                const [_firstCell, _secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
                UIInteractions.simulateClickAndSelectEvent(thirdCell);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
            });

            it('should navigate down and up to a cell from the same column layout from a cell with bigger col span', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 }
                    ]
                }];
                fix.detectChanges();

                const [firstCell, _secondCell, _thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
            });

            it('should navigate down and up to a cell from the same column layout to a cell with bigger col span', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'Phone', rowStart: 1, colStart: 1 },
                        { field: 'City', rowStart: 1, colStart: 2 },
                        { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 }
                    ]
                }];
                fix.detectChanges();

                const [_firstCell, secondCell, _thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
                UIInteractions.simulateClickAndSelectEvent(secondCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
            });

            it('should navigate down and up to a cell from the same column layout according to its starting location', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'Phone', rowStart: 1, colStart: 1 },
                        { field: 'City', rowStart: 1, colStart: 2, colEnd: 4 },
                        { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 3 }
                    ]
                }];
                fix.detectChanges();

                const [_firstCell, secondCell, _thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
                UIInteractions.simulateClickAndSelectEvent(secondCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
            });

            it('should allow navigating down to a cell from the next row', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'Phone', rowStart: 1, colStart: 1 },
                        { field: 'City', rowStart: 1, colStart: 2 },
                        { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 }
                    ]
                }];
                fix.detectChanges();

                const [_firstCell, _secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                UIInteractions.simulateClickAndSelectEvent(thirdCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
            });

            it('should allow navigating down to a cell from the next row with hidden column layout', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'Phone', rowStart: 1, colStart: 1 },
                        { field: 'City', rowStart: 1, colStart: 2 },
                        { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 }
                    ]
                }];
                fix.detectChanges();

                const [_firstCell, _secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                UIInteractions.simulateClickAndSelectEvent(thirdCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
            });

            it('should retain the focus when the first cell is reached', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'Phone', rowStart: 1, colStart: 1 },
                        { field: 'City', rowStart: 1, colStart: 2 },
                        { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 }
                    ]
                }];
                fix.detectChanges();

                const [_firstCell, secondCell, _thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                UIInteractions.simulateClickAndSelectEvent(secondCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
            });

            it('should navigate up correctly', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 }
                    ]
                }];

                fix.detectChanges();

                const [_firstCell, _secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                UIInteractions.simulateClickAndSelectEvent(thirdCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
            });

            it('navigate to right and left with hidden columns', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 }
                    ]
                }];
                fix.detectChanges();

                const [_firstCell, secondCell, _thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                UIInteractions.simulateClickAndSelectEvent(secondCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
            });

            it(`should navigate to the first cell from the layout by pressing Ctrl + Arrow Left and Right key
                and then Arrow Up + Down to same cell`, async () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }, {
                    group: 'group4',
                    columns: [
                        { field: 'Country', rowStart: 1, colStart: 1 },
                        { field: 'Phone', rowStart: 1, colStart: 2 },
                        { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
                    ]
                }];
                fix.detectChanges();
                const rows = fix.debugElement.queryAll(By.css(ROW_CSS_CLASS));
                const firstRowCell = rows[1].queryAll(By.css(CELL_CSS_CLASS));
                const lastCell = firstRowCell[firstRowCell.length - 1];

                UIInteractions.simulateClickAndSelectEvent(lastCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft', false, false, true);
                await wait();
                fix.detectChanges();

                await wait();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');
            });

            it(`should navigate to the first cell from the layout by pressing Ctrl + Arrow Right and Left key
                and then Arrow Up + Down to same cell`, async () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'Country', rowStart: 1, colStart: 1 },
                        { field: 'Phone', rowStart: 1, colStart: 2 },
                        { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }, {
                    group: 'group4',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }];
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                const rows = fix.debugElement.queryAll(By.css(ROW_CSS_CLASS));
                const firstRowCell = rows[1].queryAll(By.css(CELL_CSS_CLASS));
                const firstCell = firstRowCell[2];

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight', false, false, true);
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
            });

            it('should navigate using Arrow Left through bigger cell with same rowStart but bigger row span', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1 },
                        { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                        { field: 'ContactName', rowStart: 1, colStart: 3 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 3 },
                        { field: 'Country', rowStart: 3, colStart: 1 },
                        { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
                    ]
                }];
                fix.detectChanges();

                const [_thirdCell, _secondCell, firstCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft');
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');
            });

            it('should navigate using Arrow Left through bigger cell with smaller rowStart and bigger rowEnd', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1 },
                        { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                        { field: 'ContactName', rowStart: 1, colStart: 3 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 3 },
                        { field: 'Country', rowStart: 3, colStart: 1 },
                        { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
                    ]
                }];
                fix.detectChanges();

                const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[4];

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft');
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');
            });

            it('should navigate using Arrow Right through bigger cell with same rowStart but bigger row', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1 },
                        { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                        { field: 'ContactName', rowStart: 1, colStart: 3 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 3 },
                        { field: 'Country', rowStart: 3, colStart: 1 },
                        { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
                    ]
                }];
                fix.detectChanges();

                const [firstCell, _secondCell, _thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
            });

            it('should navigate using Arrow Right through bigger cell with smaller rowStart and bigger rowEnd', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1 },
                        { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                        { field: 'ContactName', rowStart: 1, colStart: 3 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 3 },
                        { field: 'Country', rowStart: 3, colStart: 1 },
                        { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
                    ]
                }];
                fix.detectChanges();

                const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[3];

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
            });

            it('should navigate using Arrow Down through cell with same colStart but bigger colEnd', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1 },
                        { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                        { field: 'ContactName', rowStart: 1, colStart: 3 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 3 },
                        { field: 'Country', rowStart: 3, colStart: 1 },
                        { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
                    ]
                }];
                fix.detectChanges();

                const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
            });

            it('should navigate using Arrow Down through cell with smaller colStart and bigger colEnd', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1 },
                        { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                        { field: 'ContactName', rowStart: 1, colStart: 3 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 3 },
                        { field: 'Country', rowStart: 3, colStart: 1 },
                        { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
                    ]
                }];
                fix.detectChanges();

                const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[4];

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
            });

            it('should navigate using Arrow Up through cell with smaller colStart and bigger colEnd', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1 },
                        { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                        { field: 'ContactName', rowStart: 1, colStart: 3 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 3 },
                        { field: 'Country', rowStart: 3, colStart: 1 },
                        { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
                    ]
                }];
                fix.detectChanges();

                const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[9];

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
            });

            it('should navigate correctly with column group is hidden.', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];
                fix.detectChanges();
                const grid = fix.componentInstance.grid;
                // hide second group
                const secondGroup = grid.getColumnByName('group2');
                secondGroup.hidden = true;
                fix.detectChanges();

                // check visible indexes are correct
                expect(grid.getCellByColumn(0, 'ID').column.visibleIndex).toBe(0);
                expect(grid.getCellByColumn(0, 'Address').column.visibleIndex).toBe(1);
                expect(grid.getCellByColumn(0, 'PostalCode').column.visibleIndex).toBe(2);
                // focus last
                const cell = grid.gridAPI.get_cell_by_index(0, 'Address');
                UIInteractions.simulateClickAndSelectEvent(cell);
                fix.detectChanges();

                // arrow left
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft');
                fix.detectChanges();

                // check correct cell has focus
                const cell2 = grid.getCellByColumn(0, 'ID');
                expect(cell2.active).toBe(true);

                // arrow right
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                fix.detectChanges();

                // check correct cell has focus
                expect(grid.getCellByColumn(0, 'Address').active).toBe(true);
            });
        });

        describe('GroupBy Integration', () => {
            it('should allow navigation through group rows with arrow keys starting from group row.', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];
                fix.detectChanges();
                // group by city
                const grid = fix.componentInstance.grid;
                grid.groupBy({
                    fieldName: 'City',
                    dir: SortingDirection.Asc,
                    ignoreCase: true,
                    strategy: DefaultSortingStrategy.instance()
                });
                fix.detectChanges();

                let groupRow = (grid.gridAPI.get_row_by_index(0) as any) as IgxGridGroupByRowComponent;
                UIInteractions.simulateClickAndSelectEvent(groupRow);
                fix.detectChanges();

                // arrow down
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                // check first data cell is active
                let cell = grid.getCellByColumn(1, 'ID');
                expect(cell.active).toBe(true);

                // arrow down
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                // check next group row is active
                groupRow = (grid.gridAPI.get_row_by_index(2) as any) as IgxGridGroupByRowComponent;
                GridFunctions.verifyGroupRowIsFocused(groupRow);

                // arrow up
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();
                // check prev cell is active
                cell = grid.getCellByColumn(1, 'ID');
                expect(cell.active).toBe(true);

                // arrow up
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                // check first group row is active
                groupRow = (grid.gridAPI.get_row_by_index(0) as any) as IgxGridGroupByRowComponent;
                GridFunctions.verifyGroupRowIsFocused(groupRow);
            });

            it('should allow navigation through group rows with arrow keys starting from middle of grid row', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];

                fix.detectChanges();
                // group by city
                const grid = fix.componentInstance.grid;
                grid.height = '700px';
                grid.groupBy({
                    fieldName: 'City',
                    dir: SortingDirection.Asc,
                    ignoreCase: true,
                    strategy: DefaultSortingStrategy.instance()
                });
                fix.detectChanges();

                const firstBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[0].queryAll(By.css(CELL_BLOCK))[1];
                const secondBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[1].queryAll(By.css(CELL_BLOCK))[1];
                const firstCell = firstBlock.queryAll(By.css(CELL_CSS_CLASS))[3];
                const secondCell = secondBlock.queryAll(By.css(CELL_CSS_CLASS))[0];

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                // arrow down
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                // check next group row is active
                let groupRow = (grid.gridAPI.get_row_by_index(2) as any) as IgxGridGroupByRowComponent;
                GridFunctions.verifyGroupRowIsFocused(groupRow);

                // arrow down
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                // check first data cell is active
                expect(fix.componentInstance.selectedCell.value).toEqual('Maria Anders');
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
                expect(secondCell.componentInstance.active).toBeTruthy();

                // arrow up
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                // check group row is active
                groupRow = (grid.gridAPI.get_row_by_index(2) as any) as IgxGridGroupByRowComponent;
                GridFunctions.verifyGroupRowIsFocused(groupRow);

                // arrow up
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                // check last cell in group 1 layout is active
                expect(fix.componentInstance.selectedCell.value).toEqual('Order Administrator');
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');
                expect(firstCell.componentInstance.active).toBeTruthy();
            });
        });

        describe('Column Moving Integration', () => {
            it('tab navigation should follow correct sequence if a column is moved.', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];
                fix.detectChanges();
                const grid = fix.componentInstance.grid;
                // move second group
                const col1 = grid.getColumnByName('group3');
                const col2 = grid.getColumnByName('group1');
                grid.moveColumn(col2, col1);
                fix.detectChanges();

                // check visible indexes are correct
                expect(grid.getCellByColumn(0, 'ContactName').column.visibleIndex).toBe(0);
                expect(grid.getCellByColumn(0, 'Address').column.visibleIndex).toBe(1);
                expect(grid.getCellByColumn(0, 'ID').column.visibleIndex).toBe(2);
                expect(grid.getCellByColumn(0, 'Phone').column.visibleIndex).toBe(3);
                expect(grid.getCellByColumn(0, 'City').column.visibleIndex).toBe(4);
                expect(grid.getCellByColumn(0, 'ContactTitle').column.visibleIndex).toBe(5);
                expect(grid.getCellByColumn(0, 'PostalCode').column.visibleIndex).toBe(6);
            });
        });

        describe('Pinning integration', () => {
            it('tab navigation should follow correct sequence if a column is pinned runtime.', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];
                fix.detectChanges();
                const grid = fix.componentInstance.grid;
                // hide second group
                const secondGroup = grid.getColumnByName('group2');
                secondGroup.pinned = true;
                fix.detectChanges();

                // check visible indexes are correct
                expect(grid.getCellByColumn(0, 'ContactName').column.visibleIndex).toBe(0);
                expect(grid.getCellByColumn(0, 'ID').column.visibleIndex).toBe(1);
                expect(grid.getCellByColumn(0, 'Address').column.visibleIndex).toBe(2);
                expect(grid.getCellByColumn(0, 'Phone').column.visibleIndex).toBe(3);
                expect(grid.getCellByColumn(0, 'City').column.visibleIndex).toBe(4);
                expect(grid.getCellByColumn(0, 'ContactTitle').column.visibleIndex).toBe(5);
                expect(grid.getCellByColumn(0, 'PostalCode').column.visibleIndex).toBe(6);
            });

            it('should navigate left from unpinned to pinned area when pinning second block in template', () => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                            { field: 'ContactName', rowStart: 2, colStart: 1 },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                        ]
                    },
                    {
                        group: 'group2',
                        pinned: true,
                        columns: [
                            { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px' },
                            { field: 'Region', rowStart: 3, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 2 }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px' },
                            { field: 'Fax', rowStart: 2, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 1 }
                        ]
                    }
                ];
                fix.componentInstance.grid.width = '600px';
                fix.detectChanges();
                const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[0];
                const secondBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[1];

                const firstCell = secondBlock.queryAll(By.css(CELL_CSS_CLASS))[1];
                const secondCell = firstBlock.queryAll(By.css(CELL_CSS_CLASS))[0];

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
                expect(secondCell.componentInstance.active).toBeTruthy();
            });

            it('should navigate down to next row inside pinned area when pinning second block in template', () => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                            { field: 'ContactName', rowStart: 2, colStart: 1 },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                        ]
                    },
                    {
                        group: 'group2',
                        pinned: true,
                        columns: [
                            { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px' },
                            { field: 'Region', rowStart: 3, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 2 }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px' },
                            { field: 'Fax', rowStart: 2, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 1 }
                        ]
                    }
                ];
                fix.componentInstance.grid.width = '600px';
                fix.detectChanges();
                const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[0];
                const secondBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[1].queryAll(By.css(CELL_BLOCK))[0];

                const firstCell = firstBlock.queryAll(By.css(CELL_CSS_CLASS))[1];
                const secondCell = secondBlock.queryAll(By.css(CELL_CSS_CLASS))[0];
                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
                expect(secondCell.componentInstance.active).toBeTruthy();
            });

            it('should navigate down to next row inside unpinned area when pinning second block in template', () => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                            { field: 'ContactName', rowStart: 2, colStart: 1 },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                        ]
                    },
                    {
                        group: 'group2',
                        pinned: true,
                        columns: [
                            { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px' },
                            { field: 'Region', rowStart: 3, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 2 }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px' },
                            { field: 'Fax', rowStart: 2, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 1 }
                        ]
                    }
                ];
                fix.componentInstance.grid.width = '600px';
                fix.detectChanges();
                const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[1];
                const secondBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[1].queryAll(By.css(CELL_BLOCK))[1];
                let _dummyCell;
                let firstCell;
                let secondCell;
                [firstCell,
                    secondCell, _dummyCell,
                    firstCell] = firstBlock.queryAll(By.css(CELL_CSS_CLASS));
                [secondCell,
                    _dummyCell, _dummyCell,
                    _dummyCell] = secondBlock.queryAll(By.css(CELL_CSS_CLASS));
                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
                expect(secondCell.componentInstance.active).toBeTruthy();
            });

            it('should navigate up to next row inside pinned area when pinning second block in template', () => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                            { field: 'ContactName', rowStart: 2, colStart: 1 },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                        ]
                    },
                    {
                        group: 'group2',
                        pinned: true,
                        columns: [
                            { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px' },
                            { field: 'Region', rowStart: 3, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 2 }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px' },
                            { field: 'Fax', rowStart: 2, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 1 }
                        ]
                    }
                ];
                fix.componentInstance.grid.width = '600px';
                fix.detectChanges();
                const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[0];
                const secondBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[1].queryAll(By.css(CELL_BLOCK))[0];

                const firstCell = secondBlock.queryAll(By.css(CELL_CSS_CLASS))[0];
                const secondCell = firstBlock.queryAll(By.css(CELL_CSS_CLASS))[1];

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Region);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Region');
                expect(secondCell.componentInstance.active).toBeTruthy();
            });

            it('should navigate up to next row inside unpinned area when pinning second block in template', () => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                            { field: 'ContactName', rowStart: 2, colStart: 1 },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                        ]
                    },
                    {
                        group: 'group2',
                        pinned: true,
                        columns: [
                            { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px' },
                            { field: 'Region', rowStart: 3, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 2 }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px' },
                            { field: 'Fax', rowStart: 2, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 1 }
                        ]
                    }
                ];
                fix.componentInstance.grid.width = '600px';
                fix.detectChanges();
                const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[1];
                const secondBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[1].queryAll(By.css(CELL_BLOCK))[1];

                const firstCell = secondBlock.queryAll(By.css(CELL_CSS_CLASS))[0];
                const secondCell = firstBlock.queryAll(By.css(CELL_CSS_CLASS))[3];

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Address);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Address');
                expect(secondCell.componentInstance.active).toBeTruthy();
            });

            it('should navigate up to next row inside unpinned area when pinning second block in template', () => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                            { field: 'ContactName', rowStart: 2, colStart: 1 },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 },
                        ]
                    },
                    {
                        group: 'group2',
                        pinned: true,
                        columns: [
                            { field: 'Col1', rowStart: 1, colStart: 1 },
                            { field: 'Col2', rowStart: 1, colStart: 2 },
                            { field: 'Col3', rowStart: 1, colStart: 3 },
                            { field: 'City', rowStart: 2, colStart: 1, colEnd: 4, width: '400px' },
                            { field: 'Region', rowStart: 3, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 2, colEnd: 4 }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px' },
                            { field: 'Fax', rowStart: 2, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 1 }
                        ]
                    }
                ];
                fix.componentInstance.grid.width = '1000px';
                fix.detectChanges();
                const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[1];
                const secondBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[2];

                const firstCell = firstBlock.queryAll(By.css(CELL_CSS_CLASS))[2];
                const secondCell = secondBlock.queryAll(By.css(CELL_CSS_CLASS))[1];

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');
                expect(secondCell.componentInstance.active).toBeTruthy();
            });
        });

        describe('Row Edit integration', () => {
            it('shift+tab navigation should go through edit row buttons when navigating in row edit mode. ', () => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px', editable: true },
                            { field: 'ContactName', rowStart: 2, colStart: 1, editable: true },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2, editable: true },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3, editable: true }
                        ]
                    },
                    {
                        group: 'group2',
                        columns: [
                            { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px', editable: true },
                            { field: 'Region', rowStart: 3, colStart: 1, editable: true },
                            { field: 'PostalCode', rowStart: 3, colStart: 2, editable: true }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px', editable: true },
                            { field: 'Fax', rowStart: 2, colStart: 1, editable: true },
                            { field: 'ID', rowStart: 3, colStart: 1, editable: true }
                        ]
                    }
                ];
                fix.detectChanges();

                const grid = fix.componentInstance.grid;
                grid.primaryKey = 'ID';
                grid.rowEditable = true;
                fix.detectChanges();

                let targetCell = grid.getCellByColumn(0, 'CompanyName');
                UIInteractions.simulateDoubleClickAndSelectEvent(grid.gridAPI.get_cell_by_index(0, 'CompanyName'));
                fix.detectChanges();

                const rowEditingBannerElement = fix.debugElement.query(By.css('.igx-banner__row')).nativeElement;
                const doneButtonElement = rowEditingBannerElement.lastElementChild;
                const cancelButtonElement = rowEditingBannerElement.firstElementChild;

                // shift+tab into Done button
                GridFunctions.simulateGridContentKeydown(fix, 'Tab', false, true);
                fix.detectChanges();
                expect(document.activeElement).toEqual(doneButtonElement);

                // shift+ tab into Cancel
                UIInteractions.triggerKeyDownEvtUponElem('tab', doneButtonElement, true, false, true);
                fix.detectChanges();

                // shift+ tab into last cell
                UIInteractions.triggerKeyDownEvtUponElem('tab', cancelButtonElement, true, false, true);
                fix.detectChanges();

                targetCell = grid.getCellByColumn(0, 'PostalCode');
                expect(targetCell.active).toBe(true);
            });
        });
    });

    // Note: Some tests execute await wait() and etc two times, because the grid scrolls two times.
    // This means that we need to wait chunkLoad event from the igxForOf two times.
    describe('Navigation with scrolling', () => {
        describe('General', () => {
            it('should allow navigating down with scrolling', async () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'Phone', rowStart: 1, colStart: 1 },
                        { field: 'City', rowStart: 1, colStart: 2 },
                        { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 }
                    ]
                }];
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                const rows = fix.debugElement.queryAll(By.css(ROW_CSS_CLASS));
                const penultRowCells = rows[rows.length - 2].queryAll(By.css(CELL_CSS_CLASS));
                const secondCell = penultRowCells[1];
                const rowIndex = parseInt(secondCell.nativeElement.getAttribute('data-rowindex'), 10);

                UIInteractions.simulateClickAndSelectEvent(secondCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[rowIndex + 1].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
            });

            it('should navigate correctly by pressing Ctrl + ArrowUp/ArrowDown key', async () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    pinned: true,
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 }
                    ]
                }];
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                setupGridScrollDetection(fix, fix.componentInstance.grid);

                const [ _firstCell, _secondCell, thirdCell ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                UIInteractions.simulateClickAndSelectEvent(thirdCell);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown', false, false, true);
                await wait(DEBOUNCETIME * 2);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value)
                    .toEqual(fix.componentInstance.data[fix.componentInstance.data.length - 1].ContactTitle);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp', false, false, true);
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');
            });

            it('should navigate to the last cell from the layout by pressing Home/End or Ctrl + ArrowLeft/ArrowRight key', async () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }, {
                    group: 'group4',
                    columns: [
                        { field: 'Country', rowStart: 1, colStart: 1 },
                        { field: 'Phone', rowStart: 1, colStart: 2 },
                        { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
                    ]
                }];
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'end');
                await wait(DEBOUNCETIME * 2);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

                GridFunctions.simulateGridContentKeydown(fix, 'home');
                await wait(DEBOUNCETIME * 2);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight', false, false, true);
                await wait(DEBOUNCETIME * 2);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft', false, false, true);
                await wait(DEBOUNCETIME * 2);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
            });

            it('should navigate to the last cell from the first/last layout by pressing Ctrl + Home/End key', async () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }, {
                    group: 'group4',
                    columns: [
                        { field: 'Country', rowStart: 1, colStart: 1 },
                        { field: 'Phone', rowStart: 1, colStart: 2 },
                        { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
                    ]
                }];
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                setupGridScrollDetection(fix, fix.componentInstance.grid);
                const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'end', false, false, true);
                await wait(200);
                fix.detectChanges();
                await wait(200);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value)
                    .toEqual(fix.componentInstance.data[fix.componentInstance.data.length - 1].Fax);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

                GridFunctions.simulateGridContentKeydown(fix, 'home', false, false, true);
                await wait(200);
                fix.detectChanges();
                await wait(200);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
            });

            it(`should navigate to the last cell from the layout by pressing Home/End or Ctrl + ArrowLeft/ArrowRight key
                    and keep same rowStart from the first selection when last cell spans more rows`, async () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }, {
                    group: 'group4',
                    columns: [
                        { field: 'Country', rowStart: 1, colStart: 1 },
                        { field: 'Phone', rowStart: 1, colStart: 2 },
                        { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
                    ]
                }];
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                // last cell from first layout
                const lastCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[3];

                UIInteractions.simulateClickAndSelectEvent(lastCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'end');
                await wait(DEBOUNCETIME * 2);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

                GridFunctions.simulateGridContentKeydown(fix, 'home');
                await wait(DEBOUNCETIME * 2);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Address);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Address');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight', false, false, true);
                await wait(DEBOUNCETIME * 2);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft', false, false, true);
                await wait(DEBOUNCETIME * 2);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Address);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Address');
            });

            it(`should navigate to the last cell from the layout by pressing Home/End and Ctrl key
                and keep same rowStart from the first selection when last cell spans more rows`, async () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }, {
                    group: 'group4',
                    columns: [
                        { field: 'Country', rowStart: 1, colStart: 1 },
                        { field: 'Phone', rowStart: 1, colStart: 2 },
                        { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
                    ]
                }];
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                setupGridScrollDetection(fix, fix.componentInstance.grid);
                // last cell from first layout
                const lastCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[3];

                UIInteractions.simulateClickAndSelectEvent(lastCell);
                await wait();
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'End', false, false, true);
                await wait(200);
                fix.detectChanges();
                await wait(200);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value)
                    .toEqual(fix.componentInstance.data[fix.componentInstance.data.length - 1].Fax);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

                GridFunctions.simulateGridContentKeydown(fix, 'Home', false, false, true);
                await wait(200);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
            });

            it(`should navigate to the last cell from the layout by pressing Ctrl + Arrow Right key
                and then Arrow Down + Up to same cell`, async () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }, {
                    group: 'group4',
                    columns: [
                        { field: 'Country', rowStart: 1, colStart: 1 },
                        { field: 'Phone', rowStart: 1, colStart: 2 },
                        { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
                    ]
                }];
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                setupGridScrollDetection(fix, fix.componentInstance.grid);
                const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight', false, false, true);
                await waitForSelectionChange(fix.componentInstance.grid);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
            });

            it(`should navigate to the last cell from the layout by pressing Ctrl + Arrow Right key
                and then Arrow Up + Down to same cell`, async () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }, {
                    group: 'group4',
                    columns: [
                        { field: 'Country', rowStart: 1, colStart: 1 },
                        { field: 'Phone', rowStart: 1, colStart: 2 },
                        { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
                    ]
                }];
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                setupGridScrollDetection(fix, fix.componentInstance.grid);
                const rows = fix.debugElement.queryAll(By.css(ROW_CSS_CLASS));
                const firstCell = rows[2].queryAll(By.css(CELL_CSS_CLASS))[0];

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight', false, false, true);
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
            });

            it('should scroll active cell fully in view when navigating with arrow keys and row is partially visible.', async () => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        columns: [
                            // col span 2
                            { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                            { field: 'Phone', rowStart: 2, colStart: 1 },
                            { field: 'City', rowStart: 2, colStart: 2 },
                            // col span 2
                            { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                        ]
                    },
                    {
                        group: 'group2',
                        columns: [
                            // row span 2
                            { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                            { field: 'PostalCode', rowStart: 3, colStart: 1 }
                        ]
                    },
                    {
                        group: 'group3',
                        // row span 3
                        columns: [
                            { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                        ]
                    }];
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                const grid = fix.componentInstance.grid;
                 fix.detectChanges();

                // focus 3rd row, first cell
                let cell = grid.gridAPI.get_cell_by_index(2, 'ContactName');
                UIInteractions.simulateClickAndSelectEvent(cell);
                fix.detectChanges();

                // arrow down
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                // check next cell is active and is fully in view
                cell = grid.gridAPI.get_cell_by_index(2, 'Phone');
                expect(cell.active).toBe(true);
                expect(grid.verticalScrollContainer.getScroll().scrollTop).toBeGreaterThan(50);
                let diff = grid.gridAPI.get_cell_by_index(2, 'Phone')
                    .nativeElement.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom;
                expect(diff).toBe(0);

                // focus 1st row, 2nd cell
                cell = grid.gridAPI.get_cell_by_index(0, 'Phone');
                UIInteractions.simulateClickAndSelectEvent(cell);
                fix.detectChanges();

                // arrow up
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                // check next cell is active and is fully in view
                cell = grid.gridAPI.get_cell_by_index(0, 'ContactName');
                expect(cell.active).toBe(true);
                expect(grid.verticalScrollContainer.getScroll().scrollTop).toBe(0);
                diff = grid.gridAPI.get_cell_by_index(0, 'ContactName')
                    .nativeElement.getBoundingClientRect().top - grid.tbody.nativeElement.getBoundingClientRect().top;
                expect(diff).toBe(0);

                // focus 3rd row, first cell
                cell = grid.gridAPI.get_cell_by_index(2, 'ContactName');
                UIInteractions.simulateClickAndSelectEvent(cell);
                fix.detectChanges();

                // arrow right
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                // check next cell is active and is fully in view
                cell = grid.gridAPI.get_cell_by_index(2, 'Address');
                expect(cell.active).toBe(true);
                expect(grid.verticalScrollContainer.getScroll().scrollTop).toBeGreaterThan(50);
                diff = grid.gridAPI.get_cell_by_index(2, 'Address')
                    .nativeElement.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom;
                expect(diff).toBe(0);

                // focus 1st row, Address
                cell = grid.gridAPI.get_cell_by_index(0, 'Address');
                UIInteractions.simulateClickAndSelectEvent(cell);
                fix.detectChanges();

                // arrow left
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                // check next cell is active and is fully in view
                cell = grid.gridAPI.get_cell_by_index(0, 'ContactName');
                expect(cell.active).toBe(true);
                expect(grid.verticalScrollContainer.getScroll().scrollTop).toBe(0);
                diff = grid.gridAPI.get_cell_by_index(0, 'ContactName')
                    .nativeElement.getBoundingClientRect().top - grid.tbody.nativeElement.getBoundingClientRect().top;
                expect(diff).toBe(0);
            });

            it('should scroll active cell fully in view when navigating with arrow keys and column is partially visible.', async () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 5 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 2, colStart: 3 },
                        { field: 'Country', rowStart: 2, colStart: 4 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 5 }
                    ]
                }];
                const grid = fix.componentInstance.grid;
                grid.columnWidth = '300px';
                grid.width = '300px';
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                // focus 1st row, 2nd row cell
                let cell = grid.getCellByColumn(0, 'Phone');
                UIInteractions.simulateClickAndSelectEvent(grid.gridAPI.get_cell_by_index(0, 'Phone'));
                fix.detectChanges();

                // arrow right
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                // check next cell is active
                cell = grid.getCellByColumn(0, 'City');
                expect(cell.active).toBe(true);
                expect(grid.headerContainer.getScroll().scrollLeft).toBeGreaterThanOrEqual(300);

                // arrow left
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                // check next cell is active
                cell = grid.getCellByColumn(0, 'Phone');
                expect(cell.active).toBe(true);
            });

            it(`should navigate to the last cell from the layout by pressing Ctrl + ArrowLeft/ArrowRight key
            in grid with horizontal virtualization`, async () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];
                const grid = fix.componentInstance.grid;
                grid.columnWidth = '300px';
                grid.width = '400px';
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                let firstCell = grid.gridAPI.get_cell_by_index(0, 'ID');
                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                // ctrl+arrow right
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight', false, false, true);
                await wait(DEBOUNCETIME * 2);
                fix.detectChanges();

                // check correct cell is active and is fully in view
                const lastCell = grid.gridAPI.get_cell_by_index(0, 'Address');
                expect(lastCell.active).toBe(true);
                expect(grid.headerContainer.getScroll().scrollLeft).toBeGreaterThan(800);
                let diff = lastCell.nativeElement.getBoundingClientRect().right - grid.tbody.nativeElement.getBoundingClientRect().right;
                expect(diff).toBe(0);

                // ctrl+arrow left
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft', false, false, true);
                await wait(DEBOUNCETIME * 2);
                fix.detectChanges();

                // first cell should be active and is fully in view
                firstCell = grid.gridAPI.get_cell_by_index(0, 'ID');
                expect(firstCell.active).toBe(true);
                expect(grid.headerContainer.getScroll().scrollLeft).toBe(0);
                diff = firstCell.nativeElement.getBoundingClientRect().left - grid.tbody.nativeElement.getBoundingClientRect().left;
                expect(diff).toBe(0);
            });
        });

        describe('Pinning', () => {
            it('should navigate from pinned to unpinned area and backwards', async () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    pinned: true,
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }];
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
            });

            xit('when navigating from pinned to unpinned area cell should be fully scrolled in view.', async () => {
                pending('This should be tested in the e2e test');
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];
                fix.detectChanges();

                const grid = fix.componentInstance.grid;
                grid.columnWidth = '300px';
                grid.width = '500px';
                setupGridScrollDetection(fix, grid);
                fix.detectChanges();

                // pin col
                grid.getColumnByName('ID').pinned = true;
                fix.detectChanges();

                // scroll right
                grid.headerContainer.getScroll().scrollLeft = 800;
                await wait(DEBOUNCETIME * 2);
                fix.detectChanges();

                // focus first pinned cell
                const firstCell = grid.gridAPI.get_cell_by_index(0, 'ID');
                UIInteractions.simulateClickAndSelectEvent(firstCell);
                await wait();
                fix.detectChanges();

                // arrow right
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                await wait();
                fix.detectChanges();

                // check if first unpinned cell is active and is in view
                let firstUnpinnedCell = grid.gridAPI.get_cell_by_index(0, 'ContactName');
                expect(firstUnpinnedCell.active).toBe(true);
                let diff = firstUnpinnedCell.nativeElement.getBoundingClientRect().left -
                    grid.pinnedWidth - grid.tbody.nativeElement.getBoundingClientRect().left;
                expect(diff).toBe(0);

                // arrow left
                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft');
                fix.detectChanges();

                expect(firstCell.active).toBe(true);

                // scroll right
                grid.headerContainer.getScroll().scrollLeft = 800;
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'Tab');
                await wait();
                fix.detectChanges();

                firstUnpinnedCell = grid.gridAPI.get_cell_by_index(0, 'ContactName');
                expect(firstUnpinnedCell.active).toBe(true);
                diff = firstUnpinnedCell.nativeElement.getBoundingClientRect().left -
                    grid.pinnedWidth - grid.tbody.nativeElement.getBoundingClientRect().left;
                expect(diff).toBe(0);
            });

            it('should navigate to unpinned area when the column layout is bigger than the display container', async () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    pinned: true,
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px' },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }];
                fix.componentInstance.grid.width = '600px';
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
            });

            it('should navigate from pinned to unpinned area and backwards using Home/End', async () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    pinned: true,
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }];
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                const secondCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];

                UIInteractions.simulateClickAndSelectEvent(secondCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'End');
                await wait();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateGridContentKeydown(fix, 'Home');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
            });

            it('should navigate from pinned to unpinned area and backwards using Ctrl+Left/Right', async () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    pinned: true,
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }];
                fix.detectChanges();
                const secondCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];

                UIInteractions.simulateClickAndSelectEvent(secondCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight', false, false, true);
                await wait();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowLeft', false, false, true);
                await wait();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
            });

            it('should navigate to the last block with one pinned group and unpinned area has scrollbar', async () => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        pinned: true,
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                            { field: 'ContactName', rowStart: 2, colStart: 1 },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                        ]
                    },
                    {
                        group: 'group2',
                        columns: [
                            { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px' },
                            { field: 'Region', rowStart: 3, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 2 }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px' },
                            { field: 'Fax', rowStart: 2, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 1 }
                        ]
                    }
                ];
                fix.componentInstance.grid.width = '600px';
                fix.detectChanges();
                const secondBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[1];
                const thirdBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[2];

                const [secondCell, thirdCell, _fourthCell ] = thirdBlock.queryAll(By.css(CELL_CSS_CLASS));
                const firstCell = secondBlock.queryAll(By.css(CELL_CSS_CLASS))[0];

                fix.componentInstance.grid.headerContainer.getScroll().scrollLeft = 500;
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                UIInteractions.simulateClickAndSelectEvent(firstCell);
                fix.detectChanges();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
                expect(secondCell.componentInstance.active).toBeTruthy();

                GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');
                expect(thirdCell.componentInstance.active).toBeTruthy();
            });
        });

        describe('Row Edit', () => {
            it('tab navigation should should skip non-editable cells when navigating in row edit mode. ', async () => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px', editable: true },
                            { field: 'ContactName', rowStart: 2, colStart: 1, editable: false },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2, editable: true },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3, editable: true }
                        ]
                    },
                    {
                        group: 'group2',
                        columns: [
                            { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px', editable: true },
                            { field: 'Region', rowStart: 3, colStart: 1, editable: true },
                            { field: 'PostalCode', rowStart: 3, colStart: 2, editable: true }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px', editable: true },
                            { field: 'Fax', rowStart: 2, colStart: 1, editable: true },
                            { field: 'ID', rowStart: 3, colStart: 1, editable: true }
                        ]
                    }
                ];
                fix.detectChanges();

                const grid = fix.componentInstance.grid;
                grid.primaryKey = 'ID';
                grid.rowEditable = true;
                fix.detectChanges();

                let cell = grid.getCellByColumn(0, 'CompanyName');
                UIInteractions.simulateDoubleClickAndSelectEvent(grid.gridAPI.get_cell_by_index(0, 'CompanyName'));
                fix.detectChanges();

                const order = ['CompanyName', 'City', 'Phone', 'ContactTitle'];
                // tab through cols and check order is correct - ContactName should be skipped.
                for (let i = 1; i < order.length; i++) {
                    GridFunctions.simulateGridContentKeydown(fix, 'Tab');
                    await wait(DEBOUNCETIME);
                    fix.detectChanges();

                    cell = grid.getCellByColumn(0, order[i]);
                    expect(cell.editMode).toBe(true);
                }

                // shift+tab through  cols and check order is correct - ContactName should be skipped.
                for (let j = order.length - 2; j >= 0; j--) {
                    GridFunctions.simulateGridContentKeydown(fix, 'Tab', false, true);
                    await wait(DEBOUNCETIME);
                    fix.detectChanges();

                    cell = grid.getCellByColumn(0, order[j]);
                    expect(cell.editMode).toBe(true);
                }
            });
        });
    });
});

describe('IgxGrid Multi Row Layout - navigateTo #grid', () => {
    let fix: ComponentFixture<ColumnLayoutTestComponent>;

    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                ColumnLayoutTestComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule]
        });
    }));

    beforeEach(fakeAsync(() => {
        fix = TestBed.createComponent(ColumnLayoutTestComponent);
    }));

    it('navigateTo method should work in multi-row layout grid.', async () => {
        fix.componentInstance.colGroups = [
            {
                group: 'group1',
                columns: [
                    { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, editable: true },
                    { field: 'ContactName', rowStart: 2, colStart: 1, editable: false, width: '100px' },
                    { field: 'ContactTitle', rowStart: 2, colStart: 2, editable: true, width: '100px' },
                    { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3, editable: true, width: '100px' }
                ]
            },
            {
                group: 'group2',
                columns: [
                    { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px', editable: true },
                    { field: 'Region', rowStart: 3, colStart: 1, editable: true },
                    { field: 'PostalCode', rowStart: 3, colStart: 2, editable: true }
                ]
            },
            {
                group: 'group3',
                columns: [
                    { field: 'Phone', rowStart: 1, colStart: 1, width: '200px', editable: true },
                    { field: 'Fax', rowStart: 2, colStart: 1, editable: true, width: '200px' },
                    { field: 'ID', rowStart: 3, colStart: 1, editable: true, width: '200px' }
                ]
            }
        ];
        await wait(DEBOUNCETIME);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        grid.width = '500px';
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // navigate down to cell in a row that is in the DOM but is not in view (half-visible row)
        let col = grid.getColumnByName('ContactTitle');
        grid.navigateTo(2, col.visibleIndex);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // cell should be at bottom of grid
        let cell = grid.gridAPI.get_cell_by_index(2, 'ContactTitle');
        expect(grid.verticalScrollContainer.getScroll().scrollTop).toBeGreaterThan(50);
        let diff = cell.nativeElement.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom;
        // there is 2px border at the bottom now
        expect(diff).toBe(0);

        // navigate up to cell in a row that is in the DOM but is not in view (half-visible row)
        col = grid.getColumnByName('CompanyName');
        grid.navigateTo(0, col.visibleIndex);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // cell should be at top of grid
        cell = grid.gridAPI.get_cell_by_index(0, 'CompanyName');
        expect(grid.verticalScrollContainer.getScroll().scrollTop).toBe(0);
        diff = cell.nativeElement.getBoundingClientRect().top - grid.tbody.nativeElement.getBoundingClientRect().top;
        expect(diff).toBe(0);
    });

    it('navigateTo method should work in multi-row layout grid when scrolling to bottom.', async () => {
        fix.componentInstance.colGroups = [
            {
                group: 'group1',
                columns: [
                    { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, editable: true },
                    { field: 'ContactName', rowStart: 2, colStart: 1, editable: false, width: '100px' },
                    { field: 'ContactTitle', rowStart: 2, colStart: 2, editable: true, width: '100px' },
                    { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3, editable: true, width: '100px' }
                ]
            },
            {
                group: 'group2',
                columns: [
                    { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px', editable: true },
                    { field: 'Region', rowStart: 3, colStart: 1, editable: true },
                    { field: 'PostalCode', rowStart: 3, colStart: 2, editable: true }
                ]
            },
            {
                group: 'group3',
                columns: [
                    { field: 'Phone', rowStart: 1, colStart: 1, width: '200px', editable: true },
                    { field: 'Fax', rowStart: 2, colStart: 1, editable: true, width: '200px' },
                    { field: 'ID', rowStart: 3, colStart: 1, editable: true, width: '200px' }
                ]
            }
        ];
        await wait(DEBOUNCETIME);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        grid.width = '500px';
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // navigate to cell in a row is not in the DOM
        let col = grid.getColumnByName('CompanyName');
        grid.navigateTo(10, col.visibleIndex);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // cell should be at bottom of grid
        let cell = grid.gridAPI.get_cell_by_index(10, 'CompanyName');
        expect(grid.verticalScrollContainer.getScroll().scrollTop).toBeGreaterThan(50 * 10);
        let diff = cell.nativeElement.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom;
        // there is 2px border at the bottom now
        expect(diff).toBe(0);

        // navigate right to cell in column that is in DOM but is not in view
        col = grid.getColumnByName('City');
        grid.navigateTo(10, col.visibleIndex);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // cell should be at right edge of grid
        cell = grid.gridAPI.get_cell_by_index(10, 'City');
        expect(grid.headerContainer.getScroll().scrollLeft).toBeGreaterThan(100);
        // check if cell right edge is visible
        diff = cell.nativeElement.getBoundingClientRect().right - grid.tbody.nativeElement.getBoundingClientRect().right;
        await wait();
        expect(diff).toBe(0);

        // navigate left to cell in column that is in DOM but is not in view
        col = grid.getColumnByName('CompanyName');
        grid.navigateTo(10, col.visibleIndex);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // cell should be at left edge of grid
        cell = grid.gridAPI.get_cell_by_index(10, 'CompanyName');
        expect(grid.headerContainer.getScroll().scrollLeft).toBe(0);
        // check if cell right left is visible
        diff = cell.nativeElement.getBoundingClientRect().left - grid.tbody.nativeElement.getBoundingClientRect().left;
        expect(diff).toBe(0);

        // navigate to cell in column that is not in DOM

        col = grid.getColumnByName('ID');
        grid.navigateTo(9, col.visibleIndex);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // cell should be at right edge of grid
        cell = grid.gridAPI.get_cell_by_index(9, 'ID');
        expect(grid.headerContainer.getScroll().scrollLeft).toBeGreaterThan(250);
        // check if cell right right is visible
        diff = cell.nativeElement.getBoundingClientRect().right - grid.tbody.nativeElement.getBoundingClientRect().right;
        expect(diff).toBe(0);
    });
});

@Component({
    template: `
    <igx-grid #grid [data]="data" [height]="'500px'" (selected)="cellSelected($event)">
        <igx-column-layout *ngFor='let group of colGroups' [hidden]='group.hidden' [pinned]='group.pinned' [field]='group.group'>
            <igx-column *ngFor='let col of group.columns'
            [rowStart]="col.rowStart" [colStart]="col.colStart" [width]='col.width'
            [colEnd]="col.colEnd" [rowEnd]="col.rowEnd" [field]='col.field' [editable]='col.editable'></igx-column>
        </igx-column-layout>
    </igx-grid>
    `
})
export class ColumnLayoutTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;
    public selectedCell: CellType;
    public cols: Array<any> = [
        { field: 'ID', rowStart: 1, colStart: 1 },
        { field: 'CompanyName', rowStart: 1, colStart: 2 },
        { field: 'ContactName', rowStart: 1, colStart: 3 },
        { field: 'ContactTitle', rowStart: 2, colStart: 1, rowEnd: 4, colEnd: 4 },
    ];
    public colGroups: Array<any> = [
        {
            group: 'group1',
            columns: this.cols
        }
    ];
    public data = SampleTestData.contactInfoDataFull();

    public cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }
}
