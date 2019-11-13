import { Component } from '@angular/core';
import { SliderType, ISliderValueChangeEventArgs, IRangeSliderValue, TickLabelsOrientation, TicksOrientation } from 'igniteui-angular';

class Task {
    title: string;
    percentCompleted: number;

    constructor(title: string, percentCompeted: number) {
        this.title = title;
        this.percentCompleted = percentCompeted;
    }
}

@Component({
    selector: 'app-slider-sample',
    styleUrls: ['slider.sample.scss'],
    templateUrl: 'slider.sample.html'
})
export class SliderSampleComponent {
    private _lowerValue: Date;
    private _upperValue: Date;

    public labelOrientaion = TickLabelsOrientation.horizontal;
    public ticksOrientation = TicksOrientation.mirror;
    public primaryTickLabels = true;
    public secondaryTickLabels = true;
    public sliderType: SliderType = SliderType.RANGE;
    public labelsDates = new Array<Date>();
    public task: Task = new Task('Implement new app', 30);
    public labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    public rangeValue = {
        lower: 34,
        upper: 67
    };

    public rangeLabel = {
        lower: 2,
        upper: 5
    };

    constructor() {
        for (let i = 0; i <= 500; i++) {
            this.labelsDates.push(new Date(2019, 10, i));
        }

        this._lowerValue = this.labelsDates[0];
        this._upperValue = this.labelsDates[this.labels.length - 1];
    }

    public get getLowerVal() {
        return `${this._lowerValue.getDay()}/${this._lowerValue.getMonth()}/${this._lowerValue.getFullYear()}`;
    }

    public get getUpperVal() {
        return `${this._upperValue.getDay()}/${this._upperValue.getMonth()}/${this._upperValue.getFullYear()}`;
    }

    public valueChange(evt: ISliderValueChangeEventArgs) {
        this._lowerValue = this.labelsDates[(evt.value as IRangeSliderValue).lower];
        this._upperValue = this.labelsDates[(evt.value as IRangeSliderValue).upper];
    }

    public changeLabels() {
        this.labels = new Array('asd', 'bsd');
    }

    public changeLabelOrientation() {
        if (this.labelOrientaion === TickLabelsOrientation.horizontal) {
            this.labelOrientaion = TickLabelsOrientation.toptobottom;
        } else {
            this.labelOrientaion = TickLabelsOrientation.horizontal;
        }
    }

    public changeTicksOrientation() {
        if (this.ticksOrientation === TicksOrientation.mirror) {
            this.ticksOrientation = TicksOrientation.top;
        } else if (this.ticksOrientation === TicksOrientation.top) {
            this.ticksOrientation = TicksOrientation.bottom;
        } else {
            this.ticksOrientation = TicksOrientation.mirror;
        }
    }

    public tickLabel(value, primary, index, labels) {
        if (primary) {
            return Math.round(value);
        }

        return value;
    }

}
