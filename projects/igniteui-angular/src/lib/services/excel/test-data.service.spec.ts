import { Injectable } from '@angular/core';
import { JSZipFiles } from './jszip-helper.spec';
import { IFileContent } from './jszip-verification-wrapper.spec';

@Injectable()
export class ExportTestDataService {

    /* eslint-disable  max-len */
    private _differentTypesData = [
        { Number: 1, String: '1', Boolean: true, Date: new Date(2018, 3, 3) },
        { Number: 2, String: '2', Boolean: false, Date: new Date(2018, 5, 6) },
        { Number: 3, String: '3', Boolean: true, Date: new Date(2018, 9, 22) }
    ];

    private _contactsData = [{
        name: 'Terrance Orta',
        phone: '770-504-2217'
    }, {
        name: 'Richard Mahoney LongerName',
        phone: ''
    }, {
        name: 'Donna Price',
        phone: '859-496-2817'
    }, {
        name: '',
        phone: '901-747-3428'
    }, {
        name: 'Dorothy H. Spencer',
        phone: '573-394-9254'
    }];

    private _contactsFunkyData = [{
        name: 'Terrance Mc\'Orta',
        phone: '(+359)770-504-2217 | 2218'
    }, {
        name: 'Richard Mahoney /LongerName/',
        phone: ''
    }, {
        name: 'Donna, \/; Price',
        phone: '859 496 28**'
    }, {
        name: '\r\n',
        phone: '901-747-3428'
    }, {
        name: 'Dorothy "H." Spencer',
        phone: '573-394-9254[fax]'
    }, {
        name: 'Иван Иванов (1,2)',
        phone: '№ 573-394-9254'
    }];

    private _contactsPartial = [
        {
            name: 'Terrance Orta',
            phone: '770-504-2217'
        }, {
            name: 'Richard Mahoney LongerName'
        }, {
            phone: '780-555-1331'
        }
    ];

    private _noHeadersStringData = [
        'Terrance Orta',
        'Richard Mahoney LongerName',
        'Donna Price',
        'Lisa Landers',
        'Dorothy H. Spencer'
    ];

    private _noHeadersNumberData = [
        10,
        20,
        30
    ];

    private _noHeadersDateTime = [
        new Date('2018'),
        new Date(2018, 3, 23),
        new Date(30),
        new Date('2018/03/23')
    ];

    private _noHeadersObjectData = [
        new ValueData('1'),
        new ValueData('2'),
        new ValueData('3')
    ];

    private _emptyObjectData = [
        {},
        {},
        {}
    ];

