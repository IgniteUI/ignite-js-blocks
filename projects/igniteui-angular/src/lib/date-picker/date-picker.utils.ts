/**
 * This enumeration is used to configure whether the date picker has an editable input
 * or is readonly - the date is selected only through a popup calendar.
 */
export enum DatePickerInteractionMode {
    EDITABLE = 'editable',
    READONLY = 'readonly'
}

/**
 *@hidden
 */
export const enum PREDEFINED_FORMAT_OPTIONS {
    SHORT_DATE = 'shortDate',
    MEDIUM_DATE = 'mediumDate',
    LONG_DATE = 'longDate',
    FULL_DATE = 'fullDate'
}

/**
 *@hidden
 */
export const enum PREDEFINED_FORMATS {
    SHORT_DATE_FORMAT = 'M/d/yy',
    MEDIUM_DATE_FORMAT = 'MMM d, y',
    LONG_DATE_FORMAT = 'MMMM d, y',
    FULL_DATE_FORMAT = 'EEEE, MMMM d, y'
}

/**
 *@hidden
 */
export const enum PREDEFINED_MASKS {
    SHORT_DATE_MASK = '00/00/00',
    MEDIUM_DATE_MASK = 'LLL 00, 0000',
    LONG_DATE_MASK = 'LLLLLLLLL 00, 0000', // longest month - sep - 9 chars
    FULL_DATE_MASK = 'LLLLLLLLL, LLLLLLLLL 00, 0000' // longest month - sep - 9 characters, longest week day - wed - 9 chars
}

/**
 *@hidden
 */
export const enum FORMAT_DESC {
    NUMERIC = 'numeric',
    TWO_DIGITS = 'twoDigits',
    SHORT = 'short',
    LONG = 'long',
    // NARROW = 'narrow' //not supported, return the same first letters for June/July, Thursday/Tuesday
}

/**
 *@hidden
 */
export const enum DATE_CHARS {
    YEAR_CHAR = 'y',
    MONTH_CHAR = 'M',
    DAY_CHAR = 'd',
    WEEKDAY_CHAR = 'E'
}

/**
 *@hidden
 */
export const enum DATE_PARTS {
    DAY = 'day',
    MONTH = 'month',
    YEAR = 'year',
    WEEKDAY = 'weekday'
}

/**
 *@hidden
 */
export const MAX_MONTH_SYMBOLS = 9;
/**
 *@hidden
 */
export const MAX_WEEKDAY_SYMBOLS = 9;
/**
 *@hidden
 */
export const SEPARATOR = 'separator';
/**
 *@hidden
 */
export const DEFAULT_LOCALE_DATE = 'en';

/**
 *@hidden
 */
export const SPIN_DELTA = 1;

/**
 *@hidden
 */
export const NUMBER_OF_MONTHS = 12;

/**
 *@hidden
 */
export const PROMPT_CHAR = '_';

export interface IFormatViews {
    day?: boolean;
    month?: boolean;
    year?: boolean;
}

export interface IFormatOptions {
    day?: string;
    month?: string;
    weekday?: string;
    year?: string;
}

export const MONTHS_NAMES_ARRAY = [
    { long: 'January', short: 'Jan' },
    { long: 'February', short: 'Feb' },
    { long: 'March', short: 'Mar' },
    { long: 'April', short: 'Apr' },
    { long: 'May', short: 'May' },
    { long: 'June', short: 'Jun' },
    { long: 'July', short: 'Jul' },
    { long: 'August', short: 'Aug' },
    { long: 'September', short: 'Sep' },
    { long: 'October', short: 'Oct' },
    { long: 'November', short: 'Nov' },
    { long: 'December', short: 'Dec' }
];

export const WEEKDAYS_NAMES_ARRAY = [
    { long: 'Monday', short: 'Mon' },
    { long: 'Tuesday', short: 'Tue' },
    { long: 'Wednesday', short: 'Wed' },
    { long: 'Thursday', short: 'Thu' },
    { long: 'Friday', short: 'Fri' },
    { long: 'Saturday', short: 'Sat' },
    { long: 'Sunday', short: 'Sun' }
];

/**
 *@hidden
 */
export function getYearFormatType(format: string): string {
    const occurences = format.match(new RegExp(DATE_CHARS.YEAR_CHAR, 'g')).length;
    switch (occurences) {
        case 1: {
            // y (2020)
            return FORMAT_DESC.NUMERIC;
        }
        case 4: {
            // yyyy (2020)
            return FORMAT_DESC.NUMERIC;
        }
        case 2: {
            // yy (20)
            return FORMAT_DESC.TWO_DIGITS;
        }
    }
}

