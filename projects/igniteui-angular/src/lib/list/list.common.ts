import { Directive, TemplateRef, EventEmitter, QueryList, Optional, Inject } from '@angular/core';
import { DisplayDensityBase, IDisplayDensityOptions, DisplayDensityToken } from '../core/density';
import { CurrentResourceStrings } from '../core/i18n/resources';
import { IListResourceStrings } from '../core/i18n/list-resources';

export interface IListChild {
    index: number;
}

/** @hidden */
@Directive({
    selector: '[igxListBase]'
})
export class IgxListBaseDirective extends DisplayDensityBase {
    onItemClicked: EventEmitter<any>;
    allowLeftPanning: boolean;
    allowRightPanning: boolean;
    panEndTriggeringThreshold: number;
    onLeftPan: EventEmitter<any>;
    onRightPan: EventEmitter<any>;
    onPanStateChange: EventEmitter<any>;
    children: QueryList<any>;
    listItemLeftPanningTemplate: IgxListItemLeftPanningTemplateDirective;
    listItemRightPanningTemplate: IgxListItemRightPanningTemplateDirective;

    constructor(@Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
        super(_displayDensityOptions);
    }
}

export enum IgxListPanState { NONE, LEFT, RIGHT }

@Directive({
    selector: '[igxEmptyList]'
})
export class IgxEmptyListTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxDataLoading]'
})
export class IgxDataLoadingTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxListItemLeftPanning]'
})
export class IgxListItemLeftPanningTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxListItemRightPanning]'
})
export class IgxListItemRightPanningTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}
