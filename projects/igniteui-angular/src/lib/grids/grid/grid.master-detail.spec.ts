import { Component, ViewChild, EventEmitter } from '@angular/core';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { UIInteractions, wait} from '../../test-utils/ui-interactions.spec';
import { IgxGridModule } from './index';
import { IgxGridComponent } from './grid.component';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { IgxGridRowComponent } from './grid-row.component';
import { GridFunctions } from '../../test-utils/grid-functions.spec';

const COLLAPSED_ICON_NAME = 'chevron_right';
const EXPANDED_ICON_NAME = 'expand_more';

describe('IgxGrid Master Detail', () => {
    let fix: ComponentFixture<any>;
    let grid: IgxGridComponent;

    describe('Basic', () => {
        configureTestSuite();
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    DefaultGridMasterDetailComponent
                ],
                imports: [IgxGridModule, NoopAnimationsModule]
            }).compileComponents();
        }));

        beforeEach(async(() => {
            fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should render an expand icon for all rows', () => {
            const expandIcons = grid.rowList.map((row) => {
                const icon = row.element.nativeElement.querySelector('igx-icon');
                if (icon.innerText === 'chevron_right') {
                    return icon;
                }
                return null;
            }).filter(icon => icon !== null);
            expect(grid.rowList.length).toEqual(expandIcons.length);
        });

        it('Should correctly expand a basic detail view, update expansionStates and the context proved should be correct', (async() => {
            await GridFunctions.expandMasterRowByClick(fix, grid.rowList.first);

            const firstRowIcon = grid.rowList.first.element.nativeElement.querySelector('igx-icon');
            const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);

            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.has(grid.rowList.first.rowID)).toBeTruthy();
            expect(grid.expansionStates.get(grid.rowList.first.rowID)).toBeTruthy();
            expect(firstRowIcon.innerText).toEqual(EXPANDED_ICON_NAME);
            expect(firstRowDetail.querySelector('.addressArea').innerText).toEqual('Obere Str. 57');
        }));

        it('Should expand and collapse a row in view by using the expand(rowID) and collapse(rowID) methods.', () => {
            grid.expand(fix.componentInstance.data[0].ID);
            fix.detectChanges();
            let firstRowIcon = grid.rowList.first.element.nativeElement.querySelector('igx-icon');
            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.has(grid.rowList.first.rowID)).toBeTruthy();
            expect(grid.rowList.toArray()[0].expanded).toBeTruthy();
            expect(firstRowIcon.innerText).toEqual(EXPANDED_ICON_NAME);
            grid.collapse(fix.componentInstance.data[0].ID);
            fix.detectChanges();
            firstRowIcon = grid.rowList.first.element.nativeElement.querySelector('igx-icon');
            expect(grid.expansionStates.get(fix.componentInstance.data[0].ID)).toBeFalsy();
            expect(grid.rowList.toArray()[0].expanded).toBeFalsy();
            expect(firstRowIcon.innerText).toEqual(COLLAPSED_ICON_NAME);
        });

        it('Should expand a row out of view by using the collapse() method and update expansionStates.', () => {
            const lastIndex = fix.componentInstance.data.length - 1;
            const lastDataRecID = fix.componentInstance.data[lastIndex].ID;
            grid.expand(lastDataRecID);
            fix.detectChanges();
            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.get(lastDataRecID)).toBeTruthy();
        });

        it('Should collapse a row out of view by using the collapse() method and update expansionStates.', () => {
            GridFunctions.setAllExpanded(grid, fix.componentInstance.data);
            fix.detectChanges();
            const lastIndex = fix.componentInstance.data.length - 1;
            const lastDataRecID = fix.componentInstance.data[lastIndex].ID;
            grid.collapse(lastDataRecID);
            fix.detectChanges();
            expect(grid.expansionStates.size).toEqual(fix.componentInstance.data.length);
            expect(grid.expansionStates.get(lastDataRecID)).toBeFalsy();
        });

        it('Should toggle a row expand state by using the toggleRow(rowID) method.', () => {
            grid.toggleRow(fix.componentInstance.data[0].ID);
            fix.detectChanges();
            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.has(grid.rowList.first.rowID)).toBeTruthy();
            expect(grid.rowList.toArray()[0].expanded).toBeTruthy();
            grid.toggleRow(fix.componentInstance.data[0].ID);
            fix.detectChanges();
            expect(grid.expansionStates.get(fix.componentInstance.data[0].ID)).toBeFalsy();
            expect(grid.rowList.toArray()[0].expanded).toBeFalsy();
        });

        it('Should expand all rows using the expandAll() method and the expansion state should be updated.', () => {
            grid.expandAll();
            fix.detectChanges();
            expect(grid.expansionStates.size).toEqual(fix.componentInstance.data.length);
            grid.rowList.toArray().forEach(row => {
                expect(row.expanded).toBeTruthy();
            });
        });

        it('Should collapse all rows using the collapseAll() method and the expansion state should be updated.', () => {
            GridFunctions.setAllExpanded(grid, fix.componentInstance.data);
            fix.detectChanges();
            grid.rowList.toArray().forEach(row => {
                expect(row.expanded).toBeTruthy();
            });
            grid.collapseAll();
            fix.detectChanges();
            expect(grid.expansionStates.size).toEqual(0);
            grid.rowList.toArray().forEach(row => {
                expect(row.expanded).toBeFalsy();
            });
        });
    });
});

@Component({
    template: `
        <igx-grid [data]="data" [width]="width" [height]="height" [primaryKey]="'ID'" [paging]="paging" [rowSelectable]="rowSelectable">
            <igx-column *ngFor="let c of columns" [field]="c.field" [header]="c.field" [width]="c.width" [dataType]='c.dataType'
                [hidden]='c.hidden' [sortable]="c.sortable" [movable]='c.movable' [groupable]='c.groupable' [editable]="c.editable"
                [hasSummary]="c.hasSummary" [pinned]='c.pinned'>
            </igx-column>

            <ng-template igxGridDetail let-dataItem>
                <div>
                    <div class="checkboxArea">
                        <igx-checkbox (change)="onCheckboxClicked($event, dataItem)" [disableRipple]="true"></igx-checkbox>
                        <span style="font-weight: 600">Available</span>
                    </div>
                    <div class="addressArea">{{dataItem.Address}}</div>
                    <div class="inputArea"><input type="text" name="Comment"></div>
                </div>
            </ng-template>
        </igx-grid>
    `
})
export class DefaultGridMasterDetailComponent {

    public width = '800px';
    public height = '500px';
    public data = SampleTestData.contactInfoDataFull();
    public columns = [
        { field: 'ContactName', width: 400, dataType: 'string' },
        { field: 'CompanyName', width: 400, dataType: 'string' }
    ];
    public paging = false;
    public rowSelectable = false;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    public checkboxChanged: EventEmitter<any>;

    public checkboxClicked(event, context) {
        this.checkboxChanged.emit({ event: event, context: context });
    }
}
