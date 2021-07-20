import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProductsComponent, ColumnSelectionGroupTestComponent } from '../../test-utils/grid-samples.spec';
import { GridSelectionFunctions, GridFunctions } from '../../test-utils/grid-functions.spec';
import { IgxColumnComponent } from '../columns/column.component';
import { IColumnSelectionEventArgs } from '../common/events';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { GridSelectionMode } from '../common/enums';

const SELECTED_COLUMN_CLASS = 'igx-grid-th--selected';
const SELECTED_COLUMN_CELL_CLASS = 'igx-grid__td--column-selected';
const SELECTED_FILTER_CELL_CLASS = 'igx-grid__filtering-cell--selected';

const selectedData = () => ([
    { ProductID: 1, ProductName: 'Chai' },
    { ProductID: 2, ProductName: 'Aniseed Syrup' },
    { ProductID: 3, ProductName: 'Chef Antons Cajun Seasoning' },
    { ProductID: 4, ProductName: 'Grandmas Boysenberry Spread' },
    { ProductID: 5, ProductName: 'Uncle Bobs Dried Pears' },
    { ProductID: 6, ProductName: 'Northwoods Cranberry Sauce' },
    { ProductID: 7, ProductName: 'Queso Cabrales' },
    { ProductID: 8, ProductName: 'Tofu' },
    { ProductID: 9, ProductName: 'Teatime Chocolate Biscuits' },
    { ProductID: 10, ProductName: 'Chocolate' }
]);

