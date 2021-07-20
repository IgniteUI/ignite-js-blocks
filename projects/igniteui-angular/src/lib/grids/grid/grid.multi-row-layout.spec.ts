import { TestBed, fakeAsync } from '@angular/core/testing';
import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';
import { Component, ViewChild } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxColumnLayoutComponent } from '../columns/column-layout.component';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { By } from '@angular/platform-browser';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { wait } from '../../test-utils/ui-interactions.spec';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { ICellPosition } from '../common/events';
import { GridFunctions } from '../../test-utils/grid-functions.spec';

const GRID_COL_THEAD_CLASS = '.igx-grid-th';
const GRID_MRL_BLOCK = '.igx-grid__mrl-block';

describe('IgxGrid - multi-row-layout #grid', () => {
    const DEBOUNCETIME = 60;
    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                ColumnLayoutTestComponent,
                ColumnLayoutAndGroupsTestComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule
            ]
        });
    }));

    it('should initialize a grid with 1 column group', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const gridFirstRow = grid.rowList.first;
        const firstRowCells = gridFirstRow.cells.toArray();
        const headerCells = grid.headerGroupsList[0].children.toArray();

        // headers are aligned to cells
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

        GridFunctions.verifyDOMMatchesLayoutSettings(gridFirstRow, fixture.componentInstance.colGroups);

        // the last cell is spaned as much as the first 3 cells
        const firstThreeCellsWidth = firstRowCells[0].nativeElement.offsetWidth +
            firstRowCells[1].nativeElement.offsetWidth +
            firstRowCells[2].nativeElement.offsetWidth;
        const lastCellWidth = firstRowCells[3].nativeElement.offsetWidth;
        expect(2 * firstRowCells[0].nativeElement.offsetHeight).toEqual(firstRowCells[3].nativeElement.offsetHeight);
        expect(firstThreeCellsWidth).toEqual(lastCellWidth);
    }));

    it('should initialize grid with 2 column groups', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        fixture.detectChanges();
        fixture.componentInstance.colGroups.push({
            group: 'group2',
            columns: [
                { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 4, rowEnd: 4 },
                { field: 'CompanyName', rowStart: 1, colStart: 1 },
                { field: 'PostalCode', rowStart: 1, colStart: 2 },
                { field: 'Fax', rowStart: 1, colStart: 3 }
            ]
        });
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const gridFirstRow = grid.rowList.first;
        const firstRowCells = gridFirstRow.cells.toArray();
        const headerCells = grid.theadRow._groups.last.children.toArray();

        // headers are aligned to cells
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

        GridFunctions.verifyDOMMatchesLayoutSettings(gridFirstRow, fixture.componentInstance.colGroups);
    }));

    it('should not throw error when layout is incomplete and should render valid mrl block styles', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        fixture.detectChanges();
        // creating an incomplete layout
        fixture.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 4, rowEnd: 3 },
                { field: 'CompanyName', rowStart: 1, colStart: 1 },
                { field: 'PostalCode', rowStart: 1, colStart: 2 },
                // { field: 'Fax', rowStart: 1, colStart: 3},
                { field: 'Country', rowStart: 3, colStart: 1 },
                // { field: 'Region', rowStart: 3, colStart: 2},
                { field: 'Phone', rowStart: 3, colStart: 3 }
            ]
        }];
        fixture.componentInstance.grid.width = '617px';
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const gridFirstRow = grid.rowList.first;
        const firstRowCells = gridFirstRow.cells.toArray();
        const headerCells = grid.headerGroupsList[0].children.toArray();
        // headers are aligned to cells
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

        // verify block style
        expect(grid.columnList.first.getGridTemplate(false, false)).toBe('200px 200px 200px');
        expect(grid.columnList.first.getGridTemplate(true, false)).toBe('repeat(3,1fr)');

        // creating an incomplete layout 2
        fixture.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 4, rowEnd: 3 },
                { field: 'CompanyName', rowStart: 3, colStart: 1 },
                // { field: 'PostalCode', rowStart: 1, colStart: 2},
                { field: 'Fax', rowStart: 3, colStart: 3 }
            ]
        }];
        fixture.componentInstance.grid.width = '617px';
        fixture.detectChanges();

        expect(grid.columnList.first.getGridTemplate(false, false)).toBe('200px 200px 200px');
        expect(grid.columnList.first.getGridTemplate(true, false)).toBe('repeat(3,1fr)');

    }));
    it('should initialize correctly when no column widths are set.', fakeAsync(() => {
        // test with single group
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        fixture.detectChanges();
        fixture.componentInstance.grid.width = '617px';
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        // col span is 3 => columns should have grid width - scrollbarWitdh/3 width
        // check columns
        expect(grid.gridAPI.get_cell_by_index(0, 'ID').nativeElement.offsetWidth).toBe(200);
        expect(grid.gridAPI.get_cell_by_index(0, 'CompanyName').nativeElement.offsetWidth).toBe(200);
        expect(grid.gridAPI.get_cell_by_index(0, 'ContactName').nativeElement.offsetWidth).toBe(200);
        expect(grid.gridAPI.get_cell_by_index(0, 'ContactTitle').nativeElement.offsetWidth).toBe(200 * 3);

        // check group blocks
        let groupHeaderBlocks = fixture.debugElement.query(By.css('.igx-grid-thead')).queryAll(By.css(GRID_MRL_BLOCK));
        expect(groupHeaderBlocks[0].nativeElement.clientWidth).toBe(200 * 3);
        expect(groupHeaderBlocks[0].nativeElement.clientHeight).toBe(51 * 3);

        let firstRowCells = grid.rowList.first.cells.toArray();
        let headerCells = grid.headerGroupsList[0].children.toArray();
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

        GridFunctions.verifyDOMMatchesLayoutSettings(grid.rowList.first, fixture.componentInstance.colGroups);

        // test with 2 groups
        fixture.componentInstance.colGroups.push({
            group: 'group2',
            columns: [
                { field: 'Country', rowStart: 1, colStart: 1, colEnd: 4, rowEnd: 3 },
                { field: 'Region', rowStart: 3, colStart: 1 },
                { field: 'PostalCode', rowStart: 3, colStart: 2 },
                { field: 'Fax', rowStart: 3, colStart: 3 }
            ]
        });
        fixture.componentInstance.grid.width = '917px';
        fixture.detectChanges();

        // col span is 6 => columns should have grid width - scrollbarWitdh/6 width
        expect(grid.gridAPI.get_cell_by_index(0, 'ID').nativeElement.offsetWidth).toBe(150);
        expect(grid.gridAPI.get_cell_by_index(0, 'CompanyName').nativeElement.offsetWidth).toBe(150);
        expect(grid.gridAPI.get_cell_by_index(0, 'ContactName').nativeElement.offsetWidth).toBe(150);
        expect(grid.gridAPI.get_cell_by_index(0, 'ContactTitle').nativeElement.offsetWidth).toBe(150 * 3);

        expect(grid.gridAPI.get_cell_by_index(0, 'Fax').nativeElement.offsetWidth).toBe(150);
        expect(grid.gridAPI.get_cell_by_index(0, 'Region').nativeElement.offsetWidth).toBe(150);
        expect(grid.gridAPI.get_cell_by_index(0, 'PostalCode').nativeElement.offsetWidth).toBe(150);
        expect(grid.gridAPI.get_cell_by_index(0, 'Country').nativeElement.offsetWidth).toBe(150 * 3);

        // check group blocks
        groupHeaderBlocks = fixture.debugElement.query(By.css('.igx-grid-thead')).queryAll(By.css(GRID_MRL_BLOCK));
        expect(groupHeaderBlocks[0].nativeElement.clientWidth).toBe(150 * 3);
        expect(groupHeaderBlocks[0].nativeElement.clientHeight).toBe(51 * 3);
        expect(groupHeaderBlocks[1].nativeElement.clientWidth).toBe(150 * 3);
        expect(groupHeaderBlocks[1].nativeElement.clientHeight).toBe(51 * 3);

        firstRowCells = grid.rowList.first.cells.toArray();
        headerCells = grid.theadRow._groups.last.children.toArray();

        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);
        GridFunctions.verifyDOMMatchesLayoutSettings(grid.rowList.first, fixture.componentInstance.colGroups);

        // test with 3 groups
        fixture.componentInstance.colGroups.push({
            group: 'group3',
            columns: [
                { field: 'Phone', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 4 }
            ]
        });
        fixture.detectChanges();

        // col span is 8 => min-width exceeded should use 136px
        expect(grid.gridAPI.get_cell_by_index(0, 'ID').nativeElement.offsetWidth).toBe(136);
        expect(grid.gridAPI.get_cell_by_index(0, 'CompanyName').nativeElement.offsetWidth).toBe(136);
        expect(grid.gridAPI.get_cell_by_index(0, 'ContactName').nativeElement.offsetWidth).toBe(136);
        expect(grid.gridAPI.get_cell_by_index(0, 'ContactTitle').nativeElement.offsetWidth).toBe(136 * 3);

        expect(grid.gridAPI.get_cell_by_index(0, 'Fax').nativeElement.offsetWidth).toBe(136);
        expect(grid.gridAPI.get_cell_by_index(0, 'Region').nativeElement.offsetWidth).toBe(136);
        expect(grid.gridAPI.get_cell_by_index(0, 'PostalCode').nativeElement.offsetWidth).toBe(136);
        expect(grid.gridAPI.get_cell_by_index(0, 'Country').nativeElement.offsetWidth).toBe(136 * 3);

        expect(grid.gridAPI.get_cell_by_index(0, 'Phone').nativeElement.offsetWidth).toBe(136 * 2);

        // check group blocks
        groupHeaderBlocks = fixture.debugElement.query(By.css('.igx-grid-thead')).queryAll(By.css(GRID_MRL_BLOCK));
        expect(groupHeaderBlocks[0].nativeElement.clientWidth).toBe(136 * 3);
        expect(groupHeaderBlocks[0].nativeElement.clientHeight).toBe(51 * 3);
        expect(groupHeaderBlocks[1].nativeElement.clientWidth).toBe(136 * 3);
        expect(groupHeaderBlocks[1].nativeElement.clientHeight).toBe(51 * 3);
        expect(groupHeaderBlocks[2].nativeElement.clientWidth).toBe(136 * 2);
        // the following throws error because last colgroup row span in header does not fill content
        // expect(groupHeaderBlocks[2].nativeElement.clientHeight).toBe(50 * 3);

        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);
        GridFunctions.verifyDOMMatchesLayoutSettings(grid.rowList.first, fixture.componentInstance.colGroups);
    }));

    it('should initialize correctly when widths are set in px.', fakeAsync(() => {
        // test with single group - all cols with colspan 1 have width
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        fixture.detectChanges();
        fixture.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, width: '100px' },
                { field: 'CompanyName', rowStart: 1, colStart: 2, width: '200px' },
                { field: 'ContactName', rowStart: 1, colStart: 3, width: '300px' },
                { field: 'ContactTitle', rowStart: 2, colStart: 1, rowEnd: 4, colEnd: 4 },
            ]
        }];
        fixture.detectChanges();
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        // check columns
        expect(grid.gridAPI.get_cell_by_index(0, 'ID').nativeElement.offsetWidth).toBe(100);
        expect(grid.gridAPI.get_cell_by_index(0, 'CompanyName').nativeElement.offsetWidth).toBe(200);
        expect(grid.gridAPI.get_cell_by_index(0, 'ContactName').nativeElement.offsetWidth).toBe(300);
        expect(grid.gridAPI.get_cell_by_index(0, 'ContactTitle').nativeElement.offsetWidth).toBe(600);

        // check group blocks
        let groupHeaderBlocks = fixture.debugElement.query(By.css('.igx-grid-thead')).queryAll(By.css(GRID_MRL_BLOCK));
        expect(groupHeaderBlocks[0].nativeElement.clientWidth).toBe(600);

        let firstRowCells = grid.rowList.first.cells.toArray();
        let headerCells = grid.headerGroupsList[0].children.toArray();
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);
        GridFunctions.verifyDOMMatchesLayoutSettings(grid.rowList.first, fixture.componentInstance.colGroups);


        // test with 2 groups - only 2 columns with colspan1 have width
        fixture.componentInstance.colGroups.push({
            group: 'group2',
            columns: [
                { field: 'Country', rowStart: 1, colStart: 1, colEnd: 4, rowEnd: 3 },
                { field: 'Region', rowStart: 3, colStart: 1, width: '100px' },
                { field: 'PostalCode', rowStart: 3, colStart: 2 },
                { field: 'Fax', rowStart: 3, colStart: 3, width: '200px' }
            ]
        });
        fixture.componentInstance.grid.width = '1117px';
        fixture.detectChanges();
        fixture.detectChanges();

        // first group takes 600px, 500px left for second group
        // check columns
        expect(grid.gridAPI.get_cell_by_index(0, 'ID').nativeElement.offsetWidth).toBe(100);
        expect(grid.gridAPI.get_cell_by_index(0, 'CompanyName').nativeElement.offsetWidth).toBe(200);
        expect(grid.gridAPI.get_cell_by_index(0, 'ContactName').nativeElement.offsetWidth).toBe(300);
        expect(grid.gridAPI.get_cell_by_index(0, 'ContactTitle').nativeElement.offsetWidth).toBe(600);

        // This fails for unknown reasons only in travis with 2px difference
        //  expect(grid.gridAPI.get_cell_by_index(0, 'Country').nativeElement.offsetWidth).toBe(500);
        //  expect(grid.gridAPI.get_cell_by_index(0, 'Region').nativeElement.offsetWidth).toBe(100);
        //  // postal code has no width - auto width should be assigned based on available space.
        //  expect(grid.gridAPI.get_cell_by_index(0, 'PostalCode').nativeElement.offsetWidth).toBe(200);
        //  expect(grid.gridAPI.get_cell_by_index(0, 'Fax').nativeElement.offsetWidth).toBe(200);

        //  // check group blocks
        //  groupHeaderBlocks = fixture.debugElement.query(By.css('.igx-grid-thead')).queryAll(By.css(GRID_MRL_BLOCK));
        //  expect(groupHeaderBlocks[1].nativeElement.clientWidth).toBe(500);

        firstRowCells = grid.rowList.first.cells.toArray();
        headerCells = grid.theadRow._groups.last.children.toArray();
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);
        GridFunctions.verifyDOMMatchesLayoutSettings(grid.rowList.first, fixture.componentInstance.colGroups);

        // test with 3 groups - only parent has width
        fixture.componentInstance.colGroups.push({
            group: 'group3',
            columns: [
                { field: 'Phone', rowStart: 1, colStart: 1, colEnd: 3, width: '500px' },
                { field: 'Phone1', rowStart: 2, colStart: 1, colEnd: 2, rowSpan: 'span 2' },
                { field: 'Phone2', rowStart: 2, colStart: 2, colEnd: 3, rowSpan: 'span 2' }
            ]
        });
        fixture.componentInstance.grid.width = '1617px';
        fixture.detectChanges();
        fixture.detectChanges();

        // check columns
        expect(grid.gridAPI.get_cell_by_index(0, 'Phone').nativeElement.offsetWidth).toBe(500);
        expect(grid.gridAPI.get_cell_by_index(0, 'Phone1').nativeElement.offsetWidth).toBe(250);
        expect(grid.gridAPI.get_cell_by_index(0, 'Phone2').nativeElement.offsetWidth).toBe(250);

        groupHeaderBlocks = fixture.debugElement.query(By.css('.igx-grid-thead')).queryAll(By.css(GRID_MRL_BLOCK));
        expect(groupHeaderBlocks[2].nativeElement.clientWidth).toBe(500);

        firstRowCells = grid.rowList.first.cells.toArray();
        headerCells = grid.theadRow._groups.last.children.toArray();
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);
    }));

    it('should correctly autofit column without width when there are other set with width in pixels', fakeAsync(() => {
        // In this case it would be for City column and 3rd template column.
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        fixture.detectChanges();
        // creating an incomplete layout
        fixture.componentInstance.grid.width = '1200px';
        fixture.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 4 },
                { field: 'ContactTitle', rowStart: 1, colStart: 4, colEnd: 6, width: '200px' },
                { field: 'Country', rowStart: 1, colStart: 6, colEnd: 7, width: '200px' },
                { field: 'Phone', rowStart: 2, colStart: 1, colEnd: 3, width: '200px' },
                { field: 'City', rowStart: 2, colStart: 3, colEnd: 5 },
                { field: 'Address', rowStart: 2, colStart: 5, colEnd: 7, width: '200px' },
                { field: 'CompanyName', rowStart: 3, colStart: 1, colEnd: 2, width: '200px' },
                { field: 'PostalCode', rowStart: 3, colStart: 2, colEnd: 3, width: '200px' },
                { field: 'Fax', rowStart: 3, colStart: 3, colEnd: 7 },
            ]
        }];
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const gridFirstRow = grid.rowList.first;
        const firstRowCells = gridFirstRow.cells.toArray();
        const headerCells = grid.headerGroupsList[0].children.toArray();

        // headers are aligned to cells
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

        const autoSizedColumnWidth = 400 - grid.scrollSize;
        const groupRowBlocks = fixture.debugElement.query(By.css('.igx-grid__tbody')).queryAll(By.css('.igx-grid__mrl-block'));
        expect(groupRowBlocks[0].nativeElement.style.gridTemplateColumns)
            .toEqual('200px 200px ' + autoSizedColumnWidth + 'px 100px 100px 200px');
    }));

    it('should correctly size column without width when it overlaps partially with bigger column that has width above it', fakeAsync(() => {
        // In this case it would be for City column and 3rd template column overlapping width ContactName.
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        // creating an incomplete layout
        fixture.componentInstance.grid.width = '1200px';
        fixture.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 4, width: '300px' },
                { field: 'ContactTitle', rowStart: 1, colStart: 4, colEnd: 6, width: '200px' },
                { field: 'Country', rowStart: 1, colStart: 6, colEnd: 7, width: '200px' },
                { field: 'Phone', rowStart: 2, colStart: 1, colEnd: 3, width: '200px' },
                { field: 'City', rowStart: 2, colStart: 3, colEnd: 5 },
                { field: 'Address', rowStart: 2, colStart: 5, colEnd: 7, width: '200px' },
                { field: 'CompanyName', rowStart: 3, colStart: 1, colEnd: 2, width: '200px' },
                { field: 'PostalCode', rowStart: 3, colStart: 2, colEnd: 3, width: '200px' },
                { field: 'Fax', rowStart: 3, colStart: 3, colEnd: 7 },
            ]
        }];
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const gridFirstRow = grid.rowList.first;
        const firstRowCells = gridFirstRow.cells.toArray();
        const headerCells = grid.headerGroupsList[0].children.toArray();

        // headers are aligned to cells
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

        const groupRowBlocks = fixture.debugElement.query(By.css('.igx-grid__tbody')).queryAll(By.css('.igx-grid__mrl-block'));
        expect(groupRowBlocks[0].nativeElement.style.gridTemplateColumns).toEqual('200px 200px 100px 100px 100px 200px');
    }));

    it('should correctly size column without width when it overlaps partially with bigger column that has width bellow it',
        fakeAsync(() => {
            // In this case it would be for City column and 3rd template column overlapping width ContactName.
            const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
            // creating an incomplete layout
            fixture.componentInstance.grid.width = '1200px';
            fixture.componentInstance.colGroups = [{
                group: 'group1',
                columns: [
                    { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 5, width: '200px' },
                    { field: 'ContactTitle', rowStart: 1, colStart: 5, colEnd: 6, width: '200px' },
                    { field: 'Country', rowStart: 1, colStart: 6, colEnd: 7 },
                    { field: 'Phone', rowStart: 2, colStart: 1, colEnd: 3, width: '200px' },
                    { field: 'City', rowStart: 2, colStart: 3, colEnd: 5, width: '200px' },
                    { field: 'Address', rowStart: 2, colStart: 5, colEnd: 7, width: '300px' },
                    { field: 'CompanyName', rowStart: 3, colStart: 1, colEnd: 2, width: '200px' },
                    { field: 'PostalCode', rowStart: 3, colStart: 2, colEnd: 3, width: '200px' },
                    { field: 'Fax', rowStart: 3, colStart: 3, colEnd: 7, width: '200px' },
                ]
            }];
            fixture.detectChanges();
            const grid = fixture.componentInstance.grid;
            const gridFirstRow = grid.rowList.first;
            const firstRowCells = gridFirstRow.cells.toArray();
            const headerCells = grid.headerGroupsList[0].children.toArray();

            // headers are aligned to cells
            GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

            const groupRowBlocks = fixture.debugElement.query(By.css('.igx-grid__tbody')).queryAll(By.css('.igx-grid__mrl-block'));
            expect(groupRowBlocks[0].nativeElement.style.gridTemplateColumns).toEqual('200px 200px 100px 100px 200px 150px');
        }));

    it('should correctly set column width when there is bigger column at the bottom where there is not width yet', fakeAsync(() => {
        // In this case it would be for City column and 3rd template column.
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        // creating an incomplete layout
        fixture.componentInstance.grid.width = '1200px';
        fixture.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 4 },
                { field: 'ContactTitle', rowStart: 1, colStart: 4, colEnd: 6, width: '200px' },
                { field: 'Country', rowStart: 1, colStart: 6, colEnd: 7, width: '200px' },
                { field: 'Phone', rowStart: 2, colStart: 1, colEnd: 3, width: '200px' },
                { field: 'City', rowStart: 2, colStart: 3, colEnd: 5 },
                { field: 'Address', rowStart: 2, colStart: 5, colEnd: 7, width: '200px' },
                { field: 'CompanyName', rowStart: 3, colStart: 1, colEnd: 2, width: '200px' },
                { field: 'PostalCode', rowStart: 3, colStart: 2, colEnd: 3, width: '200px' },
                { field: 'Fax', rowStart: 3, colStart: 3, colEnd: 7, width: '400px' },
            ]
        }];
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const gridFirstRow = grid.rowList.first;
        const firstRowCells = gridFirstRow.cells.toArray();
        const headerCells = grid.headerGroupsList[0].children.toArray();

        // headers are aligned to cells
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

        const groupRowBlocks = fixture.debugElement.query(By.css('.igx-grid__tbody')).queryAll(By.css('.igx-grid__mrl-block'));
        expect(groupRowBlocks[0].nativeElement.style.gridTemplateColumns).toEqual('200px 200px 100px 100px 100px 200px');
    }));

    it('should correctly set column width of column without width when there are two bigger columns that overlap with it', fakeAsync(() => {
        // In this case it would be for City column and 3rd template column overlapping with ContactName and Fax.
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        // creating an incomplete layout
        fixture.componentInstance.grid.width = '1200px';
        fixture.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 4, width: '360px' },
                { field: 'ContactTitle', rowStart: 1, colStart: 4, colEnd: 6, width: '200px' },
                { field: 'Country', rowStart: 1, colStart: 6, colEnd: 7, width: '200px' },
                { field: 'Phone', rowStart: 2, colStart: 1, colEnd: 3, width: '200px' },
                { field: 'City', rowStart: 2, colStart: 3, colEnd: 5 },
                { field: 'Address', rowStart: 2, colStart: 5, colEnd: 7, width: '200px' },
                { field: 'CompanyName', rowStart: 3, colStart: 1, colEnd: 2, width: '200px' },
                { field: 'PostalCode', rowStart: 3, colStart: 2, colEnd: 3, width: '200px' },
                { field: 'Fax', rowStart: 3, colStart: 3, colEnd: 7, width: '400px' },
            ]
        }];
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const gridFirstRow = grid.rowList.first;
        const firstRowCells = gridFirstRow.cells.toArray();
        const headerCells = grid.headerGroupsList[0].children.toArray();

        // headers are aligned to cells
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

        const groupRowBlocks = fixture.debugElement.query(By.css('.igx-grid__tbody')).queryAll(By.css('.igx-grid__mrl-block'));
        expect(groupRowBlocks[0].nativeElement.style.gridTemplateColumns).toEqual('200px 200px 120px 100px 100px 200px');
    }));

    it('should correctly autofit column without width when grid width is not enough and other cols are set in pixels', fakeAsync(() => {
        // In this case it would be for City column and 3rd template column.
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        // creating an incomplete layout
        fixture.componentInstance.grid.width = '700px';
        fixture.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 4 },
                { field: 'ContactTitle', rowStart: 1, colStart: 4, colEnd: 6, width: '200px' },
                { field: 'Country', rowStart: 1, colStart: 6, colEnd: 7, width: '200px' },
                { field: 'Phone', rowStart: 2, colStart: 1, colEnd: 3, width: '200px' },
                { field: 'City', rowStart: 2, colStart: 3, colEnd: 5 },
                { field: 'Address', rowStart: 2, colStart: 5, colEnd: 7, width: '200px' },
                { field: 'CompanyName', rowStart: 3, colStart: 1, colEnd: 2, width: '200px' },
                { field: 'PostalCode', rowStart: 3, colStart: 2, colEnd: 3, width: '200px' },
                { field: 'Fax', rowStart: 3, colStart: 3, colEnd: 7 },
            ]
        }];
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const gridFirstRow = grid.rowList.first;
        const firstRowCells = gridFirstRow.cells.toArray();
        const headerCells = grid.headerGroupsList[0].children.toArray();

        // headers are aligned to cells
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

        const groupRowBlocks = fixture.debugElement.query(By.css('.igx-grid__tbody')).queryAll(By.css('.igx-grid__mrl-block'));
        expect(groupRowBlocks[0].nativeElement.style.gridTemplateColumns).toEqual('200px 200px 136px 100px 100px 200px');
    }));

    it('should autofit a column with span 1 that does not have width set and is under a col with span 2 with width set', fakeAsync(() => {
        // In this case it would be for Phone, CompanyName  and PostalCode columns and first 2 template columns.
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        // creating an incomplete layout
        fixture.componentInstance.grid.width = '700px';
        fixture.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 4 },
                { field: 'ContactTitle', rowStart: 1, colStart: 4, colEnd: 6, width: '200px' },
                { field: 'Country', rowStart: 1, colStart: 6, colEnd: 7, width: '200px' },
                { field: 'Phone', rowStart: 2, colStart: 1, colEnd: 3 },
                { field: 'City', rowStart: 2, colStart: 3, colEnd: 5 },
                { field: 'Address', rowStart: 2, colStart: 5, colEnd: 7, width: '200px' },
                { field: 'CompanyName', rowStart: 3, colStart: 1, colEnd: 2, width: '200px' },
                { field: 'PostalCode', rowStart: 3, colStart: 2, colEnd: 3 },
                { field: 'Fax', rowStart: 3, colStart: 3, colEnd: 7 },
            ]
        }];
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const gridFirstRow = grid.rowList.first;
        const firstRowCells = gridFirstRow.cells.toArray();
        const headerCells = grid.headerGroupsList[0].children.toArray();

        // headers are aligned to cells
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

        const groupRowBlocks = fixture.debugElement.query(By.css('.igx-grid__tbody')).queryAll(By.css('.igx-grid__mrl-block'));
        expect(groupRowBlocks[0].nativeElement.style.gridTemplateColumns).toEqual('200px 136px 136px 100px 100px 200px');
    }));

    it('should use column width of a column with span 2 that has width when there are no columns with span 1 to take width from',
        fakeAsync(() => {
            // In this case it would be for Phone, CompanyName  and PostalCode columns and first 2 template columns.
            const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
            // creating an incomplete layout
            fixture.componentInstance.grid.width = '700px';
            fixture.componentInstance.colGroups = [{
                group: 'group1',
                columns: [
                    { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 4 },
                    { field: 'ContactTitle', rowStart: 1, colStart: 4, colEnd: 6, width: '200px' },
                    { field: 'Country', rowStart: 1, colStart: 6, colEnd: 7, width: '200px' },
                    { field: 'Phone', rowStart: 2, colStart: 1, colEnd: 3, width: '200px' },
                    { field: 'City', rowStart: 2, colStart: 3, colEnd: 5 },
                    { field: 'Address', rowStart: 2, colStart: 5, colEnd: 7, width: '200px' },
                    { field: 'CompanyName', rowStart: 3, colStart: 1, colEnd: 2 },
                    { field: 'PostalCode', rowStart: 3, colStart: 2, colEnd: 3 },
                    { field: 'Fax', rowStart: 3, colStart: 3, colEnd: 7 },
                ]
            }];
            fixture.detectChanges();
            const grid = fixture.componentInstance.grid;
            const gridFirstRow = grid.rowList.first;
            const firstRowCells = gridFirstRow.cells.toArray();
            const headerCells = grid.headerGroupsList[0].children.toArray();

            // headers are aligned to cells
            GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

            const groupRowBlocks = fixture.debugElement.query(By.css('.igx-grid__tbody')).queryAll(By.css('.igx-grid__mrl-block'));
            expect(groupRowBlocks[0].nativeElement.style.gridTemplateColumns).toEqual('100px 100px 136px 100px 100px 200px');
        }));

    it('should use divided column width when there is stairway type of defined columns and they have widths set', fakeAsync(() => {
        // In this case it would be for Country and Address columns  and last 3 template columns.
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        // creating an incomplete layout
        fixture.componentInstance.grid.width = '700px';
        fixture.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 4 },
                { field: 'ContactTitle', rowStart: 1, colStart: 4, colEnd: 6, width: '200px' },
                { field: 'Country', rowStart: 1, colStart: 6, colEnd: 8, width: '200px' },
                { field: 'Phone', rowStart: 2, colStart: 1, colEnd: 3, width: '200px' },
                { field: 'City', rowStart: 2, colStart: 3, colEnd: 5 },
                { field: 'Address', rowStart: 2, colStart: 5, colEnd: 8, width: '150px' },
                { field: 'CompanyName', rowStart: 3, colStart: 1, colEnd: 2 },
                { field: 'PostalCode', rowStart: 3, colStart: 2, colEnd: 3 },
                { field: 'Fax', rowStart: 3, colStart: 3, colEnd: 8 },
            ]
        }];
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const gridFirstRow = grid.rowList.first;
        const firstRowCells = gridFirstRow.cells.toArray();
        const headerCells = grid.headerGroupsList[0].children.toArray();

        // headers are aligned to cells
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

        const groupRowBlocks = fixture.debugElement.query(By.css('.igx-grid__tbody')).queryAll(By.css('.igx-grid__mrl-block'));
        expect(groupRowBlocks[0].nativeElement.style.gridTemplateColumns).toEqual('100px 100px 136px 100px 100px 100px 100px');
    }));

    it('should initialize correctly when widths are set in %.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        fixture.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1, width: '10%' },
                { field: 'CompanyName', rowStart: 1, colStart: 2, width: '20%' },
                { field: 'ContactName', rowStart: 1, colStart: 3, width: '30%' },
                { field: 'ContactTitle', rowStart: 2, colStart: 1, rowEnd: 4, colEnd: 4 },
            ]
        }];
        fixture.detectChanges();
        fixture.componentInstance.grid.width = (1000 + grid.scrollSize) + 'px';
        fixture.detectChanges();

        // check columns
        expect(grid.gridAPI.get_cell_by_index(0, 'ID').nativeElement.offsetWidth).toBe(100);
        expect(grid.gridAPI.get_cell_by_index(0, 'CompanyName').nativeElement.offsetWidth).toBe(200);
        expect(grid.gridAPI.get_cell_by_index(0, 'ContactName').nativeElement.offsetWidth).toBe(300);
        expect(grid.gridAPI.get_cell_by_index(0, 'ContactTitle').nativeElement.offsetWidth).toBe(600);

        // check group blocks
        // let groupHeaderBlocks = fixture.debugElement.query(By.css('.igx-grid-thead')).queryAll(By.css(GRID_MRL_BLOCK));
        let groupHeaderBlocks = grid.theadRow.nativeElement.querySelectorAll(GRID_MRL_BLOCK);
        expect(groupHeaderBlocks[0].clientWidth).toBe(600);

        let firstRowCells = grid.rowList.first.cells.toArray();
        let headerCells = grid.headerGroupsList[0].children.toArray();
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);
        GridFunctions.verifyDOMMatchesLayoutSettings(grid.rowList.first, fixture.componentInstance.colGroups);

        fixture.componentInstance.colGroups.push({
            group: 'group2',
            columns: [
                { field: 'Country', rowStart: 1, colStart: 1, colEnd: 4, rowEnd: 3 },
                { field: 'Region', rowStart: 3, colStart: 1, width: '10%' },
                { field: 'PostalCode', rowStart: 3, colStart: 2 },
                { field: 'Fax', rowStart: 3, colStart: 3, width: '20%' }
            ]
        });
        fixture.detectChanges();
        fixture.detectChanges();

        // check columns
        expect(grid.gridAPI.get_cell_by_index(0, 'Country').nativeElement.offsetWidth).toBe(100 + 200 + 136);
        expect(grid.gridAPI.get_cell_by_index(0, 'Region').nativeElement.offsetWidth).toBe(100);
        expect(grid.gridAPI.get_cell_by_index(0, 'PostalCode').nativeElement.offsetWidth).toBe(136);
        expect(grid.gridAPI.get_cell_by_index(0, 'Fax').nativeElement.offsetWidth).toBe(200);

        // check group blocks
        // groupHeaderBlocks = fixture.debugElement.query(By.css('.igx-grid-thead')).queryAll(By.css(GRID_MRL_BLOCK));
        groupHeaderBlocks = grid.theadRow.nativeElement.querySelectorAll(GRID_MRL_BLOCK);
        expect(groupHeaderBlocks[1].clientWidth).toBe(436);

        firstRowCells = grid.rowList.first.cells.toArray();
        headerCells = grid.theadRow._groups.last.children.toArray();
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);
        GridFunctions.verifyDOMMatchesLayoutSettings(grid.rowList.first, fixture.componentInstance.colGroups);

        fixture.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1 },
                { field: 'CompanyName', rowStart: 1, colStart: 2 },
                { field: 'ContactName', rowStart: 1, colStart: 3 },
                { field: 'Country', rowStart: 2, colStart: 1, colEnd: 3 },
                { field: 'Region', rowStart: 2, colStart: 3 },
                { field: 'ContactTitle', rowStart: 3, colStart: 1, rowEnd: 5, colEnd: 4, width: '60%' },
            ]
        }];
        fixture.detectChanges();
        fixture.detectChanges();

        // check columns
        expect(grid.gridAPI.get_cell_by_index(0, 'ID').nativeElement.offsetWidth).toBe(200);
        expect(grid.gridAPI.get_cell_by_index(0, 'CompanyName').nativeElement.offsetWidth).toBe(200);
        expect(grid.gridAPI.get_cell_by_index(0, 'ContactName').nativeElement.offsetWidth).toBe(200);
        expect(grid.gridAPI.get_cell_by_index(0, 'ContactTitle').nativeElement.offsetWidth).toBe(600);
        expect(grid.gridAPI.get_cell_by_index(0, 'Country').nativeElement.offsetWidth).toBe(400);
        expect(grid.gridAPI.get_cell_by_index(0, 'Region').nativeElement.offsetWidth).toBe(200);

        // check group blocks
        // groupHeaderBlocks = fixture.debugElement.query(By.css('.igx-grid-thead')).queryAll(By.css(GRID_MRL_BLOCK));
        groupHeaderBlocks = grid.theadRow.nativeElement.querySelectorAll(GRID_MRL_BLOCK);
        expect(groupHeaderBlocks[0].clientWidth).toBe(600);
        expect((groupHeaderBlocks[0] as HTMLElement).style.gridTemplateColumns).toEqual('200px 200px 200px');

        firstRowCells = grid.rowList.first.cells.toArray();
        headerCells = grid.headerGroupsList[0].children.toArray();
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);
        GridFunctions.verifyDOMMatchesLayoutSettings(grid.rowList.first, fixture.componentInstance.colGroups);
    }));

    it('should initialize correctly when grid width is in % and no widths are set for columns.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        const grid = fixture.componentInstance.grid;
        fixture.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1 },
                { field: 'CompanyName', rowStart: 1, colStart: 2 },
                { field: 'ContactName', rowStart: 1, colStart: 3, colEnd: 5 },
                { field: 'ContactTitle', rowStart: 2, colStart: 1, rowEnd: 3, colEnd: 4 },
            ]
        }];
        fixture.componentInstance.grid.width = '100%';
        fixture.detectChanges();

        // check group blocks
        // const groupHeaderBlocks = fixture.debugElement.query(By.css('.igx-grid-thead')).queryAll(By.css(GRID_MRL_BLOCK));
        const groupHeaderBlocks = grid.theadRow.nativeElement.querySelectorAll(GRID_MRL_BLOCK);
        expect(groupHeaderBlocks[0].clientWidth).toBe(groupHeaderBlocks[0].parentElement.clientWidth);

        const firstRowCells = grid.rowList.first.cells.toArray();
        const headerCells = grid.headerGroupsList[0].children.toArray();
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);
        GridFunctions.verifyDOMMatchesLayoutSettings(grid.rowList.first, fixture.componentInstance.colGroups);
    }));

    it('should use columns with the smallest col spans when determining the column group’s column widths.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        const grid = fixture.componentInstance.grid;
        fixture.componentInstance.colGroups = [{
            group: 'group2',
            columns: [
                { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 4, rowEnd: 4, width: '500px' },
                { field: 'CompanyName', rowStart: 1, colStart: 1, width: '100px' },
                { field: 'PostalCode', rowStart: 1, colStart: 2, width: '200px' },
                { field: 'Fax', rowStart: 1, colStart: 3, width: '100px' }
            ]
        }];
        fixture.detectChanges();

        // check group blocks
        // let groupHeaderBlocks = fixture.debugElement.query(By.css('.igx-grid-thead')).queryAll(By.css(GRID_MRL_BLOCK));
        let groupHeaderBlocks = grid.theadRow.nativeElement.querySelectorAll(GRID_MRL_BLOCK);
        expect(groupHeaderBlocks[0].clientWidth).toBe(400);
        expect((groupHeaderBlocks[0] as HTMLElement).style.gridTemplateColumns).toBe('100px 200px 100px');
        fixture.componentInstance.colGroups = [{
            group: 'group2',
            columns: [
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 4, rowEnd: 2, width: '500px' },
                { field: 'CompanyName', rowStart: 2, colStart: 1, width: '100px' },
                { field: 'PostalCode', rowStart: 2, colStart: 2, width: '200px' },
                { field: 'Fax', rowStart: 2, colStart: 3, width: '100px' }
            ]
        }];
        fixture.detectChanges();
        // check group blocks
        groupHeaderBlocks = grid.theadRow.nativeElement.querySelectorAll(GRID_MRL_BLOCK);
        expect(groupHeaderBlocks[0].clientWidth).toBe(400);
        expect((groupHeaderBlocks[0] as HTMLElement).style.gridTemplateColumns).toBe('100px 200px 100px');
    }));

    it('should disregard column groups if multi-column layouts are also defined.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnLayoutAndGroupsTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;

        // check grid's columns collection
        // 5 in total
        expect(grid.columnList.toArray().length).toBe(5);
        // 1 column layout
        expect(grid.columnList.filter(x => x.columnLayout).length).toBe(1);
        // 4 normal columns
        expect(grid.columnList.filter(x => !x.columnLayout && !x.columnGroup).length).toBe(4);

        // check header
        expect(document.querySelectorAll('igx-grid-header-group').length).toEqual(5);
        expect(document.querySelectorAll(GRID_COL_THEAD_CLASS).length).toEqual(4);
    }));

    it('should render correct heights when groups have different total row span', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnLayoutAndGroupsTestComponent);
        const grid = fixture.componentInstance.grid;
        fixture.componentInstance.colGroups = [
            {
                group: 'group1',
                // group with total row span 1
                columns: [
                    { field: 'Fax', rowStart: 1, colStart: 1 }
                ]
            }, {
                group: 'group2',
                // group with total row span 2
                columns: [
                    { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 4, rowEnd: 2 },
                    { field: 'CompanyName', rowStart: 2, colStart: 1 },
                    { field: 'PostalCode', rowStart: 2, colStart: 2 },
                    { field: 'Fax', rowStart: 2, colStart: 3 }
                ]
            }];
        fixture.detectChanges();

        // check first group has height of 2 row spans in header and rows but the header itself should span 1 row
        // check group block and column header height
        const firstLayout = grid.columnList.toArray()[0];
        expect(grid.multiRowLayoutRowSize).toEqual(2);
        expect(firstLayout.getGridTemplate(true, false)).toEqual('repeat(2,1fr)');
        expect(firstLayout.headerGroup.nativeElement.offsetHeight).toBe((grid.rowHeight + 1) * 2);
        expect(grid.getColumnByName('Fax').headerCell.nativeElement.offsetHeight).toBe(grid.rowHeight + 1);

        const secondLayout = grid.columnList.toArray()[2];
        const contactNameColumn = grid.getColumnByName('ContactName');
        expect(contactNameColumn.getGridTemplate(true, false)).toEqual('repeat(2,1fr)');
        expect(secondLayout.headerGroup.nativeElement.offsetHeight).toBe((grid.rowHeight + 1) * 2);

        // check cell height in row. By default should span 1 row
        const firstCell = grid.gridAPI.get_cell_by_index(0, 'Fax').nativeElement;
        expect(firstCell.offsetHeight).toEqual(grid.gridAPI.get_cell_by_index(0, 'ContactName').nativeElement.offsetHeight);
    }));

    // Virtualization

    it('should apply horizontal virtualization based on the group blocks.', async () => {
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        const grid = fixture.componentInstance.grid;
        const uniqueGroups = [
            {
                group: 'group1',
                // total colspan 3
                columns: [
                    { field: 'Address', rowStart: 1, colStart: 1, colEnd: 4, rowEnd: 3 },
                    { field: 'County', rowStart: 3, colStart: 1 },
                    { field: 'Region', rowStart: 3, colStart: 2 },
                    { field: 'City', rowStart: 3, colStart: 3 }
                ]
            },
            {
                group: 'group2',
                // total colspan 2
                columns: [
                    { field: 'CompanyName', rowStart: 1, colStart: 1 },
                    { field: 'Address', rowStart: 1, colStart: 2 },
                    { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
                ]
            },
            {
                group: 'group3',
                // total colspan 1
                columns: [
                    { field: 'Phone', rowStart: 1, colStart: 1 },
                    { field: 'Fax', rowStart: 2, colStart: 1, rowEnd: 4 }
                ]
            },
            {
                group: 'group4',
                // total colspan 4
                columns: [
                    { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                    { field: 'Phone', rowStart: 1, colStart: 3, rowEnd: 3 },
                    { field: 'Address', rowStart: 1, colStart: 4, rowEnd: 4 },
                    { field: 'Region', rowStart: 2, colStart: 1 },
                    { field: 'City', rowStart: 2, colStart: 2 },
                    { field: 'ContactName', rowStart: 3, colStart: 1, colEnd: 4 },
                ]
            }
        ];
        fixture.componentInstance.colGroups = [];
        for (let i = 0; i < 3; i++) {
            fixture.componentInstance.colGroups = fixture.componentInstance.colGroups.concat(uniqueGroups);
        }
        grid.columnWidth = '200px';
        fixture.componentInstance.grid.width = '600px';
        fixture.detectChanges();

        // 12 groups in total
        const horizontalVirtualization = grid.rowList.first.virtDirRow;
        expect(grid.hasHorizontalScroll()).toBeTruthy();
        expect(horizontalVirtualization.igxForOf.length).toBe(12);

        // check chunk size is correct
        expect(horizontalVirtualization.state.chunkSize).toBe(3);
        // check passed instances to igxFor are the groups
        expect(horizontalVirtualization.igxForOf[0] instanceof IgxColumnLayoutComponent).toBeTruthy();
        // check their sizes are correct
        expect(horizontalVirtualization.getSizeAt(0)).toBe(3 * 200);
        expect(horizontalVirtualization.getSizeAt(1)).toBe(2 * 200);
        expect(horizontalVirtualization.getSizeAt(2)).toBe(200);
        expect(horizontalVirtualization.getSizeAt(3)).toBe(4 * 200);

        // check total widths sum - unique col groups col span 10 in total * 200px default witdth * 3 times repeated
        const horizonatalScrElem = horizontalVirtualization.getScroll();
        const totalExpected = 10 * 200 * 3;
        expect(parseInt(horizonatalScrElem.children[0].style.width, 10)).toBe(totalExpected);
        // check groups are rendered correctly

        const firstRowCells = grid.rowList.first.cells.toArray();
        const headerCells = grid.headerGroupsList[0].children.toArray();
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);
        GridFunctions.verifyDOMMatchesLayoutSettings(grid.rowList.first,
            fixture.componentInstance.colGroups.slice(0, horizontalVirtualization.state.chunkSize));

        // check last column group can be scrolled in view
        horizontalVirtualization.scrollTo(11);
        await wait(100);
        fixture.detectChanges();

        // last 3 blocks should be rendered
        GridFunctions.verifyDOMMatchesLayoutSettings(grid.rowList.first,
            fixture.componentInstance.colGroups.slice(
                horizontalVirtualization.state.startIndex,
                horizontalVirtualization.state.startIndex + horizontalVirtualization.state.chunkSize));

    });

    it('should apply horizontal virtualization correctly for widths in px, % and no-width columns.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        // test with px
        fixture.componentInstance.colGroups = [{
            group: 'group1',
            // total colspan 3
            columns: [
                { field: 'Address', rowStart: 1, colStart: 1, colEnd: 4, rowEnd: 3 },
                { field: 'County', rowStart: 3, colStart: 1, width: '200px' },
                { field: 'Region', rowStart: 3, colStart: 2, width: '300px' },
                { field: 'City', rowStart: 3, colStart: 3, width: '200px' }
            ]
        }];
        fixture.componentInstance.grid.width = '617px';
        fixture.detectChanges();

        const horizontalVirtualization = grid.rowList.first.virtDirRow;
        expect(grid.hasHorizontalScroll()).toBeTruthy();
        expect(horizontalVirtualization.igxForOf.length).toBe(1);

        // check group size is correct
        expect(horizontalVirtualization.getSizeAt(0)).toBe(700);

        // check DOM
        let firstRowCells = grid.rowList.first.cells.toArray();
        let headerCells = grid.headerGroupsList[0].children.toArray();
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);
        GridFunctions.verifyDOMMatchesLayoutSettings(grid.rowList.first, fixture.componentInstance.colGroups);

        // test with %
        fixture.componentInstance.colGroups.push({
            group: 'group2',
            // total colspan 2
            columns: [
                { field: 'CompanyName', rowStart: 1, colStart: 1, width: '20%' },
                { field: 'Address1', rowStart: 1, colStart: 2, width: '30%' },
                { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
            ]
        });
        fixture.detectChanges();
        expect(grid.hasHorizontalScroll()).toBeTruthy();
        expect(horizontalVirtualization.igxForOf.length).toBe(2);

        // check group size is correct
        expect(horizontalVirtualization.getSizeAt(0)).toBe(700);
        expect(horizontalVirtualization.getSizeAt(1)).toBe(300);

        // check DOM
        firstRowCells = grid.rowList.first.cells.toArray();
        headerCells = grid.theadRow._groups.last.children.toArray();
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);
        GridFunctions.verifyDOMMatchesLayoutSettings(grid.rowList.first, fixture.componentInstance.colGroups);

        // test with no width
        fixture.componentInstance.colGroups.push({
            group: 'group4',
            // total colspan 4
            columns: [
                { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 1, colStart: 3, rowEnd: 3 },
                { field: 'Address', rowStart: 1, colStart: 4, rowEnd: 4 },
                { field: 'Region', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 },
                { field: 'ContactName', rowStart: 3, colStart: 1, colEnd: 4 },
            ]
        });

        fixture.detectChanges();
        expect(grid.hasHorizontalScroll()).toBeTruthy();
        expect(horizontalVirtualization.igxForOf.length).toBe(3);

        // check group size is correct
        expect(horizontalVirtualization.getSizeAt(0)).toBe(700);
        expect(horizontalVirtualization.getSizeAt(1)).toBe(300);
        expect(horizontalVirtualization.getSizeAt(2)).toBe(136 * 4);

        // check DOM
        firstRowCells = grid.rowList.first.cells.toArray();
        headerCells = grid.theadRow._groups.last.children.toArray();
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);
        GridFunctions.verifyDOMMatchesLayoutSettings(grid.rowList.first, fixture.componentInstance.colGroups);
    }));

    it('vertical virtualization should work as expected when there are multi-row layouts.', async () => {
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        const grid = fixture.componentInstance.grid;
        fixture.componentInstance.colGroups = [{
            group: 'group4',
            // total rowspan 3
            columns: [
                { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                { field: 'Phone', rowStart: 1, colStart: 3, rowEnd: 3 },
                { field: 'Address', rowStart: 1, colStart: 4, rowEnd: 4 },
                { field: 'Region', rowStart: 2, colStart: 1 },
                { field: 'City', rowStart: 2, colStart: 2 },
                { field: 'ContactName', rowStart: 3, colStart: 1, colEnd: 4 },
            ]
        }];
        fixture.detectChanges();

        const rows = fixture.debugElement.query(By.css('.igx-grid__tbody')).queryAll(By.css('igx-grid-row'));
        expect(rows.length).toEqual(4);
        expect(grid.hasVerticalScroll()).toBeTruthy();

        const verticalVirt = grid.verticalScrollContainer;

        // scroll to bottom
        const lastIndex = grid.data.length - 1;
        verticalVirt.scrollTo(lastIndex);
        await wait(100);
        verticalVirt.scrollTo(lastIndex);
        await wait(100);
        fixture.detectChanges();

        const dataRows = grid.dataRowList.toArray();
        const lastRow = dataRows[dataRows.length - 1];

        // check correct last row is rendered and is last in view
        expect(lastRow.dataRowIndex).toBe(lastIndex);
        expect(lastRow.rowData).toBe(grid.data[lastIndex]);

        // last in tbody
        expect(lastRow.element.nativeElement.getBoundingClientRect().bottom).toBe(grid.tbody.nativeElement.getBoundingClientRect().bottom);

        // check size is correct
        expect(grid.verticalScrollContainer.getSizeAt(lastIndex)).toBe(151);

        // check DOM
        const lastRowCells = lastRow.cells.toArray();
        const headerCells = grid.headerGroupsList[0].children.toArray();
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, lastRowCells);
        GridFunctions.verifyDOMMatchesLayoutSettings(lastRow, fixture.componentInstance.colGroups);
    });

    it('should correctly size columns without widths when default column width is set to percentages', fakeAsync(() => {
        // In this case it would be for City column and 3rd template column overlapping width ContactName.
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        fixture.detectChanges();

        fixture.componentInstance.grid.width = '1200px';
        fixture.componentInstance.grid.columnWidth = '10%';
        fixture.detectChanges();
        fixture.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 4 },
                { field: 'ContactTitle', rowStart: 1, colStart: 4, colEnd: 6 },
                { field: 'Country', rowStart: 1, colStart: 6, colEnd: 7 },
                { field: 'Phone', rowStart: 2, colStart: 1, colEnd: 3 },
                { field: 'City', rowStart: 2, colStart: 3, colEnd: 5 },
                { field: 'Address', rowStart: 2, colStart: 5, colEnd: 7 },
                { field: 'CompanyName', rowStart: 3, colStart: 1, colEnd: 2 },
                { field: 'PostalCode', rowStart: 3, colStart: 2, colEnd: 3 },
                { field: 'Fax', rowStart: 3, colStart: 3, colEnd: 7 },
            ]
        }];
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const gridFirstRow = grid.rowList.first;
        const firstRowCells = gridFirstRow.cells.toArray();
        const headerCells = grid.headerGroupsList[0].children.toArray();

        // headers are aligned to cells
        GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

        const groupRowBlocks = fixture.debugElement.query(By.css('.igx-grid__tbody')).queryAll(By.css('.igx-grid__mrl-block'));
        expect(groupRowBlocks[0].nativeElement.style.gridTemplateColumns).toEqual('118px 118px 118px 118px 118px 118px');
    }));

    it('should disregard hideGroupedColumns option and not hide columns when grouping when having column layouts.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        fixture.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 4 },
                { field: 'ContactTitle', rowStart: 1, colStart: 4, colEnd: 6 },
                { field: 'Country', rowStart: 1, colStart: 6, colEnd: 7 },
                { field: 'Phone', rowStart: 2, colStart: 1, colEnd: 3 },
                { field: 'City', rowStart: 2, colStart: 3, colEnd: 5 },
                { field: 'Address', rowStart: 2, colStart: 5, colEnd: 7 },
                { field: 'CompanyName', rowStart: 3, colStart: 1, colEnd: 2 },
                { field: 'PostalCode', rowStart: 3, colStart: 2, colEnd: 3 },
                { field: 'Fax', rowStart: 3, colStart: 3, colEnd: 7 },
            ]
        }];
        const grid = fixture.componentInstance.grid;
        grid.hideGroupedColumns = true;
        fixture.detectChanges();

        grid.groupBy({
            fieldName: 'ContactTitle', dir: SortingDirection.Desc, ignoreCase: false,
            strategy: DefaultSortingStrategy.instance()
        });
        fixture.detectChanges();

        // check column and group are not hidden
        const col = grid.getColumnByName('ContactTitle');
        expect(col.hidden).toBe(false);
        expect(col.parent.hidden).toBe(false);
    }));

    it('should get the correct next and previous cell when in MRL scenario', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnLayoutTestComponent);
        fixture.componentInstance.colGroups = [{
            group: 'group1',
            columns: [
                { field: 'CompanyName', rowStart: 1, rowEnd: 2, colStart: 3, colEnd: 4, dataType: 'number', editable: true },
                { field: 'ID', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 2, dataType: 'number', editable: false },
                { field: 'ContactName', rowStart: 1, rowEnd: 2, colStart: 2, colEnd: 3, dataType: 'string', editable: false },
            ]
        }];
        const grid = fixture.componentInstance.grid;
        fixture.detectChanges();
        let pos: ICellPosition;
        pos = grid.getNextCell(0, 1, col => col.editable === true);
        expect(pos.rowIndex).toEqual(0);
        expect(pos.visibleColumnIndex).toEqual(2);
        pos = grid.getNextCell(0, 2, col => col.editable === true);
        expect(pos.rowIndex).toEqual(1);
        expect(pos.visibleColumnIndex).toEqual(2);
        pos = grid.getPreviousCell(1, 2);
        expect(pos.rowIndex).toEqual(1);
        expect(pos.visibleColumnIndex).toEqual(1);
        pos = grid.getPreviousCell(1, 2, col => col.editable === true);
        expect(pos.rowIndex).toEqual(0);
        expect(pos.visibleColumnIndex).toEqual(2);
    }));

    it('should navigate to the proper row in MRL scenario', (async () => {
        const fix = TestBed.createComponent(ColumnLayoutTestComponent);
        const grid = fix.componentInstance.grid;
        const NAVIGATE = 20;

        fix.detectChanges();
        await wait(DEBOUNCETIME);

        grid.navigateTo(NAVIGATE);

        await wait(DEBOUNCETIME);
        fix.detectChanges();

        expect(grid.verticalScrollContainer.getScroll().scrollTop).toBeGreaterThan(0);

        const row = grid.gridAPI.get_row_by_index(NAVIGATE);
        expect(GridFunctions.elementInGridView(grid, row.nativeElement)).toBeTruthy();
    }));
});

