import { async, TestBed, fakeAsync } from '@angular/core/testing';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { DefaultSortingStrategy, NoopSortingStrategy } from '../../data-operations/sorting-strategy';
import { IgxGridCellComponent } from '../cell.component';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { GridDeclaredColumnsComponent, SortByParityComponent } from '../../test-utils/grid-samples.spec';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';

describe('IgxGrid - Grid Sorting #grid', () => {

    configureTestSuite();
    let fixture;
    let grid: IgxGridComponent;

    beforeAll(async(() => {

        TestBed.configureTestingModule({
            declarations: [
                GridDeclaredColumnsComponent,
                SortByParityComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule]
        }).compileComponents();
    }));

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(GridDeclaredColumnsComponent);
        fixture.detectChanges();
        grid = fixture.componentInstance.grid;
        grid.width = '800px';
    }));

    describe('API tests', () => {

        it('Should sort grid ascending by column name', () => {
            const currentColumn = 'Name';
            const lastNameColumn = 'LastName';
            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Asc, ignoreCase: false });

            fixture.detectChanges();

            expect(grid.getCellByColumn(0, currentColumn).value).toEqual('ALex');
            expect(grid.getCellByColumn(0, lastNameColumn).value).toEqual('Smith');
            expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual('Rick');
            expect(grid.getCellByColumn(grid.data.length - 1, lastNameColumn).value).toEqual('BRown');

            // Ignore case on sorting set to true
            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Asc, ignoreCase: true });
            fixture.detectChanges();

            expect(grid.getCellByColumn(0, currentColumn).value).toEqual('ALex');
        });

        it('Should sort grid descending by column name', () => {
            const currentColumn = 'Name';
            // Ignore case on sorting set to false
            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Desc, ignoreCase: false });
            fixture.detectChanges();


            expect(grid.getCellByColumn(0, currentColumn).value).toEqual('Rick');
            expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual('ALex');

            // Ignore case on sorting set to true
            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Desc, ignoreCase: true });
            fixture.detectChanges();

            expect(grid.getCellByColumn(0, currentColumn).value).toEqual('Rick');
            expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).not.toEqual('ALex');

        });

        it('Should not sort grid when trying to sort by invalid column', () => {
            const invalidColumn = 'Age';
            grid.sort({ fieldName: invalidColumn, dir: SortingDirection.Desc, ignoreCase: false });

            expect(grid.getCellByColumn(0, 'Name').value).toEqual('Jane');
            expect(grid.getCellByColumn(grid.data.length - 1, 'Name').value).toEqual('Connor');
        });

        it('Should sort grid by current column by expression (Ascending)', () => {
            const currentColumn = 'ID';
            grid.sortingExpressions = [{
                fieldName: currentColumn, dir: SortingDirection.Asc, ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            }];

            fixture.detectChanges();

            expect(grid.getCellByColumn(0, currentColumn).value).toEqual(1);
        });

        it('Should sort grid by current column by expression (Descending with ignoreCase)', () => {
            const currentColumn = 'Name';

            grid.sortingExpressions = [{
                fieldName: currentColumn, dir: SortingDirection.Desc, ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            }];

            fixture.detectChanges();

            expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual('Alex');
        });

        it('Should sort grid by multiple expressions and clear sorting through API', () => {
            const firstColumn = 'ID';
            const secondColumn = 'Name';
            const thirdColumn = 'LastName';

            grid.sortingExpressions = [
                { fieldName: secondColumn, dir: SortingDirection.Asc, ignoreCase: true },
                { fieldName: firstColumn, dir: SortingDirection.Desc, ignoreCase: true }
            ];

            fixture.detectChanges();

            expect(grid.getCellByColumn(0, secondColumn).value).toEqual('ALex');
            expect(grid.getCellByColumn(grid.data.length - 1, secondColumn).value).toEqual('Rick');
            expect(grid.getCellByColumn(grid.data.length - 1, firstColumn).value).toEqual(6);
            expect(grid.getCellByColumn(grid.data.length - 1, thirdColumn).value).toEqual('Jones');

            // Clear sorting on a column
            grid.clearSort(firstColumn);
            fixture.detectChanges();

            expect(grid.sortingExpressions.length).toEqual(1);
            expect(grid.sortingExpressions[0].fieldName).toEqual(secondColumn);

            grid.sortingExpressions = [
                { fieldName: secondColumn, dir: SortingDirection.Asc, ignoreCase: true },
                { fieldName: firstColumn, dir: SortingDirection.Desc, ignoreCase: true }
            ];
            fixture.detectChanges();

            expect(grid.sortingExpressions.length).toEqual(2);

            // Clear sorting on all columns
            grid.clearSort();
            fixture.detectChanges();

            expect(grid.sortingExpressions.length).toEqual(0);
        });

        it('Should sort grid by multiple expressions through API using ignoreCase for the second expression', () => {
            const firstColumn = 'ID';
            const secondColumn = 'Name';
            const thirdColumn = 'LastName';
            const exprs = [
                { fieldName: secondColumn, dir: SortingDirection.Asc, ignoreCase: true },
                { fieldName: thirdColumn, dir: SortingDirection.Desc, ignoreCase: true }
            ];

            grid.sortingExpressions = exprs;

            fixture.detectChanges();
            expect(grid.getCellByColumn(0, secondColumn).value).toEqual('ALex');
            expect(grid.getCellByColumn(0, thirdColumn).value).toEqual('Smith');
            expect(grid.getCellByColumn(0, firstColumn).value).toEqual(5);
            expect(grid.getCellByColumn(grid.data.length - 1, secondColumn).value).toEqual('Rick');
            expect(grid.getCellByColumn(grid.data.length - 1, thirdColumn).value).toEqual('BRown');
            expect(grid.getCellByColumn(grid.data.length - 1, firstColumn).value).toEqual(7);

            grid.clearSort();
            fixture.detectChanges();

            expect(grid.sortingExpressions.length).toEqual(0);

            grid.sort(exprs);
            fixture.detectChanges();

            expect(grid.getCellByColumn(0, secondColumn).value).toEqual('ALex');
            expect(grid.getCellByColumn(0, thirdColumn).value).toEqual('Smith');
            expect(grid.getCellByColumn(0, firstColumn).value).toEqual(5);
            expect(grid.getCellByColumn(grid.data.length - 1, secondColumn).value).toEqual('Rick');
            expect(grid.getCellByColumn(grid.data.length - 1, thirdColumn).value).toEqual('BRown');
            expect(grid.getCellByColumn(grid.data.length - 1, firstColumn).value).toEqual(7);
        });

        // sort now allows only params of type ISortingExpression hence it is not possible to pass invalid expressions
        it(`Should sort grid by mixed valid and invalid expressions should update the
                data only by valid ones`, () => {
            const firstColumn = 'ID';
            const secondColumn = 'Name';
            const thirdColumn = 'LastName';
            const invalidAndValidExp = [
                { fieldName: secondColumn, dir: SortingDirection.Desc, ignoreCase: false },
                { fieldName: firstColumn, dir: SortingDirection.Asc, ignoreCase: true }
            ];

            grid.sort(invalidAndValidExp);

            fixture.detectChanges();

            expect(grid.getCellByColumn(0, secondColumn).value).toEqual('Rick');
            expect(grid.getCellByColumn(0, thirdColumn).value).toEqual('Jones');
            expect(grid.getCellByColumn(0, firstColumn).value).toEqual(6);
            expect(grid.getCellByColumn(grid.data.length - 1, secondColumn).value).toEqual('ALex');
            expect(grid.getCellByColumn(grid.data.length - 1, thirdColumn).value).toEqual('Smith');
            expect(grid.getCellByColumn(grid.data.length - 1, firstColumn).value).toEqual(5);
        });

        it(`Should allow sorting using a custom Sorting Strategy.`, () => {
            fixture = TestBed.createComponent(SortByParityComponent);
            grid = fixture.componentInstance.grid;
            fixture.componentInstance.data.push(
                { ID: 8, Name: 'Brad', LastName: 'Walker', Region: 'DD' },
                { ID: 9, Name: 'Mary', LastName: 'Smith', Region: 'OC' },
                { ID: 10, Name: 'Brad', LastName: 'Smith', Region: 'BD' },
            );
            fixture.detectChanges();
            grid.sort({
                fieldName: 'ID',
                dir: SortingDirection.Desc,
                ignoreCase: false,
                strategy: new SortByParityComponent()
            });
            fixture.detectChanges();
            const oddHalf: IgxGridCellComponent[] = grid.getColumnByName('ID').cells.slice(0, 5);
            const evenHalf: IgxGridCellComponent[] = grid.getColumnByName('ID').cells.slice(5);
            const isFirstHalfOdd: boolean = oddHalf.every(cell => cell.value % 2 === 1);
            const isSecondHalfEven: boolean = evenHalf.every(cell => cell.value % 2 === 0);
            expect(isFirstHalfOdd).toEqual(true);
            expect(isSecondHalfEven).toEqual(true);
        });
    });

    describe('UI tests', () => {

        it('Should sort grid ascending by clicking once on first header cell UI', () => {
            const firstHeaderCell = GridFunctions.getColumnHeader('ID', fixture);

            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            fixture.detectChanges();

            const firstRowFirstCell = GridFunctions.getCurrentCellFromGrid(grid, 0, 0);
            const firstRowSecondCell = GridFunctions.getCurrentCellFromGrid(grid, 0, 1);
            expect(GridFunctions.getValueFromCellElement(firstRowSecondCell)).toEqual('Brad');
            expect(GridFunctions.getValueFromCellElement(firstRowFirstCell)).toEqual('1');

            const lastRowFirstCell = GridFunctions.getCurrentCellFromGrid(grid, grid.data.length - 1, 0);
            const lastRowSecondCell = GridFunctions.getCurrentCellFromGrid(grid, grid.data.length - 1, 1);
            expect(GridFunctions.getValueFromCellElement(lastRowFirstCell)).toEqual('7');
            expect(GridFunctions.getValueFromCellElement(lastRowSecondCell)).toEqual('Rick');
        });

        it('Should sort grid descending by clicking twice on sort icon UI', () => {
            const firstHeaderCell = GridFunctions.getColumnHeader('ID', fixture);

            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            fixture.detectChanges();
            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            fixture.detectChanges();

            const firstRowFirstCell = GridFunctions.getCurrentCellFromGrid(grid, 0, 0);
            const firstRowSecondCell = GridFunctions.getCurrentCellFromGrid(grid, 0, 1);
            expect(GridFunctions.getValueFromCellElement(firstRowFirstCell)).toEqual('7');
            expect(GridFunctions.getValueFromCellElement(firstRowSecondCell)).toEqual('Rick');

            const lastRowFirstCell = GridFunctions.getCurrentCellFromGrid(grid, grid.data.length - 1, 0);
            const lastRowSecondCell = GridFunctions.getCurrentCellFromGrid(grid, grid.data.length - 1, 1);
            expect(GridFunctions.getValueFromCellElement(lastRowFirstCell)).toEqual('1');
            expect(GridFunctions.getValueFromCellElement(lastRowSecondCell)).toEqual('Brad');
        });

        it('Should sort grid none when we click three time on header sort icon UI', () => {
            const firstHeaderCell = GridFunctions.getColumnHeader('ID', fixture);

            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            fixture.detectChanges();
            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            fixture.detectChanges();
            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            fixture.detectChanges();

            const firstRowSecondCell = GridFunctions.getCurrentCellFromGrid(grid, 0, 1);
            expect(GridFunctions.getValueFromCellElement(firstRowSecondCell)).toEqual('Jane');

            const lastRowSecondCell = GridFunctions.getCurrentCellFromGrid(grid, grid.data.length - 1, 1);
            expect(GridFunctions.getValueFromCellElement(lastRowSecondCell)).toEqual('Connor');

        });

        it('Should have a valid sorting icon when sorting using the API.', () => {
            const firstHeaderCell = GridFunctions.getColumnHeader('ID', fixture);
            GridFunctions.verifyHeaderSortIndicator(firstHeaderCell, false, false);

            grid.sort({ fieldName: 'ID', dir: SortingDirection.Asc, ignoreCase: true });
            fixture.detectChanges();
            GridFunctions.verifyHeaderSortIndicator(firstHeaderCell, true);

            grid.sort({ fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: true });
            fixture.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(firstHeaderCell, false, true);

            grid.clearSort();
            fixture.detectChanges();
            GridFunctions.verifyHeaderSortIndicator(firstHeaderCell, false, false);
        });

        it('Should sort grid on sorting icon click when FilterRow is visible.', fakeAsync(/** Filtering showHideArrowButtons RAF */() => {
            grid.allowFiltering = true;
            fixture.detectChanges();

            GridFunctions.clickFilterCellChipUI(fixture, 'Name');
            expect(GridFunctions.getFilterRow(fixture)).toBeDefined();

            const firstHeaderCell = GridFunctions.getColumnHeader('ID', fixture);
            UIInteractions.simulateClickAndSelectEvent(firstHeaderCell);

            expect(grid.headerGroups.toArray()[0].isFiltered).toBeTruthy();

            GridFunctions.verifyHeaderSortIndicator(firstHeaderCell, false, false);

            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            fixture.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(firstHeaderCell, false, true);
            expect(grid.getCellByColumn(0, 'ID').value).toEqual(7);

            const secondHeaderCell = GridFunctions.getColumnHeader('Name', fixture);
            UIInteractions.simulateClickAndSelectEvent(secondHeaderCell);
            fixture.detectChanges();

            expect(grid.headerGroups.toArray()[1].isFiltered).toBeTruthy();
        }));

        it('Should disable sorting feature when using NoopSortingStrategy.', () => {
            grid.sortStrategy = NoopSortingStrategy.instance();
            fixture.detectChanges();

            const firstHeaderCell = GridFunctions.getColumnHeader('ID', fixture);

            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            fixture.detectChanges();

            // Verify that the grid is NOT sorted.
            expect(GridFunctions.getValueFromCellElement(GridFunctions.getCurrentCellFromGrid(grid, 0, 1))).toEqual('Jane');
            // tslint:disable-next-line: max-line-length
            expect(GridFunctions.getValueFromCellElement(GridFunctions.getCurrentCellFromGrid(grid, grid.data.length - 1, 1))).toEqual('Connor');

            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            fixture.detectChanges();

            // Verify that the grid is NOT sorted.
            expect(GridFunctions.getValueFromCellElement(GridFunctions.getCurrentCellFromGrid(grid, 0, 1))).toEqual('Jane');
            // tslint:disable-next-line: max-line-length
            expect(GridFunctions.getValueFromCellElement(GridFunctions.getCurrentCellFromGrid(grid, grid.data.length - 1, 1))).toEqual('Connor');
        });
    });
});

