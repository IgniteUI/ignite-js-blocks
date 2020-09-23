import { Component, TemplateRef, ViewChild, OnInit, ElementRef } from '@angular/core';
import { SampleTestData } from './sample-test-data.spec';
import { IgxColumnComponent } from '../grids/columns/column.component';
import { IgxGridComponent } from '../grids/grid/public_api';
import { IgxColumnGroupComponent } from '../grids/columns/column-group.component';

@Component({
    template: `
    <div id="grid-wrapper" [style.width.px]="gridWrapperWidthPx">
        <igx-grid #grid [data]="data" [height]='gridHeight'>
            <igx-column-group header="Location">
                <igx-column field="City" [width]='columnWidth'></igx-column>
            </igx-column-group>
        </igx-grid>
    </div>
    `
})
export class OneGroupOneColGridComponent {
    @ViewChild('grid', { static: true }) public grid: IgxGridComponent;
    public gridWrapperWidthPx = '1000';
    public gridHeight = '500px';
    public columnWidth: string;
    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <div id="grid-wrapper" [style.width.px]="gridWrapperWidthPx">
        <igx-grid #grid [data]="data" [height]='gridHeight'>
            <igx-column-group header="Location">
                <igx-column field="Country" [width]='columnWidth'></igx-column>
                <igx-column field="Region" [width]='columnWidth'></igx-column>
                <igx-column field="City" [width]='columnWidth'></igx-column>
            </igx-column-group>
        </igx-grid>
    </div>
    `
})
export class OneGroupThreeColsGridComponent {
    @ViewChild('grid', { static: true }) public grid: IgxGridComponent;
    public gridWrapperWidthPx = '900';
    public gridHeight = '500px';
    public columnWidth: string;
    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px">
        <igx-column field="ID"></igx-column>
        <igx-column-group header="General Information">
            <igx-column filterable="true" sortable="true" resizable="true" field="CompanyName"></igx-column>
            <igx-column-group header="Person Details">
                <igx-column filterable="true" sortable="true" resizable="true" field="ContactName"></igx-column>
                <igx-column filterable="true" sortable="true" resizable="true" field="ContactTitle"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column-group header="Address Information">
            <igx-column-group header="Location">
                <igx-column filterable="true" sortable="true" resizable="true" field="Country"></igx-column>
                <igx-column filterable="true" sortable="true" resizable="true" field="Region"></igx-column>
                <igx-column filterable="true" sortable="true" resizable="true" field="City"></igx-column>
                <igx-column filterable="true" sortable="true" resizable="true" field="Address"></igx-column>
            </igx-column-group>
            <igx-column-group header="Contact Information">
                <igx-column filterable="true" sortable="true" resizable="true" field="Phone"></igx-column>
                <igx-column filterable="true" sortable="true" resizable="true" field="Fax"></igx-column>
                <igx-column filterable="true" sortable="true" resizable="true" field="PostalCode"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column-group #emptyColGroup header="Empty Header">
        </igx-column-group>
    </igx-grid>
    `
})
export class ColumnGroupTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    grid: IgxGridComponent;

    @ViewChild('emptyColGroup', { read: IgxColumnGroupComponent, static: true })
    emptyColGroup: IgxColumnGroupComponent;

    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="600px" width="800px">
        <igx-column #idCol field="ID"></igx-column>
        <igx-column-group #genInfoColGroup header="General Information">
            <igx-column #companyNameCol field="CompanyName"></igx-column>
            <igx-column-group #pDetailsColGroup header="Person Details">
                <igx-column #contactNameCol field="ContactName"></igx-column>
                <igx-column #contactTitleCol field="ContactTitle"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column-group #addrInfoColGroup header="Address Information">
            <igx-column-group #locationColGroup header="Location">
                <igx-column #countryCol field="Country"></igx-column>
                <igx-column #regionCol field="Region"></igx-column>
                <igx-column-group #locCityColGroup header="Location City">
                    <igx-column #cityCol field="City"></igx-column>
                    <igx-column #addressCol field="Address"></igx-column>
                </igx-column-group>
            </igx-column-group>
            <igx-column-group #contactInfoColGroup header="Contact Information">
                <igx-column #phoneCol field="Phone"></igx-column>
                <igx-column #faxCol field="Fax"></igx-column>
            </igx-column-group>
            <igx-column-group #postalCodeColGroup header="Postal Code">
                <igx-column #postalCodeCol field="PostalCode"></igx-column>
            </igx-column-group>
        </igx-column-group>
    </igx-grid>
    `
})
export class ColumnGroupFourLevelTestComponent implements OnInit {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    grid: IgxGridComponent;

    @ViewChild('idCol', { read: IgxColumnComponent, static: true })
    idCol: IgxColumnComponent;

    @ViewChild('genInfoColGroup', { read: IgxColumnGroupComponent, static: true })
    genInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('companyNameCol', { read: IgxColumnComponent, static: true })
    companyNameCol: IgxColumnComponent;
    @ViewChild('pDetailsColGroup', { read: IgxColumnGroupComponent, static: true })
    pDetailsColGroup: IgxColumnGroupComponent;
    @ViewChild('contactNameCol', { read: IgxColumnComponent, static: true })
    contactNameCol: IgxColumnComponent;
    @ViewChild('contactTitleCol', { read: IgxColumnComponent, static: true })
    contactTitleCol: IgxColumnComponent;

    public genInfoColsAndGroups = [];

    @ViewChild('addrInfoColGroup', { read: IgxColumnGroupComponent, static: true })
    addrInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('locationColGroup', { read: IgxColumnGroupComponent, static: true })
    locationColGroup: IgxColumnGroupComponent;
    @ViewChild('countryCol', { read: IgxColumnComponent, static: true })
    countryCol: IgxColumnComponent;
    @ViewChild('regionCol', { read: IgxColumnComponent, static: true })
    regionCol: IgxColumnComponent;
    @ViewChild('locCityColGroup', { read: IgxColumnGroupComponent, static: true })
    locCityColGroup: IgxColumnGroupComponent;
    @ViewChild('cityCol', { read: IgxColumnComponent, static: true })
    cityCol: IgxColumnComponent;
    @ViewChild('addressCol', { read: IgxColumnComponent, static: true })
    addressCol: IgxColumnComponent;
    @ViewChild('contactInfoColGroup', { read: IgxColumnGroupComponent, static: true })
    contactInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('phoneCol', { read: IgxColumnComponent, static: true })
    phoneCol: IgxColumnComponent;
    @ViewChild('faxCol', { read: IgxColumnComponent, static: true })
    faxCol: IgxColumnComponent;
    @ViewChild('postalCodeColGroup', { read: IgxColumnGroupComponent, static: true })
    postalCodeColGroup: IgxColumnGroupComponent;
    @ViewChild('postalCodeCol', { read: IgxColumnComponent, static: true })
    postalCodeCol: IgxColumnComponent;

    public addressColsAndGroups = [];
    public colsAndGroupsNaturalOrder = [];

    data = SampleTestData.contactInfoDataFull();

    ngOnInit() {
        this.genInfoColsAndGroups = [this.genInfoColGroup, this.companyNameCol, this.pDetailsColGroup,
        this.contactNameCol, this.contactTitleCol];

        this.addressColsAndGroups = [this.addrInfoColGroup, this.locationColGroup, this.countryCol,
        this.regionCol, this.locCityColGroup, this.cityCol, this.addressCol, this.contactInfoColGroup,
        this.phoneCol, this.faxCol, this.postalCodeColGroup, this.postalCodeCol];

        this.colsAndGroupsNaturalOrder = [this.idCol].concat(this.genInfoColsAndGroups)
            .concat(this.addressColsAndGroups);
    }
}


@Component({
    template: `
    <igx-grid #grid [data]="data" height="600px" width="800px">
        <igx-column field="ID"></igx-column>
        <igx-column-group header="General Information">
            <igx-column  field="CompanyName"></igx-column>
            <igx-column-group header="Person Details">
                <igx-column field="ContactName"></igx-column>
                <igx-column field="ContactTitle"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column-group header="Address Information">
            <igx-column field="Region"></igx-column>
            <igx-column-group header="Location">
                <igx-column field="Country"></igx-column>
                <igx-column-group header="Location City">
                    <igx-column field="City"></igx-column>
                    <igx-column field="Address"></igx-column>
                </igx-column-group>
            </igx-column-group>
        </igx-column-group>
    </igx-grid>
       `
})
export class ColumnGroupTwoGroupsTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    grid: IgxGridComponent;

    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="600px" width="1000px">
        <igx-column-group #genInfoColGroup header="General Information">
            <igx-column #companyNameCol field="CompanyName" [pinned]="cnPinned"></igx-column>
            <igx-column #contactNameCol field="ContactName"></igx-column>
            <igx-column #contactTitleCol field="ContactTitle"></igx-column>
        </igx-column-group>
        <igx-column-group #locationColGroup header="Location">
            <igx-column #countryCol field="Country"></igx-column>
            <igx-column #regionCol field="Region"></igx-column>
            <igx-column #cityCol field="City"></igx-column>
        </igx-column-group>
        <igx-column-group #contactInfoColGroup header="Contact Information">
            <igx-column #phoneCol field="Phone"></igx-column>
            <igx-column #faxCol field="Fax"></igx-column>
            <igx-column #postalCodeCol field="PostalCode"></igx-column>
        </igx-column-group>
    </igx-grid>
    `
})
export class ThreeGroupsThreeColumnsGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    grid: IgxGridComponent;

    @ViewChild('genInfoColGroup', { read: IgxColumnGroupComponent, static: true })
    genInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('companyNameCol', { read: IgxColumnComponent, static: true })
    companyNameCol: IgxColumnComponent;
    @ViewChild('contactNameCol', { read: IgxColumnComponent, static: true })
    contactNameCol: IgxColumnComponent;
    @ViewChild('contactTitleCol', { read: IgxColumnComponent, static: true })
    contactTitleCol: IgxColumnComponent;

    @ViewChild('locationColGroup', { read: IgxColumnGroupComponent, static: true })
    locationColGroup: IgxColumnGroupComponent;
    @ViewChild('countryCol', { read: IgxColumnComponent, static: true })
    countryCol: IgxColumnComponent;
    @ViewChild('regionCol', { read: IgxColumnComponent, static: true })
    regionCol: IgxColumnComponent;
    @ViewChild('cityCol', { read: IgxColumnComponent, static: true })
    cityCol: IgxColumnComponent;

    @ViewChild('contactInfoColGroup', { read: IgxColumnGroupComponent, static: true })
    contactInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('phoneCol', { read: IgxColumnComponent, static: true })
    phoneCol: IgxColumnComponent;
    @ViewChild('faxCol', { read: IgxColumnComponent, static: true })
    faxCol: IgxColumnComponent;
    @ViewChild('postalCodeCol', { read: IgxColumnComponent, static: true })
    postalCodeCol: IgxColumnComponent;

    data = SampleTestData.contactInfoDataFull();
    public cnPinned = false;
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="600px" width="1000px">
        <igx-column-group #contactInfoColGroup header="Contact Info">
            <igx-column-group #locationColGroup header="Location">
                <igx-column #countryCol field="Country"></igx-column>
            </igx-column-group>
            <igx-column #phoneCol field="Phone"></igx-column>
        </igx-column-group>
        <igx-column-group #genInfoColGroup header="General Information">
            <igx-column #companyNameCol field="CompanyName"></igx-column>
        </igx-column-group>
        <igx-column #cityCol field="City"></igx-column>
    </igx-grid>
    `
})
export class NestedColGroupsGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    grid: IgxGridComponent;

    @ViewChild('contactInfoColGroup', { read: IgxColumnGroupComponent, static: true })
    contactInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('locationColGroup', { read: IgxColumnGroupComponent, static: true })
    locationColGroup: IgxColumnGroupComponent;
    @ViewChild('countryCol', { read: IgxColumnComponent, static: true })
    countryCol: IgxColumnComponent;
    @ViewChild('phoneCol', { read: IgxColumnComponent, static: true })
    phoneCol: IgxColumnComponent;

    @ViewChild('genInfoColGroup', { read: IgxColumnGroupComponent, static: true })
    genInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('companyNameCol', { read: IgxColumnComponent, static: true })
    companyNameCol: IgxColumnComponent;

    @ViewChild('cityCol', { read: IgxColumnComponent, static: true })
    cityCol: IgxColumnComponent;

    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
        <igx-grid [data]="data" [allowFiltering]="true">
            <igx-column-group *ngFor="let colGroup of columnGroups" [header]="colGroup.columnHeader">
                <igx-column *ngFor="let column of colGroup.columns" [field]="column.field" [dataType]="column.type"
                    [filterable]="true"></igx-column>
            </igx-column-group>
        </igx-grid>
    `
})
export class DynamicColGroupsGridComponent {

    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;

