import { Component } from "@angular/core";

@Component({
    // tslint:disable-next-line:component-selector
    selector: "input-group-sample",
    styleUrls: ["input-group.component.css"],
    templateUrl: "./input-group.component.html"
})
export class InputGroupSampleComponent {
    public user = {
        firstName: "Oke",
        lastName: "Nduka"
    };
}
