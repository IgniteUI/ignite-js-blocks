import { AfterViewInit, Directive, ElementRef, HostBinding, Input, OnInit, Renderer2 } from "@angular/core";

enum IgxHintPosition {
    START = `start` as any,
    END = `end` as any
}

@Directive({
    selector: "igx-hint,[igxHint]"
})
export class IgxHintDirective implements OnInit {
    private _position: IgxHintPosition = IgxHintPosition.START;

    @HostBinding("class.igx-input-group__hint-item--start")
    public isPositionStart = false;

    @HostBinding("class.igx-input-group__hint-item--end")
    public isPositionEnd = false;

    @HostBinding("class.test")
    public test = false;

    constructor(private _element: ElementRef, private _renderer: Renderer2) {
    }

    @Input("position")
    set position(value: string) {
        const position: IgxHintPosition = (IgxHintPosition as any)[value];
        if (position !== undefined) {
            this._position = position;
            this._applyPosition(this._position);
        }
    }
    get position() {
        return this._position.toString();
    }

    ngOnInit() {
        this._applyPosition(this._position);
    }

    private _applyPosition(position: IgxHintPosition) {
        this.isPositionStart = this.isPositionEnd = false;
        switch (position) {
            case IgxHintPosition.START:
                this.isPositionStart = true;
                break;
            case IgxHintPosition.END:
                this.isPositionEnd = true;
                break;
            default: break;
        }
    }
}
