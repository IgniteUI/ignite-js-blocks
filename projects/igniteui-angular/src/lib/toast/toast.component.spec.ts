import { Component, ViewChild } from '@angular/core';
import {
    waitForAsync,
    TestBed,
    fakeAsync,
    tick,
    ComponentFixture,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    IgxToastComponent,
    IgxToastModule,
} from './toast.component';
import { configureTestSuite } from '../test-utils/configure-suite';

describe('IgxToast', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ToastInitializeTestComponent],
            imports: [BrowserAnimationsModule, IgxToastModule],
        }).compileComponents();
    }));

    const baseClass = 'igx-toast';
    let fixture: ComponentFixture<ToastInitializeTestComponent>;
    let toast: IgxToastComponent;

    beforeEach(() => {
        fixture = TestBed.createComponent(ToastInitializeTestComponent);
        toast = fixture.componentInstance.toast;
        toast.isVisible = true;
        fixture.detectChanges();
    });

    it('should properly initialize', () => {
        const domToast = fixture.debugElement.query(By.css(baseClass))
            .nativeElement;
        expect(toast.id).toContain('igx-toast-');
        expect(domToast.id).toContain('igx-toast-');
        expect(toast.displayTime).toBe(4000);
        expect(toast.autoHide).toBeTruthy();
        expect(toast.isVisible).toBeTruthy();

        toast.id = 'customToast';
        fixture.detectChanges();

        expect(toast.id).toBe('customToast');
        expect(domToast.id).toBe('customToast');
    });

    it('should auto hide after it\'s open', fakeAsync(() => {
        spyOn(toast.onHiding, 'emit');
        toast.displayTime = 1000;

        toast.show();
        tick(1000);
        expect(toast.onHiding.emit).toHaveBeenCalled();
    }));

    it('should not auto hide after it\'s open', fakeAsync(() => {
        spyOn(toast.onHiding, 'emit');
        toast.displayTime = 1000;
        toast.autoHide = false;

        toast.show();
        tick(1000);
        expect(toast.onHiding.emit).not.toHaveBeenCalled();
    }));

    it('should emit onShowing when toast is shown', () => {
        spyOn(toast.onShowing, 'emit');
        toast.show();
        expect(toast.onShowing.emit).toHaveBeenCalled();
    });

    it('should emit onHiding when toast is hidden', () => {
        spyOn(toast.onHiding, 'emit');
        toast.hide();
        expect(toast.onHiding.emit).toHaveBeenCalled();
    });

    it('should emit onShown when toggle onOpened is fired', waitForAsync(() => {
        spyOn(toast.onShown, 'emit');
        toast.open();

        toast.onOpened.subscribe(() => {
            expect(toast.onShown.emit).toHaveBeenCalled();
        });
    }));

    it('should emit onHidden when toggle onClosed is fired', waitForAsync(() => {
        spyOn(toast.onHidden, 'emit');
        toast.isVisible = true;
        toast.close();

        toast.onClosed.subscribe(() => {
            expect(toast.onHidden.emit).toHaveBeenCalled();
        });
    }));

    it('visibility is updated by the toggle() method', waitForAsync((done: DoneFn) => {
        toast.autoHide = false;

        toast.toggle();
        toast.onOpened.subscribe(() => {
            expect(toast.isVisible).toEqual(true);
        });

        toast.toggle();
        toast.onClosed.subscribe(() => {
            expect(toast.isVisible).toEqual(false);
            done();
        });
    }));

    it('can set message through show method', fakeAsync(() => {
        toast.displayTime = 100;
        toast.autoHide = false;

        toast.show('Custom Message');
        tick(100);
        fixture.detectChanges();

        expect(toast.isVisible).toBeTruthy();
        expect(toast.autoHide).toBeFalsy();
        expect(toast.toastMessage).toBe('Custom Message');
    }));
});

@Component({
    template: `<igx-toast #toast></igx-toast>`,
})
class ToastInitializeTestComponent {
    @ViewChild(IgxToastComponent, { static: true })
    public toast: IgxToastComponent;
}
