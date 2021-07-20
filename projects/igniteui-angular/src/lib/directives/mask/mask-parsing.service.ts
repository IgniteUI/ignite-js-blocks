import { Injectable } from '@angular/core';

/** @hidden */
export const MASK_FLAGS = ['C', '&', 'a', 'A', '?', 'L', '9', '0', '#'];

/** @hidden */
export interface MaskOptions {
    format: string;
    promptChar: string;
}

/** @hidden */
export interface Replaced {
    value: string;
    end: number;
}

/** @hidden */
@Injectable({
    providedIn: 'root'
})
export class MaskParsingService {
    public applyMask(inputVal: string, maskOptions: MaskOptions): string {
        let outputVal = '';
        let value = '';
        const mask: string = maskOptions.format;
        const literals: Map<number, string> = this.getMaskLiterals(mask);
        const literalKeys: number[] = Array.from(literals.keys());
        const nonLiteralIndices: number[] = this.getNonLiteralIndices(mask, literalKeys);
        const literalValues: string[] = Array.from(literals.values());

        if (inputVal != null) {
            value = inputVal.toString();
        }

        for (const _maskSym of mask) {
            outputVal += maskOptions.promptChar;
        }

        literals.forEach((val: string, key: number) => {
            outputVal = this.replaceCharAt(outputVal, key, val);
        });

        if (!value) {
            return outputVal;
        }

        const nonLiteralValues: string[] = this.getNonLiteralValues(value, literalValues);

        for (let i = 0; i < nonLiteralValues.length; i++) {
            const char = nonLiteralValues[i];
            const isCharValid = this.validateCharOnPosition(char, nonLiteralIndices[i], mask);

            if (!isCharValid && char !== maskOptions.promptChar) {
                nonLiteralValues[i] = maskOptions.promptChar;
            }
        }

        if (nonLiteralValues.length > nonLiteralIndices.length) {
            nonLiteralValues.splice(nonLiteralIndices.length);
        }

        let pos = 0;
        for (const nonLiteralValue of nonLiteralValues) {
            const char = nonLiteralValue;
            outputVal = this.replaceCharAt(outputVal, nonLiteralIndices[pos++], char);
        }

        return outputVal;
    }

    public parseValueFromMask(maskedValue: string, maskOptions: MaskOptions): string {
        let outputVal = '';
        const mask: string = maskOptions.format;
        const literals: Map<number, string> = this.getMaskLiterals(mask);
        const literalValues: string[] = Array.from(literals.values());

        for (const val of maskedValue) {
            if (literalValues.indexOf(val) === -1) {
                if (val !== maskOptions.promptChar) {
                    outputVal += val;
                }
            }
        }

        return outputVal;
    }

    public replaceInMask(maskedValue: string, value: string, maskOptions: MaskOptions, start: number, end: number): Replaced {
        const literalsPositions: number[] = Array.from(this.getMaskLiterals(maskOptions.format).keys());
        value = this.replaceIMENumbers(value);
        const chars = Array.from(value);
        let cursor = start;
        end = Math.min(end, maskedValue.length);

        for (let i = start; i < end || (chars.length && i < maskedValue.length); i++) {
            if (literalsPositions.indexOf(i) !== -1) {
                if (chars[0] === maskedValue[i]) {
                    cursor = i + 1;
                    chars.shift();
                }
                continue;
            }
            if (chars[0]
                && !this.validateCharOnPosition(chars[0], i, maskOptions.format)
                && chars[0] !== maskOptions.promptChar) {
                break;
            }

            let char = maskOptions.promptChar;
            if (chars.length) {
                cursor = i + 1;
                char = chars.shift();
            }
            maskedValue = this.replaceCharAt(maskedValue, i, char);
        }

        return { value: maskedValue, end: cursor };
    }

    public replaceCharAt(strValue: string, index: number, char: string): string {
        if (strValue !== undefined) {
            return strValue.substring(0, index) + char + strValue.substring(index + 1);
        }
    }

    public getMaskLiterals(mask: string): Map<number, string> {
        const literals = new Map<number, string>();

        for (let i = 0; i < mask.length; i++) {
            const char = mask.charAt(i);
            if (MASK_FLAGS.indexOf(char) === -1) {
                literals.set(i, char);
            }
        }

        return literals;
    }

    /** Validates only non literal positions. */
    private validateCharOnPosition(inputChar: string, position: number, mask: string): boolean {
        let regex: RegExp;
        let isValid: boolean;
        const letterOrDigitRegEx = '[\\d\\u00C0-\\u1FFF\\u2C00-\\uD7FFa-zA-Z]';
        const letterDigitOrSpaceRegEx = '[\\d\\u00C0-\\u1FFF\\u2C00-\\uD7FFa-zA-Z\\u0020]';
        const letterRegEx = '[\\u00C0-\\u1FFF\\u2C00-\\uD7FFa-zA-Z]';
        const letterSpaceRegEx = '[\\u00C0-\\u1FFF\\u2C00-\\uD7FFa-zA-Z\\u0020]';
        const digitRegEx = '[\\d]';
        const digitSpaceRegEx = '[\\d\\u0020]';
        const digitSpecialRegEx = '[\\d-\\+]';

        switch (mask.charAt(position)) {
            case 'C':
                isValid = inputChar !== '';
                break;
            case '&':
                regex = new RegExp('[\\u0020]');
                isValid = !regex.test(inputChar);
                break;
            case 'a':
                regex = new RegExp(letterDigitOrSpaceRegEx);
                isValid = regex.test(inputChar);
                break;
            case 'A':
                regex = new RegExp(letterOrDigitRegEx);
                isValid = regex.test(inputChar);
                break;
            case '?':
                regex = new RegExp(letterSpaceRegEx);
                isValid = regex.test(inputChar);
                break;
            case 'L':
                regex = new RegExp(letterRegEx);
                isValid = regex.test(inputChar);
                break;
            case '0':
                regex = new RegExp(digitRegEx);
                isValid = regex.test(inputChar);
                break;
            case '9':
                regex = new RegExp(digitSpaceRegEx);
                isValid = regex.test(inputChar);
                break;
            case '#':
                regex = new RegExp(digitSpecialRegEx);
                isValid = regex.test(inputChar);
                break;
            default: {
                isValid = null;
            }
        }

        return isValid;
    }
    private getNonLiteralIndices(mask: string, literalKeys: number[]): number[] {
        const nonLiteralsIndices: number[] = new Array();

        for (let i = 0; i < mask.length; i++) {
            if (literalKeys.indexOf(i) === -1) {
                nonLiteralsIndices.push(i);
            }
        }

        return nonLiteralsIndices;
    }
    private getNonLiteralValues(value: string, literalValues: string[]): string[] {
        const nonLiteralValues: string[] = new Array();

        for (const val of value) {
            if (literalValues.indexOf(val) === -1) {
                nonLiteralValues.push(val);
            }
        }

        return nonLiteralValues;
    }

    private replaceIMENumbers(value: string): string {
        return value.replace(/[０１２３４５６７８９]/g, (num) => ({
            '１': '1', '２': '2', '３': '3', '４': '4', '５': '5',
            '６': '6', '７': '7', '８': '8', '９': '9', '０': '0'
        }[num]));
    }
}
