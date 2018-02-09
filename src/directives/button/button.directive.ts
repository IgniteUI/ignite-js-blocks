import { Directive, ElementRef, HostBinding, Input, NgModule, OnInit, Renderer2 } from "@angular/core";

@Directive({
    selector: "[igxButton]"
})
export class IgxButtonDirective {
    private _type = "flat";
    private _cssClass = "igx-button";
    private _color: string;
    private _label: string;
    private _backgroundColor: string;

    constructor(private _el: ElementRef, private _renderer: Renderer2) {}

    @HostBinding("attr.role") public role = "button";

    @Input("igxButton") set type(value: string) {
        this._type = value || this._type;
        this._renderer.addClass(this._el.nativeElement, `${this._cssClass}--${this._type}`);
    }

    @Input("igxButtonColor") set color(value: string) {
        this._color = value || this._el.nativeElement.style.color;
        this._renderer.setStyle(this._el.nativeElement, "color", this._color);
    }

    @Input("igxButtonBackground") set background(value: string) {
        this._backgroundColor = value || this._backgroundColor;
        this._renderer.setStyle(this._el.nativeElement, "background", this._backgroundColor);
    }

    @Input("igxLabel") set label(value: string) {
        this._label = value || this._label;
        this._renderer.setAttribute(this._el.nativeElement, `aria-label`, this._label);
    }

    @Input() set disabled(val) {
        val = !!val;
        if (val) {
            this._renderer.addClass(this._el.nativeElement, `${this._cssClass}--disabled`);
        } else {
            this._renderer.removeClass(this._el.nativeElement, `${this._cssClass}--disabled`);
        }
    }
}

@NgModule({
    declarations: [IgxButtonDirective],
    exports: [IgxButtonDirective]
})
export class IgxButtonModule {}
