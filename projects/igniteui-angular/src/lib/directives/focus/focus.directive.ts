import { Directive, ElementRef, Input, NgModule, Optional, Inject, Self } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditorProvider } from '../../core/edit-provider';

@Directive({
    exportAs: 'igxFocus',
    selector: '[igxFocus]'
})
export class IgxFocusDirective {

    private focusState = true;
    /**
     * Returns the state of the igxFocus.
     * ```typescript
     * @ViewChild('focusContainer', {read: IgxFocusDirective})
     * public igxFocus: IgxFocusDirective;
     * let isFocusOn = this.igxFocus.focused;
     * ```
     *
     * @memberof IgxFocusDirective
     */
    @Input('igxFocus')
    public get focused(): boolean {
        return this.focusState;
    }
    /**
     * Sets the state of the igxFocus.
     * ```html
     * <igx-input-group >
     *  <input #focusContainer igxInput [igxFocus]="true"/>
     * </igx-input-group>
     * ```
     *
     * @memberof IgxFocusDirective
     */
    public set focused(val: boolean) {
        this.focusState = val;
        this.trigger();
    }
    /**
     * Gets the native element of the igxFocus.
     * ```typescript
     * @ViewChild('focusContainer', {read: IgxFocusDirective})
     * public igxFocus: IgxFocusDirective;
     * let igxFocusNativeElement = this.igxFocus.nativeElement;
     * ```
     *
     * @memberof IgxFocusDirective
     */
    public get nativeElement() {
        if (this.comp && this.comp[0] && this.comp[0].getEditElement) {
            return (this.comp[0] as EditorProvider).getEditElement();
        }
        return this.element.nativeElement;
    }

    constructor(private element: ElementRef, @Inject(NG_VALUE_ACCESSOR) @Self() @Optional() private comp?: any[]) { }
    /**
     * Triggers the igxFocus state.
     * ```typescript
     * @ViewChild('focusContainer', {read: IgxFocusDirective})
     * public igxFocus: IgxFocusDirective;
     * this.igxFocus.trigger();
     * ```
     *
     * @memberof IgxFocusDirective
     */
    public trigger() {
        if (this.focusState) {
            requestAnimationFrame(() => this.nativeElement.focus({ preventScroll: true}));
        }
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxFocusDirective],
    exports: [IgxFocusDirective]
})
export class IgxFocusModule { }
