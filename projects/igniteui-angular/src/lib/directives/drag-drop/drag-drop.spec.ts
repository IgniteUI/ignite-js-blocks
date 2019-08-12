import { Component, ViewChildren, QueryList, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IgxDragDropModule, IgxDragDirective, IgxDropDirective, IDragLocation } from './drag-drop.directive';
import { UIInteractions, wait} from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';

describe('General igxDrag/igxDrop', () => {
    let fix: ComponentFixture<TestDragDropComponent>;
    let dropArea: IgxDropDirective;
    let dropAreaRects = { top: 0, left: 0, right: 0, bottom: 0};
    let dragDirsRects = [{ top: 0, left: 0, right: 0, bottom: 0}];

    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestDragDropComponent
            ],
            imports: [
                FormsModule,
                IgxDragDropModule
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fix = TestBed.createComponent(TestDragDropComponent);
        fix.detectChanges();

        dragDirsRects = getDragDirsRects(fix.componentInstance.dragElems);
        dropArea = fix.componentInstance.dropArea;
        dropAreaRects = getElemRects(dropArea.element.nativeElement);
    });

    it('should correctly initialize drag and drop directives.', () => {
        expect(fix.componentInstance.dragElems.length).toEqual(3);
        expect(fix.componentInstance.dragElems.last.data).toEqual({ key: 3 });
        expect(fix.componentInstance.dropArea).toBeTruthy();
        expect(fix.componentInstance.dropArea.data).toEqual({ key: 333 });
    });

    it('should create drag ghost element and trigger onGhostCreate/onGhostDestroy.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        spyOn(firstDrag.onGhostCreate, 'emit');
        spyOn(firstDrag.onGhostDestroy, 'emit');
        expect(document.getElementsByClassName('dragElem').length).toEqual(3);

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(firstDrag.onGhostCreate.emit).not.toHaveBeenCalled();
        expect(firstDrag.onGhostDestroy.emit).not.toHaveBeenCalled();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.onGhostCreate.emit).toHaveBeenCalled();
        expect(firstDrag.onGhostDestroy.emit).not.toHaveBeenCalled();
        expect(firstDrag['dragGhost']).toBeDefined();
        expect(firstDrag['dragGhost'].id).toEqual('firstDrag');
        expect(firstDrag['dragGhost'].className).toEqual('dragElem');
        expect(document.getElementsByClassName('dragElem').length).toEqual(4);

        // Step 3.
        // We need to trigger the pointerup on the dragGhost because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag['dragGhost'], startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait();

        expect(firstDrag['dragGhost']).toBeNull();
        expect(document.getElementsByClassName('dragElem').length).toEqual(3);
        expect(firstDrag.onGhostCreate.emit).toHaveBeenCalled();
        expect(firstDrag.onGhostDestroy.emit).toHaveBeenCalled();
    }));

    it('should trigger dragStart/dragMove/dragEnd events in that order.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        spyOn(firstDrag.dragStart, 'emit');
        spyOn(firstDrag.dragMove, 'emit');
        spyOn(firstDrag.dragEnd, 'emit');

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).not.toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 4.
        // We need to trigger the pointerup on the dragGhost because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();

        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).toHaveBeenCalled();
    }));

    it('should not create drag ghost element when the dragged amount is less than dragTolerance.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.dragTolerance = 15;

        spyOn(firstDrag.onGhostCreate, 'emit');
        spyOn(firstDrag.onGhostDestroy, 'emit');
        expect(document.getElementsByClassName('dragElem').length).toEqual(3);

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(firstDrag.onGhostCreate.emit).not.toHaveBeenCalled();
        expect(firstDrag.onGhostDestroy.emit).not.toHaveBeenCalled();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag['dragGhost']).not.toBeDefined();
        expect(document.getElementsByClassName('dragElem').length).toEqual(3);
        expect(firstDrag.onGhostCreate.emit).not.toHaveBeenCalled();
        expect(firstDrag.onGhostDestroy.emit).not.toHaveBeenCalled();

        // Step 3.
        // We need to trigger the pointerup on the dragGhost because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait();

        expect(firstDrag['dragGhost']).not.toBeDefined();
        expect(document.getElementsByClassName('dragElem').length).toEqual(3);
        expect(firstDrag.onGhostCreate.emit).not.toHaveBeenCalled();
        expect(firstDrag.onGhostDestroy.emit).not.toHaveBeenCalled();
    }));

    it('should position ghost at the same position relative to the mouse when drag started.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        expect(firstDrag['dragGhost'].getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstDrag['dragGhost'].getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    }));

    it('should position ghost relative to the mouse using offsetX and offsetY correctly.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.ghostOffsetX = 0;
        firstDrag.ghostOffsetY = 0;

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait(50);

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        // We have moved 20px but because the element has 10px margin we have to add it too to the position check.
        expect(firstDrag['dragGhost'].getBoundingClientRect().left).toEqual(startingX + 30);
        expect(firstDrag['dragGhost'].getBoundingClientRect().top).toEqual(startingY + 30);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    }));

    it('should position ghost at the same position relative to the mouse when drag started when host is defined.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        firstDrag.dragGhostHost = firstElement.parentElement;

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        expect(firstDrag['dragGhost'].getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstDrag['dragGhost'].getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    }));

    it('should allow customizing of ghost element by passing template reference and position it correctly.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.ghostTemplate = fix.componentInstance.ghostTemplate;

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        expect(firstDrag['dragGhost'].getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstDrag['dragGhost'].getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);
        expect(firstDrag['dragGhost'].innerText).toEqual('Drag Template');
        expect(firstDrag['dragGhost'].className).toEqual('dragGhost');

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    }));

    it('should position custom ghost relative to the mouse using offsetX and offsetY correctly.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.ghostOffsetX = 0;
        firstDrag.ghostOffsetY = 0;
        firstDrag.ghostTemplate = fix.componentInstance.ghostTemplate;

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        // We compare the base position and the new position + how much the mouse has moved.
        // + 10 margin to the final ghost position
        expect(firstDrag['dragGhost'].getBoundingClientRect().left).toEqual(startingX + 30);
        expect(firstDrag['dragGhost'].getBoundingClientRect().top).toEqual(startingY + 30);
        expect(firstDrag['dragGhost'].innerText).toEqual('Drag Template');
        expect(firstDrag['dragGhost'].className).toEqual('dragGhost');

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstDrag['dragGhost'], startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();
    }));

    it('should correctly move igxDrag element when ghost is disabled and trigger dragStart/dragMove/dragEnd events.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.renderGhost = false;

        spyOn(firstDrag.dragStart, 'emit');
        spyOn(firstDrag.dragMove, 'emit');
        spyOn(firstDrag.dragEnd, 'emit');

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).not.toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag['dragGhost']).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 10);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 10);
        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag['dragGhost']).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);
        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();

        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);
        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
        expect(firstDrag.dragMove.emit).toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).toHaveBeenCalled();
    }));

    it('should prevent dragging if it does not exceed dragTolerance and ghost is disabled.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.renderGhost = false;
        firstDrag.dragTolerance = 25;

        spyOn(firstDrag.dragStart, 'emit');

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag['dragGhost']).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);
        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag['dragGhost']).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);
        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();

        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);
        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();
    }));

    it('should correctly apply dragTolerance of 0 when it is set to 0 and ghost is disabled.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        firstDrag.renderGhost = false;
        firstDrag.dragTolerance = 0;

        spyOn(firstDrag.dragStart, 'emit');

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 3, startingY + 3);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag['dragGhost']).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 3);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 3);
        expect(firstDrag.dragStart.emit).toHaveBeenCalled();

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 4, startingY + 4);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag['dragGhost']).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 4);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 4);
        expect(firstDrag.dragStart.emit).toHaveBeenCalled();

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX + 4, startingY + 4);
        fix.detectChanges();
        await wait();

        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 4);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 4);
        expect(firstDrag.dragStart.emit).toHaveBeenCalled();
    }));

    it('should correctly set location using setLocation() method when ghost is disabled', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;
        const initialPageX = firstDrag.pageX;
        const initialPageY = firstDrag.pageY;
        firstDrag.renderGhost = false;

        expect(initialPageX).toEqual(dragDirsRects[0].left);
        expect(initialPageY).toEqual(dragDirsRects[0].top);

        // Step 1.
        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        // Step 2.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag['dragGhost']).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 10);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 10);

        // Step 3.
        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        expect(firstDrag['dragGhost']).not.toBeDefined();
        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // Step 4.
        UIInteractions.simulatePointerEvent('pointerup', firstElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();

        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left + 20);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top + 20);

        // pageX/pageY from the directive should be equal to the getBoundingClientRect top/left.
        const startLocation: IDragLocation = { pageX: initialPageX, pageY: initialPageY };
        firstDrag.setLocation(startLocation);

        expect(firstElement.getBoundingClientRect().left).toEqual(dragDirsRects[0].left);
        expect(firstElement.getBoundingClientRect().top).toEqual(dragDirsRects[0].top);
    }));

    it('should correctly drag using drag handle and not the whole element', (async() => {
        const thirdDrag = fix.componentInstance.dragElems.last;
        const thirdElement = thirdDrag.element.nativeElement;
        const startingX = (dragDirsRects[2].left + dragDirsRects[2].right) / 2;
        const startingY = (dragDirsRects[2].top + dragDirsRects[2].bottom) / 2;
        thirdDrag.renderGhost = false;
        thirdDrag.dragTolerance = 0;

        spyOn(thirdDrag.dragStart, 'emit');

        // Check if drag element itself is not draggable.
        UIInteractions.simulatePointerEvent('pointerdown', thirdElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        UIInteractions.simulatePointerEvent('pointermove', thirdElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', thirdElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointerup', thirdElement, startingX + 20, startingY + 20);
        fix.detectChanges();
        await wait();

        expect(thirdElement.getBoundingClientRect().left).toEqual(dragDirsRects[2].left);
        expect(thirdElement.getBoundingClientRect().top).toEqual(dragDirsRects[2].top);
        expect(thirdDrag.dragStart.emit).not.toHaveBeenCalled();

        // Try dragging through drag handle.

        const dragHandle = thirdElement.children[0];
        const dragHandleRects = dragHandle.getBoundingClientRect();
        const handleStartX = (dragHandleRects.left + dragHandleRects.right) / 2;
        const handleStartY = (dragHandleRects.top + dragHandleRects.bottom) / 2;
        UIInteractions.simulatePointerEvent('pointerdown', dragHandle, handleStartX, handleStartY);
        fix.detectChanges();
        await wait();

        UIInteractions.simulatePointerEvent('pointermove', dragHandle, handleStartX + 10, handleStartY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', dragHandle, handleStartX + 20, handleStartY + 20);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointerup', dragHandle, handleStartX + 20, handleStartY + 20);
        fix.detectChanges();
        await wait();

        expect(thirdElement.getBoundingClientRect().left).toEqual(dragDirsRects[2].left + 20);
        expect(thirdElement.getBoundingClientRect().top).toEqual(dragDirsRects[2].top + 20);
        expect(thirdDrag.dragStart.emit).toHaveBeenCalled();
    }));

    it('should trigger onEnter, onDrop and onLeave events when element is dropped inside igxDrop element.', (async() => {
        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        spyOn(dropArea.onEnter, 'emit');
        spyOn(dropArea.onLeave, 'emit');
        spyOn(dropArea.onDrop, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
        expect(dropArea.element.nativeElement.children.length).toEqual(0);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait();

        const event = UIInteractions.simulatePointerEvent('pointermove',
            firstDrag['dragGhost'],
            dropAreaRects.left  + 100,
            dropAreaRects.top  + 5
        );
        fix.detectChanges();
        await wait(100);

        expect(dropArea.onEnter.emit).toHaveBeenCalledWith({
            originalEvent: event,
            owner: dropArea,
            drag: firstDrag,
            dragData: firstDrag.data,
            startX: startingX,
            startY: startingY,
            pageX:  dropAreaRects.left  + 100,
            pageY: dropAreaRects.top  + 5,
            offsetX: 100,
            offsetY: 5
        });

        // We need to trigger the pointerup on the dragGhost because this is the element we move and is under the mouse
        const eventUp = UIInteractions.simulatePointerEvent('pointerup',
            firstDrag['dragGhost'],
            dropAreaRects.left + 100,
            dropAreaRects.top + 20
        );
        fix.detectChanges();
        await wait();

        expect(dropArea.onDrop.emit).toHaveBeenCalledWith({
            originalEvent: eventUp,
            owner: dropArea,
            drag: firstDrag,
            dragData: firstDrag.data,
            offsetX: 100,
            offsetY: 20,
            cancel: false
        });
        expect(dropArea.onLeave.emit).toHaveBeenCalledWith({
            originalEvent: eventUp,
            owner: dropArea,
            drag: firstDrag,
            dragData: firstDrag.data,
            startX: startingX,
            startY: startingY,
            pageX:  dropAreaRects.left  + 100,
            pageY: dropAreaRects.top  + 20,
            offsetX: 100,
            offsetY: 20
        });
        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(2);
        expect(dropArea.element.nativeElement.children.length).toEqual(1);
    }));
});

