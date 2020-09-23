import { first } from 'rxjs/operators';
import { HorizontalAlignment, VerticalAlignment, Point } from '../services/public_api';
import { DebugElement } from '@angular/core';

export function wait(ms = 0) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

export function waitForActiveNodeChange (grid) {
    // wait for grid scroll operation to complete and state to be updated.
    return new Promise((resolve, reject) => {
        grid.activeNodeChange.pipe(first()).subscribe(() => {
            grid.cdr.detectChanges();
            resolve();
        });
    });
}

export function waitForSelectionChange (grid) {
    // wait for grid scroll operation to complete and state to be updated.
    return new Promise((resolve, reject) => {
        grid.onSelection.pipe(first()).subscribe(() => {
            grid.cdr.detectChanges();
            resolve();
        });
    });
}

declare var Touch: {
    prototype: Touch;
    new(prop): Touch;
};
export class UIInteractions {
    /**
     * Clears all opened overlays and resets document scrollTop and scrollLeft
     */
    public static clearOverlay() {
        const overlays = document.getElementsByClassName('igx-overlay') as HTMLCollectionOf<Element>;
        Array.from(overlays).forEach(element => {
            element.remove();
        });
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
    }

    /**
     * Clicks an element - native or debug, by dispatching pointerdown, pointerup and click events.
     * @param element - Native or debug element.
     * @param shift - if the shift key is pressed.
     * @param ctrl - if the ctrl key is pressed.
     */
    public static simulateClickAndSelectEvent(element, shift = false, ctrl = false) {
        const nativeElement = element.nativeElement ?? element;
        UIInteractions.simulatePointerOverElementEvent('pointerdown', nativeElement, shift, ctrl);
        UIInteractions.simulatePointerOverElementEvent('pointerup', nativeElement);
        nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }

    /**
     * Double click an element - native or debug, by dispatching pointerdown, pointerup and dblclick events.
     * @param element - Native or debug element.
     */
    public static simulateDoubleClickAndSelectEvent(element) {
        const nativeElement = element.nativeElement ?? element;
        UIInteractions.simulatePointerOverElementEvent('pointerdown', nativeElement);
        UIInteractions.simulatePointerOverElementEvent('pointerup', nativeElement);
        nativeElement.dispatchEvent(new MouseEvent('dblclick'));
    }

    /**
     * click with non primary button on an element - native or debug, by dispatching pointerdown, pointerup and click events.
     * @param element - Native or debug element.
     */
    public static simulateNonPrimaryClick(element) {
        const nativeElement = element.nativeElement ?? element;
        nativeElement.dispatchEvent(new PointerEvent('pointerdown', { button: 2 }));
        nativeElement.dispatchEvent(new PointerEvent('pointerup', { button: 2 }));
        nativeElement.dispatchEvent(new Event('click'));
    }

    /**
     * gets a keyboard event
     * @param eventType - name of the event
     * @param keyPressed- pressed key
     */
    public static getKeyboardEvent(eventType: string, keyPressed: string, altKey = false, shift = false, ctrl = false): KeyboardEvent {
        const keyboardEvent = {
            key: keyPressed,
            altKey: altKey,
            shiftKey: shift,
            ctrlKey: ctrl,
            stopPropagation: () => { },
            stopImmediatePropagation: () => { },
            preventDefault: () => { }
        };
        return new KeyboardEvent(eventType, keyboardEvent);
    }

    /**
     * gets a mouse event
     * @param eventType - name of the event
     */
    public static getMouseEvent(eventType, altKey = false, shift = false, ctrl = false): MouseEvent {
        const clickEvent = {
            altKey: altKey,
            shiftKey: shift,
            ctrlKey: ctrl,
            stopPropagation: () => { },
            stopImmediatePropagation: () => { },
            preventDefault: () => { }
        };
        return new MouseEvent(eventType, clickEvent);
    }

    /**
     * Press a key on an element - debug, by triggerEventHandler.
     * @param keyPressed - pressed key
     * @param elem - debug element
     */
    public static triggerEventHandlerKeyDown(keyPressed: string, elem: DebugElement, altKey = false, shift = false, ctrl = false) {
        const event = {
            target: elem.nativeElement,
            key: keyPressed,
            altKey: altKey,
            shiftKey: shift,
            ctrlKey: ctrl,
            stopPropagation: () => { },
            stopImmediatePropagation: () => { },
            preventDefault: () => { }
        };
        elem.triggerEventHandler('keydown', event);
    }

    /**
     * Trigger key up on an element - debug, by triggerEventHandler.
     * @param keyPressed - pressed key
     * @param elem - debug element
     */
    public static triggerEventHandlerKeyUp(keyPressed: string, elem: DebugElement, altKey = false, shift = false, ctrl = false) {
        const event = {
            key: keyPressed,
            altKey: altKey,
            shiftKey: shift,
            ctrlKey: ctrl,
            stopPropagation: () => { },
            stopImmediatePropagation: () => { },
            preventDefault: () => { }
        };
        elem.triggerEventHandler('keyup', event);
    }

