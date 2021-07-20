import { TestBed, fakeAsync } from '@angular/core/testing';
import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    CollapsibleColumnGroupTestComponent,
    CollapsibleGroupsTemplatesTestComponent,
    CollapsibleGroupsDynamicColComponent
} from '../../test-utils/grid-samples.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DropPosition } from '../moving/moving.service';

describe('IgxGrid - multi-column headers #grid', () => {

    let contactInf;
    let countryInf;
    let addressInf;
    let regionInf;
    let cityInf;
    let phoneCol;
    let countryCol;
    let emptyCol;

    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                CollapsibleColumnGroupTestComponent,
                CollapsibleGroupsTemplatesTestComponent,
                CollapsibleGroupsDynamicColComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule
            ]
        });
    }));

    describe('Base Tests', () => {
        let fixture;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(CollapsibleColumnGroupTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            contactInf = GridFunctions.getColGroup(grid, 'Contact Information');
            countryInf = GridFunctions.getColGroup(grid, 'Country Information');
            addressInf = GridFunctions.getColGroup(grid, 'Address Information');
            regionInf = GridFunctions.getColGroup(grid, 'Region Information');
            cityInf = GridFunctions.getColGroup(grid, 'City Information');
            phoneCol = grid.getColumnByName('Phone');
            countryCol = grid.getColumnByName('Country');
            emptyCol = grid.getColumnByName('Empty');
        }));

        it('verify setting collapsible to a column group ', () => {
            GridFunctions.verifyColumnIsHidden(contactInf, false, 10);
            GridFunctions.verifyColumnIsHidden(countryInf, true, 10);

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf);
            GridFunctions.verifyGroupIsExpanded(fixture, contactInf, false);

            spyOn(addressInf.collapsibleChange, 'emit').and.callThrough();
            addressInf.collapsible = false;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(contactInf, false, 19);
            GridFunctions.verifyColumnIsHidden(countryInf, false, 19);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, false);
            expect(addressInf.collapsibleChange.emit).toHaveBeenCalledTimes(1);
            expect(addressInf.collapsibleChange.emit).toHaveBeenCalledWith(false);

            addressInf.collapsible = true;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(contactInf, false, 10);
            GridFunctions.verifyColumnIsHidden(countryInf, true, 10);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf);
            expect(addressInf.collapsibleChange.emit).toHaveBeenCalledTimes(2);
            expect(addressInf.collapsibleChange.emit).toHaveBeenCalledWith(true);
        });

        it('verify setting collapsible when all the column has same visibleWhenCollapsed', () => {
            addressInf.collapsible = false;
            fixture.detectChanges();

            expect(contactInf.collapsible).toBeFalsy();
            expect(countryInf.collapsible).toBeFalsy();

            GridFunctions.verifyGroupIsExpanded(fixture, contactInf, false);
            GridFunctions.verifyGroupIsExpanded(fixture, countryInf, false);

            countryCol.visibleWhenCollapsed = false;
            phoneCol.visibleWhenCollapsed = true;

            fixture.detectChanges();

            expect(contactInf.collapsible).toBeTruthy();
            expect(countryInf.collapsible).toBeTruthy();

            GridFunctions.verifyGroupIsExpanded(fixture, contactInf);
            GridFunctions.verifyGroupIsExpanded(fixture, countryInf);

            GridFunctions.verifyColumnIsHidden(countryCol, false, 12);
            GridFunctions.verifyColumnIsHidden(emptyCol, false, 12);
            GridFunctions.verifyColumnIsHidden(regionInf, true, 12);

            GridFunctions.verifyColumnIsHidden(grid.getColumnByName('Fax'), false, 12);
            GridFunctions.verifyColumnIsHidden(phoneCol, true, 12);
        });

        it('verify setting expanded to a column group', () => {
            spyOn(addressInf.expandedChange, 'emit').and.callThrough();
            addressInf.expanded = false;
            fixture.detectChanges();

            expect(addressInf.expanded).toBeFalsy();
            GridFunctions.verifyColumnIsHidden(contactInf, true, 16);
            GridFunctions.verifyColumnIsHidden(countryInf, false, 16);

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, false);
            expect(addressInf.expandedChange.emit).toHaveBeenCalledTimes(1);
            expect(addressInf.expandedChange.emit).toHaveBeenCalledWith(false);

            addressInf.expanded = true;
            fixture.detectChanges();

            expect(addressInf.expanded).toBeTruthy();
            GridFunctions.verifyColumnIsHidden(contactInf, false, 10);
            GridFunctions.verifyColumnIsHidden(countryInf, true, 10);

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf);
            expect(addressInf.expandedChange.emit).toHaveBeenCalledTimes(2);
            expect(addressInf.expandedChange.emit).toHaveBeenCalledWith(true);
        });

        it('verify setting expanded to a column group form UI', () => {
            spyOn(addressInf.expandedChange, 'emit').and.callThrough();
            GridFunctions.clickGroupExpandIndicator(fixture, addressInf);
            fixture.detectChanges();

            expect(addressInf.expanded).toBeFalsy();
            GridFunctions.verifyColumnIsHidden(contactInf, true, 16);
            GridFunctions.verifyColumnIsHidden(countryInf, false, 16);

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, false);
            expect(addressInf.expandedChange.emit).toHaveBeenCalledTimes(1);
            expect(addressInf.expandedChange.emit).toHaveBeenCalledWith(false);

            GridFunctions.clickGroupExpandIndicator(fixture, addressInf);
            fixture.detectChanges();

            expect(addressInf.expanded).toBeTruthy();
            GridFunctions.verifyColumnIsHidden(contactInf, false, 10);
            GridFunctions.verifyColumnIsHidden(countryInf, true, 10);

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf);
            expect(addressInf.expandedChange.emit).toHaveBeenCalledTimes(2);
            expect(addressInf.expandedChange.emit).toHaveBeenCalledWith(true);
        });

        it('verify setting visibleWhenCollapseChange when group is expanded', () => {
            addressInf.expanded = false;
            countryCol.visibleWhenCollapsed = false;
            regionInf.visibleWhenCollapsed = false;
            fixture.detectChanges();
            spyOn(countryCol.visibleWhenCollapsedChange, 'emit').and.callThrough();
            spyOn(cityInf.visibleWhenCollapsedChange, 'emit').and.callThrough();
            spyOn(emptyCol.visibleWhenCollapsedChange, 'emit').and.callThrough();

            GridFunctions.verifyGroupIsExpanded(fixture, countryInf);
            GridFunctions.verifyColumnsAreHidden([countryCol, emptyCol, regionInf], false, 13);
            GridFunctions.verifyColumnIsHidden(cityInf, true, 13);

            // Change visibleWhenCollapsed to column country
            countryCol.visibleWhenCollapsed = true;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, countryInf);
            GridFunctions.verifyColumnsAreHidden([countryCol, cityInf], true, 12);
            GridFunctions.verifyColumnsAreHidden([emptyCol, regionInf], false, 12);
            expect(countryCol.visibleWhenCollapsedChange.emit).toHaveBeenCalledTimes(1);
            expect(countryCol.visibleWhenCollapsedChange.emit).toHaveBeenCalledWith(true);

            // Change visibleWhenCollapsed to group
            cityInf.visibleWhenCollapsed = false;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, countryInf);
            GridFunctions.verifyColumnIsHidden(countryCol, true, 15);
            GridFunctions.verifyColumnsAreHidden([emptyCol, regionInf, cityInf], false, 15);
            expect(cityInf.visibleWhenCollapsedChange.emit).toHaveBeenCalledTimes(1);
            expect(cityInf.visibleWhenCollapsedChange.emit).toHaveBeenCalledWith(false);

            // Change visibleWhenCollapsed form null false
            emptyCol.visibleWhenCollapsed = true;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, countryInf);
            GridFunctions.verifyColumnsAreHidden([countryCol, emptyCol], true, 14);
            GridFunctions.verifyColumnsAreHidden([regionInf, cityInf], false, 14);
            expect(emptyCol.visibleWhenCollapsedChange.emit).toHaveBeenCalledTimes(1);
            expect(emptyCol.visibleWhenCollapsedChange.emit).toHaveBeenCalledWith(true);
        });

        it('verify setting visibleWhenCollapseChange when group is collapsed', () => {
            addressInf.expanded = false;
            countryCol.visibleWhenCollapsed = false;
            regionInf.visibleWhenCollapsed = false;
            countryInf.expanded = false;
            fixture.detectChanges();

            spyOn(regionInf.visibleWhenCollapsedChange, 'emit').and.callThrough();
            spyOn(cityInf.visibleWhenCollapsedChange, 'emit').and.callThrough();
            spyOn(countryCol.visibleWhenCollapsedChange, 'emit').and.callThrough();

            // set visibleWhenCollapsed to true
            regionInf.visibleWhenCollapsed = true;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, countryInf, true, false);
            GridFunctions.verifyColumnIsHidden(countryCol, true, 15);
            GridFunctions.verifyColumnsAreHidden([regionInf, cityInf, emptyCol], false, 15);

            // set visibleWhenCollapsed to false
            cityInf.visibleWhenCollapsed = false;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, countryInf, true, false);
            GridFunctions.verifyColumnsAreHidden([countryCol, cityInf], true, 12);
            GridFunctions.verifyColumnsAreHidden([regionInf, emptyCol], false, 12);

            // set visibleWhenCollapsed to null
            countryCol.visibleWhenCollapsed = undefined;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, countryInf, true, false);
            GridFunctions.verifyColumnsAreHidden([countryCol, cityInf], true, 12);
            GridFunctions.verifyColumnsAreHidden([regionInf, emptyCol], false, 12);

            // verify events
            expect(regionInf.visibleWhenCollapsedChange.emit).toHaveBeenCalledTimes(1);
            expect(regionInf.visibleWhenCollapsedChange.emit).toHaveBeenCalledWith(true);
            expect(cityInf.visibleWhenCollapsedChange.emit).toHaveBeenCalledTimes(1);
            expect(cityInf.visibleWhenCollapsedChange.emit).toHaveBeenCalledWith(false);
            expect(countryCol.visibleWhenCollapsedChange.emit).toHaveBeenCalledTimes(1);
            expect(countryCol.visibleWhenCollapsedChange.emit).toHaveBeenCalledWith(undefined);
        });

        it('verify ARIA Support', () => {
            const contactInfHeader = GridFunctions.getColumnGroupHeaderCell(contactInf.header, fixture);
            const addressInfHeader = GridFunctions.getColumnGroupHeaderCell(addressInf.header, fixture);

            expect(contactInfHeader.attributes['role']).toEqual('columnheader');
            expect(addressInfHeader.attributes['role']).toEqual('columnheader');

            expect(contactInfHeader.attributes['aria-label']).toEqual(contactInf.header);
            expect(addressInfHeader.attributes['aria-label']).toEqual(addressInf.header);
            expect(addressInfHeader.attributes['aria-expanded']).toEqual('true');

            addressInf.expanded = false;
            fixture.detectChanges();
            expect(addressInfHeader.attributes['aria-expanded']).toEqual('false');
        });
    });

    describe('Templates Tests', () => {
        let fixture;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(CollapsibleGroupsTemplatesTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            addressInf = GridFunctions.getColGroup(grid, 'Address Information');
        }));

        it('verify that templates can be defined in the markup', () => {
            const generalInf = GridFunctions.getColGroup(grid, 'General Information');
            GridFunctions.verifyGroupIsExpanded(fixture, generalInf, true, true, ['remove', 'add']);

            generalInf.expanded = false;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, generalInf, true, false, ['remove', 'add']);
        });

        it('verify setting templates by property', () => {
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf);

            // Set template
            addressInf.collapsibleIndicatorTemplate = fixture.componentInstance.indicatorTemplate;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, true, ['lock', 'lock_open']);

            addressInf.expanded = false;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, false, ['lock', 'lock_open']);

            // remove template
            addressInf.collapsibleIndicatorTemplate = null;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, false);
        });
    });

    describe('Dynamic Columns Tests', () => {
        let fixture;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            pending('The test will work when use Angular 9');
            fixture = TestBed.createComponent(CollapsibleGroupsDynamicColComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        }));

        it('verify adding columns', () => {
            pending('The test will work when use Angular 9');
            const firstGroup = GridFunctions.getColGroup(grid, 'First');
            GridFunctions.verifyGroupIsExpanded(fixture, firstGroup, false);
            fixture.detectChanges();

            // add a column to first group
            fixture.componentInstance.columnGroups[0].columns.push({ field: 'Fax', type: 'string', visibleWhenCollapsed: false  });
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, firstGroup);

            firstGroup.expanded = false;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, firstGroup, true, false);
            GridFunctions.verifyColumnsAreHidden(
                [grid.getColumnByName('ID'), grid.getColumnByName('CompanyName'), grid.getColumnByName('ContactName')], false, 7);
            GridFunctions.verifyColumnIsHidden(grid.getColumnByName('Fax'), true, 7);
        });

        it('verify deleting columns', () => {
            pending('The test will work when use Angular 9');
            const secondGroup = GridFunctions.getColGroup(grid, 'Second');
            GridFunctions.verifyGroupIsExpanded(fixture, secondGroup);
            fixture.detectChanges();

            // delete a column
            fixture.componentInstance.columnGroups[1].columns.pop();
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, secondGroup);

            GridFunctions.verifyColumnIsHidden(grid.getColumnByName('PostlCode'), false, 6);

            // delete another column
            fixture.componentInstance.columnGroups[1].columns = fixture.componentInstance.columnGroups[1].columns.splice(2);
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, secondGroup, false);
        });

        it('verify updating columns', () => {
            pending('The test will work when use Angular 9');
            const secondGroup = GridFunctions.getColGroup(grid, 'Second');
            const firstGroup = GridFunctions.getColGroup(grid, 'First');

            GridFunctions.verifyGroupIsExpanded(fixture, firstGroup, false);
            GridFunctions.verifyGroupIsExpanded(fixture, secondGroup);

            // update a column a column
            fixture.componentInstance.columnGroups[0].columns[0].visibleWhenCollapsed = false;
            fixture.detectChanges();
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, firstGroup);
            GridFunctions.verifyColumnsAreHidden([grid.getColumnByName('CompanyName'), grid.getColumnByName('ContactName')], true, 5);
            GridFunctions.verifyColumnIsHidden(grid.getColumnByName('ID'), false, 5);

            // update a column in second group
            GridFunctions.verifyColumnIsHidden(grid.getColumnByName('ContactTitle'), true, 5);
            fixture.componentInstance.columnGroups[1].columns[0].visibleWhenCollapsed = false;
            fixture.detectChanges();
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(grid.getColumnByName('ContactTitle'), false, 6);

            fixture.componentInstance.columnGroups[1].columns[1].visibleWhenCollapsed = false;
            fixture.detectChanges();
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, secondGroup, false);
        });
    });

    describe('Integration Tests', () => {
        let fixture;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(CollapsibleColumnGroupTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            regionInf = GridFunctions.getColGroup(grid, 'Region Information');
            countryInf = GridFunctions.getColGroup(grid, 'Country Information');
            contactInf = GridFunctions.getColGroup(grid, 'Contact Information');
            addressInf = GridFunctions.getColGroup(grid, 'Address Information');
            phoneCol = grid.getColumnByName('Phone');
            countryCol = grid.getColumnByName('Country');
        }));

        it('Hiding: Verify that expanded state is preserved when hide column group', () => {
            addressInf.expanded = false;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, false);
            addressInf.hidden = true;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(addressInf, true, 6);
            addressInf.hidden = false;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(addressInf, false, 16);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, false);

            addressInf.expanded = true;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(addressInf, false, 10);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, true);
            addressInf.hidden = true;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(addressInf, true, 6);
            addressInf.hidden = false;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(addressInf, false, 10);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, true);
        });

        it('Hiding: Verify that column can be hidden when the group is expanded', () => {
            expect(addressInf.expanded).toBe(true);
            GridFunctions.verifyColumnIsHidden(phoneCol, false, 10);
            phoneCol.hidden = true;
            fixture.detectChanges();

            expect(addressInf.expanded).toBe(true);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, true);
            GridFunctions.verifyColumnIsHidden(phoneCol, true, 9);
            phoneCol.hidden = false;
            fixture.detectChanges();

            expect(addressInf.expanded).toBe(true);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, true);
            GridFunctions.verifyColumnIsHidden(phoneCol, false, 10);
        });

        it('Hiding: Verify collapse a group when for a column disableHiding is set', () => {
            phoneCol.disableHiding = true;
            fixture.detectChanges();

            addressInf.expanded = false;
            fixture.detectChanges();

            expect(phoneCol.disableHiding).toBe(true);
            GridFunctions.verifyColumnIsHidden(phoneCol, true, 16);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, false);
        });

        it(`Hiding: Verify that when a column has set to hidden to true and
            visibleWhenCollapseChange to false, it is previewed in expanded group`, () => {
            expect(addressInf.collapsible).toBe(true);
            expect(fixture.componentInstance.hideContactInformation).toBe(true);

            GridFunctions.verifyColumnIsHidden(contactInf, false, 10);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, true);

            contactInf.hidden = true;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(contactInf, true, 6);
            contactInf.hidden = false;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(contactInf, false, 10);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, true);
        });

        it('Pinning: Verify that expanded state is preserved when pin column group', () => {
            expect(addressInf.pinned).toBe(false);
            expect(addressInf.expanded).toBe(true);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, true);
            addressInf.pinned = true;
            fixture.detectChanges();

            expect(addressInf.pinned).toBe(true);
            expect(addressInf.expanded).toBe(true);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, true);
            addressInf.expanded = false;
            fixture.detectChanges();

            expect(addressInf.pinned).toBe(true);
            expect(addressInf.expanded).toBe(false);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, false);
            addressInf.pinned = false;
            fixture.detectChanges();

            expect(addressInf.pinned).toBe(false);
            expect(addressInf.expanded).toBe(false);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, false);
        });

        it('Editing: Verify edit mode is closed when expand/collapse a group', () => {
            const contactNameCol = grid.getColumnByName('ContactName');
            const cell = grid.getCellByColumn(0, 'ContactName');
            contactNameCol.editable = true;
            fixture.detectChanges();

            UIInteractions.simulateDoubleClickAndSelectEvent(grid.gridAPI.get_cell_by_index(0, 'ContactName'));
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            addressInf.expanded = false;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, false);
            expect(cell.editMode).toBe(false);
        });

        it('Row Editing: Verify edit mode is closed when expand/collapse a group', () => {
            grid.primaryKey = 'ID';
            fixture.detectChanges();

            grid.rowEditable = true;
            fixture.detectChanges();
            addressInf.expanded = false;
            fixture.detectChanges();

            const cell = grid.getCellByColumn(0, 'Country');
            UIInteractions.simulateDoubleClickAndSelectEvent(grid.gridAPI.get_cell_by_index(0, 'Country'));
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            expect(grid.gridAPI.crudService.row).not.toBeNull();
            addressInf.expanded = true;
            fixture.detectChanges();

            expect(grid.gridAPI.crudService.row).toBeNull();
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf, true, true);
        });

        it('Moving: Verify that expanded state is preserved when move column group', () => {
            const generalInf = GridFunctions.getColGroup(grid, 'General Information');

            expect(addressInf.expanded).toBeTruthy();
            expect(generalInf.collapsible).toBeFalsy();
            expect(generalInf.visibleIndex).toBe(1);

            grid.moveColumn(generalInf, addressInf, DropPosition.AfterDropTarget);
            fixture.detectChanges();

            expect(addressInf.expanded).toBeTruthy();
            expect(generalInf.collapsible).toBeFalsy();
            expect(generalInf.visibleIndex).toBe(3);
            addressInf.expanded = false;
            fixture.detectChanges();

            expect(addressInf.expanded).toBeFalsy();
            grid.moveColumn(generalInf, addressInf, DropPosition.BeforeDropTarget);
            fixture.detectChanges();

            expect(addressInf.expanded).toBeFalsy();
            expect(generalInf.collapsible).toBeFalsy();
            expect(generalInf.visibleIndex).toBe(1);
        });

        it('Moving: Verify moving column inside the group', () => {
            const postalCode = grid.getColumnByName('PostalCode');
            addressInf.expanded = false;
            countryCol.visibleWhenCollapsed = false;
            regionInf.visibleWhenCollapsed = false;
            postalCode.visibleWhenCollapsed = false;
            fixture.detectChanges();

            expect(regionInf.expanded).toBe(true);
            expect(countryInf.expanded).toBe(true);
            expect(countryCol.visibleIndex).toBe(4);

            grid.moveColumn(countryCol, regionInf);
            fixture.detectChanges();

            expect(regionInf.expanded).toBe(true);
            GridFunctions.verifyGroupIsExpanded(fixture, regionInf, true, true);
            expect(countryInf.expanded).toBe(true);
            GridFunctions.verifyGroupIsExpanded(fixture, countryInf, true, true);
            expect(countryCol.visibleIndex).toBe(6);
        });

        it('Search: search when a group is expanded', async () => {
            const highlightClass = '.igx-highlight';
            grid.findNext('Mexico');
            await wait(30);
            fixture.detectChanges();

            let spans = fixture.nativeElement.querySelectorAll(highlightClass);
            expect(spans.length).toBe(0);

            addressInf.expanded = false;
            fixture.detectChanges();

            spans = fixture.nativeElement.querySelectorAll(highlightClass);
            expect(spans.length).toBe(2);
        });

        it('Group By: test when group by a column', () => {
            addressInf.expanded = false;
            countryCol.visibleWhenCollapsed = false;
            regionInf.visibleWhenCollapsed = false;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, countryInf, true, true);
            grid.groupBy({ fieldName: 'Country', dir: SortingDirection.Asc, ignoreCase: false });
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, countryInf, true, true);
            GridFunctions.verifyColumnIsHidden(countryCol, false, 13);
            grid.hideGroupedColumns = true;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, countryInf, true, true);
            GridFunctions.verifyColumnIsHidden(countryCol, true, 12);
        });
    });
});
