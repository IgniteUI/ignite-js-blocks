import { Component, DebugElement, OnInit, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, tick, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxAvatarModule } from '../../avatar/avatar.component';
import { Calendar } from '../../calendar/public_api';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule, IColumnResizeEventArgs } from './public_api';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { GridTemplateStrings, ColumnDefinitions } from '../../test-utils/template-strings.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { MultiColumnHeadersComponent } from '../../test-utils/grid-samples.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { GridFunctions } from '../../test-utils/grid-functions.spec';

describe('IgxGrid - Deferred Column Resizing #grid', () => {

    const COLUMN_HEADER_GROUP_CLASS = '.igx-grid-thead__item';

    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                ResizableColumnsComponent,
                GridFeaturesComponent,
                LargePinnedColGridComponent,
                NullColumnsComponent,
                MultiColumnHeadersComponent,
                ColGridComponent,
                ColPercentageGridComponent
            ],
            imports: [
                IgxAvatarModule,
                NoopAnimationsModule,
                IgxGridModule
            ]
        });
    }));

    describe('Base tests: ', () => {
        let fixture: ComponentFixture<any>;
        let grid: IgxGridComponent;
        let headers: DebugElement[];
        let headerResArea: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ResizableColumnsComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            headers = GridFunctions.getColumnHeaders(fixture);
            headerResArea = GridFunctions.getHeaderResizeArea(headers[0]).nativeElement;
        }));

        it('should define grid with resizable columns.', fakeAsync(() => {

            expect(grid.columns[0].width).toEqual('100px');
            expect(grid.columns[0].resizable).toBeTruthy();
            expect(grid.columns[2].resizable).toBeFalsy();
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 15);
            tick(200);
            fixture.detectChanges();

            let resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 250, 15);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 250, 15);
            fixture.detectChanges();

            expect(grid.columns[0].width).toEqual('250px');

            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 250, 0);
            tick(200);
            fixture.detectChanges();
            resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 40, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 40, 5);
            fixture.detectChanges();

            expect(grid.columns[0].width).toEqual('80px');

            expect(grid.columns[2].cells[0].value).toEqual('Brown');

            GridFunctions.clickHeaderSortIcon(headers[2]);
            GridFunctions.clickHeaderSortIcon(headers[2]);
            fixture.detectChanges();

            expect(grid.columns[2].cells[0].value).toEqual('Wilson');
        }));

        it('should resize column outside grid view.', fakeAsync(() => {
            expect(grid.columns[0].width).toEqual('100px');
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
            tick(200);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 700, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 700, 5);
            fixture.detectChanges();

            expect(grid.columns[0].width).toEqual('700px');
        }));

        it('should resize column with preset min and max widths.', fakeAsync(() => {
            expect(grid.columns[1].width).toEqual('100px');
            expect(grid.columns[1].minWidth).toEqual('70px');
            expect(grid.columns[1].maxWidth).toEqual('250px');
            expect(grid.columns[1].resizable).toBeTruthy();
            headerResArea = GridFunctions.getHeaderResizeArea(headers[1]).nativeElement;

            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 200, 0);
            tick(200);
            fixture.detectChanges();

            let resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 370, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 370, 5);
            fixture.detectChanges();

            expect(grid.columns[1].width).toEqual('250px');

            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 350, 0);
            tick(200);
            fixture.detectChanges();

            resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 100, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 100, 5);
            fixture.detectChanges();

            expect(grid.columns[1].width).toEqual('70px');
        }));

        it('should be able to resize column to the minWidth < defaultMinWidth', fakeAsync(() => {
            const column = grid.getColumnByName('ID');
            column.minWidth = 'a';
            fixture.detectChanges();

            expect(column.resizable).toBe(true);
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
            tick(200);
            fixture.detectChanges();

            let resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 10, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 10, 5);
            fixture.detectChanges();

            expect(column.width).toEqual('80px');
            column.minWidth = '50';
            fixture.detectChanges();

            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 80, 0);
            tick(200);
            fixture.detectChanges();

            resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 10, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 10, 5);
            fixture.detectChanges();

            expect(column.width).toEqual('50px');
        }));

        it('should change the defaultMinWidth on density change', fakeAsync(() => {
            const column = grid.getColumnByName('ID');

            expect(column.defaultMinWidth).toBe('80');
            expect(column.resizable).toBe(true);
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
            tick(200);
            fixture.detectChanges();

            let resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 10, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 10, 5);
            fixture.detectChanges();

            expect(column.width).toEqual('80px');
            grid.displayDensity = 'cosy';
            tick(200);
            fixture.detectChanges();

            expect(column.defaultMinWidth).toBe('64');
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 80, 0);
            tick(200);
            fixture.detectChanges();

            resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 10, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 10, 5);
            fixture.detectChanges();

            expect(column.width).toEqual('64px');
            grid.displayDensity = 'compact';
            tick(200);
            fixture.detectChanges();

            expect(column.defaultMinWidth).toBe('56');
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 64, 0);
            tick(200);
            fixture.detectChanges();

            resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 10, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 10, 5);
            fixture.detectChanges();

            expect(column.width).toEqual('56px');
        }));

        it('should update grid after resizing a column to be bigger.', fakeAsync(() => {
            const displayContainer: HTMLElement = GridFunctions.getGridDisplayContainer(fixture).nativeElement;
            let rowsRendered = displayContainer.querySelectorAll('igx-display-container');
            let colsRendered = rowsRendered[0].children;

            expect(grid.columns[0].width).toEqual('100px');
            expect(colsRendered.length).toEqual(4);

            // Resize first column
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
            tick(200);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 700, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 700, 5);
            fixture.detectChanges();

            expect(grid.columns[0].width).toEqual('700px');

            // Check grid has updated cells and scrollbar
            const hScroll = fixture.componentInstance.grid.headerContainer.getScroll();
            const hScrollVisible = hScroll.offsetWidth < hScroll.children[0].offsetWidth;
            rowsRendered = displayContainer.querySelectorAll('igx-display-container');
            colsRendered = rowsRendered[0].children;

            expect(hScrollVisible).toBe(true);
            expect(colsRendered.length).toEqual(4);
        }));

        it('should recalculate grid heights after resizing so the horizontal scrollbar appears.', fakeAsync(() => {
            let expectedHeight = grid.nativeElement.offsetHeight
                - grid.theadRow.nativeElement.offsetHeight
                - grid.tfoot.nativeElement.offsetHeight
                - (grid.isHorizontalScrollHidden ? 0 : grid.scrollSize);

            expect(grid.calcHeight).toEqual(expectedHeight);
            expect(grid.columns[0].width).toEqual('100px');

            // Resize first column
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
            tick(200);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 250, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 250, 5);
            fixture.detectChanges();

            expect(grid.columns[0].width).toEqual('250px');

            // Check grid has updated cells and scrollbar
            const hScroll = fixture.componentInstance.grid.headerContainer.getScroll();
            const hScrollVisible = hScroll.offsetWidth < hScroll.children[0].offsetWidth;

            expectedHeight = grid.nativeElement.offsetHeight
                - grid.theadRow.nativeElement.offsetHeight
                - grid.tfoot.nativeElement.offsetHeight
                - (grid.isHorizontalScrollHidden ? 0 : grid.scrollSize);

            expect(grid.calcHeight).toEqual(expectedHeight);
            expect(hScrollVisible).toBe(true);
        }));

        it('should resize pinned column with preset max width.', fakeAsync(() => {
            grid.pinColumn('ID');
            grid.pinColumn('Name');
            grid.getColumnByName('LastName').resizable = true;
            grid.pinColumn('LastName');
            fixture.detectChanges();

            expect(grid.columns[1].width).toEqual('100px');
            headers = GridFunctions.getColumnHeaders(fixture);
            headerResArea = GridFunctions.getHeaderResizeArea(headers[1]).nativeElement;
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 200, 0);
            tick(200);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 350, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 350, 5);
            fixture.detectChanges();

            expect(grid.columns[1].width).toEqual('250px');
        }));

        it('should resize pinned columns.', fakeAsync(() => {
            grid.pinColumn('ID');
            grid.pinColumn('Name');
            grid.getColumnByName('LastName').resizable = true;
            fixture.detectChanges();

            headers = GridFunctions.getColumnHeaders(fixture);
            headerResArea = GridFunctions.getHeaderResizeArea(headers[0]).nativeElement;
            expect(grid.columns[0].width).toEqual('100px');
            expect(grid.columns[1].width).toEqual('100px');

            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
            tick(200);
            fixture.detectChanges();

            let resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 450, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 450, 5);
            fixture.detectChanges();

            expect(grid.columns[0].width).toEqual('450px');
            expect(grid.columns[1].width).toEqual('100px');

            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 300, 0);
            tick(200);
            fixture.detectChanges();

            resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 100, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 100, 5);
            fixture.detectChanges();

            expect(grid.columns[0].width).toEqual('250px');
        }));
    });

    describe('Autoresize tests: ', () => {
        let fixture: ComponentFixture<any>;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(LargePinnedColGridComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        }));

        it('should autoresize column with preset max width.', fakeAsync(() => {
            const headers = GridFunctions.getColumnHeaders(fixture);
            const resizeArea = GridFunctions.getHeaderResizeArea(headers[4]).nativeElement;

            expect(grid.columns[4]._cells[0].nativeElement.getBoundingClientRect().width).toEqual(50);
            expect(grid.columns[4].maxWidth).toEqual('100px');

            UIInteractions.simulateMouseEvent('dblclick', resizeArea, 0, 0);
            tick(200);
            fixture.detectChanges();

            expect(grid.columns[4].width).toEqual('100px');
        }));

        it('should autoresize pinned column on double click.', fakeAsync(() => {
            const headers = GridFunctions.getColumnHeaders(fixture);
            const resizeArea = GridFunctions.getHeaderResizeArea(headers[2]).nativeElement;

            expect(grid.columns[2].width).toEqual('100px');

            UIInteractions.simulateMouseEvent('dblclick', resizeArea, 0, 0);
            tick(200);
            fixture.detectChanges();

            expect(grid.columns[2].width).toEqual('92px');
        }));

        it('should autosize column programmatically.', fakeAsync(/** height/width setter rAF */() => {
            const column = grid.getColumnByName('ID');
            column.minWidth = '30px';
            expect(column.width).toEqual('100px');

            column.autosize();
            fixture.detectChanges();

            expect(column.width).toEqual('67px');
        }));

        it('should autosize column programmatically based only on header.', fakeAsync(() => {
            const column = fixture.componentInstance.grid.columnList.filter(c => c.field === 'ReleaseDate')[0];
            expect(column.width).toEqual('100px');

            column.autosize(true);
            fixture.detectChanges();

            expect(column.width).toEqual('112px');
        }));

        it('should autosize pinned column programmatically.', fakeAsync(/** height/width setter rAF */() => {
            const column = grid.getColumnByName('Released');
            expect(column.width).toEqual('100px');

            column.autosize();
            fixture.detectChanges();

            expect(column.width).toEqual('95px');
        }));

        it('should autosize last pinned column programmatically.', fakeAsync(/** height/width setter rAF */() => {
            const column = grid.getColumnByName('Items');
            expect(column.width).toEqual('100px');

            column.autosize();
            fixture.detectChanges();

            expect(column.width).toEqual('92px');
        }));

        it('should autosize column when minWidth is set.', fakeAsync(/** height/width setter rAF */() => {
            const column = grid.getColumnByName('ID');
            column.minWidth = '70px';
            expect(column.minWidth).toEqual('70px');
            expect(column.width).toEqual('100px');

            column.autosize();
            fixture.detectChanges();

            expect(column.width).toEqual('70px');
        }));
    });

    describe('Percentage tests: ', () => {
        let fixture: ComponentFixture<any>;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ColPercentageGridComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        }));

        it('should resize columns with % width.', fakeAsync(() => {
            grid.height = null;
            fixture.detectChanges();
            const headers = GridFunctions.getColumnHeaders(fixture);
            expect(grid.columns[0].width).toBe('25%');

            const headerResArea = headers[0].parent.children[2].nativeElement;
            const startPos = headerResArea.getBoundingClientRect().x;
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, startPos, 5);
            tick(200);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            // resize with 100px, which is 25%
            UIInteractions.simulateMouseEvent('mousemove', resizer, startPos + 100, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, startPos + 100, 5);
            fixture.detectChanges();
            expect(grid.columns[0].width).toBe('50%');
        }));

        it('should resize columns with % width and % maxWidth.', fakeAsync(() => {
            grid.height = null;
            fixture.detectChanges();
            const headers = GridFunctions.getColumnHeaders(fixture);
            grid.columns[0].maxWidth = '30%';
            expect(grid.columns[0].width).toBe('25%');

            const headerResArea = headers[0].parent.children[2].nativeElement;
            const startPos = headerResArea.getBoundingClientRect().x;
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, startPos, 5);
            tick(200);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            // resize with +100px, which is 25%
            UIInteractions.simulateMouseEvent('mousemove', resizer, startPos + 100, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, startPos + 100, 5);
            fixture.detectChanges();

            expect(grid.columns[0].width).toBe(grid.columns[0].maxWidth);
        }));

        it('should resize columns with % width and % minWidth.', fakeAsync(() => {
            grid.height = null;
            fixture.detectChanges();
            const headers = GridFunctions.getColumnHeaders(fixture);
            grid.columns[0].minWidth = '10%';
            expect(grid.columns[0].width).toBe('25%');

            const headerResArea = headers[0].parent.children[2].nativeElement;
            const startPos = headerResArea.getBoundingClientRect().x;
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, startPos, 5);
            tick(200);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            // resize with -100px
            UIInteractions.simulateMouseEvent('mousemove', resizer, startPos - 100, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, startPos - 100, 5);
            fixture.detectChanges();

            expect(grid.columns[0].width).toBe(grid.columns[0].minWidth);
        }));

        it('should resize columns with % width and pixel maxWidth.', fakeAsync(() => {
            grid.height = null;
            fixture.detectChanges();
            const headers = GridFunctions.getColumnHeaders(fixture);
            grid.columns[0].maxWidth = '200px';
            expect(grid.columns[0].width).toBe('25%');

            const headerResArea = headers[0].parent.children[2].nativeElement;
            const startPos = headerResArea.getBoundingClientRect().x;
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, startPos, 5);
            tick(200);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            // resize with +200px, which is 50%
            UIInteractions.simulateMouseEvent('mousemove', resizer, startPos + 200, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, startPos + 200, 5);
            fixture.detectChanges();
            expect(grid.columns[0].width).toBe('50%');
        }));

        it('should resize columns with % width and pixel minWidth.', fakeAsync(() => {
            grid.height = null;
            fixture.detectChanges();
            const headers = GridFunctions.getColumnHeaders(fixture);
            // minWidth is 12.5% of the grid width - 400px
            grid.columns[0].minWidth = '50px';
            expect(grid.columns[0].width).toBe('25%');

            const headerResArea = headers[0].parent.children[2].nativeElement;
            const startPos = headerResArea.getBoundingClientRect().x;
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, startPos, 5);
            tick(200);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            // resize with -100px
            UIInteractions.simulateMouseEvent('mousemove', resizer, startPos - 100, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, startPos - 100, 5);
            fixture.detectChanges();

            expect(grid.columns[0].width).toBe('12.5%');
        }));

        it('should autosize column with % width programmatically.', fakeAsync(() => {
            grid.height = null;
            fixture.detectChanges();
            expect(grid.columns[0].width).toBe('25%');
            grid.columns[0].autosize();
            fixture.detectChanges();
            expect(grid.columns[0].width).toBe('30%');
        }));

        it('should autosize column with % width on double click.', fakeAsync(() => {
            grid.height = null;
            fixture.detectChanges();
            expect(grid.columns[0].width).toBe('25%');
            const headers = GridFunctions.getColumnHeaders(fixture);
            const headerResArea = headers[0].parent.children[2].nativeElement;
            UIInteractions.simulateMouseEvent('dblclick', headerResArea, 0, 0);
            tick(200);
            fixture.detectChanges();
            expect(grid.columns[0].width).toBe('30%');
        }));
    });

    describe('Integration tests: ', () => {
        let fixture: ComponentFixture<any>;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(GridFeaturesComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        }));

        it('should resize sortable columns.', fakeAsync(() => {
            const headers = GridFunctions.getColumnHeaders(fixture);
            const headerResArea = GridFunctions.getHeaderResizeArea(headers[2]).nativeElement;

            expect(grid.columns[2].width).toEqual('150px');
            expect(grid.columns[2].sortable).toBeTruthy();
            expect(grid.columns[2].cells[0].value).toEqual(254);

            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 450, 0);
            tick(200);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 550, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 550, 5);
            fixture.detectChanges();

            // column has maxWidth='150px'
            expect(grid.columns[1].width).toEqual('150px');

            GridFunctions.clickHeaderSortIcon(headers[2]);
            GridFunctions.clickHeaderSortIcon(headers[2]);
            fixture.detectChanges();

            expect(grid.columns[2].cells[0].value).toEqual(1000);
        }));

        it('should autoresize column on double click.', fakeAsync(() => {
            const headers = GridFunctions.getColumnHeaders(fixture);
            const resizeArea = GridFunctions.getHeaderResizeArea(headers[1]).nativeElement;

            expect(grid.columns[0].width).toEqual('150px');
            expect(grid.columns[1].width).toEqual('150px');
            expect(grid.columns[2].width).toEqual('150px');

            UIInteractions.simulateMouseEvent('dblclick', resizeArea, 0, 0);
            tick(200);
            fixture.detectChanges();

            expect(grid.columns[1].width).toEqual('195px');
        }));

        it('should autoresize templated column on double click.', fakeAsync(() => {
            const headers = GridFunctions.getColumnHeaders(fixture);
            const resizeArea = GridFunctions.getHeaderResizeArea(headers[5]).nativeElement;

            expect(grid.columns[5].width).toEqual('150px');

            UIInteractions.simulateMouseEvent('dblclick', resizeArea, 0, 0);
            tick(200);
            fixture.detectChanges();

            expect(grid.columns[5].width).toEqual('89px');
        }));

        it('should fire columnResized with correct event args.', fakeAsync(() => {
            const resizingSpy = spyOn<any>(grid.columnResized, 'emit').and.callThrough();
            const headers: DebugElement[] = GridFunctions.getColumnHeaders(fixture);

            expect(grid.columns[0].width).toEqual('150px');

            const headerResArea = GridFunctions.getHeaderResizeArea(headers[0]).nativeElement;
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 150, 5);
            tick(200);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 300, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 300, 5);
            fixture.detectChanges();

            let resizingArgs: IColumnResizeEventArgs = { column: grid.columns[0], prevWidth: '150px', newWidth: '300px' };
            expect(grid.columns[0].width).toEqual('300px');
            expect(resizingSpy).toHaveBeenCalledTimes(1);
            expect(resizingSpy).toHaveBeenCalledWith(resizingArgs);

            expect(grid.columns[1].width).toEqual('150px');

            const resizeArea = GridFunctions.getHeaderResizeArea(headers[1]).nativeElement;
            UIInteractions.simulateMouseEvent('dblclick', resizeArea, 0, 0);
            tick(200);
            fixture.detectChanges();

            expect(grid.columns[1].width).toEqual('195px');
            resizingArgs = { column: grid.columns[1], prevWidth: '150', newWidth: '195px' };
            expect(resizingSpy).toHaveBeenCalledTimes(2);
            expect(resizingSpy).toHaveBeenCalledWith(resizingArgs);
        }));

        it('should autosize templated column programmatically.', () => {
            const column = grid.getColumnByName('Category');
            expect(column.width).toEqual('150px');

            column.autosize();
            fixture.detectChanges();

            expect(column.width).toEqual('89px');
        });

        it('should ignore header template during autosize if autosizeHeader is false.', () => {
            const column = grid.getColumnByName('ID');
            column.minWidth = '10px';
            column.autosizeHeader = false;
            fixture.detectChanges();

            expect(column.width).toEqual('150px');

            column.autosize();
            fixture.detectChanges();

            expect(column.width).toEqual('55px');
        });
    });

    describe('Multi Column Headers tests: ', () => {
        let fixture: ComponentFixture<any>;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(MultiColumnHeadersComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        }));

        it('should autosize filterable/sortable/resizable/movable column programmatically.', fakeAsync(/** height/width setter rAF */() => {
            const column = grid.getColumnByName('Missing');
            expect(column.width).toEqual('100px');

            column.autosize();
            fixture.detectChanges();
            // the exact width is different between chrome and chrome headless so an exact match is erroneous
            expect(Math.abs(parseInt(column.width, 10) - 120)).toBeLessThan(2);
        }));

        it('should autosize MCHs programmatically.', fakeAsync(/** height/width setter rAF */() => {
            let column = grid.getColumnByName('CompanyName');
            expect(column.width).toEqual('130px');

            column.autosize();
            fixture.detectChanges();
            expect(column.width).toEqual('239px');

            column = grid.getColumnByName('ContactName');
            expect(column.width).toEqual('100px');

            column.autosize();
            fixture.detectChanges();
            expect(column.width).toEqual('148px');

            column = grid.getColumnByName('Region');
            expect(column.width).toEqual('150px');

            column.autosize();
            fixture.detectChanges();
            expect(column.width).toEqual('85px');

            column = grid.getColumnByName('Country');
            expect(column.width).toEqual('90px');

            column.autosize();
            fixture.detectChanges();
            expect(column.width).toEqual('111px');
        }));
    });

    describe('Different columns widths tests: ', () => {
        it('should resize columns with initial width of null.', fakeAsync(() => {
            const fixture = TestBed.createComponent(NullColumnsComponent);
            fixture.detectChanges();

            const grid = fixture.componentInstance.grid;
            const headers: DebugElement[] = GridFunctions.getColumnHeaders(fixture);

            expect(parseInt(grid.columns[0].width, 10)).not.toBeNaN();

            let headerResArea = GridFunctions.getHeaderResizeArea(headers[0]).nativeElement;
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 126, 5);
            tick(200);
            fixture.detectChanges();

            let resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 250, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 250, 5);
            fixture.detectChanges();

            expect(grid.columns[0].width).toEqual('200px');

            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 200, 0);
            tick(200);
            fixture.detectChanges();

            resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 50, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 50, 5);
            fixture.detectChanges();

            expect(grid.columns[0].width).toEqual(grid.columns[0].minWidth + 'px');

            headerResArea = GridFunctions.getHeaderResizeArea(headers[1]).nativeElement;
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 197, 5);
            tick(200);
            fixture.detectChanges();

            expect(parseInt(grid.columns[1].width, 10)).not.toBeNaN();

            resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 300, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 300, 5);
            fixture.detectChanges();

            expect(parseInt(grid.columns[1].width, 10)).toBeGreaterThanOrEqual(100);

            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 300, 5);
            tick(200);
            fixture.detectChanges();

            resizer = GridFunctions.getResizer(fixture).nativeElement;
            UIInteractions.simulateMouseEvent('mousemove', resizer, 50, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 50, 5);
            fixture.detectChanges();

            expect(grid.columns[1].width).toEqual('80px');
        }));

        it('should size headers correctly when column width is below the allowed minimum.', () => {
            const fixture = TestBed.createComponent(ColGridComponent);
            fixture.detectChanges();

            const headers = GridFunctions.getColumnHeaders(fixture);
            const headerGroups = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));
            const filteringCells = GridFunctions.getFilteringCells(fixture);

            expect(headers[0].nativeElement.getBoundingClientRect().width).toBe(49);
            expect(headers[1].nativeElement.getBoundingClientRect().width).toBe(50);
            expect(headers[2].nativeElement.getBoundingClientRect().width).toBe(49);

            expect(filteringCells[0].nativeElement.getBoundingClientRect().width).toBe(49);
            expect(filteringCells[1].nativeElement.getBoundingClientRect().width).toBe(50);
            expect(filteringCells[2].nativeElement.getBoundingClientRect().width).toBe(49);

            expect(headerGroups[0].nativeElement.getBoundingClientRect().width).toBe(48);
            expect(headerGroups[1].nativeElement.getBoundingClientRect().width).toBe(50);
            expect(headerGroups[2].nativeElement.getBoundingClientRect().width).toBe(48);
        });

        it('should size headers correctly when column width is in %.', () => {
            const fixture = TestBed.createComponent(ColPercentageGridComponent);
            fixture.detectChanges();
            const grid = fixture.componentInstance.grid;
            grid.ngAfterViewInit();

            const headers = GridFunctions.getColumnHeaders(fixture);
            const headerGroups = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));
            const filteringCells = GridFunctions.getFilteringCells(fixture);
            const expectedWidth = (parseInt(grid.width, 10) - grid.scrollSize) / 4;
            expect(headers[0].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(headers[1].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(headers[2].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(headers[3].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);

            expect(filteringCells[0].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(filteringCells[1].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(filteringCells[2].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(filteringCells[3].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);

            expect(headerGroups[0].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(headerGroups[1].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(headerGroups[2].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
            expect(headerGroups[3].nativeElement.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
        });
    });
});

@Component({
    template: GridTemplateStrings.declareGrid(`width="500px" height="300px"`, ``, ColumnDefinitions.resizableThreeOfFour)
})
export class ResizableColumnsComponent {
    @ViewChild(IgxGridComponent, { static: true }) public grid: IgxGridComponent;

    public data = SampleTestData.personIDNameRegionData();
}

@Component({
    template: GridTemplateStrings.declareGrid(`width="618px" height="600px"`, ``,
        `<igx-column [field]="'Released'" [pinned]="true" width="100px" dataType="boolean" [resizable]="true"></igx-column>
        <igx-column [field]="'ReleaseDate'" [pinned]="true" width="100px" dataType="date" [resizable]="true"
            [formatter]="returnVal"></igx-column>
        <igx-column [field]="'Items'" [pinned]="true" width="100px" dataType="string" [resizable]="true"></igx-column>
        <igx-column [field]="'ID'" [width]="'100px'" [header]="'ID'" [resizable]="true"></igx-column>
        <igx-column [field]="'ProductName'" width="50px" [maxWidth]="'100px'" dataType="string" [resizable]="true"></igx-column>
        <igx-column [field]="'Test'" width="100px" dataType="string" [resizable]="true">
            <ng-template igxCell>
                <div></div>
            </ng-template>
        </igx-column>
        <igx-column [field]="'Downloads'" width="100px" dataType="number" [resizable]="true"></igx-column>
        <igx-column [field]="'Category'" width="100px" dataType="string" [resizable]="true"></igx-column>`
    )
})
export class LargePinnedColGridComponent implements OnInit {
    @ViewChild(IgxGridComponent, { static: true }) public grid: IgxGridComponent;

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
    public data = [];
    public value: any;

    public ngOnInit() {
        this.data = SampleTestData.generateProductData(75);
    }

    public returnVal(value) {
        return value;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(``, ``, ColumnDefinitions.gridFeatures)
})
export class GridFeaturesComponent {
    @ViewChild(IgxGridComponent, { static: true }) public grid: IgxGridComponent;

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

    public data = SampleTestData.productInfoDataFull();
}

@Component({
    template: GridTemplateStrings.declareGrid(`height="800px"`, ``, ColumnDefinitions.resizableColsComponent)
})
export class NullColumnsComponent implements OnInit {
    @ViewChild(IgxGridComponent, { static: true }) public grid: IgxGridComponent;

    public data = [];
    public columns = [];

    public ngOnInit(): void {
        this.columns = [
            { field: 'ID', resizable: true, maxWidth: 200, minWidth: 70 },
            { field: 'CompanyName', resizable: true },
            { field: 'ContactName', resizable: true },
            { field: 'ContactTitle', resizable: true },
            { field: 'Address', resizable: true },
            { field: 'City', resizable: true },
            { field: 'Region', resizable: true },
            { field: 'PostalCode', resizable: true },
            { field: 'Phone', resizable: true },
            { field: 'Fax', resizable: true }
        ];

        this.data = SampleTestData.contactInfoData();
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(`width="400px" height="600px" [allowFiltering]="true"`, ``,
        `<igx-column [field]="'Items'" [width]="'40px'" dataType="string" [filterable]="true"></igx-column>
         <igx-column [field]="'ID'" [width]="'50px'" [header]="'ID'" [filterable]="true"></igx-column>
         <igx-column [field]="'ProductName'" [width]="'30px'" dataType="string" [filterable]="true"></igx-column>
         <igx-column [field]="'Test'" width="300px" dataType="string" [resizable]="true"></igx-column>
         <igx-column [field]="'Downloads'" width="300px" dataType="number" [resizable]="true"></igx-column>
         <igx-column [field]="'Category'" width="300px" dataType="string" [resizable]="true"></igx-column>`
    )
})
export class ColGridComponent implements OnInit {
    @ViewChild(IgxGridComponent, { static: true }) public grid: IgxGridComponent;

    public data = [];

    public ngOnInit() {
        this.data = SampleTestData.generateProductData(10);
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(`width="400px" height="600px" [allowFiltering]="true"`, ``,
        `<igx-column [field]="'Items'" [width]="'25%'" dataType="string" [filterable]="true" [resizable]="true"></igx-column>
         <igx-column [field]="'ID'" [width]="'25%'" [header]="'ID'" [filterable]="true"></igx-column>
         <igx-column [field]="'ProductName'" [width]="'25%'" dataType="string" [filterable]="true"></igx-column>
         <igx-column [field]="'Test'"[width]="'25%'" dataType="string" [resizable]="true"></igx-column>`
    )
})
export class ColPercentageGridComponent implements OnInit {
    @ViewChild(IgxGridComponent, { static: true }) public grid: IgxGridComponent;

    public data = [];

    public ngOnInit() {
        this.data = SampleTestData.generateProductData(10);
    }
}
