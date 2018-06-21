/**
 * Provides base filtering operations
 * Implementations should be Singleton
 *
 * @export
 */
export class IgxFilteringOperand {
    public operations: IFilteringOperation[];

    public constructor() {
        this.operations = [{
            name: 'null',
            logic: (target: any) => {
                return target === null;
            }
        }, {
            name: 'notNull',
            logic: (target: any) => {
                return target !== null;
            }
        }];
    }

    public conditionList(): string[] {
        return this.operations.map((element) => element.name);
    }

    public condition(name: string): IFilteringOperation {
        return this.operations.find((element) => element.name === name);
    }

    public append(operation: IFilteringOperation) {
        this.operations.push(operation);
    }
}

/**
 * Provides filtering operations for booleans
 *
 * @export
 */
export class IgxBooleanFilteringOperand extends IgxFilteringOperand {
    private static _instance: IgxBooleanFilteringOperand = null;

    protected constructor() {
        super();
        this.operations = [{
            name: 'true',
            logic: (target: boolean) => {
                return !!(target && target !== null && target !== undefined);
            }
        }, {
            name: 'false',
            logic: (target: boolean) => {
                return !target && target !== null && target !== undefined;
            }
        }, {
            name: 'empty',
            logic: (target: boolean) => {
                return target === null || target === undefined;
            }
        }, {
            name: 'notEmpty',
            logic: (target: boolean) => {
                return target !== null && target !== undefined;
            }
        }].concat(this.operations);
    }

    public static instance(): IgxBooleanFilteringOperand {
        return this._instance || (this._instance = new this());
    }
}

/**
 * Provides filtering operations for Dates
 *
 * @export
 */
export class IgxDateFilteringOperand extends IgxFilteringOperand {
    private static _instance: IgxDateFilteringOperand = null;

    protected constructor() {
        super();
        this.operations = [{
            name: 'equals',
            logic: (target: Date, searchVal: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const targetp = IgxDateFilteringOperand.getDateParts(target, 'yMd');
                const searchp = IgxDateFilteringOperand.getDateParts(searchVal, 'yMd');
                return targetp.year === searchp.year &&
                    targetp.month === searchp.month &&
                    targetp.day === searchp.day;
            }
        }, {
            name: 'doesNotEqual',
            logic: (target: Date, searchVal: Date) => {
                return !this.operations.find((element) => element.name === 'equals').logic(target, searchVal);
            }
        }, {
            name: 'before',
            logic: (target: Date, searchVal: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                return target < searchVal;
            }
        }, {
            name: 'after',
            logic: (target: Date, searchVal: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                return target > searchVal;
            }
        }, {
            name: 'today',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateFilteringOperand.getDateParts(target, 'yMd');
                const now = IgxDateFilteringOperand.getDateParts(new Date(), 'yMd');
                return  d.year === now.year &&
                        d.month === now.month &&
                        d.day === now.day;
            }
        }, {
            name: 'yesterday',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const td = IgxDateFilteringOperand.getDateParts(target, 'yMd');
                const y = ((d) => new Date(d.setDate(d.getDate() - 1)))(new Date());
                const yesterday = IgxDateFilteringOperand.getDateParts(y, 'yMd');
                return  td.year === yesterday.year &&
                        td.month === yesterday.month &&
                        td.day === yesterday.day;
            }
        }, {
            name: 'thisMonth',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateFilteringOperand.getDateParts(target, 'yM');
                const now = IgxDateFilteringOperand.getDateParts(new Date(), 'yM');
                return  d.year === now.year &&
                        d.month === now.month;
            }
        }, {
            name: 'lastMonth',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateFilteringOperand.getDateParts(target, 'yM');
                const now = IgxDateFilteringOperand.getDateParts(new Date(), 'yM');
                if (!now.month) {
                    now.month = 11;
                    now.year -= 1;
                } else {
                    now.month--;
                }
                return  d.year === now.year &&
                        d.month === now.month;
            }
        }, {
            name: 'nextMonth',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateFilteringOperand.getDateParts(target, 'yM');
                const now = IgxDateFilteringOperand.getDateParts(new Date(), 'yM');
                if (now.month === 11) {
                    now.month = 0;
                    now.year += 1;
                } else {
                    now.month++;
                }
                return  d.year === now.year &&
                        d.month === now.month;
            }
        }, {
            name: 'thisYear',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateFilteringOperand.getDateParts(target, 'y');
                const now = IgxDateFilteringOperand.getDateParts(new Date(), 'y');
                return  d.year === now.year;
            }
        }, {
            name: 'lastYear',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateFilteringOperand.getDateParts(target, 'y');
                const now = IgxDateFilteringOperand.getDateParts(new Date(), 'y');
                return  d.year === now.year - 1;
            }
        }, {
            name: 'nextYear',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateFilteringOperand.getDateParts(target, 'y');
                const now = IgxDateFilteringOperand.getDateParts(new Date(), 'y');
                return  d.year === now.year + 1;
            }
        }, {
            name: 'empty',
            logic: (target: Date) => {
                return target === null || target === undefined;
            }
        }, {
            name: 'notEmpty',
            logic: (target: Date) => {
                return target !== null && target !== undefined;
            }
        }].concat(this.operations);
    }

    public static instance(): IgxDateFilteringOperand {
        return this._instance || (this._instance = new this());
    }

    /**
     * Splits a Date object into parts
     *
     * @memberof IgxDateFilteringOperand
     */
    public static getDateParts(date: Date, dateFormat?: string): IDateParts {
        const res = {
            day: null,
            hours: null,
            milliseconds: null,
            minutes: null,
            month: null,
            seconds: null,
            year: null
        };
        if (!date || !dateFormat) {
            return res;
        }
        if (dateFormat.indexOf('y') >= 0) {
            res.year = date.getFullYear();
        }
        if (dateFormat.indexOf('M') >= 0) {
            res.month = date.getMonth();
        }
        if (dateFormat.indexOf('d') >= 0) {
            res.day = date.getDate();
        }
        if (dateFormat.indexOf('h') >= 0) {
            res.hours = date.getHours();
        }
        if (dateFormat.indexOf('m') >= 0) {
            res.minutes = date.getMinutes();
        }
        if (dateFormat.indexOf('s') >= 0) {
            res.seconds = date.getSeconds();
        }
        if (dateFormat.indexOf('f') >= 0) {
            res.milliseconds = date.getMilliseconds();
        }
        return res;
    }

    private validateInputData(target: Date) {
        if (!(target instanceof Date)) {
            throw new Error('Could not perform filtering on \'date\' column because the datasource object type is not \'Date\'.');
        }
    }
}

