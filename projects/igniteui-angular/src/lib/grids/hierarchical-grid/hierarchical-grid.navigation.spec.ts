import { configureTestSuite } from '../../test-utils/configure-suite';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxHierarchicalGridModule } from './public_api';
import { Component, ViewChild, DebugElement} from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { wait, UIInteractions, waitForSelectionChange, waitForGridScroll } from '../../test-utils/ui-interactions.spec';
import { IgxRowIslandComponent } from './row-island.component';
import { By } from '@angular/platform-browser';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { setupHierarchicalGridScrollDetection } from '../../test-utils/helper-utils.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { IGridCellEventArgs } from '../grid/public_api';
import { IgxChildGridRowComponent } from './child-grid-row.component';

const DEBOUNCE_TIME = 60;
const GRID_CONTENT_CLASS = '.igx-grid__tbody-content';
const GRID_FOOTER_CLASS = '.igx-grid__tfoot';
describe('IgxHierarchicalGrid Basic Navigation #hGrid', () => {
    let fixture;
    let hierarchicalGrid: IgxHierarchicalGridComponent;
    let baseHGridContent: DebugElement;
    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridTestBaseComponent
            ],
            imports: [
                NoopAnimationsModule, IgxHierarchicalGridModule]
        });
    }));

    beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
        fixture.detectChanges();
        hierarchicalGrid = fixture.componentInstance.hgrid;
        setupHierarchicalGridScrollDetection(fixture, hierarchicalGrid);
        baseHGridContent = GridFunctions.getGridContent(fixture);
        GridFunctions.focusFirstCell(fixture, hierarchicalGrid);
    }));

    // simple tests
    it('should allow navigating down from parent row into child grid.', (async () => {
        hierarchicalGrid.expandChildren = false;
        hierarchicalGrid.height = '600px';
        hierarchicalGrid.width = '800px';
        fixture.componentInstance.rowIsland.height = '350px';
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);

        // expand row
        const row1 = hierarchicalGrid.dataRowList.toArray()[0] as IgxHierarchicalRowComponent;
        UIInteractions.simulateClickAndSelectEvent(row1.expander);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);

        // activate cell
        const fCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[0];
        GridFunctions.focusCell(fixture, fCell);
        fixture.detectChanges();

        // arrow down
        UIInteractions.triggerEventHandlerKeyDown('arrowdown', baseHGridContent, false, false, false);
        fixture.detectChanges();

        // verify selection in child.
        const selectedCell = fixture.componentInstance.selectedCell;
        expect(selectedCell.value).toEqual(0);
        expect(selectedCell.column.field).toMatch('ID');
    }));

    it('should allow navigating up from child row into parent grid.', () => {
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childFirstCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        GridFunctions.focusCell(fixture, childFirstCell);
        fixture.detectChanges();
        childGrid.cdr.detectChanges();

         // arrow up in child
         const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
         UIInteractions.triggerEventHandlerKeyDown('arrowup', childGridContent, false, false, false);
         fixture.detectChanges();

         // verify selection in parent.
         const selectedCell = fixture.componentInstance.selectedCell;
         expect(selectedCell.value).toEqual(0);
         expect(selectedCell.column.field).toMatch('ID');
    });

    it('should allow navigating down in child grid when child grid selected cell moves outside the parent view port.', (async () => {
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childCell =  childGrid.dataRowList.toArray()[3].cells.toArray()[0];
        GridFunctions.focusCell(fixture, childCell);
        fixture.detectChanges();
        // arrow down in child
        const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
        UIInteractions.triggerEventHandlerKeyDown('arrowdown', childGridContent, false, false, false);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        // parent should scroll down so that cell in child is in view.
        const selectedCell = fixture.componentInstance.selectedCell;
        const gridOffsets = hierarchicalGrid.tbody.nativeElement.getBoundingClientRect();
        const rowOffsets = selectedCell.intRow.nativeElement.getBoundingClientRect();
        expect(rowOffsets.top >= gridOffsets.top && rowOffsets.bottom <= gridOffsets.bottom).toBeTruthy();
    }));

    it('should allow navigating up in child grid when child grid selected cell moves outside the parent view port.',  (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childCell =  childGrid.dataRowList.toArray()[4].cells.toArray()[0];
        GridFunctions.focusCell(fixture, childCell);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        const prevScrTop = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;

        const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
        UIInteractions.triggerEventHandlerKeyDown('arrowup', childGridContent, false, false, false);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        // parent should scroll up so that cell in child is in view.
        const currScrTop = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;
        expect(prevScrTop - currScrTop).toBeGreaterThanOrEqual(childGrid.rowHeight);
    }));

    it('should allow navigating to end in child grid when child grid target row moves outside the parent view port.', (async () => {
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        GridFunctions.focusCell(fixture, childCell);
        fixture.detectChanges();

        const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
        UIInteractions.triggerEventHandlerKeyDown('end', childGridContent, false, false, true);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);

        // verify selection in child.
        const selectedCell = fixture.componentInstance.selectedCell;
        expect(selectedCell.row.index).toEqual(9);
        expect(selectedCell.column.field).toMatch('childData2');

        // parent should be scrolled down
        const currScrTop = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;
        expect(currScrTop).toBeGreaterThanOrEqual(childGrid.rowHeight * 5);
    }));

    it('should allow navigating to start in child grid when child grid target row moves outside the parent view port.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const horizontalScrDir = childGrid.dataRowList.toArray()[0].virtDirRow;
        horizontalScrDir.scrollTo(6);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        const childLastCell =  childGrid.dataRowList.toArray()[9].cells.toArray()[3];
        GridFunctions.focusCell(fixture, childLastCell);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
        UIInteractions.triggerEventHandlerKeyDown('home', childGridContent, false, false, true);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);

        const selectedCell = fixture.componentInstance.selectedCell;
        expect(selectedCell.value).toEqual(0);
        expect(selectedCell.columnIndex).toBe(0);
        expect(selectedCell.rowIndex).toBe(0);

        // check if child row is in view of parent.
        const gridOffsets = hierarchicalGrid.tbody.nativeElement.getBoundingClientRect();
        const rowOffsets = selectedCell.intRow.nativeElement.getBoundingClientRect();
        expect(rowOffsets.top >= gridOffsets.top && rowOffsets.bottom <= gridOffsets.bottom).toBeTruthy();
    }));

    it('should allow navigating to bottom in child grid when child grid target row moves outside the parent view port.', (async () => {
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        GridFunctions.focusCell(fixture, childCell);
        fixture.detectChanges();
        const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
        UIInteractions.triggerEventHandlerKeyDown('arrowdown', childGridContent, false, false, true);
        fixture.detectChanges();
        // wait for parent grid to complete scroll to child cell.
        await waitForGridScroll(hierarchicalGrid);
        fixture.detectChanges();

        const selectedCell = fixture.componentInstance.selectedCell;
        expect(selectedCell.value).toBe(9);
        expect(selectedCell.columnIndex).toBe(0);
        expect(selectedCell.rowIndex).toBe(9);

        const currScrTop = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;
        expect(currScrTop).toBeGreaterThanOrEqual(childGrid.rowHeight * 5);
    }));

    it('should not lose activation when pressing Ctrl+ArrowDown is pressed at the bottom row(expended) in a child grid.', (async () => {
        hierarchicalGrid.height = '600px';
        hierarchicalGrid.width = '800px';
        fixture.componentInstance.rowIsland.height = '400px';
        await wait();
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        childGrid.data = childGrid.data.slice(0, 5);
        await wait();
        fixture.detectChanges();

        childGrid.dataRowList.toArray()[4].expander.nativeElement.click();
        await wait();
        fixture.detectChanges();

        const childCell =  childGrid.dataRowList.toArray()[4].cells.toArray()[0];
        GridFunctions.focusCell(fixture, childCell);
        fixture.detectChanges();

        const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
        UIInteractions.triggerEventHandlerKeyDown('arrowdown', childGridContent, false, false, true);
        fixture.detectChanges();
        await wait(30);
        fixture.detectChanges();

        const childLastRowCell =  childGrid.dataRowList.toArray()[4].cells.toArray()[0];
        const selectedCell = fixture.componentInstance.selectedCell;
        expect(selectedCell).toBe(childLastRowCell);
        expect(selectedCell.columnIndex).toBe(0);
        expect(selectedCell.rowIndex).toBe(4);

        const currScrTop = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;
        expect(currScrTop).toEqual(0);
    }));

    it('should allow navigating to top in child grid when child grid target row moves outside the parent view port.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childLastRowCell =  childGrid.dataRowList.toArray()[9].cells.toArray()[0];
        GridFunctions.focusCell(fixture, childLastRowCell);
        fixture.detectChanges();

        const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
        UIInteractions.triggerEventHandlerKeyDown('arrowup', childGridContent, false, false, true);
        fixture.detectChanges();
        await wait(200);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);

        const childFirstRowCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        const selectedCell = fixture.componentInstance.selectedCell;
        expect(selectedCell).toBe(childFirstRowCell);
        expect(selectedCell.value).toBe(0);
        expect(selectedCell.columnIndex).toBe(0);
        expect(selectedCell.rowIndex).toBe(0);

       // check if child row is in view of parent.
       const gridOffsets = hierarchicalGrid.tbody.nativeElement.getBoundingClientRect();
       const rowOffsets = selectedCell.intRow.nativeElement.getBoundingClientRect();
       expect(rowOffsets.top >= gridOffsets.top && rowOffsets.bottom <= gridOffsets.bottom).toBeTruthy();
    }));

    it('should scroll top of child grid into view when pressing Ctrl + Arrow Up when cell is selected in it.', (async () => {
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        hierarchicalGrid.verticalScrollContainer.scrollTo(7);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        hierarchicalGrid.verticalScrollContainer.scrollTo(7);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[3];
        const childLastRowCell =  childGrid.dataRowList.toArray()[9].cells.toArray()[0];
        const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
        GridFunctions.focusCell(fixture, childLastRowCell);
        fixture.detectChanges();
        UIInteractions.triggerEventHandlerKeyDown('arrowup', childGridContent, false, false, true);
        await wait(200);
        fixture.detectChanges();
        await wait(200);
        fixture.detectChanges();
        const childFirstRowCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        const selectedCell = fixture.componentInstance.selectedCell;
        expect(selectedCell).toBe(childFirstRowCell);
        expect(selectedCell.value).toBe(0);
        expect(selectedCell.columnIndex).toBe(0);
        expect(selectedCell.rowIndex).toBe(0);

      // check if child row is in view of parent.
      const gridOffsets = hierarchicalGrid.tbody.nativeElement.getBoundingClientRect();
      const rowOffsets = selectedCell.intRow.nativeElement.getBoundingClientRect();
      expect(rowOffsets.top >= gridOffsets.top && rowOffsets.bottom <= gridOffsets.bottom).toBeTruthy();
    }));

    it('when navigating down from parent into child should scroll child grid to top and start navigation from first row.', (async () => {
        const ri = fixture.componentInstance.rowIsland;
        ri.height = '200px';
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        childGrid.verticalScrollContainer.scrollTo(9);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        let currScrTop = childGrid.verticalScrollContainer.getScroll().scrollTop;
        expect(currScrTop).toBeGreaterThan(0);

        const fCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[0];
        GridFunctions.focusCell(fixture, fCell);
        fixture.detectChanges();
        UIInteractions.triggerEventHandlerKeyDown('arrowdown', baseHGridContent, false, false, false);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        const childFirstCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        const selectedCell = fixture.componentInstance.selectedCell;
        expect(selectedCell).toBe(childFirstCell);
        expect(selectedCell.rowIndex).toBe(0);

        currScrTop = childGrid.verticalScrollContainer.getScroll().scrollTop;
        expect(currScrTop).toBe(0);
    }));

    it('when navigating up from parent into child should scroll child grid to bottom and start navigation from last row.', (async () => {
        const ri = fixture.componentInstance.rowIsland;
        ri.height = '200px';
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const parentCell = hierarchicalGrid.gridAPI.get_cell_by_key(1, 'ID');
        GridFunctions.focusCell(fixture, parentCell);
        fixture.detectChanges();
        UIInteractions.triggerEventHandlerKeyDown('arrowup', baseHGridContent, false, false, false);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const vertScr = childGrid.verticalScrollContainer.getScroll();
        const currScrTop = vertScr.scrollTop;
        // should be scrolled to bottom
        expect(currScrTop).toBe(vertScr.scrollHeight - vertScr.clientHeight);

    }));

    it('should move activation to last data cell in grid when ctrl+end is used.', (async () => {
        const parentCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[0];
        GridFunctions.focusCell(fixture, parentCell);

        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        UIInteractions.triggerEventHandlerKeyDown('end', baseHGridContent, false, false, true);
        fixture.detectChanges();
        await waitForSelectionChange(hierarchicalGrid);
        fixture.detectChanges();

        const lastDataCell = hierarchicalGrid.gridAPI.get_cell_by_key(19, 'childData2');
        const selectedCell = fixture.componentInstance.selectedCell;
        expect(selectedCell).toBe(lastDataCell);
        expect(selectedCell.rowIndex).toBe(38);
        expect(selectedCell.columnIndex).toBe(6);
    }));
    it('if next child cell is not in view should scroll parent so that it is in view.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(4);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        const parentCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[0];
        GridFunctions.focusCell(fixture, parentCell);
        fixture.detectChanges();
        const prevScroll = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;
        UIInteractions.triggerEventHandlerKeyDown('arrowdown', baseHGridContent, false, false, false);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        // check if selected row is in view of parent.
        const selectedCell = fixture.componentInstance.selectedCell;
        const gridOffsets = hierarchicalGrid.tbody.nativeElement.getBoundingClientRect();
        const rowOffsets = selectedCell.intRow.nativeElement.getBoundingClientRect();
        expect(rowOffsets.top >= gridOffsets.top && rowOffsets.bottom <= gridOffsets.bottom).toBeTruthy();

        expect(  hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop - prevScroll).toBeGreaterThanOrEqual(100);
    }));

    it('should expand/collapse hierarchical row using ALT+Arrow Right/ALT+Arrow Left.', ( async () => {
        const parentRow = hierarchicalGrid.dataRowList.toArray()[0] as IgxHierarchicalRowComponent;
        expect(parentRow.expanded).toBe(true);
        const parentCell = parentRow.cells.toArray()[0];
        GridFunctions.focusCell(fixture, parentCell);
        fixture.detectChanges();
        // collapse
        UIInteractions.triggerEventHandlerKeyDown('arrowleft', baseHGridContent, true, false, false);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        expect(parentRow.expanded).toBe(false);
        // expand
        UIInteractions.triggerEventHandlerKeyDown('arrowright', baseHGridContent, true, false, false);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        expect(parentRow.expanded).toBe(true);
    }));

    it('should retain active cell when expand/collapse hierarchical row using ALT+Arrow Right/ALT+Arrow Left.', (async () => {
        // scroll to last row
        const lastDataIndex = hierarchicalGrid.dataView.length - 2;
        hierarchicalGrid.verticalScrollContainer.scrollTo(lastDataIndex);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        hierarchicalGrid.verticalScrollContainer.scrollTo(lastDataIndex);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        let parentCell = hierarchicalGrid.gridAPI.get_cell_by_index(38, 'ID');
        GridFunctions.focusCell(fixture, parentCell);
        fixture.detectChanges();
         // collapse
        UIInteractions.triggerEventHandlerKeyDown('arrowleft', baseHGridContent, true, false, false);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        parentCell = hierarchicalGrid.gridAPI.get_cell_by_index(38, 'ID');
        expect(parentCell.active).toBeTruthy();

        // expand
        UIInteractions.triggerEventHandlerKeyDown('arrowright', baseHGridContent, true, false, false);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        parentCell = hierarchicalGrid.gridAPI.get_cell_by_index(38, 'ID');
        expect(parentCell.active).toBeTruthy();
    }));

    it('should expand/collapse hierarchical row using ALT+Arrow Down/ALT+Arrow Up.', (async () => {
        const parentRow = hierarchicalGrid.dataRowList.toArray()[0] as IgxHierarchicalRowComponent;
        expect(parentRow.expanded).toBe(true);
        let parentCell = parentRow.cells.toArray()[0];
        GridFunctions.focusCell(fixture, parentCell);
        fixture.detectChanges();
        // collapse
        UIInteractions.triggerEventHandlerKeyDown('arrowup', baseHGridContent, true, false, false);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        expect(parentRow.expanded).toBe(false);
        // expand
        parentCell = parentRow.cells.toArray()[0];
        UIInteractions.triggerEventHandlerKeyDown('arrowdown', baseHGridContent, true, false, false);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        expect(parentRow.expanded).toBe(true);
    }));

    it('should skip child grids that have no data when navigating up/down', (async () => {
        // set first child to not have data
        const child1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        child1.data = [];
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const parentRow = hierarchicalGrid.dataRowList.toArray()[0];
        const parentCell = parentRow.cells.toArray()[0];
        GridFunctions.focusCell(fixture, parentCell);
        fixture.detectChanges();

        UIInteractions.triggerEventHandlerKeyDown('arrowdown', baseHGridContent, false, false, false);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        // second data row in parent should be focused
        const parentRow2 = hierarchicalGrid.gridAPI.get_row_by_index(2);
        const parentCell2 = parentRow2.cells.toArray()[0];

        let selectedCell = fixture.componentInstance.selectedCell;
        expect(selectedCell).toBe(parentCell2);

        UIInteractions.triggerEventHandlerKeyDown('arrowup', baseHGridContent, false, false, false);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        // first data row in parent should be selected
        selectedCell = fixture.componentInstance.selectedCell;
        expect(selectedCell).toBe(parentCell);
        expect(parentCell.selected).toBeTruthy();
    }));

    it('should skip nested child grids that have no data when navigating up/down', (async () => {
        pending('Related with issue #7300');
        const child1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        child1.height = '150px';
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        const row = child1.getRowByIndex(0);
        (row as IgxHierarchicalRowComponent).toggle();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        //  set nested child to not have data
        const subChild = child1.hgridAPI.getChildGrids(false)[0];
        subChild.data = [];
        subChild.cdr.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const fchildRowCell = row.cells.toArray()[0];
        GridFunctions.focusCell(fixture, fchildRowCell);
        fixture.detectChanges();

        const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
        UIInteractions.triggerEventHandlerKeyDown('arrowdown', childGridContent, false, false, false);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        // second child row should be in view
        const sChildRowCell = child1.getRowByIndex(2).cells.toArray()[0];
        let selectedCell = fixture.componentInstance.selectedCell;
        expect(selectedCell).toBe(sChildRowCell);

        expect(child1.verticalScrollContainer.getScroll().scrollTop).toBeGreaterThanOrEqual(150);

        UIInteractions.triggerEventHandlerKeyDown('arrowup', childGridContent, false, false, false);
        fixture.detectChanges();
        await wait(300);
        fixture.detectChanges();
        selectedCell = fixture.componentInstance.selectedCell;
        expect(selectedCell.row.index).toBe(0);
        expect(child1.verticalScrollContainer.getScroll().scrollTop).toBe(0);

    }));

    it('should navigate inside summary row with Ctrl + Arrow Right/ Ctrl + Arrow Left', (async () => {
        const col = hierarchicalGrid.getColumnByName('ID');
        col.hasSummary = true;
        fixture.detectChanges();

        let summaryCells = hierarchicalGrid.summariesRowList.toArray()[0].summaryCells.toArray();

        const firstCell =  summaryCells[0];
        GridFunctions.focusCell(fixture, firstCell);
        fixture.detectChanges();

        const footerContent = fixture.debugElement.queryAll(By.css(GRID_FOOTER_CLASS))[2].children[0];
        UIInteractions.triggerEventHandlerKeyDown('arrowright', footerContent, false, false, true);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        summaryCells = hierarchicalGrid.summariesRowList.toArray()[0].summaryCells.toArray();
        const lastCell = summaryCells.find((s) => s.column.field === 'childData2');
        expect(lastCell.active).toBeTruthy();

        UIInteractions.triggerEventHandlerKeyDown('arrowleft', footerContent, false, false, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        summaryCells = hierarchicalGrid.summariesRowList.toArray()[0].summaryCells.toArray();
        const fCell = summaryCells.find((s) => s.column.field === 'ID');
        expect(fCell.active).toBeTruthy();
    }));

    it('should navigate to Cancel button when there is row in edit mode', async () => {
        hierarchicalGrid.columnList.forEach((c) => {
            if (c.field !== hierarchicalGrid.primaryKey) {
                c.editable = true;
            }
        });
        fixture.detectChanges();

        hierarchicalGrid.rowEditable = true;
        await wait(50);
        fixture.detectChanges();

        const cellID = hierarchicalGrid.gridAPI.get_cell_by_index(0, 'ID');
        GridFunctions.focusCell(fixture, cellID);
        fixture.detectChanges();

        UIInteractions.triggerEventHandlerKeyDown('end', baseHGridContent, false, false, false);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const cell = hierarchicalGrid.gridAPI.get_cell_by_index(0, 'childData2');
        UIInteractions.simulateDoubleClickAndSelectEvent(cell);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('tab', cell.nativeElement, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        const activeEl = document.activeElement;
        expect(activeEl.innerHTML).toEqual('Cancel');

        UIInteractions.triggerKeyDownEvtUponElem('tab', activeEl, true, false, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

       expect(document.activeElement.tagName.toLowerCase()).toBe('input');
    });

    it('should navigate to row edit button "Done" on shift + tab', async () => {
        hierarchicalGrid.columnList.forEach((c) => {
            if (c.field !== hierarchicalGrid.primaryKey) {
                c.editable = true;
            }
        });
        fixture.detectChanges();
        hierarchicalGrid.rowEditable = true;
        await wait(50);
        fixture.detectChanges();

        hierarchicalGrid.getColumnByName('ID').hidden = true;
        await wait(50);
        fixture.detectChanges();
        hierarchicalGrid.navigateTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const cell = hierarchicalGrid.gridAPI.get_cell_by_index(2, 'ChildLevels');
        UIInteractions.simulateDoubleClickAndSelectEvent(cell);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('tab', cell.nativeElement, true, false, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        const activeEl = document.activeElement;
        expect(activeEl.innerHTML).toEqual('Done');

        UIInteractions.triggerKeyDownEvtUponElem('tab', activeEl, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

       expect(document.activeElement.tagName.toLowerCase()).toBe('input');
    });
});


describe('IgxHierarchicalGrid Complex Navigation #hGrid', () => {
        configureTestSuite();
        let fixture;
        let hierarchicalGrid: IgxHierarchicalGridComponent;
        let baseHGridContent;
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxHierarchicalGridTestComplexComponent
                ],
                imports: [
                    NoopAnimationsModule, IgxHierarchicalGridModule]
            }).compileComponents();
        }));

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridTestComplexComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
            setupHierarchicalGridScrollDetection(fixture, hierarchicalGrid);
            baseHGridContent = GridFunctions.getGridContent(fixture);
            GridFunctions.focusFirstCell(fixture, hierarchicalGrid);
        }));

        // complex tests
        it('in case prev cell is not in view port should scroll the closest scrollable parent so that cell comes in view.', (async () => {
            // scroll parent so that child top is not in view
            hierarchicalGrid.verticalScrollContainer.addScrollTop(300);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();
            const child = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const nestedChild = child.hgridAPI.getChildGrids(false)[0];
            const nestedChildCell = nestedChild.dataRowList.toArray()[1].cells.toArray()[0];
            GridFunctions.focusCell(fixture, nestedChildCell);
            let oldScrTop = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();
            // navigate up
            const nestedChildGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[2];
            UIInteractions.triggerEventHandlerKeyDown('arrowup', nestedChildGridContent, false, false, false);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            let nextCell =  nestedChild.dataRowList.toArray()[0].cells.toArray()[0];
            let currScrTop = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;
            const elemHeight = nestedChildCell.intRow.nativeElement.clientHeight;
            // check if parent of parent has been scroll up so that the focused cell is in view
            expect(oldScrTop - currScrTop).toEqual(elemHeight);
            oldScrTop = currScrTop;

            expect(nextCell.selected).toBe(true);
            expect(nextCell.active).toBe(true);
            expect(nextCell.rowIndex).toBe(0);

            // navigate up into parent
            UIInteractions.triggerEventHandlerKeyDown('arrowup', nestedChildGridContent, false, false, false);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            nextCell =  child.dataRowList.toArray()[0].cells.toArray()[0];
            currScrTop = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;
            expect(oldScrTop - currScrTop).toBeGreaterThanOrEqual(100);

            expect(nextCell.selected).toBe(true);
            expect(nextCell.active).toBe(true);
            expect(nextCell.rowIndex).toBe(0);

        }));

        it('in case next cell is not in view port should scroll the closest scrollable parent so that cell comes in view.', (async () => {
            const child = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const nestedChild = child.hgridAPI.getChildGrids(false)[0];
            const nestedChildCell = nestedChild.dataRowList.toArray()[1].cells.toArray()[0];
             // navigate down in nested child
             GridFunctions.focusCell(fixture, nestedChildCell);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();
            const nestedChildGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[2];
            UIInteractions.triggerEventHandlerKeyDown('arrowdown', nestedChildGridContent, false, false, false);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();
            // check if parent has scrolled down to show focused cell.
            expect(child.verticalScrollContainer.getScroll().scrollTop).toBe(nestedChildCell.intRow.nativeElement.clientHeight);
            const nextCell = nestedChild.dataRowList.toArray()[2].cells.toArray()[0];

            expect(nextCell.selected).toBe(true);
            expect(nextCell.active).toBe(true);
            expect(nextCell.rowIndex).toBe(2);
        }));

        it('should allow navigating up from parent into nested child grid', (async () => {
            hierarchicalGrid.verticalScrollContainer.scrollTo(2);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();
            const child = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const lastIndex =  child.dataView.length - 1;
            child.verticalScrollContainer.scrollTo(lastIndex);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();
            child.verticalScrollContainer.scrollTo(lastIndex);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            const parentCell = hierarchicalGrid.gridAPI.get_cell_by_index(2, 'ID');
            GridFunctions.focusCell(fixture, parentCell);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('arrowup', baseHGridContent , false, false, false);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            const nestedChild = child.hgridAPI.getChildGrids(false)[5];
            const lastCell = nestedChild.gridAPI.get_cell_by_index(4, 'ID');
            expect(lastCell.selected).toBe(true);
            expect(lastCell.active).toBe(true);
            expect(lastCell.rowIndex).toBe(4);

        }));

});

