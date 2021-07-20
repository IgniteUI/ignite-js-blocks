import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '12.1.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                sourceRoot: '/testSrc'
            }
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix'
            }
        }
    };

    const migrationName = 'migration-21';
    const lineBreaksAndSpaceRegex = /\s/g;
    // eslint-disable-next-line max-len
    const noteText = `<!--NOTE: This component has been updated by Infragistics migration: v${version}\nPlease check your template whether all bindings/event handlers are correct.-->`;

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    // IgxOverlayService
    it('should update overlay events subscriptions', async () => {
        pending('set up tests for migrations through lang service');
        appTree.create(
            '/testSrc/appPrefix/service/test.component.ts', `
import { Component, OnInit } from '@angular/core';
import { IgxOverlayService } from 'igniteui-angular';
export class SimpleComponent implements OnInit {
    constructor(@Inject(IgxOverlayService) protected overlayService: IgxOverlayService){}

    public ngOnInit() {
        this.overlayService.onOpening.subscribe();
        this.overlayService.opened.subscribe();
        this.overlayService.onClosing.subscribe();
        this.overlayService.onClosed.subscribe();
        this.overlayService.onAppended.subscribe();
        this.overlayService.onAnimation.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/service/test.component.ts'))
            .toEqual(`
import { Component, OnInit } from '@angular/core';
import { IgxOverlayService } from 'igniteui-angular';
export class SimpleComponent implements OnInit {
    constructor(@Inject(IgxOverlayService) protected overlayService: IgxOverlayService){}

    public ngOnInit() {
        this.overlayService.opening.subscribe();
        this.overlayService.opened.subscribe();
        this.overlayService.closing.subscribe();
        this.overlayService.closed.subscribe();
        this.overlayService.contentAppended.subscribe();
        this.overlayService.animationStarting.subscribe();
    }
}`);
    });

    it('should update banner event subscriptions in .ts file', async () => {
        pending('ts language service tests do not pass');
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts', `
import { Component, OnInit } from '@angular/core';
import { IgxBannerComponent } from 'igniteui-angular';
export class TestComponent implements OnInit {
    @ViewChild(IgxBannerComponent)
    public banner: IgxBannerComponent

    public ngOnInit() {
        this.banner.onOpening.subscribe();
        this.banner.onOpened.subscribe();
        this.banner.onClosing.subscribe();
        this.banner.onClosed.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
            .toEqual(`
import { Component, OnInit } from '@angular/core';
import { IgxBannerComponent } from 'igniteui-angular';
export class TestComponent implements OnInit {
    @ViewChild(IgxBannerComponent)
    public banner: IgxBannerComponent

    public ngOnInit() {
        this.banner.opening.subscribe();
        this.banner.opened.subscribe();
        this.banner.closing.subscribe();
        this.banner.closed.subscribe();
    }
}`);
    });

    it('should update banner event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
<igx-banner
    (onOpening)="handleEvent($event, 'opening')"
    (onOpened)="handleEvent($event, 'opened')"
    (onClosing)="handleEvent($event, 'closing')"
    (onClosed)="handleEvent($event, 'closed')"
>
    Display something onOpening, onClosing, onOpened, onClosed
</igx-banner>`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
<igx-banner
    (opening)="handleEvent($event, 'opening')"
    (opened)="handleEvent($event, 'opened')"
    (closing)="handleEvent($event, 'closing')"
    (closed)="handleEvent($event, 'closed')"
>
    Display something onOpening, onClosing, onOpened, onClosed
</igx-banner>`);
    });

    it('should update expansion panel event subscriptions in .ts file', async () => {
        pending('ts language service tests do not pass');
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts', `
import { Component, OnInit } from '@angular/core';
import { IgxExpansionPanelComponent, IgxExpansionPanelHeaderComponent } from 'igniteui-angular';
export class TestComponent implements OnInit {
    @ViewChild(IgxExpansionPanelComponent)
    public panel: IgxExpansionPanelComponent

    @ViewChild(IgxExpansionPanelHeaderComponent)
    public header: IgxExpansionPanelHeaderComponent

    public ngOnInit() {
        this.panel.onExpanded.subscribe();
        this.panel.onCollapsed.subscribe();
        this.header.onInteraction.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
            .toEqual(`
import { Component, OnInit } from '@angular/core';
import { IgxExpansionPanelComponent, IgxExpansionPanelHeaderComponent } from 'igniteui-angular';
export class TestComponent implements OnInit {
    @ViewChild(IgxExpansionPanelComponent)
    public panel: IgxExpansionPanelComponent

    @ViewChild(IgxExpansionPanelHeaderComponent)
    public header: IgxExpansionPanelHeaderComponent

    public ngOnInit() {
        this.panel.contentExpanded.subscribe();
        this.panel.contentCollapsed.subscribe();
        this.header.interaction.subscribe();
    }
}`);
    });

    it('should update expansion panel event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
<igx-expansion-panel (onExpanded)="handleExpanded($event)" (onCollapsed)="handleCollapsed($event)">
    <igx-expansion-panel-header (onInteraction)="handleInteraction($event)">
        Trigger something onInteraction and onExpanded and onCollapsed
    </igx-expansion-panel-header>
</igx-expansion-panel>`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
<igx-expansion-panel (contentExpanded)="handleExpanded($event)" (contentCollapsed)="handleCollapsed($event)">
    <igx-expansion-panel-header (interaction)="handleInteraction($event)">
        Trigger something onInteraction and onExpanded and onCollapsed
    </igx-expansion-panel-header>
</igx-expansion-panel>`);
    });

    it('should remove paging property and define a igx-paginator component instead', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-grid #grid1 [data]="data" [paging]="someVal" [perPage]="10" height="300px" width="300px">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
        <igx-grid #grid1 [data]="data" [perPage]="10" height="300px" width="300px">
<igx-paginator *ngIf="someVal"></igx-paginator>
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);
    });

    it('should remove paging and paginationTemplate property and define a igx-paginator component with custom content', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
<igx-grid #grid1 [data]="data" [paging]="true" [paginationTemplate]="customPager" height="300px" width="300px">
    <igx-column field="Name" header="Athlete"></igx-column>
    <igx-column field="TrackProgress" header="Track Progress"></igx-column>
    <igx-column field="CountryFlag" header="Country"></igx-column>
</igx-grid>
<ng-template #customPager let-api>
<div class="igx-grid__footer">
    <div id="numberPager" class="igx-paginator" style="justify-content: center;">
        <button [disabled]="firstPage" (click)="previousPage()" igxButton="flat">PREV</button>
        <button [disabled]="lastPage" (click)="nextPage()" igxButton="flat">NEXT</button>
    </div>
</div>
</ng-template>`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html').replace(lineBreaksAndSpaceRegex, ''))
            .toEqual(`
<igx-grid #grid1 [data]="data" height="300px" width="300px">
<igx-paginator>
<!-- Auto migrated template content. Please, check your bindings! -->

<igx-paginator-content>

<div class="igx-grid__footer">
    <div id="numberPager" class="igx-paginator" style="justify-content: center;">
        <button [disabled]="firstPage" (click)="previousPage()" igxButton="flat">PREV</button>
        <button [disabled]="lastPage" (click)="nextPage()" igxButton="flat">NEXT</button>
    </div>
</div>

        </igx-paginator-content>
</igx-paginator>
    <igx-column field="Name" header="Athlete"></igx-column>
    <igx-column field="TrackProgress" header="Track Progress"></igx-column>
    <igx-column field="CountryFlag" header="Country"></igx-column>
</igx-grid>
`.replace(lineBreaksAndSpaceRegex, ''));
    });

    it('should remove paging property and define a igx-paginator component instead in hGrid', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
<igx-hierarchical-grid [paging]="parentPaging">
    <igx-column></igx-column>
    <igx-row-island [paging]="childPaging">
        <igx-column></igx-column>
    </igx-row-island>
</igx-hierarchical-grid>`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
<igx-hierarchical-grid>
<igx-paginator *ngIf="parentPaging"></igx-paginator>
    <igx-column></igx-column>
    <igx-row-island>
<igx-paginator *igxPaginator *ngIf="childPaging"></igx-paginator>
        <igx-column></igx-column>
    </igx-row-island>
</igx-hierarchical-grid>`);
    });

    it('should remove paging property and paginationTemplate in hGrid', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
<igx-hierarchical-grid [paging]="parentPaging" [paginationTemplate]="myTemplate">
    <igx-column></igx-column>
    <igx-row-island [paging]="childPaging" [paginationTemplate]="childTemplate">
        <igx-column></igx-column>
    </igx-row-island>
</igx-hierarchical-grid>
<ng-template #myTemplate>
    <div>
        Current page: {{ hierarchicalGrid.page }}
    </div>
</ng-template>
<ng-template #childTemplate>
    <div>
        <button (click)="previous()">PREV</button>
        Current page: {{ hierarchicalGrid.page }}
        <button (click)="next()">NEXT</button>
    </div>
</ng-template>`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html').replace(lineBreaksAndSpaceRegex, ''))
            .toEqual(`
<igx-hierarchical-grid>
<igx-paginator *ngIf="parentPaging">
<!-- Auto migrated template content. Please, check your bindings! -->

<igx-paginator-content>

    <div>
        Current page: {{ hierarchicalGrid.page }}
    </div>

        </igx-paginator-content>
</igx-paginator>
    <igx-column></igx-column>
    <igx-row-island>
<igx-paginator *igxPaginator  *ngIf="childPaging">

<!-- Auto migrated template content. Please, check your bindings! -->

<igx-paginator-content>

    <div>
        <button (click)="previous()">PREV</button>
        Current page: {{ hierarchicalGrid.page }}
        <button (click)="next()">NEXT</button>
    </div>

        </igx-paginator-content>
</igx-paginator>

    <igx-column></igx-column>
    </igx-row-island>
    </igx-hierarchical-grid>`.replace(lineBreaksAndSpaceRegex, ''));
    });

    it('should define correctly paginator when using the component inside custom template', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
<igx-grid #grid1 [data]="data" [paging]="true" [paginationTemplate]="customPager" height="300px" width="300px">
    <igx-column field="Name" header="Athlete"></igx-column>
    <igx-column field="TrackProgress" header="Track Progress"></igx-column>
    <igx-column field="CountryFlag" header="Country"></igx-column>
</igx-grid>
<ng-template #customPager let-api>
<igx-paginator #paginator [(page)]="grid.page" [totalRecords]="grid.totalRecords" [(perPage)]="grid.perPage"
   [selectOptions]="selectOptions" [displayDensity]="grid.displayDensity">
        </igx-paginator>
</ng-template>`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html').replace(lineBreaksAndSpaceRegex, ''))
            .toEqual(`
<igx-grid #grid1 [data]="data" height="300px" width="300px">
<igx-paginator #paginator [(page)]="grid.page" [totalRecords]="grid.totalRecords" [(perPage)]="grid.perPage"
[selectOptions]="selectOptions" [displayDensity]="grid.displayDensity">
</igx-paginator>
    <igx-column field="Name" header="Athlete"></igx-column>
    <igx-column field="TrackProgress" header="Track Progress"></igx-column>
    <igx-column field="CountryFlag" header="Country"></igx-column>
</igx-grid>
`.replace(lineBreaksAndSpaceRegex, ''));
    });

});
