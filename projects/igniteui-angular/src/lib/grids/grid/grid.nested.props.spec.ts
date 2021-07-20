import { configureTestSuite } from '../../test-utils/configure-suite';
import { TestBed, ComponentFixture, fakeAsync } from '@angular/core/testing';
import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { cloneArray, resolveNestedPath } from '../../core/utils';
import { Component, DebugElement, ViewChild } from '@angular/core';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxComboComponent, IgxComboModule } from '../../combo/public_api';
import { IgxFocusModule } from '../../directives/focus/focus.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IgxToggleModule } from '../../directives/toggle/toggle.directive';
import { IgxInputGroupModule } from '../../input-group/public_api';
import { IGridEditEventArgs } from '../common/events';

const first = <T>(array: T[]): T => array[0];

const DATA = [
    {
        id: 0,
        user: {
            name: {
                first: 'John',
                last: 'Doe'
            },
            email: 'johndoe@mail.com',
            age: 30,
            address: {
                zip: 1000,
                country: 'USA'
            }
        },
        active: true
    },
    {
        id: 1,
        user: {
            name: {
                first: 'Jane',
                last: 'Doe'
            },
            email: 'jane@gmail.com',
            age: 23,
            address: {
                zip: 2000,
                country: 'England'
            }
        },
        active: true
    },
    {
        id: 2,
        user: {
            name: {
                first: 'Ivan',
                last: 'Ivanov'
            },
            email: 'ivanko@po6ta.bg',
            age: 33,
            address: {
                zip: 1700,
                country: 'Bulgaria'
            }
        },
        active: false
    },
    {
        id: 3,
        user: {
            name: {
                first: 'Bianka',
                last: 'Bartosik'
            },
            email: 'bbb@gmail.pl',
            age: 21,
            address: {
                zip: 6000,
                country: 'Poland'
            }
        },
        active: true
    }
];

const LOCATIONS = [
    {
        id: 0,
        shop: 'My Cool Market'
    },
    {
        id: 1,
        shop: 'MarMaMarket'
    },
    {
        id: 2,
        shop: 'Fun-Tasty Co.'
    },
    {
        id: 3,
        shop: 'MarMaMarket'
    }
];

const DATA2 = [
    {
        id: 0,
        productName: 'Chai',
        locations: [{ ...LOCATIONS[2] }]
    },
    {
        id: 1,
        productName: 'Chang',
        locations: [{ ...LOCATIONS[0] }, { ...LOCATIONS[1] }]
    },
    {
        id: 2,
        productName: 'Aniseed Syrup',
        locations: [{ ...LOCATIONS[0] }, { ...LOCATIONS[1] }, { ...LOCATIONS[2] }]
    },
    {
        id: 3,
        productName: 'Uncle Bobs Organic Dried Pears',
        locations: [{ ...LOCATIONS[2] }, { ...LOCATIONS[3] }]
    },
];

@Component({
    template: `<igx-grid></igx-grid>`
})
class NestedPropertiesGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public grid: IgxGridComponent;
}

@Component({
    template: `<igx-grid #grid [autoGenerate]='false'>
        <igx-column field='id' header='ID' dataType='number'></igx-column>
        <igx-column field='user.name.first' header='First Name' editable='true' dataType='string'></igx-column>
        <igx-column field='user.name.last' header='Last Name' editable='true' dataType='string'></igx-column>
        <igx-column field='user.email' header='E-Mail' editable='true' dataType='string'></igx-column>
        <igx-column field='user.age' header='Age' [sortable]="true" editable='true' dataType='number'></igx-column>
        <igx-column field='user.address.zip' header='ZIP' editable='true' dataType='number'></igx-column>
        <igx-column field='user.address.country' header='Country' editable='true' dataType='string'></igx-column>
        <igx-column field='active' header='Active' editable='true' dataType='boolean'></igx-column>
    </igx-grid>`
})
class NestedPropertiesGrid2Component {
    @ViewChild('grid', { static: true, read: IgxGridComponent })
    public grid: IgxGridComponent;
}