describe('Linked igxDrag/igxDrop ', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestDragDropLinkedSingleComponent,
                TestDragDropLinkedMixedComponent
            ],
            imports: [
                FormsModule,
                IgxDragDropModule
            ]
        })
        .compileComponents();
    }));

    it('should trigger onEnter/onDrop/onLeave events when element is dropped inside and is linked with it.', (async() => {
        const fix = TestBed.createComponent(TestDragDropLinkedSingleComponent);
        fix.detectChanges();

        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const dragDirsRects = getDragDirsRects(fix.componentInstance.dragElems);
        const startingX = (dragDirsRects[0].left + dragDirsRects[0].right) / 2;
        const startingY = (dragDirsRects[0].top + dragDirsRects[0].bottom) / 2;

        const dropArea = fix.componentInstance.dropArea;
        const dropAreaRects = getElemRects(dropArea.element.nativeElement);

        spyOn(dropArea.onEnter, 'emit');
        spyOn(dropArea.onLeave, 'emit');
        spyOn(dropArea.onDrop, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
        expect(dropArea.element.nativeElement.children.length).toEqual(0);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', firstDrag['dragGhost'], dropAreaRects.left  + 100, dropAreaRects.top  + 5);
        await wait(100);

        expect(dropArea.onEnter.emit).toHaveBeenCalled();

        // We need to trigger the pointerup on the dragGhost because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', firstDrag['dragGhost'], dropAreaRects.left + 100, dropAreaRects.top + 20 );
        await wait();

        expect(dropArea.onDrop.emit).toHaveBeenCalled();
        expect(dropArea.onLeave.emit).toHaveBeenCalled();
        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(2);
        expect(dropArea.element.nativeElement.children.length).toEqual(1);
    }));

    it('should not trigger onEnter/onDrop/onLeave events when element is dropped inside and is not linked with it.', (async() => {
        const fix = TestBed.createComponent(TestDragDropLinkedSingleComponent);
        fix.detectChanges();

        const secondDrag = fix.componentInstance.dragElems.toArray()[1];
        const firstElement = secondDrag.element.nativeElement;
        const dragDirsRects = getDragDirsRects(fix.componentInstance.dragElems);
        const startingX = (dragDirsRects[1].left + dragDirsRects[1].right) / 2;
        const startingY = (dragDirsRects[1].top + dragDirsRects[1].bottom) / 2;

        const dropArea = fix.componentInstance.dropArea;
        const dropAreaRects = getElemRects(dropArea.element.nativeElement);

        spyOn(dropArea.onEnter, 'emit');
        spyOn(dropArea.onLeave, 'emit');
        spyOn(dropArea.onDrop, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
        expect(dropArea.element.nativeElement.children.length).toEqual(0);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', secondDrag['dragGhost'], dropAreaRects.left  + 100, dropAreaRects.top  + 5);
        await wait(100);

        expect(dropArea.onEnter.emit).not.toHaveBeenCalled();

        // We need to trigger the pointerup on the dragGhost because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', secondDrag['dragGhost'], dropAreaRects.left + 100, dropAreaRects.top + 20 );
        await wait();

        expect(dropArea.onDrop.emit).not.toHaveBeenCalled();
        expect(dropArea.onLeave.emit).not.toHaveBeenCalled();
        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
        expect(dropArea.element.nativeElement.children.length).toEqual(0);
    }));

    it(`should not trigger onEnter/onDrop/onLeave events when element is dropped inside and is not linked with it
            but linked with multiple other types of channels.`, (async() => {
        const fix = TestBed.createComponent(TestDragDropLinkedMixedComponent);
        fix.detectChanges();

        const secondDrag = fix.componentInstance.dragElems.toArray()[1];
        const firstElement = secondDrag.element.nativeElement;
        const dragDirsRects = getDragDirsRects(fix.componentInstance.dragElems);
        const startingX = (dragDirsRects[1].left + dragDirsRects[1].right) / 2;
        const startingY = (dragDirsRects[1].top + dragDirsRects[1].bottom) / 2;

        const dropArea = fix.componentInstance.dropArea;
        const dropAreaRects = getElemRects(dropArea.element.nativeElement);

        spyOn(dropArea.onEnter, 'emit');
        spyOn(dropArea.onLeave, 'emit');
        spyOn(dropArea.onDrop, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();
        await wait();

        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
        expect(dropArea.element.nativeElement.children.length).toEqual(0);

        UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);
        fix.detectChanges();
        await wait(100);

        UIInteractions.simulatePointerEvent('pointermove', secondDrag['dragGhost'], dropAreaRects.left  + 100, dropAreaRects.top  + 5);
        await wait(100);

        expect(dropArea.onEnter.emit).not.toHaveBeenCalled();

        // We need to trigger the pointerup on the dragGhost because this is the element we move and is under the mouse
        UIInteractions.simulatePointerEvent('pointerup', secondDrag['dragGhost'], dropAreaRects.left + 100, dropAreaRects.top + 20 );
        await wait();

        expect(dropArea.onDrop.emit).not.toHaveBeenCalled();
        expect(dropArea.onLeave.emit).not.toHaveBeenCalled();
        expect(fix.componentInstance.container.nativeElement.children.length).toEqual(3);
        expect(dropArea.element.nativeElement.children.length).toEqual(0);
    }));
});

