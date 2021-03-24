import { QueryList } from '@angular/core';
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IgxTabItemComponent } from './tab-item.component';
import { IgxTabsAlignment, IgxTabsComponent } from './tabs.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { TabRoutingTestGuard } from './tab-routing-test-guard.spec';
import { TabsDisabledTestComponent, TabsRoutingDisabledTestComponent, TabsRoutingGuardTestComponent, TabsRoutingTestComponent,
    TabsTabsOnlyModeTest1Component, TabsTabsOnlyModeTest2Component, TabsTest2Component, TabsTestBug4420Component, TabsTestComponent,
    TabsTestCustomStylesComponent, TabsTestHtmlAttributesComponent, TabsTestSelectedTabComponent,
    TabsWithPrefixSuffixTestComponent, TemplatedTabsTestComponent } from '../../test-utils/tabs-components.spec';
import { IgxTabsModule } from './tabs.module';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxTabPanelComponent } from './tab-panel.component';
import { TabsRoutingViewComponentsModule,
        TabsRoutingView1Component,
        TabsRoutingView2Component,
        TabsRoutingView3Component,
        TabsRoutingView4Component,
        TabsRoutingView5Component } from './tabs-routing-view-components.spec';
import { IgxButtonModule } from '../../directives/button/button.directive';
import { IgxDropDownModule } from '../../drop-down/public_api';
import { IgxToggleModule } from '../../directives/toggle/toggle.directive';
import { IgxIconModule } from '../../icon/public_api';
import { IgxPrefixModule, IgxSuffixModule } from 'igniteui-angular';

const KEY_RIGHT_EVENT = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
const KEY_LEFT_EVENT = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
const KEY_HOME_EVENT = new KeyboardEvent('keydown', { key: 'Home', bubbles: true });
const KEY_END_EVENT = new KeyboardEvent('keydown', { key: 'End', bubbles: true });
const KEY_ENTER_EVENT = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
const KEY_SPACE_EVENT = new KeyboardEvent('keydown', { key: 'Spacebar', bubbles: true });

