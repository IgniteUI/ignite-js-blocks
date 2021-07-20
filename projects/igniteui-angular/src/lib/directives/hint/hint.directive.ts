import { Directive, HostBinding, Input, OnInit } from '@angular/core';

enum IgxHintPosition {
    START,
    END
}

@Directive({
    selector: 'igx-hint,[igxHint]'
})
export class IgxHintDirective implements OnInit {
    /**
     * Sets/gets whether the hint position is at the start.
     * Default value is `false`.
     * ```typescript
     * @ViewChild('hint', {read: IgxHintDirective})
     * public igxHint: IgxHintDirective;
     * this.igxHint.isPositionStart = true;
     * ```
     * ```typescript
     * let isHintPositionStart = this.igxHint.isPositionStart;
     * ```
     *
     * @memberof IgxHintDirective
     */
    @HostBinding('class.igx-input-group__hint-item--start')
    public isPositionStart = false;
    /**
     * Sets/gets whether the hint position is at the end.
     * Default value is `false`.
     * ```typescript
     * @ViewChild('hint', {read: IgxHintDirective})
     * public igxHint: IgxHintDirective;
     * this.igxHint.isPositionEnd = true;
     * ```
     * ```typescript
     * let isHintPositionEnd = this.igxHint.isPositionEnd;
     * ```
     *
     * @memberof IgxHintDirective
     */
    @HostBinding('class.igx-input-group__hint-item--end')
    public isPositionEnd = false;

    private _position: IgxHintPosition = IgxHintPosition.START;
    /**
     * Sets the position of the hint.
     * ```html
     * <igx-input-group>
     *  <input igxInput type="text"/>
     *  <igx-hint #hint [position]="'start'">IgxHint displayed at the start</igx-hint>
     * </igx-input-group>
     * ```
     *
     * @memberof IgxHintDirective
     */
    @Input('position')
    public set position(value: string) {
        const position: IgxHintPosition = (IgxHintPosition as any)[value.toUpperCase()];
        if (position !== undefined) {
            this._position = position;
            this._applyPosition(this._position);
        }
    }
    /**
     * Gets the position of the hint.
     * ```typescript
     * @ViewChild('hint', {read: IgxHintDirective})
     * public igxHint: IgxHintDirective;
     * let hintPosition =  this.igxHint.position;
     * ```
     *
     * @memberof IgxHintDirective
     */
    public get position() {
        return this._position.toString();
    }
    /**
     * @hidden
     */
    public ngOnInit() {
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