/**
 *@hidden
 */
export function getMonthFormatType(format: string): string {
    const occurences = format.match(new RegExp(DATE_CHARS.MONTH_CHAR, 'g')).length;
    switch (occurences) {
        case 1: {
            // M
            return FORMAT_DESC.NUMERIC;
        }
        case 2: {
            // MM
            return FORMAT_DESC.TWO_DIGITS;
        }
        case 3: {
            // MMM
            return FORMAT_DESC.SHORT;
        }
        case 4: {
            // MMMM
            return FORMAT_DESC.LONG;
        }
    }
}

/**
 *@hidden
 */
export function getDayFormatType(format: string): string {
    const occurences = format.match(new RegExp(DATE_CHARS.DAY_CHAR, 'g')).length;
    switch (occurences) {
        case 1: {
            // d
            return FORMAT_DESC.NUMERIC;
        }
        case 2: {
            // dd
            return FORMAT_DESC.TWO_DIGITS;
        }
    }
}

/**
 *@hidden
 */
export function getWeekDayFormatType(format: string): string {
    const occurences = format.match(new RegExp(DATE_CHARS.WEEKDAY_CHAR, 'g')).length;
    switch (occurences) {
        case 3: {
            // EEE (Tue)
            return FORMAT_DESC.SHORT;
        }
        case 4: {
            // EEEE (Tuesday)
            return FORMAT_DESC.LONG;
        }
    }
}

/**
 *@hidden
 */
export function parseDateFormat(format: string): any[] {
    const dateStruct = [];
    const maskArray = Array.from(format);
    const weekdayInitPosition = format.indexOf(DATE_CHARS.WEEKDAY_CHAR);
    const monthInitPosition = format.indexOf(DATE_CHARS.MONTH_CHAR);
    const dayInitPosition = format.indexOf(DATE_CHARS.DAY_CHAR);
    const yearInitPosition = format.indexOf(DATE_CHARS.YEAR_CHAR);

    if (yearInitPosition !== -1) {
        dateStruct.push({
            type: DATE_PARTS.YEAR,
            initialPosition: yearInitPosition,
            formatType: getYearFormatType(format)
        });
    }

    if (weekdayInitPosition !== -1) {
        dateStruct.push({
            type: DATE_PARTS.WEEKDAY,
            initialPosition: weekdayInitPosition,
            formatType: getWeekDayFormatType(format)
        });
    }

    if (monthInitPosition !== -1) {
        dateStruct.push({
            type: DATE_PARTS.MONTH,
            initialPosition: monthInitPosition,
            formatType: getMonthFormatType(format)
        });
    }

    if (dayInitPosition !== -1) {
        dateStruct.push({
            type: DATE_PARTS.DAY,
            initialPosition: dayInitPosition,
            formatType: getDayFormatType(format)
        });
    }

    for (let i = 0; i < maskArray.length; i++) {
        if (!isSpecialSymbol(maskArray[i])) {
            dateStruct.push({
                type: SEPARATOR,
                initialPosition: i,
                value: maskArray[i]
            });
        }
    }

    dateStruct.sort((a, b) => a.initialPosition - b.initialPosition);
    fillDatePartsPositions(dateStruct);

    return dateStruct;
}

/**
 *@hidden
 */
export function isSpecialSymbol(char: string): boolean {
    return (char !== DATE_CHARS.YEAR_CHAR
        && char !== DATE_CHARS.MONTH_CHAR
        && char !== DATE_CHARS.DAY_CHAR
        && char !== DATE_CHARS.WEEKDAY_CHAR) ? false : true;
}

/**
 *@hidden
 */
export function getFormatMask(format: string): string {
    const mask = [];
    const dateStruct = parseDateFormat(format);

    for (let i = 0; i < dateStruct.length; i++) {
        if (dateStruct[i].type === DATE_PARTS.DAY) {
            mask.push('00');
        }
        if (dateStruct[i].type === DATE_PARTS.MONTH) {
            switch (dateStruct[i].formatType) {
                case FORMAT_DESC.SHORT: {
                    mask.push('LLL');
                    break;
                }
                case FORMAT_DESC.LONG: {
                    mask.push('LLLLLLLLL');
                    break;
                }
                default: {
                    // M && MM
                    mask.push('00');
                    break;
                }
            }
        }
        if (dateStruct[i].type === DATE_PARTS.YEAR) {
            switch (dateStruct[i].formatType) {
                case FORMAT_DESC.NUMERIC: {
                    mask.push('0000');
                    break;
                }
                case FORMAT_DESC.TWO_DIGITS: {
                    mask.push('00');
                    break;
                }
            }
        }
        if (dateStruct[i].type === DATE_PARTS.WEEKDAY) {
            switch (dateStruct[i].formatType) {
                case FORMAT_DESC.SHORT: {
                    mask.push('LLL');
                    break;
                }
                case FORMAT_DESC.LONG: {
                    mask.push('LLLLLLLLL');
                    break;
                }
            }
        }
        if (dateStruct[i].type === SEPARATOR) {
            mask.push(dateStruct[i].value);
        }
    }

    return mask.join('');
}

