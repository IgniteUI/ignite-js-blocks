
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, tick } from '@angular/core/testing';
import { IgxInputDirective } from '../input-group';
import { IgxGridHeaderComponent } from '../grids/grid-header.component';
import { IgxChipComponent } from '../chips';
import { IgxGridComponent } from '../grids/grid/grid.component';
import { IgxColumnGroupComponent } from '../grids/column.component';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';
import { UIInteractions } from './ui-interactions.spec';

const SUMMARY_LABEL_CLASS = '.igx-grid-summary__label';
const SORTING_ICON_ASC_CONTENT = 'arrow_upward';
const FILTER_UI_ROW = 'igx-grid-filtering-row';
const FILTER_UI_CONNECTOR = 'igx-filtering-chips__connector';
const FILTER_UI_INDICATOR = 'igx-grid__filtering-cell-indicator';

export class GridFunctions {

    public static getColGroup(grid: IgxGridComponent, headerName: string): IgxColumnGroupComponent {
        const colGroups = grid.columnList.filter(c => c.columnGroup && c.header === headerName);
        if (colGroups.length === 0) {
            return null;
        } else if (colGroups.length === 1) {
            return colGroups[0];
        } else {
            throw new Error('More than one column group found.');
        }
    }

    public static calcMaxSummaryHeight(columnList, summaries: DebugElement[], defaultRowHeight) {
        let maxSummaryLength = 0;
        let index = 0;
        columnList.filter((col) => col.hasSummary).forEach((column) => {
            const currentLength = summaries[index].queryAll(By.css(SUMMARY_LABEL_CLASS)).length;
            if (maxSummaryLength < currentLength) {
                maxSummaryLength = currentLength;
            }
            index++;
        });
        const expectedLength = maxSummaryLength * defaultRowHeight;
        return expectedLength;
    }

    public static scrollLeft(grid: IgxGridComponent, newLeft: number) {
        const hScrollbar = grid.parentVirtDir.getHorizontalScroll();
        hScrollbar.scrollLeft = newLeft;
    }

    public static scrollRight(grid: IgxGridComponent, newRight: number) {
        const hScrollbar = grid.parentVirtDir.getHorizontalScroll();
        hScrollbar.scrollRight = newRight;
    }

    public static getCurrentCellFromGrid(grid, row, cell) {
        const gridRow = grid.rowList.toArray()[row];
        const gridCell = gridRow.cells.toArray()[cell];
        return gridCell;
    }

    public static getValueFromCellElement(cell) {
        return cell.nativeElement.textContent.trim();
    }

    public static verifyColumnIsHidden(column, isHidden: boolean, visibleColumnsCount: number) {
        expect(column.hidden).toBe(isHidden, 'Hidden is not ' + isHidden);

        const visibleColumns = column.grid.visibleColumns;
        expect(visibleColumns.length).toBe(visibleColumnsCount, 'Unexpected visible columns count!');
        expect(visibleColumns.findIndex((col) => col === column) > -1).toBe(!isHidden, 'Unexpected result for visibleColumns collection!');
    }

    public static  verifyColumnIsPinned(column, isPinned: boolean, pinnedColumnsCount: number) {
        expect(column.pinned).toBe(isPinned, 'Pinned is not ' + isPinned);

        const pinnedColumns = column.grid.pinnedColumns;
        expect(pinnedColumns.length).toBe(pinnedColumnsCount, 'Unexpected pinned columns count!');
        expect(pinnedColumns.findIndex((col) => col === column) > -1).toBe(isPinned, 'Unexpected result for pinnedColumns collection!');
    }

    /* Filtering-related methods */
    public static verifyFilterUIPosition(filterUIContainer, grid) {
        const filterUiRightBorder = filterUIContainer.nativeElement.offsetParent.offsetLeft +
        filterUIContainer.nativeElement.offsetLeft + filterUIContainer.nativeElement.offsetWidth;
        expect(filterUiRightBorder).toBeLessThanOrEqual(grid.nativeElement.offsetWidth);
    }

