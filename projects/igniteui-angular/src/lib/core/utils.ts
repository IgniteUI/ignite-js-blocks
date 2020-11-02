import { AnimationReferenceMetadata } from '@angular/animations';
import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import merge from 'lodash.merge';
import ResizeObserver from 'resize-observer-polyfill';
import { Observable } from 'rxjs';
import {
    blink, fadeIn, fadeOut, flipBottom, flipHorBck, flipHorFwd, flipLeft, flipRight, flipTop,
    flipVerBck, flipVerFwd, growVerIn, growVerOut, heartbeat, pulsateBck, pulsateFwd, rotateInBl,
    rotateInBottom, rotateInBr, rotateInCenter, rotateInDiagonal1, rotateInDiagonal2, rotateInHor,
    rotateInLeft, rotateInRight, rotateInTl, rotateInTop, rotateInTr, rotateInVer, rotateOutBl,
    rotateOutBottom, rotateOutBr, rotateOutCenter, rotateOutDiagonal1, rotateOutDiagonal2,
    rotateOutHor, rotateOutLeft, rotateOutRight, rotateOutTl, rotateOutTop, rotateOutTr,
    rotateOutVer, scaleInBl, scaleInBottom, scaleInBr, scaleInCenter, scaleInHorCenter,
    scaleInHorLeft, scaleInHorRight, scaleInLeft, scaleInRight, scaleInTl, scaleInTop, scaleInTr,
    scaleInVerBottom, scaleInVerCenter, scaleInVerTop, scaleOutBl, scaleOutBottom, scaleOutBr,
    scaleOutCenter, scaleOutHorCenter, scaleOutHorLeft, scaleOutHorRight, scaleOutLeft,
    scaleOutRight, scaleOutTl, scaleOutTop, scaleOutTr, scaleOutVerBottom, scaleOutVerCenter,
    scaleOutVerTop, shakeBl, shakeBottom, shakeBr, shakeCenter, shakeHor, shakeLeft, shakeRight,
    shakeTl, shakeTop, shakeTr, shakeVer, slideInBl, slideInBottom, slideInBr, slideInLeft,
    slideInRight, slideInTl, slideInTop, slideInTr, slideOutBl, slideOutBottom, slideOutBr,
    slideOutLeft, slideOutRight, slideOutTl, slideOutTop, slideOutTr, swingInBottomBck,
    swingInBottomFwd, swingInLeftBck, swingInLeftFwd, swingInRightBck, swingInRightFwd,
    swingInTopBck, swingInTopFwd, swingOutBottomBck, swingOutBottomFwd, swingOutLeftBck,
    swingOutLefttFwd, swingOutRightBck, swingOutRightFwd, swingOutTopBck, swingOutTopFwd
} from '../animations/main';
import { setImmediate } from './setImmediate';

/**
 * @hidden
 */
export function cloneArray(array: any[], deep?: boolean) {
    const arr = [];
    if (!array) {
        return arr;
    }
    let i = array.length;
    while (i--) {
        arr[i] = deep ? cloneValue(array[i]) : array[i];
    }
    return arr;
}

/**
 * Doesn't clone leaf items
 * @hidden
 */
export function cloneHierarchicalArray(array: any[], childDataKey: any): any[] {
    const result: any[] = [];
    if (!array) {
        return result;
    }

    for (const item of array) {
        const clonedItem = cloneValue(item);
        if (Array.isArray(item[childDataKey])) {
            clonedItem[childDataKey] = cloneHierarchicalArray(clonedItem[childDataKey], childDataKey);
        }
        result.push(clonedItem);
    }
    return result;
}

/**
 * Deep clones all first level keys of Obj2 and merges them to Obj1
 * @param obj1 Object to merge into
 * @param obj2 Object to merge from
 * @returns Obj1 with merged cloned keys from Obj2
 * @hidden
 */
export function mergeObjects(obj1: {}, obj2: {}): any {
    return merge(obj1, obj2);
}

/**
 * Creates deep clone of provided value.
 * Supports primitive values, dates and objects.
 * If passed value is array returns shallow copy of the array.
 * @param value value to clone
 * @returns Deep copy of provided value
 * @hidden
 */
export function cloneValue(value: any): any {
    if (isDate(value)) {
        return new Date(value.getTime());
    }
    if (Array.isArray(value)) {
        return [...value];
    }

    if (value instanceof Map || value instanceof Set) {
        return value;
    }

    if (isObject(value)) {
        const result = {};

        for (const key of Object.keys(value)) {
            result[key] = cloneValue(value[key]);
        }
        return result;
    }
    return value;
}

