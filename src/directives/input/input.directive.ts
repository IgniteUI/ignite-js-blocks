import {CommonModule} from "@angular/common";
import {
    AfterViewInit,
    Directive,
    DoCheck,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Inject,
    NgModule,
    OnDestroy,
    OnInit,
    Optional,
    Renderer2,
    Self
} from "@angular/core";
import { FormGroup, FormsModule, NgControl, NgModel } from "@angular/forms";

import { Subscription } from "rxjs/Subscription";
import { IgxInputGroupComponent, IgxInputGroupState } from "../../main";

@Directive({
    selector: "[igxInput]"
})
export class IgxInputDirective implements AfterViewInit, OnDestroy {
    private _statusChanges$: Subscription;

    constructor(
        @Inject(forwardRef(() => IgxInputGroupComponent))
        public inputGroup: IgxInputGroupComponent,
        @Optional() @Self() @Inject(NgModel) protected ngModel: NgModel,
        protected element: ElementRef,
        private _renderer: Renderer2) { }

    @HostBinding("class.igx-input-group__input")
    public isInput = false;

    @HostBinding("class.igx-input-group__textarea")
    public isTextArea = false;

    @HostListener("focus", ["$event"])
    public onFocus(event) {
        this.inputGroup.isFocused = true;
    }

    @HostListener("blur", ["$event"])
    public onBlur(event) {
        this.inputGroup.isFocused = false;
        if (this.ngModel) {
            this.inputGroup.valid = IgxInputGroupState.INITIAL;
            if (!this.ngModel.valid && this.ngModel.touched) {
                this.inputGroup.valid = IgxInputGroupState.INVALID;
            }
        }
    }

    @HostListener("input", ["$event"])
    public onInput(event) {
        const value: string = this.element.nativeElement.value;
        this.inputGroup.isFilled = value && value.length > 0;
    }

    ngAfterViewInit() {
        if (this.element.nativeElement.placeholder) {
            this.inputGroup.hasPlaceholder = true;
        }

        if (this.element.nativeElement.required) {
            this.inputGroup.isRequired = true;
        }

        if (this.element.nativeElement.disabled) {
            this.inputGroup.isDisabled = true;
        }

        if ((this.element.nativeElement.value && this.element.nativeElement.value.length > 0) ||
            (this.ngModel && this.ngModel.model && this.ngModel.model.length > 0)) {
            this.inputGroup.isFilled = true;
        }

        const elTag = this.element.nativeElement.tagName.toLowerCase();
        if (elTag === "textarea") {
            this.isTextArea = true;
        } else {
            this.isInput = true;
        }

        if (this.ngModel) {
            this._statusChanges$ = this.ngModel.statusChanges.subscribe(this.onStatusChanged.bind(this));
        }
    }

    ngOnDestroy() {
        if (this._statusChanges$) {
            this._statusChanges$.unsubscribe();
        }
    }

    protected onStatusChanged(status: string) {
        if (!this.ngModel.control.pristine && (this.ngModel.validator || this.ngModel.asyncValidator)) {
            this.inputGroup.valid = this.ngModel.valid ? IgxInputGroupState.VALID : IgxInputGroupState.INVALID;
        }
    }

    get isDisabled() {
        return this.element.nativeElement.disabled;
    }

    get isRequired() {
        return  this.element.nativeElement.required;
    }

    get hasPlaceholder() {
        return this.element.nativeElement.placeholder;
    }

    public focus() {
        this.element.nativeElement.focus();
    }
}