    // Generate expected results for 'date' filtering conditions based on the current date
    public static createDateFilterConditions(grid: IgxGridComponent, today) {
        const expectedResults = [];
        // day + 15
        const dateItem0 = GridFunctions.generateICalendarDate(grid.data[0].ReleaseDate,
            today.getFullYear(), today.getMonth());
        // month - 1
        const dateItem1 = GridFunctions.generateICalendarDate(grid.data[1].ReleaseDate,
            today.getFullYear(), today.getMonth());
        // day - 1
        const dateItem3 = GridFunctions.generateICalendarDate(grid.data[3].ReleaseDate,
            today.getFullYear(), today.getMonth());
        // day + 1
        const dateItem5 = GridFunctions.generateICalendarDate(grid.data[5].ReleaseDate,
            today.getFullYear(), today.getMonth());
        // month + 1
        const dateItem6 = GridFunctions.generateICalendarDate(grid.data[6].ReleaseDate,
            today.getFullYear(), today.getMonth());

        let thisMonthCountItems = 1;
        let nextMonthCountItems = 1;
        let lastMonthCountItems = 1;
        let thisYearCountItems = 6;
        let nextYearCountItems = 0;
        let lastYearCountItems = 0;

        // LastMonth filter
        if (dateItem3.isPrevMonth) {
            lastMonthCountItems++;
        }
        expectedResults[0] = lastMonthCountItems;

        // thisMonth filter
        if (dateItem0.isCurrentMonth) {
            thisMonthCountItems++;
        }

        if (dateItem3.isCurrentMonth) {
            thisMonthCountItems++;
        }

        if (dateItem5.isCurrentMonth) {
            thisMonthCountItems++;
        }

        // NextMonth filter
        if (dateItem0.isNextMonth) {
            nextMonthCountItems++;
        }

        if (dateItem5.isNextMonth) {
            nextMonthCountItems++;
        }
        expectedResults[1] = nextMonthCountItems;

        // ThisYear, NextYear, PreviousYear filter

        // day + 15
        if (!dateItem0.isThisYear) {
            thisYearCountItems--;
        } else if (dateItem0.isNextYear) {
            nextYearCountItems++;
        }

        // month - 1
        if (!dateItem1.isThisYear) {
            thisYearCountItems--;
        }

        if (dateItem1.isLastYear) {
            lastYearCountItems++;
        }

        // day - 1
        if (!dateItem3.isThisYear) {
            thisYearCountItems--;
        }

        if (dateItem3.isLastYear) {
            lastYearCountItems++;
        }

        // day + 1
        if (!dateItem5.isThisYear) {
            thisYearCountItems--;
        }

        if (dateItem5.isNextYear) {
            nextYearCountItems++;
        }

        // month + 1
        if (!dateItem6.isThisYear) {
            thisYearCountItems--;
        }

        if (dateItem6.isNextYear) {
            nextYearCountItems++;
        }

        // ThisYear filter result
        expectedResults[2] = thisYearCountItems;

        // NextYear filter result
        expectedResults[3] = nextYearCountItems;

        // PreviousYear filter result
        expectedResults[4] = lastYearCountItems;

        // ThisMonth filter result
        expectedResults[5] = thisMonthCountItems;

        return expectedResults;
    }

    public static generateICalendarDate(date: Date, year: number, month: number) {
        return {
            date,
            isCurrentMonth: date.getFullYear() === year && date.getMonth() === month,
            isLastYear: GridFunctions.isLastYear(date, year),
            isNextMonth: GridFunctions.isNextMonth(date, year, month),
            isNextYear: GridFunctions.isNextYear(date, year),
            isPrevMonth: GridFunctions.isPreviousMonth(date, year, month),
            isThisYear: GridFunctions.isThisYear(date, year)
        };
    }

    public static isPreviousMonth(date: Date, year: number, month: number): boolean {
        if (date.getFullYear() === year) {
            return date.getMonth() < month;
        }
        return date.getFullYear() < year;
    }

    public static isNextMonth(date: Date, year: number, month: number): boolean {
        if (date.getFullYear() === year) {
            return date.getMonth() > month;
        }
        return date.getFullYear() > year;
    }

    public static isThisYear(date: Date, year: number): boolean {
        return date.getFullYear() === year;
    }

    public static isLastYear(date: Date, year: number): boolean {
        return date.getFullYear() < year;
    }

    public static isNextYear(date: Date, year: number): boolean {
        return date.getFullYear() > year;
    }

