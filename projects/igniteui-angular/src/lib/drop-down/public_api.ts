import { NgModule } from '@angular/core';
import { IgxDropDownComponent } from './drop-down.component';
import { IgxDropDownItemComponent } from './drop-down-item.component';
import { IgxDropDownItemNavigationDirective } from './drop-down-navigation.directive';
import { CommonModule } from '@angular/common';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxSelectionAPIService } from '../core/selection';
import { IgxDropDownGroupComponent } from './drop-down-group.component';
import { IgxDropDownBaseDirective } from './drop-down.base';
import { IgxDropDownItemBaseDirective } from './drop-down-item.base';

export * from './drop-down.component';
export * from './drop-down-item.component';
export { ISelectionEventArgs, IDropDownNavigationDirective } from './drop-down.common';
export * from './drop-down-navigation.directive';
export * from './drop-down.base';
export * from './drop-down-item.base';
export * from './drop-down-group.component';

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxDropDownBaseDirective,
        IgxDropDownComponent,
        IgxDropDownItemBaseDirective,
        IgxDropDownItemComponent,
        IgxDropDownGroupComponent,
        IgxDropDownItemNavigationDirective
    ],
    exports: [
        IgxDropDownComponent,
        IgxDropDownItemComponent,
        IgxDropDownGroupComponent,
        IgxDropDownItemNavigationDirective
    ],
    imports: [
        CommonModule,
        IgxToggleModule
    ]
})
export class IgxDropDownModule { }