function getDragDirsRects(dragDirs: QueryList<IgxDragDirective>) {
    const dragDirsRects = [];
    dragDirs.forEach((dragDir) => {
        const dragElem = dragDir.element.nativeElement;
        dragDirsRects.push(getElemRects(dragElem));
    });

    return dragDirsRects;
}

function getElemRects(nativeElem) {
    return {
        top: nativeElem.getBoundingClientRect().top,
        left: nativeElem.getBoundingClientRect().left,
        right: nativeElem.getBoundingClientRect().right,
        bottom: nativeElem.getBoundingClientRect().bottom
    };
}

const generalStyles = [`
    .container {
        width: 500px;
        height: 100px;
        display: flex;
        flex-flow: row;
    }
    .dragElem {
        width: 100px;
        height: 50px;
        margin: 10px;
        background-color: #66cc99;
        text-align: center;
        user-select: none;
    }
    .dragGhost {
        width: 100px;
        height: 50px;
        margin: 10px;
        background-color: #66cc99;
        text-align: center;
        user-select: none;
    }
    .dropAreaStyle {
        width: 500px;
        height: 100px;
        background-color: #cccccc;
        display: flex;
        flex-flow: row;
    }
    .dragHandle {
        width: 10px;
        height: 10px;
        background-color: red;
        float: right;
        margin: 5px;
    }
`];