    /* Grouping-related members */
    public static checkGroups(groupRows, expectedGroupOrder, grExpr?) {
        // verify group rows are sorted correctly, their indexes in the grid are correct and their group records match the group value.
        let count = 0;
        const maxLevel = grExpr ? grExpr.length - 1 : 0;
        for (const groupRow of groupRows) {
            const recs = groupRow.groupRow.records;
            const val = groupRow.groupRow.value;
            const index = groupRow.index;
            const field = groupRow.groupRow.expression.fieldName;
            const level = groupRow.groupRow.level;
            expect(level).toEqual(grExpr ? grExpr.indexOf(groupRow.groupRow.expression) : 0);
            expect(index).toEqual(count);
            count++;
            expect(val).toEqual(expectedGroupOrder[groupRows.indexOf(groupRow)]);
            for (const rec of recs) {
                if (level === maxLevel) {
                    count++;
                }
                expect(rec[field]).toEqual(val);
            }
        }
    }

    public static checkChips(chips, grExpr, sortExpr) {
        for (let i = 0; i < chips.length; i++) {
            const chip = chips[i].querySelector('span.igx-chip__label>span').innerText;
            const chipDirection = chips[i].querySelector('span.igx-chip__label>igx-icon').innerText;
            const grp = grExpr[i];
            const s = sortExpr[i];
            expect(chip).toBe(grp.fieldName);
            expect(chip).toBe(s.fieldName);
            if (chipDirection === SORTING_ICON_ASC_CONTENT) {
                expect(grp.dir).toBe(SortingDirection.Asc);
                expect(s.dir).toBe(SortingDirection.Asc);
            } else {
                expect(grp.dir).toBe(SortingDirection.Desc);
                expect(s.dir).toBe(SortingDirection.Desc);
            }
        }
    }

    public static getChipText(chipElem) {
        return chipElem.nativeElement.querySelector('div.igx-chip__content').innerText.trim();
    }

