import { IScrollStrategy } from './IScrollStrategy';
import { IgxOverlayService } from '../overlay';

export class AbsoluteScrollStrategy implements IScrollStrategy {
    private _initialized = false;
    private _document: Document;
    private _overlayService: IgxOverlayService;
    private _id: string;
    private _scrollContainer: HTMLElement;

    constructor(scrollContainer?: HTMLElement) {
        this._scrollContainer = scrollContainer;
    }

    initialize(document: Document, overlayService: IgxOverlayService, id: string) {
        if (this._initialized) {
            return;
        }
        this._overlayService = overlayService;
        this._id = id;
        this._document = document;
        this._initialized = true;
    }

    attach(): void {
        if (this._scrollContainer) {
            this._scrollContainer.addEventListener('scroll', this.onScroll, true);
        } else {
            this._document.addEventListener('scroll', this.onScroll, true);
        }
    }

    detach(): void {
        if (this._scrollContainer) {
            this._scrollContainer.removeEventListener('scroll', this.onScroll, true);
        } else {
            this._document.removeEventListener('scroll', this.onScroll, true);
        }

        this._initialized = false;
    }

    private onScroll = () => {
        this._overlayService.reposition(this._id);
    }
}