/**
 * Checks if provided variable is Object
 * @param value Value to check
 * @returns true if provided variable is Object
 * @hidden
 */
export function isObject(value: any): boolean {
    return value && value.toString() === '[object Object]';
}

/**
 * Checks if provided variable is Date
 * @param value Value to check
 * @returns true if provided variable is Date
 * @hidden
 */
export function isDate(value: any) {
    return Object.prototype.toString.call(value) === '[object Date]';
}

/**
 * Checks if the two passed arguments are equal
 * Currently supports date objects
 * @param obj1
 * @param obj2
 * @returns: `boolean`
 * @hidden
 */
export function isEqual(obj1, obj2): boolean {
    if (isDate(obj1) && isDate(obj2)) {
        return obj1.getTime() === obj2.getTime();
    }
    return obj1 === obj2;
}

/**
 * @hidden
 */
export const enum KEYCODES {
    ENTER = 13,
    SPACE = 32,
    ESCAPE = 27,
    LEFT_ARROW = 37,
    UP_ARROW = 38,
    RIGHT_ARROW = 39,
    DOWN_ARROW = 40,
    F2 = 113,
    TAB = 9,
    CTRL = 17,
    Z = 90,
    Y = 89,
    X = 88,
    BACKSPACE = 8,
    DELETE = 46,
    INPUT_METHOD = 229
}

/**
 * @hidden
 */
export const enum KEYS {
    ENTER = 'Enter',
    SPACE = ' ',
    SPACE_IE = 'Spacebar',
    ESCAPE = 'Escape',
    ESCAPE_IE = 'Esc',
    LEFT_ARROW = 'ArrowLeft',
    LEFT_ARROW_IE = 'Left',
    UP_ARROW = 'ArrowUp',
    UP_ARROW_IE = 'Up',
    RIGHT_ARROW = 'ArrowRight',
    RIGHT_ARROW_IE = 'Right',
    DOWN_ARROW = 'ArrowDown',
    DOWN_ARROW_IE = 'Down',
    F2 = 'F2',
    TAB = 'Tab',
    SEMICOLON = ';',
    HOME = 'Home',
    END = 'End'
}

/**
 * @hidden
 * Returns the actual size of the node content, using Range
 * ```typescript
 * let range = document.createRange();
 * let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
 *
 * let size = getNodeSizeViaRange(range, column.cells[0].nativeElement);
 * ```
 */
export function getNodeSizeViaRange(range: Range, node: any): number {
    let overflow = null;
    if (!isFirefox()) {
        overflow = node.style.overflow;
        // we need that hack - otherwise content won't be measured correctly in IE/Edge
        node.style.overflow = 'visible';
    }

    range.selectNodeContents(node);
    const width = range.getBoundingClientRect().width;

    if (!isFirefox()) {
        // we need that hack - otherwise content won't be measured correctly in IE/Edge
        node.style.overflow = overflow;
    }

    return width;
}
/**
 * @hidden
 * Returns the actual size of the node content, using Canvas
 * ```typescript
 * let ctx = document.createElement('canvas').getContext('2d');
 * let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
 *
 * let size = valToPxlsUsingCanvas(ctx, column.cells[0].nativeElement);
 * ```
 */
export function getNodeSizeViaCanvas(canvas2dCtx: any, node: any): number {
    const s = this.grid.document.defaultView.getComputedStyle(node);

    // need to set the font to get correct width
    canvas2dCtx.font = s.fontSize + ' ' + s.fontFamily;

    return canvas2dCtx.measureText(node.textContent).width;
}
/**
 * @hidden
 */
export function isIE(): boolean {
    return navigator.appVersion.indexOf('Trident/') > 0;
}
/**
 * @hidden
 */
export function isEdge(): boolean {
    const edgeBrowser = /Edge[\/\s](\d+\.\d+)/.test(navigator.userAgent);
    return edgeBrowser;
}

/**
 * @hidden
 */
export function isFirefox(): boolean {
    const firefoxBrowser = /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent);
    return firefoxBrowser;
}

/**
 * @hidden
 */
@Injectable({ providedIn: 'root' })
export class PlatformUtil {
    public isBrowser: boolean = isPlatformBrowser(this.platformId);

    public isIOS = this.isBrowser && /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    }
}

/**
 * @hidden
 */
export function isLeftClick(event: PointerEvent) {
    return event.button === 0;
}

/** @hidden */
export function isNavigationKey(key: string): boolean {
    return [
        'down',
        'up',
        'left',
        'right',
        'arrowdown',
        'arrowup',
        'arrowleft',
        'arrowright',
        'home',
        'end',
        'space',
        'spacebar',
        ' '
    ].indexOf(key) !== -1;
}