/**
 *@hidden
 */
export function createDate(day: number, month: number, year: number): Date {
    const date = new Date();
    date.setDate(day);
    date.setMonth(month);
    date.setFullYear(year);
    return date;
}

/**
 *@hidden
 */
export function trimMaskSymbols(mask: string): string {
    return mask.replace(/0|L/g, PROMPT_CHAR);
}

/**
 *@hidden
 */
export function trimUnderlines(value: string): string {
    return value.replace(/_/g, '');
}

/**
 *@hidden
 */
export function getLongMonthName(value: Date): string {
    return value.toLocaleString('en', {
        month: 'long'
    });
}

/**
 *@hidden
 */
export function getLongDayName(value: Date): string {
    return value.toLocaleString('en', {
        weekday: 'long'
    });
}

/**
 *@hidden
 */
export function getNumericFormatPrefix(formatType: string): string {
    switch (formatType) {
        case FORMAT_DESC.TWO_DIGITS: {
            return '0';
        }
        case FORMAT_DESC.NUMERIC: {
            return PROMPT_CHAR;
        }
    }
}

/**
 *@hidden
 */
export function getSpinnedDateInput(dateFormatParts: any[],
    inputValue: string,
    position: number,
    delta: number,
    isSpinLoop: boolean): string {
    const spinnedDatePart = getDatePartOnPosition(dateFormatParts, position);
    const datePartType = spinnedDatePart.type;
    const datePartFormatType = spinnedDatePart.formatType;
    let newValue;
    switch (datePartFormatType) {
        case FORMAT_DESC.LONG:
        case FORMAT_DESC.SHORT: {
            if (datePartType === DATE_PARTS.MONTH) {
                newValue = getMonthIndexByName(dateFormatParts, inputValue) - 1;
            }

            if (datePartType === DATE_PARTS.WEEKDAY) {
                newValue = getDayIndexByName(dateFormatParts, inputValue);
            }
            break;
        }
        default: {
            const datePartValue = getDateValueFromInput(dateFormatParts, datePartType, inputValue);
            newValue = parseInt(datePartValue, 10);
            break;
        }
    }

    let maxValue, minValue;
    if (!isNaN(newValue)) {
        const minMax = getMinMaxValue(dateFormatParts, spinnedDatePart, inputValue);
        minValue = minMax[0];
        maxValue = minMax[1];
    }

    let tempValue = newValue;
    tempValue += delta;

    // Infinite loop for full years
    if (maxValue === 'infinite' && minValue === 'infinite') {
        newValue = tempValue;
    }

    if (isSpinLoop) {
        if (tempValue > maxValue) {
            tempValue = minValue;
        }
        if (tempValue < minValue) {
            tempValue = maxValue;
        }
        newValue = tempValue;
    } else {
        if (tempValue <= maxValue && tempValue >= minValue) {
            newValue = tempValue;
        }
    }

    const startIdx = spinnedDatePart.position[0];
    const endIdx = spinnedDatePart.position[1];
    const start = inputValue.slice(0, startIdx);
    const end = inputValue.slice(endIdx, inputValue.length);
    let changedPart: string;

    switch (datePartFormatType) {
        case FORMAT_DESC.LONG:
        case FORMAT_DESC.SHORT: {
            // Named months
            if (datePartType === DATE_PARTS.MONTH) {
                const monthName = getMonthNameByIndex(dateFormatParts, newValue);
                let suffix = '';
                const promptCharToAdd = (datePartFormatType === FORMAT_DESC.LONG) ? (MAX_MONTH_SYMBOLS - monthName.length) : 3;
                for (let i = 0; i < promptCharToAdd; i++) {
                    suffix += PROMPT_CHAR;
                }
                changedPart = (monthName.length < promptCharToAdd) ? `${monthName}${suffix}` : `${monthName}`;
            }

            if (datePartType === DATE_PARTS.WEEKDAY) {
                const dayName = geDayNameByIndex(dateFormatParts, newValue);
                let suffix = '';
                const promptCharToAdd = (datePartFormatType === FORMAT_DESC.LONG) ? (MAX_WEEKDAY_SYMBOLS - dayName.length) : 3;
                for (let i = 0; i < promptCharToAdd; i++) {
                    suffix += PROMPT_CHAR;
                }
                changedPart = (dayName.length < promptCharToAdd) ? `${dayName}${suffix}` : `${dayName}`;
            }

            break;
        }
        default: {
            // Numeric data
            // Handling leading zero format
            const prefix = getNumericFormatPrefix(datePartFormatType);
            changedPart = (newValue < 10) ? `${prefix}${newValue}` : `${newValue}`;
            break;
        }
    }

    return `${start}${changedPart}${end}`;
}

