import { CommonModule } from '@angular/common';
import {
    Directive, ElementRef, EventEmitter, HostListener,
    Output, PipeTransform, Renderer2,
    Input, NgModule, OnInit, AfterViewChecked,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MaskParsingService, MaskOptions } from './mask-parsing.service';
import { IBaseEventArgs, PlatformUtil } from '../../core/utils';
import { noop } from 'rxjs';

@Directive({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxMaskDirective, multi: true }],
    selector: '[igxMask]',
    exportAs: 'igxMask'
})
export class IgxMaskDirective implements OnInit, AfterViewChecked, ControlValueAccessor {
    /**
     * Sets the input mask.
     * ```html
     * <input [igxMask] = "'00/00/0000'">
     * ```
     */
    @Input('igxMask')
    public get mask(): string {
        return this._mask || this.defaultMask;
    }

    public set mask(val: string) {
        // B.P. 9th June 2021 #7490
        if (val !== this._mask) {
            const cleanInputValue = this.maskParser.parseValueFromMask(this.inputValue, this.maskOptions);
            this.setPlaceholder(val);
            this._mask = val;
            this.updateInputValue(cleanInputValue);
        }
    }

    /**
     * Sets the character representing a fillable spot in the input mask.
     * Default value is "'_'".
     * ```html
     * <input [promptChar] = "'/'">
     * ```
     */
    @Input()
    public promptChar = '_';

    /**
     * Specifies if the bound value includes the formatting symbols.
     * ```html
     * <input [includeLiterals] = "true">
     * ```
     */
    @Input()
    public includeLiterals: boolean;

    /**
     * Specifies a pipe to be used on blur.
     * ```html
     * <input [displayValuePipe] = "displayFormatPipe">
     * ```
     */
    @Input()
    public displayValuePipe: PipeTransform;

    /**
     * Specifies a pipe to be used on focus.
     * ```html
     * <input [focusedValuePipe] = "inputFormatPipe">
     * ```
     */
    @Input()
    public focusedValuePipe: PipeTransform;

    /**
     * Emits an event each time the value changes.
     * Provides `rawValue: string` and `formattedValue: string` as event arguments.
     * ```html
     * <input (valueChanged) = "valueChanged(rawValue: string, formattedValue: string)">
     * ```
     */
    @Output()
    public valueChanged = new EventEmitter<IMaskEventArgs>();

    /** @hidden */
    public get nativeElement(): HTMLInputElement {
        return this.elementRef.nativeElement;
    }

    /** @hidden @internal; */
    protected get inputValue(): string {
        return this.nativeElement.value;
    }

    /** @hidden @internal */
    protected set inputValue(val: string) {
        this.nativeElement.value = val;
    }

    /** @hidden */
    protected get maskOptions(): MaskOptions {
        const format = this.mask || this.defaultMask;
        const promptChar = this.promptChar && this.promptChar.substring(0, 1);
        return { format, promptChar };
    }

    /** @hidden */
    protected get selectionStart(): number {
        // Edge(classic) and FF don't select text on drop
        return this.nativeElement.selectionStart === this.nativeElement.selectionEnd && this._hasDropAction ?
            this.nativeElement.selectionEnd - this._droppedData.length :
            this.nativeElement.selectionStart;
    }

    /** @hidden */
    protected get selectionEnd(): number {
        return this.nativeElement.selectionEnd;
    }

    /** @hidden */
    protected get start(): number {
        return this._start;
    }

    /** @hidden */
    protected get end(): number {
        return this._end;
    }

    protected _composing: boolean;
    protected _compositionStartIndex: number;
    private _compositionValue: string;
    private _end = 0;
    private _start = 0;
    private _key: string;
    private _mask: string;
    private _oldText = '';
    private _dataValue = '';
    private _focused = false;
    private _droppedData: string;
    private _hasDropAction: boolean;
    private _stopPropagation: boolean;

    private readonly defaultMask = 'CCCCCCCCCC';

    private _onTouchedCallback: () => void = noop;
    private _onChangeCallback: (_: any) => void = noop;

    constructor(
        protected elementRef: ElementRef<HTMLInputElement>,
        protected maskParser: MaskParsingService,
        protected renderer: Renderer2,
        protected platform: PlatformUtil) { }