/**
 * @hidden
 */
export function flatten(arr: any[]) {
    let result = [];

    arr.forEach(el => {
        result.push(el);
        if (el.children) {
            const children = Array.isArray(el.children) ? el.children : el.children.toArray();
            result = result.concat(flatten(children));
        }
    });
    return result;
}

export interface CancelableEventArgs {
    /**
     * Provides the ability to cancel the event.
     */
    cancel: boolean;
}

export interface IBaseEventArgs {
    /**
     * Provides reference to the owner component.
     */
    owner?: any;
}

export interface CancelableBrowserEventArgs extends CancelableEventArgs {
    /** Browser event */
    event?: Event;
}

export interface IBaseCancelableBrowserEventArgs extends CancelableBrowserEventArgs, IBaseEventArgs {}

export interface IBaseCancelableEventArgs extends CancelableEventArgs, IBaseEventArgs {}

export const HORIZONTAL_NAV_KEYS = new Set(['arrowleft', 'left', 'arrowright', 'right', 'home', 'end']);

export const NAVIGATION_KEYS = new Set([
    'down',
    'up',
    'left',
    'right',
    'arrowdown',
    'arrowup',
    'arrowleft',
    'arrowright',
    'home',
    'end',
    'space',
    'spacebar',
    ' '
]);
export const ROW_EXPAND_KEYS = new Set('right down arrowright arrowdown'.split(' '));
export const ROW_COLLAPSE_KEYS = new Set('left up arrowleft arrowup'.split(' '));
export const SUPPORTED_KEYS = new Set([...Array.from(NAVIGATION_KEYS), 'enter', 'f2', 'escape', 'esc', 'pagedown', 'pageup', '+', 'add']);
export const HEADER_KEYS = new Set([...Array.from(NAVIGATION_KEYS), 'escape', 'esc' , 'l',
    /** This symbol corresponds to the Alt + L combination under MAC. */
    '¬']);

/**
 * @hidden
 * @internal
 *
 * Creates a new ResizeObserver on `target` and returns it as an Observable.
 * Run the resizeObservable outside angular zone, because it patches the MutationObserver which causes an infinite loop.
 * Related issue: https://github.com/angular/angular/issues/31712
 */
export function resizeObservable(target: HTMLElement): Observable<ResizeObserverEntry[]> {
    return new Observable((observer) => {
        const instance = new ResizeObserver((entries: ResizeObserverEntry[]) => {
            observer.next(entries);
        });
        instance.observe(target);
        const unsubscribe = () => instance.disconnect();
        return unsubscribe;
    });
}

/**
 * @hidden
 * @internal
 *
 * Compares two maps.
 */
export function compareMaps(map1: Map<any, any>, map2: Map<any, any>): boolean {
    if (!map2) {
        return !map1 ? true : false;
    }
    if (map1.size !== map2.size) {
        return false;
    }
    let match = true;
    const keys = Array.from(map2.keys());
    for (const key of keys) {
        if (map1.has(key)) {
            match = map1.get(key) === map2.get(key);
        } else {
            match = false;
        }
        if (!match) {
            break;
        }
    }
    return match;
}

/**
 *
 * Given a property access path in the format `x.y.z` resolves and returns
 * the value of the `z` property in the passed object.
 *
 * @hidden
 * @internal
 */
export function resolveNestedPath(obj: any, path: string) {
    const parts = path?.split('.') ?? [];
    let current = obj[parts.shift()];

    parts.forEach(prop => {
        if (current) {
            current = current[prop];
        }
    });

    return current;
}

/**
 *
 * Given a property access path in the format `x.y.z` and a value
 * this functions builds and returns an object following the access path.
 *
 * @example
 * ```typescript
 * console.log('x.y.z.', 42);
 * >> { x: { y: { z: 42 } } }
 * ```
 *
 * @hidden
 * @internal
 */
export function reverseMapper(path: string, value: any) {
    const obj = {};
    const parts = path?.split('.') ?? [];

    let _prop = parts.shift();
    let mapping: any;

    // Initial binding for first level bindings
    obj[_prop] = value;
    mapping = obj;

    parts.forEach(prop => {
        // Start building the hierarchy
        mapping[_prop] = {};
        // Go down a level
        mapping = mapping[_prop];
        // Bind the value and move the key
        mapping[prop] = value;
        _prop = prop;
    });

    return obj;
}