/**
 *@hidden
 */
export function getMinMaxValue(dateFormatParts: any[], spinnedDatePart, inputValue: string): any[] {
    let maxValue, minValue;
    switch (spinnedDatePart.type) {
        case DATE_PARTS.MONTH: {
            // Max 12 months
            if (spinnedDatePart.formatType === FORMAT_DESC.LONG || spinnedDatePart.formatType === FORMAT_DESC.SHORT) {
                minValue = 0;
                maxValue = NUMBER_OF_MONTHS - 1;
            } else {
                minValue = 1;
                maxValue = NUMBER_OF_MONTHS;
            }
            break;
        }
        case DATE_PARTS.DAY: {
            minValue = 1;
            maxValue = daysInMonth(
                getFullYearFromString(getDateFormatPart(dateFormatParts, DATE_PARTS.YEAR), inputValue),
                getMonthIndexByName(dateFormatParts, inputValue));
            break;
        }
        case DATE_PARTS.YEAR: {
            if (spinnedDatePart.formatType === FORMAT_DESC.TWO_DIGITS) {
                minValue = 0;
                maxValue = 99;
            } else {
                // Infinite loop
                minValue = 'infinite';
                maxValue = 'infinite';
            }
            break;
        }
        case DATE_PARTS.WEEKDAY: {
            minValue = 0;
            maxValue = 6;
            break;
        }
    }
    return [minValue, maxValue];
}


/**
 *@hidden
 */
export function daysInMonth(fullYear: number, month: number): number {
    return new Date(fullYear, month, 0).getDate();
}

/**
 *@hidden
 */
export function addPromptCharsEditMode(dateFormatParts: any[], date: Date, inputValue: string): string {
    let offset = 0;
    const dateArray = Array.from(inputValue);
    const monthName = getLongMonthName(date);
    const dayName = getLongDayName(date);

    for (let i = 0; i < dateFormatParts.length; i++) {
        if (dateFormatParts[i].type === DATE_PARTS.WEEKDAY) {
            if (dateFormatParts[i].formatType === FORMAT_DESC.LONG) {
                offset += MAX_WEEKDAY_SYMBOLS - 4;
                for (let j = dayName.length; j < MAX_WEEKDAY_SYMBOLS; j++) {
                    dateArray.splice(j, 0, PROMPT_CHAR);
                }
                dateArray.join('');
            }
        }

        if (dateFormatParts[i].type === DATE_PARTS.MONTH) {
            if (dateFormatParts[i].formatType === FORMAT_DESC.LONG) {
                const startPos = offset + dateFormatParts[i].initialPosition + monthName.length;
                const endPos = startPos + MAX_MONTH_SYMBOLS - monthName.length;
                offset += MAX_MONTH_SYMBOLS - 4;
                for (let j = startPos; j < endPos; j++) {
                    dateArray.splice(j, 0, PROMPT_CHAR);
                }
                dateArray.join('');
            }
            if (dateFormatParts[i].formatType === FORMAT_DESC.NUMERIC) {
                if (date.getMonth() + 1 < 10) {
                    const startPos = offset + dateFormatParts[i].initialPosition;
                    dateArray.splice(startPos, 0, PROMPT_CHAR);
                }
                offset += 1;
                dateArray.join('');
            }
        }

        if (dateFormatParts[i].type === DATE_PARTS.DAY) {
            if (dateFormatParts[i].formatType === FORMAT_DESC.NUMERIC) {
                if (date.getDate() < 10) {
                    const startPos = offset + dateFormatParts[i].initialPosition;
                    dateArray.splice(startPos, 0, PROMPT_CHAR);
                }
                offset += 1;
                dateArray.join('');
            }
        }

    }

    return dateArray.join('');
}