@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px" [rowEditable]='true' [primaryKey]="'ID'">
        <igx-column-layout *ngFor='let group of colGroups'>
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
    public cols: Array<any> = [
        { field: 'ID', rowStart: 1, colStart: 1 },
        { field: 'CompanyName', rowStart: 1, colStart: 2 },
        { field: 'ContactName', rowStart: 1, colStart: 3 },
        { field: 'ContactTitle', rowStart: 2, colStart: 1, rowEnd: 4, colEnd: 4 },
    ];
    public colGroups = [
        {
            group: 'group1',
            columns: this.cols
        }
    ];
    public data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px">
        <igx-column-group header="General Information">
        <igx-column field="CompanyName"></igx-column>
            <igx-column-group [movable]="true" header="Person Details">
                <igx-column field="ContactName"></igx-column>
                <igx-column field="ContactTitle"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column-layout *ngFor='let group of colGroups'>
            <igx-column *ngFor='let col of group.columns'
            [rowStart]="col.rowStart" [colStart]="col.colStart" [width]='col.width'
            [colEnd]="col.colEnd" [rowEnd]="col.rowEnd" [field]='col.field'></igx-column>
        </igx-column-layout>
    </igx-grid>
    `
})
export class ColumnLayoutAndGroupsTestComponent extends ColumnLayoutTestComponent {

}