describe('IgxHierarchicalGrid sibling row islands Navigation #hGrid', () => {
    let fixture;
    let hierarchicalGrid: IgxHierarchicalGridComponent;
    let baseHGridContent;
    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridMultiLayoutComponent
            ],
            imports: [
                NoopAnimationsModule, IgxHierarchicalGridModule]
        });
    }));

    beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(IgxHierarchicalGridMultiLayoutComponent);
        fixture.detectChanges();
        hierarchicalGrid = fixture.componentInstance.hgrid;
        setupHierarchicalGridScrollDetection(fixture, hierarchicalGrid);
        baseHGridContent = GridFunctions.getGridContent(fixture);
        GridFunctions.focusFirstCell(fixture, hierarchicalGrid);
    }));

    it('should allow navigating up between sibling child grids.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        const child1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const child2 = hierarchicalGrid.hgridAPI.getChildGrids(false)[5];

        const child2Cell = child2.dataRowList.toArray()[0].cells.toArray()[0];
        GridFunctions.focusCell(fixture, child2Cell);

        const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[2];
        UIInteractions.triggerEventHandlerKeyDown('arrowup', childGridContent, false, false, false);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        const lastCellPrevRI = child1.dataRowList.last.cells.toArray()[0];

        expect(lastCellPrevRI.active).toBe(true);
        expect(lastCellPrevRI.selected).toBe(true);
        expect(lastCellPrevRI.rowIndex).toBe(9);
    }));
    it('should allow navigating down between sibling child grids.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        const child1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const child2 = hierarchicalGrid.hgridAPI.getChildGrids(false)[5];

        child1.verticalScrollContainer.scrollTo(child1.dataView.length - 1);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        const child2Cell = child2.dataRowList.toArray()[0].cells.toArray()[0];
        const lastCellPrevRI = child1.dataRowList.last.cells.toArray()[0];
        GridFunctions.focusCell(fixture, lastCellPrevRI);

        const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
        UIInteractions.triggerEventHandlerKeyDown('arrowdown', childGridContent, false, false, false);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        expect(child2Cell.selected).toBe(true);
        expect(child2Cell.active).toBe(true);
    }));

    it('should navigate up from parent row to the correct child sibling.', (async () => {
        const parentCell = hierarchicalGrid.dataRowList.toArray()[1].cells.toArray()[0];
        GridFunctions.focusCell(fixture, parentCell);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        // Arrow Up into prev child grid
        UIInteractions.triggerEventHandlerKeyDown('arrowup', baseHGridContent, false, false, false);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const child2 = hierarchicalGrid.hgridAPI.getChildGrids(false)[5];

        const child2Cell = child2.dataRowList.last.cells.toArray()[0];
        expect(child2Cell.selected).toBe(true);
        expect(child2Cell.active).toBe(true);
        expect(child2Cell.rowIndex).toBe(9);
    }));
    it('should navigate down from parent row to the correct child sibling.', (async () => {
        const parentCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[0];
        GridFunctions.focusCell(fixture, parentCell);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        // Arrow down into next child grid
        UIInteractions.triggerEventHandlerKeyDown('arrowdown', baseHGridContent, false, false, false);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const child1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const child1Cell = child1.dataRowList.toArray()[0].cells.toArray()[0];
        expect(child1Cell.selected).toBe(true);
        expect(child1Cell.active).toBe(true);
        expect(child1Cell.rowIndex).toBe(0);
    }));

    it('should navigate to last cell in previous child using Arrow Up from last cell of sibling with more columns', (async () => {
        const childGrid2 = hierarchicalGrid.hgridAPI.getChildGrids(false)[5];

        childGrid2.dataRowList.toArray()[0].virtDirRow.scrollTo(7);
        await wait(100);
        fixture.detectChanges();

        const child2LastCell = childGrid2.gridAPI.get_cell_by_index(0, 'childData2');
        GridFunctions.focusCell(fixture, child2LastCell);
        await wait(100);
        fixture.detectChanges();

        const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[2];

        UIInteractions.triggerEventHandlerKeyDown('arrowup', childGridContent, false, false, false);
        await wait(100);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childLastCell = childGrid.gridAPI.get_cell_by_index(9, 'childData');
        expect(childLastCell.selected).toBeTruthy();
        expect(childLastCell.active).toBeTruthy();
    }));
});