/**
 *@hidden
 */
export function getDateValueFromInput(dateFormatParts: any[], type: string, inputValue: string, trim: boolean = true): string {
    const partPosition = getDateFormatPart(dateFormatParts, type).position;
    const result = inputValue.substring(partPosition[0], partPosition[1]);
    return (trim) ? trimUnderlines(result) : result;
}

/**
 *@hidden
 */
export function getDateFormatPart(dateFormatParts: any[], type: string): any {
    return dateFormatParts.filter((datePart) => (datePart.type === type))[0];
}

/**
 *@hidden
 */
export function getMonthIndexByName(dateFormatParts: any[], inputValue: string): number {
    let monthIndex = -1;
    const formatType = getDateFormatPart(dateFormatParts, DATE_PARTS.MONTH).formatType;
    const value = getDateValueFromInput(dateFormatParts, DATE_PARTS.MONTH, inputValue);
    switch (formatType) {
        case FORMAT_DESC.NUMERIC:
        case FORMAT_DESC.TWO_DIGITS: {
            monthIndex = Number(value);
            break;
        }
        case FORMAT_DESC.SHORT: {
            const index = MONTHS_NAMES_ARRAY.findIndex((month) => month.short.toLowerCase() === value.toLowerCase());
            monthIndex = (index > -1) ? index + 1 : -1;
            break;
        }
        case FORMAT_DESC.LONG: {
            const index = MONTHS_NAMES_ARRAY.findIndex((month) => month.long.toLowerCase() === value.toLowerCase());
            monthIndex = (index > -1) ? index + 1 : -1;
            break;
        }
    }
    return monthIndex;
}

/**
 *@hidden
 */
export function findMonthByName(formatType: string, name: string): number {
    let monthIndex = -1;
    switch (formatType) {
        case FORMAT_DESC.SHORT: {
            monthIndex = MONTHS_NAMES_ARRAY.findIndex((month) => month.short.toLowerCase() === name.toLowerCase());
            break;
        }
        case FORMAT_DESC.LONG: {
            monthIndex = MONTHS_NAMES_ARRAY.findIndex((month) => month.long.toLowerCase() === trimUnderlines(name).toLowerCase());
            break;
        }
    }

    return monthIndex;
}

/**
 *@hidden
 */
export function isFullMonthInput(dateFormatParts: any[], value: any, input: string): boolean {
    let isFullMonth = false;
    const formatType = getDateFormatPart(dateFormatParts, DATE_PARTS.MONTH).formatType;
    switch (formatType) {
        case FORMAT_DESC.NUMERIC:
        case FORMAT_DESC.TWO_DIGITS: {
            if (value !== '' && input.length === 2 && input.charAt(1) !== PROMPT_CHAR) {
                isFullMonth = true;
            }
            break;
        }
        case FORMAT_DESC.SHORT:
        case FORMAT_DESC.LONG: {
            if (findMonthByName(formatType, input) > -1) {
                isFullMonth = true;
            }
            break;
        }
    }
    return isFullMonth;
}

/**
 *@hidden
 */
export function isFullDayInput(dateFormatParts: any[], value: any, input: string): boolean {
    let isFullDay = false;
    switch (getDateFormatPart(dateFormatParts, DATE_PARTS.DAY).formatType) {
        case FORMAT_DESC.NUMERIC:
        case FORMAT_DESC.TWO_DIGITS: {
            if (value !== '' && input.length === 2 && input.charAt(1) !== PROMPT_CHAR) {
                isFullDay = true;
            }
            break;
        }
    }
    return isFullDay;
}

/**
 *@hidden
 */
export function isFullYearInput(dateFormatParts: any[], value: any): boolean {
    switch (getDateFormatPart(dateFormatParts, DATE_PARTS.YEAR).formatType) {
        case FORMAT_DESC.NUMERIC: {
            return (value !== '' && value.length === 4) ? true : false;
        }
        case FORMAT_DESC.TWO_DIGITS: {
            return (value !== '' && value.length === 2) ? true : false;
        }
        default: {
            return false;
        }
    }
}

/**
 *@hidden
 */
export function getDatePartOnPosition(dateFormatParts: any[], position: number) {
    return dateFormatParts.filter((element) =>
        element.position[0] <= position && position <= element.position[1] && element.type !== SEPARATOR)[0];
}

