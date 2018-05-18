import {Input, Renderer} from "@angular/core";
import { getDOM } from "@angular/platform-browser/src/dom/dom_adapter";
// this apparently only works in Dart https://github.com/angular/angular/issues/6904
// TODO: Consider measuring util with Ruler https://github.com/angular/angular/issues/6515

/**
 * Base component class
 */
export class BaseComponent {
    /**
     * Should be overridden with @Input() as metadata [field] cannot be extended though inheritance
     * https://github.com/angular/angular/issues/5415
     */
    public id: string;
    constructor(protected renderer: Renderer) { }

    /**
     * Get child element by selector.
     * Replacement for `elementRef.nativeElement.querySelector`
     * @returns Returns the matched DOM element or null
     */
    protected getChild(selector: string): HTMLElement {
         // With DomRenderer selectRootElement will use querySelector against document (!!!)
         // Also will throw if not found
        try {
            if (this.id) {
                selector = "#" + this.id + " " + selector;
            }
            // WARNING: selectRootElement will for whatever reason call clear as well..wiping all contents!
            // -----
            // return this.renderer.selectRootElement(selector);
            // ------
            // INSTEAD temporary per http://stackoverflow.com/a/34433626
            // return DOM.querySelector(DOM.query("document"), selector);
            // could also try http://bit.ly/2qWmbNg
            return document.querySelector(selector) as HTMLElement;
        } catch (error) {
            return null;
        }
    }
}
