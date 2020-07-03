import { Component, ElementRef, HostBinding, Input, ViewChild, ViewContainerRef,
     ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { VirtualHelperBaseDirective } from './base.helper.component';

@Component({
    selector: 'igx-virtual-helper',
    template: '<div #container class="igx-vhelper__placeholder-content" [style.height.px]="size"></div>'
})
export class VirtualHelperComponent extends VirtualHelperBaseDirective implements OnInit, OnDestroy  {
    @HostBinding('scrollTop')
    public scrollTop;

    @HostBinding('style.width.px')
    public scrollWidth;

    @ViewChild('container', { read: ViewContainerRef, static: true }) public _vcr;
    @Input() public itemsLength: number;


    @HostBinding('class')
    public cssClasses = 'igx-vhelper--vertical';

    constructor(public elementRef: ElementRef, public cdr: ChangeDetectorRef) {
        super(elementRef, cdr);
    }

    ngOnInit() {
        this.scrollWidth = this.scrollNativeSize;
    }
}
