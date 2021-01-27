import { Component } from '@angular/core';

@Component({
    selector: 'app-input-sample',
    styleUrls: ['input.sample.css'],
    templateUrl: 'input.sample.html'
})
export class InputSampleComponent {
    public placeholder = 'Please enter a value';
    public user = {
        comment: '',
        firstName: 'John',
        gender: 'Male',
        lastName: 'Doe',
        password: '1337s3cr3t',
        registered: false,
        subscribed: false,
        dateOfBirth: new Date('07 July, 1987')
    };
    public user2 = {
        comment: '',
        firstName: 'John',
        gender: 'Male',
        lastName: 'Doe',
        password: '1337s3cr3t',
        registered: true,
        subscribed: false,
        dateOfBirth: new Date('01 July, 1954')
    };
    public settings = [{
        name: 'WiFi',
        icon: 'wifi',
        active: true,
        disabled: false
    },
    {
        name: 'Bluetooth',
        icon: 'bluetooth',
        active: true,
        disabled: false
    }, {
        name: 'Device Visibility',
        icon: 'visibility',
        active: false,
        disabled: true
    }];

    public onClick(event) {
        console.log(event);
    }

    public onChange(event) {
        console.log(event);
    }
}
