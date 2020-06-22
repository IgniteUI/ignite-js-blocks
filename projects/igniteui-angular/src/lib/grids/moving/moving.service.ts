import { Injectable } from '@angular/core';
import { IgxColumnComponent } from '../columns/column.component';

/**
 * This enumeration is used to configure whether the pinning possition is set before or after
 * the target. DropPosition.None is acting like DropPosition.AfterDropTarget.
 */
export enum DropPosition {
    BeforeDropTarget,
    AfterDropTarget,
    None
}


/**
 * @hidden
 * @internal
 */
@Injectable({
    providedIn: 'root',
})
export class IgxColumnMovingService {
    private _icon: any;
    private _column: IgxColumnComponent;

    public cancelDrop: boolean;
    public isColumnMoving: boolean;

    get column(): IgxColumnComponent {
        return this._column;
    }
    set column(val: IgxColumnComponent) {
        if (val) {
            this._column = val;
        }
    }

    get icon(): any {
        return this._icon;
    }
    set icon(val: any) {
        if (val) {
            this._icon = val;
        }
    }
}
