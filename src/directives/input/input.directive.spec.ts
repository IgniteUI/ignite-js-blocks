import { Component, ViewChild } from "@angular/core";
import {
  async,
  TestBed
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxLabelModule } from "../label/label.directive";
import { IgxInputModule } from "./input.directive";

describe("IgxInput", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitInputComponent,
                InputWithAttribsComponent
            ],
            imports: [
                IgxInputModule,
                IgxLabelModule
            ]
        })
        .compileComponents();
    }));

    it("Initializes an empty input", () => {
        const fixture = TestBed.createComponent(InitInputComponent);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css("input"))).toBeTruthy();
    });

    it("Initializes an empty input with attributes", () => {
        const fixture = TestBed.createComponent(InputWithAttribsComponent);
        fixture.detectChanges();

        const inputEl = fixture.debugElement.query(By.css("input")).nativeElement;

        expect(inputEl).toBeTruthy();
        expect(inputEl.getAttribute("name")).toBe("username");
        expect(inputEl.getAttribute("id")).toBe("username");
        expect(inputEl.getAttribute("placeholder")).toBe(fixture.componentInstance.placeholder);
        fixture.detectChanges();

        expect(inputEl.classList.contains("igx-form-group__input--placeholder")).toBe(true, "1");
        expect(inputEl.classList.contains("ig-form-group__input--focused")).toBe(false);

        inputEl.dispatchEvent(new Event("focus"));
        inputEl.value = "test";
        fixture.detectChanges();

        expect(inputEl.classList.contains("igx-form-group__input--placeholder")).toBe(false);
        expect(inputEl.classList.contains("igx-form-group__input--filled")).toBe(true, "2");
        expect(inputEl.classList.contains("igx-form-group__input--focused")).toBe(true, "3");

        inputEl.dispatchEvent(new Event("blur"));
        fixture.detectChanges();

        expect(inputEl.classList.contains("igx-form-group__input--focused")).toBe(false);

    });

});

@Component({ template: `<input type="text" igxInput />` })
class InitInputComponent {
}

@Component({
    template: `
        <div class="igx-form-group">
            <input id="username" placeholder="{{placeholder}}" igxInput name="username" />
            <label igxLabel for="username">Username</label>
        </div>
    `
})
class InputWithAttribsComponent {
    public placeholder = "Please enter a name";
}