@Component({
    styles: generalStyles,
    template: `
        <h3>Draggable elements:</h3>
        <div #container class="container">
            <div id="firstDrag" class="dragElem" [igxDrag]="{ key: 1 }">Drag 1</div>
            <div id="secondDrag" class="dragElem" [igxDrag]="{ key: 2 }">Drag 2</div>
            <div id="thirdDrag" class="dragElem" [igxDrag]="{ key: 3 }">
                Drag 3
                <div igxDragHandle class="dragHandle"></div>
            </div>
            <ng-template #ghostTemplate>
                <div class="dragGhost">Drag Template</div>
            </ng-template>
        </div>
        <br/>
        <h3>Drop area:</h3>
        <div #dropArea class="dropAreaStyle" [igxDrop]="{ key: 333 }"></div>
    `
})
class TestDragDropComponent {
    @ViewChildren(IgxDragDirective)
    public dragElems: QueryList<IgxDragDirective>;

    @ViewChild('dropArea', { read: IgxDropDirective, static: true })
    public dropArea: IgxDropDirective;

    @ViewChild('container', { read: ElementRef, static: true })
    public container: ElementRef;

    @ViewChild('ghostTemplate', { read: TemplateRef, static: true })
    public ghostTemplate: TemplateRef<any>;
}