export function yieldingLoop(count: number, chunkSize: number, callback: (index: number) => void, done: () => void) {
    let i = 0;
    const chunk = () => {
        const end = Math.min(i + chunkSize, count);
        for ( ; i < end; ++i) {
            callback(i);
        }
        if (i < count) {
            setImmediate(chunk);
        } else {
            done();
        }
    };
    chunk();
}

export function mkenum<T extends { [index: string]: U }, U extends string>(x: T) { return x; }

export function reverseAnimationResolver(animation: AnimationReferenceMetadata): AnimationReferenceMetadata {
    return oppositeAnimation.get(animation) ?? animation;
}

export function isHorizontalAnimation(animation: AnimationReferenceMetadata): boolean {
    return horizontalAnimations.includes(animation);
}

export function isVerticalAnimation(animation: AnimationReferenceMetadata): boolean {
    return verticalAnimations.includes(animation);
}

const oppositeAnimation: Map<AnimationReferenceMetadata, AnimationReferenceMetadata> = new Map([
    [fadeIn, fadeIn],
    [fadeOut, fadeOut],
    [flipTop, flipBottom],
    [flipBottom, flipTop],
    [flipRight, flipLeft],
    [flipLeft, flipRight],
    [flipHorFwd, flipHorBck],
    [flipHorBck, flipHorFwd],
    [flipVerFwd, flipVerBck],
    [flipVerBck, flipVerFwd],
    [growVerIn, growVerIn],
    [growVerOut, growVerOut],
    [heartbeat, heartbeat],
    [pulsateFwd, pulsateBck],
    [pulsateBck, pulsateFwd],
    [blink, blink],
    [shakeHor, shakeHor],
    [shakeVer, shakeVer],
    [shakeTop, shakeTop],
    [shakeBottom, shakeBottom],
    [shakeRight, shakeRight],
    [shakeLeft, shakeLeft],
    [shakeCenter, shakeCenter],
    [shakeTr, shakeTr],
    [shakeBr, shakeBr],
    [shakeBl, shakeBl],
    [shakeTl, shakeTl],
    [rotateInCenter, rotateInCenter],
    [rotateOutCenter, rotateOutCenter],
    [rotateInTop, rotateInBottom],
    [rotateOutTop, rotateOutBottom],
    [rotateInRight, rotateInLeft],
    [rotateOutRight, rotateOutLeft],
    [rotateInLeft, rotateInRight],
    [rotateOutLeft, rotateOutRight],
    [rotateInBottom, rotateInTop],
    [rotateOutBottom, rotateOutTop],
    [rotateInTr, rotateInBl],
    [rotateOutTr, rotateOutBl],
    [rotateInBr, rotateInTl],
    [rotateOutBr, rotateOutTl],
    [rotateInBl, rotateInTr],
    [rotateOutBl, rotateOutTr],
    [rotateInTl, rotateInBr],
    [rotateOutTl, rotateOutBr],
    [rotateInDiagonal1, rotateInDiagonal1],
    [rotateOutDiagonal1, rotateOutDiagonal1],
    [rotateInDiagonal2, rotateInDiagonal2],
    [rotateOutDiagonal2, rotateOutDiagonal2],
    [rotateInHor, rotateInHor],
    [rotateOutHor, rotateOutHor],
    [rotateInVer, rotateInVer],
    [rotateOutVer, rotateOutVer],
    [scaleInTop, scaleInBottom],
    [scaleOutTop, scaleOutBottom],
    [scaleInRight, scaleInLeft],
    [scaleOutRight, scaleOutLeft],
    [scaleInBottom, scaleInTop],
    [scaleOutBottom, scaleOutTop],
    [scaleInLeft, scaleInRight],
    [scaleOutLeft, scaleOutRight],
    [scaleInCenter, scaleInCenter],
    [scaleOutCenter, scaleOutCenter],
    [scaleInTr, scaleInBl],
    [scaleOutTr, scaleOutBl],
    [scaleInBr, scaleInTl],
    [scaleOutBr, scaleOutTl],
    [scaleInBl, scaleInTr],
    [scaleOutBl, scaleOutTr],
    [scaleInTl, scaleInBr],
    [scaleOutTl, scaleOutBr],
    [scaleInVerTop, scaleInVerBottom],
    [scaleOutVerTop, scaleOutVerBottom],
    [scaleInVerBottom, scaleInVerTop],
    [scaleOutVerBottom, scaleOutVerTop],
    [scaleInVerCenter, scaleInVerCenter],
    [scaleOutVerCenter, scaleOutVerCenter],
    [scaleInHorCenter, scaleInHorCenter],
    [scaleOutHorCenter, scaleOutHorCenter],
    [scaleInHorLeft, scaleInHorRight],
    [scaleOutHorLeft, scaleOutHorRight],
    [scaleInHorRight, scaleInHorLeft],
    [scaleOutHorRight, scaleOutHorLeft],
    [slideInTop, slideInBottom],
    [slideOutTop, slideOutBottom],
    [slideInRight, slideInLeft],
    [slideOutRight, slideOutLeft],
    [slideInBottom, slideInTop],
    [slideOutBottom, slideOutTop],
    [slideInLeft, slideInRight],
    [slideOutLeft, slideOutRight],
    [slideInTr, slideInBl],
    [slideOutTr, slideOutBl],
    [slideInBr, slideInTl],
    [slideOutBr, slideOutTl],
    [slideInBl, slideInTr],
    [slideOutBl, slideOutTr],
    [slideInTl, slideInBr],
    [slideOutTl, slideOutBr],
    [swingInTopFwd, swingInBottomFwd],
    [swingOutTopFwd, swingOutBottomFwd],
    [swingInRightFwd, swingInLeftFwd],
    [swingOutRightFwd, swingOutLefttFwd],
    [swingInLeftFwd, swingInRightFwd],
    [swingOutLefttFwd, swingOutRightFwd],
    [swingInBottomFwd, swingInTopFwd],
    [swingOutBottomFwd, swingOutTopFwd],
    [swingInTopBck, swingInBottomBck],
    [swingOutTopBck, swingOutBottomBck],
    [swingInRightBck, swingInLeftBck],
    [swingOutRightBck, swingOutLeftBck],
    [swingInBottomBck, swingInTopBck],
    [swingOutBottomBck, swingOutTopBck],
    [swingInLeftBck, swingInRightBck],
    [swingOutLeftBck, swingOutRightBck],
]);