    /**
     * Sets an input value- native or debug, by dispatching keydown, input and keyup events.
     * @param element - Native or debug element.
     * @param text - text to be set.
     * @param fix - if fixture is set it will detect changes on it.
     */
    public static clickAndSendInputElementValue(element, text, fix = null) {
        const nativeElement = element.nativeElement ?? element;
        nativeElement.value = text;
        nativeElement.dispatchEvent(new Event('keydown'));
        nativeElement.dispatchEvent(new Event('input'));
        nativeElement.dispatchEvent(new Event('keyup'));
        if (fix) {
            fix.detectChanges();
        }
    }

    /**
     * Sets an input value- native or debug, by dispatching only input events.
     * @param element - Native or debug element.
     * @param text - text to be set.
     * @param fix - if fixture is set it will detect changes on it.
     */
    public static setInputElementValue(element, text, fix = null) {
        const nativeElement = element.nativeElement ?? element;
        nativeElement.value = text;
        nativeElement.dispatchEvent(new Event('input'));
        if (fix) {
            fix.detectChanges();
        }
    }

    /**
     * Sets an input value- debug element.
     * @param inputElement - debug element.
     * @param inputValue - text to be set.
     */
    public static triggerInputEvent(inputElement: DebugElement, inputValue: string) {
        inputElement.nativeElement.value = inputValue;
        inputElement.triggerEventHandler('input', { target: inputElement.nativeElement });
    }

    public static triggerInputKeyInteraction(inputValue: string, target: DebugElement) {
        const startPos = target.nativeElement.selectionStart;
        const endPos = target.nativeElement.selectionEnd;
        target.nativeElement.value =
            target.nativeElement.value.substring(0, startPos) +
            inputValue +
            target.nativeElement.value.substring(endPos);
        // move the caret
        if (startPos !== endPos) {
            // replaced selection, cursor goes to end
            target.nativeElement.selectionStart = target.nativeElement.selectionEnd = startPos + inputValue.length;
        } else {
            // typing move the cursor after the typed value
            target.nativeElement.selectionStart = target.nativeElement.selectionEnd = endPos + inputValue.length;
        }
        target.triggerEventHandler('input', { target: target.nativeElement });
    }

    public static simulateTyping(characters: string, target: DebugElement, selectionStart = 0, selectionEnd = 0) {
        if (characters) {
            if (selectionStart > selectionEnd) {
                return Error('Selection start should be less than selection end position');
            }
            // target.triggerEventHandler('focus', {});
            const inputEl = target.nativeElement as HTMLInputElement;
            inputEl.setSelectionRange(selectionStart, selectionEnd);
            for (let i = 0; i < characters.length; i++) {
                const char = characters[i];
                this.triggerEventHandlerKeyDown(char, target);
                this.triggerInputKeyInteraction(char, target);
                this.triggerEventHandlerKeyUp(char, target);
            }
        }
    }

    public static simulatePaste(pasteText: string, target: DebugElement, selectionStart = 0, selectionEnd = 0) {
        if (selectionStart > selectionEnd) {
            return Error('Selection start should be less than selection end position');
        }
        const inputEl = target.nativeElement as HTMLInputElement;
        inputEl.setSelectionRange(selectionStart, selectionEnd);
        UIInteractions.triggerPasteEvent(target, pasteText);
        UIInteractions.triggerInputKeyInteraction(pasteText, target);
    }

    public static triggerPasteEvent(inputElement: DebugElement, inputValue: string) {
        const pasteData = new DataTransfer();
        pasteData.setData('text/plain', inputValue);
        const event = new ClipboardEvent('paste', { clipboardData: pasteData });
        inputElement.triggerEventHandler('paste', event);
    }

    public static triggerKeyDownEvtUponElem(keyPressed, elem, bubbles = true, altKey = false, shift = false, ctrl = false) {
        const keyboardEvent = new KeyboardEvent('keydown', {
            key: keyPressed,
            bubbles: bubbles,
            shiftKey: shift,
            ctrlKey: ctrl,
            altKey: altKey
        });
        elem.dispatchEvent(keyboardEvent);
    }

    public static simulateClickEvent(element, shift = false, ctrl = false) {
        const event = new MouseEvent('click', {
            bubbles: true,
            shiftKey: shift,
            ctrlKey: ctrl
        });
        element.dispatchEvent(event);
    }

    public static simulateMouseEvent(eventName: string, element, x, y) {
        const options: MouseEventInit = {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y
        };
        element.dispatchEvent(new MouseEvent(eventName, options));
    }

    public static createPointerEvent(eventName: string, point: Point) {
        const options: PointerEventInit = {
            view: window,
            bubbles: true,
            cancelable: true,
            pointerId: 1
        };
        const pointerEvent = new PointerEvent(eventName, options);
        Object.defineProperty(pointerEvent, 'pageX', { value: point.x, enumerable: true });
        Object.defineProperty(pointerEvent, 'pageY', { value: point.y, enumerable: true });
        return pointerEvent;
    }

