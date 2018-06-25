import { IScrollStrategy } from './IScrollStrategy';
import { IgxOverlayService } from '../overlay';

export class BlockScrollStrategy implements IScrollStrategy {
    private _initialized = false;
    private _document: Document;
    private _initialScrollTop: number;
    private _initialScrollLeft: number;
    private _sourceElement: Element;

    constructor(scrollContainer?: HTMLElement) { }

    initialize(document: Document, overlayService: IgxOverlayService, id: string) {
        if (this._initialized) {
            return;
        }

        this._document = document;
        this._initialized = true;
    }

    public attach(): void {
        this._document.addEventListener('scroll', this.onScroll, true);
        this._document.addEventListener('wheel', this.onWheel, true);
    }

    public detach(): void {
        this._document.removeEventListener('scroll', this.onScroll, true);
        this._document.removeEventListener('wheel', this.onWheel, true);
        this._sourceElement = null;
        this._initialScrollTop = 0;
        this._initialScrollLeft = 0;
        this._initialized = false;
    }

    private onScroll = (ev: Event) => {
        ev.preventDefault();
        if (!this._sourceElement || this._sourceElement !== ev.srcElement) {
            this._sourceElement = ev.srcElement;
            this._initialScrollTop = this._sourceElement.scrollTop;
            this._initialScrollLeft = this._sourceElement.scrollLeft;
        }

        this._sourceElement.scrollTop = this._initialScrollTop;
        this._sourceElement.scrollLeft = this._initialScrollLeft;
    }

    private onWheel(ev: WheelEvent) {
        ev.stopImmediatePropagation();
        ev.preventDefault();
    }
}