    private _simpleGridData = [
        { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President' },
        { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director' },
        { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director' },
        { ID: 4, Name: 'Jack Simon', JobTitle: 'Software Developer' },
        { ID: 5, Name: 'Celia Martinez', JobTitle: 'Senior Software Developer' },
        { ID: 6, Name: 'Erma Walsh', JobTitle: 'CEO' },
        { ID: 7, Name: 'Debra Morton', JobTitle: 'Associate Software Developer' },
        { ID: 8, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead' },
        { ID: 9, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer' },
        { ID: 10, Name: 'Eduardo Ramirez', JobTitle: 'Manager' }
    ];

    private _simpleGridDataFull = [
        { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President', HireDate: '2017-06-19T11:43:07.714Z' },
        { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director', HireDate: '2015-12-18T11:23:17.714Z' },
        { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director', HireDate: '2005-11-18T11:23:17.714Z' },
        { ID: 4, Name: 'Jack Simon', JobTitle: 'Software Developer', HireDate: '2008-12-18T11:23:17.714Z' },
        { ID: 5, Name: 'Celia Martinez', JobTitle: 'Senior Software Developer', HireDate: '2007-12-19T11:23:17.714Z' },
        { ID: 6, Name: 'Erma Walsh', JobTitle: 'CEO', HireDate: '2016-12-18T11:23:17.714Z' },
        { ID: 7, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', HireDate: '2005-11-19T11:23:17.714Z' },
        { ID: 8, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead', HireDate: '2005-10-14T11:23:17.714Z' },
        { ID: 9, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', HireDate: '2013-10-10T11:23:17.714Z' },
        { ID: 10, Name: 'Eduardo Ramirez', JobTitle: 'Manager', HireDate: '2011-11-28T11:23:17.714Z' }
    ];

    private _personJobHoursDataPerformance = [
        { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President', WorkingHours: 4, HireDate: '2017-06-19T11:43:07.714Z', Performance:
            [
                {Points: 3, Week: 1},
                {Points: 6, Week: 2},
                {Points: 1, Week: 3},
                {Points: 12, Week: 4},
            ]
        },
        { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director', WorkingHours: 6, HireDate: '2015-12-18T11:23:17.714Z', Performance:
            [
                {Points: 8, Week: 1},
                {Points: 7, Week: 2},
                {Points: 4, Week: 3},
                {Points: 9, Week: 4},
            ]
        },
        { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director', WorkingHours: 8, HireDate: '2005-11-18T11:23:17.714Z', Performance:
            [
                {Points: 1, Week: 1},
                {Points: 3, Week: 2},
                {Points: 14, Week: 3},
                {Points: 29, Week: 4},
            ]
        }
    ];
    constructor() { }

    public get differentTypesData() {
        return this._differentTypesData;
    }

    public get contactsData() {
        return this._contactsData;
    }
    public get contactsPartialData() {
        return this._contactsPartial;
    }
    public get contactsFunkyData() {
        return this._contactsFunkyData;
    }
    public get emptyObjectData() {
        return this._emptyObjectData;
    }

    public get noHeadersObjectData() {
        return this._noHeadersObjectData;
    }

    public get noHeadersStringData() {
        return this._noHeadersStringData;
    }
    public get noHeadersNumberData() {
        return this._noHeadersNumberData;
    }
    public get noHeadersDateTimeData() {
        return this._noHeadersDateTime;
    }

    public get simpleGridData() {
        return this._simpleGridData;
    }

    public get simpleGridDataFull() {
        return this._simpleGridDataFull;
    }

    public get personJobHoursDataPerformance() {
        return this._personJobHoursDataPerformance;
    }

    public getContactsFunkyData(delimiter) {
        return [{
            name: 'Terrance Mc\'Orta',
            phone: '(+359)770-504-2217 | 2218'
        }, {
            name: 'Richard Mahoney /LongerName/',
            phone: ''
        }, {
            name: 'Donna' + delimiter + ' \/; Price',
            phone: '859 496 28**'
        }, {
            name: '\r\n',
            phone: '901-747-3428'
        }, {
            name: 'Dorothy "H." Spencer',
            phone: '573-394-9254[fax]'
        }, {
            name: 'Иван Иванов (1' + delimiter + '2)',
            phone: '№ 573-394-9254'
        }];
    }
}

export class ValueData {
    public value: string;

    constructor(value: string) {
        this.value = value;
    }
}

export class FileContentData {

    private _fileContentCollection: IFileContent[];
    private _sharedStringsData = '';
    private _tableData = '';
    private _worksheetData = '';
    private _workbookData = `<?xml version="1.0" encoding="UTF-8"?>
    <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/` +
    `officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x15" ` +
    `xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml/2010/11/main"><fileVersion appName="xl" lastEdited="6" lowestEdited="6" ` +
    `rupBuild="14420"/><workbookPr filterPrivacy="1" defaultThemeVersion="164011"/><bookViews><workbookView xWindow="0" yWindow="0" ` +
    `windowWidth="22260" windowHeight="12645"/></bookViews><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets><calcPr ` +
    `calcId="162913"/><extLst><ext uri="{140A7094-0E35-4892-8432-C4D2E57EDEB5}" xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml` +
    `/2010/11/main"><x15:workbookPr chartTrackingRefBase="1"/></ext></extLst></workbook>`;
    private _appData = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft Excel</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop><HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>1</vt:i4></vt:variant></vt:vector></HeadingPairs><TitlesOfParts><vt:vector size="1" baseType="lpstr"><vt:lpstr>Sheet1</vt:lpstr></vt:vector></TitlesOfParts><Company></Company><LinksUpToDate>false</LinksUpToDate><SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged><AppVersion>16.0300</AppVersion></Properties>`;

    constructor() {}

    public create(worksheetData: string, tableData: string, sharedStringsData: string, workbookData: string, appData: string): IFileContent[] {
        this._fileContentCollection = [
            {  fileName: JSZipFiles.dataFiles[1].name, fileContent : worksheetData },
            {  fileName: JSZipFiles.dataFiles[2].name, fileContent : tableData },
            {  fileName: JSZipFiles.dataFiles[3].name, fileContent : sharedStringsData },
            {  fileName: JSZipFiles.templateFiles[6].name, fileContent : workbookData },
            {  fileName: JSZipFiles.templateFiles[1].name, fileContent : appData },
        ];

        return this._fileContentCollection;
    }

    public simpleGridSortByNameDesc() {
        this._sharedStringsData = `count="23" uniqueCount="21"><si><t>ID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si>` +
            `<si><t>Tanya Bennett</t></si><si><t>Director</t></si><si><t>Leslie Hansen</t></si><si><t>Associate Software Developer</t></si>` +
            `<si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>Gilberto Todd</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si>` +
            `<si><t>Erika Wells</t></si><si><t>Software Development Team Lead</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si>` +
            `<si><t>Debra Morton</t></si><si><t>Celia Martinez</t></si><si><t>Senior Software Developer</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si>`;

        this._tableData = `ref="A1:C11" totalsRowShown="0">
        <autoFilter ref="A1:C11"/><tableColumns count="3"><tableColumn id="1" name="ID"/><tableColumn id="2" name="Name"/><tableColumn id="3" name="JobTitle"/></tableColumns>`;

        this._worksheetData = `<dimension ref="A1:C11"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2" s="1"><v>3</v></c><c r="B2" t="s"><v>3</v></c><c r="C2" t="s"><v>4</v></c></row><row r="3"><c r="A3" s="1"><v>9</v></c><c r="B3" t="s"><v>5</v></c><c r="C3" t="s"><v>6</v></c></row><row r="4"><c r="A4" s="1"><v>4</v></c><c r="B4" t="s"><v>7</v></c><c r="C4" t="s"><v>8</v></c></row><row r="5"><c r="A5" s="1"><v>2</v></c><c r="B5" t="s"><v>9</v></c><c r="C5" t="s"><v>4</v></c></row><row r="6"><c r="A6" s="1"><v>6</v></c><c r="B6" t="s"><v>10</v></c><c r="C6" t="s"><v>11</v></c></row><row r="7"><c r="A7" s="1"><v>8</v></c><c r="B7" t="s"><v>12</v></c><c r="C7" t="s"><v>13</v></c></row><row r="8"><c r="A8" s="1"><v>10</v></c><c r="B8" t="s"><v>14</v></c><c r="C8" t="s"><v>15</v></c></row><row r="9"><c r="A9" s="1"><v>7</v></c><c r="B9" t="s"><v>16</v></c><c r="C9" t="s"><v>6</v></c></row><row r="10"><c r="A10" s="1"><v>5</v></c><c r="B10" t="s"><v>17</v></c><c r="C10" t="s"><v>18</v></c></row><row r="11"><c r="A11" s="1"><v>1</v></c><c r="B11" t="s"><v>19</v></c><c r="C11" t="s"><v>20</v></c></row></sheetData>`;

        return this.createData();
    }

    public simpleGridColumnWidth(width = 0) {
        const wsDataColSettings = this.updateColumnWidth(width);
        this._sharedStringsData =
            `count="1" uniqueCount="1"><si><t>ID</t></si>`;

        this._tableData = `ref="A1:A11" totalsRowShown="0">
    <autoFilter ref="A1:A11"/><tableColumns count="1"><tableColumn id="1" name="ID"/></tableColumns>`;

        this._worksheetData =
            `<dimension ref="A1:A11"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/>` +
            `${ wsDataColSettings }<sheetData><row r="1"><c r="A1" t="s"><v>0</v></c></row><row r="2"><c r="A2" s="1"><v>1</v></c></row><row r="3"><c r="A3" s="1"><v>2</v></c></row><row r="4"><c r="A4" s="1"><v>3</v></c></row><row r="5"><c r="A5" s="1"><v>4</v></c></row><row r="6"><c r="A6" s="1"><v>5</v></c></row><row r="7"><c r="A7" s="1"><v>6</v></c></row><row r="8"><c r="A8" s="1"><v>7</v></c></row><row r="9"><c r="A9" s="1"><v>8</v></c></row><row r="10"><c r="A10" s="1"><v>9</v></c></row><row r="11"><c r="A11" s="1"><v>10</v></c></row></sheetData>`;

        return this.createData();
    }

    public simpleGridRowHeight(height = 0) {
        this._sharedStringsData =
            `count="23" uniqueCount="21"><si><t>ID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Tanya Bennett</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>Celia Martinez</t></si><si><t>Senior Software Developer</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si><si><t>Erika Wells</t></si><si><t>Software Development Team Lead</t></si><si><t>Leslie Hansen</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si>`;

        this._tableData = `ref="A1:C11" totalsRowShown="0">
    <autoFilter ref="A1:C11"/><tableColumns count="3"><tableColumn id="1" name="ID"/><tableColumn id="2" name="Name"/><tableColumn id="3" name="JobTitle"/></tableColumns>`;

        this._worksheetData = this.updateRowHeight(height);

        return this.createData();
    }

    public simpleGridWorksheetName(name) {
        this._sharedStringsData =
        `count="23" uniqueCount="21"><si><t>ID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Tanya Bennett</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>Celia Martinez</t></si><si><t>Senior Software Developer</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si><si><t>Erika Wells</t></si><si><t>Software Development Team Lead</t></si><si><t>Leslie Hansen</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si>`;

        this._tableData = `ref="A1:C11" totalsRowShown="0">
        <autoFilter ref="A1:C11"/><tableColumns count="3"><tableColumn id="1" name="ID"/><tableColumn id="2" name="Name"/>` +
            `<tableColumn id="3" name="JobTitle"/></tableColumns>`;

        this._worksheetData =
        `<dimension ref="A1:C11"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2" s="1"><v>1</v></c><c r="B2" t="s"><v>3</v></c><c r="C2" t="s"><v>4</v></c></row><row r="3"><c r="A3" s="1"><v>2</v></c><c r="B3" t="s"><v>5</v></c><c r="C3" t="s"><v>6</v></c></row><row r="4"><c r="A4" s="1"><v>3</v></c><c r="B4" t="s"><v>7</v></c><c r="C4" t="s"><v>6</v></c></row><row r="5"><c r="A5" s="1"><v>4</v></c><c r="B5" t="s"><v>8</v></c><c r="C5" t="s"><v>9</v></c></row><row r="6"><c r="A6" s="1"><v>5</v></c><c r="B6" t="s"><v>10</v></c><c r="C6" t="s"><v>11</v></c></row><row r="7"><c r="A7" s="1"><v>6</v></c><c r="B7" t="s"><v>12</v></c><c r="C7" t="s"><v>13</v></c></row><row r="8"><c r="A8" s="1"><v>7</v></c><c r="B8" t="s"><v>14</v></c><c r="C8" t="s"><v>15</v></c></row><row r="9"><c r="A9" s="1"><v>8</v></c><c r="B9" t="s"><v>16</v></c><c r="C9" t="s"><v>17</v></c></row><row r="10"><c r="A10" s="1"><v>9</v></c><c r="B10" t="s"><v>18</v></c><c r="C10" t="s"><v>15</v></c></row><row r="11"><c r="A11" s="1"><v>10</v></c><c r="B11" t="s"><v>19</v></c><c r="C11" t="s"><v>20</v></c></row></sheetData>`;

        this._workbookData =  `<?xml version="1.0" encoding="UTF-8"?>
        <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/` +
        `officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x15" ` +
        `xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml/2010/11/main"><fileVersion appName="xl" lastEdited="6" lowestEdited="6" ` +
        `rupBuild="14420"/><workbookPr filterPrivacy="1" defaultThemeVersion="164011"/><bookViews><workbookView xWindow="0" yWindow="0" ` +
        `windowWidth="22260" windowHeight="12645"/></bookViews><sheets><sheet name="${name}" sheetId="1" r:id="rId1"/></sheets><calcPr ` +
        `calcId="162913"/><extLst><ext uri="{140A7094-0E35-4892-8432-C4D2E57EDEB5}" xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml` +
        `/2010/11/main"><x15:workbookPr chartTrackingRefBase="1"/></ext></extLst></workbook>`;

        this._appData = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft Excel</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop><HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>1</vt:i4></vt:variant></vt:vector></HeadingPairs><TitlesOfParts><vt:vector size="1" baseType="lpstr"><vt:lpstr>${name}</vt:lpstr></vt:vector></TitlesOfParts><Company></Company><LinksUpToDate>false</LinksUpToDate><SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged><AppVersion>16.0300</AppVersion></Properties>`;

        return this.createData();
    }

    public treeGridDataExpDepth(depth: number) {
        this._sharedStringsData =
            `count="21" uniqueCount="19"><si><t>ID</t></si><si><t>ParentID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>Age</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Tanya Bennett</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si><si><t>Leslie Hansen</t></si>`;

        this._tableData = `ref="A1:E9" totalsRowShown="0">
    <autoFilter ref="A1:E9"/><tableColumns count="5"><tableColumn id="1" name="ID"/><tableColumn id="2" name="ParentID"/><tableColumn id="3" name="Name"/><tableColumn id="4" name="JobTitle"/><tableColumn id="5" name="Age"/></tableColumns>`;

        switch (depth) {
            case 0:
                this._worksheetData = `
<sheetPr><outlinePr summaryBelow="0" /></sheetPr>
<dimension ref="A1:E9"/>
<sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15" outlineLevelRow="2" x14ac:dyDescent="0.25"/>
<cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/><col min="4" max="4" width="50" customWidth="1"/><col min="5" max="5" width="50" customWidth="1"/></cols>
<sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c></row><row r="2"><c r="A2" s="1"><v>1</v></c><c r="B2" s="1"><v>-1</v></c><c r="C2" t="s"><v>5</v></c><c r="D2" t="s"><v>6</v></c><c r="E2" s="1"><v>32</v></c></row><row r="3" outlineLevel="1" hidden="1"><c r="A3" s="1"><v>2</v></c><c r="B3" s="1"><v>1</v></c><c r="C3" t="s"><v>7</v></c><c r="D3" t="s"><v>8</v></c><c r="E3" s="1"><v>41</v></c></row><row r="4" outlineLevel="2" hidden="1"><c r="A4" s="1"><v>3</v></c><c r="B4" s="1"><v>2</v></c><c r="C4" t="s"><v>9</v></c><c r="D4" t="s"><v>8</v></c><c r="E4" s="1"><v>29</v></c></row><row r="5" outlineLevel="2" hidden="1"><c r="A5" s="1"><v>7</v></c><c r="B5" s="1"><v>2</v></c><c r="C5" t="s"><v>10</v></c><c r="D5" t="s"><v>11</v></c><c r="E5" s="1"><v>35</v></c></row><row r="6" outlineLevel="1" hidden="1"><c r="A6" s="1"><v>4</v></c><c r="B6" s="1"><v>1</v></c><c r="C6" t="s"><v>12</v></c><c r="D6" t="s"><v>13</v></c><c r="E6" s="1"><v>33</v></c></row><row r="7"><c r="A7" s="1"><v>6</v></c><c r="B7" s="1"><v>-1</v></c><c r="C7" t="s"><v>14</v></c><c r="D7" t="s"><v>15</v></c><c r="E7" s="1"><v>52</v></c></row><row r="8"><c r="A8" s="1"><v>10</v></c><c r="B8" s="1"><v>-1</v></c><c r="C8" t="s"><v>16</v></c><c r="D8" t="s"><v>17</v></c><c r="E8" s="1"><v>53</v></c></row><row r="9" outlineLevel="1" hidden="1"><c r="A9" s="1"><v>9</v></c><c r="B9" s="1"><v>10</v></c><c r="C9" t="s"><v>18</v></c><c r="D9" t="s"><v>11</v></c><c r="E9" s="1"><v>44</v></c></row></sheetData>`;
                break;
            case 1:
                this._worksheetData = `
<sheetPr><outlinePr summaryBelow="0" /></sheetPr>
<dimension ref="A1:E9"/>
<sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15" outlineLevelRow="2" x14ac:dyDescent="0.25"/>
<cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/><col min="4" max="4" width="50" customWidth="1"/><col min="5" max="5" width="50" customWidth="1"/></cols>
<sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c></row><row r="2"><c r="A2" s="1"><v>1</v></c><c r="B2" s="1"><v>-1</v></c><c r="C2" t="s"><v>5</v></c><c r="D2" t="s"><v>6</v></c><c r="E2" s="1"><v>32</v></c></row><row r="3" outlineLevel="1"><c r="A3" s="1"><v>2</v></c><c r="B3" s="1"><v>1</v></c><c r="C3" t="s"><v>7</v></c><c r="D3" t="s"><v>8</v></c><c r="E3" s="1"><v>41</v></c></row><row r="4" outlineLevel="2" hidden="1"><c r="A4" s="1"><v>3</v></c><c r="B4" s="1"><v>2</v></c><c r="C4" t="s"><v>9</v></c><c r="D4" t="s"><v>8</v></c><c r="E4" s="1"><v>29</v></c></row><row r="5" outlineLevel="2" hidden="1"><c r="A5" s="1"><v>7</v></c><c r="B5" s="1"><v>2</v></c><c r="C5" t="s"><v>10</v></c><c r="D5" t="s"><v>11</v></c><c r="E5" s="1"><v>35</v></c></row><row r="6" outlineLevel="1"><c r="A6" s="1"><v>4</v></c><c r="B6" s="1"><v>1</v></c><c r="C6" t="s"><v>12</v></c><c r="D6" t="s"><v>13</v></c><c r="E6" s="1"><v>33</v></c></row><row r="7"><c r="A7" s="1"><v>6</v></c><c r="B7" s="1"><v>-1</v></c><c r="C7" t="s"><v>14</v></c><c r="D7" t="s"><v>15</v></c><c r="E7" s="1"><v>52</v></c></row><row r="8"><c r="A8" s="1"><v>10</v></c><c r="B8" s="1"><v>-1</v></c><c r="C8" t="s"><v>16</v></c><c r="D8" t="s"><v>17</v></c><c r="E8" s="1"><v>53</v></c></row><row r="9" outlineLevel="1"><c r="A9" s="1"><v>9</v></c><c r="B9" s="1"><v>10</v></c><c r="C9" t="s"><v>18</v></c><c r="D9" t="s"><v>11</v></c><c r="E9" s="1"><v>44</v></c></row></sheetData>`;
                break;
        }

        return this.createData();
    }

    private createData() {
        return this.create(this._worksheetData, this._tableData, this._sharedStringsData, this._workbookData, this._appData);
    }

    public get differentTypesDataContent() {
        this._sharedStringsData = `count="6" uniqueCount="6"><si><t>Column1</t></si><si><t>Terrance Orta</t></si><si><t>Richard Mahoney ` +
            `LongerName</t></si><si><t>Donna Price</t></si><si><t>Lisa Landers</t></si><si><t>Dorothy H. Spencer</t></si>`;

        this._tableData = `ref="A1:A6" totalsRowShown="0"><autoFilter ref="A1:A6"/><tableColumns count="1">` +
            `<tableColumn id="1" name="Column1"/></tableColumns>`;

        this._worksheetData =
            `<dimension ref="A1:A6"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>` +
            `<sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="30.169921875" customWidth="1"/>` +
            `</cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c></row><row r="2"><c r="A2" t="s"><v>1</v></c></row><row r="3"><c ` +
            `r="A3" t="s"><v>2</v></c></row><row r="4"><c r="A4" t="s"><v>3</v></c></row><row r="5"><c r="A5" t="s"><v>4</v></c></row>` +
            `<row r="6"><c r="A6" t="s"><v>5</v></c></row></sheetData>`;

        return this.createData();
    }

    public get contactsDataContent() {
        this._sharedStringsData = `count="12" uniqueCount="11"><si><t>name</t></si><si><t>phone</t></si><si><t>Terrance Orta</t></si><si>` +
            `<t>770-504-2217</t></si><si><t>Richard Mahoney LongerName</t></si><si><t></t></si><si><t>Donna Price</t></si>` +
            `<si><t>859-496-2817</t></si><si><t>901-747-3428</t></si><si><t>Dorothy H. Spencer</t></si><si><t>573-394-9254</t></si>`;

        this._tableData = `ref="A1:B6" totalsRowShown="0">
        <autoFilter ref="A1:B6"/><tableColumns count="2"><tableColumn id="1" name="name"/><tableColumn id="2" name="phone"/>` +
            `</tableColumns>`;

        this._worksheetData =
            `<dimension ref="A1:B6"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>` +
            `<sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" ` +
            `customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/></cols><sheetData><row r="1">` +
            `<c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row><row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2" t="s">` +
            `<v>3</v></c></row><row r="3"><c r="A3" t="s"><v>4</v></c><c r="B3" t="s"><v>5</v></c></row><row r="4"><c r="A4" t="s">` +
            `<v>6</v></c><c r="B4" t="s"><v>7</v></c></row><row r="5"><c r="A5" t="s"><v>5</v></c><c r="B5" t="s"><v>8</v></c></row>` +
            `<row r="6"><c r="A6" t="s"><v>9</v></c><c r="B6" t="s"><v>10</v></c></row></sheetData>`;

        return this.createData();
    }

    public get contactsPartialDataContent() {
        this._sharedStringsData =
            `count="6" uniqueCount="6"><si><t>name</t></si><si><t>phone</t></si><si><t>Terrance Orta</t></si><si><t>770-504-2217</t></si><si><t>Richard Mahoney LongerName</t></si><si><t>780-555-1331</t></si>`;

        this._tableData = `ref="A1:B4" totalsRowShown="0">
        <autoFilter ref="A1:B4"/><tableColumns count="2"><tableColumn id="1" name="name"/><tableColumn id="2" name="phone"/>` +
            `</tableColumns>`;

        this._worksheetData =
            `<dimension ref="A1:B4"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row><row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2" t="s"><v>3</v></c></row><row r="3"><c r="A3" t="s"><v>4</v></c><c r="B3" s="1"/></row><row r="4"><c r="A4" s="1"/><c r="B4" t="s"><v>5</v></c></row></sheetData>`;

        return this.createData();
    }

    public get contactsFunkyDataContent() {
        this._sharedStringsData = `count="14" uniqueCount="14"><si><t>name</t></si><si><t>phone</t></si><si><t>Terrance ` +
            `Mc&apos;Orta</t></si><si><t>(+359)770-504-2217 | 2218</t></si><si><t>Richard Mahoney /LongerName/</t></si><si><t></t>` +
            `</si><si><t>Donna, /; Price</t></si><si><t>859 496 28**</t></si><si><t>
        </t></si><si><t>901-747-3428</t></si><si><t>Dorothy &quot;H.&quot; Spencer</t></si><si><t>573-394-9254[fax]</t></si>` +
            `<si><t>Иван Иванов (1,2)</t></si><si><t>№ 573-394-9254</t></si>`;

        this._tableData = `ref="A1:B7" totalsRowShown="0">
        <autoFilter ref="A1:B7"/><tableColumns count="2"><tableColumn id="1" name="name"/><tableColumn id="2" name="phone"/>` +
            `</tableColumns>`;

        this._worksheetData =
            `<dimension ref="A1:B7"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>` +
            `<sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth` +
            `="1"/><col min="2" max="2" width="50" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v>` +
            `</c><c r="B1" t="s"><v>1</v></c></row><row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2" t="s"><v>3</v></c></row><row r="3">` +
            `<c r="A3" t="s"><v>4</v></c><c r="B3" t="s"><v>5</v></c></row><row r="4"><c r="A4" t="s"><v>6</v></c><c r="B4" t="s"><v>7</v>` +
            `</c></row><row r="5"><c r="A5" t="s"><v>8</v></c><c r="B5" t="s"><v>9</v></c></row><row r="6"><c r="A6" t="s"><v>10</v></c>` +
            `<c r="B6" t="s"><v>11</v></c></row><row r="7"><c r="A7" t="s"><v>12</v></c><c r="B7" t="s"><v>13</v></c></row></sheetData>`;

        return this.createData();
    }

    public get noHeadersStringDataContent() {
        this._sharedStringsData = `count="6" uniqueCount="6"><si><t>Column1</t></si><si><t>Terrance Orta</t></si>` +
            `<si><t>Richard Mahoney LongerName</t></si><si><t>Donna Price</t></si><si><t>Lisa Landers</t></si><si><t>` +
            `Dorothy H. Spencer</t></si>`;

        this._tableData = `ref="A1:A6" totalsRowShown="0"><autoFilter ref="A1:A6"/><tableColumns count="1">` +
            `<tableColumn id="1" name="Column1"/></tableColumns>`;

        this._worksheetData = `<dimension ref="A1:A6"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView>` +
            `</sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" ` +
            `width="50" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c></row><row r="2">` +
            `<c r="A2" t="s"><v>1</v></c></row><row r="3"><c r="A3" t="s"><v>2</v></c></row><row r="4"><c r="A4" t="s"><v>3</v>` +
            `</c></row><row r="5"><c r="A5" t="s"><v>4</v></c></row><row r="6"><c r="A6" t="s"><v>5</v></c></row></sheetData>`;

        return this.createData();
    }

    public get noHeadersNumberDataContent() {
        this._sharedStringsData = `count="1" uniqueCount="1"><si><t>Column 1</t></si>`;

        this._tableData = `ref="A1:A4" totalsRowShown="0"><autoFilter ref="A1:A4"/><tableColumns count="1">` +
            `<tableColumn id="1" name="Column1"/></tableColumns>`;

        this._worksheetData = `<dimension ref="A1:A4"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c></row><row r="2"><c r="A2" s="1"><v>10</v></c></row><row r="3"><c r="A3" s="1"><v>20</v></c></row><row r="4"><c r="A4" s="1"><v>30</v></c></row></sheetData>`;

        return this.createData();
    }

    public get noHeadersDateTimeContent() {
        this._sharedStringsData = `count="1" uniqueCount="1"><si><t>Column 1</t></si>`;

        this._tableData = `ref="A1:A3" totalsRowShown="0"><autoFilter ref="A1:A3"/><tableColumns count="1">` +
            `<tableColumn id="1" name="Column1"/></tableColumns>`;

        this._worksheetData = `<dimension ref="A1:A3"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView>` +
            `</sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width=` +
            `"50" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c></row><row r="2">` +
            `<c r="A2" t="d" s="2"><v>2018-04-23T00:00:00</v></c></row><row r="3"><c r="A3" t="d" s="2"><v>2018-03-23T00:00:00</v>` +
            `</c></row></sheetData>`;

        return this.createData();
    }

    public get noHeadersObjectDataContent() {
        this._sharedStringsData = `count="4" uniqueCount="4"><si><t>value</t></si><si><t>1</t></si><si><t>2</t></si>` +
            `<si><t>3</t></si>`;

        this._tableData = `ref="A1:A4" totalsRowShown="0"><autoFilter ref="A1:A4"/><tableColumns count="1">` +
            `<tableColumn id="1" name="value"/></tableColumns>`;

        this._worksheetData = `<dimension ref="A1:A4"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView>` +
            `</sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="8.43" ` +
            `customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c></row><row r="2"><c r="A2" t="s"><v>1</v>` +
            `</c></row><row r="3"><c r="A3" t="s"><v>2</v></c></row><row r="4"><c r="A4" t="s"><v>3</v></c></row></sheetData>`;

        return this.createData();
    }

    public get simpleGridData() {
        this._sharedStringsData =
            `count="23" uniqueCount="21"><si><t>ID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Tanya Bennett</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>Celia Martinez</t></si><si><t>Senior Software Developer</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si><si><t>Erika Wells</t></si><si><t>Software Development Team Lead</t></si><si><t>Leslie Hansen</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si>`;

        this._tableData = `ref="A1:C11" totalsRowShown="0">
        <autoFilter ref="A1:C11"/><tableColumns count="3"><tableColumn id="1" name="ID"/><tableColumn id="2" name="Name"/>` +
            `<tableColumn id="3" name="JobTitle"/></tableColumns>`;

        this._worksheetData =
            `<dimension ref="A1:C11"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2" s="1"><v>1</v></c><c r="B2" t="s"><v>3</v></c><c r="C2" t="s"><v>4</v></c></row><row r="3"><c r="A3" s="1"><v>2</v></c><c r="B3" t="s"><v>5</v></c><c r="C3" t="s"><v>6</v></c></row><row r="4"><c r="A4" s="1"><v>3</v></c><c r="B4" t="s"><v>7</v></c><c r="C4" t="s"><v>6</v></c></row><row r="5"><c r="A5" s="1"><v>4</v></c><c r="B5" t="s"><v>8</v></c><c r="C5" t="s"><v>9</v></c></row><row r="6"><c r="A6" s="1"><v>5</v></c><c r="B6" t="s"><v>10</v></c><c r="C6" t="s"><v>11</v></c></row><row r="7"><c r="A7" s="1"><v>6</v></c><c r="B7" t="s"><v>12</v></c><c r="C7" t="s"><v>13</v></c></row><row r="8"><c r="A8" s="1"><v>7</v></c><c r="B8" t="s"><v>14</v></c><c r="C8" t="s"><v>15</v></c></row><row r="9"><c r="A9" s="1"><v>8</v></c><c r="B9" t="s"><v>16</v></c><c r="C9" t="s"><v>17</v></c></row><row r="10"><c r="A10" s="1"><v>9</v></c><c r="B10" t="s"><v>18</v></c><c r="C10" t="s"><v>15</v></c></row><row r="11"><c r="A11" s="1"><v>10</v></c><c r="B11" t="s"><v>19</v></c><c r="C11" t="s"><v>20</v></c></row></sheetData>`;

        return this.createData();
    }

    public get simpleGridDataFull() {
        this._sharedStringsData = `count="44" uniqueCount="42"><si><t>ID</t></si><si><t>Name</t></si><si><t>JobTitle</t>` +
            `</si><si><t>HireDate</t></si><si><t>1</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si>` +
            `<t>2017-06-19T11:43:07.714Z</t></si><si><t>2</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si>` +
            `<t>2015-12-18T11:23:17.714Z</t></si><si><t>3</t></si><si><t>Tanya Bennett</t></si><si><t>2005-11-18T11:23:17.714Z` +
            `</t></si><si><t>4</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>2008-12-18T11:23:17.714Z` +
            `</t></si><si><t>5</t></si><si><t>Celia Martinez</t></si><si><t>Senior Software Developer</t></si><si>` +
            `<t>2007-12-19T11:23:17.714Z</t></si><si><t>6</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>` +
            `2016-12-18T11:23:17.714Z</t></si><si><t>7</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t>` +
            `</si><si><t>2005-11-19T11:23:17.714Z</t></si><si><t>8</t></si><si><t>Erika Wells</t></si><si><t>Software Development ` +
            `Team Lead</t></si><si><t>2005-10-14T11:23:17.714Z</t></si><si><t>9</t></si><si><t>Leslie Hansen</t></si><si><t>` +
            `2013-10-10T11:23:17.714Z</t></si><si><t>10</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si><si><t>` +
            `2011-11-28T11:23:17.714Z</t></si>`;

        this._tableData = `ref="A1:D11" totalsRowShown="0">
        <autoFilter ref="A1:D11"/><tableColumns count="4"><tableColumn id="1" name="ID"/><tableColumn id="2" name="Name"/>` +
            `<tableColumn id="3" name="JobTitle"/><tableColumn id="4" name="HireDate"/></tableColumns>`;

        this._worksheetData =
            `<dimension ref="A1:D11"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>` +
            `<sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/>` +
            `<col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" ` +
            `customWidth="1"/><col min="4" max="4"  width="50" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" ` +
            `t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c></row><row r="2">` +
            `<c r="A2" t="s"><v>4</v></c><c r="B2" t="s"><v>5</v></c><c r="C2" t="s"><v>6</v></c><c r="D2" t="s"><v>7</v></c></row>` +
            `<row r="3"><c r="A3" t="s"><v>8</v></c><c r="B3" t="s"><v>9</v></c><c r="C3" t="s"><v>10</v></c><c r="D3" t="s"><v>11</v>` +
            `</c></row><row r="4"><c r="A4" t="s"><v>12</v></c><c r="B4" t="s"><v>13</v></c><c r="C4" t="s"><v>10</v></c><c r="D4" t="s"><v>` +
            `14</v></c></row><row r="5"><c r="A5" t="s"><v>15</v></c><c r="B5" t="s"><v>16</v></c><c r="C5" t="s"><v>17</v></c><c ` +
            `r="D5" t="s"><v>18</v></c></row><row r="6"><c r="A6" t="s"><v>19</v></c><c r="B6" t="s"><v>20</v></c><c r="C6" t="s">` +
            `<v>21</v></c><c r="D6" t="s"><v>22</v></c></row><row r="7"><c r="A7" t="s"><v>23</v></c><c r="B7" t="s"><v>24</v></c>` +
            `<c r="C7" t="s"><v>25</v></c><c r="D7" t="s"><v>26</v></c></row><row r="8"><c r="A8" t="s"><v>27</v></c><c r="B8" t="s">` +
            `<v>28</v></c><c r="C8" t="s"><v>29</v></c><c r="D8" t="s"><v>30</v></c></row><row r="9"><c r="A9" t="s"><v>31</v></c>` +
            `<c r="B9" t="s"><v>32</v></c><c r="C9" t="s"><v>33</v></c><c r="D9" t="s"><v>34</v></c></row><row r="10"><c r="A10" t="s">` +
            `<v>35</v></c><c r="B10" t="s"><v>36</v></c><c r="C10" t="s"><v>29</v></c><c r="D10" t="s"><v>37</v></c></row><row r="11">` +
            `<c r="A11" t="s"><v>38</v></c><c r="B11" t="s"><v>39</v></c><c r="C11" t="s"><v>40</v></c><c r="D11" t="s"><v>41</v></c>` +
            `</row></sheetData>`;

        return this.createData();
    }

    public get simpleGridDataPage1() {
        this._sharedStringsData = `count="16" uniqueCount="15"><si><t>ID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si>` +
            `<si><t>HireDate</t></si><si><t>1</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>` +
            `2017-06-19T11:43:07.714Z</t></si><si><t>2</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>` +
            `2015-12-18T11:23:17.714Z</t></si><si><t>3</t></si><si><t>Tanya Bennett</t></si><si><t>2005-11-18T11:23:17.714Z</t></si>`;

        this._tableData = `ref="A1:D4" totalsRowShown="0">
            <autoFilter ref="A1:D4"/><tableColumns count="4"><tableColumn id="1" name="ID"/><tableColumn id="2" name="Name"/>` +
            `<tableColumn id="3" name="JobTitle"/><tableColumn id="4" name="HireDate"/></tableColumns>`;

        this._worksheetData =
            `<dimension ref="A1:D4"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>` +
            `<sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/>` +
            `<col min="2" max="2" width="14.416406250000001" customWidth="1"/><col min="3" max="3" width="13.890234375" customWidth="1"/>` +
            `<col min="4" max="4" width="26.33203125" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c>` +
            `<c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c></row><row r="2"><c r="A2" t="s"><v>4</v>` +
            `</c><c r="B2" t="s"><v>5</v></c><c r="C2" t="s"><v>6</v></c><c r="D2" t="s"><v>7</v></c></row><row r="3"><c r="A3" t="s"><v>8` +
            `</v></c><c r="B3" t="s"><v>9</v></c><c r="C3" t="s"><v>10</v></c><c r="D3" t="s"><v>11</v></c></row><row r="4"><c r="A4" t="s">` +
            `<v>12</v></c><c r="B4" t="s"><v>13</v></c><c r="C4" t="s"><v>10</v></c><c r="D4" t="s"><v>14</v></c></row></sheetData>`;

        return this.createData();
    }

    public get simpleGridDataPage2() {
        this._sharedStringsData = `count="16" uniqueCount="16"><si><t>ID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si>` +
            `<t>HireDate</t></si><si><t>4</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>2008-12-18T11:23:17.714Z` +
            `</t></si><si><t>5</t></si><si><t>Celia Martinez</t></si><si><t>Senior Software Developer</t></si><si><t>2007-12-19T11:23:17.714Z` +
            `</t></si><si><t>6</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>2016-12-18T11:23:17.714Z</t></si>`;

        this._tableData = `ref="A1:D4" totalsRowShown="0">
            <autoFilter ref="A1:D4"/><tableColumns count="4"><tableColumn id="1" name="ID"/><tableColumn id="2" name="Name"/>` +
            `<tableColumn id="3" name="JobTitle"/><tableColumn id="4" name="HireDate"/></tableColumns>`;

        this._worksheetData =
            `<dimension ref="A1:D4"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>` +
            `<sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/>` +
            `<col min="2" max="2" width="14.022656249999999" customWidth="1"/><col min="3" max="3" width="26.001562500000002" customWidth=` +
            `"1"/><col min="4" max="4" width="26.33203125" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c ` +
            `r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c></row><row r="2"><c r="A2" t="s"><v>4</v>` +
            `</c><c r="B2" t="s"><v>5</v></c><c r="C2" t="s"><v>6</v></c><c r="D2" t="s"><v>7</v></c></row><row r="3"><c r="A3" t="s">` +
            `<v>8</v></c><c r="B3" t="s"><v>9</v></c><c r="C3" t="s"><v>10</v></c><c r="D3" t="s"><v>11</v></c></row><row r="4"><c r="A4" ` +
            `t="s"><v>12</v></c><c r="B4" t="s"><v>13</v></c><c r="C4" t="s"><v>14</v></c><c r="D4" t="s"><v>15</v></c></row></sheetData>`;

        return this.createData();
    }

    public get simpleGridDataPage1FiveRows() {
        this._sharedStringsData = `count="24" uniqueCount="23"><si><t>ID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si>` +
            `<t>HireDate</t></si><si><t>1</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>2017-06-19T11:43:07.714Z` +
            `</t></si><si><t>2</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>2015-12-18T11:23:17.714Z</t></si><si><t>3` +
            `</t></si><si><t>Tanya Bennett</t></si><si><t>2005-11-18T11:23:17.714Z</t></si><si><t>4</t></si><si><t>Jack Simon</t></si><si>` +
            `<t>Software Developer</t></si><si><t>2008-12-18T11:23:17.714Z</t></si><si><t>5</t></si><si><t>Celia Martinez</t></si>` +
            `<si><t>Senior Software Developer</t></si><si><t>2007-12-19T11:23:17.714Z</t></si>`;

        this._tableData = `ref="A1:D6" totalsRowShown="0">
        <autoFilter ref="A1:D6"/><tableColumns count="4"><tableColumn id="1" name="ID"/><tableColumn id="2" name="Name"/>` +
            `<tableColumn id="3" name="JobTitle"/><tableColumn id="4" name="HireDate"/></tableColumns>`;

        this._worksheetData =
            `<dimension ref="A1:D6"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>` +
            `<sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/>` +
            `<col min="2" max="2" width="14.416406250000001" customWidth="1"/><col min="3" max="3" width="26.001562500000002" ` +
            `customWidth="1"/><col min="4" max="4" width="26.33203125" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" ` +
            `t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c></row><row r="2">` +
            `<c r="A2" t="s"><v>4</v></c><c r="B2" t="s"><v>5</v></c><c r="C2" t="s"><v>6</v></c><c r="D2" t="s"><v>7</v></c></row>` +
            `<row r="3"><c r="A3" t="s"><v>8</v></c><c r="B3" t="s"><v>9</v></c><c r="C3" t="s"><v>10</v></c><c r="D3" t="s"><v>11</v>` +
            `</c></row><row r="4"><c r="A4" t="s"><v>12</v></c><c r="B4" t="s"><v>13</v></c><c r="C4" t="s"><v>10</v></c><c r="D4" t="s">` +
            `<v>14</v></c></row><row r="5"><c r="A5" t="s"><v>15</v></c><c r="B5" t="s"><v>16</v></c><c r="C5" t="s"><v>17</v></c><c r="D5"` +
            ` t="s"><v>18</v></c></row><row r="6"><c r="A6" t="s"><v>19</v></c><c r="B6" t="s"><v>20</v></c><c r="C6" t="s"><v>21</v></c><c ` +
            `r="D6" t="s"><v>22</v></c></row></sheetData>`;

        return this.createData();
    }

    public get simpleGridDataRecord5() {
        this._sharedStringsData = `count="5" uniqueCount="5"><si><t>ID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>Celia Martinez</t></si><si><t>Senior Software Developer</t></si>`;

        this._tableData = `ref="A1:C2" totalsRowShown="0">
    <autoFilter ref="A1:C2"/><tableColumns count="3"><tableColumn id="1" name="ID"/><tableColumn id="2" name="Name"/>` +
            `<tableColumn id="3" name="JobTitle"/></tableColumns>`;

        this._worksheetData =
            `<dimension ref="A1:C2"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2" s="1"><v>5</v></c><c r="B2" t="s"><v>3</v></c><c r="C2" t="s"><v>4</v></c></row></sheetData>`;

        return this.createData();
    }

    public get simpleGridDataDirectors() {

        this._sharedStringsData = `count="7" uniqueCount="6"><si><t>ID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Tanya Bennett</t></si>`;

        this._tableData = `ref="A1:C3" totalsRowShown="0">
    <autoFilter ref="A1:C3"/><tableColumns count="3"><tableColumn id="1" name="ID"/><tableColumn id="2" name="Name"/><tableColumn id="3" name="JobTitle"/></tableColumns>`;

        this._worksheetData =
            `<dimension ref="A1:C3"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2" s="1"><v>2</v></c><c r="B2" t="s"><v>3</v></c><c r="C2" t="s"><v>4</v></c></row><row r="3"><c r="A3" s="1"><v>3</v></c><c r="B3" t="s"><v>5</v></c><c r="C3" t="s"><v>4</v></c></row></sheetData>`;

        return this.createData();
    }

    public get simpleGridNameJobTitle() {
        this._sharedStringsData = `count="22" uniqueCount="20"><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>Casey Houston</t></si>` +
            `<si><t>Vice President</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Tanya Bennett</t></si><si>` +
            `<t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>Celia Martinez</t></si><si><t>Senior Software Developer</t>` +
            `</si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si>` +
            `<si><t>Erika Wells</t></si><si><t>Software Development Team Lead</t></si><si><t>Leslie Hansen</t></si><si><t>Eduardo Ramirez</t>` +
            `</si><si><t>Manager</t></si>`;

        this._tableData = `ref="A1:B11" totalsRowShown="0">
        <autoFilter ref="A1:B11"/><tableColumns count="2"><tableColumn id="1" name="Name"/><tableColumn id="2" name="JobTitle"/>` +
            `</tableColumns>`;

        this._worksheetData =
            `<dimension ref="A1:B11"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>` +
            `<sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/>` +
            `<col min="2" max="2" width="50" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c>` +
            `<c r="B1" t="s"><v>1</v></c></row><row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2" t="s"><v>3</v></c></row><row r="3">` +
            `<c r="A3" t="s"><v>4</v></c><c r="B3" t="s"><v>5</v></c></row><row r="4"><c r="A4" t="s"><v>6</v></c><c r="B4" t="s"><v>5</v>` +
            `</c></row><row r="5"><c r="A5" t="s"><v>7</v></c><c r="B5" t="s"><v>8</v></c></row><row r="6"><c r="A6" t="s"><v>9</v></c>` +
            `<c r="B6" t="s"><v>10</v></c></row><row r="7"><c r="A7" t="s"><v>11</v></c><c r="B7" t="s"><v>12</v></c></row><row r="8">` +
            `<c r="A8" t="s"><v>13</v></c><c r="B8" t="s"><v>14</v></c></row><row r="9"><c r="A9" t="s"><v>15</v></c><c r="B9" t="s">` +
            `<v>16</v></c></row><row r="10"><c r="A10" t="s"><v>17</v></c><c r="B10" t="s"><v>14</v></c></row><row r="11"><c r="A11" t="s">` +
            `<v>18</v></c><c r="B11" t="s"><v>19</v></c></row></sheetData>`;

        return this.createData();
    }

    public get simpleGridNameJobTitleWithFormatting() {
        this._sharedStringsData = `count="33" uniqueCount="31"><si><t>ID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>one</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>two</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>three</t></si><si><t>Tanya Bennett</t></si><si><t>four</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>five</t></si><si><t>Celia Martinez</t></si><si><t>Senior Software Developer</t></si><si><t>six</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>seven</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si><si><t>eight</t></si><si><t>Erika Wells</t></si><si><t>Software Development Team Lead</t></si><si><t>nine</t></si><si><t>Leslie Hansen</t></si><si><t>ten</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si>`;

        this._tableData = `ref="A1:C11" totalsRowShown="0">
        <autoFilter ref="A1:C11"/><tableColumns count="3"><tableColumn id="1" name="ID"/><tableColumn id="2" name="Name"/><tableColumn id="3" name="JobTitle"/></tableColumns>`;

        this._worksheetData =
            `<dimension ref="A1:C11"/>
            <sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
            <sheetFormatPr defaultRowHeight="15"  x14ac:dyDescent="0.25"/>
            <cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols>
            <sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2" t="s"><v>3</v></c><c r="B2" t="s"><v>4</v></c><c r="C2" t="s"><v>5</v></c></row><row r="3"><c r="A3" t="s"><v>6</v></c><c r="B3" t="s"><v>7</v></c><c r="C3" t="s"><v>8</v></c></row><row r="4"><c r="A4" t="s"><v>9</v></c><c r="B4" t="s"><v>10</v></c><c r="C4" t="s"><v>8</v></c></row><row r="5"><c r="A5" t="s"><v>11</v></c><c r="B5" t="s"><v>12</v></c><c r="C5" t="s"><v>13</v></c></row><row r="6"><c r="A6" t="s"><v>14</v></c><c r="B6" t="s"><v>15</v></c><c r="C6" t="s"><v>16</v></c></row><row r="7"><c r="A7" t="s"><v>17</v></c><c r="B7" t="s"><v>18</v></c><c r="C7" t="s"><v>19</v></c></row><row r="8"><c r="A8" t="s"><v>20</v></c><c r="B8" t="s"><v>21</v></c><c r="C8" t="s"><v>22</v></c></row><row r="9"><c r="A9" t="s"><v>23</v></c><c r="B9" t="s"><v>24</v></c><c r="C9" t="s"><v>25</v></c></row><row r="10"><c r="A10" t="s"><v>26</v></c><c r="B10" t="s"><v>27</v></c><c r="C10" t="s"><v>22</v></c></row><row r="11"><c r="A11" t="s"><v>28</v></c><c r="B11" t="s"><v>29</v></c><c r="C11" t="s"><v>30</v></c></row></sheetData>`;

        return this.createData();
    }

    public get simpleGridNameJobTitleID() {
        this._sharedStringsData =
            `count="23" uniqueCount="21"><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>ID</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Tanya Bennett</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>Celia Martinez</t></si><si><t>Senior Software Developer</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si><si><t>Erika Wells</t></si><si><t>Software Development Team Lead</t></si><si><t>Leslie Hansen</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si>`;

        this._tableData = `ref="A1:C11" totalsRowShown="0">
    <autoFilter ref="A1:C11"/><tableColumns count="3"><tableColumn id="1" name="Name"/><tableColumn id="2" name="JobTitle"/><tableColumn id="3" name="ID"/></tableColumns>`;

        this._worksheetData =
            `<dimension ref="A1:C11"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2" t="s"><v>3</v></c><c r="B2" t="s"><v>4</v></c><c r="C2" s="1"><v>1</v></c></row><row r="3"><c r="A3" t="s"><v>5</v></c><c r="B3" t="s"><v>6</v></c><c r="C3" s="1"><v>2</v></c></row><row r="4"><c r="A4" t="s"><v>7</v></c><c r="B4" t="s"><v>6</v></c><c r="C4" s="1"><v>3</v></c></row><row r="5"><c r="A5" t="s"><v>8</v></c><c r="B5" t="s"><v>9</v></c><c r="C5" s="1"><v>4</v></c></row><row r="6"><c r="A6" t="s"><v>10</v></c><c r="B6" t="s"><v>11</v></c><c r="C6" s="1"><v>5</v></c></row><row r="7"><c r="A7" t="s"><v>12</v></c><c r="B7" t="s"><v>13</v></c><c r="C7" s="1"><v>6</v></c></row><row r="8"><c r="A8" t="s"><v>14</v></c><c r="B8" t="s"><v>15</v></c><c r="C8" s="1"><v>7</v></c></row><row r="9"><c r="A9" t="s"><v>16</v></c><c r="B9" t="s"><v>17</v></c><c r="C9" s="1"><v>8</v></c></row><row r="10"><c r="A10" t="s"><v>18</v></c><c r="B10" t="s"><v>15</v></c><c r="C10" s="1"><v>9</v></c></row><row r="11"><c r="A11" t="s"><v>19</v></c><c r="B11" t="s"><v>20</v></c><c r="C11" s="1"><v>10</v></c></row></sheetData>`;

        return this.createData();
    }

    public get simpleGridSortByName() {
        this._sharedStringsData = `count="23" uniqueCount="21"><si><t>ID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si>` +
            `<si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>Celia Martinez</t></si><si><t>Senior Software Developer</t></si>` +
            `<si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si>` +
            `<si><t>Erika Wells</t></si><si><t>Software Development Team Lead</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si>` +
            `<si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si>` +
            `<si><t>Leslie Hansen</t></si><si><t>Tanya Bennett</t></si>`;

        this._tableData = `ref="A1:C11" totalsRowShown="0">
        <autoFilter ref="A1:C11"/><tableColumns count="3"><tableColumn id="1" name="ID"/><tableColumn id="2" name="Name"/><tableColumn id="3" name="JobTitle"/></tableColumns>`;

        this._worksheetData = `<dimension ref="A1:C11"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2" s="1"><v>1</v></c><c r="B2" t="s"><v>3</v></c><c r="C2" t="s"><v>4</v></c></row><row r="3"><c r="A3" s="1"><v>5</v></c><c r="B3" t="s"><v>5</v></c><c r="C3" t="s"><v>6</v></c></row><row r="4"><c r="A4" s="1"><v>7</v></c><c r="B4" t="s"><v>7</v></c><c r="C4" t="s"><v>8</v></c></row><row r="5"><c r="A5" s="1"><v>10</v></c><c r="B5" t="s"><v>9</v></c><c r="C5" t="s"><v>10</v></c></row><row r="6"><c r="A6" s="1"><v>8</v></c><c r="B6" t="s"><v>11</v></c><c r="C6" t="s"><v>12</v></c></row><row r="7"><c r="A7" s="1"><v>6</v></c><c r="B7" t="s"><v>13</v></c><c r="C7" t="s"><v>14</v></c></row><row r="8"><c r="A8" s="1"><v>2</v></c><c r="B8" t="s"><v>15</v></c><c r="C8" t="s"><v>16</v></c></row><row r="9"><c r="A9" s="1"><v>4</v></c><c r="B9" t="s"><v>17</v></c><c r="C9" t="s"><v>18</v></c></row><row r="10"><c r="A10" s="1"><v>9</v></c><c r="B10" t="s"><v>19</v></c><c r="C10" t="s"><v>8</v></c></row><row r="11"><c r="A11" s="1"><v>3</v></c><c r="B11" t="s"><v>20</v></c><c r="C11" t="s"><v>16</v></c></row></sheetData>`;

        return this.createData();
    }

    private updateColumnWidth(width: number) {
        let wsDataColSettings = '';

        switch (width) {
            case 100:
                wsDataColSettings =
                    `<cols><col min="1" max="1" width="100" customWidth="1"/></cols>`;
                break;
            case 200:
                wsDataColSettings =
                    `<cols><col min="1" max="1" width="200" customWidth="1"/></cols>`;
                break;
            case null:
            case 0:
                wsDataColSettings =
                    `<cols><col min="1" max="1" width="8.43" customWidth="1"/></cols>`;
                break;
        }

        return wsDataColSettings;
    }

    private updateRowHeight(height: number) {
        let wsSettings =
            `<dimension ref="A1:C11"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2" s="1"><v>1</v></c><c r="B2" t="s"><v>3</v></c><c r="C2" t="s"><v>4</v></c></row><row r="3"><c r="A3" s="1"><v>2</v></c><c r="B3" t="s"><v>5</v></c><c r="C3" t="s"><v>6</v></c></row><row r="4"><c r="A4" s="1"><v>3</v></c><c r="B4" t="s"><v>7</v></c><c r="C4" t="s"><v>6</v></c></row><row r="5"><c r="A5" s="1"><v>4</v></c><c r="B5" t="s"><v>8</v></c><c r="C5" t="s"><v>9</v></c></row><row r="6"><c r="A6" s="1"><v>5</v></c><c r="B6" t="s"><v>10</v></c><c r="C6" t="s"><v>11</v></c></row><row r="7"><c r="A7" s="1"><v>6</v></c><c r="B7" t="s"><v>12</v></c><c r="C7" t="s"><v>13</v></c></row><row r="8"><c r="A8" s="1"><v>7</v></c><c r="B8" t="s"><v>14</v></c><c r="C8" t="s"><v>15</v></c></row><row r="9"><c r="A9" s="1"><v>8</v></c><c r="B9" t="s"><v>16</v></c><c r="C9" t="s"><v>17</v></c></row><row r="10"><c r="A10" s="1"><v>9</v></c><c r="B10" t="s"><v>18</v></c><c r="C10" t="s"><v>15</v></c></row><row r="11"><c r="A11" s="1"><v>10</v></c><c r="B11" t="s"><v>19</v></c><c r="C11" t="s"><v>20</v></c></row></sheetData>`;

        switch (height) {
            case 20:
                wsSettings =
                    `<dimension ref="A1:C11"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols><sheetData><row r="1" ht="20" customHeight="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2" ht="20" customHeight="1"><c r="A2" s="1"><v>1</v></c><c r="B2" t="s"><v>3</v></c><c r="C2" t="s"><v>4</v></c></row><row r="3" ht="20" customHeight="1"><c r="A3" s="1"><v>2</v></c><c r="B3" t="s"><v>5</v></c><c r="C3" t="s"><v>6</v></c></row><row r="4" ht="20" customHeight="1"><c r="A4" s="1"><v>3</v></c><c r="B4" t="s"><v>7</v></c><c r="C4" t="s"><v>6</v></c></row><row r="5" ht="20" customHeight="1"><c r="A5" s="1"><v>4</v></c><c r="B5" t="s"><v>8</v></c><c r="C5" t="s"><v>9</v></c></row><row r="6" ht="20" customHeight="1"><c r="A6" s="1"><v>5</v></c><c r="B6" t="s"><v>10</v></c><c r="C6" t="s"><v>11</v></c></row><row r="7" ht="20" customHeight="1"><c r="A7" s="1"><v>6</v></c><c r="B7" t="s"><v>12</v></c><c r="C7" t="s"><v>13</v></c></row><row r="8" ht="20" customHeight="1"><c r="A8" s="1"><v>7</v></c><c r="B8" t="s"><v>14</v></c><c r="C8" t="s"><v>15</v></c></row><row r="9" ht="20" customHeight="1"><c r="A9" s="1"><v>8</v></c><c r="B9" t="s"><v>16</v></c><c r="C9" t="s"><v>17</v></c></row><row r="10" ht="20" customHeight="1"><c r="A10" s="1"><v>9</v></c><c r="B10" t="s"><v>18</v></c><c r="C10" t="s"><v>15</v></c></row><row r="11" ht="20" customHeight="1"><c r="A11" s="1"><v>10</v></c><c r="B11" t="s"><v>19</v></c><c r="C11" t="s"><v>20</v></c></row></sheetData>`;

                break;
            case 40:
                wsSettings =
                    `<dimension ref="A1:C11"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols><sheetData><row r="1" ht="40" customHeight="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2" ht="40" customHeight="1"><c r="A2" s="1"><v>1</v></c><c r="B2" t="s"><v>3</v></c><c r="C2" t="s"><v>4</v></c></row><row r="3" ht="40" customHeight="1"><c r="A3" s="1"><v>2</v></c><c r="B3" t="s"><v>5</v></c><c r="C3" t="s"><v>6</v></c></row><row r="4" ht="40" customHeight="1"><c r="A4" s="1"><v>3</v></c><c r="B4" t="s"><v>7</v></c><c r="C4" t="s"><v>6</v></c></row><row r="5" ht="40" customHeight="1"><c r="A5" s="1"><v>4</v></c><c r="B5" t="s"><v>8</v></c><c r="C5" t="s"><v>9</v></c></row><row r="6" ht="40" customHeight="1"><c r="A6" s="1"><v>5</v></c><c r="B6" t="s"><v>10</v></c><c r="C6" t="s"><v>11</v></c></row><row r="7" ht="40" customHeight="1"><c r="A7" s="1"><v>6</v></c><c r="B7" t="s"><v>12</v></c><c r="C7" t="s"><v>13</v></c></row><row r="8" ht="40" customHeight="1"><c r="A8" s="1"><v>7</v></c><c r="B8" t="s"><v>14</v></c><c r="C8" t="s"><v>15</v></c></row><row r="9" ht="40" customHeight="1"><c r="A9" s="1"><v>8</v></c><c r="B9" t="s"><v>16</v></c><c r="C9" t="s"><v>17</v></c></row><row r="10" ht="40" customHeight="1"><c r="A10" s="1"><v>9</v></c><c r="B10" t="s"><v>18</v></c><c r="C10" t="s"><v>15</v></c></row><row r="11" ht="40" customHeight="1"><c r="A11" s="1"><v>10</v></c><c r="B11" t="s"><v>19</v></c><c r="C11" t="s"><v>20</v></c></row></sheetData>`;
                break;
            case undefined:
            case null:
            case 0:
                break;
        }

        return wsSettings;
    }

    public get gridNameIDJobTitle() {
        this._sharedStringsData =
            `count="23" uniqueCount="21"><si><t>Name</t></si><si><t>ID</t></si><si><t>JobTitle</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Tanya Bennett</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>Celia Martinez</t></si><si><t>Senior Software Developer</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si><si><t>Erika Wells</t></si><si><t>Software Development Team Lead</t></si><si><t>Leslie Hansen</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si>`;

        this._tableData = `ref="A1:C11" totalsRowShown="0">
        <autoFilter ref="A1:C11"/><tableColumns count="3"><tableColumn id="1" name="Name"/><tableColumn id="2" name="ID"/>` +
            `<tableColumn id="3" name="JobTitle"/></tableColumns>`;

        this._worksheetData =
            `<dimension ref="A1:C11"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2" t="s"><v>3</v></c><c r="B2" s="1"><v>1</v></c><c r="C2" t="s"><v>4</v></c></row><row r="3"><c r="A3" t="s"><v>5</v></c><c r="B3" s="1"><v>2</v></c><c r="C3" t="s"><v>6</v></c></row><row r="4"><c r="A4" t="s"><v>7</v></c><c r="B4" s="1"><v>3</v></c><c r="C4" t="s"><v>6</v></c></row><row r="5"><c r="A5" t="s"><v>8</v></c><c r="B5" s="1"><v>4</v></c><c r="C5" t="s"><v>9</v></c></row><row r="6"><c r="A6" t="s"><v>10</v></c><c r="B6" s="1"><v>5</v></c><c r="C6" t="s"><v>11</v></c></row><row r="7"><c r="A7" t="s"><v>12</v></c><c r="B7" s="1"><v>6</v></c><c r="C7" t="s"><v>13</v></c></row><row r="8"><c r="A8" t="s"><v>14</v></c><c r="B8" s="1"><v>7</v></c><c r="C8" t="s"><v>15</v></c></row><row r="9"><c r="A9" t="s"><v>16</v></c><c r="B9" s="1"><v>8</v></c><c r="C9" t="s"><v>17</v></c></row><row r="10"><c r="A10" t="s"><v>18</v></c><c r="B10" s="1"><v>9</v></c><c r="C10" t="s"><v>15</v></c></row><row r="11"><c r="A11" t="s"><v>19</v></c><c r="B11" s="1"><v>10</v></c><c r="C11" t="s"><v>20</v></c></row></sheetData>`;

        return this.createData();
    }

    public get gridNameFrozen() {
        this._sharedStringsData =
            `count="23" uniqueCount="21"><si><t>Name</t></si><si><t>ID</t></si><si><t>JobTitle</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Tanya Bennett</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>Celia Martinez</t></si><si><t>Senior Software Developer</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si><si><t>Erika Wells</t></si><si><t>Software Development Team Lead</t></si><si><t>Leslie Hansen</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si>`;

        this._tableData = `ref="A1:C11" totalsRowShown="0">
        <autoFilter ref="A1:C11"/><tableColumns count="3"><tableColumn id="1" name="Name"/><tableColumn id="2" name="ID"/>` +
            `<tableColumn id="3" name="JobTitle"/></tableColumns>`;

        this._worksheetData = `<dimension ref="A1:C11"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"><pane xSplit="1" topLeftCell="B1" activePane="topRight" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2" t="s"><v>3</v></c><c r="B2" s="1"><v>1</v></c><c r="C2" t="s"><v>4</v></c></row><row r="3"><c r="A3" t="s"><v>5</v></c><c r="B3" s="1"><v>2</v></c><c r="C3" t="s"><v>6</v></c></row><row r="4"><c r="A4" t="s"><v>7</v></c><c r="B4" s="1"><v>3</v></c><c r="C4" t="s"><v>6</v></c></row><row r="5"><c r="A5" t="s"><v>8</v></c><c r="B5" s="1"><v>4</v></c><c r="C5" t="s"><v>9</v></c></row><row r="6"><c r="A6" t="s"><v>10</v></c><c r="B6" s="1"><v>5</v></c><c r="C6" t="s"><v>11</v></c></row><row r="7"><c r="A7" t="s"><v>12</v></c><c r="B7" s="1"><v>6</v></c><c r="C7" t="s"><v>13</v></c></row><row r="8"><c r="A8" t="s"><v>14</v></c><c r="B8" s="1"><v>7</v></c><c r="C8" t="s"><v>15</v></c></row><row r="9"><c r="A9" t="s"><v>16</v></c><c r="B9" s="1"><v>8</v></c><c r="C9" t="s"><v>17</v></c></row><row r="10"><c r="A10" t="s"><v>18</v></c><c r="B10" s="1"><v>9</v></c><c r="C10" t="s"><v>15</v></c></row><row r="11"><c r="A11" t="s"><v>19</v></c><c r="B11" s="1"><v>10</v></c><c r="C11" t="s"><v>20</v></c></row></sheetData>`;

        return this.createData();
    }

    public get gridJobTitleIdFrozen() {
        this._sharedStringsData = `count="23" uniqueCount="21"><si><t>JobTitle</t></si><si><t>ID</t></si><si><t>Name</t></si><si><t>Vice President</t></si><si><t>Casey Houston</t></si><si><t>Director</t></si><si><t>Gilberto Todd</t></si><si><t>Tanya Bennett</t></si><si><t>Software Developer</t></si><si><t>Jack Simon</t></si><si><t>Senior Software Developer</t></si><si><t>Celia Martinez</t></si><si><t>CEO</t></si><si><t>Erma Walsh</t></si><si><t>Associate Software Developer</t></si><si><t>Debra Morton</t></si><si><t>Software Development Team Lead</t></si><si><t>Erika Wells</t></si><si><t>Leslie Hansen</t></si><si><t>Manager</t></si><si><t>Eduardo Ramirez</t></si>`;

        this._tableData = `ref="A1:C11" totalsRowShown="0">
        <autoFilter ref="A1:C11"/><tableColumns count="3"><tableColumn id="1" name="JobTitle"/><tableColumn id="2" name="ID"/><tableColumn id="3" name="Name"/></tableColumns>`;

        this._worksheetData = `<dimension ref="A1:C11"/>
        <sheetViews><sheetView tabSelected="1" workbookViewId="0"><pane xSplit="2" topLeftCell="C1" activePane="topRight" state="frozen"/></sheetView></sheetViews>
        <sheetFormatPr defaultRowHeight="15"  x14ac:dyDescent="0.25"/>
        <cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols>
        <sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2" t="s"><v>3</v></c><c r="B2" s="1"><v>1</v></c><c r="C2" t="s"><v>4</v></c></row><row r="3"><c r="A3" t="s"><v>5</v></c><c r="B3" s="1"><v>2</v></c><c r="C3" t="s"><v>6</v></c></row><row r="4"><c r="A4" t="s"><v>5</v></c><c r="B4" s="1"><v>3</v></c><c r="C4" t="s"><v>7</v></c></row><row r="5"><c r="A5" t="s"><v>8</v></c><c r="B5" s="1"><v>4</v></c><c r="C5" t="s"><v>9</v></c></row><row r="6"><c r="A6" t="s"><v>10</v></c><c r="B6" s="1"><v>5</v></c><c r="C6" t="s"><v>11</v></c></row><row r="7"><c r="A7" t="s"><v>12</v></c><c r="B7" s="1"><v>6</v></c><c r="C7" t="s"><v>13</v></c></row><row r="8"><c r="A8" t="s"><v>14</v></c><c r="B8" s="1"><v>7</v></c><c r="C8" t="s"><v>15</v></c></row><row r="9"><c r="A9" t="s"><v>16</v></c><c r="B9" s="1"><v>8</v></c><c r="C9" t="s"><v>17</v></c></row><row r="10"><c r="A10" t="s"><v>14</v></c><c r="B10" s="1"><v>9</v></c><c r="C10" t="s"><v>18</v></c></row><row r="11"><c r="A11" t="s"><v>19</v></c><c r="B11" s="1"><v>10</v></c><c r="C11" t="s"><v>20</v></c></row></sheetData>`;

        return this.createData();
    }

    public get treeGridData() {
        this._sharedStringsData =
            `count="21" uniqueCount="19"><si><t>ID</t></si><si><t>ParentID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>Age</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Tanya Bennett</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si><si><t>Leslie Hansen</t></si>`;

        this._tableData = `ref="A1:E9" totalsRowShown="0">
    <autoFilter ref="A1:E9"/><tableColumns count="5"><tableColumn id="1" name="ID"/><tableColumn id="2" name="ParentID"/><tableColumn id="3" name="Name"/><tableColumn id="4" name="JobTitle"/><tableColumn id="5" name="Age"/></tableColumns>`;

        this._worksheetData = `
<sheetPr><outlinePr summaryBelow="0" /></sheetPr>
<dimension ref="A1:E9"/>
<sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15" outlineLevelRow="2" x14ac:dyDescent="0.25"/>
<cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/><col min="4" max="4" width="50" customWidth="1"/><col min="5" max="5" width="50" customWidth="1"/></cols>
<sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c></row><row r="2"><c r="A2" s="1"><v>1</v></c><c r="B2" s="1"><v>-1</v></c><c r="C2" t="s"><v>5</v></c><c r="D2" t="s"><v>6</v></c><c r="E2" s="1"><v>32</v></c></row><row r="3" outlineLevel="1"><c r="A3" s="1"><v>2</v></c><c r="B3" s="1"><v>1</v></c><c r="C3" t="s"><v>7</v></c><c r="D3" t="s"><v>8</v></c><c r="E3" s="1"><v>41</v></c></row><row r="4" outlineLevel="2"><c r="A4" s="1"><v>3</v></c><c r="B4" s="1"><v>2</v></c><c r="C4" t="s"><v>9</v></c><c r="D4" t="s"><v>8</v></c><c r="E4" s="1"><v>29</v></c></row><row r="5" outlineLevel="2"><c r="A5" s="1"><v>7</v></c><c r="B5" s="1"><v>2</v></c><c r="C5" t="s"><v>10</v></c><c r="D5" t="s"><v>11</v></c><c r="E5" s="1"><v>35</v></c></row><row r="6" outlineLevel="1"><c r="A6" s="1"><v>4</v></c><c r="B6" s="1"><v>1</v></c><c r="C6" t="s"><v>12</v></c><c r="D6" t="s"><v>13</v></c><c r="E6" s="1"><v>33</v></c></row><row r="7"><c r="A7" s="1"><v>6</v></c><c r="B7" s="1"><v>-1</v></c><c r="C7" t="s"><v>14</v></c><c r="D7" t="s"><v>15</v></c><c r="E7" s="1"><v>52</v></c></row><row r="8"><c r="A8" s="1"><v>10</v></c><c r="B8" s="1"><v>-1</v></c><c r="C8" t="s"><v>16</v></c><c r="D8" t="s"><v>17</v></c><c r="E8" s="1"><v>53</v></c></row><row r="9" outlineLevel="1"><c r="A9" s="1"><v>9</v></c><c r="B9" s="1"><v>10</v></c><c r="C9" t="s"><v>18</v></c><c r="D9" t="s"><v>11</v></c><c r="E9" s="1"><v>44</v></c></row></sheetData>`;

        return this.createData();
    }

    public get treeGridDataIgnoreFiltering() {
        this._sharedStringsData =
            `count="21" uniqueCount="19"><si><t>ID</t></si><si><t>ParentID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>Age</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Tanya Bennett</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si><si><t>Leslie Hansen</t></si>`;

        this._tableData = `ref="A1:E9" totalsRowShown="0">
        <autoFilter ref="A1:E9"/><tableColumns count="5"><tableColumn id="1" name="ID"/><tableColumn id="2" name="ParentID"/><tableColumn id="3" name="Name"/><tableColumn id="4" name="JobTitle"/><tableColumn id="5" name="Age"/></tableColumns>`;

        this._worksheetData = `<sheetPr><outlinePr summaryBelow="0"/></sheetPr>
        <dimension ref="A1:E9"/>
        <sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
        <sheetFormatPr defaultRowHeight="15" outlineLevelRow="2" x14ac:dyDescent="0.25"/>
        <cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/><col min="4" max="4" width="50" customWidth="1"/><col min="5" max="5" width="50" customWidth="1"/></cols>
        <sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c></row><row r="2"><c r="A2" s="1"><v>1</v></c><c r="B2" s="1"><v>-1</v></c><c r="C2" t="s"><v>5</v></c><c r="D2" t="s"><v>6</v></c><c r="E2" s="1"><v>32</v></c></row><row r="3" outlineLevel="1"><c r="A3" s="1"><v>2</v></c><c r="B3" s="1"><v>1</v></c><c r="C3" t="s"><v>7</v></c><c r="D3" t="s"><v>8</v></c><c r="E3" s="1"><v>41</v></c></row><row r="4" outlineLevel="2"><c r="A4" s="1"><v>3</v></c><c r="B4" s="1"><v>2</v></c><c r="C4" t="s"><v>9</v></c><c r="D4" t="s"><v>8</v></c><c r="E4" s="1"><v>29</v></c></row><row r="5" outlineLevel="2"><c r="A5" s="1"><v>7</v></c><c r="B5" s="1"><v>2</v></c><c r="C5" t="s"><v>10</v></c><c r="D5" t="s"><v>11</v></c><c r="E5" s="1"><v>35</v></c></row><row r="6" outlineLevel="1"><c r="A6" s="1"><v>4</v></c><c r="B6" s="1"><v>1</v></c><c r="C6" t="s"><v>12</v></c><c r="D6" t="s"><v>13</v></c><c r="E6" s="1"><v>33</v></c></row><row r="7"><c r="A7" s="1"><v>6</v></c><c r="B7" s="1"><v>-1</v></c><c r="C7" t="s"><v>14</v></c><c r="D7" t="s"><v>15</v></c><c r="E7" s="1"><v>52</v></c></row><row r="8"><c r="A8" s="1"><v>10</v></c><c r="B8" s="1"><v>-1</v></c><c r="C8" t="s"><v>16</v></c><c r="D8" t="s"><v>17</v></c><c r="E8" s="1"><v>53</v></c></row><row r="9" outlineLevel="1" hidden="1"><c r="A9" s="1"><v>9</v></c><c r="B9" s="1"><v>10</v></c><c r="C9" t="s"><v>18</v></c><c r="D9" t="s"><v>11</v></c><c r="E9" s="1"><v>44</v></c></row></sheetData>`;

        return this.createData();
    }

    public get treeGridDataFormatted() {
        this._sharedStringsData =
            `count="21" uniqueCount="19"><si><t>ID</t></si><si><t>ParentID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>Age</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Tanya Bennett</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si><si><t>Leslie Hansen</t></si>`;

        this._tableData = `ref="A1:E9" totalsRowShown="0">
        <autoFilter ref="A1:E9"/><tableColumns count="5"><tableColumn id="1" name="ID"/><tableColumn id="2" name="ParentID"/><tableColumn id="3" name="Name"/><tableColumn id="4" name="JobTitle"/><tableColumn id="5" name="Age"/></tableColumns>`;

        this._worksheetData = `
        <sheetPr><outlinePr summaryBelow="0"/></sheetPr>
        <dimension ref="A1:E9"/>
        <sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
        <sheetFormatPr defaultRowHeight="15" outlineLevelRow="2" x14ac:dyDescent="0.25"/>
        <cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/><col min="4" max="4" width="50" customWidth="1"/><col min="5" max="5" width="50" customWidth="1"/></cols>
        <sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c></row><row r="2"><c r="A2" s="1"><v>1</v></c><c r="B2" s="1"><v>-1</v></c><c r="C2" t="s"><v>5</v></c><c r="D2" t="s"><v>6</v></c><c r="E2" s="1"><v>32.42</v></c></row><row r="3" outlineLevel="1"><c r="A3" s="1"><v>2</v></c><c r="B3" s="1"><v>1</v></c><c r="C3" t="s"><v>7</v></c><c r="D3" t="s"><v>8</v></c><c r="E3" s="1"><v>41.42</v></c></row><row r="4" outlineLevel="2"><c r="A4" s="1"><v>3</v></c><c r="B4" s="1"><v>2</v></c><c r="C4" t="s"><v>9</v></c><c r="D4" t="s"><v>8</v></c><c r="E4" s="1"><v>29.92</v></c></row><row r="5" outlineLevel="2"><c r="A5" s="1"><v>7</v></c><c r="B5" s="1"><v>2</v></c><c r="C5" t="s"><v>10</v></c><c r="D5" t="s"><v>11</v></c><c r="E5" s="1"><v>35.67</v></c></row><row r="6" outlineLevel="1"><c r="A6" s="1"><v>4</v></c><c r="B6" s="1"><v>1</v></c><c r="C6" t="s"><v>12</v></c><c r="D6" t="s"><v>13</v></c><c r="E6" s="1"><v>33.5</v></c></row><row r="7"><c r="A7" s="1"><v>6</v></c><c r="B7" s="1"><v>-1</v></c><c r="C7" t="s"><v>14</v></c><c r="D7" t="s"><v>15</v></c><c r="E7" s="1"><v>52.58</v></c></row><row r="8"><c r="A8" s="1"><v>10</v></c><c r="B8" s="1"><v>-1</v></c><c r="C8" t="s"><v>16</v></c><c r="D8" t="s"><v>17</v></c><c r="E8" s="1"><v>53.67</v></c></row><row r="9" outlineLevel="1"><c r="A9" s="1"><v>9</v></c><c r="B9" s="1"><v>10</v></c><c r="C9" t="s"><v>18</v></c><c r="D9" t="s"><v>11</v></c><c r="E9" s="1"><v>44.67</v></c></row></sheetData>`;

        return this.createData();
    }

    public get treeGridDataSorted() {
        this._sharedStringsData =
            `count="21" uniqueCount="19"><si><t>ID</t></si><si><t>ParentID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>Age</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si><si><t>Leslie Hansen</t></si><si><t>Associate Software Developer</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Debra Morton</t></si><si><t>Tanya Bennett</t></si>`;

        this._tableData = `ref="A1:E9" totalsRowShown="0">
    <autoFilter ref="A1:E9"/><tableColumns count="5"><tableColumn id="1" name="ID"/><tableColumn id="2" name="ParentID"/><tableColumn id="3" name="Name"/><tableColumn id="4" name="JobTitle"/><tableColumn id="5" name="Age"/></tableColumns>`;

        this._worksheetData = `
<sheetPr><outlinePr summaryBelow="0" /></sheetPr>
<dimension ref="A1:E9"/>
<sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15" outlineLevelRow="2" x14ac:dyDescent="0.25"/>
<cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/><col min="4" max="4" width="50" customWidth="1"/><col min="5" max="5" width="50" customWidth="1"/></cols>
<sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c></row><row r="2"><c r="A2" s="1"><v>10</v></c><c r="B2" s="1"><v>-1</v></c><c r="C2" t="s"><v>5</v></c><c r="D2" t="s"><v>6</v></c><c r="E2" s="1"><v>53</v></c></row><row r="3" outlineLevel="1"><c r="A3" s="1"><v>9</v></c><c r="B3" s="1"><v>10</v></c><c r="C3" t="s"><v>7</v></c><c r="D3" t="s"><v>8</v></c><c r="E3" s="1"><v>44</v></c></row><row r="4"><c r="A4" s="1"><v>6</v></c><c r="B4" s="1"><v>-1</v></c><c r="C4" t="s"><v>9</v></c><c r="D4" t="s"><v>10</v></c><c r="E4" s="1"><v>52</v></c></row><row r="5"><c r="A5" s="1"><v>1</v></c><c r="B5" s="1"><v>-1</v></c><c r="C5" t="s"><v>11</v></c><c r="D5" t="s"><v>12</v></c><c r="E5" s="1"><v>32</v></c></row><row r="6" outlineLevel="1"><c r="A6" s="1"><v>4</v></c><c r="B6" s="1"><v>1</v></c><c r="C6" t="s"><v>13</v></c><c r="D6" t="s"><v>14</v></c><c r="E6" s="1"><v>33</v></c></row><row r="7" outlineLevel="1"><c r="A7" s="1"><v>2</v></c><c r="B7" s="1"><v>1</v></c><c r="C7" t="s"><v>15</v></c><c r="D7" t="s"><v>16</v></c><c r="E7" s="1"><v>41</v></c></row><row r="8" outlineLevel="2"><c r="A8" s="1"><v>7</v></c><c r="B8" s="1"><v>2</v></c><c r="C8" t="s"><v>17</v></c><c r="D8" t="s"><v>8</v></c><c r="E8" s="1"><v>35</v></c></row><row r="9" outlineLevel="2"><c r="A9" s="1"><v>3</v></c><c r="B9" s="1"><v>2</v></c><c r="C9" t="s"><v>18</v></c><c r="D9" t="s"><v>16</v></c><c r="E9" s="1"><v>29</v></c></row></sheetData>`;

        return this.createData();
    }

    public get treeGridDataFiltered() {
        this._sharedStringsData =
            `count="19" uniqueCount="18"><si><t>ID</t></si><si><t>ParentID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>Age</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si><si><t>Leslie Hansen</t></si>`;

        this._tableData = `ref="A1:E8" totalsRowShown="0">
    <autoFilter ref="A1:E8"/><tableColumns count="5"><tableColumn id="1" name="ID"/><tableColumn id="2" name="ParentID"/><tableColumn id="3" name="Name"/><tableColumn id="4" name="JobTitle"/><tableColumn id="5" name="Age"/></tableColumns>`;

        this._worksheetData = `
<sheetPr><outlinePr summaryBelow="0" /></sheetPr>
<dimension ref="A1:E8"/>
<sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15" outlineLevelRow="2" x14ac:dyDescent="0.25"/>
<cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/><col min="4" max="4" width="50" customWidth="1"/><col min="5" max="5" width="50" customWidth="1"/></cols>
<sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c></row><row r="2"><c r="A2" s="1"><v>1</v></c><c r="B2" s="1"><v>-1</v></c><c r="C2" t="s"><v>5</v></c><c r="D2" t="s"><v>6</v></c><c r="E2" s="1"><v>32</v></c></row><row r="3" outlineLevel="1"><c r="A3" s="1"><v>2</v></c><c r="B3" s="1"><v>1</v></c><c r="C3" t="s"><v>7</v></c><c r="D3" t="s"><v>8</v></c><c r="E3" s="1"><v>41</v></c></row><row r="4" outlineLevel="2"><c r="A4" s="1"><v>7</v></c><c r="B4" s="1"><v>2</v></c><c r="C4" t="s"><v>9</v></c><c r="D4" t="s"><v>10</v></c><c r="E4" s="1"><v>35</v></c></row><row r="5" outlineLevel="1"><c r="A5" s="1"><v>4</v></c><c r="B5" s="1"><v>1</v></c><c r="C5" t="s"><v>11</v></c><c r="D5" t="s"><v>12</v></c><c r="E5" s="1"><v>33</v></c></row><row r="6"><c r="A6" s="1"><v>6</v></c><c r="B6" s="1"><v>-1</v></c><c r="C6" t="s"><v>13</v></c><c r="D6" t="s"><v>14</v></c><c r="E6" s="1"><v>52</v></c></row><row r="7"><c r="A7" s="1"><v>10</v></c><c r="B7" s="1"><v>-1</v></c><c r="C7" t="s"><v>15</v></c><c r="D7" t="s"><v>16</v></c><c r="E7" s="1"><v>53</v></c></row><row r="8" outlineLevel="1"><c r="A8" s="1"><v>9</v></c><c r="B8" s="1"><v>10</v></c><c r="C8" t="s"><v>17</v></c><c r="D8" t="s"><v>10</v></c><c r="E8" s="1"><v>44</v></c></row></sheetData>`;

        return this.createData();
    }

    public get treeGridDataFilteredSorted() {
        this._sharedStringsData =
            `count="19" uniqueCount="18"><si><t>ID</t></si><si><t>ParentID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>Age</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si><si><t>Leslie Hansen</t></si><si><t>Associate Software Developer</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Debra Morton</t></si>`;

        this._tableData = `ref="A1:E8" totalsRowShown="0">
    <autoFilter ref="A1:E8"/><tableColumns count="5"><tableColumn id="1" name="ID"/><tableColumn id="2" name="ParentID"/><tableColumn id="3" name="Name"/><tableColumn id="4" name="JobTitle"/><tableColumn id="5" name="Age"/></tableColumns>`;

        this._worksheetData = `
<sheetPr><outlinePr summaryBelow="0" /></sheetPr>
<dimension ref="A1:E8"/>
<sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15" outlineLevelRow="2" x14ac:dyDescent="0.25"/>
<cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/><col min="4" max="4" width="50" customWidth="1"/><col min="5" max="5" width="50" customWidth="1"/></cols>
<sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c></row><row r="2"><c r="A2" s="1"><v>6</v></c><c r="B2" s="1"><v>-1</v></c><c r="C2" t="s"><v>5</v></c><c r="D2" t="s"><v>6</v></c><c r="E2" s="1"><v>52</v></c></row><row r="3"><c r="A3" s="1"><v>10</v></c><c r="B3" s="1"><v>-1</v></c><c r="C3" t="s"><v>7</v></c><c r="D3" t="s"><v>8</v></c><c r="E3" s="1"><v>53</v></c></row><row r="4" outlineLevel="1"><c r="A4" s="1"><v>9</v></c><c r="B4" s="1"><v>10</v></c><c r="C4" t="s"><v>9</v></c><c r="D4" t="s"><v>10</v></c><c r="E4" s="1"><v>44</v></c></row><row r="5"><c r="A5" s="1"><v>1</v></c><c r="B5" s="1"><v>-1</v></c><c r="C5" t="s"><v>11</v></c><c r="D5" t="s"><v>12</v></c><c r="E5" s="1"><v>32</v></c></row><row r="6" outlineLevel="1"><c r="A6" s="1"><v>4</v></c><c r="B6" s="1"><v>1</v></c><c r="C6" t="s"><v>13</v></c><c r="D6" t="s"><v>14</v></c><c r="E6" s="1"><v>33</v></c></row><row r="7" outlineLevel="1"><c r="A7" s="1"><v>2</v></c><c r="B7" s="1"><v>1</v></c><c r="C7" t="s"><v>15</v></c><c r="D7" t="s"><v>16</v></c><c r="E7" s="1"><v>41</v></c></row><row r="8" outlineLevel="2"><c r="A8" s="1"><v>7</v></c><c r="B8" s="1"><v>2</v></c><c r="C8" t="s"><v>17</v></c><c r="D8" t="s"><v>10</v></c><c r="E8" s="1"><v>35</v></c></row></sheetData>`;

        return this.createData();
    }

    public get treeGridWithAdvancedFilters() {
        this._sharedStringsData =
        `count="15" uniqueCount="14"><si><t>ID</t></si><si><t>ParentID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>Age</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Tanya Bennett</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si>`;

        this._tableData = `ref="A1:E6" totalsRowShown="0">
        <autoFilter ref="A1:E6"/><tableColumns count="5"><tableColumn id="1" name="ID"/><tableColumn id="2" name="ParentID"/><tableColumn id="3" name="Name"/><tableColumn id="4" name="JobTitle"/><tableColumn id="5" name="Age"/></tableColumns>`;

        this._worksheetData = `<sheetPr><outlinePr summaryBelow="0"/></sheetPr>
        <dimension ref="A1:E6"/>
        <sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
        <sheetFormatPr defaultRowHeight="15" outlineLevelRow="2" x14ac:dyDescent="0.25"/>
        <cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/><col min="4" max="4" width="50" customWidth="1"/><col min="5" max="5" width="50" customWidth="1"/></cols>
        <sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c></row><row r="2"><c r="A2" s="1"><v>1</v></c><c r="B2" s="1"><v>-1</v></c><c r="C2" t="s"><v>5</v></c><c r="D2" t="s"><v>6</v></c><c r="E2" s="1"><v>32</v></c></row><row r="3" outlineLevel="1"><c r="A3" s="1"><v>2</v></c><c r="B3" s="1"><v>1</v></c><c r="C3" t="s"><v>7</v></c><c r="D3" t="s"><v>8</v></c><c r="E3" s="1"><v>41</v></c></row><row r="4" outlineLevel="2"><c r="A4" s="1"><v>3</v></c><c r="B4" s="1"><v>2</v></c><c r="C4" t="s"><v>9</v></c><c r="D4" t="s"><v>8</v></c><c r="E4" s="1"><v>29</v></c></row><row r="5" outlineLevel="2"><c r="A5" s="1"><v>7</v></c><c r="B5" s="1"><v>2</v></c><c r="C5" t="s"><v>10</v></c><c r="D5" t="s"><v>11</v></c><c r="E5" s="1"><v>35</v></c></row><row r="6" outlineLevel="1"><c r="A6" s="1"><v>4</v></c><c r="B6" s="1"><v>1</v></c><c r="C6" t="s"><v>12</v></c><c r="D6" t="s"><v>13</v></c><c r="E6" s="1"><v>33</v></c></row></sheetData>`;

        return this.createData();
    }

    public get gridProductsWithFormatter() {
        this._sharedStringsData =
            `count="45" uniqueCount="35"><si><t>Product ID</t></si><si><t>ProductName</t></si><si><t>InStock</t></si><si><t>UnitsInStock</t></si><si><t>OrderDate</t></si><si><t>Chai</t></si><si><t>true</t></si><si><t>2760.00</t></si><si><t>Mon Mar 21 2005</t></si><si><t>Aniseed Syrup</t></si><si><t>false</t></si><si><t>198.00</t></si><si><t>Tue Jan 15 2008</t></si><si><t>Chef Antons Cajun Seasoning</t></si><si><t>52.00</t></si><si><t>Sat Nov 20 2010</t></si><si><t>Grandmas Boysenberry Spread</t></si><si><t>0.00</t></si><si><t>Thu Oct 11 2007</t></si><si><t>Uncle Bobs Dried Pears</t></si><si><t>Fri Jul 27 2001</t></si><si><t>Northwoods Cranberry Sauce</t></si><si><t>1098.00</t></si><si><t>Thu May 17 1990</t></si><si><t>Queso Cabrales</t></si><si><t>Thu Mar 03 2005</t></si><si><t>Tofu</t></si><si><t>7898.00</t></si><si><t>Sat Sep 09 2017</t></si><si><t>Teatime Chocolate Biscuits</t></si><si><t>6998.00</t></si><si><t>Thu Dec 25 2025</t></si><si><t>Chocolate</t></si><si><t>20000.00</t></si><si><t>Thu Mar 01 2018</t></si>`;

        this._tableData = `ref="A1:E11" totalsRowShown="0">
        <autoFilter ref="A1:E11"/><tableColumns count="5"><tableColumn id="1" name="Product ID"/><tableColumn id="2" name="ProductName"/><tableColumn id="3" name="InStock"/><tableColumn id="4" name="UnitsInStock"/><tableColumn id="5" name="OrderDate"/></tableColumns>`;

        this._worksheetData = `
        <dimension ref="A1:E11"/>
        <sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
        <sheetFormatPr defaultRowHeight="15"  x14ac:dyDescent="0.25"/>
        <cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/><col min="4" max="4" width="50" customWidth="1"/><col min="5" max="5" width="50" customWidth="1"/></cols>
        <sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c></row><row r="2"><c r="A2" s="1"><v>1</v></c><c r="B2" t="s"><v>5</v></c><c r="C2" t="s"><v>6</v></c><c r="D2" t="s"><v>7</v></c><c r="E2" t="s"><v>8</v></c></row><row r="3"><c r="A3" s="1"><v>2</v></c><c r="B3" t="s"><v>9</v></c><c r="C3" t="s"><v>10</v></c><c r="D3" t="s"><v>11</v></c><c r="E3" t="s"><v>12</v></c></row><row r="4"><c r="A4" s="1"><v>3</v></c><c r="B4" t="s"><v>13</v></c><c r="C4" t="s"><v>6</v></c><c r="D4" t="s"><v>14</v></c><c r="E4" t="s"><v>15</v></c></row><row r="5"><c r="A5" s="1"><v>4</v></c><c r="B5" t="s"><v>16</v></c><c r="C5" t="s"><v>10</v></c><c r="D5" t="s"><v>17</v></c><c r="E5" t="s"><v>18</v></c></row><row r="6"><c r="A6" s="1"><v>5</v></c><c r="B6" t="s"><v>19</v></c><c r="C6" t="s"><v>10</v></c><c r="D6" t="s"><v>17</v></c><c r="E6" t="s"><v>20</v></c></row><row r="7"><c r="A7" s="1"><v>6</v></c><c r="B7" t="s"><v>21</v></c><c r="C7" t="s"><v>6</v></c><c r="D7" t="s"><v>22</v></c><c r="E7" t="s"><v>23</v></c></row><row r="8"><c r="A8" s="1"><v>7</v></c><c r="B8" t="s"><v>24</v></c><c r="C8" t="s"><v>10</v></c><c r="D8" t="s"><v>17</v></c><c r="E8" t="s"><v>25</v></c></row><row r="9"><c r="A9" s="1"><v>8</v></c><c r="B9" t="s"><v>26</v></c><c r="C9" t="s"><v>6</v></c><c r="D9" t="s"><v>27</v></c><c r="E9" t="s"><v>28</v></c></row><row r="10"><c r="A10" s="1"><v>9</v></c><c r="B10" t="s"><v>29</v></c><c r="C10" t="s"><v>6</v></c><c r="D10" t="s"><v>30</v></c><c r="E10" t="s"><v>31</v></c></row><row r="11"><c r="A11" s="1"><v>10</v></c><c r="B11" t="s"><v>32</v></c><c r="C11" t="s"><v>6</v></c><c r="D11" t="s"><v>33</v></c><c r="E11" t="s"><v>34</v></c></row></sheetData>`;

        return this.createData();
    }

    public get gridProductsWithoutFormatter() {
        this._sharedStringsData =
            `count="35" uniqueCount="27"><si><t>Product ID</t></si><si><t>ProductName</t></si><si><t>InStock</t></si><si><t>UnitsInStock</t></si><si><t>OrderDate</t></si><si><t>Chai</t></si><si><t>true</t></si><si><t>Mon Mar 21 2005 02:00:00 GMT+0200 (Eastern European Standard Time)</t></si><si><t>Aniseed Syrup</t></si><si><t>false</t></si><si><t>Tue Jan 15 2008 02:00:00 GMT+0200 (Eastern European Standard Time)</t></si><si><t>Chef Antons Cajun Seasoning</t></si><si><t>Sat Nov 20 2010 02:00:00 GMT+0200 (Eastern European Standard Time)</t></si><si><t>Grandmas Boysenberry Spread</t></si><si><t>Thu Oct 11 2007 03:00:00 GMT+0300 (Eastern European Summer Time)</t></si><si><t>Uncle Bobs Dried Pears</t></si><si><t>Fri Jul 27 2001 03:00:00 GMT+0300 (Eastern European Summer Time)</t></si><si><t>Northwoods Cranberry Sauce</t></si><si><t>Thu May 17 1990 04:00:00 GMT+0400 (Eastern European Summer Time)</t></si><si><t>Queso Cabrales</t></si><si><t>Thu Mar 03 2005 02:00:00 GMT+0200 (Eastern European Standard Time)</t></si><si><t>Tofu</t></si><si><t>Sat Sep 09 2017 03:00:00 GMT+0300 (Eastern European Summer Time)</t></si><si><t>Teatime Chocolate Biscuits</t></si><si><t>Thu Dec 25 2025 02:00:00 GMT+0200 (Eastern European Standard Time)</t></si><si><t>Chocolate</t></si><si><t>Thu Mar 01 2018 02:00:00 GMT+0200 (Eastern European Standard Time)</t></si>`;

        this._tableData = `ref="A1:E11" totalsRowShown="0">
        <autoFilter ref="A1:E11"/><tableColumns count="5"><tableColumn id="1" name="Product ID"/><tableColumn id="2" name="ProductName"/><tableColumn id="3" name="InStock"/><tableColumn id="4" name="UnitsInStock"/><tableColumn id="5" name="OrderDate"/></tableColumns>`;

        this._worksheetData = `
        <dimension ref="A1:E11"/>
        <sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
        <sheetFormatPr defaultRowHeight="15"  x14ac:dyDescent="0.25"/>
        <cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/><col min="4" max="4" width="50" customWidth="1"/><col min="5" max="5" width="50" customWidth="1"/></cols>
        <sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c></row><row r="2"><c r="A2" s="1"><v>1</v></c><c r="B2" t="s"><v>5</v></c><c r="C2" t="s"><v>6</v></c><c r="D2" s="1"><v>2760</v></c><c r="E2" t="s"><v>7</v></c></row><row r="3"><c r="A3" s="1"><v>2</v></c><c r="B3" t="s"><v>8</v></c><c r="C3" t="s"><v>9</v></c><c r="D3" s="1"><v>198</v></c><c r="E3" t="s"><v>10</v></c></row><row r="4"><c r="A4" s="1"><v>3</v></c><c r="B4" t="s"><v>11</v></c><c r="C4" t="s"><v>6</v></c><c r="D4" s="1"><v>52</v></c><c r="E4" t="s"><v>12</v></c></row><row r="5"><c r="A5" s="1"><v>4</v></c><c r="B5" t="s"><v>13</v></c><c r="C5" t="s"><v>9</v></c><c r="D5" s="1"><v>0</v></c><c r="E5" t="s"><v>14</v></c></row><row r="6"><c r="A6" s="1"><v>5</v></c><c r="B6" t="s"><v>15</v></c><c r="C6" t="s"><v>9</v></c><c r="D6" s="1"><v>0</v></c><c r="E6" t="s"><v>16</v></c></row><row r="7"><c r="A7" s="1"><v>6</v></c><c r="B7" t="s"><v>17</v></c><c r="C7" t="s"><v>6</v></c><c r="D7" s="1"><v>1098</v></c><c r="E7" t="s"><v>18</v></c></row><row r="8"><c r="A8" s="1"><v>7</v></c><c r="B8" t="s"><v>19</v></c><c r="C8" t="s"><v>9</v></c><c r="D8" s="1"><v>0</v></c><c r="E8" t="s"><v>20</v></c></row><row r="9"><c r="A9" s="1"><v>8</v></c><c r="B9" t="s"><v>21</v></c><c r="C9" t="s"><v>6</v></c><c r="D9" s="1"><v>7898</v></c><c r="E9" t="s"><v>22</v></c></row><row r="10"><c r="A10" s="1"><v>9</v></c><c r="B10" t="s"><v>23</v></c><c r="C10" t="s"><v>6</v></c><c r="D10" s="1"><v>6998</v></c><c r="E10" t="s"><v>24</v></c></row><row r="11"><c r="A11" s="1"><v>10</v></c><c r="B11" t="s"><v>25</v></c><c r="C11" t="s"><v>6</v></c><c r="D11" s="1"><v>20000</v></c><c r="E11" t="s"><v>26</v></c></row></sheetData>`;

        return this.createData();
    }

    public get gridWithEmptyColums() {
        this._sharedStringsData =
            `count="25" uniqueCount="23"><si><t>Column1</t></si><si><t>ID</t></si><si><t>Column2</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>Tanya Bennett</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>Celia Martinez</t></si><si><t>Senior Software Developer</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si><si><t>Erika Wells</t></si><si><t>Software Development Team Lead</t></si><si><t>Leslie Hansen</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si>`;

        this._tableData = `ref="A1:E11" totalsRowShown="0">
        <autoFilter ref="A1:E11"/><tableColumns count="5"><tableColumn id="1" name="Column1"/><tableColumn id="2" name="ID"/><tableColumn id="3" name="Column2"/><tableColumn id="4" name="Name"/><tableColumn id="5" name="JobTitle"/></tableColumns>`;

        this._worksheetData = `
        <dimension ref="A1:E11"/>
<sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"  x14ac:dyDescent="0.25"/>
<cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/><col min="4" max="4" width="50" customWidth="1"/><col min="5" max="5" width="50" customWidth="1"/></cols>
<sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c></row><row r="2"><c r="A2" s="1"/><c r="B2" s="1"><v>1</v></c><c r="C2" s="1"/><c r="D2" t="s"><v>5</v></c><c r="E2" t="s"><v>6</v></c></row><row r="3"><c r="A3" s="1"/><c r="B3" s="1"><v>2</v></c><c r="C3" s="1"/><c r="D3" t="s"><v>7</v></c><c r="E3" t="s"><v>8</v></c></row><row r="4"><c r="A4" s="1"/><c r="B4" s="1"><v>3</v></c><c r="C4" s="1"/><c r="D4" t="s"><v>9</v></c><c r="E4" t="s"><v>8</v></c></row><row r="5"><c r="A5" s="1"/><c r="B5" s="1"><v>4</v></c><c r="C5" s="1"/><c r="D5" t="s"><v>10</v></c><c r="E5" t="s"><v>11</v></c></row><row r="6"><c r="A6" s="1"/><c r="B6" s="1"><v>5</v></c><c r="C6" s="1"/><c r="D6" t="s"><v>12</v></c><c r="E6" t="s"><v>13</v></c></row><row r="7"><c r="A7" s="1"/><c r="B7" s="1"><v>6</v></c><c r="C7" s="1"/><c r="D7" t="s"><v>14</v></c><c r="E7" t="s"><v>15</v></c></row><row r="8"><c r="A8" s="1"/><c r="B8" s="1"><v>7</v></c><c r="C8" s="1"/><c r="D8" t="s"><v>16</v></c><c r="E8" t="s"><v>17</v></c></row><row r="9"><c r="A9" s="1"/><c r="B9" s="1"><v>8</v></c><c r="C9" s="1"/><c r="D9" t="s"><v>18</v></c><c r="E9" t="s"><v>19</v></c></row><row r="10"><c r="A10" s="1"/><c r="B10" s="1"><v>9</v></c><c r="C10" s="1"/><c r="D10" t="s"><v>20</v></c><c r="E10" t="s"><v>17</v></c></row><row r="11"><c r="A11" s="1"/><c r="B11" s="1"><v>10</v></c><c r="C11" s="1"/><c r="D11" t="s"><v>21</v></c><c r="E11" t="s"><v>22</v></c></row></sheetData>`;

        return this.createData();
    }

    public get gridWithAdvancedFilters() {
        this._sharedStringsData =
        `count="11" uniqueCount="11"><si><t>ID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si><si><t>Erika Wells</t></si><si><t>Software Development Team Lead</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si>`;

        this._tableData = `ref="A1:C5" totalsRowShown="0">
        <autoFilter ref="A1:C5"/><tableColumns count="3"><tableColumn id="1" name="ID"/><tableColumn id="2" name="Name"/><tableColumn id="3" name="JobTitle"/></tableColumns>`;

        this._worksheetData = `<dimension ref="A1:C5"/>
        <sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
        <sheetFormatPr defaultRowHeight="15"  x14ac:dyDescent="0.25"/>
        <cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols>
        <sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2" s="1"><v>6</v></c><c r="B2" t="s"><v>3</v></c><c r="C2" t="s"><v>4</v></c></row><row r="3"><c r="A3" s="1"><v>7</v></c><c r="B3" t="s"><v>5</v></c><c r="C3" t="s"><v>6</v></c></row><row r="4"><c r="A4" s="1"><v>8</v></c><c r="B4" t="s"><v>7</v></c><c r="C4" t="s"><v>8</v></c></row><row r="5"><c r="A5" s="1"><v>10</v></c><c r="B5" t="s"><v>9</v></c><c r="C5" t="s"><v>10</v></c></row></sheetData>`;

        return this.createData();
    }

    public get personJobHoursDataPerformance() {
        this._sharedStringsData =
        `count="18" uniqueCount="15"><si><t>ID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>WorkingHours</t></si><si><t>HireDate</t></si><si><t>Performance</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>2017-06-19T11:43:07.714Z</t></si><si><t>[object Object],[object Object],[object Object],[object Object]</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>2015-12-18T11:23:17.714Z</t></si><si><t>Tanya Bennett</t></si><si><t>2005-11-18T11:23:17.714Z</t></si>`;

        this._tableData = `ref="A1:F4" totalsRowShown="0">
        <autoFilter ref="A1:F4"/><tableColumns count="6"><tableColumn id="1" name="ID"/><tableColumn id="2" name="Name"/><tableColumn id="3" name="JobTitle"/><tableColumn id="4" name="WorkingHours"/><tableColumn id="5" name="HireDate"/><tableColumn id="6" name="Performance"/></tableColumns>`;

        this._worksheetData = `<dimension ref="A1:F4"/>
        <sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
        <sheetFormatPr defaultRowHeight="15"  x14ac:dyDescent="0.25"/>
        <cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/><col min="4" max="4" width="50" customWidth="1"/><col min="5" max="5" width="50" customWidth="1"/><col min="6" max="6" width="50" customWidth="1"/></cols>
        <sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c><c r="F1" t="s"><v>5</v></c></row><row r="2"><c r="A2" s="1"><v>1</v></c><c r="B2" t="s"><v>6</v></c><c r="C2" t="s"><v>7</v></c><c r="D2" s="1"><v>4</v></c><c r="E2" t="s"><v>8</v></c><c r="F2" t="s"><v>9</v></c></row><row r="3"><c r="A3" s="1"><v>2</v></c><c r="B3" t="s"><v>10</v></c><c r="C3" t="s"><v>11</v></c><c r="D3" s="1"><v>6</v></c><c r="E3" t="s"><v>12</v></c><c r="F3" t="s"><v>9</v></c></row><row r="4"><c r="A4" s="1"><v>3</v></c><c r="B4" t="s"><v>13</v></c><c r="C4" t="s"><v>11</v></c><c r="D4" s="1"><v>8</v></c><c r="E4" t="s"><v>14</v></c><c r="F4" t="s"><v>9</v></c></row></sheetData>`;

        return this.createData();
    }

    public get hireDate() {
        this._sharedStringsData =
        `count="1" uniqueCount="1"><si><t>HireDate</t></si>`;

        this._tableData = `ref="A1:A6" totalsRowShown="0">
        <autoFilter ref="A1:A6"/><tableColumns count="1"><tableColumn id="1" name="HireDate"/></tableColumns>`;

        this._worksheetData = `<dimension ref="A1:A6"/>
        <sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
        <sheetFormatPr defaultRowHeight="15"  x14ac:dyDescent="0.25"/>
        <cols><col min="1" max="1" width="50" customWidth="1"/></cols>
        <sheetData><row r="1"><c r="A1" t="s"><v>0</v></c></row><row r="2"><c r="A2" t="d" s="2"><v>2008-04-20T00:00:00</v></c></row><row r="3"><c r="A3" t="d" s="2"><v>2015-12-08T00:00:00</v></c></row><row r="4"><c r="A4" t="d" s="2"><v>2012-07-30T00:00:00</v></c></row><row r="5"><c r="A5" t="d" s="2"><v>2010-02-05T00:00:00</v></c></row><row r="6"><c r="A6" t="d" s="2"><v>2020-05-17T00:00:00</v></c></row></sheetData>`;

        return this.createData();
    }

    public get exportGroupedData() {
        this._sharedStringsData =
            `count="29" uniqueCount="20"><si><t>Model</t></si><si><t>Edition</t></si><si><t>Brand: BMW (2)</t></si><si><t>Price: 150000 (1)</t></si><si><t>M5</t></si><si><t>Competition</t></si><si><t>Price: 100000 (1)</t></si><si><t>Performance</t></si><si><t>Brand: Tesla (3)</t></si><si><t>Roadster</t></si><si><t>Price: 75000 (1)</t></si><si><t>Model S</t></si><si><t>Sport</t></si><si><t>Price: 65000 (1)</t></si><si><t>Base</t></si><si><t>Brand: VW (3)</t></si><si><t>Arteon</t></si><si><t>R Line</t></si><si><t>Business</t></si><si><t>Passat</t></si>`;

        this._tableData =
            `ref="A1:B20" totalsRowShown="0">
            <autoFilter ref="A1:B20"/><tableColumns count="2"><tableColumn id="1" name="Model"/><tableColumn id="2" name="Edition"/></tableColumns>`;

        this._worksheetData =
            `<sheetPr><outlinePr summaryBelow="0"/></sheetPr>
            <dimension ref="A1:B20"/>
            <sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
            <sheetFormatPr defaultRowHeight="15" outlineLevelRow="2" x14ac:dyDescent="0.25"/>
            <cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/></cols>
            <sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row><row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2" s="1"/></row><row r="3" outlineLevel="1"><c r="A3" t="s"><v>3</v></c><c r="B3" s="1"/></row><row r="4" outlineLevel="2"><c r="A4" t="s"><v>4</v></c><c r="B4" t="s"><v>5</v></c></row><row r="5" outlineLevel="1"><c r="A5" t="s"><v>6</v></c><c r="B5" s="1"/></row><row r="6" outlineLevel="2"><c r="A6" t="s"><v>4</v></c><c r="B6" t="s"><v>7</v></c></row><row r="7"><c r="A7" t="s"><v>8</v></c><c r="B7" s="1"/></row><row r="8" outlineLevel="1"><c r="A8" t="s"><v>6</v></c><c r="B8" s="1"/></row><row r="9" outlineLevel="2"><c r="A9" t="s"><v>9</v></c><c r="B9" t="s"><v>7</v></c></row><row r="10" outlineLevel="1"><c r="A10" t="s"><v>10</v></c><c r="B10" s="1"/></row><row r="11" outlineLevel="2"><c r="A11" t="s"><v>11</v></c><c r="B11" t="s"><v>12</v></c></row><row r="12" outlineLevel="1"><c r="A12" t="s"><v>13</v></c><c r="B12" s="1"/></row><row r="13" outlineLevel="2"><c r="A13" t="s"><v>11</v></c><c r="B13" t="s"><v>14</v></c></row><row r="14"><c r="A14" t="s"><v>15</v></c><c r="B14" s="1"/></row><row r="15" outlineLevel="1"><c r="A15" t="s"><v>6</v></c><c r="B15" s="1"/></row><row r="16" outlineLevel="2"><c r="A16" t="s"><v>16</v></c><c r="B16" t="s"><v>17</v></c></row><row r="17" outlineLevel="1"><c r="A17" t="s"><v>10</v></c><c r="B17" s="1"/></row><row r="18" outlineLevel="2"><c r="A18" t="s"><v>16</v></c><c r="B18" t="s"><v>18</v></c></row><row r="19" outlineLevel="1"><c r="A19" t="s"><v>13</v></c><c r="B19" s="1"/></row><row r="20" outlineLevel="2"><c r="A20" t="s"><v>19</v></c><c r="B20" t="s"><v>18</v></c></row></sheetData>`;

        return this.createData();
    }

    public get exportGroupedDataWithCollapsedRows() {
        this._sharedStringsData =
            `count="29" uniqueCount="20"><si><t>Model</t></si><si><t>Edition</t></si><si><t>Brand: BMW (2)</t></si><si><t>Price: 150000 (1)</t></si><si><t>M5</t></si><si><t>Competition</t></si><si><t>Price: 100000 (1)</t></si><si><t>Performance</t></si><si><t>Brand: Tesla (3)</t></si><si><t>Roadster</t></si><si><t>Price: 75000 (1)</t></si><si><t>Model S</t></si><si><t>Sport</t></si><si><t>Price: 65000 (1)</t></si><si><t>Base</t></si><si><t>Brand: VW (3)</t></si><si><t>Arteon</t></si><si><t>R Line</t></si><si><t>Business</t></si><si><t>Passat</t></si>`;

        this._tableData =
            `ref="A1:B20" totalsRowShown="0">
            <autoFilter ref="A1:B20"/><tableColumns count="2"><tableColumn id="1" name="Model"/><tableColumn id="2" name="Edition"/></tableColumns>`;

        this._worksheetData =
            `<sheetPr><outlinePr summaryBelow="0"/></sheetPr>
            <dimension ref="A1:B20"/>
            <sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
            <sheetFormatPr defaultRowHeight="15" outlineLevelRow="2" x14ac:dyDescent="0.25"/>
            <cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/></cols>
            <sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row><row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2" s="1"/></row><row r="3" outlineLevel="1"><c r="A3" t="s"><v>3</v></c><c r="B3" s="1"/></row><row r="4" outlineLevel="2"><c r="A4" t="s"><v>4</v></c><c r="B4" t="s"><v>5</v></c></row><row r="5" outlineLevel="1"><c r="A5" t="s"><v>6</v></c><c r="B5" s="1"/></row><row r="6" outlineLevel="2" hidden="1"><c r="A6" t="s"><v>4</v></c><c r="B6" t="s"><v>7</v></c></row><row r="7"><c r="A7" t="s"><v>8</v></c><c r="B7" s="1"/></row><row r="8" outlineLevel="1" hidden="1"><c r="A8" t="s"><v>6</v></c><c r="B8" s="1"/></row><row r="9" outlineLevel="2" hidden="1"><c r="A9" t="s"><v>9</v></c><c r="B9" t="s"><v>7</v></c></row><row r="10" outlineLevel="1" hidden="1"><c r="A10" t="s"><v>10</v></c><c r="B10" s="1"/></row><row r="11" outlineLevel="2" hidden="1"><c r="A11" t="s"><v>11</v></c><c r="B11" t="s"><v>12</v></c></row><row r="12" outlineLevel="1" hidden="1"><c r="A12" t="s"><v>13</v></c><c r="B12" s="1"/></row><row r="13" outlineLevel="2" hidden="1"><c r="A13" t="s"><v>11</v></c><c r="B13" t="s"><v>14</v></c></row><row r="14"><c r="A14" t="s"><v>15</v></c><c r="B14" s="1"/></row><row r="15" outlineLevel="1"><c r="A15" t="s"><v>6</v></c><c r="B15" s="1"/></row><row r="16" outlineLevel="2"><c r="A16" t="s"><v>16</v></c><c r="B16" t="s"><v>17</v></c></row><row r="17" outlineLevel="1"><c r="A17" t="s"><v>10</v></c><c r="B17" s="1"/></row><row r="18" outlineLevel="2"><c r="A18" t="s"><v>16</v></c><c r="B18" t="s"><v>18</v></c></row><row r="19" outlineLevel="1"><c r="A19" t="s"><v>13</v></c><c r="B19" s="1"/></row><row r="20" outlineLevel="2"><c r="A20" t="s"><v>19</v></c><c r="B20" t="s"><v>18</v></c></row></sheetData>`;

        return this.createData();
    }

    public get exportGroupedDataWithIgnoreSorting() {
        this._sharedStringsData =
            `count="30" uniqueCount="21"><si><t>Price</t></si><si><t>Model</t></si><si><t>Edition</t></si><si><t>Brand: Tesla (3)</t></si><si><t>75000</t></si><si><t>Model S</t></si><si><t>Sport</t></si><si><t>100000</t></si><si><t>Roadster</t></si><si><t>Performance</t></si><si><t>65000</t></si><si><t>Base</t></si><si><t>Brand: BMW (2)</t></si><si><t>150000</t></si><si><t>M5</t></si><si><t>Competition</t></si><si><t>Brand: VW (3)</t></si><si><t>Arteon</t></si><si><t>Business</t></si><si><t>Passat</t></si><si><t>R Line</t></si>`;

        this._tableData =
            `ref="A1:C12" totalsRowShown="0">
            <autoFilter ref="A1:C12"/><tableColumns count="3"><tableColumn id="1" name="Price"/><tableColumn id="2" name="Model"/><tableColumn id="3" name="Edition"/></tableColumns>`;

        this._worksheetData =
            `<sheetPr><outlinePr summaryBelow="0"/></sheetPr>
            <dimension ref="A1:C12"/>
            <sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
            <sheetFormatPr defaultRowHeight="15" outlineLevelRow="1" x14ac:dyDescent="0.25"/>
            <cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols>
            <sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2" t="s"><v>3</v></c><c r="B2" s="1"/><c r="C2" s="1"/></row><row r="3" outlineLevel="1"><c r="A3" t="s"><v>4</v></c><c r="B3" t="s"><v>5</v></c><c r="C3" t="s"><v>6</v></c></row><row r="4" outlineLevel="1"><c r="A4" t="s"><v>7</v></c><c r="B4" t="s"><v>8</v></c><c r="C4" t="s"><v>9</v></c></row><row r="5" outlineLevel="1"><c r="A5" t="s"><v>10</v></c><c r="B5" t="s"><v>5</v></c><c r="C5" t="s"><v>11</v></c></row><row r="6"><c r="A6" t="s"><v>12</v></c><c r="B6" s="1"/><c r="C6" s="1"/></row><row r="7" outlineLevel="1"><c r="A7" t="s"><v>13</v></c><c r="B7" t="s"><v>14</v></c><c r="C7" t="s"><v>15</v></c></row><row r="8" outlineLevel="1"><c r="A8" t="s"><v>7</v></c><c r="B8" t="s"><v>14</v></c><c r="C8" t="s"><v>9</v></c></row><row r="9"><c r="A9" t="s"><v>16</v></c><c r="B9" s="1"/><c r="C9" s="1"/></row><row r="10" outlineLevel="1"><c r="A10" t="s"><v>4</v></c><c r="B10" t="s"><v>17</v></c><c r="C10" t="s"><v>18</v></c></row><row r="11" outlineLevel="1"><c r="A11" t="s"><v>10</v></c><c r="B11" t="s"><v>19</v></c><c r="C11" t="s"><v>18</v></c></row><row r="12" outlineLevel="1"><c r="A12" t="s"><v>7</v></c><c r="B12" t="s"><v>17</v></c><c r="C12" t="s"><v>20</v></c></row></sheetData>`;

        return this.createData();
    }

    public get exportGroupedDataWithIgnoreFiltering() {
        this._sharedStringsData =
            `count="30" uniqueCount="21"><si><t>Price</t></si><si><t>Model</t></si><si><t>Edition</t></si><si><t>Brand: BMW (2)</t></si><si><t>150000</t></si><si><t>M5</t></si><si><t>Competition</t></si><si><t>100000</t></si><si><t>Performance</t></si><si><t>Brand: Tesla (3)</t></si><si><t>75000</t></si><si><t>Model S</t></si><si><t>Sport</t></si><si><t>Roadster</t></si><si><t>65000</t></si><si><t>Base</t></si><si><t>Brand: VW (3)</t></si><si><t>Arteon</t></si><si><t>Business</t></si><si><t>Passat</t></si><si><t>R Line</t></si>`;

        this._tableData =
            `ref="A1:C12" totalsRowShown="0">
            <autoFilter ref="A1:C12"/><tableColumns count="3"><tableColumn id="1" name="Price"/><tableColumn id="2" name="Model"/><tableColumn id="3" name="Edition"/></tableColumns>`;

        this._worksheetData =
            `<sheetPr><outlinePr summaryBelow="0"/></sheetPr>
            <dimension ref="A1:C12"/>
            <sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
            <sheetFormatPr defaultRowHeight="15" outlineLevelRow="1" x14ac:dyDescent="0.25"/>
            <cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols>
            <sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2" t="s"><v>3</v></c><c r="B2" s="1"/><c r="C2" s="1"/></row><row r="3" outlineLevel="1"><c r="A3" t="s"><v>4</v></c><c r="B3" t="s"><v>5</v></c><c r="C3" t="s"><v>6</v></c></row><row r="4" outlineLevel="1"><c r="A4" t="s"><v>7</v></c><c r="B4" t="s"><v>5</v></c><c r="C4" t="s"><v>8</v></c></row><row r="5"><c r="A5" t="s"><v>9</v></c><c r="B5" s="1"/><c r="C5" s="1"/></row><row r="6" outlineLevel="1"><c r="A6" t="s"><v>10</v></c><c r="B6" t="s"><v>11</v></c><c r="C6" t="s"><v>12</v></c></row><row r="7" outlineLevel="1"><c r="A7" t="s"><v>7</v></c><c r="B7" t="s"><v>13</v></c><c r="C7" t="s"><v>8</v></c></row><row r="8" outlineLevel="1"><c r="A8" t="s"><v>14</v></c><c r="B8" t="s"><v>11</v></c><c r="C8" t="s"><v>15</v></c></row><row r="9"><c r="A9" t="s"><v>16</v></c><c r="B9" s="1"/><c r="C9" s="1"/></row><row r="10" outlineLevel="1"><c r="A10" t="s"><v>10</v></c><c r="B10" t="s"><v>17</v></c><c r="C10" t="s"><v>18</v></c></row><row r="11" outlineLevel="1"><c r="A11" t="s"><v>14</v></c><c r="B11" t="s"><v>19</v></c><c r="C11" t="s"><v>18</v></c></row><row r="12" outlineLevel="1"><c r="A12" t="s"><v>7</v></c><c r="B12" t="s"><v>17</v></c><c r="C12" t="s"><v>20</v></c></row></sheetData>`;

        return this.createData();
    }

    public get exportGroupedDataWithIgnoreGrouping() {
        this._sharedStringsData =
            `count="19" uniqueCount="14"><si><t>Price</t></si><si><t>Model</t></si><si><t>Edition</t></si><si><t>M5</t></si><si><t>Competition</t></si><si><t>Performance</t></si><si><t>Model S</t></si><si><t>Sport</t></si><si><t>Roadster</t></si><si><t>Base</t></si><si><t>Arteon</t></si><si><t>Business</t></si><si><t>Passat</t></si><si><t>R Line</t></si>`;

        this._tableData =
            `ref="A1:C9" totalsRowShown="0">
            <autoFilter ref="A1:C9"/><tableColumns count="3"><tableColumn id="1" name="Price"/><tableColumn id="2" name="Model"/><tableColumn id="3" name="Edition"/></tableColumns>`;

        this._worksheetData =
            `<dimension ref="A1:C9"/>
            <sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews>
            <sheetFormatPr defaultRowHeight="15"  x14ac:dyDescent="0.25"/>
            <cols><col min="1" max="1" width="50" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="50" customWidth="1"/></cols>
            <sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2" s="1"><v>150000</v></c><c r="B2" t="s"><v>3</v></c><c r="C2" t="s"><v>4</v></c></row><row r="3"><c r="A3" s="1"><v>100000</v></c><c r="B3" t="s"><v>3</v></c><c r="C3" t="s"><v>5</v></c></row><row r="4"><c r="A4" s="1"><v>75000</v></c><c r="B4" t="s"><v>6</v></c><c r="C4" t="s"><v>7</v></c></row><row r="5"><c r="A5" s="1"><v>100000</v></c><c r="B5" t="s"><v>8</v></c><c r="C5" t="s"><v>5</v></c></row><row r="6"><c r="A6" s="1"><v>65000</v></c><c r="B6" t="s"><v>6</v></c><c r="C6" t="s"><v>9</v></c></row><row r="7"><c r="A7" s="1"><v>75000</v></c><c r="B7" t="s"><v>10</v></c><c r="C7" t="s"><v>11</v></c></row><row r="8"><c r="A8" s="1"><v>65000</v></c><c r="B8" t="s"><v>12</v></c><c r="C8" t="s"><v>11</v></c></row><row r="9"><c r="A9" s="1"><v>100000</v></c><c r="B9" t="s"><v>10</v></c><c r="C9" t="s"><v>13</v></c></row></sheetData>`;

        return this.createData();
    }

}