    public static clickChip(debugElement) {
        debugElement.componentInstance.chipArea.nativeElement.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1}));
        debugElement.componentInstance.chipArea.nativeElement.dispatchEvent(new PointerEvent('pointerup'));
    }

    /* Search-related members */
    public static findNext(grid: IgxGridComponent, text: string) {
        const promise = new Promise((resolve) => {
            grid.verticalScrollContainer.onChunkLoad.subscribe((state) => {
                resolve(state);
            });

            grid.findNext(text);
        });

        return promise;
    }

    public static findPrev(grid: IgxGridComponent, text: string) {
        const promise = new Promise((resolve) => {
            grid.verticalScrollContainer.onChunkLoad.subscribe((state) => {
                resolve(state);
            });

            grid.findPrev(text);
        });

        return promise;
    }

    public static isInView(index, state): boolean {
        return index > state.startIndex && index <= state.startIndex + state.chunkSize;
    }

    /* Toolbar-related members */
    public static getToolbar(fixture) {
        return fixture.debugElement.query(By.css('igx-grid-toolbar'));
    }

    public static getOverlay(fixture) {
        const div = fixture.debugElement.nativeElement.parentElement.lastChild;
        return div.classList.contains('igx-overlay') ? div : null;
    }

    public static getColumnHidingButton(fixture) {
        const button = GridFunctions.getToolbar(fixture).queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnHiding');
        return button ? button.nativeElement : undefined;
    }

    public static getColumnPinningButton(fixture) {
        const button = GridFunctions.getToolbar(fixture).queryAll(By.css('button'))
                                    .find((b) => b.nativeElement.name === 'btnColumnPinning');
        return button ? button.nativeElement : undefined;
    }

    public static getExportButton(fixture) {
        const div = GridFunctions.getToolbar(fixture).query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        return (div) ? div.query(By.css('button')) : null;
    }

    public static getExportOptions(fixture) {
        const div = GridFunctions.getOverlay(fixture);
        return (div) ? div.querySelectorAll('li') : null;
    }

    public static getCheckboxElement(name: string, element: DebugElement, fix) {
        const checkboxElements = element.queryAll(By.css('igx-checkbox'));
        const chkElement = checkboxElements.find((el) =>
        (el.context as IgxCheckboxComponent).placeholderLabel.nativeElement.innerText === name);

        return chkElement;
    }


    public static getCheckboxInput(name: string, element: DebugElement, fix) {
        const checkboxEl = this.getCheckboxElement(name, element, fix);
        const chkInput = checkboxEl.query(By.css('input')).nativeElement as HTMLInputElement;

        return chkInput;
    }

    public static getCheckboxInputs(element: DebugElement): HTMLInputElement[] {
        const checkboxElements = element.queryAll(By.css('igx-checkbox'));
        const inputs = [];
        checkboxElements.forEach((el) => {
            inputs.push(el.query(By.css('input')).nativeElement as HTMLInputElement);
        });

        return inputs;
    }

    public static verifyCheckbox(name: string, isChecked: boolean, isDisabled: boolean, element: DebugElement, fix) {
        const chkInput = this.getCheckboxInput(name, element, fix);
        expect(chkInput.type).toBe('checkbox');
        expect(chkInput.disabled).toBe(isDisabled);
        expect(chkInput.checked).toBe(isChecked);
    }

    // Filtering
    public static removeFilterChipByIndex(index: number, filterUIRow) {
        const filterChip = filterUIRow.queryAll(By.css('igx-chip'))[index];
        const removeButton = filterChip.query(By.css('div.igx-chip__remove'));
        removeButton.nativeElement.click();
    }

    public static selectFilteringCondition(cond: string, ddList) {
        const ddItems = ddList.nativeElement.children;
        let i;
        for ( i = 0; i < ddItems.length; i++) {
            if (ddItems[i].textContent === cond) {
                ddItems[i].click();
                tick(100);
                return;
            }
        }
    }

    public static filterBy(condition: string, value: string, fix: ComponentFixture<any>) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        // open dropdown
        this.openFilterDD(fix.debugElement);
        fix.detectChanges();

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        this.selectFilteringCondition(condition, ddList);

        const input = filterUIRow.query(By.directive(IgxInputDirective));
        input.nativeElement.value = value;
        input.nativeElement.dispatchEvent(new Event('keydown'));
        input.nativeElement.dispatchEvent(new Event('input'));
        input.nativeElement.dispatchEvent(new Event('keyup'));
        fix.detectChanges();

        // Enter key to submit
        this.simulateKeyboardEvent(input, 'keydown', 'Enter');
        fix.detectChanges();
    }

    public static resetFilterRow(fix: ComponentFixture<any> ) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const editingBtns = filterUIRow.query(By.css('.igx-grid__filtering-row-editing-buttons'));
        const reset = editingBtns.queryAll(By.css('button'))[0];
        reset.nativeElement.click();
        tick(100);
        fix.detectChanges();
    }

    public static closeFilterRow(fix: ComponentFixture<any>) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const editingBtns = filterUIRow.query(By.css('.igx-grid__filtering-row-editing-buttons'));
        const close = editingBtns.queryAll(By.css('button'))[1];
        close.nativeElement.click();
        fix.detectChanges();
    }

    public static openFilterDD(elem: DebugElement) {
        const filterUIRow = elem.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        filterIcon.nativeElement.click();
    }

    public static clickExcelFilterIcon(fix: ComponentFixture<any>, columnField: string) {
        const columnHeader = GridFunctions.getColumnHeader(columnField, fix);
        const filterIcon = columnHeader.query(By.css('.igx-excel-filter__icon'));
        UIInteractions.clickElement(filterIcon);
    }

    public static clickApplyExcelStyleFiltering(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');
        const raisedButtons = Array.from(excelMenu.querySelectorAll('.igx-button--raised'));
        const applyButton: any = raisedButtons.find((rb: any) => rb.innerText === 'apply');
        applyButton.click();
    }

    public static clickExcelFilterCascadeButton(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');
        const cascadeButton = excelMenu.querySelector('.igx-excel-filter__actions-filter');
        cascadeButton.click();
    }

    public static clickOperatorFromCascadeMenu(fix: ComponentFixture<any>, operatorIndex: number) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const subMenu = gridNativeElement.querySelector('.igx-drop-down__list');
        const dropdownItems = subMenu.querySelectorAll('igx-drop-down-item');
        const dropdownItem = dropdownItems[operatorIndex];
        dropdownItem.click();
    }

    public static clickApplyExcelStyleCustomFiltering(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const customFilterMenu = gridNativeElement.querySelector('.igx-excel-filter__secondary');
        const raisedButtons = Array.from(customFilterMenu.querySelectorAll('.igx-button--raised'));
        const applyButton: any = raisedButtons.find((rb: any) => rb.innerText === 'apply');
        applyButton.click();
    }

    public static clickAddFilterExcelStyleCustomFiltering(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const customFilterMenu = gridNativeElement.querySelector('.igx-excel-filter__secondary');
        const addFilterButton = customFilterMenu.querySelector('.igx-excel-filter__add-filter');
        addFilterButton.click();
    }

    public static clickPinIconInExcelStyleFiltering(fix: ComponentFixture<any>) {
        const headerIcons = GridFunctions.getExcelFilteringHeaderIcons(fix);
        const headerAreaPinIcon = headerIcons.find((buttonIcon: any) => buttonIcon.innerHTML.indexOf('name="pin"') !== -1);
        const headerAreaUnpinIcon = headerIcons.find((buttonIcon: any) => buttonIcon.innerHTML.indexOf('name="unpin"') !== -1);
        const pinUnpinIcon: any = headerAreaPinIcon ? headerAreaPinIcon : headerAreaUnpinIcon;
        pinUnpinIcon.click();
    }

    public static clickHideIconInExcelStyleFiltering(fix: ComponentFixture<any>) {
        const headerIcons = GridFunctions.getExcelFilteringHeaderIcons(fix);
        const headerAreaColumnHidingIcon: any = headerIcons.find((buttonIcon: any) => buttonIcon.innerText === 'visibility_off');
        headerAreaColumnHidingIcon.click();
    }

    public static simulateKeyboardEvent(element, eventName, inputKey) {
        element.nativeElement.dispatchEvent(new KeyboardEvent(eventName, { key: inputKey }));
    }

    public static getExcelStyleFilteringComponent(fix) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');
        return excelMenu;
    }

    public static getExcelStyleSearchComponent(fix) {
        const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
        const searchComponent = excelMenu.querySelector('.igx-excel-filter__menu-main');
        return searchComponent;
    }

    public static getExcelStyleSearchComponentScrollbar(fix) {
        const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
        const scrollbar = searchComponent.querySelector('igx-virtual-helper');
        return scrollbar;
    }

    public static getColumnHeader(columnField: string, fix: ComponentFixture<any>) {
        return fix.debugElement.queryAll(By.directive(IgxGridHeaderComponent)).find((header) => {
            return header.componentInstance.column.field === columnField;
        });
    }

    public static getFilterChipsForColumn(columnField: string, fix: ComponentFixture<any>) {
        const columnHeader = this.getColumnHeader(columnField, fix);
        return columnHeader.parent.queryAll(By.directive(IgxChipComponent));
    }

    public static getFilterOperandsForColumn(columnField: string, fix: ComponentFixture<any>) {
        const columnHeader = this.getColumnHeader(columnField, fix);
        return columnHeader.parent.queryAll(By.css('.' + FILTER_UI_CONNECTOR));
    }

    public static getFilterIndicatorForColumn(columnField: string, fix: ComponentFixture<any>) {
        const columnHeader = this.getColumnHeader(columnField, fix);
        return columnHeader.parent.queryAll(By.css('.' + FILTER_UI_INDICATOR));
    }

    public static getExcelFilteringHeaderIcons(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');
        const headerArea = excelMenu.querySelector('.igx-excel-filter__menu-header');
        return Array.from(headerArea.querySelectorAll('.igx-button--icon'));
    }

    public static setInputValueESF(customMenu, expressionIndex: number, value: any, fix: ComponentFixture<any>) {
        const input =
            customMenu.children[1].children[expressionIndex].children[2].querySelector('.igx-input-group__bundle-main').children[0];
        input.value = value;
        input.dispatchEvent(new Event('keydown'));
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('keyup'));
        fix.detectChanges();
    }

    public static setOperatorESF(customMenu, grid, expressionIndex: number, itemIndex: number, fix: ComponentFixture<any>) {
        const input =
            customMenu.children[1].children[expressionIndex].children[1].querySelector('.igx-input-group__bundle-main').children[0];
        input.click();
        fix.detectChanges();

        const operators = grid.nativeElement.querySelectorAll('.igx-drop-down__list')[expressionIndex + 1];
        const operator = operators.children[itemIndex].children[0];

        operator.click();
        tick();
        fix.detectChanges();
    }

    public static sortNativeElementsVertically(arr) {
        return arr.sort((a, b) =>
            (<HTMLElement>a).getBoundingClientRect().top - (<HTMLElement>b).getBoundingClientRect().top);
    }

    public static sortNativeElementsHorizontally(arr) {
        return arr.sort((a, b) =>
            (<HTMLElement>a).getBoundingClientRect().left - (<HTMLElement>b).getBoundingClientRect().left);
    }
}
