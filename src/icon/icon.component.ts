import { CommonModule } from "@angular/common";
import { Component, ElementRef, Input, NgModule, ViewChild } from "@angular/core";

@Component({
    selector: "igx-icon",
    styleUrls: ["./icon.component.scss"],
    templateUrl: "icon.component.html"
})

export class IgxIconComponent {
    @ViewChild("icon") public themeIcon: ElementRef;

    private font = "material";
    private active = "true";
    private iconColor: string;
    private iconName: string;

    constructor(public el: ElementRef) { }

    @Input("fontSet") set fontSet(value: string) {
        this.font = value || this.font;
    }

    @Input("isActive") set isActive(value: string) {
        this.active = value || this.active;
    }

    @Input("color") set color(value: string) {
        this.iconColor = value;
        this.el.nativeElement.style.color = this.iconColor;
    }

    @Input("name") set name(value: string) {
        this.iconName = value;
    }

    get getFontSet(): string {
        return this.font;
    }

    get getActive(): boolean {
        if (this.active.toLowerCase() === "true") {
            return true;
        } else if (this.active.toLowerCase() === "false") {
            return false;
        }
    }

    get getIconColor(): string {
        return this.iconColor;
    }

    get getIconName(): string {
        return this.iconName;
    }
}

@NgModule({
    declarations: [IgxIconComponent],
    exports: [IgxIconComponent],
    imports: [CommonModule]
})
export class IgxIconModule { }
