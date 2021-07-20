import {
    Component,
    ChangeDetectorRef,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    Host,
    EventEmitter,
    Output,
    ContentChild,
    Inject,
    ViewChild
} from '@angular/core';
import { IgxExpansionPanelIconDirective } from './expansion-panel.directives';
import { IGX_EXPANSION_PANEL_COMPONENT, IgxExpansionPanelBase, IExpansionPanelCancelableEventArgs  } from './expansion-panel.common';
import { mkenum } from '../core/utils';
import { IgxIconComponent } from '../icon/public_api';

/**
 * @hidden
 */
export const ExpansionPanelHeaderIconPosition = mkenum({
    LEFT: 'left',
    NONE: 'none',
    RIGHT: 'right'
});
export type ExpansionPanelHeaderIconPosition = (typeof ExpansionPanelHeaderIconPosition)[keyof typeof ExpansionPanelHeaderIconPosition];


@Component({
    selector: 'igx-expansion-panel-header',
    templateUrl: 'expansion-panel-header.component.html'
})
export class IgxExpansionPanelHeaderComponent {
    /**
     * Returns a reference to the `igx-expansion-panel-icon` element;
     * If `iconPosition` is `NONE` - return null;
     */
    public get iconRef(): ElementRef {
        const renderedTemplate = this.customIconRef  ?? this.defaultIconRef;
        return this.iconPosition !== ExpansionPanelHeaderIconPosition.NONE ? renderedTemplate : null;
    }

    /**
     * @hidden
     */
    @ContentChild(IgxExpansionPanelIconDirective)
    public set iconTemplate(val: boolean) {
        this._iconTemplate = val;
    }

    /**
     * @hidden
     */
    public get iconTemplate(): boolean {
        return this._iconTemplate;
    }

    /**
     * Gets/sets the `aria-level` attribute of the header
     * Get
     * ```typescript
     *  const currentAriaLevel = this.panel.header.lv;
     * ```
     * Set
     * ```typescript
     *  this.panel.header.lv = '5';
     * ```
     * ```html
     *  <igx-expansion-panel-header [lv]="myCustomLevel"></igx-expansion-panel-header>
     * ```
     */
    @HostBinding('attr.aria-level')
    @Input()
    public lv = '3';

    /**
     * Gets/sets the `role` attribute of the header
     * Get
     * ```typescript
     *  const currentRole = this.panel.header.role;
     * ```
     * Set
     * ```typescript
     *  this.panel.header.role = '5';
     * ```
     * ```html
     *  <igx-expansion-panel-header [role]="'custom'"></igx-expansion-panel-header>
     * ```
     */
    @HostBinding('attr.role')
    @Input()
    public role = 'heading';

    /**
     * @hidden
     */
    public get controls(): string {
        return this.panel.id;
    }

    /**
     * @hidden @internal
     */
    public get innerElement() {
        return this.elementRef.nativeElement.children[0];
    }

    /**
     * Gets/sets the position of the expansion-panel-header expand/collapse icon
     * Accepts `left`, `right` or `none`
     * ```typescript
     *  const currentIconPosition = this.panel.header.iconPosition;
     * ```
     * Set
     * ```typescript
     *  this.panel.header.iconPosition = 'left';
     * ```
     * ```html
     *  <igx-expansion-panel-header [iconPosition]="'right'"></igx-expansion-panel-header>
     * ```
     */
    @Input()
    public iconPosition: ExpansionPanelHeaderIconPosition = ExpansionPanelHeaderIconPosition.LEFT;

    /**
     * Emitted whenever a user interacts with the header host
     * ```typescript
     *  handleInteraction(event: IExpansionPanelCancelableEventArgs) {
     *  ...
     * }
     * ```
     * ```html
     *  <igx-expansion-panel-header (interaction)="handleInteraction($event)">
     *      ...
     *  </igx-expansion-panel-header>
     * ```
     */
    @Output()
    public interaction = new EventEmitter<IExpansionPanelCancelableEventArgs >();

    /**
     * @hidden
     */
    @HostBinding('class.igx-expansion-panel__header')
    public cssClass = 'igx-expansion-panel__header';

