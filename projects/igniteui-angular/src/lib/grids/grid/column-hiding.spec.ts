
import { DebugElement } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IColumnVisibilityChangedEventArgs, IgxColumnHidingItemDirective } from '../hiding/column-hiding-item.directive';
import { IgxGridModule } from './index';
import { IgxGridComponent } from './grid.component';
import { IgxButtonModule } from '../../directives/button/button.directive';
import { ColumnHidingTestComponent, ColumnGroupsHidingTestComponent } from '../../test-utils/grid-base-components.spec';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { GridSelectionMode, ColumnDisplayOrder } from '../common/enums';
import { IgxColumnHidingModule } from '../hiding/hiding.module';
import { IgxColumnHidingComponent } from '../hiding/column-hiding.component';
import { ControlsFunction } from '../../test-utils/controls-functions.spec';

describe('Column Hiding UI #grid', () => {
    configureTestSuite();
    let fix;
    let grid: IgxGridComponent;
    let columnChooser: IgxColumnHidingComponent;
    let columnChooserElement: DebugElement;

    const verifyCheckbox = ControlsFunction.verifyCheckbox;
    const verifyColumnIsHidden = GridFunctions.verifyColumnIsHidden;
    const getColumnHidingButton = GridFunctions.getColumnHidingButton;

    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ColumnHidingTestComponent,
                ColumnGroupsHidingTestComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule,
                IgxColumnHidingModule,
                IgxButtonModule
            ]
        }).compileComponents();
    }));

    describe('', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(ColumnHidingTestComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            columnChooser = fix.componentInstance.chooser;
            columnChooserElement = GridFunctions.getColumnHidingElement(fix);
        }));

        it('title is initially empty.', () => {
            const title = GridFunctions.getColumnChooserTitle(columnChooserElement);
            expect(title).toBe(null);
        });

        it('title can be successfully changed.', () => {
            columnChooser.title = 'Show/Hide Columns';
            fix.detectChanges();

            const titleElement = GridFunctions.getColumnChooserTitle(columnChooserElement).nativeElement as HTMLHeadingElement;
            expect(columnChooser.title).toBe('Show/Hide Columns');
            expect(titleElement.textContent).toBe('Show/Hide Columns');

            columnChooser.title = undefined;
            fix.detectChanges();

            expect(GridFunctions.getColumnChooserTitle(columnChooserElement)).toBeNull();
            expect(columnChooser.title).toBe('');

            columnChooser.title = null;
            fix.detectChanges();

            expect(GridFunctions.getColumnChooserTitle(columnChooserElement)).toBeNull();
            expect(columnChooser.title).toBe('');
        });

        it('filter input visibility is controlled via \'disableFilter\' property.', () => {
            let filterInputElement = GridFunctions.getColumnHidingHeaderInput(columnChooserElement);
            expect(filterInputElement).not.toBeNull();

            fix.componentInstance.disableFilter = true;
            fix.detectChanges();

            filterInputElement = GridFunctions.getColumnHidingHeaderInput(columnChooserElement);
            expect(filterInputElement).toBeNull();

            fix.componentInstance.disableFilter = false;
            fix.detectChanges();

            filterInputElement = GridFunctions.getColumnHidingHeaderInput(columnChooserElement);
            expect(filterInputElement).not.toBeNull();
        });

        it('lists all 4 hidable grid columns.', () => {
            const columnItems = columnChooser.columnItems;
            expect(columnItems.length).toBe(5);

            expect(GridFunctions.getColumnChooserItems(columnChooserElement).length).toBe(4);
        });

        it('orders columns according to "columnDisplayOrder".', () => {
            expect(columnChooser.columnDisplayOrder).toBe(ColumnDisplayOrder.DisplayOrder);

            let columnItems = columnChooser.columnItems.map((item) => item.name);
            expect(columnItems).toEqual(['ID', 'ProductName', 'Downloads', 'Released', 'ReleaseDate']);

            columnChooser.columnDisplayOrder = ColumnDisplayOrder.Alphabetical;
            fix.detectChanges();

            expect(columnChooser.columnDisplayOrder).toBe(ColumnDisplayOrder.Alphabetical);
            columnItems = columnChooser.columnItems.map((item) => item.name);
            expect(columnItems).toEqual(['Downloads', 'ID', 'ProductName', 'Released', 'ReleaseDate']);

            columnChooser.columnDisplayOrder = ColumnDisplayOrder.DisplayOrder;
            fix.detectChanges();
            columnItems = columnChooser.columnItems.map((item) => item.name);
            expect(columnItems).toEqual(['ID', 'ProductName', 'Downloads', 'Released', 'ReleaseDate']);
        });

        it('does not show "ProductName" column.', () => {
            const colProductName = GridFunctions.getColumnChooserItemElement(columnChooserElement, 'ProductName');
            expect(colProductName).toBeUndefined();
        });

        it('"hiddenColumnsCount" reflects properly the number of hidden columns.', fakeAsync(() => {
            expect(columnChooser.hiddenColumnsCount).toBe(1);

            grid.columns[2].hidden = false;
            tick();
            expect(columnChooser.hiddenColumnsCount).toBe(0);

            grid.columns[0].hidden = true;
            tick();
            expect(columnChooser.hiddenColumnsCount).toBe(1);

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Released');
            fix.detectChanges();
            expect(columnChooser.hiddenColumnsCount).toBe(2);
        }));

        it('reflects changes in columns disabled properly.', () => {
            grid.columns[0].disableHiding = true;
            fix.detectChanges();

            let colProductName = getColumnChooserItem('ID');
            expect(colProductName).toBeUndefined();

            grid.columns[0].disableHiding = false;
            fix.detectChanges();

            colProductName = getColumnChooserItem('ID');
            expect(colProductName).toBeDefined();
            expect(colProductName.disabled).toBe(false);
            verifyCheckbox('ID', false, false, columnChooserElement, fix);
        });

        it('allows hiding a column whose disabled=undefined.', () => {
            grid.columns[3].disableHiding = undefined;
            fix.detectChanges();

            verifyCheckbox('Released', false, false, columnChooserElement, fix);
        });

        it('does not show any items when all columns disabled is true.', () => {
            grid.columns.forEach((col) => col.disableHiding = true);
            fix.detectChanges();

            const checkboxes = GridFunctions.getColumnChooserItems(columnChooserElement);
            expect(checkboxes.length).toBe(0);
            ControlsFunction.verifyButtonIsDisabled(GridFunctions.getColumnChooserButton(columnChooserElement, 'Show All').nativeElement);
            ControlsFunction.verifyButtonIsDisabled(GridFunctions.getColumnChooserButton(columnChooserElement, 'Hide All').nativeElement);
        });

        it('- toggling column checkbox checked state successfully changes the grid column visibility.', () => {
            const checkbox = GridFunctions.getColumnChooserItemElement(columnChooserElement, 'ReleaseDate');
            verifyCheckbox('ReleaseDate', false, false, columnChooserElement, fix);

            const column = grid.getColumnByName('ReleaseDate');
            verifyColumnIsHidden(column, false, 4);

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ReleaseDate');
            fix.detectChanges();
            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(true);
            verifyColumnIsHidden(column, true, 3);

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ReleaseDate');
            fix.detectChanges();
            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(false);
            verifyColumnIsHidden(column, false, 4);
        });

        it('reflects properly grid column hidden value changes.', () => {
            const name = 'ReleaseDate';
            verifyCheckbox(name, false, false, columnChooserElement, fix);
            const column = grid.getColumnByName(name);

            column.hidden = true;
            fix.detectChanges();

            verifyCheckbox(name, true, false, columnChooserElement, fix);
            verifyColumnIsHidden(column, true, 3);

            column.hidden = false;
            fix.detectChanges();

            verifyCheckbox(name, false, false, columnChooserElement, fix);
            verifyColumnIsHidden(column, false, 4);

            column.hidden = undefined;
            fix.detectChanges();

            verifyCheckbox(name, false, false, columnChooserElement, fix);
            verifyColumnIsHidden(column, undefined, 4);

            column.hidden = true;
            fix.detectChanges();
            verifyColumnIsHidden(column, true, 3);

            column.hidden = null;
            fix.detectChanges();

            verifyCheckbox(name, false, false, columnChooserElement, fix);
            verifyColumnIsHidden(column, null, 4);
        });

        it('enables the column checkbox and "Show All" button after changing disabled of a hidden column.', () => {
            grid.columns.forEach((col) => col.disableHiding = true);
            const name = 'Downloads';
            grid.getColumnByName(name).disableHiding = false;
            fix.detectChanges();
            const showAll = GridFunctions.getColumnChooserButton(columnChooserElement, 'Show All').nativeElement;
            const hideAll = GridFunctions.getColumnChooserButton(columnChooserElement, 'Hide All').nativeElement;

            const checkbox = GridFunctions.getColumnChooserItemElement(columnChooserElement, name);
            verifyCheckbox(name, true, false, columnChooserElement, fix);
            ControlsFunction.verifyButtonIsDisabled(showAll, false);
            ControlsFunction.verifyButtonIsDisabled(hideAll);

            GridFunctions.clickColumnChooserItem(columnChooserElement, name);
            fix.detectChanges();

            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(false, 'Checkbox is not unchecked!');
            ControlsFunction.verifyButtonIsDisabled(showAll);
            ControlsFunction.verifyButtonIsDisabled(hideAll, false);

            GridFunctions.clickColumnChooserItem(columnChooserElement, name);
            fix.detectChanges();

            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(true, 'Checkbox is not checked!');

            ControlsFunction.verifyButtonIsDisabled(showAll, false);
            ControlsFunction.verifyButtonIsDisabled(hideAll);
        });

        it('enables the column checkbox and "Hide All" button after changing disabled of a visible column.', () => {
            grid.columns.forEach((col) => col.disableHiding = true);
            const name = 'Released';
            grid.getColumnByName(name).disableHiding = false;
            fix.detectChanges();
            const showAll = GridFunctions.getColumnChooserButton(columnChooserElement, 'Show All').nativeElement;
            const hideAll = GridFunctions.getColumnChooserButton(columnChooserElement, 'Hide All').nativeElement;

            const checkbox = GridFunctions.getColumnChooserItemElement(columnChooserElement, name);
            verifyCheckbox(name, false, false, columnChooserElement, fix);
            ControlsFunction.verifyButtonIsDisabled(showAll);
            ControlsFunction.verifyButtonIsDisabled(hideAll, false);

            GridFunctions.clickColumnChooserItem(columnChooserElement, name);
            fix.detectChanges();

            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(true);

            ControlsFunction.verifyButtonIsDisabled(showAll, false);
            ControlsFunction.verifyButtonIsDisabled(hideAll);

            GridFunctions.clickColumnChooserItem(columnChooserElement, name);
            fix.detectChanges();

            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(false);
            ControlsFunction.verifyButtonIsDisabled(showAll);
            ControlsFunction.verifyButtonIsDisabled(hideAll, false);
        });

        it('- "Hide All" button gets enabled after checking a column when all used to be hidden.', () => {
            const hideAll = GridFunctions.getColumnChooserButton(columnChooserElement, 'Hide All');
            hideAll.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            ControlsFunction.verifyButtonIsDisabled(hideAll.nativeElement);

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ID');
            fix.detectChanges();

            ControlsFunction.verifyButtonIsDisabled(hideAll.nativeElement, false);
        });

        it('- "Show All" button gets enabled after unchecking a column when all used to be visible.', () => {
            const showAll = GridFunctions.getColumnChooserButton(columnChooserElement, 'Show All');
            showAll.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            ControlsFunction.verifyButtonIsDisabled(showAll.nativeElement);

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Released');
            fix.detectChanges();

            ControlsFunction.verifyButtonIsDisabled(showAll.nativeElement, false);
        });

        it('- "Hide All" button gets disabled after checking the last unchecked column.', () => {
            const hideAll = GridFunctions.getColumnChooserButton(columnChooserElement, 'Hide All').nativeElement;
            ControlsFunction.verifyButtonIsDisabled(hideAll, false);

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ReleaseDate');
            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Released');
            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ID');
            fix.detectChanges();

            ControlsFunction.verifyButtonIsDisabled(hideAll);
        });

        it('- "Show All" button gets disabled after unchecking the last checked column.', () => {
            const showAll = GridFunctions.getColumnChooserButton(columnChooserElement, 'Show All').nativeElement;
            ControlsFunction.verifyButtonIsDisabled(showAll, false);

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Downloads');
            fix.detectChanges();
            ControlsFunction.verifyButtonIsDisabled(showAll);
        });

        it('reflects changes in columns headers.', () => {
            const column = grid.getColumnByName('ReleaseDate');
            column.header = 'Release Date';
            fix.detectChanges();

            expect(GridFunctions.getColumnChooserItemElement(columnChooserElement, 'ReleaseDate')).toBeUndefined();
            expect(GridFunctions.getColumnChooserItemElement(columnChooserElement, 'Release Date')).toBeDefined();
        });

        it('onColumnVisibilityChanged event is fired on toggling checkboxes.', () => {
            spyOn(columnChooser.onColumnVisibilityChanged, 'emit').and.callThrough();

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ReleaseDate');

            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledTimes(1);
            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ReleaseDate'), newValue: true });

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ReleaseDate');

            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledTimes(2);
            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ReleaseDate'), newValue: false });

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Downloads');

            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledTimes(3);
            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('Downloads'), newValue: false });


            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Downloads');

            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledTimes(4);
            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('Downloads'), newValue: true });
        });

        it('onColumnVisibilityChanged event is fired for each hidable & visible column on pressing "Hide All" button.', () => {
            spyOn(columnChooser.onColumnVisibilityChanged, 'emit').and.callThrough();

            const hideAll = GridFunctions.getColumnChooserButton(columnChooserElement, 'Hide All');
            hideAll.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledTimes(3);
            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ID'), newValue: true });
            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('Released'), newValue: true });
            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ReleaseDate'), newValue: true });
        });

        it('onColumnVisibilityChanged event is fired for each hidable & hidden column on pressing "Show All" button.', () => {
            grid.columns[3].hidden = true;
            grid.columns[4].hidden = true;
            fix.detectChanges();

            spyOn(columnChooser.onColumnVisibilityChanged, 'emit').and.callThrough();

            const showAll = GridFunctions.getColumnChooserButton(columnChooserElement, 'Show All');
            showAll.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledTimes(3);
            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('Downloads'), newValue: false });
            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('Released'), newValue: false });
            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ReleaseDate'), newValue: false });
        });

        it('shows a filter textbox with no prompt', () => {
            const filterInput = GridFunctions.getColumnChooserFilterInput(columnChooserElement).nativeElement;

            expect(filterInput).toBeDefined();
            expect(filterInput.placeholder).toBe('');
            expect(filterInput.textContent).toBe('');
        });

        it('filter prompt can be changed.', () => {
            columnChooser.filterColumnsPrompt = 'Type to filter columns';
            fix.detectChanges();

            const filterInput = GridFunctions.getColumnChooserFilterInput(columnChooserElement).nativeElement;
            expect(filterInput.placeholder).toBe('Type to filter columns');
            expect(filterInput.textContent).toBe('');

            columnChooser.filterColumnsPrompt = null;
            fix.detectChanges();

            expect(filterInput.placeholder).toBe('');
            expect(filterInput.textContent).toBe('');

            columnChooser.filterColumnsPrompt = undefined;
            fix.detectChanges();

            expect(filterInput.placeholder).toBe('');

            columnChooser.filterColumnsPrompt = '@\#&*';
            fix.detectChanges();

            expect(filterInput.placeholder).toBe('@\#&*');
        });

        it('filters columns on every keystroke in filter input.', () => {
            const filterInput = GridFunctions.getColumnChooserFilterInput(columnChooserElement);

            UIInteractions.triggerInputEvent(filterInput, 'r');
            fix.detectChanges();
            expect(columnChooser.columnItems.length).toBe(3);

            UIInteractions.triggerInputEvent(filterInput, 're');
            fix.detectChanges();
            expect(columnChooser.columnItems.length).toBe(2);

            UIInteractions.triggerInputEvent(filterInput, 'r');
            fix.detectChanges();
            expect(columnChooser.columnItems.length).toBe(3);

            UIInteractions.triggerInputEvent(filterInput, '');
            fix.detectChanges();
            expect(columnChooser.columnItems.length).toBe(5);
        });

        it('filters columns according to the specified filter criteria.', fakeAsync(() => {
            columnChooser.filterCriteria = 'd';
            tick();
            fix.detectChanges();

            const filterInput = GridFunctions.getColumnChooserFilterInput(columnChooserElement).nativeElement;
            expect(filterInput.value).toBe('d');
            expect(columnChooser.columnItems.length).toBe(5);

            columnChooser.filterCriteria += 'a';
            tick();
            fix.detectChanges();

            expect(filterInput.value).toBe('da');
            expect(columnChooser.columnItems.length).toBe(1);

            columnChooser.filterCriteria = '';
            columnChooser.filterCriteria = 'el';
            tick();
            fix.detectChanges();

            expect(filterInput.value).toBe('el');
            expect(columnChooser.columnItems.length).toBe(2);

            columnChooser.filterCriteria = '';
            tick();
            fix.detectChanges();

            expect(filterInput.value).toBe('');
            expect(columnChooser.columnItems.length).toBe(5);
        }));

        it('- Hide All button operates over the filtered in columns only', fakeAsync(() => {
            grid.columns[1].disableHiding = false;
            columnChooser.filterCriteria = 're';
            fix.detectChanges();

            const showAll = GridFunctions.getColumnChooserButton(columnChooserElement, 'Show All').nativeElement;
            const hideAll = GridFunctions.getColumnChooserButton(columnChooserElement, 'Hide All');
            ControlsFunction.verifyButtonIsDisabled(showAll);
            ControlsFunction.verifyButtonIsDisabled(hideAll.nativeElement, false);

            expect(columnChooser.columnItems.length).toBe(2);
            hideAll.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            let checkbox = GridFunctions.getColumnChooserItemElement(columnChooserElement, 'Released');
            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(true);
            checkbox = GridFunctions.getColumnChooserItemElement(columnChooserElement, 'ReleaseDate');
            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(true);

            ControlsFunction.verifyButtonIsDisabled(showAll, false);
            ControlsFunction.verifyButtonIsDisabled(hideAll.nativeElement);

            columnChooser.filterCriteria = 'r';
            tick();
            fix.detectChanges();

            ControlsFunction.verifyButtonIsDisabled(showAll, false);
            ControlsFunction.verifyButtonIsDisabled(hideAll.nativeElement, false);

            checkbox = GridFunctions.getColumnChooserItemElement(columnChooserElement, 'ProductName');
            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(false);

            hideAll.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            columnChooser.filterCriteria = '';
            tick();
            fix.detectChanges();

            expect(columnChooser.filterCriteria).toBe('', 'Filter criteria is not empty string!');
            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(true);
            checkbox = GridFunctions.getColumnChooserItemElement(columnChooserElement, 'ID');
            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(false);

            ControlsFunction.verifyButtonIsDisabled(showAll, false);
            ControlsFunction.verifyButtonIsDisabled(hideAll.nativeElement, false);
        }));

        it('- When Hide All columns no rows should be rendered', fakeAsync(() => {
            grid.rowSelection = GridSelectionMode.multiple;
            grid.paging = true;
            grid.rowDraggable = true;
            tick(30);
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false
            });
            fix.detectChanges();

            let fixEl = fix.nativeElement, gridEl = grid.nativeElement;
            let tHeadItems = fixEl.querySelector('igx-grid-header-group');
            let gridRows = fixEl.querySelector('igx-grid-row');
            let paging = fixEl.querySelector('.igx-paginator');
            let rowSelectors = gridEl.querySelector('.igx-checkbox');
            let dragIndicators = gridEl.querySelector('.igx-grid__drag-indicator');
            let verticalScrollBar = gridEl.querySelector('.igx-grid__tbody-scrollbar[hidden]');

            expect(tHeadItems).not.toBeNull();
            expect(gridRows).not.toBeNull();
            expect(paging).not.toBeNull();
            expect(rowSelectors).not.toBeNull();
            expect(dragIndicators).not.toBeNull();
            expect(verticalScrollBar).toBeNull();

            grid.columnList.forEach((col) => col.hidden = true);
            tick(30);
            fix.detectChanges();
            grid.columnList.forEach((col) => {
                expect(col.width).toBe('0px');
            });
            fixEl = fix.nativeElement, gridEl = grid.nativeElement;

            tHeadItems = fixEl.querySelector('igx-grid-header-group');
            gridRows = fixEl.querySelector('igx-grid-row');
            paging = fixEl.querySelector('.igx-paginator');
            rowSelectors = gridEl.querySelector('.igx-checkbox');
            dragIndicators = gridEl.querySelector('.igx-grid__drag-indicator');
            verticalScrollBar = gridEl.querySelector('.igx-grid__tbody-scrollbar[hidden]');

            expect(tHeadItems).toBeNull();
            expect(gridRows).toBeNull();
            expect(paging).toBeNull();
            expect(rowSelectors).toBeNull();
            expect(dragIndicators).toBeNull();
            expect(verticalScrollBar).not.toBeNull();
        }));

        it('- Show All button operates over the filtered in columns only', fakeAsync(() => {
            grid.columns[1].disableHiding = false;
            columnChooser.hideAllColumns();
            columnChooser.filterCriteria = 're';
            fix.detectChanges();
            tick();

            const showAll = GridFunctions.getColumnChooserButton(columnChooserElement, 'Show All');
            const hideAll = GridFunctions.getColumnChooserButton(columnChooserElement, 'Hide All').nativeElement;
            ControlsFunction.verifyButtonIsDisabled(showAll.nativeElement, false);
            ControlsFunction.verifyButtonIsDisabled(hideAll);

            showAll.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            let checkbox = GridFunctions.getColumnChooserItemElement(columnChooserElement, 'Released');
            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(false);
            checkbox = GridFunctions.getColumnChooserItemElement(columnChooserElement, 'ReleaseDate');
            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(false);

            ControlsFunction.verifyButtonIsDisabled(showAll.nativeElement);
            ControlsFunction.verifyButtonIsDisabled(hideAll, false);

            columnChooser.filterCriteria = 'r';
            fix.detectChanges();
            tick();

            ControlsFunction.verifyButtonIsDisabled(showAll.nativeElement, false);
            ControlsFunction.verifyButtonIsDisabled(hideAll, false);

            checkbox = GridFunctions.getColumnChooserItemElement(columnChooserElement, 'ProductName');
            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(true);

            showAll.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            columnChooser.filterCriteria = '';
            fix.detectChanges();
            tick();

            expect(columnChooser.filterCriteria).toBe('', 'Filter criteria is not empty string!');

            checkbox = GridFunctions.getColumnChooserItemElement(columnChooserElement, 'ID');
            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(true);
            checkbox = GridFunctions.getColumnChooserItemElement(columnChooserElement, 'ProductName');
            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(false);

            ControlsFunction.verifyButtonIsDisabled(showAll.nativeElement, false);
            ControlsFunction.verifyButtonIsDisabled(hideAll, false);
        }));

        it('hides the proper columns after filtering and clearing the filter', () => {
            const showAll = GridFunctions.getColumnChooserButton(columnChooserElement, 'Show All');

            const filterInput = GridFunctions.getColumnChooserFilterInput(columnChooserElement);

            UIInteractions.triggerInputEvent(filterInput, 'a');
            fix.detectChanges();

            ControlsFunction.verifyButtonIsDisabled(showAll.nativeElement, false);
            showAll.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            ControlsFunction.verifyButtonIsDisabled(showAll.nativeElement);
            expect(grid.columns[2].hidden).toBe(false, 'Downloads column is not hidden!');

            UIInteractions.triggerInputEvent(filterInput, '');
            fix.detectChanges();

            ControlsFunction.verifyButtonIsDisabled(showAll.nativeElement);
            expect(grid.columns[0].hidden).toBe(false, 'ID column is not shown!');
            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ID');
            fix.detectChanges();

            ControlsFunction.verifyButtonIsDisabled(showAll.nativeElement, false);
            expect(grid.columns[0].hidden).toBe(true, 'ID column is not hidden!');
        });

        it('fires onColumnVisibilityChanged event after filtering and clearing the filter.', () => {
            spyOn(columnChooser.onColumnVisibilityChanged, 'emit').and.callThrough();
            const filterInput = GridFunctions.getColumnChooserFilterInput(columnChooserElement);

            UIInteractions.triggerInputEvent(filterInput, 'a');
            fix.detectChanges();
            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Downloads');

            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledTimes(1);
            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('Downloads'), newValue: false });
            expect(grid.columns[2].hidden).toBe(false);

            UIInteractions.triggerInputEvent(filterInput, '');
            fix.detectChanges();

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ID');

            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledTimes(2);
            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ID'), newValue: true });
            expect(grid.columns[0].hidden).toBe(true);
        });

        it('height can be controlled via columnsAreaMaxHeight input.', () => {
            expect(columnChooser.columnsAreaMaxHeight).toBe('100%');
            expect(columnChooserElement.nativeElement.offsetHeight >= 310).toBe(true);

            columnChooser.columnsAreaMaxHeight = '150px';
            fix.detectChanges();
            const columnsAreaDiv = GridFunctions.getColumnHidingColumnsContainer(columnChooserElement);
            expect(getComputedStyle(columnsAreaDiv.nativeElement).maxHeight).toBe('150px');
            expect(columnChooserElement.nativeElement.offsetHeight <= 255).toBe(true);
        });

        it('should recalculate heights when enough columns are hidden so that there is no need for horizontal scrollbar.', () => {
            grid.height = '200px';
            fix.detectChanges();
            expect(grid.scr.nativeElement.hidden).toBe(false);
            const gridHeader = GridFunctions.getGridHeader(fix);
            const gridScroll = GridFunctions.getGridScroll(fix);
            const gridFooter = GridFunctions.getGridFooter(fix);
            let expectedHeight = parseInt(window.getComputedStyle(grid.nativeElement).height, 10)
                - parseInt(window.getComputedStyle(gridHeader.nativeElement).height, 10)
                - parseInt(window.getComputedStyle(gridFooter.nativeElement).height, 10)
                - parseInt(window.getComputedStyle(gridScroll.nativeElement).height, 10);

            expect(grid.calcHeight).toEqual(expectedHeight);

            grid.columns[3].hidden = true;
            fix.detectChanges();
            expect(grid.scr.nativeElement.hidden).toBe(true);

            expectedHeight = parseInt(window.getComputedStyle(grid.nativeElement).height, 10)
                - parseInt(window.getComputedStyle(gridHeader.nativeElement).height, 10)
                - parseInt(window.getComputedStyle(gridFooter.nativeElement).height, 10);

            expect(grid.calcHeight).toEqual(expectedHeight);
        });
    });

    describe('', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(ColumnGroupsHidingTestComponent);
            fix.detectChanges();
            fix.componentInstance.hasGroupColumns = true;
            grid = fix.componentInstance.grid;
            columnChooser = fix.componentInstance.chooser;
            fix.detectChanges();

            columnChooserElement = GridFunctions.getColumnHidingElement(fix);
         }));

        it('indents columns according to their level.', () => {
            const items = columnChooser.columnItems;
            expect(items.filter((col) => col.calcIndent === 0).length).toBe(3);
            expect(items.filter((col) => col.calcIndent === 30).length).toBe(2);
            expect(items.filter((col) => col.calcIndent === 60).length).toBe(2);

            const columnItems = GridFunctions.getColumnChooserItems(columnChooserElement);
            const margin0 = '0px';
            const margin30 = '30px';
            const margin60 = '60px';
            expect(getComputedStyle(columnItems[0].nativeElement).marginLeft).toBe(margin0);
            expect(getComputedStyle(columnItems[1].nativeElement).marginLeft).toBe(margin0);
            expect(getComputedStyle(columnItems[2].nativeElement).marginLeft).toBe(margin30);
            expect(getComputedStyle(columnItems[3].nativeElement).marginLeft).toBe(margin30);
            expect(getComputedStyle(columnItems[4].nativeElement).marginLeft).toBe(margin60);
            expect(getComputedStyle(columnItems[5].nativeElement).marginLeft).toBe(margin60);
            expect(getComputedStyle(columnItems[6].nativeElement).marginLeft).toBe(margin0);
        });

        it('checks & hides all children when hiding their parent.', () => {
            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Person Details');
            fix.detectChanges();

            verifyCheckbox('Person Details', true, false, columnChooserElement, fix);
            verifyCheckbox('ContactName', true, false, columnChooserElement, fix);
            verifyCheckbox('ContactTitle', true, false, columnChooserElement, fix);

            verifyColumnIsHidden(grid.columns[3], true, 4);
            verifyColumnIsHidden(grid.columns[4], true, 4);
            verifyColumnIsHidden(grid.columns[5], true, 4);

            verifyCheckbox('CompanyName', false, false, columnChooserElement, fix);
            verifyCheckbox('General Information', false, false, columnChooserElement, fix);

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Person Details');
            fix.detectChanges();

            verifyColumnIsHidden(grid.columns[3], false, 7);
            verifyColumnIsHidden(grid.columns[4], false, 7);
            verifyColumnIsHidden(grid.columns[5], false, 7);

            verifyCheckbox('Person Details', false, false, columnChooserElement, fix);
            verifyCheckbox('ContactName', false, false, columnChooserElement, fix);
            verifyCheckbox('ContactTitle', false, false, columnChooserElement, fix);

            verifyCheckbox('CompanyName', false, false, columnChooserElement, fix);
            verifyCheckbox('General Information', false, false, columnChooserElement, fix);
        });

        it('checks & hides all descendants when hiding top level parent.', () => {
            GridFunctions.clickColumnChooserItem(columnChooserElement, 'General Information');
            fix.detectChanges();

            verifyCheckbox('General Information', true, false, columnChooserElement, fix);
            verifyCheckbox('CompanyName', true, false, columnChooserElement, fix);

            verifyCheckbox('Person Details', true, false, columnChooserElement, fix);
            verifyCheckbox('ContactName', true, false, columnChooserElement, fix);
            verifyCheckbox('ContactTitle', true, false, columnChooserElement, fix);

            verifyCheckbox('Missing', false, false, columnChooserElement, fix);
            verifyCheckbox('ID', false, false, columnChooserElement, fix);

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'General Information');
            fix.detectChanges();

            verifyCheckbox('General Information', false, false, columnChooserElement, fix);
            verifyCheckbox('CompanyName', false, false, columnChooserElement, fix);

            verifyCheckbox('Person Details', false, false, columnChooserElement, fix);
            verifyCheckbox('ContactName', false, false, columnChooserElement, fix);
            verifyCheckbox('ContactTitle', false, false, columnChooserElement, fix);
        });

        it('checks/unchecks parent when all children are checked/unchecked.', () => {
            verifyCheckbox('Person Details', false, false, columnChooserElement, fix);
            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ContactName');
            fix.detectChanges();

            verifyCheckbox('Person Details', false, false, columnChooserElement, fix);
            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ContactTitle');
            fix.detectChanges();

            verifyCheckbox('Person Details', true, false, columnChooserElement, fix);
            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ContactName');
            fix.detectChanges();

            verifyCheckbox('Person Details', false, false, columnChooserElement, fix);

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ContactTitle');
            fix.detectChanges();

            verifyCheckbox('Person Details', false, false, columnChooserElement, fix);
        });

        it('filters group columns properly.', () => {
            columnChooser.filterCriteria = 'cont';
            fix.detectChanges();

            expect(columnChooser.columnItems.length).toBe(4);
            expect(GridFunctions.getColumnChooserItems(columnChooserElement).length).toBe(4);

            expect(GridFunctions.getColumnChooserItemElement(columnChooserElement, 'General Information')).toBeDefined();
            expect(GridFunctions.getColumnChooserItemElement(columnChooserElement, 'Person Details')).toBeDefined();
            expect(GridFunctions.getColumnChooserItemElement(columnChooserElement, 'ContactName')).toBeDefined();
            expect(GridFunctions.getColumnChooserItemElement(columnChooserElement, 'ContactTitle')).toBeDefined();

            columnChooser.filterCriteria = 'pers';
            fix.detectChanges();

            expect(columnChooser.columnItems.length).toBe(2);
            expect(GridFunctions.getColumnChooserItems(columnChooserElement).length).toBe(2);
            expect(GridFunctions.getColumnChooserItemElement(columnChooserElement, 'General Information')).toBeDefined();
            expect(GridFunctions.getColumnChooserItemElement(columnChooserElement, 'Person Details')).toBeDefined();

            columnChooser.filterCriteria = 'mi';
            fix.detectChanges();

            expect(columnChooser.columnItems.length).toBe(1);
            expect(GridFunctions.getColumnChooserItems(columnChooserElement).length).toBe(1);
            expect(GridFunctions.getColumnChooserItemElement(columnChooserElement, 'General Information')).toBeUndefined();
            expect(GridFunctions.getColumnChooserItemElement(columnChooserElement, 'Missing')).toBeDefined();
        });

        it('hides the proper columns when filtering and pressing hide all.', () => {
            columnChooser.filterCriteria = 'cont';
            fix.detectChanges();

            const hideAll = GridFunctions.getColumnChooserButton(columnChooserElement, 'Hide All');
            hideAll.triggerEventHandler('click', new Event('click'));
            columnChooser.filterCriteria = '';
            fix.detectChanges();
            for (let i = 1; i < 6; i++) {
                verifyColumnIsHidden(grid.columns[i], true, 2);
            }
        });

        it('onColumnVisibilityChanged event is fired on toggling column group checkboxes.', () => {
            spyOn(columnChooser.onColumnVisibilityChanged, 'emit').and.callThrough();

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Person Details');
            fix.detectChanges();

            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledTimes(1);
            expect(columnChooser.onColumnVisibilityChanged.emit).toHaveBeenCalledWith(
                { column: grid.columnList.find(c => c.header === 'Person Details'), newValue: true });
            expect(grid.columns[2].hidden).toBe(false);

            verifyCheckbox('General Information', false, false, columnChooserElement, fix);
            verifyCheckbox('CompanyName', false, false, columnChooserElement, fix);
            verifyCheckbox('Person Details', true, false, columnChooserElement, fix);
            verifyCheckbox('ContactName', true, false, columnChooserElement, fix);
            verifyCheckbox('ContactTitle', true, false, columnChooserElement, fix);
        });

        it('onColumnVisibilityChanged event is fired on grid.toggleColumnVisibility(args).', () => {
            spyOn(grid.onColumnVisibilityChanged, 'emit').and.callThrough();

            const currentArgs: IColumnVisibilityChangedEventArgs = {
                column: grid.columns.find(c => c.header === 'Person Details'),
                newValue: true
            };
            grid.toggleColumnVisibility(currentArgs);
            fix.detectChanges();

            expect(grid.onColumnVisibilityChanged.emit).toHaveBeenCalledTimes(1);

            verifyCheckbox('General Information', false, false, columnChooserElement, fix);
            verifyCheckbox('CompanyName', false, false, columnChooserElement, fix);
            verifyCheckbox('Person Details', true, false, columnChooserElement, fix);
            verifyCheckbox('ContactName', true, false, columnChooserElement, fix);
            verifyCheckbox('ContactTitle', true, false, columnChooserElement, fix);
        });
    });

    describe('toolbar button', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(ColumnHidingTestComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            grid.showToolbar = true;
            grid.toolbarTitle = 'Grid Toolbar Title';
            grid.hiddenColumnsText = 'Hidden';
            grid.columnHiding = true;
            grid.columns[2].hidden = true;
            fix.componentInstance.showInline = false;
            fix.detectChanges();

            columnChooserElement = GridFunctions.getColumnHidingElement(fix);
        }));

        it('is shown when columnHiding is true and hidden - when false.', () => {
            expect(grid.toolbar.columnHidingUI).toBeDefined();
            expect(columnChooserElement).toBeDefined();
            expect(getColumnHidingButton(fix)).not.toBe(null);

            grid.columnHiding = false;
            fix.detectChanges();

            expect(grid.toolbar.columnHidingUI).toBeUndefined();
            expect(columnChooserElement).toBe(null);
            expect(getColumnHidingButton(fix)).toBeUndefined();

            grid.columnHiding = undefined;
            fix.detectChanges();

            expect(grid.toolbar.columnHidingUI).toBeUndefined();
            expect(columnChooserElement).toBe(null);
        });

        it('shows the number of hidden columns.', () => {
            const btnText = getColumnHidingButton(fix).innerText.toLowerCase();
            expect(btnText.includes('1') && btnText.includes('hidden')).toBe(true);
            expect(getColumnChooserButtonIcon().innerText.toLowerCase()).toBe('visibility_off');
        });

        it('shows the proper icon when no columns are hidden.', () => {
            grid.columns[2].hidden = false;
            fix.detectChanges();

            const btnText = getColumnHidingButton(fix).innerText.toLowerCase();
            expect(btnText.includes('0') && btnText.includes('hidden')).toBe(true);
            expect(getColumnChooserButtonIcon().innerText.toLowerCase()).toBe('visibility');
        });
    });

    function getColumnChooserButtonIcon() {
        const button = fix.debugElement.queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnHiding');
        return button.query(By.css('igx-icon')).nativeElement;
    }

    function getColumnChooserItem(name: string): IgxColumnHidingItemDirective {
        return columnChooser.hidableColumns.find((col) => col.name === name) as IgxColumnHidingItemDirective;
    }
});
