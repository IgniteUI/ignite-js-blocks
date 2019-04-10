import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxChipsModule } from '../../chips/chips.module';
import { IgxGridCommonModule } from '../grid-common.module';
import { IgxGridModule } from '../grid/grid.module';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxGridHierarchicalPipe, IgxGridHierarchicalPagingPipe } from './hierarchical-grid.pipes';
import { IgxRowIslandComponent } from './row-island.component';
import { IgxChildGridRowComponent } from './child-grid-row.component';
import { IgxHierarchicalGridCellComponent } from './hierarchical-cell.component';
import { IgxHierarchicalSelectionAPIService } from './selection';
import { IgxRowIslandAPIService } from './row-island-api.service';

/**
 * @hidden
 */
@NgModule({
  declarations: [
    IgxHierarchicalGridComponent,
    IgxHierarchicalRowComponent,
    IgxRowIslandComponent,
    IgxChildGridRowComponent,
    IgxHierarchicalGridCellComponent,
    IgxGridHierarchicalPipe,
    IgxGridHierarchicalPagingPipe
  ],
  exports: [
    IgxGridModule,
    IgxHierarchicalGridComponent,
    IgxHierarchicalRowComponent,
    IgxHierarchicalGridCellComponent,
    IgxRowIslandComponent,
    IgxChildGridRowComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IgxChipsModule,
    IgxGridModule
  ],
  providers: [
    IgxRowIslandAPIService,
    IgxHierarchicalSelectionAPIService
  ]
})
export class IgxHierarchicalGridModule {
}