    public columnGroups: Array<any>;
    public data = SampleTestData.contactInfoDataFull();

    constructor() {
        this.columnGroups = [
            {
                columnHeader: 'First', columns: [
                    { field: 'ID', type: 'string' },
                    { field: 'CompanyName', type: 'string' },
                    { field: 'ContactName', type: 'string' },
                ]
            },
            {
                columnHeader: 'Second', columns: [
                    { field: 'ContactTitle', type: 'string' },
                    { field: 'Address', type: 'string' },
                ]
            },
            {
                columnHeader: 'Third', columns: [
                    { field: 'PostlCode', type: 'string' },
                    { field: 'Contry', type: 'string' },
                ]
            },
        ];
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="600px" width="1000px" columnWidth="100px">
        <igx-column #idCol field="ID" header="Id"></igx-column>
        <igx-column-group #genInfoColGroup header="General Information">
            <igx-column #companyNameCol field="CompanyName" header="Company Name"></igx-column>
            <igx-column-group #pDetailsColGroup header="Person Details">
                <igx-column #contactNameCol field="ContactName" header="Contact Name"></igx-column>
                <igx-column #contactTitleCol field="ContactTitle" header="Contact Title"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column-group #postalCodeColGroup header="Postal Code">
            <igx-column #postalCodeCol field="PostalCode" header="Postal Code"></igx-column>
        </igx-column-group>
        <igx-column-group #cityColGroup header="City Group">
            <igx-column #cityCol field="City" header="City"></igx-column>
        </igx-column-group>
        <igx-column-group #countryColGroup header="Country Group">
            <igx-column #countryCol field="Country" header="Country"></igx-column>
        </igx-column-group>
        <igx-column-group #regionColGroup header="Region Group">
            <igx-column #regionCol field="Region" header="Region"></igx-column>
        </igx-column-group>
        <igx-column-group #addressColGroup header="Address Group">
            <igx-column #addressCol field="Address" header="Address"></igx-column>
        </igx-column-group>
        <igx-column-group #phoneColGroup header="Phone Group">
            <igx-column #phoneCol field="Phone" header="Phone"></igx-column>
        </igx-column-group>
        <igx-column-group #faxColGroup header="Fax Group">
            <igx-column #faxCol field="Fax" header="Fax"></igx-column>
        </igx-column-group>
    </igx-grid>
    `
})
export class StegosaurusGridComponent implements OnInit {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    grid: IgxGridComponent;

    @ViewChild('idCol', { read: IgxColumnComponent, static: true })
    idCol: IgxColumnComponent;

    @ViewChild('genInfoColGroup', { read: IgxColumnGroupComponent, static: true })
    genInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('companyNameCol', { read: IgxColumnComponent, static: true })
    companyNameCol: IgxColumnComponent;
    @ViewChild('pDetailsColGroup', { read: IgxColumnGroupComponent, static: true })
    pDetailsColGroup: IgxColumnGroupComponent;
    @ViewChild('contactNameCol', { read: IgxColumnComponent, static: true })
    contactNameCol: IgxColumnComponent;
    @ViewChild('contactTitleCol', { read: IgxColumnComponent, static: true })
    contactTitleCol: IgxColumnComponent;

    @ViewChild('postalCodeColGroup', { read: IgxColumnGroupComponent, static: true })
    postalCodeColGroup: IgxColumnGroupComponent;
    @ViewChild('postalCodeCol', { read: IgxColumnComponent, static: true })
    postalCodeCol: IgxColumnComponent;

    @ViewChild('cityColGroup', { read: IgxColumnGroupComponent, static: true })
    cityColGroup: IgxColumnGroupComponent;
    @ViewChild('cityCol', { read: IgxColumnComponent, static: true })
    cityCol: IgxColumnComponent;

    @ViewChild('countryColGroup', { read: IgxColumnGroupComponent, static: true })
    countryColGroup: IgxColumnGroupComponent;
    @ViewChild('countryCol', { read: IgxColumnComponent, static: true })
    countryCol: IgxColumnComponent;

    @ViewChild('regionColGroup', { read: IgxColumnGroupComponent, static: true })
    regionColGroup: IgxColumnGroupComponent;
    @ViewChild('regionCol', { read: IgxColumnComponent, static: true })
    regionCol: IgxColumnComponent;

    @ViewChild('addressColGroup', { read: IgxColumnGroupComponent, static: true })
    addressColGroup: IgxColumnGroupComponent;
    @ViewChild('addressCol', { read: IgxColumnComponent, static: true })
    addressCol: IgxColumnComponent;

    @ViewChild('phoneColGroup', { read: IgxColumnGroupComponent, static: true })
    phoneColGroup: IgxColumnGroupComponent;
    @ViewChild('phoneCol', { read: IgxColumnComponent, static: true })
    phoneCol: IgxColumnComponent;

    @ViewChild('faxColGroup', { read: IgxColumnGroupComponent, static: true })
    faxColGroup: IgxColumnGroupComponent;
    @ViewChild('faxCol', { read: IgxColumnComponent, static: true })
    faxCol: IgxColumnComponent;

    public genInfoColList;
    public postalCodeColList;
    public cityColList;
    public countryColList;
    public regionColList;
    public addressColList;
    public phoneColList;
    public faxColList;

    data = SampleTestData.contactInfoDataFull();

    ngOnInit() {
        this.genInfoColList = [this.genInfoColGroup, this.companyNameCol, this.pDetailsColGroup,
        this.contactNameCol, this.contactTitleCol];
        this.postalCodeColList = [this.postalCodeColGroup, this.postalCodeCol];
        this.cityColList = [this.cityColGroup, this.cityCol];
        this.countryColList = [this.countryColGroup, this.countryCol];
        this.regionColList = [this.regionColGroup, this.regionCol];
        this.addressColList = [this.addressColGroup, this.addressCol];
        this.phoneColList = [this.phoneColGroup, this.phoneCol];
        this.faxColList = [this.faxColGroup, this.faxCol];
    }
}

@Component({
    template: `
        <igx-grid #grid [data]="data" [height]="gridHeight" [columnWidth]="columnWidth">
            <igx-column-group headerGroupClasses="firstGroup" [header]="firstGroupTitle">
                <igx-column headerClasses="firstGroupColumn" field="ID" *ngFor="let item of hunderdItems;"></igx-column>
            </igx-column-group>
            <igx-column-group headerGroupClasses="secondGroup" [header]="secondGroupTitle">
                <igx-column-group headerGroupClasses="secondSubGroup" [header]="secondSubGroupTitle">
                    <igx-column headerClasses="secondSubGroupColumn" field="ID" *ngFor="let item of fiftyItems;"></igx-column>
                </igx-column-group>
                <igx-column-group headerGroupClasses="secondSubGroup" [header]="secondSubGroupTitle">
                    <igx-column  headerClasses="secondSubGroupColumn" field="ID" *ngFor="let item of fiftyItems;"></igx-column>
                </igx-column-group>
            </igx-column-group>
            <igx-column headerClasses="lonelyId" [header]="idHeaderTitle" field="ID"></igx-column>
            <igx-column-group header="General Information">
                <igx-column headerClasses="companyName" [header]="companyNameTitle" field="CompanyName"></igx-column>
                <igx-column-group headerGroupClasses="personDetails" [header]="personDetailsTitle">
                    <igx-column headerClasses="personDetailsColumn" field="ContactName"></igx-column>
                    <igx-column headerClasses="personDetailsColumn" field="ContactTitle"></igx-column>
                </igx-column-group>
            </igx-column-group>
            <igx-column-group header="Address Information">
                <igx-column-group header="Location">
                    <igx-column field="Country"></igx-column>
                    <igx-column field="Region"></igx-column>
                    <igx-column field="City"></igx-column>
                    <igx-column field="Address"></igx-column>
                </igx-column-group>
                <igx-column-group header="Contact Information">
                    <igx-column field="Phone"></igx-column>
                    <igx-column field="Fax"></igx-column>
                    <igx-column field="PostalCode"></igx-column>
                </igx-column-group>
            </igx-column-group>
        </igx-grid>
    `
})
export class BlueWhaleGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    grid: IgxGridComponent;

    public gridHeight = '500px';
    public columnWidth = '100px';
    data = SampleTestData.contactInfoDataFull();

    hunderdItems = new Array(100);
    fiftyItems = new Array(50);

    firstGroupTitle = '100 IDs';
    secondGroupTitle = '2 col groups with 50 IDs each';
    secondSubGroupTitle = '50 IDs';
    idHeaderTitle = 'ID';
    companyNameTitle = 'Company Name';
    personDetailsTitle = 'Person Details';
}

@Component({
    template: `
        <igx-grid #grid [data]="data" height="600px" [columnWidth]="columnWidth">
            <igx-column-group headerGroupClasses="addressColGroup" [header]="addressColGroupTitle">
                <igx-column headerClasses="addressCol" field="Address" [header]="addressColTitle"></igx-column>
            </igx-column-group>
            <igx-column-group headerGroupClasses="phoneColGroup" [header]="phoneColGroupTitle">
                <igx-column headerClasses="phoneCol" field="Phone" [header]="phoneColTitle" [width]="phoneColWidth"></igx-column>
            </igx-column-group>
            <igx-column-group headerGroupClasses="faxColGroup" [header]="faxColGroupTitle">
                <igx-column headerClasses="faxCol" field="Fax" [header]="faxColTitle" [width]="faxColWidth"></igx-column>
            </igx-column-group>
        </igx-grid>
    `
})
export class OneColPerGroupGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    grid: IgxGridComponent;

    columnWidth = '100px';
    phoneColWidth = '200px';
    faxColWidth = '300px';

    addressColGroupTitle = 'Address Group';
    addressColTitle = 'Address';

    phoneColGroupTitle = 'Phone Group';
    phoneColTitle = 'Phone';

    faxColGroupTitle = 'Fax Group';
    faxColTitle = 'Fax';

    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
        <igx-grid #grid [data]="data" height="600px" [columnWidth]="columnWidth">
            <igx-column-group headerGroupClasses="masterColGroup" [header]="masterColGroupTitle">
                <igx-column-group headerGroupClasses="firstSlaveColGroup slaveColGroup" [header]="firstSlaveColGroupTitle">
                    <igx-column headerClasses="addressCol firstSlaveChild" field="Address" [header]="addressColTitle"></igx-column>
                    <igx-column headerClasses="phoneCol firstSlaveChild" field="Phone" [header]="phoneColTitle" [width]="phoneColWidth">
                    </igx-column>
                </igx-column-group>
                <igx-column-group headerGroupClasses="secondSlaveColGroup slaveColGroup" [header]="secondSlaveColGroupTitle">
                    <igx-column headerClasses="faxCol secondSlaveChild" field="Fax" [header]="faxColTitle" [width]="faxColWidth">
                    </igx-column>
                    <igx-column headerClasses="cityCol secondSlaveChild" field="City" [header]="cityColTitle" [width]="cityColWidth">
                    </igx-column>
                </igx-column-group>
            </igx-column-group>
        </igx-grid>
    `
})
export class NestedColumnGroupsGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    grid: IgxGridComponent;

    columnWidth = '100px';
    phoneColWidth = '200px';
    faxColWidth = '300px';
    cityColWidth = '400px';

    masterColGroupTitle = 'Master';
    firstSlaveColGroupTitle = 'Slave 1';
    secondSlaveColGroupTitle = 'Slave 2';

    addressColTitle = 'Address';
    phoneColTitle = 'Phone';
    faxColTitle = 'Fax';
    cityColTitle = 'City';

    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
        <igx-grid #grid [data]="data" height="500px" columnWidth="100px">
            <igx-column-group header="MCH" *ngFor="let item of mchCount;">
                <igx-column field="City"></igx-column>
            </igx-column-group>
        </igx-grid>
    `
})
export class DynamicGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    grid: IgxGridComponent;
    mchCount = new Array(1);

    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <ng-template #dynamicColGroupTemplate>
        <span class="dynamic-col-group-template">Dynamic column group template</span>
    </ng-template>
    <igx-grid #grid [data]="data" height="600px" width="1000px">
        <igx-column-group #contactInfoColGroup header="Contact Info">
            <igx-column-group #locationColGroup header="Location">
                <ng-template igxHeader>
                    <span class="col-group-template">Column group template</span>
                </ng-template>
                <igx-column #countryCol field="Country"></igx-column>
            </igx-column-group>
            <igx-column #phoneCol field="Phone"></igx-column>
        </igx-column-group>
        <igx-column-group #genInfoColGroup header="General Information">
            <igx-column #companyNameCol field="CompanyName"></igx-column>
        </igx-column-group>
        <igx-column #cityCol field="City"></igx-column>
    </igx-grid>
    `
})
export class NestedColGroupsWithTemplatesGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    grid: IgxGridComponent;

    @ViewChild('contactInfoColGroup', { read: IgxColumnGroupComponent, static: true })
    contactInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('locationColGroup', { read: IgxColumnGroupComponent, static: true })
    locationColGroup: IgxColumnGroupComponent;
    @ViewChild('countryCol', { read: IgxColumnComponent, static: true })
    countryCol: IgxColumnComponent;
    @ViewChild('phoneCol', { read: IgxColumnComponent, static: true })
    phoneCol: IgxColumnComponent;

    @ViewChild('genInfoColGroup', { read: IgxColumnGroupComponent, static: true })
    genInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('companyNameCol', { read: IgxColumnComponent, static: true })
    companyNameCol: IgxColumnComponent;

    @ViewChild('cityCol', { read: IgxColumnComponent, static: true })
    cityCol: IgxColumnComponent;

    @ViewChild('dynamicColGroupTemplate', { read: TemplateRef, static: true })
    dynamicColGroupTemplate: TemplateRef<any>;

    data = SampleTestData.contactInfoDataFull();
}