@Component({
    template: `<igx-grid #grid [autoGenerate]='false'>
        <igx-column field='id' header='ID' dataType='number'></igx-column>
        <igx-column field='productName' header='Product Name' editable='true' dataType='string'></igx-column>
        <igx-column field='locations' header='Available At' [editable]='true' width='220px'>
            <ng-template igxCell let-cell='cell'>
                {{ parseArray(cell.value) }}
            </ng-template>
            <ng-template igxCellEditor let-cell='cell'>
                <igx-combo type='line' [(ngModel)]='cell.editValue' [data]='locations' [displayKey]="'shop'" width='220px'></igx-combo>
            </ng-template>
        </igx-column>
    </igx-grid>`
})
class NestedPropertyGridComponent {
    @ViewChild('grid', { static: true, read: IgxGridComponent })
    public grid: IgxGridComponent;

    @ViewChild(IgxComboComponent, { read: IgxComboComponent })
    public combo: IgxComboComponent;

    public locations = LOCATIONS;
    public parseArray(arr: { id: number; shop: string }[]): string {
        return (arr || []).map((e) => e.shop).join(', ');
    }
}

describe('Grid - nested data source properties', () => {

    const NAMES = 'John Jane Ivan Bianka'.split(' ');
    const AGES = [30, 23, 33, 21];

    describe('API', () => {

        it('should correctly resolve key paths in nested data', () => {
            expect(
                DATA.map(record => resolveNestedPath(record, 'user.name.first'))
            ).toEqual(NAMES);
            expect(
                DATA.map(record => resolveNestedPath(record, 'user.age'))
            ).toEqual(AGES);
        });
    });

    describe('Grid base cases', () => {

        let fixture: ComponentFixture<NestedPropertiesGridComponent>;
        let grid: IgxGridComponent;

        const setupData = (data: Array<any>) => {
            grid.autoGenerate = true;
            grid.shouldGenerate = true;
            grid.data = data;
            fixture.detectChanges();
        };

        configureTestSuite((() => {
            TestBed.configureTestingModule({
                declarations: [NestedPropertiesGridComponent],
                imports: [IgxGridModule, NoopAnimationsModule]
            });
        }));

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(NestedPropertiesGridComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        }));

        it('should support column API with complex field', () => {
            setupData(DATA);

            const column = grid.getColumnByName('user');
            column.field = 'user.name.first';
            fixture.detectChanges();

            expect(grid.getColumnByName('user.name.first')).toBe(column);
        });

        it('should render the passed properties path', () => {
            setupData(DATA);

            const column = grid.getColumnByName('user');
            column.field = 'user.name.first';
            fixture.detectChanges();

            expect(column.cells.map(cell => cell.value)).toEqual(NAMES);
        });

        it('should work with sorting', () => {
            setupData(DATA);

            const key = 'user.age';

            const column = grid.getColumnByName('user');
            column.field = key;
            fixture.detectChanges();

            grid.sort({ fieldName: key, dir: SortingDirection.Asc });
            fixture.detectChanges();

            expect(first(column.cells.map(cell => cell.value))).toEqual(21);

            grid.sort({ fieldName: key, dir: SortingDirection.Desc });
            fixture.detectChanges();

            expect(first(column.cells.map(cell => cell.value))).toEqual(33);
        });

        it('should work with filtering', () => {
            setupData(DATA);

            const key = 'user.name.first';
            const operand = IgxStringFilteringOperand.instance().condition('equals');

            const column = grid.getColumnByName('user');
            column.field = key;
            fixture.detectChanges();

            grid.filter(key, 'Jane', operand);
            fixture.detectChanges();

            expect(grid.dataView.length).toEqual(1);
            expect(first(column.cells).value).toEqual('Jane');
        });

        it('should support copy/paste operations', () => {
            setupData(DATA);

            grid.getColumnByName('user').field = 'user.name.first';
            fixture.detectChanges();


            grid.setSelection({ columnStart: 'user.name.first', columnEnd: 'user.name.first', rowStart: 0, rowEnd: 0 });
            fixture.detectChanges();

            const selected = grid.getSelectedData();
            expect(selected.length).toEqual(1);
            expect(first(selected)['user.name.first']).toMatch('John');
        });

        it('should work with editing (cell)', () => {
            const copiedData = cloneArray(DATA, true);
            setupData(copiedData);

            const key = 'user.name.first';
            const column = grid.getColumnByName('user');
            column.field = key;
            grid.primaryKey = 'id';
            fixture.detectChanges();

            grid.updateCell('Anonymous', 0, key);
            fixture.detectChanges();

            expect(first(copiedData).user.name.first).toMatch('Anonymous');
        });

        it('should work with editing (row)', () => {
            const copiedData = cloneArray(DATA, true);
            setupData(copiedData);

            grid.primaryKey = 'id';
            grid.getColumnByName('user').field = 'user.name.first';
            fixture.detectChanges();

            grid.updateRow({ user: { name: { first: 'Updated!' } } }, 0);
            fixture.detectChanges();

            expect(first(copiedData).user.name.first).toMatch('Updated!');
        });
    });
});