describe('IgxHierarchicalGrid Smaller Child Navigation #hGrid', () => {
    configureTestSuite();
    let fixture;
    let hierarchicalGrid: IgxHierarchicalGridComponent;
    let baseHGridContent;
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridSmallerChildComponent
            ],
            imports: [
                NoopAnimationsModule, IgxHierarchicalGridModule]
        }).compileComponents();
    }));
    beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(IgxHierarchicalGridSmallerChildComponent);
        fixture.detectChanges();
        hierarchicalGrid = fixture.componentInstance.hgrid;
        setupHierarchicalGridScrollDetection(fixture, hierarchicalGrid);
        baseHGridContent = GridFunctions.getGridContent(fixture);
        GridFunctions.focusFirstCell(fixture, hierarchicalGrid);
    }));

    it('should navigate to last cell in next row for child grid using Arrow Down from last cell of parent with more columns', (async () => {
        const parentCell = hierarchicalGrid.gridAPI.get_cell_by_index(0, 'Col2');
        GridFunctions.focusCell(fixture, parentCell);

        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        UIInteractions.triggerEventHandlerKeyDown('arrowdown', baseHGridContent, false, false, false);

        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        // last cell in child should be focused
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childLastCell =  childGrid.gridAPI.get_cell_by_index(0, 'Col1');

        expect(childLastCell.selected).toBe(true);
        expect(childLastCell.active).toBe(true);
    }));

    it('should navigate to last cell in next row for child grid using Arrow Up from last cell of parent with more columns', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const parentCell = hierarchicalGrid.gridAPI.get_cell_by_index(2, 'Col2');
        GridFunctions.focusCell(fixture, parentCell);

        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        UIInteractions.triggerEventHandlerKeyDown('arrowup', baseHGridContent, false, false, false);

        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        // last cell in child should be focused
        const childGrids =  fixture.debugElement.queryAll(By.directive(IgxChildGridRowComponent));
        const childGrid = childGrids[1].query(By.directive(IgxHierarchicalGridComponent)).componentInstance;
        const childLastCell =  childGrid.gridAPI.get_cell_by_index(9, 'ProductName');

        expect(childLastCell.selected).toBe(true);
        expect(childLastCell.active).toBe(true);
    }));

    it('should navigate to last cell in next child using Arrow Down from last cell of previous child with more columns', (async () => {
        const childGrids =  fixture.debugElement.queryAll(By.directive(IgxChildGridRowComponent));
        const firstChildGrid = childGrids[0].query(By.directive(IgxHierarchicalGridComponent)).componentInstance;
        const secondChildGrid = childGrids[1].query(By.directive(IgxHierarchicalGridComponent)).componentInstance;

        firstChildGrid.verticalScrollContainer.scrollTo(9);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const firstChildCell =  firstChildGrid.gridAPI.get_cell_by_index(9, 'Col1');
        GridFunctions.focusCell(fixture, firstChildCell);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
        UIInteractions.triggerEventHandlerKeyDown('arrowdown', childGridContent, false, false, false);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();


        const secondChildCell =  secondChildGrid.gridAPI.get_cell_by_index(0, 'ProductName');
        expect(secondChildCell.selected).toBe(true);
        expect(secondChildCell.active).toBe(true);
    }));
});

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" (selected)='selected($event)'
     [autoGenerate]="true" [height]="'400px'" [width]="'500px'" #hierarchicalGrid primaryKey="ID" [expandChildren]='true'>
        <igx-row-island (selected)='selected($event)' [key]="'childData'" [autoGenerate]="true" [height]="null" #rowIsland>
            <igx-row-island (selected)='selected($event)' [key]="'childData'" [autoGenerate]="true" [height]="null" #rowIsland2 >
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridTestBaseComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;
    public data;
    public selectedCell;

    constructor() {
        // 3 level hierarchy
        this.data = this.generateData(20, 3);
    }

    public selected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }

    public generateData(count: number, level: number) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
           if (level > 0 ) {
               children = this.generateData(count / 2 , currLevel - 1);
           }
           prods.push({
            ID: i, ChildLevels: currLevel,  ProductName: 'Product: A' + i, Col1: i,
            Col2: i, Col3: i, childData: children, childData2: children });
        }
        return prods;
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [height]="'400px'" [width]="'500px'" [data]="data" [autoGenerate]="true"
    [expandChildren]='true' #hierarchicalGrid>
        <igx-row-island [key]="'childData'" [autoGenerate]="true" [expandChildren]='true' [height]="'300px'" #rowIsland>
            <igx-row-island [key]="'childData'" [autoGenerate]="true" #rowIsland2 [height]="'200px'" >
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridTestComplexComponent extends IgxHierarchicalGridTestBaseComponent {
    constructor() {
        super();
        // 3 level hierarchy
        this.data = this.generateData(20, 3);
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [autoGenerate]="true" [height]="'500px'" [width]="'500px'"
    [expandChildren]='true' #hierarchicalGrid>
        <igx-row-island [key]="'childData'" [autoGenerate]="true" [height]="'150px'">
            <igx-row-island [key]="'childData2'" [autoGenerate]="true" [height]="'100px'">
            </igx-row-island>
        </igx-row-island>
        <igx-row-island [key]="'childData2'" [autoGenerate]="true" [height]="'150px'">
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridMultiLayoutComponent extends IgxHierarchicalGridTestBaseComponent {}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [autoGenerate]="false" [height]="'500px'" [width]="'800px'"
    [expandChildren]='true' #hierarchicalGrid>
        <igx-column field="ID"></igx-column>
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-column field="Col1"></igx-column>
        <igx-column field="Col2"></igx-column>

        <igx-row-island [key]="'childData'" [autoGenerate]="false" [height]="'200px'">
            <igx-column field="ID"></igx-column>
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-column field="Col1"></igx-column>
            <igx-row-island [key]="'childData2'" [autoGenerate]="true" [height]="'100px'">
            </igx-row-island>
        </igx-row-island>
        <igx-row-island [key]="'childData2'" [autoGenerate]="false" [height]="'200px'">
            <igx-column field="ID"></igx-column>
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-row-island [key]="'childData2'" [autoGenerate]="true" [height]="'100px'">
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridSmallerChildComponent extends IgxHierarchicalGridTestBaseComponent {}