fdescribe('IgxTabs', () => {
    configureTestSuite();

    const tabItemNormalCssClass = 'igx-tabs__header-menu-item';
    const tabItemSelectedCssClass = 'igx-tabs__header-menu-item--selected';

    beforeAll(waitForAsync(() => {
        const testRoutes = [
            { path: 'view1', component: TabsRoutingView1Component, canActivate: [TabRoutingTestGuard] },
            { path: 'view2', component: TabsRoutingView2Component, canActivate: [TabRoutingTestGuard] },
            { path: 'view3', component: TabsRoutingView3Component, canActivate: [TabRoutingTestGuard] },
            { path: 'view4', component: TabsRoutingView4Component, canActivate: [TabRoutingTestGuard] },
            { path: 'view5', component: TabsRoutingView5Component, canActivate: [TabRoutingTestGuard] }
        ];

        TestBed.configureTestingModule({
            declarations: [TabsTestHtmlAttributesComponent, TabsTestComponent, TabsTest2Component, TemplatedTabsTestComponent,
                TabsRoutingDisabledTestComponent, TabsTestSelectedTabComponent, TabsTestCustomStylesComponent, TabsTestBug4420Component,
                TabsRoutingTestComponent, TabsTabsOnlyModeTest1Component, TabsTabsOnlyModeTest2Component, TabsDisabledTestComponent,
                TabsRoutingGuardTestComponent, TabsWithPrefixSuffixTestComponent],
            imports: [IgxTabsModule, BrowserAnimationsModule,
                IgxButtonModule, IgxIconModule, IgxDropDownModule, IgxToggleModule,
                TabsRoutingViewComponentsModule, IgxPrefixModule, IgxSuffixModule, RouterTestingModule.withRoutes(testRoutes)],
            providers: [TabRoutingTestGuard]
        }).compileComponents();
    }));

    describe('IgxTabs Html Attributes', () => {
        let fixture;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(TabsTestHtmlAttributesComponent);
        }));

        it('should set the correct attributes on the html elements', fakeAsync(() => {
            fixture.detectChanges();

            const igxTabs = document.querySelectorAll('igx-tabs');
            expect(igxTabs.length).toBe(2);

            igxTabs.forEach((tab, i) => {
                const tabHeaders = tab.querySelectorAll('igx-tab-header');
                const tabPanels = tab.querySelectorAll('igx-tab-panel');
                expect(tabHeaders.length).toBe(3);
                expect(tabPanels.length).toBe(3);

                for (let itemIndex = 0; itemIndex < 3; itemIndex++) {
                    const headerId = `igx-tabs-header-${itemIndex + 3 * i}`;
                    const panelId = `igx-tabs-panel-${itemIndex + 3 * i}`;

                    expect(tabHeaders[itemIndex].id).toEqual(headerId);
                    expect(tabPanels[itemIndex].id).toEqual(panelId);

                    expect(tabHeaders[itemIndex].getAttribute('aria-controls')).toEqual(panelId);
                    expect(tabPanels[itemIndex].getAttribute('aria-labelledby')).toEqual(headerId);
                }
            });
        }));
    });

    describe('IgxTabs Component with static Panels Definitions', () => {
        let fixture;
        let tabs;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(TabsTestComponent);
            fixture.detectChanges();
            tabs = fixture.componentInstance.tabs;
        }));

        it('should initialize igx-tabs, igx-tab-panel and igx-tab-item', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();

            const panels: IgxTabPanelComponent[] = tabs.panels.toArray();
            const tabsItems: IgxTabItemComponent[] = tabs.items.toArray();

            expect(tabs).toBeDefined();
            expect(tabs instanceof IgxTabsComponent).toBeTruthy();
            expect(tabs.panels instanceof QueryList).toBeTruthy();
            expect(tabs.panels.length).toBe(3);

            for (let i = 0; i < tabs.panels.length; i++) {
                expect(panels[i] instanceof IgxTabPanelComponent).toBeTruthy();
                expect(panels[i].tab).toBe(tabsItems[i]);
            }

            expect(tabs.items.length).toBe(3);

            for (let i = 0; i < tabs.items.length; i++) {
                expect(tabsItems[i] instanceof IgxTabItemComponent).toBeTruthy();
                expect(tabsItems[i].panelComponent).toBe(panels[i]);
            }
            tick();
        }));

        it('should initialize default values of properties', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(0);

            tick(100);
            fixture.detectChanges();

            const tabItems = tabs.items.toArray();
            expect(tabItems[0].disabled).toBe(false);
            expect(tabItems[1].disabled).toBe(false);
        }));

        it('should initialize set/get properties', fakeAsync(() => {
            const icons = ['library_music', 'video_library', 'library_books'];

            tick(100);
            fixture.detectChanges();

            const tabItems = tabs.items.toArray();
            const tabHeaders = tabItems.map(item => item.headerComponent);
            const tabHeaderElements = tabHeaders.map(item => item.nativeElement);

            for (let i = 0; i < tabHeaderElements.length; i++) {
                const headerDiv = tabHeaderElements[i].firstChild;
                expect(headerDiv.firstChild.localName).toBe('igx-icon');
                expect(headerDiv.firstChild.innerText).toBe(icons[i]);
                expect(headerDiv.lastChild.localName).toBe('span');
                expect(headerDiv.lastChild.innerText).toBe('Tab ' + (i + 1));
            }
            tick();
        }));

        it('should select/deselect tabs', fakeAsync(() => {
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(0);

            tick(100);
            fixture.detectChanges();
            const tabItems = tabs.items.toArray();
            const tab1: IgxTabItemComponent = tabItems[0];
            const tab2: IgxTabItemComponent = tabItems[1];

            tab2.selected = true;

            tick(100);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(1);
            expect(tabs.selectedItem).toBe(tab2);
            expect(tab2.selected).toBeTruthy();
            expect(tab1.selected).toBeFalsy();

            tab1.selected = true;

            tick(100);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(0);
            expect(tabs.selectedItem).toBe(tab1);
            expect(tab1.selected).toBeTruthy();
            expect(tab2.selected).toBeFalsy();

            // Disabled tab is selectable programmatically
            tab2.disabled = true;
            tick(100);
            fixture.detectChanges();

            tab2.selected = true;

            tick(100);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(1);
            expect(tabs.selectedItem).toBe(tab2);
            expect(tab2.selected).toBeTruthy();
            expect(tab1.selected).toBeFalsy();
        }));

        it('should select next/previous tab when pressing right/left arrow', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();
            const headers = tabs.items.map(item => item.headerComponent.nativeElement);

            headers[0].focus();
            headers[0].dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(1);

            headers[1].dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            headers[2].dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);

            headers[0].dispatchEvent(KEY_LEFT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            headers[2].dispatchEvent(KEY_LEFT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(1);
        }));

        it('should select first/last tab when pressing home/end button', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();
            const headers = tabs.items.map(item => item.headerComponent.nativeElement);

            headers[0].focus();
            headers[0].dispatchEvent(KEY_END_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            headers[2].dispatchEvent(KEY_HOME_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);
        }));

        it('should scroll tab area when clicking left/right scroll buttons', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();

            fixture.componentInstance.wrapperDiv.nativeElement.style.width = '200px';
            tick(100);
            fixture.detectChanges();

            const rightScrollButton = tabs.headerContainer.nativeElement.children[2];
            window.dispatchEvent(new Event('resize'));
            rightScrollButton.dispatchEvent(new Event('click', { bubbles: true }));

            tick(100);
            fixture.detectChanges();
            expect(tabs.offset).toBeGreaterThan(0);

            tabs.scrollLeft(null);

            tick(100);
            fixture.detectChanges();
            expect(tabs.offset).toBe(0);
        }));

        it('should select tab on click', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();
            const headers = tabs.items.map(item => item.headerComponent.nativeElement);

            fixture.componentInstance.wrapperDiv.nativeElement.style.width = '400px';
            tick(100);
            fixture.detectChanges();

            headers[2].dispatchEvent(new Event('click', { bubbles: true }));
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            headers[0].dispatchEvent(new Event('click', { bubbles: true }));
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);
        }));

        it('should not select disabled tabs when navigating with left/right/home/end', fakeAsync(() => {
            fixture = TestBed.createComponent(TabsDisabledTestComponent);
            tabs = fixture.componentInstance.tabs;
            tick(100);
            fixture.detectChanges();
            const headerElements = tabs.items.map(item => item.headerComponent.nativeElement);

            headerElements[1].click();
            headerElements[1].dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(3);

            headerElements[3].dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(1);

            headerElements[1].dispatchEvent(KEY_LEFT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(3);

            headerElements[3].dispatchEvent(KEY_LEFT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(1);

            headerElements[1].dispatchEvent(KEY_END_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(3);

            headerElements[3].dispatchEvent(KEY_HOME_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(1);
        }));
    });

    describe('IgxTabs Component with custom content in headers', () => {
        let fixture;
        let tabs;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(TemplatedTabsTestComponent);
            tabs = fixture.componentInstance.tabs;
        }));

        it('should initialize igx-tab-header with custom content', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();
            expect(tabs.items.length).toBe(3);
            const headerDivs = tabs.items.map(item => item.headerComponent.nativeElement.firstChild); //Get header's div containers

            headerDivs.forEach((header, i) => {
                expect(header.firstChild.innerText).toBe(`T${i + 1}`);
                expect(header.lastChild.innerText).toBe(`Tab ${i + 1}`);
            });
            tick();
        }));

        it('should change selection in runtime using selectedIndex', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();

            const tabsItems = tabs.items.toArray();
            expect(tabs.selectedIndex).toBe(0);
            expect(tabs.selectedItem).toBe(tabsItems[0]);

            tabs.selectedIndex = 2;
            tick(100);
            fixture.detectChanges();

            expect(tabs.selectedItem).toBe(tabsItems[2]);
            expect(tabs.selectedItem.headerComponent.nativeElement.firstChild.lastChild.innerText).toBe('Tab 3');
        }));

    });

    describe('IgxTabs Miscellaneous Tests', () => {

        it('check selection when tabs collection is modified', fakeAsync(() => {
            const fixture = TestBed.createComponent(TabsTest2Component);
            const tabs = fixture.componentInstance.tabs;
            fixture.detectChanges();

            tick(100);
            fixture.detectChanges();

            const tabItems = tabs.items.toArray();
            const tab3: IgxTabItemComponent = tabItems[2];

            tick(100);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);

            tab3.selected = true;
            tick(200);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(2);

            fixture.componentInstance.resetCollectionFourTabs();
            fixture.detectChanges();
            tick(200);
            expect(tabs.selectedIndex).toBe(2);

            fixture.componentInstance.resetCollectionOneTab();
            tick(100);
            fixture.detectChanges();

            tick(100);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);

            fixture.componentInstance.resetCollectionTwoTabs();
            tick(100);
            fixture.detectChanges();

            tick(100);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);

            fixture.componentInstance.resetToEmptyCollection();
            tick(100);
            fixture.detectChanges();

            tick(100);
            fixture.detectChanges();
            expect(tabs.panels.length).toBe(0);
            expect(tabs.selectedItem).toBe(null);
        }));

        it('should select third tab by default', fakeAsync(() => {
            const fixture = TestBed.createComponent(TabsTestSelectedTabComponent);
            const tabs = fixture.componentInstance.tabs;

            tick(100);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            tick(100);
            fixture.detectChanges();
            expect(tabs.items.toArray()[2].selected).toBeTruthy();

            tick(100);
            fixture.detectChanges();
            expect(tabs.selectedIndicator.nativeElement.style.transform).toBe('translate(180px)');
        }));

        it('tabs in drop down, bug #4420 - check selection indicator width', fakeAsync(() => {
            const fixture = TestBed.createComponent(TabsTestBug4420Component);
            const dom = fixture.debugElement;
            const tabs = fixture.componentInstance.tabs;
            tick(50);
            fixture.detectChanges();

            const button = dom.query(By.css('.igx-button--flat'));
            UIInteractions.simulateClickAndSelectEvent(button);
            tick(50);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(1);
            const selectedPanel = document.getElementsByTagName('igx-tab-panel')[1] as HTMLElement;
            expect(selectedPanel.innerText.trim()).toEqual('Tab content 2');
            const indicator = dom.query(By.css('.igx-tabs__header-menu-item-indicator'));
            expect(indicator.nativeElement.style.width).toBe('90px');
        }));

    });

    describe('Routing Navigation Tests', () => {
        let router;
        let location;
        let fixture;
        let tabsComp;
        let headerElements;
        let tabItems;

        beforeEach(waitForAsync(() => {
            router = TestBed.inject(Router);
            location = TestBed.inject(Location);
            fixture = TestBed.createComponent(TabsRoutingTestComponent);
            tabsComp = fixture.componentInstance.tabs;
            fixture.detectChanges();
            tabItems = tabsComp.items.toArray();
            headerElements = tabItems.map(item => item.headerComponent.nativeElement);
        }));

        it('should navigate to the correct URL when clicking on tab buttons', fakeAsync(() => {
            fixture.ngZone.run(() => router.initialNavigation());
            tick();
            expect(location.path()).toBe('/');

            fixture.ngZone.run(() => {
                UIInteractions.simulateClickAndSelectEvent(headerElements[2]);
            });
            tick();
            expect(location.path()).toBe('/view3');

            fixture.ngZone.run(() => {
                UIInteractions.simulateClickAndSelectEvent(headerElements[1]);
            });
            tick();
            expect(location.path()).toBe('/view2');

            fixture.ngZone.run(() => {
                UIInteractions.simulateClickAndSelectEvent(headerElements[0]);
            });
            tick();
            expect(location.path()).toBe('/view1');
        }));

        it('should select the correct tab button/panel when navigating an URL', fakeAsync(() => {
            fixture.ngZone.run(() => router.initialNavigation());
            tick();
            expect(location.path()).toBe('/');

            fixture.ngZone.run(() => {
                router.navigate(['/view3']);
            });
            tick();
            expect(location.path()).toBe('/view3');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(2);
            expect(tabItems[2].selected).toBe(true);
            expect(tabItems[0].selected).toBe(false);
            expect(tabItems[1].selected).toBe(false);

            fixture.ngZone.run(() => {
                router.navigate(['/view2']);
            });
            tick();
            expect(location.path()).toBe('/view2');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(1);
            expect(tabItems[1].selected).toBe(true);
            expect(tabItems[0].selected).toBe(false);
            expect(tabItems[2].selected).toBe(false);

            fixture.ngZone.run(() => {
                router.navigate(['/view1']);
            });
            tick();
            expect(location.path()).toBe('/view1');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(tabItems[0].selected).toBe(true);
            expect(tabItems[1].selected).toBe(false);
            expect(tabItems[2].selected).toBe(false);
        }));

        it('should focus next/previous tab when pressing right/left arrow', fakeAsync(() => {
            headerElements[0].click();
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);

            headerElements[0].dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[1]);

            headerElements[1].dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[2]);

            headerElements[2].dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[0]);

            headerElements[0].dispatchEvent(KEY_LEFT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[2]);

            headerElements[2].dispatchEvent(KEY_LEFT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[1]);
        }));

        it('should focus first/last tab when pressing home/end button', fakeAsync(() => {
            headerElements[0].click();
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);

            headerElements[0].dispatchEvent(KEY_END_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[2]);

            headerElements[2].dispatchEvent(KEY_HOME_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[0]);
        }));

        it('should select focused tabs on enter/space', fakeAsync(() => {
            headerElements[0].click();
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);

            headerElements[0].dispatchEvent(KEY_LEFT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[2]);

            headerElements[2].dispatchEvent(KEY_ENTER_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(2);
            expect(document.activeElement).toBe(headerElements[2]);

            headerElements[2].dispatchEvent(KEY_HOME_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(2);
            expect(document.activeElement).toBe(headerElements[0]);

            headerElements[0].dispatchEvent(KEY_SPACE_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[0]);
        }));

        it('should not focus disabled tabs when navigating with keyboard', fakeAsync(() => {
            fixture = TestBed.createComponent(TabsRoutingDisabledTestComponent);
            tabsComp = fixture.componentInstance.tabs;
            fixture.detectChanges();
            tabItems = tabsComp.items.toArray();
            headerElements = tabItems.map(item => item.headerComponent.nativeElement);

            headerElements[1].click();
            tick(200);
            fixture.detectChanges();

            headerElements[1].dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(document.activeElement).toBe(headerElements[3]);

            headerElements[3].dispatchEvent(KEY_HOME_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(document.activeElement).toBe(headerElements[1]);

            headerElements[1].dispatchEvent(KEY_LEFT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(document.activeElement).toBe(headerElements[3]);
        }));

        it('should not navigate to an URL blocked by activate guard', fakeAsync(() => {
            fixture = TestBed.createComponent(TabsRoutingGuardTestComponent);
            tabsComp = fixture.componentInstance.tabs;
            fixture.detectChanges();
            tabItems = tabsComp.items.toArray();
            headerElements = tabItems.map(item => item.headerComponent.nativeElement);

            fixture.ngZone.run(() => {
 router.initialNavigation();
});
            tick();
            expect(location.path()).toBe('/');

            fixture.ngZone.run(() => {
 UIInteractions.simulateClickAndSelectEvent(headerElements[0]);
});
            tick();
            expect(location.path()).toBe('/view1');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(tabItems[0].selected).toBe(true);
            expect(tabItems[1].selected).toBe(false);

            fixture.ngZone.run(() => {
 UIInteractions.simulateClickAndSelectEvent(headerElements[1]);
});
            tick();
            expect(location.path()).toBe('/view1');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(tabItems[0].selected).toBe(true);
            expect(tabItems[1].selected).toBe(false);
        }));

    });

    describe('Tabs-only Mode With Initial Selection Set on TabItems Tests', () => {
        let fixture;
        let tabsComp;
        let tabItems;
        let headerElements;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(TabsTabsOnlyModeTest1Component);
            tabsComp = fixture.componentInstance.tabs;
            fixture.detectChanges();
            tabItems = tabsComp.items.toArray();
            headerElements = tabItems.map(item => item.headerComponent.nativeElement);
        }));

        it('should retain the correct initial selection set by the isSelected property', () => {
            expect(tabItems[0].selected).toBe(false);
            expect(headerElements[0].classList.contains(tabItemNormalCssClass)).toBe(true);

            expect(tabItems[1].selected).toBe(true);
            expect(headerElements[1].classList.contains(tabItemSelectedCssClass)).toBe(true);

            expect(tabItems[2].selected).toBe(false);
            expect(headerElements[2].classList.contains(tabItemNormalCssClass)).toBe(true);
        });

        it('should hide the selection indicator when no tab item is selected', () => {
            expect(tabsComp.selectedIndicator.nativeElement.style.visibility).toBe('visible');
            tabItems[1].selected = false;
            fixture.detectChanges();
            expect(tabsComp.selectedIndicator.nativeElement.style.visibility).toBe('hidden');
        });
    });

    describe('Tabs-only Mode With Initial Selection Set on Tabs Component Tests', () => {
        let fixture;
        let tabsComp;
        let tabItems;
        let headerElements;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(TabsTabsOnlyModeTest2Component);
            tabsComp = fixture.componentInstance.tabs;
            fixture.detectChanges();
            tabItems = tabsComp.items.toArray();
            headerElements = tabItems.map(item => item.headerComponent.nativeElement);
        }));

        it('should retain the correct initial selection set by the selectedIndex property', () => {
            fixture.detectChanges();

            expect(tabItems[0].selected).toBe(false);
            expect(headerElements[0].classList.contains(tabItemNormalCssClass)).toBe(true);

            expect(tabItems[1].selected).toBe(false);
            expect(headerElements[1].classList.contains(tabItemNormalCssClass)).toBe(true);

            expect(tabItems[2].selected).toBe(true);
            expect(headerElements[2].classList.contains(tabItemSelectedCssClass)).toBe(true);
        });

    });

    describe('Events', () => {
        let fixture;
        let tabs;
        let tabItems;
        let headers;
        let itemChangeSpy;
        let indexChangeSpy;
        let indexChangingSpy;

        describe('', () => {
            beforeEach(waitForAsync(() => {
                fixture = TestBed.createComponent(TabsTestComponent);
                fixture.detectChanges();
                tabs = fixture.componentInstance.tabs;
                tabItems = tabs.items.toArray();
                headers = tabItems.map(item => item.headerComponent.nativeElement);
                itemChangeSpy = spyOn(tabs.selectedItemChange, 'emit').and.callThrough();
                indexChangeSpy = spyOn(tabs.selectedIndexChange, 'emit').and.callThrough();
                indexChangingSpy = spyOn(tabs.selectedIndexChanging, 'emit').and.callThrough();
            }));

            it('Validate the fired events on clicking tab headers.', fakeAsync(() => {
                tick(100);

                headers[1].dispatchEvent(new Event('click', { bubbles: true }));
                tick(200);
                fixture.detectChanges();
                expect(tabs.selectedIndex).toBe(1);

                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: false,
                    oldIndex: 0,
                    newIndex: 1
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(1);
                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    oldItem: tabItems[0],
                    newItem: tabItems[1]
                });
            }));

            it('Cancel selectedIndexChanging event.', fakeAsync(() => {
                tick(100);
                tabs.selectedIndexChanging.pipe().subscribe((e) => e.cancel = true);
                fixture.detectChanges();

                headers[1].dispatchEvent(new Event('click', { bubbles: true }));
                tick(200);
                fixture.detectChanges();
                expect(tabs.selectedIndex).toBe(0);

                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: true,
                    oldIndex: 0,
                    newIndex: 1
                });
                expect(itemChangeSpy).not.toHaveBeenCalled();
                expect(indexChangeSpy).not.toHaveBeenCalled();
            }));

            it('Validate the fired events when navigating between tabs with left and right arrows.', fakeAsync(() => {
                tick(100);

                headers[0].focus();
                headers[0].dispatchEvent(KEY_RIGHT_EVENT);
                tick(200);
                fixture.detectChanges();
                expect(tabs.selectedIndex).toBe(1);

                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: false,
                    oldIndex: 0,
                    newIndex: 1
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(1);
                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    oldItem: tabItems[0],
                    newItem: tabItems[1]
                });

                headers[1].dispatchEvent(KEY_LEFT_EVENT);
                tick(200);
                fixture.detectChanges();
                expect(tabs.selectedIndex).toBe(0);

                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: false,
                    oldIndex: 1,
                    newIndex: 0
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(0);
                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    oldItem: tabItems[1],
                    newItem: tabItems[0]
                });
            }));

            it('Validate the fired events when navigating between tabs with home and end keys.', fakeAsync(() => {
                tick(100);

                headers[0].focus();
                headers[0].dispatchEvent(KEY_END_EVENT);
                tick(200);
                fixture.detectChanges();
                expect(tabs.selectedIndex).toBe(2);

                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    oldItem: tabItems[0],
                    newItem: tabItems[2]
                });
                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: false,
                    oldIndex: 0,
                    newIndex: 2
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(2);

                headers[2].dispatchEvent(KEY_HOME_EVENT);
                tick(200);
                fixture.detectChanges();
                expect(tabs.selectedIndex).toBe(0);

                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    oldItem: tabItems[2],
                    newItem: tabItems[0]
                });
                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: false,
                    oldIndex: 2,
                    newIndex: 0
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(0);
            }));
        });

        describe('& Routing', () => {
            let router;
            let location;
            beforeEach(waitForAsync(() => {
                router = TestBed.inject(Router);
                location = TestBed.inject(Location);
                fixture = TestBed.createComponent(TabsRoutingTestComponent);
                tabs = fixture.componentInstance.tabs;
                fixture.detectChanges();
                tabItems = tabs.items.toArray();
                headers = tabItems.map(item => item.headerComponent.nativeElement);
                itemChangeSpy = spyOn(tabs.selectedItemChange, 'emit');
                indexChangeSpy = spyOn(tabs.selectedIndexChange, 'emit');
                indexChangingSpy = spyOn(tabs.selectedIndexChanging, 'emit');
            }));

            it('Validate the events are not fired on clicking tab headers before pressing enter/space key.', fakeAsync(() => {
                fixture.ngZone.run(() => router.initialNavigation());
                tick();
                expect(location.path()).toBe('/');

                fixture.ngZone.run(() => {
                    UIInteractions.simulateClickAndSelectEvent(headers[1]);
                });
                tick();
                expect(location.path()).toBe('/view2');
                expect(tabs.selectedIndex).toBe(-1);

                expect(indexChangingSpy).not.toHaveBeenCalled();
                expect(indexChangeSpy).not.toHaveBeenCalled();
                expect(itemChangeSpy).not.toHaveBeenCalled();

                headers[1].dispatchEvent(KEY_ENTER_EVENT);
                tick(200);
                fixture.detectChanges();

                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    oldItem: undefined,
                    newItem: tabItems[1]
                });
                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: false,
                    oldIndex: -1,
                    newIndex: 1
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(1);
            }));

            it('Validate the events are not fired when navigating between tabs with arrow keys before pressing enter/space key.',
                fakeAsync(() => {
                    tick(100);
                    headers[0].focus();

                    headers[0].dispatchEvent(KEY_LEFT_EVENT);
                    tick(200);
                    fixture.detectChanges();

                    expect(indexChangingSpy).not.toHaveBeenCalled();
                    expect(indexChangeSpy).not.toHaveBeenCalled();
                    expect(itemChangeSpy).not.toHaveBeenCalled();

                    headers[2].dispatchEvent(KEY_ENTER_EVENT);
                    tick(200);
                    fixture.detectChanges();

                    expect(itemChangeSpy).toHaveBeenCalledWith({
                        owner: tabs,
                        oldItem: tabItems[0],
                        newItem: tabItems[2]
                    });
                    expect(indexChangingSpy).toHaveBeenCalledWith({
                        owner: tabs,
                        cancel: false,
                        oldIndex: -1,
                        newIndex: 2
                    });
                    expect(indexChangeSpy).toHaveBeenCalledWith(2);

                    expect(indexChangingSpy).toHaveBeenCalledTimes(1);
                    expect(indexChangeSpy).toHaveBeenCalledTimes(1);
                    expect(itemChangeSpy).toHaveBeenCalledTimes(1);

                    headers[2].dispatchEvent(KEY_RIGHT_EVENT);
                    tick(200);
                    fixture.detectChanges();

                    expect(indexChangingSpy).toHaveBeenCalledTimes(1);
                    expect(indexChangeSpy).toHaveBeenCalledTimes(1);
                    expect(itemChangeSpy).toHaveBeenCalledTimes(1);

                    headers[0].dispatchEvent(KEY_SPACE_EVENT);
                    tick(200);
                    fixture.detectChanges();

                    expect(itemChangeSpy).toHaveBeenCalledWith({
                        owner: tabs,
                        oldItem: tabItems[2],
                        newItem: tabItems[0]
                    });
                    expect(indexChangingSpy).toHaveBeenCalledWith({
                        owner: tabs,
                        cancel: false,
                        oldIndex: 2,
                        newIndex: 0
                    });
                    expect(indexChangeSpy).toHaveBeenCalledWith(0);

                    expect(indexChangingSpy).toHaveBeenCalledTimes(2);
                    expect(indexChangeSpy).toHaveBeenCalledTimes(2);
                    expect(itemChangeSpy).toHaveBeenCalledTimes(2);
            }));

            it('Validate the events are not fired when navigating between tabs with home/end before pressing enter/space key.',
                fakeAsync(() => {
                    tick(100);
                    headers[0].focus();

                    headers[0].dispatchEvent(KEY_END_EVENT);
                    tick(200);
                    fixture.detectChanges();

                    expect(indexChangingSpy).not.toHaveBeenCalled();
                    expect(indexChangeSpy).not.toHaveBeenCalled();
                    expect(itemChangeSpy).not.toHaveBeenCalled();

                    headers[2].dispatchEvent(KEY_ENTER_EVENT);
                    tick(200);
                    fixture.detectChanges();

                    expect(itemChangeSpy).toHaveBeenCalledWith({
                        owner: tabs,
                        oldItem: undefined,
                        newItem: tabItems[2]
                    });
                    expect(indexChangingSpy).toHaveBeenCalledWith({
                        owner: tabs,
                        cancel: false,
                        oldIndex: -1,
                        newIndex: 2
                    });
                    expect(indexChangeSpy).toHaveBeenCalledWith(2);
                    expect(indexChangingSpy).toHaveBeenCalledTimes(1);
                    expect(indexChangeSpy).toHaveBeenCalledTimes(1);
                    expect(itemChangeSpy).toHaveBeenCalledTimes(1);

                    headers[2].dispatchEvent(KEY_HOME_EVENT);
                    tick(200);
                    fixture.detectChanges();

                    expect(indexChangingSpy).toHaveBeenCalledTimes(1);
                    expect(indexChangeSpy).toHaveBeenCalledTimes(1);
                    expect(itemChangeSpy).toHaveBeenCalledTimes(1);

                    headers[0].dispatchEvent(KEY_SPACE_EVENT);
                    tick(200);
                    fixture.detectChanges();

                    expect(itemChangeSpy).toHaveBeenCalledWith({
                        owner: tabs,
                        oldItem: tabItems[2],
                        newItem: tabItems[0]
                    });
                    expect(indexChangingSpy).toHaveBeenCalledWith({
                        owner: tabs,
                        cancel: false,
                        oldIndex: 2,
                        newIndex: 0
                    });
                    expect(indexChangeSpy).toHaveBeenCalledWith(0);

                    expect(indexChangingSpy).toHaveBeenCalledTimes(2);
                    expect(indexChangeSpy).toHaveBeenCalledTimes(2);
                    expect(itemChangeSpy).toHaveBeenCalledTimes(2);
            }));

        });
    });
    describe('', () => {
        let fixture;
        let tabs;
        let tabItems;
        let headers;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(TabsWithPrefixSuffixTestComponent);
            fixture.detectChanges();
            tabs = fixture.componentInstance.tabs;
            tabItems = tabs.items.toArray();
            headers = tabItems.map(item => item.headerComponent.nativeElement);
        }));

        it('show tabs prefix and suffix properly.', () => {
            const header0Elements = headers[0].children;
            expect(header0Elements[0].localName).toBe('span');
            expect(header0Elements[0].innerText).toBe('Test:');
            expect(header0Elements[1].children[0].localName).toBe('igx-icon');
            expect(header0Elements[1].children[0].innerText).toBe('library_music');
            expect(header0Elements[1].children[1].localName).toBe('span');
            expect(header0Elements[1].children[1].innerText).toBe('Tab 1');
            expect(header0Elements[2].localName).toBe('igx-icon');
            expect(header0Elements[2].innerText).toBe('close');

            const header1Elements = headers[1].children;
            expect(header1Elements[0].localName).toBe('span');
            expect(header1Elements[0].innerText).toBe('Test:');
            expect(header1Elements[1].children[0].localName).toBe('igx-icon');
            expect(header1Elements[1].children[0].innerText).toBe('video_library');
            expect(header1Elements[1].children[1].localName).toBe('span');
            expect(header1Elements[1].children[1].innerText).toBe('Tab 2');

            const header2Elements = headers[2].children;
            expect(header2Elements[0].children[0].localName).toBe('igx-icon');
            expect(header2Elements[0].children[0].innerText).toBe('library_books');
            expect(header2Elements[0].children[1].localName).toBe('span');
            expect(header2Elements[0].children[1].innerText).toBe('Tab 3');
            expect(header2Elements[1].localName).toBe('igx-icon');
            expect(header2Elements[1].innerText).toBe('close');
        });

        it('aligns tab header content properly when tabAlignment="justify".', () => {
            tabs.tabAlignment = IgxTabsAlignment.justify;
            fixture.detectChanges();
            // const headerContainerWidth = tabs.headerContainer.nativeElement.clientWidth;

            expect(tabs.justifyAlignmentClass).toBeTrue();
            const headerWidths = new Set<number>();
            headers.every((elem) => headerWidths.add(elem.clientWidth));

            expect(headerWidths.size).toBe(1);
            // expect([...headerWidths][0]).toBeCloseTo(headerContainerWidth / tabItems.length);
        });

        it('aligns tab header content properly when tabAlignment="center".', () => {
            tabs.tabAlignment = IgxTabsAlignment.center;
            fixture.detectChanges();

            expect(tabs.centerAlignmentClass).toBeTrue();

            const headerWidths = new Set<number>();
            headers.every((elem) => headerWidths.add(elem.clientWidth));

            expect(headerWidths.size).toBe(1);
        });

        it('aligns tab header content properly when tabAlignment="start".', () => {
            tabs.tabAlignment = IgxTabsAlignment.start;
            fixture.detectChanges();

            expect(tabs.startAlignmentClass).toBeTrue();

            const headerWidths = new Set<number>();
            headers.every((elem) => headerWidths.add(elem.clientWidth));

            expect(headerWidths.size).toBe(1);
        });

        it('aligns tab header content properly when tabAlignment="end".', () => {
            tabs.tabAlignment = IgxTabsAlignment.end;
            fixture.detectChanges();

            expect(tabs.endAlignmentClass).toBeTrue();

            const headerWidths = new Set<number>();
            headers.every((elem) => headerWidths.add(elem.clientWidth));

            expect(headerWidths.size).toBe(1);
        });
    });

});
