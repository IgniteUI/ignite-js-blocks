
import { DebugElement } from '@angular/core';
import { TestBed, async, fakeAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxColumnPinningComponent } from '../pinning/column-pinning.component';
import { IgxColumnPinningModule } from '../pinning/pinning.module';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './public_api';
import { IgxButtonModule } from '../../directives/button/button.directive';
import {
    ColumnPinningTestComponent,
    ColumnGroupsPinningTestComponent,
    ColumnPinningWithTemplateTestComponent
} from '../../test-utils/grid-base-components.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { ControlsFunction } from '../../test-utils/controls-functions.spec';

describe('Column Pinning UI #grid', () => {
    configureTestSuite();
    let fix;
    let grid: IgxGridComponent;
    let columnChooser: IgxColumnPinningComponent;
    let columnChooserElement: DebugElement;

    const verifyCheckbox = ControlsFunction.verifyCheckbox;
    const verifyColumnIsPinned = GridFunctions.verifyColumnIsPinned;

    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ColumnPinningTestComponent,
                ColumnGroupsPinningTestComponent,
                ColumnPinningWithTemplateTestComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule,
                IgxColumnPinningModule,
                IgxButtonModule
            ]
        }).compileComponents();
    }));

    describe('', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(ColumnPinningTestComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            columnChooser = fix.componentInstance.chooser;
            columnChooserElement = GridFunctions.getColumnPinningElement(fix);
        }));

        it('title is initially empty.', async(() => {
            const title = GridFunctions.getColumnChooserTitle(columnChooserElement);
            expect(title).toBe(null);
        }));

        it('title can be successfully changed.', async(() => {
            columnChooser.title = 'Pin/Unpin Columns';
            fix.detectChanges();

            const titleElement = GridFunctions.getColumnChooserTitle(columnChooserElement).nativeElement as HTMLHeadingElement;
            expect(columnChooser.title).toBe('Pin/Unpin Columns');
            expect(titleElement.textContent).toBe('Pin/Unpin Columns');

            columnChooser.title = undefined;
            fix.detectChanges();

            expect(GridFunctions.getColumnChooserTitle(columnChooserElement)).toBe(null);
            expect(columnChooser.title).toBe('');

            columnChooser.title = null;
            fix.detectChanges();

            expect(GridFunctions.getColumnChooserTitle(columnChooserElement)).toBe(null);
            expect(columnChooser.title).toBe('');
        }));

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

        it('shows all checkboxes unchecked.', () => {
            const checkboxes = GridFunctions.getColumnChooserItems(columnChooserElement);
            expect(checkboxes.filter((chk) => !chk.nativeElement.checked).length).toBe(5);
        });

        it('- toggling column checkbox checked state successfully changes the column\'s pinned state.', () => {
            const checkbox = GridFunctions.getColumnChooserItemElement(columnChooserElement, 'ReleaseDate');
            verifyCheckbox('ReleaseDate', false, false, columnChooserElement, fix);

            const column = grid.getColumnByName('ReleaseDate');
            verifyColumnIsPinned(column, false, 0);

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ReleaseDate');
            fix.detectChanges();

            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(true);
            verifyColumnIsPinned(column, true, 1);

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ReleaseDate');
            fix.detectChanges();

            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(false);
            verifyColumnIsPinned(column, false, 0);
        });

        it('reflects properly grid column pinned value changes.', () => {
            const name = 'ReleaseDate';
            verifyCheckbox(name, false, false, columnChooserElement, fix);
            const column = grid.getColumnByName(name);

            column.pinned = true;
            fix.detectChanges();

            verifyCheckbox(name, true, false, columnChooserElement, fix);
            verifyColumnIsPinned(column, true, 1);

            column.pinned = false;
            fix.detectChanges();

            verifyCheckbox(name, false, false, columnChooserElement, fix);
            verifyColumnIsPinned(column, false, 0);

            column.pinned = undefined;
            fix.detectChanges();

            verifyCheckbox(name, false, false, columnChooserElement, fix);
            verifyColumnIsPinned(column, false, 0);

            column.pinned = true;
            fix.detectChanges();
            verifyColumnIsPinned(column, true, 1);

            column.pinned = null;
            fix.detectChanges();

            verifyCheckbox(name, false, false, columnChooserElement, fix);
            verifyColumnIsPinned(column, false, 0);
        });

        it('onColumnPinning event is fired on toggling checkboxes.', async(() => {
            spyOn(grid.onColumnPinning, 'emit').and.callThrough();

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ReleaseDate');
            fix.detectChanges();

            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(1);
            expect(grid.onColumnPinning.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ReleaseDate'), insertAtIndex: 0, isPinned: true });


            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Downloads');
            fix.detectChanges();

            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(2);
            expect(grid.onColumnPinning.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('Downloads'), insertAtIndex: 1, isPinned: true });

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ReleaseDate');
            fix.detectChanges();

            // When unpinning columns onColumnPinning event should be fired
            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(3);
            expect(grid.onColumnPinning.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ReleaseDate'), insertAtIndex: 3, isPinned: false });


            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Downloads');
            fix.detectChanges();

            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(4);
            expect(grid.onColumnPinning.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('Downloads'), insertAtIndex: 2, isPinned: false });

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ProductName');
            fix.detectChanges();

            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(5);
            expect(grid.onColumnPinning.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ProductName'), insertAtIndex: 0, isPinned: true });
        }));

        it('onColumnPinning event should fire when pinning and unpining using api', async(() => {
            spyOn(grid.onColumnPinning, 'emit').and.callThrough();

            grid.columns[0].pin();

            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(1);
            expect(grid.onColumnPinning.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ID'), insertAtIndex: 0, isPinned: true });

            // onColumnPinning should not be fired if column is already pinned
            grid.columns[0].pin();

            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(1);

            grid.columns[0].unpin();

            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(2);
            expect(grid.onColumnPinning.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ID'), insertAtIndex: 0, isPinned: false });
        }));

        it('does pin columns if unpinned area width will become less than the defined minimum.', () => {
            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ID');
            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ProductName');
            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Downloads');
            fix.detectChanges();

            verifyColumnIsPinned(grid.columns[0], true, 3);
            verifyColumnIsPinned(grid.columns[1], true, 3);
            verifyColumnIsPinned(grid.columns[2], true, 3);
        });

        it('toolbar should contain only pinnable columns', () => {
            grid.showToolbar = true;
            grid.columnPinning = true;
            fix.detectChanges();

            let toolbar = grid.toolbar.columnPinningUI;
            expect(toolbar.pinnableColumns.length).toBe(5);

            grid.columns[0].disablePinning = true;
            fix.detectChanges();

            toolbar = grid.toolbar.columnPinningUI;
            expect(toolbar.pinnableColumns.length).toBe(4);
        });
    });

    describe('', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(ColumnGroupsPinningTestComponent);
            fix.showInline = false;
            fix.showPinningInline = true;
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            columnChooser = fix.componentInstance.chooser;
            columnChooserElement = GridFunctions.getColumnPinningElement(fix);
        }));

        it('shows only top level columns.', () => {
            const columnItems = columnChooser.columnItems;
            expect(columnItems.length).toBe(3);
            expect(columnItems[0].name).toBe('Missing');
            expect(columnItems[1].name).toBe('General Information');
            expect(columnItems[2].name).toBe('ID');
            expect(GridFunctions.getColumnChooserItems(columnChooserElement).length).toBe(3);
        });

        it('- pinning group column pins all children.', () => {
            fix.detectChanges();
            const columnName = 'General Information';
            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Missing');
            GridFunctions.clickColumnChooserItem(columnChooserElement, columnName);
            fix.detectChanges();

            verifyCheckbox(columnName, true, false, columnChooserElement, fix);
            expect(grid.columns[1].allChildren.every((col) => col.pinned)).toBe(true);
        });

        it('- unpinning group column unpins all children.', () => {
            const columnName = 'General Information';
            grid.columns[0].unpin();
            grid.columns[1].pin();
            fix.detectChanges();

            verifyCheckbox(columnName, true, false, columnChooserElement, fix);
            expect(grid.columns[1].allChildren.every((col) => col.pinned)).toBe(true);

            GridFunctions.clickColumnChooserItem(columnChooserElement, columnName);
            fix.detectChanges();
            verifyCheckbox(columnName, false, false, columnChooserElement, fix);
            expect(grid.columns[1].allChildren.every((col) => !col.pinned)).toBe(true);
        });
    });

    it('- should size cells correctly when there is a large pinned templated column', fakeAsync(/** height/width setter rAF */() => {
        fix = TestBed.createComponent(ColumnPinningWithTemplateTestComponent);
        fix.detectChanges();
        grid = fix.componentInstance.grid;
        // verify all cells have 100px height
        const cells = GridFunctions.getRowCells(fix, 0);
        cells.forEach((cell) => {
            expect(cell.nativeElement.offsetHeight).toBe(100);
        });
    }));
});