    /**
     * @hidden
     */
    @HostBinding('class.igx-expansion-panel__header--expanded')
    public get isExpanded() {
        return !this.panel.collapsed;
    }

    /**
     * Gets/sets the whether the header is disabled
     * When disabled, the header will not handle user events and will stop their propagation
     *
     * ```typescript
     *  const isDisabled = this.panel.header.disabled;
     * ```
     * Set
     * ```typescript
     *  this.panel.header.disabled = true;
     * ```
     * ```html
     *  <igx-expansion-panel-header [disabled]="true">
     *     ...
     *  </igx-expansion-panel-header>
     * ```
     */
    @Input()
    @HostBinding('class.igx-expansion-panel--disabled')
    public get disabled(): boolean {
        return this._disabled;
    };

    public set disabled(val: boolean) {
        this._disabled = val;
        if (val) {
            // V.S. June 11th, 2021: #9696 TabIndex should be removed when panel is disabled
            delete this.tabIndex;
        } else {
            this.tabIndex = 0;
        }
    };

    /** @hidden @internal */
    @ContentChild(IgxExpansionPanelIconDirective, { read: ElementRef })
    private customIconRef: ElementRef;

    /** @hidden @internal */
    @ViewChild(IgxIconComponent, { read: ElementRef })
    private defaultIconRef: ElementRef;

    /**
     * Sets/gets the `id` of the expansion panel header.
     * ```typescript
     * let panelHeaderId =  this.panel.header.id;
     * ```
     *
     * @memberof IgxExpansionPanelComponent
     */
    public id = '';

    /** @hidden @internal */
    public tabIndex = 0;

    // properties section
    private _iconTemplate = false;
    private _disabled = false;

    constructor(@Host() @Inject(IGX_EXPANSION_PANEL_COMPONENT) public panel: IgxExpansionPanelBase, public cdr: ChangeDetectorRef,
                public elementRef: ElementRef) {
        this.id = `${this.panel.id}-header`;
    }

    /**
     * @hidden
     */
    @HostListener('keydown.Enter', ['$event'])
    @HostListener('keydown.Space', ['$event'])
    @HostListener('keydown.Spacebar', ['$event'])
    @HostListener('click', ['$event'])
    public onAction(evt?: Event) {
        if (this.disabled) {
        evt.stopPropagation();
        return;
        }
        const eventArgs: IExpansionPanelCancelableEventArgs  = { event: evt, owner: this.panel, cancel: false };
        this.interaction.emit(eventArgs);
        if (eventArgs.cancel === true) {
            return;
        }
        this.panel.toggle(evt);
        evt.preventDefault();
    }

    /** @hidden @internal */
    @HostListener('keydown.Alt.ArrowDown', ['$event'])
    public openPanel(event: KeyboardEvent) {
        if (event.altKey) {
            const eventArgs: IExpansionPanelCancelableEventArgs  = { event, owner: this.panel, cancel: false };
            this.interaction.emit(eventArgs);
            if (eventArgs.cancel === true) {
                return;
            }
            this.panel.expand(event);
        }
     }

     /** @hidden @internal */
     @HostListener('keydown.Alt.ArrowUp', ['$event'])
     public closePanel(event: KeyboardEvent) {
        if (event.altKey) {
            const eventArgs: IExpansionPanelCancelableEventArgs  = { event, owner: this.panel, cancel: false };
            this.interaction.emit(eventArgs);
            if (eventArgs.cancel === true) {
                return;
            }
            this.panel.collapse(event);
        }
     }

     /**
      * @hidden
      */
     public get iconPositionClass(): string {
        switch (this.iconPosition) {
            case (ExpansionPanelHeaderIconPosition.LEFT):
                return `igx-expansion-panel__header-icon--start`;
            case (ExpansionPanelHeaderIconPosition.RIGHT):
                return `igx-expansion-panel__header-icon--end`;
            case (ExpansionPanelHeaderIconPosition.NONE):
                return `igx-expansion-panel__header-icon--none`;
            default:
                return '';
        }
     }
}