    public static simulatePointerEvent(eventName: string, element, x, y) {
        const options: PointerEventInit = {
            view: window,
            bubbles: true,
            cancelable: true,
            pointerId: 1
        };
        const pointerEvent = new PointerEvent(eventName, options);
        Object.defineProperty(pointerEvent, 'pageX', { value: x, enumerable: true });
        Object.defineProperty(pointerEvent, 'pageY', { value: y, enumerable: true });
        element.dispatchEvent(pointerEvent);
        return pointerEvent;
    }

    public static simulatePointerOverElementEvent(eventName: string, element, shift = false, ctrl = false) {
        const options: PointerEventInit = {
            view: window,
            bubbles: true,
            cancelable: true,
            pointerId: 1,
            buttons: 1,
            button: eventName === 'pointerenter' ? -1 : 0,
            shiftKey: shift,
            ctrlKey: ctrl
        };
        element.dispatchEvent(new PointerEvent(eventName, options));
    }

    public static simulateDropEvent(nativeElement: HTMLElement, data: any, format: string) {
        const dataTransfer = new DataTransfer();
        dataTransfer.setData(format, data);

        nativeElement.dispatchEvent(new DragEvent('drop', { dataTransfer: dataTransfer }));
    }

    public static simulateWheelEvent(element, deltaX, deltaY) {
        const event = new WheelEvent('wheel', { deltaX: deltaX, deltaY: deltaY });
        Object.defineProperty(event, 'wheelDeltaX', { value: deltaX });
        Object.defineProperty(event, 'wheelDeltaY', { value: deltaY });

        return new Promise((resolve, reject) => {
            element.dispatchEvent(event);
            resolve();
        });
    }

    public static simulateTouchStartEvent(element, pageX, pageY) {
        const touchInit = {
            identifier: 0,
            target: element,
            pageX: pageX,
            pageY: pageY
        };
        const t = new Touch(touchInit);
        const touchEventObject = new TouchEvent('touchstart', { touches: [t] });
        return new Promise((resolve, reject) => {
            element.dispatchEvent(touchEventObject);
            resolve();
        });
    }

    public static simulateTouchMoveEvent(element, movedX, movedY) {
        const touchInit = {
            identifier: 0,
            target: element,
            pageX: movedX,
            pageY: movedY
        };
        const t = new Touch(touchInit);
        const touchEventObject = new TouchEvent('touchmove', { touches: [t] });
        return new Promise((resolve, reject) => {
            element.dispatchEvent(touchEventObject);
            resolve();
        });
    }

    public static simulateTouchEndEvent(element, movedX, movedY) {
        const touchInit = {
            identifier: 0,
            target: element,
            pageX: movedX,
            pageY: movedY
        };
        const t = new Touch(touchInit);
        const touchEventObject = new TouchEvent('touchend', { touches: [t] });
        return new Promise((resolve, reject) => {
            element.dispatchEvent(touchEventObject);
            resolve();
        });
    }

    /**
     * Calculate point within element
     * @param element Element to calculate point for
     * @param hAlign The horizontal position of the point within the element (defaults to center)
     * @param vAlign The vertical position of the point within the element (defaults to middle)
     */
    public static getPointFromElement(
        element: Element,
        hAlign: HorizontalAlignment = HorizontalAlignment.Center,
        vAlign: VerticalAlignment = VerticalAlignment.Middle): Point {
        const elementRect = element.getBoundingClientRect();
        return {
            x: elementRect.right + hAlign * elementRect.width,
            y: elementRect.bottom + vAlign * elementRect.height
        };
    }

    public static hoverElement(element: HTMLElement, bubbles: boolean = false) {
        element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: bubbles }));
    }

    public static unhoverElement(element: HTMLElement, bubbles: boolean = false) {
        element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: bubbles }));
    }

    public static clickDragDirective(fix, dragDir) {
        dragDir.onPointerDown(new PointerEvent('pointerdown', { pointerId: 1 }));
        dragDir.onPointerUp(new PointerEvent('pointerup'));
        fix.detectChanges();
    }

    public static moveDragDirective(fix, dragDir, moveX, moveY, triggerPointerUp = false) {
        const dragElem = dragDir.element.nativeElement;
        const startingTop = dragElem.getBoundingClientRect().top;
        const startingLeft = dragElem.getBoundingClientRect().left;
        const startingBottom = dragElem.getBoundingClientRect().bottom;
        const startingRight = dragElem.getBoundingClientRect().right;

        const startingX = (startingLeft + startingRight) / 2;
        const startingY = (startingTop + startingBottom) / 2;

        dragDir.onPointerDown({ pointerId: 1, pageX: startingX, pageY: startingY });
        fix.detectChanges();

        dragDir.onPointerMove({ pointerId: 1, pageX: startingX + 10, pageY: startingY + 10 });
        fix.detectChanges();

        dragDir.onPointerMove({
            pointerId: 1,
            pageX: startingX + moveX,
            pageY: startingY + moveY
        });
        fix.detectChanges();

        if (triggerPointerUp) {
            dragDir.onPointerUp({
                pointerId: 1,
                pageX: startingX + moveX,
                pageY: startingY + moveY
            });
            fix.detectChanges();
        }
    }
}
