import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxHierarchicalGridModule } from './index';
import { Component, ViewChild } from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowIslandComponent } from './row-island.component';
import { wait } from '../../test-utils/ui-interactions.spec';
import { FilteringExpressionsTree, FilteringLogic, IgxStringFilteringOperand } from 'igniteui-angular';
import { By } from '@angular/platform-browser';

describe('IgxHierarchicalGrid Virtualization', () => {
    configureTestSuite();
    let fixture;
    let hierarchicalGrid: IgxHierarchicalGridComponent;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridTestBaseComponent
            ],
            imports: [
                NoopAnimationsModule, IgxHierarchicalGridModule]
        }).compileComponents();
    }));

    beforeEach(async(() => {
        fixture = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
        fixture.detectChanges();
        hierarchicalGrid = fixture.componentInstance.hgrid;
    }));

    it('should retain expansion state when scrolling.', async () => {
        const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
        // first child of the row should expand indicator
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();
        expect(firstRow.expanded).toBeTruthy();
        const verticalScroll = fixture.componentInstance.hgrid.verticalScrollContainer;
        const elem = verticalScroll['vh'].instance.elementRef.nativeElement;

        // scroll down
        elem.scrollTop = 1000;
        fixture.detectChanges();
        fixture.componentRef.hostView.detectChanges();
        await wait(100);
        expect(firstRow.expanded).toBeFalsy();

        // scroll to top
        elem.scrollTop = 0;
        fixture.detectChanges();
        fixture.componentRef.hostView.detectChanges();
        await wait(100);
        expect(firstRow.expanded).toBeTruthy();
    });

    it('Should retain child scroll position when expanding and collapsing through rows', async () => {
        const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
        // first child of the row should expand indicator
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const verticalScroll = childGrid.verticalScrollContainer;
        const elem = verticalScroll['vh'].instance.elementRef.nativeElement;

        // scroll down
        elem.scrollTop = 400;
        fixture.detectChanges();
        fixture.componentRef.hostView.detectChanges();
        await wait();

        // collapse and expand the row
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();
        await wait();
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();
        await wait();

        expect(elem.scrollTop).toBe(400);
    });

    it('Should retain child grid states (scroll position, selection, filtering, paging etc.) when scrolling', async() => {
        const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
        // first child of the row should expand indicator
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childCell =  childGrid.dataRowList.toArray()[4].cells.toArray()[0];
        childCell.nativeElement.focus();
        await wait(10);

        const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
        const expression = {
            fieldName: 'ProductName',
            searchVal: 'Product: A4',
            condition: IgxStringFilteringOperand.instance().condition('startsWith')
        };
        filteringExpressionsTree.filteringOperands.push(expression);
        childGrid.filter('ProductName', null, filteringExpressionsTree);
        await wait();
        fixture.detectChanges();
        expect(childGrid.rowList.length).toEqual(1);
        expect(childGrid.rowList.toArray()[0].cells.toArray()[0].selected).toBeTruthy();

        const verticalScroll = fixture.componentInstance.hgrid.verticalScrollContainer;
        const elem = verticalScroll['vh'].instance.elementRef.nativeElement;
        // scroll down
        elem.scrollTop = 1000;
        fixture.detectChanges();
        fixture.componentRef.hostView.detectChanges();
        await wait();

        // scroll to top
        elem.scrollTop = 0;
        fixture.detectChanges();
        fixture.componentRef.hostView.detectChanges();
        await wait();

        expect(childGrid.rowList.length).toEqual(1);
        expect(childGrid.rowList.toArray()[0].cells.toArray()[0].selected).toBeTruthy();
    });
    it('should render correct data for child grid after scrolling and start index changes.', async() => {
        const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
        // first child of the row should expand indicator
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();
        const secondRow = hierarchicalGrid.dataRowList.toArray()[1];
        secondRow.nativeElement.children[0].click();
        fixture.detectChanges();

        const childGrid1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const expectedChildData1 = fixture.componentInstance.data[0].childData;
        expect(childGrid1.data).toBe(expectedChildData1);
        expect(childGrid1.getCellByColumn(0, 'ID').value).toBe('00');

        const childGrid2 = hierarchicalGrid.hgridAPI.getChildGrids(false)[1];
        const expectedChildData2 = fixture.componentInstance.data[1].childData;
        expect(childGrid2.data).toBe(expectedChildData2);
        expect(childGrid2.getCellByColumn(0, 'ID').value).toBe('10');

        hierarchicalGrid.verticalScrollContainer.scrollNext();

        await wait(100);
        fixture.detectChanges();
        expect(childGrid1.data).toBe(expectedChildData1);
        expect(childGrid1.getCellByColumn(0, 'ID').value).toBe('00');
        expect(childGrid2.data).toBe(expectedChildData2);
        expect(childGrid2.getCellByColumn(0, 'ID').value).toBe('10');
    });

    it('should not lose scroll position after expanding/collapsing a row.', async() => {
        hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop = 750;
        await wait(100);
        fixture.detectChanges();
        const startIndex = hierarchicalGrid.verticalScrollContainer.state.startIndex;
        const topOffset = fixture.debugElement.queryAll(By.css('.igx-display-container'))[1].nativeElement.style.top;
        const secondRow = hierarchicalGrid.dataRowList.toArray()[1];
        // expand second row
        secondRow.nativeElement.children[0].click();
        await wait(100);
        fixture.detectChanges();

        expect(hierarchicalGrid.verticalScrollContainer.state.startIndex).toEqual(startIndex);
        expect(
            parseInt(fixture.debugElement.queryAll(By.css('.igx-display-container'))[1].nativeElement.style.top, 10) -
            parseInt(topOffset, 10)
        ).toBeLessThanOrEqual(1);

        secondRow.nativeElement.children[0].click();
        await wait(100);
        fixture.detectChanges();
        // collapse second row
        expect(hierarchicalGrid.verticalScrollContainer.state.startIndex).toEqual(startIndex);
        expect(
            parseInt(fixture.debugElement.queryAll(By.css('.igx-display-container'))[1].nativeElement.style.top, 10) -
            parseInt(topOffset, 10)
        ).toBeLessThanOrEqual(1);
    });

    it('should not lose scroll position after expanding a row when there are already expanded rows above.', async() => {
        // Expand two rows at the top
        hierarchicalGrid.dataRowList.toArray()[2].nativeElement.children[0].click();
        await wait(100);
        fixture.detectChanges();

        hierarchicalGrid.dataRowList.toArray()[1].nativeElement.children[0].click();
        await wait(100);
        fixture.detectChanges();

        // Scroll to bottom
        hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop = 5000;
        await wait(100);
        fixture.detectChanges();

        // Expand two rows at the bottom
        hierarchicalGrid.dataRowList.toArray()[6].nativeElement.children[0].click();
        await wait(100);
        fixture.detectChanges();

        hierarchicalGrid.dataRowList.toArray()[4].nativeElement.children[0].click();
        await wait(100);
        fixture.detectChanges();

        // Scroll to top to make sure top.
        hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop = 0;
        await wait(100);
        fixture.detectChanges();

        // Scroll to somewhere in the middle and make sure scroll position stays when expanding/collapsing.
        hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop = 1250;
        await wait(100);
        fixture.detectChanges();
        const startIndex = hierarchicalGrid.verticalScrollContainer.state.startIndex;
        const topOffset = fixture.debugElement.queryAll(By.css('.igx-display-container'))[1].nativeElement.style.top;
        const secondRow = hierarchicalGrid.rowList.toArray()[2];
        // expand second row
        secondRow.nativeElement.children[0].click();
        await wait(100);
        fixture.detectChanges();

        expect(hierarchicalGrid.verticalScrollContainer.state.startIndex).toEqual(startIndex);
        expect(
            parseInt(fixture.debugElement.queryAll(By.css('.igx-display-container'))[1].nativeElement.style.top, 10) -
            parseInt(topOffset, 10)
        ).toBeLessThanOrEqual(1);

        secondRow.nativeElement.children[0].click();
        await wait(100);
        fixture.detectChanges();
        // collapse second row
        expect(hierarchicalGrid.verticalScrollContainer.state.startIndex).toEqual(startIndex);
        expect(
            parseInt(fixture.debugElement.queryAll(By.css('.igx-display-container'))[1].nativeElement.style.top, 10) -
            parseInt(topOffset, 10)
        ).toBeLessThanOrEqual(1);
    });

    it('should be able to scroll last row in view after all rows get expanded.', async() => {
        // expand all
        hierarchicalGrid.hierarchicalState = fixture.componentInstance.data.map((rec) => {
            return { rowID: hierarchicalGrid.primaryKey ? rec[hierarchicalGrid.primaryKey] : rec };
        });
        await wait(100);
        fixture.detectChanges();
        hierarchicalGrid.cdr.detectChanges();
        // scroll to bottom
        hierarchicalGrid.verticalScrollContainer.scrollTo(hierarchicalGrid.verticalScrollContainer.igxForOf.length - 1);
        await wait(100);
        hierarchicalGrid.cdr.detectChanges();
        hierarchicalGrid.verticalScrollContainer.scrollTo(hierarchicalGrid.verticalScrollContainer.igxForOf.length - 1);
        await wait(100);
        hierarchicalGrid.cdr.detectChanges();

        expect(
            hierarchicalGrid.verticalScrollContainer.state.startIndex +
            hierarchicalGrid.verticalScrollContainer.state.chunkSize)
        .toBe(80);
        expect(hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop)
        .toEqual(hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollHeight -
        parseInt(hierarchicalGrid.verticalScrollContainer.igxForContainerSize, 10));
    });

    it('should update scroll height after expanding/collapsing rows.', async() => {
        const scrHeight = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollHeight;
        const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
        firstRow.nativeElement.children[0].click();
        hierarchicalGrid.verticalScrollContainer.addScrollTop(1);
        await wait(100);
        hierarchicalGrid.cdr.detectChanges();
        const childGrid1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        expect(hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollHeight)
        .toBeGreaterThan(scrHeight + childGrid1.calcHeight);
        expect(childGrid1.nativeElement.parentElement.className.indexOf('igx-grid__hierarchical-indent--scroll'))
        .not.toBe(-1);
    });

    it('should update scroll height after expanding/collapsing row in a nested child grid that has no height.', async() => {

        fixture.componentInstance.data = [
            {ID: 0, ChildLevels: 3,  ProductName: 'Product: A0 '},
            {ID: 1, ChildLevels: 3,  ProductName: 'Product: A0 '},
            {ID: 2, ChildLevels: 2,  ProductName: 'Product: A0 ' ,
             childData: [
                 { ID: 1, ChildLevels: 2,  ProductName: 'Product: A1',
                 childData: fixture.componentInstance.generateData(100, 0)
                }
             ]
            }];
        fixture.detectChanges();

        let scrHeight = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollHeight;
        expect(scrHeight).toBe(0);

        hierarchicalGrid.dataRowList.toArray()[2].nativeElement.children[0].click();
        await wait(100);
        fixture.detectChanges();
        hierarchicalGrid.verticalScrollContainer.scrollNext();
        await wait(100);
        fixture.detectChanges();

        const childGrid1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        scrHeight = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollHeight;
        expect(scrHeight).toBe( 3 * 51 + childGrid1.nativeElement.closest('.igx-grid__tr-container').offsetHeight - 1);

        // expand
        childGrid1.dataRowList.toArray()[0].nativeElement.children[0].click();
        await wait(100);
        fixture.detectChanges();
        scrHeight = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollHeight;
        expect(scrHeight).toBe( 3 * 51 + childGrid1.nativeElement.closest('.igx-grid__tr-container').offsetHeight - 1);

        // collapse
        childGrid1.dataRowList.toArray()[0].nativeElement.children[0].click();
        await wait(100);
        fixture.detectChanges();
        scrHeight = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollHeight;
        expect(scrHeight).toBe( 3 * 51 + childGrid1.nativeElement.closest('.igx-grid__tr-container').offsetHeight - 1);
    });

    it('should update context information correctly for child grid container after scrolling',  async() => {
        // expand 3rd row
        const row = hierarchicalGrid.dataRowList.toArray()[3];
        row.nativeElement.children[0].click();
        fixture.detectChanges();

        // verify index and rowData
        let childRowComponent = fixture.debugElement.query(By.css('igx-child-grid-row')).componentInstance;
        expect(childRowComponent.rowData.rowID).toBe('3');
        expect(childRowComponent.index).toBe(4);

        hierarchicalGrid.verticalScrollContainer.scrollNext();
        await wait(100);
        fixture.detectChanges();
        childRowComponent = fixture.debugElement.query(By.css('igx-child-grid-row')).componentInstance;
        expect(childRowComponent.rowData.rowID).toBe('3');
        expect(childRowComponent.index).toBe(4);
    });

});

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [allowFiltering]="true"
     [autoGenerate]="true" [height]="'400px'" [width]="'500px'" #hierarchicalGrid primaryKey="ID">
        <igx-row-island [key]="'childData'" [autoGenerate]="true" [allowFiltering]="true" #rowIsland>
            <igx-row-island [key]="'childData'" [autoGenerate]="true" #rowIsland2 >
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridTestBaseComponent {
    public data;
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent }) public rowIsland2: IgxRowIslandComponent;

    constructor() {
        // 3 level hierarchy
        this.data = this.generateData(40, 3);
    }
    generateData(count: number, level: number, parendID?) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            const rowID = parendID ? parendID + i : i.toString();
           if (level > 0 ) {
                children = this.generateData(count / 2 , currLevel - 1, rowID);
           }
           prods.push({
            ID: rowID, ChildLevels: currLevel,  ProductName: 'Product: A' + i, 'Col1': i,
            'Col2': i, 'Col3': i, childData: children, childData2: children });
        }
        return prods;
    }
}