// related to fix of issue #8343
describe('Grid nested data advanced editing', () => {

    let fixture: ComponentFixture<NestedPropertiesGrid2Component>;
    let grid: IgxGridComponent;
    let gridContent: DebugElement;

    const setupData = (data: Array<any>, rowEditable = false) => {
        grid.data = data;
        if (rowEditable) {
            grid.primaryKey = 'id';
            grid.rowEditable = true;
        }
        fixture.detectChanges();
    };

    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [NestedPropertiesGrid2Component],
            imports: [IgxGridModule, NoopAnimationsModule]
        });
    }));

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(NestedPropertiesGrid2Component);
        fixture.detectChanges();
        grid = fixture.componentInstance.grid;
        gridContent = GridFunctions.getGridContent(fixture);
    }));

    it('canceling the row editing should revert the uncommitted cell values', () => {
        const copiedData = cloneArray(DATA, true);
        setupData(copiedData, true);

        const cell1 = grid.getCellByColumn(0, 'user.name.first');
        const cell2 = grid.getCellByColumn(0, 'user.name.last');
        const cell3 = grid.getCellByColumn(0, 'user.email');

        UIInteractions.simulateDoubleClickAndSelectEvent(cell1);
        fixture.detectChanges();
        expect(cell1.editMode).toBe(true);
        cell1.editValue = 'Petar';

        UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
        fixture.detectChanges();

        expect(cell1.editMode).toBe(false);
        expect(cell2.editMode).toBe(true);

        UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
        fixture.detectChanges();

        expect(cell2.editMode).toBe(false);
        expect(cell3.editMode).toBe(true);

        UIInteractions.triggerEventHandlerKeyDown('escape', gridContent);
        fixture.detectChanges();

        expect(cell3.editMode).toBe(false);

        expect(cell1.value).toBeDefined(true);
        expect(cell2.value).toBeDefined(true);
        expect(cell3.value).toBeDefined(true);
        // related to issue #0000, comment out the below line after fixing the issue
        expect(first(copiedData).user.name.first).toMatch('John');
        expect(first(copiedData).user.name.last).toMatch('Doe');
    });

    it('after updating a cell value the value in the previous cell should persist', () => {
        const copiedData = cloneArray(DATA, true);
        setupData(copiedData, true);

        const cell1 = grid.getCellByColumn(0, 'user.name.first');
        const cell2 = grid.getCellByColumn(0, 'user.name.last');
        const cell3 = grid.getCellByColumn(0, 'user.email');

        UIInteractions.simulateDoubleClickAndSelectEvent(cell2);
        fixture.detectChanges();
        expect(cell2.editMode).toBe(true);
        cell2.editValue = 'Petrov';

        UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
        fixture.detectChanges();

        expect(cell2.editMode).toBe(false);
        expect(cell3.editMode).toBe(true);
        expect(cell1.value).toBeDefined(true);
    });

    it('updating values of multiple cells in a row should update the data correctly', () => {
        const copiedData = cloneArray(DATA, true);
        setupData(copiedData, true);

        const cell1 = grid.getCellByColumn(0, 'user.name.first');
        const cell2 = grid.getCellByColumn(0, 'user.name.last');
        const cell3 = grid.getCellByColumn(0, 'user.email');

        UIInteractions.simulateDoubleClickAndSelectEvent(cell1);
        fixture.detectChanges();
        expect(cell1.editMode).toBe(true);
        cell1.editValue = 'Petar';

        UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
        fixture.detectChanges();

        expect(cell1.editMode).toBe(false);
        expect(cell2.editMode).toBe(true);
        cell2.editValue = 'Petrov';

        UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
        fixture.detectChanges();

        expect(cell2.editMode).toBe(false);
        expect(cell3.editMode).toBe(true);
        cell3.editValue = 'ppetrov@email.com';

        UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
        fixture.detectChanges();

        expect(cell1.value).toBeDefined(true);
        expect(cell2.value).toBeDefined(true);
        expect(cell3.value).toBeDefined(true);
        expect(first(copiedData).user.name.last).toMatch('Petrov');
    });

    it('sorting the grid and modifying a cell within an unsorted column should not change the rows order', async () => {
        const copiedData = cloneArray(DATA, true);
        setupData(copiedData);

        const header = GridFunctions.getColumnHeader('user.age', fixture);
        UIInteractions.simulateClickAndSelectEvent(header);

        expect(grid.headerGroupsList[0].isFiltered).toBeFalsy();
        GridFunctions.verifyHeaderSortIndicator(header, false, false);

        GridFunctions.clickHeaderSortIcon(header);
        GridFunctions.clickHeaderSortIcon(header);
        fixture.detectChanges();

        GridFunctions.verifyHeaderSortIndicator(header, false, true);

        const cell1 = grid.getCellByColumn(0, 'user.address.zip');
        expect(cell1.value).toEqual(1700);

        UIInteractions.simulateDoubleClickAndSelectEvent(cell1);
        fixture.detectChanges();
        expect(cell1.editMode).toBe(true);
        cell1.editValue = 1618;

        UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(grid.getRowByIndex(0).data.user.address.zip).toMatch('1618');
        expect(copiedData[2].user.address.zip).toMatch('1618');
    });
});

