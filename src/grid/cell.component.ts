import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from "@angular/core";
import { DataType } from "../data-operations/data-util";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";
import {VirtualHorizontalItemComponent} from "../virtual-container/virtual.horizontal.item.component";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "igx-grid-cell",
    templateUrl: "./cell.component.html",
    preserveWhitespaces: false,
    styles:[`    
    td{
    box-sizing: content-box;
}`
    ]
})
export class IgxGridCellComponent{

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public row: any;

    @Input()
    public cellTemplate: TemplateRef<any>;

    @Input()
    get value(): any {
        return this._value;
    }

    set value(val: any) {
        this._value = val;
        this.gridAPI.update(this.gridID, this);
        this.cdr.markForCheck();
    }

    get formatter(): (value: any) => any {
        return this.column.formatter;
    }

    get context(): any {
        return {
            $implicit: this.value,
            cell: this
        };
    }

    get template(): TemplateRef<any> {
        if (this.inEditMode) {
            const inlineEditorTemplate = this.column.inlineEditorTemplate;
            return inlineEditorTemplate ? inlineEditorTemplate : this.inlineEditorTemplate;
        }
        if (this.cellTemplate) {
            return this.cellTemplate;
        }
        return this.defaultCellTemplate;
    }

    get gridID(): any {
      return this.row.gridID;
    }

    get grid(): any {
        return this.gridAPI.get(this.gridID);
    }

    get rowIndex(): number {
        return this.row.index;
    }

    get columnIndex(): number {
        return this.column.index;
    }

    get nativeElement(): any {
        return this.element.nativeElement;
    }

    get inEditMode(): boolean {
        return this._inEditMode;
    }

    @HostBinding("attr.tabindex")
    public tabindex = 0;

    @HostBinding("attr.role")
    public role = "gridcell";

    @HostBinding("attr.aria-readonly")
    get readonly(): boolean {
        return !this.column.editable;
    }

    @HostBinding("attr.aria-describedby")
    get describedby(): string {
        return `${this.row.gridID}-${this.column.field}`;
    }

    @HostBinding("class")
    get styleClasses(): string {
        return `${this.defaultCssClass} ${this.column.cellClasses}`;
    }

    @HostBinding("style.width.px")
    @HostBinding("style.max-width.px")
    get width() {
        return parseInt(this.column.width);
    }

    @HostBinding("style.display")
    get shouldDisplay() {        
        return parseInt(this.column.width) === 0 ? "none": "flex";
    }

    @HostBinding("attr.aria-selected")
    @HostBinding("class.igx-grid__td--selected")
    get focused(): boolean {
        return this.isFocused || this.isSelected;
    }

    set focused(val: boolean) {
        this.isFocused = val;
        this.cdr.markForCheck();
    }

    @HostBinding("class.igx-grid__td--number")
    get applyNumberCSSClass() {
        return this.column.dataType === DataType.Number;
    }

    get selected() {
        return this.isSelected;
    }

    set selected(val: boolean) {
        this.isSelected = val;
        this.cdr.markForCheck();
    }

    @ViewChild("defaultCell", { read: TemplateRef })
    protected defaultCellTemplate: TemplateRef<any>;

    @ViewChild("inlineEditor", { read: TemplateRef })
    protected inlineEditorTemplate: TemplateRef<any>;

    protected defaultCssClass = "igx-grid__td";
    protected isFocused = false;
    protected isSelected = false;
    protected _value: any;
    protected _inEditMode = false;

    constructor(private gridAPI: IgxGridAPIService,
                private cdr: ChangeDetectorRef,
                private element: ElementRef) {}

    @HostListener("dblclick", ["$event"])
    public onDoubleClick(event) {
        if (this.column.editable) {
            this._inEditMode = true;
        }
    }

    @HostListener("focus", ["$event"])
    public onFocus(event) {
        this.isFocused = true;
        this.isSelected = true;
        this.grid.onSelection.emit(this);
    }

    @HostListener("blur", ["$event"])
    public onBlur(event) {
        this.isFocused = false;
        this.isSelected = false;
    }

    @HostListener("keydown", ["$event"])
    public onKeyDown(event: KeyboardEvent) {

        const visibleColumns = this.grid.visibleColumns;
        let ri = this.rowIndex;
        let ci = this.columnIndex;
        let rv;
        let target;

        if (event.key === "Enter" && this.column.editable) {
            this._inEditMode = !this._inEditMode;
            return;
        } else if (event.key === "Escape") {
            this._inEditMode = false;
            return;
        }

        switch (event.keyCode) {
            case 37:
                rv = visibleColumns.findIndex((col) => col.index === ci);
                if (rv > 0) {
                    ci = visibleColumns[rv - 1].index;
                }
                break;
            case 38:
                ri = this.rowIndex - 1;
                break;
            case 39:
                rv = visibleColumns.findIndex((col) => col.index === ci);
                if (rv > -1 && rv < visibleColumns.length) {
                    ci = visibleColumns[rv + 1].index;
                }
                break;
            case 40:
                ri = this.rowIndex + 1;
                break;
        }

        target = this.gridAPI.get_cell_by_index(this.gridID, ri, ci);
        if (target) {
            target.nativeElement.focus();
        }
    }
}
