import { Component, ViewChild } from '@angular/core';
import { IgxTimePickerComponent,
    IgxInputDirective,
    AutoPositionStrategy,
    OverlaySettings,
    DatePart } from 'igniteui-angular';

@Component({
    selector: 'app-time-picker-sample',
    styleUrls: ['time-picker.sample.scss'],
    templateUrl: 'time-picker.sample.html'
})
export class TimePickerSampleComponent {
    @ViewChild('tp', { read: IgxTimePickerComponent, static: true })
    public tp: IgxTimePickerComponent;

    @ViewChild('target')
    public target: IgxInputDirective;

    public itemsDelta = { hours: 1, minutes: 15, seconds: 20 };
    public format = 'hh:mm:ss tt';
    public spinLoop = true;
    public datePart = DatePart.Hours;

    public date = new Date(2018, 10, 27, 11, 45, 0, 0);
    public min = new Date(2018, 10, 27, 6, 30, 15, 0);
    public max = new Date(2018, 10, 27, 14, 20, 30, 0);
    public date1 = new Date(2018, 10, 27, 11, 45, 0, 0);
    public val = '08:30:00';
    public today = new Date(Date.now());

    public isRequired = true;

    public myOverlaySettings: OverlaySettings = {
        modal: false,
        closeOnOutsideClick: true,
        positionStrategy: new AutoPositionStrategy()
    };

    public change() {
        this.isRequired = !this.isRequired;
    }

    public valueChanged(event) {
        console.log(event);
    }

    public validationFailed(event) {
        console.log(event);
    }

    public showDate(date) {
        return date ? date.toLocaleString() : 'Value is null.';
    }

    public updateValue(event){
        this.val = event;
    }

    public selectCurrentTime(picker: IgxTimePickerComponent) {
        picker.value = new Date(Date.now());
        picker.close();
    }

    public increment() {
        this.tp.increment();
    }
    public decrement() {
        this.tp.decrement(DatePart.Minutes);
    }
}
