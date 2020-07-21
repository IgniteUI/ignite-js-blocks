import {Component, Inject, OnInit} from '@angular/core';
import {ButtonGroupAlignment, DisplayDensityToken, IDisplayDensityOptions} from 'igniteui-angular';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'input-group-sample',
    styleUrls: ['input-group.sample.scss'],
    templateUrl: 'input-group.sample.html'
})
export class InputGroupSampleComponent implements OnInit {
    public inputValue: any;
    public isRequired = false;
    public isDisabled = false;
    public alignment = ButtonGroupAlignment.vertical;
    public density = 'comfortable';
    public displayDensities;
    public inputType = '';
    public inputTypes;
    public inputSearchType = 'search';
    date = new Date();
    constructor(@Inject(DisplayDensityToken) public displayDensityOptions: IDisplayDensityOptions) {}

    public ngOnInit(): void {
        this.displayDensities = [
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'compact', selected: this.density === 'compact', togglable: true }
        ];

        this.inputTypes = [
            { selected: true, type: 'line', label: 'Line', togglable: true},
            { selected: this.inputType === 'border', type: 'border', label: 'Border', togglable: true},
            { selected: this.inputType === 'box', type: 'box', label: 'Box', togglable: true},
            { selected: this.inputType === 'fluent', type: 'fluent', label: 'Fluent', togglable: true},
            { selected: this.inputType === 'bootstrap', type: 'bootstrap', label: 'Bootstrap', togglable: true},
            { selected: this.inputType === 'indigo', type: 'indigo', label: 'Indigo', togglable: true},
        ];
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    public selectInoutType(event) {
        const currentType = this.inputTypes[event.index].type;
        this.inputType = this.inputTypes[event.index].type;
        if (currentType === 'fluent' ) {
            this.inputSearchType = 'fluent_search';
        } else {
            this.inputSearchType = 'search';
        }
    }

    public disableFields() {
        if (this.isDisabled === false) {
            this.isDisabled = true;
        } else if (this.isDisabled === true) {
            this.isDisabled = false;
        }
    }

    public toggleRequired() {
        this.isRequired = !this.isRequired;
    }
}