// related to issue #8343
describe('Edit cell with data of type Array', () => {

    let fixture: ComponentFixture<NestedPropertyGridComponent>;
    let grid: IgxGridComponent;
    let combo: IgxComboComponent;
    let gridContent: DebugElement;

    const setupData = (data: Array<any>, rowEditable = false) => {
        grid.data = data;
        if (rowEditable) {
            grid.primaryKey = 'id';
            grid.rowEditable = true;
        }
        fixture.detectChanges();
    };

    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [NestedPropertyGridComponent],
            imports: [IgxGridModule, IgxComboModule, FormsModule, IgxToggleModule,
                ReactiveFormsModule, IgxFocusModule, IgxInputGroupModule, NoopAnimationsModule]
        });
    }));

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(NestedPropertyGridComponent);
        fixture.detectChanges();
        grid = fixture.componentInstance.grid;
        gridContent = GridFunctions.getGridContent(fixture);
    }));

    it('igxGrid should emit the correct args when cell editing is cancelled', async () => {
        const copiedData = cloneArray(DATA2, true);
        setupData(copiedData);

        spyOn(grid.cellEditEnter, 'emit').and.callThrough();
        spyOn(grid.cellEditExit, 'emit').and.callThrough();

        const cell = grid.getCellByColumn(2, 'locations');
        let initialRowData = { ...cell.row.data };

        UIInteractions.simulateDoubleClickAndSelectEvent(grid.gridAPI.get_cell_by_index(2, 'locations'));
        fixture.detectChanges();
        combo = fixture.componentInstance.combo;
        fixture.detectChanges();
        await fixture.whenStable();

        const cellArgs: IGridEditEventArgs = {
            rowID: cell.row.key,
            cellID: cell.cellID,
            rowData: initialRowData,
            oldValue: initialRowData.locations,
            cancel: false,
            column: cell.column,
            owner: grid,
            event: jasmine.anything() as any
        };

        expect(grid.cellEditEnter.emit).toHaveBeenCalledTimes(1);
        expect(grid.cellEditEnter.emit).toHaveBeenCalledWith(cellArgs);
        expect(cell.editMode).toBeTruthy();
        expect(combo.selectedItems().length).toEqual(3);

        combo.deselectItems([cell.editValue[0], cell.editValue[1]]);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(grid.data[2].locations.length).toEqual(3);
        expect(cell.editValue.length).toEqual(1);
        cellArgs.newValue = [cell.editValue[0]];

        UIInteractions.triggerEventHandlerKeyDown('escape', gridContent);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(cell.editMode).toBeFalsy();

        initialRowData = { ...cell.row.data };
        cellArgs.rowData = initialRowData;

        expect(cellArgs.newValue.length).toEqual(1);
        expect(cellArgs.oldValue.length).toEqual(3);

        delete cellArgs.cancel;

        expect(grid.cellEditExit.emit).toHaveBeenCalledTimes(1);
        expect(grid.cellEditExit.emit).toHaveBeenCalledWith(cellArgs);

        expect(copiedData[2].locations.length).toEqual(3);
    });

    it('igxGrid should emit the correct args when submitting the changes', async () => {
        const copiedData = cloneArray(DATA2, true);
        setupData(copiedData);

        spyOn(grid.cellEditEnter, 'emit').and.callThrough();
        spyOn(grid.cellEdit, 'emit').and.callThrough();
        spyOn(grid.cellEditDone, 'emit').and.callThrough();
        spyOn(grid.cellEditExit, 'emit').and.callThrough();

        const cell = grid.getCellByColumn(2, 'locations');
        let initialRowData = { ...cell.row.data };

        UIInteractions.simulateDoubleClickAndSelectEvent(grid.gridAPI.get_cell_by_index(2, 'locations'));
        fixture.detectChanges();
        combo = fixture.componentInstance.combo;
        fixture.detectChanges();
        await fixture.whenStable();

        const cellArgs: IGridEditEventArgs = {
            rowID: cell.row.key,
            cellID: cell.cellID,
            rowData: initialRowData,
            oldValue: initialRowData.locations,
            cancel: false,
            column: cell.column,
            owner: grid,
            event: jasmine.anything() as any
        };

        expect(grid.cellEditEnter.emit).toHaveBeenCalledTimes(1);
        expect(grid.cellEditEnter.emit).toHaveBeenCalledWith(cellArgs);
        expect(cell.editMode).toBeTruthy();
        expect(combo.selectedItems().length).toEqual(3);

        combo.deselectItems([cell.editValue[0], cell.editValue[1]]);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(grid.data[2].locations.length).toEqual(3);
        expect(cell.editValue.length).toEqual(1);

        UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(cell.editMode).toBeFalsy();

        initialRowData = { ...cell.row.data };
        cellArgs.rowData = initialRowData;
        cellArgs.newValue = initialRowData.locations;

        expect(cellArgs.newValue.length).toEqual(1);
        expect(cellArgs.oldValue.length).toEqual(3);

        expect(grid.cellEdit.emit).toHaveBeenCalledTimes(1);
        expect(grid.cellEdit.emit).toHaveBeenCalledWith(cellArgs);

        delete cellArgs.cancel;

        expect(grid.cellEditDone.emit).toHaveBeenCalledTimes(1);
        expect(grid.cellEditDone.emit).toHaveBeenCalledWith(cellArgs);

        expect(grid.cellEditExit.emit).toHaveBeenCalledTimes(1);
        expect(grid.cellEditExit.emit).toHaveBeenCalledWith(cellArgs);

        expect(copiedData[2].locations.length).toEqual(1);
    });

    it('igxGrid should emit the correct args when row editing is cancelled', async () => {
        const copiedData = cloneArray(DATA2, true);
        setupData(copiedData, true);

        spyOn(grid.rowEditEnter, 'emit').and.callThrough();
        spyOn(grid.rowEditExit, 'emit').and.callThrough();

        const cell = grid.getCellByColumn(2, 'locations');
        const row = grid.gridAPI.get_row_by_index(2);
        let initialRowData = { ...cell.row.data };

        UIInteractions.simulateDoubleClickAndSelectEvent(grid.gridAPI.get_cell_by_index(2, 'locations'));
        fixture.detectChanges();
        combo = fixture.componentInstance.combo;
        fixture.detectChanges();
        await fixture.whenStable();

        // TODO ROW addRow
        const rowArgs: IGridEditEventArgs = {
            rowID: row.rowID,
            rowData: initialRowData,
            oldValue: row.rowData,
            owner: grid,
            isAddRow: row.addRow,
            cancel: false,
            event: jasmine.anything() as any
        };

        expect(grid.rowEditEnter.emit).toHaveBeenCalledTimes(1);
        expect(grid.rowEditEnter.emit).toHaveBeenCalledWith(rowArgs);
        expect(row.inEditMode).toBeTruthy();
        expect(cell.editMode).toBeTruthy();
        expect(combo.selectedItems().length).toEqual(3);

        combo.deselectItems([cell.editValue[0], cell.editValue[1]]);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(grid.data[2].locations.length).toEqual(3);
        expect(cell.editValue.length).toEqual(1);

        grid.gridAPI.crudService.endEdit(false);
        fixture.detectChanges();
        await fixture.whenStable();
        rowArgs.event = undefined;
        expect(row.inEditMode).toBeFalsy();
        expect(cell.editMode).toBeFalsy();

        initialRowData = { ...cell.row.data };
        rowArgs.newValue = initialRowData;

        delete rowArgs.cancel;

        expect(rowArgs.newValue.locations.length).toEqual(3);
        expect(rowArgs.oldValue.locations.length).toEqual(3);
        expect(grid.rowEditExit.emit).toHaveBeenCalledTimes(1);
        expect(grid.rowEditExit.emit).toHaveBeenCalledWith(rowArgs);

        expect(copiedData[2].locations.length).toEqual(3);
    });

    it('igxGrid should emit the correct args when submitting the row changes', async () => {
        const copiedData = cloneArray(DATA2, true);
        setupData(copiedData, true);

        spyOn(grid.rowEditEnter, 'emit').and.callThrough();
        spyOn(grid.rowEdit, 'emit').and.callThrough();
        spyOn(grid.rowEditDone, 'emit').and.callThrough();
        spyOn(grid.rowEditExit, 'emit').and.callThrough();

        const cell = grid.getCellByColumn(2, 'locations');
        const row = grid.gridAPI.get_row_by_index(2);
        let initialRowData = { ...cell.row.data };

        UIInteractions.simulateDoubleClickAndSelectEvent(grid.gridAPI.get_cell_by_index(2, 'locations'));
        fixture.detectChanges();
        combo = fixture.componentInstance.combo;
        fixture.detectChanges();
        await fixture.whenStable();

        // TODO ROW addRow
        const rowArgs: IGridEditEventArgs = {
            rowID: row.rowID,
            rowData: initialRowData,
            oldValue: row.rowData,
            owner: grid,
            isAddRow: row.addRow,
            cancel: false,
            event: jasmine.anything() as any
        };

        expect(grid.rowEditEnter.emit).toHaveBeenCalledTimes(1);
        expect(grid.rowEditEnter.emit).toHaveBeenCalledWith(rowArgs);
        expect(row.inEditMode).toBeTruthy();
        expect(cell.editMode).toBeTruthy();
        expect(combo.selectedItems().length).toEqual(3);

        combo.deselectItems([cell.editValue[0], cell.editValue[1]]);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(grid.data[2].locations.length).toEqual(3);
        expect(cell.editValue.length).toEqual(1);

        grid.gridAPI.crudService.endEdit(true);
        fixture.detectChanges();
        await fixture.whenStable();
        rowArgs.event = undefined;
        expect(row.inEditMode).toBeFalsy();
        expect(cell.editMode).toBeFalsy();

        initialRowData = { ...cell.row.data };
        rowArgs.newValue = initialRowData;

        expect(rowArgs.newValue.locations.length).toEqual(1);
        expect(rowArgs.oldValue.locations.length).toEqual(3);

        expect(grid.rowEdit.emit).toHaveBeenCalledTimes(1);
        expect(grid.rowEdit.emit).toHaveBeenCalledWith(rowArgs);

        delete rowArgs.cancel;
        rowArgs.rowData = initialRowData;

        expect(grid.rowEditDone.emit).toHaveBeenCalledTimes(1);
        expect(grid.rowEditDone.emit).toHaveBeenCalledWith(rowArgs);

        expect(grid.rowEditExit.emit).toHaveBeenCalledTimes(1);
        expect(grid.rowEditExit.emit).toHaveBeenCalledWith(rowArgs);

        expect(copiedData[2].locations.length).toEqual(1);
    });
});