@Component({
    styles: generalStyles,
    template: `
        <h3>Draggable elements:</h3>
        <div #container class="container">
            <div id="firstDrag" class="dragElem" [igxDrag]="{ key: 1 }" [dragChannel]="1">Drag 1</div>
            <div id="secondDrag" class="dragElem" [igxDrag]="{ key: 2 }" [dragChannel]="2">Drag 2</div>
            <div id="thirdDrag" class="dragElem" [igxDrag]="{ key: 3 }" [dragChannel]="3">Drag 3</div>
            <ng-template #ghostTemplate>
                <div class="dragGhost">Drag Template</div>
            </ng-template>
        </div>
        <br/>
        <h3>Drop area:</h3>
        <div #dropArea class="dropAreaStyle" [igxDrop]="{ key: 333 }" [dropChannel]="1"></div>
    `
})
class TestDragDropLinkedSingleComponent extends TestDragDropComponent { }

@Component({
    styles: generalStyles,
    template: `
        <h3>Draggable elements:</h3>
        <div #container class="container">
            <div id="firstDrag" class="dragElem" [igxDrag]="{ key: 1 }" [dragChannel]="1">Drag 1</div>
            <div id="secondDrag" class="dragElem" [igxDrag]="{ key: 2 }" [dragChannel]="[2, 6, '3']">Drag 2</div>
            <div id="thirdDrag" class="dragElem" [igxDrag]="{ key: 3 }" [dragChannel]="3">Drag 3</div>
            <ng-template #ghostTemplate>
                <div class="dragGhost">Drag Template</div>
            </ng-template>
        </div>
        <br/>
        <h3>Drop area:</h3>
        <div #dropArea class="dropAreaStyle" [igxDrop]="{ key: 333 }" [dropChannel]="[1, 3]"></div>
    `
})
class TestDragDropLinkedMixedComponent extends TestDragDropComponent { }