/**
 *@hidden
 */
function fillDatePartsPositions(dateArray: any[]): void {
    let currentPos = 0;

    for (let i = 0; i < dateArray.length; i++) {
        // Day part positions
        if (dateArray[i].type === DATE_PARTS.DAY) {
            // Offset 2 positions for number
            dateArray[i].position = [currentPos, currentPos + 2];
            currentPos += 2;
        }

        // Month part positions
        if (dateArray[i].type === DATE_PARTS.MONTH) {
            switch (dateArray[i].formatType) {
                case FORMAT_DESC.SHORT: {
                    // Offset 3 positions for short month name
                    dateArray[i].position = [currentPos, currentPos + 3];
                    currentPos += 3;
                    break;
                }
                case FORMAT_DESC.LONG: {
                    // Offset 9 positions for long month name
                    dateArray[i].position = [currentPos, currentPos + MAX_MONTH_SYMBOLS];
                    currentPos += MAX_MONTH_SYMBOLS;
                    break;
                }
                default: {
                    // FORMAT_DESC.NUMERIC || FORMAT_DESC.TWO_DIGITS - 2 positions
                    dateArray[i].position = [currentPos, currentPos + 2];
                    currentPos += 2;
                    break;
                }
            }
        }

        // Separator positions
        if (dateArray[i].type === SEPARATOR) {
            dateArray[i].position = [currentPos, currentPos + 1];
            currentPos++;
        }

        // Year part positions
        if (dateArray[i].type === DATE_PARTS.YEAR) {
            switch (dateArray[i].formatType) {
                case FORMAT_DESC.NUMERIC: {
                    // Offset 4 positions for full year
                    dateArray[i].position = [currentPos, currentPos + 4];
                    currentPos += 4;
                    break;
                }
                case FORMAT_DESC.TWO_DIGITS: {
                    // Offset 2 positions for short year
                    dateArray[i].position = [currentPos, currentPos + 2];
                    currentPos += 2;
                    break;
                }
            }
        }

        if (dateArray[i].type === DATE_PARTS.WEEKDAY) {
            switch (dateArray[i].formatType) {
                case FORMAT_DESC.SHORT: {
                    // Offset 3 positions
                    dateArray[i].position = [currentPos, currentPos + 3];
                    currentPos += 3;
                    break;
                }
                case FORMAT_DESC.LONG: {
                    // Offset 9 positions
                    dateArray[i].position = [currentPos, currentPos + MAX_WEEKDAY_SYMBOLS];
                    currentPos += MAX_WEEKDAY_SYMBOLS;
                    break;
                }
            }
        }

    }
}

/**
 *@hidden
 */
function getFullYearFromString(yearPart, inputValue): number {
    return Number(inputValue.substring(yearPart.position[0], yearPart.position[1]));
}

/**
 *@hidden
 */
function getMonthNameByIndex(dateFormatParts: any[], index: number): string {
    switch (getDateFormatPart(dateFormatParts, DATE_PARTS.MONTH).formatType) {
        case FORMAT_DESC.LONG: {
            return MONTHS_NAMES_ARRAY[index].long;
        }
        case FORMAT_DESC.SHORT: {
            return MONTHS_NAMES_ARRAY[index].short;
        }
    }
}

/**
 *@hidden
 */
function geDayNameByIndex(dateFormatParts: any[], index: number): string {
    const formatType = getDateFormatPart(dateFormatParts, DATE_PARTS.WEEKDAY).formatType;
    switch (formatType) {
        case FORMAT_DESC.LONG: {
            return WEEKDAYS_NAMES_ARRAY[index].long;
        }
        case FORMAT_DESC.SHORT: {
            return WEEKDAYS_NAMES_ARRAY[index].short;
        }
    }
}

/**
 *@hidden
 */
function getDayIndexByName(dateFormatParts: any[], inputValue): number {
    let dayIndex;
    const formatType = getDateFormatPart(dateFormatParts, DATE_PARTS.WEEKDAY).formatType;
    const value = getDateValueFromInput(dateFormatParts, DATE_PARTS.WEEKDAY, inputValue);

    switch (formatType) {
        case FORMAT_DESC.SHORT: {
            dayIndex = WEEKDAYS_NAMES_ARRAY.findIndex((dayName) => dayName.short === value);
            break;
        }
        case FORMAT_DESC.LONG: {
            dayIndex = WEEKDAYS_NAMES_ARRAY.findIndex((dayName) => dayName.long === value);
            break;
        }
    }

    return dayIndex;
}