describe('IgxGrid - Column Selection #grid', () => {

    let fix: ComponentFixture<any>;
    let grid: IgxGridComponent;

    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                ProductsComponent,
                ColumnSelectionGroupTestComponent
            ],
            imports: [IgxGridModule, NoopAnimationsModule]
        });
    }));

    describe('Base tests: ', () => {
        let colProductName: IgxColumnComponent;
        let colProductID: IgxColumnComponent;
        let colInStock: IgxColumnComponent;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(ProductsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            colProductName = grid.getColumnByName('ProductName');
            colProductID = grid.getColumnByName('ProductID');
            colInStock = grid.getColumnByName('InStock');
            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();
        }));

        it('setting selected and selectable properties ', () => {
            spyOn(grid.columnSelected, 'emit').and.callThrough();
            grid.columnList.forEach(column => {
                expect(column.selectable).toBeTruthy();
                expect(column.selected).toBeFalsy();
            });

            let col = grid.getColumnByName('ProductID');
            col.selected = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(col);

            col = grid.getColumnByName('ProductName');
            col.selectable = false;
            fix.detectChanges();

            expect(col.selectable).toBeFalsy();

            // Verify that when column is not selectable cannot select it.
            col.selected = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(col, false);
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(0);
        });

        it('selecting a column with mouse click', () => {
            spyOn(grid.columnSelected, 'emit').and.callThrough();
            colProductName.selectable = false;
            fix.detectChanges();

            GridFunctions.clickColumnHeaderUI('ProductID', fix);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(1);
            let args: IColumnSelectionEventArgs = {
                oldSelection: [],
                newSelection: ['ProductID'],
                added: ['ProductID'],
                removed: [],
                event: jasmine.anything() as any,
                cancel: false
            };
            expect(grid.columnSelected.emit).toHaveBeenCalledWith(args);

            GridFunctions.clickColumnHeaderUI('ProductName', fix);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName, false);
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(1);

            GridFunctions.clickColumnHeaderUI('InStock', fix);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colInStock);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID, false);
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(2);
            args = {
                oldSelection: ['ProductID'],
                newSelection: ['InStock'],
                added: ['InStock'],
                removed: ['ProductID'],
                event: jasmine.anything() as any,
                cancel: false
            };
            expect(grid.columnSelected.emit).toHaveBeenCalledWith(args);

            GridFunctions.clickColumnHeaderUI('InStock', fix);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colInStock, false);
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(3);
            args = {
                oldSelection: ['InStock'],
                newSelection: [],
                added: [],
                removed: ['InStock'],
                event: jasmine.anything() as any,
                cancel: false
            };
            expect(grid.columnSelected.emit).toHaveBeenCalledWith(args);
        });

        it('verify selectable class is applied when hover a column', () => {
            colProductName.selectable = false;
            fix.detectChanges();

            const productIDHeader = GridFunctions.getColumnHeader('ProductID', fix);
            productIDHeader.triggerEventHandler('pointerenter', null);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnHeaderHasSelectableClass(productIDHeader);

            productIDHeader.triggerEventHandler('pointerleave', null);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnHeaderHasSelectableClass(productIDHeader, false);

            const productNameHeader = GridFunctions.getColumnHeader('ProductName', fix);
            productNameHeader.triggerEventHandler('pointerenter', null);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnHeaderHasSelectableClass(productNameHeader, false);

            productNameHeader.triggerEventHandler('pointerleave', null);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnHeaderHasSelectableClass(productIDHeader, false);
        });

        it('verify ARIA support', () => {
            colProductName.selected = true;
            fix.detectChanges();

            const productIDHeader = GridFunctions.getColumnHeader('ProductID', fix);
            const productNameHeader = GridFunctions.getColumnHeader('ProductName', fix);

            expect(productIDHeader.nativeElement.getAttribute('aria-selected')).toMatch('false');
            expect(productNameHeader.nativeElement.getAttribute('aria-selected')).toMatch('true');

            colProductName._cells.forEach(cell => {
                expect(cell.nativeElement.getAttribute('aria-selected')).toMatch('true');
            });
            colProductID._cells.forEach(cell => {
                expect(cell.nativeElement.getAttribute('aria-selected')).toMatch('false');
            });
        });

        it('verify canceling event columnSelected', () => {
            GridFunctions.clickColumnHeaderUI('ProductID', fix);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);

            grid.columnSelected.subscribe((e: IColumnSelectionEventArgs) => {
                e.cancel = true;
            });

            // Click on same column to deselect it.
            GridFunctions.clickColumnHeaderUI('ProductID', fix);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);

            // Click on different column
            GridFunctions.clickColumnHeaderUI('ProductName', fix);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName, false);
            expect(grid.selectedColumns()).toEqual([colProductID]);

            // Click on different column holding ctrl key
            GridFunctions.clickColumnHeaderUI('ProductName', fix, true);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName, false);
            expect(grid.selectedColumns()).toEqual([colProductID]);

            // Click on different column holding shift key
            GridFunctions.clickColumnHeaderUI('ProductName', fix, false, true);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName, false);
            expect(grid.selectedColumns()).toEqual([colProductID]);
        });

        it('verify method selectColumns', () => {
            spyOn(grid.columnSelected, 'emit').and.callThrough();
            const colUnits = grid.getColumnByName('UnitsInStock');
            const colOrderDate = grid.getColumnByName('OrderDate');
            // select columns with array of fields
            grid.selectColumns(['ProductID', 'InStock']);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnsSelected([colProductID, colInStock]);
            expect(grid.selectedColumns()).toEqual([colProductID, colInStock]);

            // select columns with with clearCurrentSelection false
            grid.selectColumns(['UnitsInStock', 'InStock']);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnsSelected([colProductID, colInStock, colUnits]);
            expect(grid.selectedColumns()).toEqual([colProductID, colInStock, colUnits]);

            // select columns with with clearCurrentSelection true
            grid.selectColumns(['OrderDate', 'ProductID'], true);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnsSelected([colProductID, colOrderDate]);
            expect(grid.selectedColumns()).toEqual([colOrderDate, colProductID]);

            // select columns with array of columns
            grid.selectColumns([colInStock, colProductName]);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnsSelected([colProductID, colOrderDate, colInStock, colProductName]);
            expect(grid.selectedColumns()).toEqual([colOrderDate, colProductID, colInStock, colProductName]);

            grid.selectColumns([colProductID], true);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colProductID);
            GridSelectionFunctions.verifyColumnsSelected([colOrderDate, colInStock, colProductName], false);
            expect(grid.selectedColumns()).toEqual([colProductID]);
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(0);
        });

        it('verify method deselectColumns', () => {
            spyOn(grid.columnSelected, 'emit').and.callThrough();
            grid.columns.forEach(col => col.selected = true);

            const colUnits = grid.getColumnByName('UnitsInStock');
            const colOrderDate = grid.getColumnByName('OrderDate');

            // deselect columns with array of fields
            grid.deselectColumns(['ProductID']);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colProductID, false);
            GridSelectionFunctions.verifyColumnsSelected([colProductName, colInStock, colUnits, colOrderDate]);
            expect(grid.selectedColumns()).toEqual([colProductName, colInStock, colUnits, colOrderDate]);

            // deselect columns with not existing field
            grid.deselectColumns(['testField', 'ProductID', 'UnitsInStock']);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnsSelected([colProductID, colUnits], false);
            GridSelectionFunctions.verifyColumnsSelected([colProductName, colInStock, colOrderDate]);
            expect(grid.selectedColumns()).toEqual([colProductName, colInStock, colOrderDate]);

            // select columns with array of columns
            grid.deselectColumns([colOrderDate, colUnits]);
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsSelected([colProductID, colUnits, colOrderDate], false);
            GridSelectionFunctions.verifyColumnsSelected([colProductName, colInStock]);
            expect(grid.selectedColumns()).toEqual([colProductName, colInStock]);
        });

        it('verify methods selectAllColumns  and deselectAllColumns', () => {
            spyOn(grid.columnSelected, 'emit').and.callThrough();
            // select all columns
            grid.selectAllColumns();
            fix.detectChanges();

            grid.columnList.forEach(c => {
                expect(c.selected).toEqual(true);
            });

            // deselect all columns
            grid.deselectAllColumns();
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsSelected(grid.columns, false);
            expect(grid.selectedColumns()).toEqual([]);

            // Set selectable false to a column
            colProductName.selectable = false;
            fix.detectChanges();

            // select all columns
            grid.selectAllColumns();
            fix.detectChanges();

            grid.columnList.forEach(c => {
                expect(c.selected).toEqual(true);
            });

            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(0);
        });

        it('verify method getSelectedColumnsData', () => {
            colProductID.selected = true;
            colProductName.selected = true;
            fix.detectChanges();

            expect(grid.getSelectedColumnsData()).toEqual(selectedData());
        });

        it('verify when columnSelection is none columns cannot be selected', () => {
            grid.columnSelection = GridSelectionMode.none;
            fix.detectChanges();

            // Click on a column
            GridFunctions.clickColumnHeaderUI('ProductID', fix);

            // verify column is not selected
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID, false);

            // Hover a column
            const productNameHeader = GridFunctions.getColumnHeader('ProductName', fix);
            productNameHeader.triggerEventHandler('pointerenter', null);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnHeaderHasSelectableClass(productNameHeader, false);

            productNameHeader.triggerEventHandler('pointerleave', null);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnHeaderHasSelectableClass(productNameHeader, false);
        });
    });

    describe('Multi selection tests: ', () => {
        let colProductName: IgxColumnComponent;
        let colProductID: IgxColumnComponent;
        let colInStock: IgxColumnComponent;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(ProductsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            colProductName = grid.getColumnByName('ProductName');
            colProductID = grid.getColumnByName('ProductID');
            colInStock = grid.getColumnByName('InStock');
            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();
        }));

        it('selecting a column with ctrl + mouse click', () => {
            spyOn(grid.columnSelected, 'emit').and.callThrough();
            colProductName.selectable = false;
            fix.detectChanges();

            GridSelectionFunctions.clickOnColumnToSelect(colProductID, true);
            grid.cdr.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colProductID);
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(1);
            let args: IColumnSelectionEventArgs = {
                oldSelection: [],
                newSelection: ['ProductID'],
                added: ['ProductID'],
                removed: [],
                event: jasmine.anything() as any,
                cancel: false
            };
            expect(grid.columnSelected.emit).toHaveBeenCalledWith(args);

            GridSelectionFunctions.clickOnColumnToSelect(colInStock, true);
            grid.cdr.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colProductID);
            GridSelectionFunctions.verifyColumnSelected(colInStock);
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(2);
            args = {
                oldSelection: ['ProductID'],
                newSelection: ['ProductID', 'InStock'],
                added: ['InStock'],
                removed: [],
                event: jasmine.anything() as any,
                cancel: false
            };
            expect(grid.columnSelected.emit).toHaveBeenCalledWith(args);

            GridSelectionFunctions.clickOnColumnToSelect(colProductName, true);
            grid.cdr.detectChanges();
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(2);

            const colOrderDate = grid.getColumnByName('OrderDate');
            GridSelectionFunctions.clickOnColumnToSelect(colOrderDate, true);
            grid.cdr.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colProductID);
            GridSelectionFunctions.verifyColumnSelected(colInStock);
            GridSelectionFunctions.verifyColumnSelected(colOrderDate);
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(3);
            args = {
                oldSelection: ['ProductID', 'InStock'],
                newSelection: ['ProductID', 'InStock', 'OrderDate'],
                added: ['OrderDate'],
                removed: [],
                event: jasmine.anything() as any,
                cancel: false
            };
            expect(grid.columnSelected.emit).toHaveBeenCalledWith(args);

            GridSelectionFunctions.clickOnColumnToSelect(colInStock, true);
            grid.cdr.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colProductID);
            GridSelectionFunctions.verifyColumnSelected(colOrderDate);
            GridSelectionFunctions.verifyColumnSelected(colInStock, false);
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(4);
            args = {
                oldSelection: ['ProductID', 'InStock', 'OrderDate'],
                newSelection: ['ProductID', 'OrderDate'],
                added: [],
                removed: ['InStock'],
                event: jasmine.anything() as any,
                cancel: false
            };
            expect(grid.columnSelected.emit).toHaveBeenCalledWith(args);
            GridSelectionFunctions.clickOnColumnToSelect(colOrderDate);
            grid.cdr.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colProductID, false);
            GridSelectionFunctions.verifyColumnSelected(colOrderDate);
            GridSelectionFunctions.verifyColumnSelected(colInStock, false);
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(5);
            args = {
                oldSelection: ['ProductID', 'OrderDate'],
                newSelection: ['OrderDate'],
                added: [],
                removed: ['ProductID'],
                event: jasmine.anything() as any,
                cancel: false
            };
            expect(grid.columnSelected.emit).toHaveBeenCalledWith(args);
        });

        it('selecting a column with shift + mouse click', () => {
            spyOn(grid.columnSelected, 'emit').and.callThrough();
            const colUnits = grid.getColumnByName('UnitsInStock');
            const colOrderDate = grid.getColumnByName('OrderDate');
            colUnits.selected = true;
            colProductName.selectable = false;
            fix.detectChanges();

            GridSelectionFunctions.clickOnColumnToSelect(colInStock, true, true);
            grid.cdr.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colUnits);
            GridSelectionFunctions.verifyColumnSelected(colInStock);
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(1);
            let args: IColumnSelectionEventArgs = {
                oldSelection: ['UnitsInStock'],
                newSelection: ['UnitsInStock', 'InStock'],
                added: ['InStock'],
                removed: [],
                event: jasmine.anything() as any,
                cancel: false
            };
            expect(grid.columnSelected.emit).toHaveBeenCalledWith(args);

            GridSelectionFunctions.clickOnColumnToSelect(colOrderDate, false, true);
            grid.cdr.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colOrderDate);
            GridSelectionFunctions.verifyColumnSelected(colInStock);
            GridSelectionFunctions.verifyColumnSelected(colUnits);
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(2);
            args = {
                oldSelection: ['UnitsInStock', 'InStock'],
                newSelection: ['UnitsInStock', 'InStock', 'OrderDate'],
                added: ['OrderDate'],
                removed: [],
                event: jasmine.anything() as any,
                cancel: false
            };
            expect(grid.columnSelected.emit).toHaveBeenCalledWith(args);

            GridSelectionFunctions.clickOnColumnToSelect(colProductID, false, true);
            grid.cdr.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colOrderDate, false);
            GridSelectionFunctions.verifyColumnSelected(colProductName, false);
            GridSelectionFunctions.verifyColumnSelected(colProductID);
            GridSelectionFunctions.verifyColumnSelected(colInStock);
            GridSelectionFunctions.verifyColumnSelected(colUnits);
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(3);
            args = {
                oldSelection: ['UnitsInStock', 'InStock', 'OrderDate'],
                newSelection: ['UnitsInStock', 'InStock', 'ProductID'],
                added: ['ProductID'],
                removed: ['OrderDate'],
                event: jasmine.anything() as any,
                cancel: false
            };
            expect(grid.columnSelected.emit).toHaveBeenCalledWith(args);
        });

        it('Verify changing selection to none', () => {
            expect(grid.columnSelection).toEqual('multiple');
            grid.selectColumns(['ProductID', 'ProductName']);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName);

            grid.columnSelection = GridSelectionMode.none;
            fix.detectChanges();

            expect(grid.columnSelection).toEqual('none');
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID, false);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName, false);

            // Click on column header to select
            GridFunctions.clickColumnHeaderUI('ProductID', fix);
            // verify column is not selected
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID, false);
        });
    });

    describe('Single selection tests: ', () => {
        let colProductName: IgxColumnComponent;
        let colProductID: IgxColumnComponent;
        let colInStock: IgxColumnComponent;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(ProductsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            colProductName = grid.getColumnByName('ProductName');
            colProductID = grid.getColumnByName('ProductID');
            colInStock = grid.getColumnByName('InStock');
            grid.columnSelection = GridSelectionMode.single;
            fix.detectChanges();
        }));

        it('selecting a column', () => {
            // Click on column to select it.
            GridFunctions.clickColumnHeaderUI('ProductID', fix);

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);

            // Click on another column
            GridFunctions.clickColumnHeaderUI('ProductName', fix);

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID, false);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName);

            // Click on another column holding Ctrl
            GridFunctions.clickColumnHeaderUI('InStock', fix, true);

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID, false);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName, false);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colInStock);

            // Click on another column holding Shift
            GridFunctions.clickColumnHeaderUI('ProductID', fix, false, true);

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName, false);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colInStock, false);

            // Click on same column
            GridFunctions.clickColumnHeaderUI('ProductID', fix);

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID, false);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName, false);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colInStock, false);
        });

        it('selecting a columns with API', () => {
            // Verify setting selected property
            colProductID.selected = true;
            colProductName.selected = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName);

            // Click on column holding Ctrl
            GridFunctions.clickColumnHeaderUI('InStock', fix, true);

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID, false);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName, false);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colInStock);

            // select multiple columns with method
            grid.selectAllColumns();
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colInStock);
        });

        it('Verify changing selection to multiple', () => {
            expect(grid.columnSelection).toEqual('single');

            GridFunctions.clickColumnHeaderUI('InStock', fix);

            GridSelectionFunctions.verifyColumnAndCellsSelected(colInStock);

            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();
            expect(grid.columnSelection).toEqual('multiple');
            GridSelectionFunctions.verifyColumnAndCellsSelected(colInStock, false);
            expect(grid.selectedColumns()).toEqual([]);
        });
    });

    describe('Multi column headers tests: ', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(ColumnSelectionGroupTestComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('setting selected on a column group', () => {
            const personDetails = GridFunctions.getColGroup(grid, 'Person Details');
            const genInf = GridFunctions.getColGroup(grid, 'General Information');
            const companyName = grid.getColumnByName('CompanyName');
            const contactName = grid.getColumnByName('ContactName');
            const contactTitle = grid.getColumnByName('ContactTitle');
            spyOn(grid.columnSelected, 'emit').and.callThrough();

            // verify setting selected true on a column group
            genInf.selected = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnsSelected([companyName, contactName, contactTitle]);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, personDetails);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, genInf);

            // verify setting selected false on a column group
            personDetails.selected = false;
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsSelected([contactName, contactTitle], false);
            GridSelectionFunctions.verifyColumnSelected(companyName);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, personDetails, false);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, genInf, false);

            contactName.selected = true;
            contactTitle.selected = true;
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsSelected([companyName, contactName, contactTitle]);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, personDetails);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, genInf);
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(0);
        });

        it('setting selected on a column group with no selectable children', () => {
            const countryInf = GridFunctions.getColGroup(grid, 'Country Information');
            const regInf = GridFunctions.getColGroup(grid, 'Region Information');
            const cityInf = GridFunctions.getColGroup(grid, 'City Information');
            const country = grid.getColumnByName('Country');
            const region = grid.getColumnByName('Region');
            const postalCode = grid.getColumnByName('PostalCode');
            const city = grid.getColumnByName('City');
            const address = grid.getColumnByName('Address');
            spyOn(grid.columnSelected, 'emit').and.callThrough();

            // verify setting selected true on a column group
            countryInf.selected = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnsSelected([region, postalCode]);
            GridSelectionFunctions.verifyColumnsSelected([country, city, address], false);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, countryInf);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, regInf);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, cityInf, false);

            // Set select to false to a column group
            countryInf.selected = false;
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsSelected([country, region, postalCode, city, address], false);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, countryInf, false);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, regInf, false);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, cityInf, false);
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(0);
        });

        it('setting selectable false to group children', () => {
            const genInf = GridFunctions.getColGroup(grid, 'General Information');
            const personDetails = GridFunctions.getColGroup(grid, 'Person Details');
            const companyName = grid.getColumnByName('CompanyName');
            const contactName = grid.getColumnByName('ContactName');
            const contactTitle = grid.getColumnByName('ContactTitle');
            spyOn(grid.columnSelected, 'emit').and.callThrough();

            // verify setting selected true on a column group
            contactName.selectable = false;
            contactTitle.selectable = false;
            companyName.selectable = false;
            fix.detectChanges();

            expect(personDetails.selectable).toBeFalsy();
            expect(genInf.selectable).toBeFalsy();

            // Set selected
            genInf.selected = true;
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnGroupSelected(fix, personDetails, false);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, genInf, false);
            expect(grid.columnSelected.emit).toHaveBeenCalledTimes(0);
        });

        it('verify that when hover group all its selectable children have correct classes', () => {
            const contactName = grid.getColumnByName('ContactName');
            const contactTitle = grid.getColumnByName('ContactTitle');
            const genInfHeader = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            const personDetailsHeader = GridFunctions.getColumnGroupHeaderCell('Person Details', fix);
            const companyNameHeader = GridFunctions.getColumnHeader('CompanyName', fix);
            const contactNameHeader = GridFunctions.getColumnHeader('ContactName', fix);
            const contactTitleHeader = GridFunctions.getColumnHeader('ContactTitle', fix);

            genInfHeader.triggerEventHandler('pointerenter', null);
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsHeadersHasSelectableClass([genInfHeader,
                personDetailsHeader, companyNameHeader, contactNameHeader, contactTitleHeader]);

            genInfHeader.triggerEventHandler('pointerleave', null);
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsHeadersHasSelectableClass([genInfHeader,
                personDetailsHeader, companyNameHeader, contactNameHeader, contactTitleHeader], false);

            contactName.selectable = false;
            contactTitle.selectable = false;
            fix.detectChanges();

            genInfHeader.triggerEventHandler('pointerenter', null);
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsHeadersHasSelectableClass([genInfHeader, companyNameHeader]);
            GridSelectionFunctions.verifyColumnsHeadersHasSelectableClass([personDetailsHeader,
                contactNameHeader, contactTitleHeader], false);

            genInfHeader.triggerEventHandler('pointerleave', null);
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsHeadersHasSelectableClass([genInfHeader, companyNameHeader], false);

            // hover not selectable group
            personDetailsHeader.triggerEventHandler('pointerenter', null);
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsHeadersHasSelectableClass([personDetailsHeader,
                contactNameHeader, contactTitleHeader, genInfHeader, companyNameHeader], false);
            personDetailsHeader.triggerEventHandler('pointerleave', null);
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsHeadersHasSelectableClass([personDetailsHeader,
                contactNameHeader, contactTitleHeader, genInfHeader, companyNameHeader], false);
        });

        it('When click on a col group all it\'s visible and selectable child should be selected', () => {
            const personDetails = GridFunctions.getColGroup(grid, 'Person Details');
            const genInfHeader = GridFunctions.getColGroup(grid, 'General Information');
            const companyName = grid.getColumnByName('CompanyName');
            const contactName = grid.getColumnByName('ContactName');
            const contactTitle = grid.getColumnByName('ContactTitle');

            contactTitle.hidden = true;
            contactName.selectable = false;
            fix.detectChanges();

            GridFunctions.clickColumnGroupHeaderUI('General Information', fix);

            GridSelectionFunctions.verifyColumnSelected(companyName);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, genInfHeader);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, personDetails, false);
            GridSelectionFunctions.verifyColumnsSelected([contactTitle, contactName], false);

            GridFunctions.clickColumnGroupHeaderUI('General Information', fix);

            GridSelectionFunctions.verifyColumnSelected(companyName, false);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, genInfHeader, false);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, personDetails, false);
            GridSelectionFunctions.verifyColumnsSelected([contactTitle, contactName], false);
        });

        it('Should select multiple columns when click and hold ctrl', () => {
            const personDetails = GridFunctions.getColGroup(grid, 'Person Details');
            const countryInfo = GridFunctions.getColGroup(grid, 'Country Information');
            const regionInfo = GridFunctions.getColGroup(grid, 'Region Information');
            const contactName = grid.getColumnByName('ContactName');
            const contactTitle = grid.getColumnByName('ContactTitle');
            const region = grid.getColumnByName('Region');
            const postalCode = grid.getColumnByName('PostalCode');

            GridFunctions.clickColumnGroupHeaderUI('Person Details', fix, true);
            GridFunctions.clickColumnGroupHeaderUI('Region Information', fix, true);

            GridSelectionFunctions.verifyColumnGroupSelected(fix, personDetails);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, countryInfo);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, regionInfo);
            GridSelectionFunctions.verifyColumnsSelected([contactTitle, contactName, region, postalCode]);

            GridFunctions.clickColumnHeaderUI('Region', fix);
            GridFunctions.clickColumnHeaderUI('PostalCode', fix, true);

            GridSelectionFunctions.verifyColumnGroupSelected(fix, regionInfo);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, countryInfo);
            GridSelectionFunctions.verifyColumnsSelected([region, postalCode]);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, personDetails, false);
            GridSelectionFunctions.verifyColumnsSelected([contactTitle, contactName], false);
        });

        it('Should select whole range of columns when click and hold shift', () => {
            const countryInfo = GridFunctions.getColGroup(grid, 'Country Information');
            const personDetails = GridFunctions.getColGroup(grid, 'Person Details');
            const regionInfo = GridFunctions.getColGroup(grid, 'Region Information');
            const id = grid.getColumnByName('ID');
            const contactName = grid.getColumnByName('ContactName');
            const contactTitle = grid.getColumnByName('ContactTitle');
            const region = grid.getColumnByName('Region');
            const postalCode = grid.getColumnByName('PostalCode');

            GridFunctions.clickColumnHeaderUI('ID', fix, false, true);
            GridFunctions.clickColumnHeaderUI('PostalCode', fix, false, true);

            GridSelectionFunctions.verifyColumnGroupSelected(fix, countryInfo);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, regionInfo);
            GridSelectionFunctions.verifyColumnsSelected([region, postalCode, id]);

            GridFunctions.clickColumnHeaderUI('ID', fix);
            GridFunctions.clickColumnHeaderUI('ContactName', fix, false, true);

            GridSelectionFunctions.verifyColumnGroupSelected(fix, personDetails);
            GridSelectionFunctions.verifyColumnsSelected([contactTitle, contactName, id]);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, countryInfo, false);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, regionInfo, false);
            GridSelectionFunctions.verifyColumnsSelected([region, postalCode], false);
        });

        it('Should select the group when all visible child are selected', () => {
            const countryInfo = GridFunctions.getColGroup(grid, 'Country Information');
            const regionInfo = GridFunctions.getColGroup(grid, 'Region Information');
            const region = grid.getColumnByName('Region');
            const country = grid.getColumnByName('Country');
            const postalCode = grid.getColumnByName('PostalCode');

            GridSelectionFunctions.verifyColumnGroupSelected(fix, countryInfo, false);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, regionInfo, false);
            GridSelectionFunctions.verifyColumnSelected(region, false);

            country.hidden = true;
            country.selectable = true;
            postalCode.hidden = true;
            fix.detectChanges();

            GridFunctions.clickColumnHeaderUI('Region', fix);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, countryInfo);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, regionInfo);
            GridSelectionFunctions.verifyColumnSelected(region);
        });

        it('group is selected if all it\'s children are selected', () => {
            const regionInfo = GridFunctions.getColGroup(grid, 'Region Information');
            const region = grid.getColumnByName('Region');
            const country = grid.getColumnByName('Country');
            const postalCode = grid.getColumnByName('PostalCode');

            country.selectable = true;
            country.selected = true;
            region.selected = true;
            postalCode.selected = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnGroupSelected(fix, regionInfo);

            postalCode.selected = false;
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnGroupSelected(fix, regionInfo, false);
        });

        it('when column(s) is/are hidden, selection should not reflect on them', () => {
            const postalCode = grid.getColumnByName('PostalCode');
            const region = grid.getColumnByName('Region');
            const contactName = grid.getColumnByName('ContactName');
            const contactTitle = grid.getColumnByName('ContactTitle');
            const personDetails = GridFunctions.getColGroup(grid, 'Person Details');
            const regionInfo = GridFunctions.getColGroup(grid, 'Region Information');

            postalCode.hidden = true;
            contactTitle.hidden = true;
            fix.detectChanges();

            GridFunctions.clickColumnGroupHeaderUI('Person Details', fix, true);
            GridFunctions.clickColumnGroupHeaderUI('Region Information', fix, true);

            GridSelectionFunctions.verifyColumnsSelected([postalCode, contactTitle], false);
            GridSelectionFunctions.verifyColumnsSelected([contactName, region]);

            grid.deselectAllColumns();
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsSelected([contactName, region], false);

            personDetails.selected = true;
            regionInfo.selected = true;
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsSelected([postalCode, contactTitle, contactName, region]);
        });

        it('When column selection is single and click on a group its children should be selected', () => {
            const personDetails = GridFunctions.getColGroup(grid, 'Person Details');
            const genInfHeader = GridFunctions.getColGroup(grid, 'General Information');
            const companyName = grid.getColumnByName('CompanyName');
            const contactName = grid.getColumnByName('ContactName');
            const contactTitle = grid.getColumnByName('ContactTitle');

            grid.columnSelection = GridSelectionMode.single;
            fix.detectChanges();

            GridFunctions.clickColumnGroupHeaderUI('General Information', fix);

            GridSelectionFunctions.verifyColumnGroupSelected(fix, genInfHeader);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, personDetails);
            GridSelectionFunctions.verifyColumnsSelected([companyName, contactTitle, contactName]);

            // Click on a column group in the group
            GridFunctions.clickColumnGroupHeaderUI('Person Details', fix);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, genInfHeader, false);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, personDetails, true);
            GridSelectionFunctions.verifyColumnsSelected([contactTitle, contactName]);
            GridSelectionFunctions.verifyColumnSelected(companyName, false);

            // Click on a column in the group
            GridFunctions.clickColumnHeaderUI('ContactName', fix);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, personDetails, false);
            GridSelectionFunctions.verifyColumnSelected(contactTitle, false);
            GridSelectionFunctions.verifyColumnSelected(contactName);

        });
    });

    describe('Integration tests: ', () => {
        let colProductID;
        let colProductName;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(ProductsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();
            colProductID = grid.getColumnByName('ProductID');
            colProductName = grid.getColumnByName('ProductName');
        }));

        it('Filtering: Verify column selection when filter row is opened ', fakeAsync(() => {
            grid.allowFiltering = true;
            fix.detectChanges();
            const filterCell = GridFunctions.getFilterCell(fix, 'ProductID');
            expect(filterCell.nativeElement.classList.contains(SELECTED_FILTER_CELL_CLASS)).toBeFalsy();
            const colInStock = grid.getColumnByName('InStock');
            colProductID.selected = true;
            fix.detectChanges();

            expect(filterCell.nativeElement.classList.contains(SELECTED_FILTER_CELL_CLASS)).toBeTruthy();
            GridFunctions.clickFilterCellChipUI(fix, 'InStock'); // Name column contains nested object as a value
            tick(150);
            fix.detectChanges();

            const filterRow = GridFunctions.getFilterRow(fix);
            expect(filterRow).toBeDefined();

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);

            GridFunctions.clickColumnHeaderUI('InStock', fix);
            tick();

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colInStock, false);
            expect(grid.filteringRow.column.field).toEqual('InStock');

            GridFunctions.clickColumnHeaderUI('ProductID', fix);
            tick();

            const productIDHeader = GridFunctions.getColumnHeader('ProductID', fix);
            expect(productIDHeader.nativeElement.classList.contains(SELECTED_COLUMN_CLASS)).toBeFalsy();
            colProductID._cells.forEach(cell => {
                expect(cell.nativeElement.classList.contains(SELECTED_COLUMN_CELL_CLASS)).toEqual(true);
            });
            expect(grid.filteringRow.column.field).toEqual('ProductID');

            // Hover column headers
            const productNameHeader = GridFunctions.getColumnHeader('ProductName', fix);
            productNameHeader.triggerEventHandler('pointerenter', null);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnHeaderHasSelectableClass(productNameHeader, false);
        }));

        it('Filtering: Verify column selection when filter', () => {
            colProductName.selected = true;
            colProductID.selected = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName);

            grid.filter('ProductName', 'Chocolate', IgxStringFilteringOperand.instance().condition('equals'), true);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName);
            expect(grid.getSelectedColumnsData()).toEqual([{ ProductID: 10, ProductName: 'Chocolate' }]);

            grid.clearFilter();
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName);
            expect(grid.getSelectedColumnsData()).toEqual(selectedData());
        });

        it('Sorting: Verify column selection is not change when click on sort indicator', () => {
            const productIDHeader = GridFunctions.getColumnHeader('ProductID', fix);
            colProductName.selected = true;
            colProductID.sortable = true;
            colProductID.selected = true;
            fix.detectChanges();

            GridFunctions.clickHeaderSortIcon(productIDHeader);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID, true);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName, true);
            expect(grid.getSelectedColumnsData()).toEqual(selectedData());

            GridFunctions.clickHeaderSortIcon(productIDHeader);
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID, true);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName, true);
            expect(grid.getSelectedColumnsData()).toEqual(selectedData().sort((a, b) => b.ProductID - a.ProductID));
        });

        it('Pinning: Verify that when pin/unpin the column stays selected', () => {
            colProductName.selected = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName);

            // pin the column
            colProductName.pinned = true;
            fix.detectChanges();

            GridFunctions.verifyColumnIsPinned(colProductName, true, 1);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName);

            colProductName.pinned = false;
            fix.detectChanges();

            GridFunctions.verifyColumnIsPinned(colProductName, false, 0);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName);
        });

        it('Hiding: Verify that when hide/unhide a column the column stays selected', () => {
            colProductID.selected = true;
            colProductName.selected = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);

            // hide the column
            colProductName.hidden = true;
            fix.detectChanges();

            GridFunctions.verifyColumnIsHidden(colProductName, true, 4);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            expect(grid.getSelectedColumnsData()).toEqual(selectedData());
            expect(grid.selectedColumns().includes(colProductName)).toBeTruthy();

            colProductName.hidden = false;
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
        });

        it('Moving: Verify that when move a column, it stays selected', () => {
            colProductID.movable = true;
            colProductName.movable = true;
            colProductID.selected = true;
            fix.detectChanges();

            grid.moveColumn(colProductID, colProductName);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName, false);
            expect(colProductID.visibleIndex).toEqual(1);
        });

        it('Paging: Verify column stays selected when change page', fakeAsync(() => {
            colProductName.selected = true;
            colProductID.selected = true;
            grid.paging = true;
            grid.perPage = 3;
            fix.detectChanges();
            tick(30);

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName);
            expect(grid.getSelectedColumnsData()).toEqual(selectedData());

            grid.paginate(1);
            fix.detectChanges();
            tick(16);

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName);
            expect(grid.getSelectedColumnsData()).toEqual(selectedData());
        }));
    });
});
