import { Component, Input, Output, AfterContentInit, ContentChildren, QueryList, EventEmitter, Renderer } from '@angular/core';
import { FilterPipe, FilterOptions } from './filter-pipe';
import { ListItem, ListHeader } from './items';

declare var module: any;

@Component({
    selector: 'ig-list',
    host: { 'role': 'list' },
    pipes: [ FilterPipe ],
    moduleId: module.id, // commonJS standard
    directives: [ ListItem, ListHeader ],
    templateUrl: 'list-content.html'
})

export class List implements AfterContentInit { 
    private _innerStyle: string = "ig-list";
    private _items: ListItem[];

    searchInputElement: HTMLInputElement;
    isCaseSensitiveFiltering: boolean = false;
    items: ListItem[] = [];
    headers: ListHeader[] = [];

    @Input() searchInputId: string;
    @Input() filterOptions: FilterOptions;
    @Output() filtering = new EventEmitter(false); // synchronous event emitter
    @Output() filtered = new EventEmitter();

    constructor(private _renderer: Renderer) {        
    }

    ngAfterContentInit() {
        var self = this;
        if(this.searchInputId) {
            this.searchInputElement = <HTMLInputElement>document.getElementById(this.searchInputId);
            if(this.searchInputElement) {
                this._renderer.listen(this.searchInputElement, 'input', this.filter.bind(this));
            }            
        }        
    }

    addItem(item: ListItem) {
        this.items.push(item);
    }

    addHeader(header: ListHeader) {
        this.headers.push(header);
    }

    filter() {
        var inputValue, result, filteringArgs, filteredArgs, items;

        if(this.searchInputElement) {
            filteringArgs = { cancel: false };

            this.filtering.emit(filteringArgs);

            if(filteringArgs.cancel) { // TODO - implement cancel
                return; 
            }            

            this.filterOptions = this.filterOptions || new FilterOptions();
            this.filterOptions.items = this.filterOptions.items || this.items;
            inputValue = (<HTMLInputElement>this.searchInputElement).value;
            result = new FilterPipe().transform(this.filterOptions, inputValue);

            filteredArgs = { result: result }
            this.filtered.emit(filteredArgs);
        }        
    }
}