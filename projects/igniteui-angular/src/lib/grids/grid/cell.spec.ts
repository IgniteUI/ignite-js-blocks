import { Component, ViewChild, OnInit, NgZone, DebugElement } from '@angular/core';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxColumnComponent, IgxGridComponent, IgxGridModule, IGridCellEventArgs } from './public_api';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { HammerGesturesManager } from '../../core/touch';
import { PlatformUtil } from '../../core/utils';
import { VirtualGridComponent, NoScrollsComponent, NoColumnWidthGridComponent } from '../../test-utils/grid-samples.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { TestNgZone } from '../../test-utils/helper-utils.spec';
import { CellType } from '../tree-grid/public_api';
import { IgxGridCellComponent } from '../cell.component';

describe('IgxGrid - Cell component #grid', () => {

    describe('Test events', () => {
        let fix;
        let grid: IgxGridComponent;
        let cellElem: DebugElement;
        let firstCell: CellType;
        let firstCellElem: IgxGridCellComponent;

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
            cellElem = GridFunctions.getRowCells(fix, 0)[0];
            firstCell = grid.getCellByColumn(0, 'ID');
            firstCellElem = grid.gridAPI.get_cell_by_index(0, 'ID');
        }));

        it('@Input properties and getters', () => {
            expect(firstCell.column.index).toEqual(grid.columnList.first.index);
            expect(firstCell.row.index).toEqual(grid.rowList.first.index);
            expect(firstCell.grid).toBe(grid);
            expect(firstCellElem.nativeElement).toBeDefined();
            expect(firstCellElem.nativeElement.textContent).toMatch('1');
            expect(firstCellElem.readonly).toBe(true);
        });

        it('selection and selection events', () => {
            expect(cellElem.nativeElement.getAttribute('aria-selected')).toMatch('false');

            spyOn(grid.selected, 'emit').and.callThrough();
            UIInteractions.simulateClickAndSelectEvent(cellElem);
            const args: IGridCellEventArgs = {
                cell: grid.getCellByColumn(0, 'ID'),
                event: jasmine.anything() as any
            };
            fix.detectChanges();

            expect(grid.selected.emit).toHaveBeenCalledWith(args);
            expect(firstCell.selected).toBe(true);
            expect(cellElem.nativeElement.getAttribute('aria-selected')).toMatch('true');
        });

        it('Should not emit selection event for already selected cell', () => {
            grid.getColumnByName('ID').editable = true;
            fix.detectChanges();

            spyOn(grid.selected, 'emit').and.callThrough();

            UIInteractions.simulateClickAndSelectEvent(cellElem);
            fix.detectChanges();

            expect(grid.selected.emit).toHaveBeenCalledTimes(1);

            const gridContent = GridFunctions.getGridContent(fix);
            UIInteractions.triggerEventHandlerKeyDown('Enter', gridContent);
            fix.detectChanges();
            UIInteractions.triggerEventHandlerKeyDown('Escape', gridContent);
            fix.detectChanges();

            expect(grid.selected.emit).toHaveBeenCalledTimes(1);
        });

        it('Should trigger onCellClick event when click into cell', () => {
            spyOn(grid.cellClick, 'emit').and.callThrough();
            const event = new Event('click');
            firstCellElem.nativeElement.dispatchEvent(event);
            const args: IGridCellEventArgs = {
                cell: grid.getCellByColumn(0, 'ID'),
                event
            };

            fix.detectChanges();
            expect(grid.cellClick.emit).toHaveBeenCalledTimes(1);
            expect(grid.cellClick.emit).toHaveBeenCalledWith(args);
        });

        it('Should trigger doubleClick event', () => {
            grid.columns[0].editable = true;
            fix.detectChanges();
            spyOn(grid.doubleClick, 'emit').and.callThrough();

            cellElem.triggerEventHandler('dblclick', new Event('dblclick'));
            fix.detectChanges();
            expect(grid.doubleClick.emit).toHaveBeenCalledTimes(1);

            cellElem.triggerEventHandler('dblclick', new Event('dblclick'));
            fix.detectChanges();
            expect(grid.doubleClick.emit).toHaveBeenCalledTimes(2);
        });

        it('Should trigger contextMenu event when right click into cell', () => {
            spyOn(grid.contextMenu, 'emit').and.callThrough();
            const event = new Event('contextmenu');
            cellElem.nativeElement.dispatchEvent(event);
            const args: IGridCellEventArgs = {
                cell: grid.getCellByColumn(0, 'ID'),
                event
            };

            fix.detectChanges();
            expect(grid.contextMenu.emit).toHaveBeenCalledTimes(1);
            expect(grid.contextMenu.emit).toHaveBeenCalledWith(args);
        });

        it('Should trigger doubleClick event when double click into cell', () => {
            spyOn(grid.doubleClick, 'emit').and.callThrough();
            const event = new Event('dblclick');
            spyOn(event, 'preventDefault');
            cellElem.nativeElement.dispatchEvent(event);
            const args: IGridCellEventArgs = {
                cell: grid.getCellByColumn(0, 'ID'),
                event
            };

            fix.detectChanges();

            expect(event.preventDefault).not.toHaveBeenCalled();
            expect(grid.doubleClick.emit).toHaveBeenCalledWith(args);
        });
    });

    describe('Cells in virtualized grid ', () => {
        let zone;
        let fix;
        let grid: IgxGridComponent;

        configureTestSuite((() => {
            TestBed.configureTestingModule({
                declarations: [
                    VirtualGridComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule],
                providers: [{ provide: NgZone, useFactory: () => zone = new TestNgZone() }]
            });
        }));

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(VirtualGridComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('should fit last cell in the available display container when there is vertical scroll.', () => {
            const rows = grid.rowList;
            rows.forEach((item) => {
                expect(item.cells.last.width).toEqual('200px');
            });
        });

        it('should use default column width for cells with width in %.', () => {
            fix.componentInstance.defaultWidth = '25%';
            fix.detectChanges();
            const rows = grid.rowList;
            rows.forEach((item) => {
                expect(item.cells.last.width).toEqual('25%');
            });
        });

        it('should fit last cell in the available display container when there is vertical and horizontal scroll.', (async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(100);
            fix.componentInstance.data = fix.componentInstance.generateData(1000);
            await wait();
            fix.detectChanges();

            const firsCell = GridFunctions.getRowCells(fix, 1)[0];
            expect(GridFunctions.getValueFromCellElement(firsCell)).toEqual('0');

            fix.componentInstance.scrollLeft(999999);
            await wait();
            // This won't work always in debugging mode due to the angular native events behavior, so errors are expected
            fix.detectChanges();
            const cells = GridFunctions.getRowCells(fix, 1);
            const lastCell = cells[cells.length - 1];
            expect(GridFunctions.getValueFromCellElement(lastCell)).toEqual('990');

            // Calculate where the end of the cell is. Relative left position should equal the grid calculated width
            expect(lastCell.nativeElement.getBoundingClientRect().left +
                lastCell.nativeElement.offsetWidth +
                grid.scrollSize).toEqual(parseInt(grid.width, 10));
        }));

        it('should not reduce the width of last pinned cell when there is vertical scroll.', () => {
            const columns = grid.columnList;
            const lastCol: IgxColumnComponent = columns.last;
            lastCol.pinned = true;
            fix.detectChanges();
            lastCol.cells.forEach((cell) => {
                expect(cell.width).toEqual('200px');
            });
            const rows = fix.componentInstance.grid.rowList;
            rows.forEach((item) => {
                expect(item.cells.last.width).toEqual('200px');
            });
        });

        it('should not make last column smaller when vertical scrollbar is on the right of last cell', () => {
                fix.componentInstance.columns = fix.componentInstance.generateCols(4, '30px');
                fix.componentInstance.data = fix.componentInstance.generateData(10);
                fix.detectChanges();

                const lastColumnCells = grid.columns[grid.columns.length - 1].cells;
                lastColumnCells.forEach((item) => {
                    expect(item.width).toEqual('30px');
                });
            });

        it('should not make last column smaller when vertical scrollbar is on the left of last cell', async () => {
            fix.componentInstance.columns = fix.componentInstance.generateCols(4, '500px');
            fix.componentInstance.data = fix.componentInstance.generateData(10);
            fix.detectChanges();

            const scrollbar = grid.headerContainer.getScroll();
            scrollbar.scrollLeft = 10000;
            fix.detectChanges();
            await wait();
            const lastColumnCells = grid.columns[grid.columns.length - 1].cells;
            fix.detectChanges();
            lastColumnCells.forEach((item) => {
                expect(item.width).toEqual('500px');
            });
        });

        it('Should not clear selected cell when scrolling with mouse wheel', (async () => {
            const cell = grid.gridAPI.get_cell_by_index(3, 'value');
            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            const displayContainer = grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement;
            await UIInteractions.simulateWheelEvent(displayContainer, 0, 200);
            fix.detectChanges();
            await wait(16);

            const gridContent = GridFunctions.getGridContent(fix);
            UIInteractions.triggerEventHandlerKeyDown('arrowup', gridContent);
            fix.detectChanges();
            await wait(30);

            expect(grid.getCellByColumn(2, 'value').selected).toBeTruthy();
        }));
    });

    describe('iOS tests', () => {
        configureTestSuite((() => {
            TestBed.configureTestingModule({
                declarations: [
                    NoScrollsComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule],
            });
        }));

        it('Should not attach doubletap handler for non-iOS', fakeAsync(/** height/width setter rAF */() => {
            const addListenerSpy = spyOn(HammerGesturesManager.prototype, 'addEventListener');
            const platformUtil: PlatformUtil = TestBed.inject(PlatformUtil);
            const oldIsIOS = platformUtil.isIOS;
            platformUtil.isIOS = false;
            const fix = TestBed.createComponent(NoScrollsComponent);
            fix.detectChanges();
            // spyOnProperty(PlatformUtil.prototype, 'isIOS').and.returnValue(false);
            expect(addListenerSpy).not.toHaveBeenCalled();

            platformUtil.isIOS = oldIsIOS;
        }));

        it('Should handle doubletap on iOS, trigger doubleClick event', fakeAsync(/** height/width setter rAF */() => {
            const addListenerSpy = spyOn(HammerGesturesManager.prototype, 'addEventListener');
            const platformUtil: PlatformUtil = TestBed.inject(PlatformUtil);
            const oldIsIOS = platformUtil.isIOS;
            platformUtil.isIOS = true;
            const fix = TestBed.createComponent(NoScrollsComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const firstCellElem = grid.gridAPI.get_cell_by_index(0, 'ID');

            // should attach 'doubletap'
            expect(addListenerSpy.calls.count()).toBeGreaterThan(1);
            expect(addListenerSpy).toHaveBeenCalledWith(firstCellElem.nativeElement, 'doubletap', firstCellElem.onDoubleClick,
                { cssProps: {} as any });

            spyOn(grid.doubleClick, 'emit').and.callThrough();

            const event = {
                type: 'doubletap',
                preventDefault: jasmine.createSpy('preventDefault')
            };
            firstCellElem.onDoubleClick(event as any);
            const args: IGridCellEventArgs = {
                cell: grid.getCellByColumn(0, 'ID'),
                event
            } as any;

            fix.detectChanges();
            expect(event.preventDefault).toHaveBeenCalled();
            expect(grid.doubleClick.emit).toHaveBeenCalledWith(args);

            platformUtil.isIOS = oldIsIOS;
        }));
    });

    describe('No column widths', () => {
        configureTestSuite((() => {
            TestBed.configureTestingModule({
                declarations: [
                    NoColumnWidthGridComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule]
            });
        }));

        it('should not make last column width 0 when no column width is set', fakeAsync(/** height/width setter rAF */() => {
            const fix = TestBed.createComponent(NoColumnWidthGridComponent);
            fix.detectChanges();
            const columns = fix.componentInstance.grid.columnList;
            const lastCol: IgxColumnComponent = columns.last;
            lastCol._cells.forEach((cell) => {
                expect(cell.nativeElement.clientWidth).toBeGreaterThan(100);
            });
        }));
    });

    describe('Cells styles', () => {
        configureTestSuite((() => {
            TestBed.configureTestingModule({
                declarations: [
                    ConditionalCellStyleTestComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule]
            });
        }));

        it('should be able to conditionally style cells', fakeAsync(() => {
            const fixture = TestBed.createComponent(ConditionalCellStyleTestComponent);
            fixture.detectChanges();

            const grid = fixture.componentInstance.grid;

            grid.getColumnByName('UnitsInStock')._cells.forEach((cell) => {
                expect(cell.nativeElement.classList).toContain('test1');
            });

            const indexColCells = grid.getColumnByName('ProductID')._cells;

            expect(indexColCells[3].nativeElement.classList).not.toContain('test');
            expect(indexColCells[4].nativeElement.classList).toContain('test2');
            expect(indexColCells[5].nativeElement.classList).toContain('test');
            expect(indexColCells[6].nativeElement.classList).toContain('test');

            expect(grid.getColumnByName('ProductName')._cells[4].nativeElement.classList).toContain('test2');
            expect(grid.getColumnByName('InStock')._cells[4].nativeElement.classList).toContain('test2');
            expect(grid.getColumnByName('OrderDate')._cells[4].nativeElement.classList).toContain('test2');
        }));
    });
});
@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" [width]="'900px'" [height]="'500px'" rowSelection = "multiple">
        <igx-column *ngFor="let c of columns" [field]="c.field"
                                              [header]="c.field"
                                              [width]="c.width"
                                              [movable]="true"
                                              [groupable]="true"
                                              [resizable]="true"
                                              [sortable]="true"
                                              [filterable]="true"
                                              [editable]="true"
                                              [cellClasses]="c.cellClasses">
        </igx-column>
    </igx-grid>`,
    styleUrls: ['../../test-utils/grid-cell-style-testing.scss'],
})
export class ConditionalCellStyleTestComponent implements OnInit {
    @ViewChild('grid', { static: true }) public grid: IgxGridComponent;

    public data: Array<any>;
    public columns: Array<any>;

    public cellClasses;
    public cellClasses1;

    public callback = (rowData: any, columnKey: any) => rowData[columnKey] >= 5;

    public callback1 = (rowData: any) => rowData[this.grid.primaryKey] === 5;

    public ngOnInit(): void {
        this.cellClasses = {
            test: this.callback,
            test2: this.callback1
        };

        this.cellClasses1 = {
            test2: this.callback1
        };

        this.columns = [
            { field: 'ProductID', width: 100, cellClasses: this.cellClasses },
            { field: 'ProductName', width: 200, cellClasses: this.cellClasses1 },
            { field: 'InStock', width: 150, cellClasses: this.cellClasses1 },
            { field: 'UnitsInStock', width: 150, cellClasses: { test1: true } },
            { field: 'OrderDate', width: 150, cellClasses: this.cellClasses1 }
        ];
        this.data = SampleTestData.foodProductDataExtended();
    }
}
