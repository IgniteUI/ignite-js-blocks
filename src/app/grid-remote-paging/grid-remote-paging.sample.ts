import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { IgxGridComponent } from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-grid-remote-paging-sample',
    templateUrl: 'grid-remote-paging.sample.html'
})
export class GridRemotePagingSampleComponent implements OnInit, AfterViewInit, OnDestroy {

    public page = 0;
    public totalCount = 0;
    public pages = [];
    public data: Observable<any[]>;
    public selectOptions = [5, 10, 15, 25, 50];

    @ViewChild('customPager', { read: TemplateRef, static: true }) public remotePager: TemplateRef<any>;
    @ViewChild('grid1', { static: true }) public grid1: IgxGridComponent;

    private _perPage = 10;
    private _dataLengthSubscriber;

    constructor(private remoteService: RemoteService) {
    }

    public get perPage(): number {
        return this._perPage;
    }

    public set perPage(val: number) {
        this._perPage = val;
        // this.paginate(0);
    }

    public ngOnInit() {
        this.data = this.remoteService.remotePagingData.asObservable();

        this._dataLengthSubscriber = this.remoteService.getPagingDataLength().subscribe((data) => {
            this.totalCount = data;
            this.grid1.isLoading = false;
        });
    }

    public ngOnDestroy() {
        if (this._dataLengthSubscriber) {
            this._dataLengthSubscriber.unsubscribe();
        }
    }

    public ngAfterViewInit() {
        this.grid1.isLoading = true;
        this.remoteService.getPagingData(0, this.perPage);
    }

    public paginate(page: number) {
        this.page = page;
        const skip = this.page * this.perPage;
        const top = this.perPage;

        this.remoteService.getPagingData(skip, top);
    }

    public perPageChange(perPage: number) {
        const skip = this.page * perPage;
        const top = perPage;

        this.remoteService.getPagingData(skip, top);
    }
}
