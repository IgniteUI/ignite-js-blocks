import { Component, DebugElement, TemplateRef, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './public_api';
import { GridTemplateStrings, ColumnDefinitions } from '../../test-utils/template-strings.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import {
    ColumnHiddenFromMarkupComponent,
    ColumnCellFormatterComponent,
    DynamicColumnsComponent,
    GridAddColumnComponent,
    IgxGridCurrencyColumnComponent,
    IgxGridPercentColumnComponent,
    IgxGridDateTimeColumnComponent
} from '../../test-utils/grid-samples.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { getLocaleCurrencySymbol } from '@angular/common';
import { GridFunctions, GridSummaryFunctions } from '../../test-utils/grid-functions.spec';
import { IgxDateTimeEditorDirective } from '../../directives/date-time-editor/date-time-editor.directive';

describe('IgxGrid - Column properties #grid', () => {

    const COLUMN_HEADER_CLASS = '.igx-grid-th';
    const COLUMN_HEADER_GROUP_CLASS = '.igx-grid-thead__item';

    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                ColumnsFromIterableComponent,
                TemplatedColumnsComponent,
                TemplatedInputColumnsComponent,
                TemplatedContextInputColumnsComponent,
                ColumnCellFormatterComponent,
                ColumnHaederClassesComponent,
                ColumnHiddenFromMarkupComponent,
                DynamicColumnsComponent,
                GridAddColumnComponent,
                IgxGridCurrencyColumnComponent,
                IgxGridPercentColumnComponent,
                IgxGridDateTimeColumnComponent
            ],
            imports: [IgxGridModule, NoopAnimationsModule]
        });
    }));

    it('should correctly initialize column templates', () => {
        const fix = TestBed.createComponent(TemplatedColumnsComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;

        const headerSpans: DebugElement[] = fix.debugElement.queryAll(By.css('.header'));
        const cellSpans: DebugElement[] = fix.debugElement.queryAll(By.css('.cell'));

        grid.columnList.forEach((column) => expect(column.bodyTemplate).toBeDefined());
        grid.columnList.forEach((column) => expect(column.headerTemplate).toBeDefined());

        headerSpans.forEach((span) => expect(span.nativeElement.textContent).toMatch('Header text'));
        cellSpans.forEach((span) => expect(span.nativeElement.textContent).toMatch('Cell text'));
    });

    it('should provide a way to change templates dynamically', () => {
        const fix = TestBed.createComponent(TemplatedColumnsComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;

        grid.columnList.forEach((column) => column.headerTemplate = fix.componentInstance.newHeaderTemplate);
        grid.columnList.forEach((column) => column.bodyTemplate = fix.componentInstance.newCellTemplate);

        fix.detectChanges();

        const headerSpans: DebugElement[] = fix.debugElement.queryAll(By.css('.new-header'));
        const cellSpans: DebugElement[] = fix.debugElement.queryAll(By.css('.new-cell'));

        headerSpans.forEach((span) => expect(span.nativeElement.textContent).toMatch('New header text'));
        cellSpans.forEach((span) => expect(span.nativeElement.textContent).toMatch('New cell text'));
    });

    it('should reflect column hiding correctly in the DOM dynamically', () => {
        const fix = TestBed.createComponent(TemplatedColumnsComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;

        grid.columnList.first.hidden = true;
        fix.detectChanges();

        expect(grid.visibleColumns.length).toEqual(1);
        expect(grid.visibleColumns[0].field).toEqual('Name');
        expect(fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS)).length).toEqual(1);

        grid.columnList.first.hidden = false;
        fix.detectChanges();

        expect(grid.visibleColumns.length).toEqual(2);
        expect(grid.visibleColumns[0].field).toEqual('ID');
        expect(fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS)).length).toEqual(2);
    });

    it('should reflect column hiding correctly in the DOM from markup declaration', () => {
        const fix = TestBed.createComponent(ColumnHiddenFromMarkupComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        expect(grid.visibleColumns.length).toEqual(0);
        expect(fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS)).length).toEqual(0);

        grid.columnList.first.hidden = false;
        fix.detectChanges();

        expect(grid.visibleColumns.length).toEqual(1);
        expect(fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS)).length).toEqual(1);
    });

    it('should support providing a custom formatter for cell values', () => {
        const fix = TestBed.createComponent(ColumnCellFormatterComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const formatter = fix.componentInstance.multiplier;

        expect(grid.columnList.first.formatter).toBeDefined();

        for (let i = 0; i < 3; i++) {
            const cell = grid.gridAPI.get_cell_by_index(i, 'ID');
            expect(cell.nativeElement.textContent).toMatch(formatter(cell.value));
        }
    });

    it('should reflect the column in the DOM based on its index', () => {
        const fix = TestBed.createComponent(ColumnCellFormatterComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        let headers: DebugElement[];

        expect(grid.columnList.first.field).toMatch('ID');
        expect(grid.columnList.last.field).toMatch('Name');

        headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        expect(headers[0].nativeElement.textContent).toMatch('ID');
        expect(headers[1].nativeElement.textContent).toMatch('Name');

        // Swap columns
        grid.moveColumn(grid.columnList.first, grid.columnList.last);
        fix.detectChanges();

        expect(grid.columnList.first.field).toMatch('Name');
        expect(grid.columnList.last.field).toMatch('ID');

        headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        expect(headers[0].nativeElement.textContent).toMatch('Name');
        expect(headers[1].nativeElement.textContent).toMatch('ID');
    });

    it('should support adding and removing columns through a declared iterable', fakeAsync(/** columnList.changes rAF */() => {
        const fix = TestBed.createComponent(ColumnsFromIterableComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;

        expect(grid.columnList.length).toEqual(2);

        fix.componentInstance.columns.push('MyNewColumn');
        fix.detectChanges();

        expect(grid.columnList.length).toEqual(3);
        expect(grid.columnList.last.field).toMatch('MyNewColumn');

        fix.componentInstance.columns.pop();
        fix.detectChanges();

        expect(grid.columnList.length).toEqual(2);
        expect(grid.columnList.last.field).toMatch('Name');
    }));

    it('should add new column at the correct visible index', fakeAsync(() => {
        const fix = TestBed.createComponent(GridAddColumnComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        const maxVindex = fix.componentInstance.columns.length - 1;

        // add to unpinned area
        fix.componentInstance.columns.push({ field: 'City', width: 150, movable: true, type: 'string' });
        fix.detectChanges();

        let cityCol = grid.getColumnByName('City');
        expect(cityCol.visibleIndex).toEqual(maxVindex + 1);

        // remove the newly added column
        fix.componentInstance.columns.pop();
        fix.detectChanges();

        cityCol = grid.getColumnByName('City');
        expect(cityCol).not.toBeDefined();

         // add to pinned area
        fix.componentInstance.columns.push({ field: 'City', width: 150, movable: true, type: 'string', pinned: true });
        fix.detectChanges();

        cityCol = grid.getColumnByName('City');
        expect(cityCol.visibleIndex).toEqual( 1);
    }));

    it('should apply columnWidth on columns that don\'t have explicit width', () => {
        const fix = TestBed.createComponent(ColumnCellFormatterComponent);
        fix.componentInstance.grid.columnWidth = '200px';
        fix.detectChanges();
        const cols = fix.componentInstance.grid.columnList;

        cols.forEach((item) => {
            expect(item.width).toEqual('200px');
        });
        const headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));
        expect(headers[0].nativeElement.style['min-width']).toEqual('200px');
    });

    it('headers and cells classes should be correct after scroll horizontal', async () => {
        // Use setTimeout because when scroll the grid whenStable does not work
        const fix = TestBed.createComponent(ColumnHaederClassesComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        const CELL_CSS_CLASS = '.igx-grid__td';
        const COLUMN_NUMBER_CLASS = 'igx-grid-th--number';
        const CELL_NUMBER_CLASS = 'igx-grid__td--number';

        // Verify haeder clases
        let headers: DebugElement[];
        let allCells: DebugElement[];

        allCells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
        allCells.forEach((cell) => expect(cell.nativeElement.className.indexOf(CELL_NUMBER_CLASS)).toBeGreaterThan(-1));
        expect(allCells[3].nativeElement.className.indexOf('headerAlignSyle')).toBeGreaterThan(-1);

        headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        headers.forEach((header) => expect(header.nativeElement.className.indexOf(COLUMN_NUMBER_CLASS)).toBeGreaterThan(-1));
        expect(headers[2].nativeElement.className.indexOf('headerAlignSyle')).toBeGreaterThan(-1);
        grid.headerContainer.getScroll().scrollLeft = 200;
        await wait(100);
        fix.detectChanges();
        headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        headers.forEach((header) => expect(header.nativeElement.className.indexOf(COLUMN_NUMBER_CLASS)).toBeGreaterThan(-1));
        expect(headers[0].nativeElement.className.indexOf('headerAlignSyle')).toBeGreaterThan(-1);

        allCells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
        allCells.forEach((cell) => expect(cell.nativeElement.className.indexOf(CELL_NUMBER_CLASS)).toBeGreaterThan(-1));
        expect(allCells[1].nativeElement.className.indexOf('headerAlignSyle')).toBeGreaterThan(-1);

        grid.headerContainer.getScroll().scrollLeft = 0;
        await wait(100);
        fix.detectChanges();
        headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        headers.forEach((header) => expect(header.nativeElement.className.indexOf(COLUMN_NUMBER_CLASS)).toBeGreaterThan(-1));
        expect(headers[2].nativeElement.className.indexOf('headerAlignSyle')).toBeGreaterThan(-1);

        allCells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
        allCells.forEach((cell) => expect(cell.nativeElement.className.indexOf(CELL_NUMBER_CLASS)).toBeGreaterThan(-1));
        expect(allCells[3].nativeElement.className.indexOf('headerAlignSyle')).toBeGreaterThan(-1);
    });

    it('column width should be adjusted after a column has been hidden', () => {
        const fix = TestBed.createComponent(ColumnsFromIterableComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        grid.width = '600px';
        fix.detectChanges();

        expect(grid.calcWidth).toBe(600);
        expect(grid.columns[0].width).toBe('300px');
        expect(!grid.columns[0].widthSetByUser);
        expect(grid.columns[1].width).toBe('300px');
        expect(!grid.columns[1].widthSetByUser);
        grid.columns[0].hidden = true;
        fix.detectChanges();

        expect(grid.columns[1].width).toBe('600px');
        grid.columns[0].hidden = false;
        fix.detectChanges();

        expect(grid.columns[0].width).toBe('300px');
        expect(grid.columns[1].width).toBe('300px');
    });

    it('should support passing templates through the markup as an input property', () => {
        const fixture = TestBed.createComponent(TemplatedInputColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.instance;

        grid.getColumnByName('Name')._cells.forEach(c =>
            expect(c.nativeElement.querySelector('.customCellTemplate')).toBeDefined());

        grid.headerCellList.forEach(header =>
            expect(header.nativeElement.querySelector('.customHeaderTemplate')).toBeDefined());

        const cell = grid.getCellByColumn(0, 'ID');
        cell.editMode = true;
        fixture.detectChanges();

        expect(grid.gridAPI.get_cell_by_index(0, 'ID').nativeElement.querySelector('.customEditorTemplate')).toBeDefined();

    });

    it('should support passing properties through the additionalTemplateContext input property', () => {
        const fixture = TestBed.createComponent(TemplatedContextInputColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.instance;
        const contextObject = {property1: 'cellContent', property2: 'cellContent1'};
        const firstColumn = grid.columns[0];
        const secondColumn = grid.columns[1];

        expect(firstColumn.additionalTemplateContext).toEqual(contextObject);
        expect(firstColumn._cells[0].nativeElement.innerText).toEqual(contextObject.property1);
        expect(secondColumn._cells[0].nativeElement.innerText).toEqual(contextObject.property2);
    });

    it('should apply column\'s formatter programmatically', () => {
        const expectedVal = ['Johny', 'Sally', 'Tim'];
        const expectedValToLower = ['johny', 'sally', 'tim'];
        const fix = TestBed.createComponent(ColumnsFromIterableComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const col = grid.columns[1];
        expect(col.formatter).toBeUndefined();
        const rowCount = grid.rowList.length;
        for (let i = 0; i < rowCount; i++) {
            // Check the display value
            expect(grid.gridAPI.get_cell_by_index(i, 'Name').nativeElement.textContent).toBe(expectedVal[i]);
            // Check the cell's value is not changed
            expect(grid.getCellByColumn(i, 'Name').value).toBe(expectedVal[i]);
        }

        // Apply formatter to the last column
        col.formatter = (val: string) => val.toLowerCase();
        fix.detectChanges();

        expect(col.formatter).toBeTruthy();
        expect(col.formatter).toBeDefined();
        for (let i = 0; i < rowCount; i++) {
            // Check the cell's formatter value(display value)
            expect(grid.gridAPI.get_cell_by_index(i, 'Name').nativeElement.textContent).toBe(expectedValToLower[i]);
            // Check the cell's value is not changed
            expect(grid.getCellByColumn(i, 'Name').value).toBe(expectedVal[i]);
        }
    });

    it('should clear filter when a columns is removed dynamically', () => {
        const fix = TestBed.createComponent(DynamicColumnsComponent);
        fix.detectChanges();

        const columns = fix.componentInstance.columns;
        const grid = fix.componentInstance.grid;
        grid.allowFiltering = true;
        fix.detectChanges();

        expect(grid.columns.length).toBe(7);

        grid.filter('CompanyName', 'NoItemsFound', IgxStringFilteringOperand.instance().condition('contains'), true);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(0);

        expect(() => {
            fix.componentInstance.columns = columns.slice(2, columns.length - 1);
            fix.detectChanges();
        }).not.toThrow();

        expect(grid.rowList.length).toBeGreaterThan(10);
        expect(grid.columns.length).toBe(4);
    });

    it('should clear grouping when a columns is removed dynamically', () => {
        const fix = TestBed.createComponent(DynamicColumnsComponent);
        fix.detectChanges();

        const columns = fix.componentInstance.columns;
        const grid = fix.componentInstance.grid;
        grid.getColumnByName('CompanyName').groupable = true;
        grid.getColumnByName('Address').groupable = true;
        grid.getColumnByName('City').groupable = true;
        fix.detectChanges();

        grid.groupBy({
            fieldName: 'CompanyName', dir: SortingDirection.Asc, ignoreCase: false
        });

        fix.detectChanges();

        let groupRows = grid.nativeElement.querySelectorAll('igx-grid-groupby-row');

        expect(groupRows.length).toBeGreaterThan(0);

        expect(() => {
            fix.componentInstance.columns = columns.slice(2, columns.length - 1);
            fix.detectChanges();
        }).not.toThrow();

        groupRows = grid.nativeElement.querySelectorAll('igx-grid-groupby-row');

        expect(groupRows.length).toBe(0);
        expect(grid.columns.length).toBe(4);
    });

    it('should apply custom CSS bindings to the grid cells', () => {
        const fix = TestBed.createComponent(ColumnHaederClassesComponent);
        fix.detectChanges();

        const styles = {
            background: 'black',
            color: 'white'
        };

        const grid = fix.componentInstance.grid;
        grid.columns.forEach(c => c.cellStyles = styles);
        fix.detectChanges();

        const row = grid.gridAPI.get_row_by_index(0);
        row.cells.forEach(cell => expect(cell.nativeElement.getAttribute('style')).toMatch('background: black'));
    });

    it('should set title attribute on column header spans', () => {
        const fix = TestBed.createComponent(ColumnsFromIterableComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.instance;
        const idColumn = grid.getColumnByName('ID');
        const nameColumn = grid.getColumnByName('Name');

        idColumn.header = 'ID Header';
        idColumn.title = 'ID Title';
        nameColumn.header = 'Name Header';
        fix.detectChanges();

        const headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        const idHeader = headers[0].nativeElement;
        const nameHeader = headers[1].nativeElement;
        expect(idHeader.textContent).toBe('ID Header');
        expect(idHeader.firstElementChild.firstElementChild.title).toBe('ID Title');
        expect(nameHeader.textContent).toBe('Name Header');
        expect(nameHeader.firstElementChild.firstElementChild.title).toBe('Name Header');
    });

    describe('Data type currency column tests', () => {
        // NOTE: The following three tests fail only in an Ivy scenario. We should leave them running anyways
        it('should display correctly the data when column dataType is currency #ivy', () => {
            const fix = TestBed.createComponent(IgxGridCurrencyColumnComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const unitsColumn = grid.getColumnByName('UnitsInStock');

            expect(unitsColumn._cells[0].nativeElement.innerText).toEqual('$2,760');
            expect(unitsColumn._cells[5].nativeElement.innerText).toEqual('$1,098');
            expect(unitsColumn._cells[6].nativeElement.innerText).toEqual('$0');
            expect(unitsColumn._cells[8].nativeElement.innerText).toEqual('$6,998');

            unitsColumn.pipeArgs = {
                digitsInfo: '3.4-4',
                currencyCode: 'USD',
                display: 'symbol-narrow'
            };
            fix.detectChanges();

            expect(unitsColumn._cells[0].nativeElement.innerText).toEqual('$2,760.0000');
            expect(unitsColumn._cells[5].nativeElement.innerText).toEqual('$1,098.0000');
            expect(unitsColumn._cells[6].nativeElement.innerText).toEqual('$000.0000');
            expect(unitsColumn._cells[8].nativeElement.innerText).toEqual('$6,998.0000');

        });

        it('should be able to change the locale runtime  #ivy', () => {
            const fix = TestBed.createComponent(IgxGridCurrencyColumnComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const unitsColumn = grid.getColumnByName('UnitsInStock');

            expect(unitsColumn._cells[8].nativeElement.innerText).toEqual('$6,998');
            grid.locale = 'fr-FR';
            fix.detectChanges();

            expect(unitsColumn._cells[8].nativeElement.innerText).toEqual('6 998 €');
            expect(unitsColumn._cells[5].nativeElement.innerText).toEqual('1 098 €');
            expect(unitsColumn._cells[3].nativeElement.innerText).toEqual('0 €');

            grid.locale = 'ja';
            fix.detectChanges();

            expect(unitsColumn._cells[8].nativeElement.innerText).toEqual('￥6,998');
            expect(unitsColumn._cells[5].nativeElement.innerText).toEqual('￥1,098');
            expect(unitsColumn._cells[3].nativeElement.innerText).toEqual('￥0');
        });

        it('should display the currency symbol in edit mode correctly according the grid locale #ivy', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxGridCurrencyColumnComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const unitsColumn = grid.getColumnByName('UnitsInStock');
            unitsColumn.editable = true;
            fix.detectChanges();

            let firstCell = unitsColumn._cells[0];

            expect(firstCell.nativeElement.innerText).toEqual('$2,760');

            firstCell.setEditMode(true);
            fix.detectChanges();
            tick();

            let input = firstCell.nativeElement.querySelector('.igx-input-group__input');
            let prefix = firstCell.nativeElement.querySelector('igx-prefix');
            let suffix = firstCell.nativeElement.querySelector('igx-suffix');
            expect((input as any).value).toEqual('2760');
            expect((prefix as HTMLElement).innerText).toEqual(getLocaleCurrencySymbol(grid.locale));
            expect(suffix).toBeNull();

            firstCell.setEditMode(false);
            fix.detectChanges();

            grid.locale = 'fr-FR';
            fix.detectChanges();
            tick();

            firstCell = grid.gridAPI.get_cell_by_index(0, 'UnitsInStock');
            expect(grid.locale).toEqual('fr-FR');
            expect(firstCell.nativeElement.innerText).toEqual('2 760 €');

            firstCell.setEditMode(true);
            fix.detectChanges();
            tick();

            input = firstCell.nativeElement.querySelector('.igx-input-group__input');
            prefix = firstCell.nativeElement.querySelector('igx-prefix');
            suffix = firstCell.nativeElement.querySelector('igx-suffix');
            expect((input as any).value).toEqual('2760');
            expect(prefix).toBeNull();
            expect((suffix as HTMLElement).innerText).toEqual(getLocaleCurrencySymbol(grid.locale));
        }));

        it('should display summaries correctly for currency column', () => {
            const fix = TestBed.createComponent(IgxGridCurrencyColumnComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const unitsColumn = grid.getColumnByName('UnitsInStock');
            unitsColumn.hasSummary = true;
            fix.detectChanges();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '$0', '$20,000', '$39,004', '$3,900.4']);

            grid.locale = 'fr-FR';
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '0 €', '20 000 €', '39 004 €', '3 900,4 €']);
        });

        it('filtering UI list should be populated with correct values based on the currency code, locale and/or pipeArgs' ,fakeAsync(()=> {
            const fix = TestBed.createComponent(IgxGridCurrencyColumnComponent);
            tick();
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const unitsColumn = grid.getColumnByName('UnitsInStock');
            grid.allowFiltering = true;
            grid.filterMode = 'excelStyleFilter';
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, unitsColumn.field);
            tick(100);
            fix.detectChanges();

            let excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            let esfSearch = GridFunctions.getExcelFilteringSearchComponent(fix, excelMenu);
            let checkBoxes = esfSearch.querySelectorAll('igx-checkbox');

            expect((checkBoxes[1].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('$0');
            expect((checkBoxes[3].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('$198');

            GridFunctions.clickCancelExcelStyleFiltering(fix);
            fix.detectChanges();

            unitsColumn.pipeArgs = {
                digitsInfo: '3.3-3',
                currencyCode: 'EUR',
                display: 'symbol-narrow'
              };
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, unitsColumn.field);
            tick(100);
            fix.detectChanges();

            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            esfSearch = GridFunctions.getExcelFilteringSearchComponent(fix, excelMenu);
            checkBoxes = esfSearch.querySelectorAll('igx-checkbox');

            expect((checkBoxes[1].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('€000.000');
            expect((checkBoxes[3].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('€198.000');
        }));

    });

    describe('Data type percent column tests', () => {
        it('should display correctly the data when column dataType is percent', () => {
            const fix = TestBed.createComponent(IgxGridPercentColumnComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            let discountColumn = grid.getColumnByName('Discount');

            expect(discountColumn._cells[0].nativeElement.innerText).toEqual('27%');
            expect(discountColumn._cells[5].nativeElement.innerText).toEqual('2.7%');
            expect(discountColumn._cells[8].nativeElement.innerText).toEqual('12.3%');

            discountColumn.pipeArgs = {
                digitsInfo: '3.2-2',
              };
            fix.detectChanges();

            grid.sort({ fieldName: 'Discount', dir: SortingDirection.Desc, ignoreCase: false });
            fix.detectChanges();

            grid.clearSort();
            fix.detectChanges();

            discountColumn = grid.getColumnByName('Discount');
            expect(discountColumn._cells[0].nativeElement.innerText).toEqual('027.00%');
            expect(discountColumn._cells[5].nativeElement.innerText).toEqual('002.70%');
            expect(discountColumn._cells[8].nativeElement.innerText).toEqual('012.30%');
        });

        it('should be able to change the locale runtime ', () => {
            const fix = TestBed.createComponent(IgxGridPercentColumnComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            let discountColumn = grid.getColumnByName('Discount');

            expect(discountColumn._cells[8].nativeElement.innerText).toEqual('12.3%');
            grid.locale = 'fr-FR';
            fix.detectChanges();

            grid.sort({ fieldName: 'Discount', dir: SortingDirection.Desc, ignoreCase: false });
            fix.detectChanges();

            grid.clearSort();
            fix.detectChanges();

            discountColumn = grid.getColumnByName('Discount');
            expect(discountColumn._cells[8].nativeElement.innerText).toEqual('12,3 %');
            expect(discountColumn._cells[5].nativeElement.innerText).toEqual('2,7 %');
        });

        it('should preview the percent value correctly when cell is in edit mode correctly', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxGridPercentColumnComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const discountColumn = grid.getColumnByName('Discount');
            discountColumn.editable = true;
            fix.detectChanges();

            let firstCell = discountColumn._cells[0];

            expect(firstCell.nativeElement.innerText).toEqual('27%');

            firstCell.setEditMode(true);
            fix.detectChanges();
            tick();

            let input = firstCell.nativeElement.querySelector('.igx-input-group__input');
            const prefix = firstCell.nativeElement.querySelector('igx-prefix');
            let suffix = firstCell.nativeElement.querySelector('igx-suffix');
            expect((input as any).value).toEqual('0.27');
            expect(prefix).toBeNull();
            expect((suffix as HTMLElement).innerText).toEqual('27%');

            UIInteractions.clickAndSendInputElementValue(input, 0.33);
            fix.detectChanges();
            tick();

            input = firstCell.nativeElement.querySelector('.igx-input-group__input');
            suffix = firstCell.nativeElement.querySelector('igx-suffix');
            expect((input as any).value).toEqual('0.33');
            expect((suffix as HTMLElement).innerText).toEqual('33%');

            grid.gridAPI.crudService.endEdit(true);
            fix.detectChanges();

            firstCell = discountColumn._cells[0];
            expect(firstCell.nativeElement.innerText).toEqual('33%');
        }));

        it('should display summaries correctly for currency column', () => {
            const fix = TestBed.createComponent(IgxGridPercentColumnComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const discountColumn = grid.getColumnByName('Discount');
            discountColumn.hasSummary = true;
            fix.detectChanges();

            const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '-70%', '1,100%', '2,153.9%', '215.39%']);
        });

        it('filtering UI list should be populated with correct values based on the currency code, locale and/or pipeArgs' ,fakeAsync(()=> {
            const fix = TestBed.createComponent(IgxGridPercentColumnComponent);
            tick();
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const unitsColumn = grid.getColumnByName('Discount');
            grid.allowFiltering = true;
            grid.filterMode = 'excelStyleFilter';
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, unitsColumn.field);
            tick(100);
            fix.detectChanges();

            let excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            let esfSearch = GridFunctions.getExcelFilteringSearchComponent(fix, excelMenu);
            let checkBoxes = esfSearch.querySelectorAll('igx-checkbox');

            expect((checkBoxes[1].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('-70%');
            expect((checkBoxes[3].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('2.7%');

            GridFunctions.clickCancelExcelStyleFiltering(fix);
            fix.detectChanges();

            unitsColumn.pipeArgs = {
                digitsInfo: '3.3-3',
                currencyCode: 'EUR',
                display: 'symbol-narrow'
              };
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, unitsColumn.field);
            tick(100);
            fix.detectChanges();

            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            esfSearch = GridFunctions.getExcelFilteringSearchComponent(fix, excelMenu);
            checkBoxes = esfSearch.querySelectorAll('igx-checkbox');

            expect((checkBoxes[1].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('-070.000%');
            expect((checkBoxes[3].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('002.700%');
        }));

    });

    describe('DateTime and Time column tests', () => {
        it('should display correctly the data when column dataType is dateTime #ivy', () => {
            const fix = TestBed.createComponent(IgxGridDateTimeColumnComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            let orderDateColumn = grid.getColumnByName('OrderDate');

            expect(orderDateColumn._cells[0].nativeElement.innerText).toEqual('Oct 1, 2015, 11:37:22 AM');
            expect(orderDateColumn._cells[5].nativeElement.innerText).toEqual('Oct 30, 2019, 4:17:27 PM');
            expect(orderDateColumn._cells[8].nativeElement.innerText).toEqual('Aug 3, 2021, 3:15:00 PM');

            orderDateColumn.pipeArgs = { format: 'short' };
            fix.detectChanges();

            grid.sort({ fieldName: 'Discount', dir: SortingDirection.Desc, ignoreCase: false });
            fix.detectChanges();

            grid.clearSort();
            fix.detectChanges();

            orderDateColumn = grid.getColumnByName('OrderDate');
            expect(orderDateColumn._cells[0].nativeElement.innerText).toEqual('10/1/15, 11:37 AM');
            expect(orderDateColumn._cells[5].nativeElement.innerText).toEqual('10/30/19, 4:17 PM');
            expect(orderDateColumn._cells[8].nativeElement.innerText).toEqual('8/3/21, 3:15 PM');
        });

        it('should display correctly the data when column dataType is time #ivy', () => {
            const fix = TestBed.createComponent(IgxGridDateTimeColumnComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            let receiveTime = grid.getColumnByName('ReceiveTime');

            expect(receiveTime._cells[0].nativeElement.innerText).toEqual('8:37:11 AM');
            expect(receiveTime._cells[5].nativeElement.innerText).toEqual('12:47:42 PM');

            receiveTime.pipeArgs = { format: 'shortTime' };
            fix.detectChanges();

            grid.sort({ fieldName: 'Discount', dir: SortingDirection.Desc, ignoreCase: false });
            fix.detectChanges();

            grid.clearSort();
            fix.detectChanges();

            receiveTime = grid.getColumnByName('ReceiveTime');
            expect(receiveTime._cells[0].nativeElement.innerText).toEqual('8:37 AM');
            expect(receiveTime._cells[5].nativeElement.innerText).toEqual('12:47 PM');
        });

        it('DateTime: should preview the dateTime value correctly when cell is in edit mode correctly', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxGridDateTimeColumnComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const orderColumn = grid.getColumnByName('OrderDate');
            orderColumn.editable = true;
            fix.detectChanges();

            const firstCell = orderColumn._cells[0];

            expect(firstCell.nativeElement.innerText).toEqual('Oct 1, 2015, 11:37:22 AM');

            firstCell.setEditMode(true);
            fix.detectChanges();
            tick();

            const input = firstCell.nativeElement.querySelector('.igx-input-group__input');
            const prefix = firstCell.nativeElement.querySelector('igx-prefix');
            const suffix = firstCell.nativeElement.querySelector('igx-suffix');
            expect((input as any).value).toEqual('01/10/2015 11:37:22 AM');
            expect(prefix).toBeNull();
            expect(suffix).toBeNull();

            const inputElement = fix.debugElement.query(By.css('input'));
            const dateTimeEditor = inputElement.injector.get(IgxDateTimeEditorDirective);
            dateTimeEditor.value = new Date(2021, 11, 3, 15, 15, 22);
            fix.detectChanges();

            grid.endEdit(true);
            fix.detectChanges();

            expect(firstCell.nativeElement.innerText).toEqual('Dec 3, 2021, 3:15:22 PM');
        }));

        it('Time: should preview the time value correctly when cell is in edit mode correctly', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxGridDateTimeColumnComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const timeColumn = grid.getColumnByName('ReceiveTime');
            timeColumn.editable = true;
            fix.detectChanges();

            const cell = timeColumn._cells[1];

            expect(cell.nativeElement.innerText).toEqual('12:12:02 PM');

            cell.setEditMode(true);
            tick();
            fix.detectChanges();

            const input = cell.nativeElement.querySelector('.igx-input-group__input');
            const prefix = cell.nativeElement.querySelector('igx-prefix');
            const suffix = cell.nativeElement.querySelector('igx-suffix');
            expect((input as any).value).toEqual('12:12:02 PM');
            expect(prefix).not.toBeNull();
            expect(suffix).not.toBeNull();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input, true);
            fix.detectChanges();
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input, true);
            fix.detectChanges();

            grid.endEdit(true);
            fix.detectChanges();

            expect(cell.nativeElement.innerText).toEqual('10:12:02 AM');
        }));

        it('should display summaries correctly for dateTime and time column', () => {
            const fix = TestBed.createComponent(IgxGridDateTimeColumnComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const column = grid.getColumnByName('OrderDate');
            const receiveTimeColumn = grid.getColumnByName('ReceiveTime');
            column.hasSummary = true;
            receiveTimeColumn.hasSummary = true;
            fix.detectChanges();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2,
                ['Count', 'Earliest', 'Latest'], ['10', 'Mar 12, 2015, 9:31:22 PM', 'Aug 3, 2021, 3:15:00 PM']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['10', '6:40:18 AM', '8:20:24 PM']);

            column.pipeArgs = { format: 'short' };
            receiveTimeColumn.pipeArgs = { format: 'shortTime' };
            grid.sort({ fieldName: 'Discount', dir: SortingDirection.Desc, ignoreCase: false });
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2,
                ['Count', 'Earliest', 'Latest'], ['10', '3/12/15, 9:31 PM', '8/3/21, 3:15 PM']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['10', '6:40 AM', '8:20 PM']);
        });

        it('DateTime: filtering UI list should be populated with correct values based on the pipeArgs' ,fakeAsync(()=> {
            const fix = TestBed.createComponent(IgxGridDateTimeColumnComponent);
            tick();
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const orderDateColumn = grid.getColumnByName('OrderDate');
            grid.allowFiltering = true;
            grid.filterMode = 'excelStyleFilter';
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, orderDateColumn.field);
            tick(100);
            fix.detectChanges();

            let excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            let esfSearch = GridFunctions.getExcelFilteringSearchComponent(fix, excelMenu);
            let checkBoxes = esfSearch.querySelectorAll('igx-checkbox');

            expect((checkBoxes[1].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Mar 12, 2015, 9:31:22 PM');
            expect((checkBoxes[3].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Aug 18, 2016, 11:17:22 AM');

            GridFunctions.clickCancelExcelStyleFiltering(fix);
            fix.detectChanges();

            orderDateColumn.pipeArgs = {
                format: 'short'
              };
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, orderDateColumn.field);
            tick(100);
            fix.detectChanges();

            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            esfSearch = GridFunctions.getExcelFilteringSearchComponent(fix, excelMenu);
            checkBoxes = esfSearch.querySelectorAll('igx-checkbox');

            expect((checkBoxes[1].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('3/12/15, 9:31 PM');
            expect((checkBoxes[3].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('8/18/16, 11:17 AM');
        }));

        it('Time: filtering UI list should be populated with correct values based on the pipeArgs' ,fakeAsync(()=> {
            const fix = TestBed.createComponent(IgxGridDateTimeColumnComponent);
            tick();
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const timeColumn = grid.getColumnByName('ReceiveTime');
            grid.allowFiltering = true;
            fix.detectChanges();
            grid.filterMode = 'excelStyleFilter';
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, timeColumn.field);
            tick(200);
            fix.detectChanges();

            let excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            let esfSearch = GridFunctions.getExcelFilteringSearchComponent(fix, excelMenu);
            let checkBoxes = esfSearch.querySelectorAll('igx-checkbox');

            expect((checkBoxes[1].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('6:40:18 AM');
            expect((checkBoxes[3].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('12:12:02 PM');
            GridFunctions.clickCancelExcelStyleFiltering(fix);
            tick(200);
            fix.detectChanges();

            timeColumn.pipeArgs = { format: 'shortTime' };
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, timeColumn.field);
            tick(200);
            fix.detectChanges();

            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            esfSearch = GridFunctions.getExcelFilteringSearchComponent(fix, excelMenu);
            checkBoxes = esfSearch.querySelectorAll('igx-checkbox');

            expect((checkBoxes[1].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('6:40 AM');
            expect((checkBoxes[3].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('12:12 PM');
        }));

        it('DateTime: dateTime input should be disabled when try to filter based on unary conditions - today or etc. #ivy' ,fakeAsync(()=> {
            const fix = TestBed.createComponent(IgxGridDateTimeColumnComponent);
            tick();
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            const orderDateColumn = grid.getColumnByName('OrderDate');
            grid.allowFiltering = true;
            grid.filterMode = 'excelStyleFilter';
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, orderDateColumn.field);
            tick(100);
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            tick(100);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 4);
            tick(200);
            fix.detectChanges();

            const inputElement = fix.debugElement.query(By.css('igx-input-group.igx-input-group--disabled'));
            expect(inputElement).not.toBeNull();
        }));

        it('Sorting dateTime column', () => {
            const fix = TestBed.createComponent(IgxGridDateTimeColumnComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;

            const currColumn = 'OrderDate';
            grid.sort({ fieldName: currColumn, dir: SortingDirection.Asc, ignoreCase: false });
            fix.detectChanges();

            const sortedValues = [new Date(2015, 2, 12, 21, 31, 22), new Date(2015, 9, 1, 11, 37, 22), new Date(2016, 7, 18, 11, 17, 22),
                new Date(2018, 6, 14, 17, 27, 23), new Date(2019, 3, 17, 5, 5, 15), new Date(2019, 9, 30, 16, 17, 27),
                new Date(2021, 4, 11, 7, 47, 1), new Date(2021, 4, 11, 18, 37, 2),
                new Date(2021, 7, 3, 15, 15, 0), new Date(2021, 7, 3, 15, 15, 0)];

            expect(grid.rowList.length).toEqual(sortedValues.length);
            sortedValues.forEach((value, index) => {
                expect(grid.getCellByColumn(index, currColumn).value.toISOString()).toEqual(value.toISOString());
            });

            grid.sort({ fieldName: currColumn, dir: SortingDirection.Desc, ignoreCase: false });
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(sortedValues.length);
            sortedValues.forEach((value, index) => {
                expect(grid.getCellByColumn(sortedValues.length - 1 - index, currColumn).value.toISOString()).toEqual(value.toISOString());
            });
        });

        it('Sorting time column', () => {
            const fix = TestBed.createComponent(IgxGridDateTimeColumnComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;

            const currentColumn = 'ReceiveTime';
            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Asc, ignoreCase: false });
            fix.detectChanges();

            const sortedValues = ['6:40:18 AM', '8:37:11 AM', '12:12:02 PM', '12:47:42 PM', '12:47:42 PM', '2:07:12 PM',
            '2:30:00 PM', '3:30:22 PM', '3:30:30 PM', '8:20:24 PM'];

            expect(grid.rowList.length).toEqual(sortedValues.length);
            sortedValues.forEach((value, index) => {
                expect(grid.getCellByColumn(index, currentColumn).value.toLocaleTimeString()).toEqual(value);
            });

            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Desc, ignoreCase: false });
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(sortedValues.length);
            sortedValues.forEach((value, index) => {
                expect(grid.getCellByColumn(sortedValues.length - 1 - index, currentColumn).value.toLocaleTimeString()).toEqual(value);
            });
        });

    });

});

@Component({
    template: GridTemplateStrings.declareGrid('', '', ColumnDefinitions.iterableComponent)
})
export class ColumnsFromIterableComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;

    public data = SampleTestData.personIDNameData();
    public columns = ['ID', 'Name'];
}

@Component({
    template: GridTemplateStrings.declareGrid('', '', ColumnDefinitions.columnTemplates) +
        `<ng-template #newHeader>
            <span class="new-header">New header text</span>
        </ng-template>

        <ng-template #newCell>
            <span class="new-cell">New cell text</span>
        </ng-template>`
})
export class TemplatedColumnsComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;

    @ViewChild('newHeader', { read: TemplateRef, static: true })
    public newHeaderTemplate: TemplateRef<any>;

    @ViewChild('newCell', { read: TemplateRef, static: true })
    public newCellTemplate: TemplateRef<any>;

    public data = SampleTestData.personIDNameData();
}

@Component({
    template: `
        <igx-grid [data]="data">
            <igx-column *ngFor="let field of columns" [field]="field" [editable]="true"
                [cellTemplate]="cell" [headerTemplate]="header"
                [cellEditorTemplate]="editor">
            </igx-column>
        </igx-grid>

        <ng-template #cell let-value>
            <span class="customCellTemplate">{{ value }}</span>
        </ng-template>

        <ng-template #header let-column>
            <span class="customHeaderTemplate">{{ column.field }}</span>
        </ng-template>

        <ng-template #editor let-value>
            <span class="customEditorTemplate">{{ value }}</span>
        </ng-template>
    `
})
export class TemplatedInputColumnsComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;

    public data = SampleTestData.personIDNameRegionData();
    public columns = Object.keys(this.data[0]);
}


@Component({
    template: `
        <igx-grid [data]="data">
            <igx-column [additionalTemplateContext]="contextObject" field="FirstName">
                <ng-template igxCell let-cell="cell">
                    {{ cell.column.additionalTemplateContext.property1 }}
                </ng-template>
            </igx-column>
            <igx-column [additionalTemplateContext]="contextObject">
                <ng-template igxCell let-cell="cell" let-props="additionalTemplateContext">
                    {{ props.property2 }}
                </ng-template>
            </igx-column>
        </igx-grid>
    `
})
export class TemplatedContextInputColumnsComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;
    public contextObject = {property1: 'cellContent', property2: 'cellContent1'};

    public data = SampleTestData.personNameAgeData();
}

@Component({
    template: `
        <igx-grid [data]="data" height="500px" width="400px">
            <igx-column field="ProductId"  dataType="number" width="100px"></igx-column>
            <igx-column field="Number1" dataType="number" width="100px"></igx-column>
            <igx-column field="Number2" dataType="number" width="100px" [headerClasses]="'headerAlignSyle'"></igx-column>
            <igx-column field="Number3" dataType="number" width="100px" [cellClasses]="{'headerAlignSyle':true}"></igx-column>
            <igx-column field="Number4" dataType="number" width="100px"></igx-column>
            <igx-column field="Number5" dataType="number" width="100px"></igx-column>
            <igx-column field="Number6" dataType="number" width="100px"></igx-column>
            <igx-column field="Number7" dataType="number" width="100px"></igx-column>
        </igx-grid>
    `,
    styles: [`.headerAlignSyle {text-align: right !important;}`]
})
export class ColumnHaederClassesComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    public data = [
        { ProductId: 1, Number1: 11, Number2: 10, Number3: 5, Number4: 3, Number5: 4, Number6: 6, Number7: 7 }
    ];
}