/**
 * Provides filtering operations for numbers
 *
 * @export
 */
export class IgxNumberFilteringOperand extends IgxFilteringOperand {
    private static _instance: IgxNumberFilteringOperand = null;

    protected constructor() {
        super();
        this.operations = [{
            name: 'equals',
            logic: (target: number, searchVal: number) => {
                return target === searchVal;
            }
        }, {
            name: 'doesNotEqual',
            logic: (target: number, searchVal: number) => {
                return target !== searchVal;
            }
        }, {
            name: 'greaterThan',
            logic: (target: number, searchVal: number) => {
                return target > searchVal;
            }
        }, {
            name: 'lessThan',
            logic: (target: number, searchVal: number) => {
                return target < searchVal;
            }
        }, {
            name: 'greaterThanOrEqualTo',
            logic: (target: number, searchVal: number) => {
                return target >= searchVal;
            }
        }, {
            name: 'lessThanOrEqualTo',
            logic: (target: number, searchVal: number) => {
                return target <= searchVal;
            }
        }, {
            name: 'empty',
            logic: (target: number) => {
                return target === null || target === undefined || isNaN(target);
            }
        }, {
            name: 'notEmpty',
            logic: (target: number) => {
                return target !== null && target !== undefined && !isNaN(target);
            }
        }].concat(this.operations);
    }

    public static instance(): IgxNumberFilteringOperand {
        return this._instance || (this._instance = new this());
    }
}

/**
 * Provides filtering operations for strings
 *
 * @export
 */
export class IgxStringFilteringOperand extends IgxFilteringOperand {
    private static _instance: IgxStringFilteringOperand = null;

    protected constructor() {
        super();
        this.operations = [{
            name: 'contains',
            logic: (target: string, searchVal: string, ignoreCase?: boolean) => {
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target.indexOf(search) !== -1;
            }
        }, {
            name: 'doesNotContain',
            logic: (target: string, searchVal: string, ignoreCase?: boolean) => {
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target.indexOf(search) === -1;
            }
        }, {
            name: 'startsWith',
            logic: (target: string, searchVal: string, ignoreCase?: boolean) => {
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target.startsWith(search);
            }
        }, {
            name: 'endsWith',
            logic: (target: string, searchVal: string, ignoreCase?: boolean) => {
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target.endsWith(search);
            }
        }, {
            name: 'equals',
            logic: (target: string, searchVal: string, ignoreCase?: boolean) => {
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target === search;
            }
        }, {
            name: 'doesNotEqual',
            logic: (target: string, searchVal: string, ignoreCase?: boolean) => {
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target !== search;
            }
        }, {
            name: 'empty',
            logic: (target: string) => {
                return target === null || target === undefined || target.length === 0;
            }
        }, {
            name: 'notEmpty',
            logic: (target: string) => {
                return target !== null && target !== undefined && target.length > 0;
            }
        }].concat(this.operations);
    }

    public static instance(): IgxStringFilteringOperand {
        return this._instance || (this._instance = new this());
    }

    /**
     * Applies case sensitivity on strings if provided
     *
     * @memberof IgxStringFilteringOperand
     */
    public static applyIgnoreCase(a: string, ignoreCase: boolean): string {
        a = a || '';
        // bulletproof
        return ignoreCase ? ('' + a).toLowerCase() : a;
    }
}

/**
 * Interface describing filtering operations
 *
 * @export
 */
export interface IFilteringOperation {
    name: string;
    logic: (value: any, searchVal?: any, ignoreCase?: boolean) => boolean;
}

/**
 * Interface describing Date object in parts
 *
 * @export
 */
export interface IDateParts {
    year: number;
    month: number;
    day: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
}
