import { Directive, Inject } from '@angular/core';
import { IgxColumnActionsBaseDirective } from './column-actions-base.directive';
import { IgxColumnComponent } from '../columns/column.component';
import { IgxColumnActionsComponent } from './column-actions.component';

@Directive({
    selector: '[igxColumnPinning]'
})
export class IgxColumnPinningDirective extends IgxColumnActionsBaseDirective {

    constructor(
        @Inject(IgxColumnActionsComponent) protected columnActions: IgxColumnActionsComponent
    ) {
        super();
        columnActions.actionsDirective = this;
    }

    /**
     * @hidden @internal
     */
    public checkAllLabel = this.columnActions.grid?.resourceStrings.igx_grid_pinning_check_all_label ?? 'Pin All';

    /**
     * @hidden @internal
     */
    public uncheckAllLabel = this.columnActions.grid?.resourceStrings.igx_grid_pinning_uncheck_all_label ?? 'Unpin All';

    /**
     * @hidden @internal
     */
    public checkAll() {
        this.columnActions.filteredColumns.forEach(c => c.pinned = true);
    }

    /**
     * @hidden @internal
     */
    public uncheckAll() {
        this.columnActions.filteredColumns.forEach(c => c.pinned = false);
    }

    /**
     * @hidden @internal
     */
    public actionEnabledColumnsFilter = c => !c.disablePinning && !c.level;

    /**
     * @hidden @internal
     */
    public columnChecked(column: IgxColumnComponent): boolean {
        return column.pinned;
    }

    /**
     * @hidden @internal
     */
    public toggleColumn(column: IgxColumnComponent) {
        column.pinned = !column.pinned;
    }
}