const horizontalAnimations: AnimationReferenceMetadata[] = [
    flipRight,
    flipLeft,
    flipVerFwd,
    flipVerBck,
    rotateInRight,
    rotateOutRight,
    rotateInLeft,
    rotateOutLeft,
    rotateInTr,
    rotateOutTr,
    rotateInBr,
    rotateOutBr,
    rotateInBl,
    rotateOutBl,
    rotateInTl,
    rotateOutTl,
    scaleInRight,
    scaleOutRight,
    scaleInLeft,
    scaleOutLeft,
    scaleInTr,
    scaleOutTr,
    scaleInBr,
    scaleOutBr,
    scaleInBl,
    scaleOutBl,
    scaleInTl,
    scaleOutTl,
    scaleInHorLeft,
    scaleOutHorLeft,
    scaleInHorRight,
    scaleOutHorRight,
    slideInRight,
    slideOutRight,
    slideInLeft,
    slideOutLeft,
    slideInTr,
    slideOutTr,
    slideInBr,
    slideOutBr,
    slideInBl,
    slideOutBl,
    slideInTl,
    slideOutTl,
    swingInRightFwd,
    swingOutRightFwd,
    swingInLeftFwd,
    swingOutLefttFwd,
    swingInRightBck,
    swingOutRightBck,
    swingInLeftBck,
    swingOutLeftBck,
];
const verticalAnimations: AnimationReferenceMetadata[] = [
    flipTop,
    flipBottom,
    flipHorFwd,
    flipHorBck,
    growVerIn,
    growVerOut,
    rotateInTop,
    rotateOutTop,
    rotateInBottom,
    rotateOutBottom,
    rotateInTr,
    rotateOutTr,
    rotateInBr,
    rotateOutBr,
    rotateInBl,
    rotateOutBl,
    rotateInTl,
    rotateOutTl,
    scaleInTop,
    scaleOutTop,
    scaleInBottom,
    scaleOutBottom,
    scaleInTr,
    scaleOutTr,
    scaleInBr,
    scaleOutBr,
    scaleInBl,
    scaleOutBl,
    scaleInTl,
    scaleOutTl,
    scaleInVerTop,
    scaleOutVerTop,
    scaleInVerBottom,
    scaleOutVerBottom,
    slideInTop,
    slideOutTop,
    slideInBottom,
    slideOutBottom,
    slideInTr,
    slideOutTr,
    slideInBr,
    slideOutBr,
    slideInBl,
    slideOutBl,
    slideInTl,
    slideOutTl,
    swingInTopFwd,
    swingOutTopFwd,
    swingInBottomFwd,
    swingOutBottomFwd,
    swingInTopBck,
    swingOutTopBck,
    swingInBottomBck,
    swingOutBottomBck,
];