    /** @hidden */
    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent): void {
        const key = event.key;
        if (!key) {
            return;
        }

        if (this.platform.isIE && this._stopPropagation) {
            this._stopPropagation = false;
        }

        if ((event.ctrlKey && (key === this.platform.KEYMAP.Z || key === this.platform.KEYMAP.Y))) {
            event.preventDefault();
        }

        this._key = key;
        this._start = this.selectionStart;
        this._end = this.selectionEnd;
    }

    /** @hidden @internal */
    @HostListener('compositionstart')
    public onCompositionStart(): void {
        if (!this._composing) {
            this._compositionStartIndex = this._start;
            this._composing = true;
        }
    }

    /** @hidden @internal */
    @HostListener('compositionend')
    public onCompositionEnd(): void {
        this._start = this._compositionStartIndex;
        const end = this.selectionEnd;
        const valueToParse = this.inputValue.substring(this._start, end);
        this.updateInput(valueToParse);
        this._end = this.selectionEnd;
        this._compositionValue = this.inputValue;
    }

    /** @hidden @internal */
    @HostListener('input', ['$event'])
    public onInputChanged(event): void {
        /**
         * '!this._focused' is a fix for #8165
         * On page load IE triggers input events before focus events and
         * it does so for every single input on the page.
         * The mask needs to be prevented from doing anything while this is happening because
         * the end user will be unable to blur the input.
         * https://stackoverflow.com/questions/21406138/input-event-triggered-on-internet-explorer-when-placeholder-changed
         */

        if (this._composing) {
            if (this.inputValue.length < this._oldText.length) {
                // software keyboard input delete
                this._key = this.platform.KEYMAP.BACKSPACE;
            }
            return;
        }

        // After the compositionend event Chromium triggers input events of type 'deleteContentBackward' and
        // we need to adjust the start and end indexes to include mask literals
        if (event.inputType === 'deleteContentBackward' && this._key !== this.platform.KEYMAP.BACKSPACE) {
                const isInputComplete = this._compositionStartIndex === 0 && this._end === this.mask.length;
                let numberOfMaskLiterals = 0;
                const literalPos = this.maskParser.getMaskLiterals(this.maskOptions.format).keys();
                for (const index of literalPos) {
                    if (index >= this._compositionStartIndex && index <= this._end) {
                        numberOfMaskLiterals++;
                    }
                }
                this.inputValue = isInputComplete?
                this.inputValue.substring(0, this.selectionEnd - numberOfMaskLiterals) + this.inputValue.substring(this.selectionEnd)
                : this._compositionValue.substring(0, this._compositionStartIndex);

                this._start = this.selectionStart;
                this._end = this.selectionEnd;
                this.nativeElement.selectionStart = isInputComplete ? this._start - numberOfMaskLiterals : this._compositionStartIndex;
                this.nativeElement.selectionEnd = this._end - numberOfMaskLiterals;
                this.nativeElement.selectionEnd = this._end;
                this._start = this.selectionStart;
                this._end = this.selectionEnd;
        }

        if (this.platform.isIE && (this._stopPropagation || !this._focused)) {
            this._stopPropagation = false;
            return;
        }

        if (this._hasDropAction) {
            this._start = this.selectionStart;
        }

        let valueToParse = '';
        switch (this._key) {
            case this.platform.KEYMAP.DELETE:
                this._end = this._start === this._end ? ++this._end : this._end;
                break;
            case this.platform.KEYMAP.BACKSPACE:
                this._start = this.selectionStart;
                break;
            default:
                valueToParse = this.inputValue.substring(this._start, this.selectionEnd);
                break;
        }

        this.updateInput(valueToParse);
    }

    /** @hidden */
    @HostListener('paste')
    public onPaste(): void {
        this._oldText = this.inputValue;
        this._start = this.selectionStart;
    }

    /** @hidden */
    @HostListener('focus')
    public onFocus(): void {
        if (this.nativeElement.readOnly) {
            return;
        }
        this._focused = true;
        this.showMask(this.inputValue);
    }

    /** @hidden */
    @HostListener('blur', ['$event.target.value'])
    public onBlur(value: string): void {
        this._focused = false;
        this.showDisplayValue(value);
        this._onTouchedCallback();
    }

    /** @hidden */
    @HostListener('dragenter')
    public onDragEnter(): void {
        if (!this._focused) {
            this.showMask(this._dataValue);
        }
    }

    /** @hidden */
    @HostListener('dragleave')
    public onDragLeave(): void {
        if (!this._focused) {
            this.showDisplayValue(this.inputValue);
        }
    }

    /** @hidden */
    @HostListener('drop', ['$event'])
    public onDrop(event: DragEvent): void {
        this._hasDropAction = true;
        this._droppedData = event.dataTransfer.getData('text');
    }

    /** @hidden */
    public ngOnInit(): void {
        this.setPlaceholder(this.maskOptions.format);
    }

    /**
     * TODO: Remove after date/time picker integration refactor
     *
     * @hidden
     */
    public ngAfterViewChecked(): void {
        if (this._composing) {
            return;
        }
        this._oldText = this.inputValue;
    }

    /** @hidden */
    public writeValue(value: string): void {
        if (this.promptChar && this.promptChar.length > 1) {
            this.maskOptions.promptChar = this.promptChar.substring(0, 1);
        }

        this.inputValue = value ? this.maskParser.applyMask(value, this.maskOptions) : '';
        if (this.displayValuePipe) {
            this.inputValue = this.displayValuePipe.transform(this.inputValue);
        }

        this._dataValue = this.includeLiterals ? this.inputValue : value;

        this.valueChanged.emit({ rawValue: value, formattedValue: this.inputValue });
    }

    /** @hidden */
    public registerOnChange(fn: (_: any) => void): void {
        this._onChangeCallback = fn;
    }

    /** @hidden */
    public registerOnTouched(fn: () => void): void {
        this._onTouchedCallback = fn;
    }

    /** @hidden */
    protected showMask(value: string): void {
        if (this.focusedValuePipe) {
            if (this.platform.isIE) {
                this._stopPropagation = true;
            }
            // TODO(D.P.): focusedValuePipe should be deprecated or force-checked to match mask format
            this.inputValue = this.focusedValuePipe.transform(value);
        } else {
            this.inputValue = this.maskParser.applyMask(value, this.maskOptions);
        }

        this._oldText = this.inputValue;
    }

    /** @hidden */
    protected setSelectionRange(start: number, end: number = start): void {
        this.nativeElement.setSelectionRange(start, end);
    }

    /** @hidden */
    protected afterInput(): void {
        this._oldText = this.inputValue;
        this._hasDropAction = false;
        this._start = 0;
        this._end = 0;
        this._key = null;
        this._composing = false;
    }

    /** @hidden */
    protected setPlaceholder(value: string): void {
        const placeholder = this.nativeElement.placeholder;
        if (!placeholder || placeholder === this.mask) {
            this.renderer.setAttribute(this.nativeElement, 'placeholder', value || this.defaultMask);
        }
    }

    private updateInputValue(value: string) {
        if (this._focused) {
            this.showMask(value);
        } else if (!this.displayValuePipe) {
            this.inputValue = this.inputValue ? this.maskParser.applyMask(value, this.maskOptions) : '';
        }
    }

    private updateInput(valueToParse: string) {
        const replacedData = this.maskParser.replaceInMask(this._oldText, valueToParse, this.maskOptions, this._start, this._end);
        this.inputValue = replacedData.value;
        if (this._key === this.platform.KEYMAP.BACKSPACE) {
            replacedData.end = this._start;
        };

        this.setSelectionRange(replacedData.end);

        const rawVal = this.maskParser.parseValueFromMask(this.inputValue, this.maskOptions);
        this._dataValue = this.includeLiterals ? this.inputValue : rawVal;
        this._onChangeCallback(this._dataValue);

        this.valueChanged.emit({ rawValue: rawVal, formattedValue: this.inputValue });
        this.afterInput();
    }

    private showDisplayValue(value: string) {
        if (this.displayValuePipe) {
            this.inputValue = this.displayValuePipe.transform(value);
        } else if (value === this.maskParser.applyMask(null, this.maskOptions)) {
            this.inputValue = '';
        }
    }
}

/**
 * The IgxMaskModule provides the {@link IgxMaskDirective} inside your application.
 */
export interface IMaskEventArgs extends IBaseEventArgs {
    rawValue: string;
    formattedValue: string;
}

/** @hidden */
@NgModule({
    declarations: [IgxMaskDirective],
    exports: [IgxMaskDirective],
    imports: [CommonModule]
})
export class IgxMaskModule { }
