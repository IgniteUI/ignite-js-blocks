import {
    ChangeDetectorRef,
    Component,
    HostBinding,
    Input,
    Optional,
    ViewChild,
    ElementRef
} from '@angular/core';

import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { CsvFileTypes,
         IgxBaseExporter,
         IgxCsvExporterOptions,
         IgxCsvExporterService,
         IgxExcelExporterOptions,
         IgxExcelExporterService,
         CloseScrollStrategy} from '../services/index';
import { IgxGridAPIService } from './api.service';
import { IgxGridComponent } from './grid.component';
import { IgxDropDownComponent } from '../drop-down/drop-down.component';
import { IgxColumnHidingComponent } from './column-hiding.component';
import { OverlaySettings, PositionSettings, HorizontalAlignment, VerticalAlignment } from '../services/overlay/utilities';
import {  ConnectedPositioningStrategy } from '../services/overlay/position';

@Component({
    selector: 'igx-grid-toolbar',
    templateUrl: './grid-toolbar.component.html'
})
export class IgxGridToolbarComponent {

    @HostBinding('class.igx-grid-toolbar')
    @Input()
    public gridID: string;

    @ViewChild('columnHidingDropdown', { read: IgxDropDownComponent })
    public columnHidingDropdown: IgxDropDownComponent;

    @ViewChild(IgxColumnHidingComponent)
    public columnHidingUI: IgxColumnHidingComponent;

    @ViewChild('columnHidingButton')
    public columnHidingButton;

    @ViewChild('exportDropdown', { read: IgxDropDownComponent })
    public exportDropdown: IgxDropDownComponent;

    @ViewChild('btnExport')
    public exportButton;

    public get grid(): IgxGridComponent {
        return this.gridAPI.get(this.gridID);
    }

    public get shouldShowExportButton(): boolean {
        return (this.grid != null && (this.grid.exportExcel || this.grid.exportCsv));
    }

    public get shouldShowExportExcelButton(): boolean {
        return (this.grid != null && this.grid.exportExcel);
    }

    public get shouldShowExportCsvButton(): boolean {
        return (this.grid != null && this.grid.exportCsv);
    }

    constructor(public gridAPI: IgxGridAPIService,
                public cdr: ChangeDetectorRef,
                @Optional() public excelExporter: IgxExcelExporterService,
                @Optional() public csvExporter: IgxCsvExporterService) {
    }

    private _positionSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Left,
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        verticalStartPoint: VerticalAlignment.Bottom
    };

    private _overlaySettings: OverlaySettings = {
        positionStrategy: new ConnectedPositioningStrategy(this._positionSettings),
        scrollStrategy: new CloseScrollStrategy(),
        modal: false,
        closeOnOutsideClick: true
    };


    public getTitle(): string {
        return this.grid != null ? this.grid.toolbarTitle : '';
    }

    public getExportText(): string {
        return this.grid != null ? this.grid.exportText : '';
    }

    public getExportExcelText(): string {
        return this.grid != null ? this.grid.exportExcelText : '';
    }

    public getExportCsvText(): string {
        return this.grid != null ? this.grid.exportCsvText : '';
    }

    public exportClicked() {

        this._overlaySettings.positionStrategy.settings.target = this.exportButton.nativeElement;
        this.exportDropdown.toggle(this._overlaySettings);
    }

    public exportToExcelClicked() {
        this.performExport(this.excelExporter, 'excel');
    }

    public exportToCsvClicked() {
        this.performExport(this.csvExporter, 'csv');
    }

    private performExport(exp: IgxBaseExporter, exportType: string) {
        this.exportClicked();

        const fileName = 'ExportedData';
        const options = exportType === 'excel' ?
                        new IgxExcelExporterOptions(fileName) :
                        new IgxCsvExporterOptions(fileName, CsvFileTypes.CSV);

        const args = { grid: this.grid, exporter: exp, options: options, cancel: false };

        this.grid.onToolbarExporting.emit(args);
        if (args.cancel) {
            return;
        }
        exp.export(this.grid, options);
    }

    public toggleColumnHidingUI() {
        this._overlaySettings.positionStrategy.settings.target = this.columnHidingButton.nativeElement;
        this.columnHidingDropdown.toggle(this._overlaySettings);
    }
}
