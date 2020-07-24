import { Component } from '@angular/core';
import { DataType } from 'igniteui-angular';

@Component({
    selector: 'app-grid-nested-props',
    templateUrl: 'grid-nested-props.sample.html'
})
export class GridNestedPropsSampleComponent {
    data = [];
    config = [
        { field: 'id', type: DataType.Number },
        { field: 'padding.left', type: DataType.Number },
        { field: 'padding.top', type: DataType.Number },
        { field: 'margin.bottom', type: DataType.Number },
        { field: 'margin.top', type: DataType.Number },
        { field: 'misc.font.lineHeight', type: DataType.Number },
        { field: 'misc.font.family', type: DataType.String, groupable: true }
    ];

    treeData = [
        {
            ID: 147,
            Name: 'John Winchester',
            HireDate: new Date(2008, 3, 20),
            Age: 55,
            Employees: [
                {
                    ID: 475,
                    Name: 'Michael Langdon',
                    HireDate: new Date(2011, 6, 3),
                    Age: 30,
                    Employees: null
                },
                {
                    ID: 957,
                    Name: 'Thomas Hardy',
                    HireDate: new Date(2009, 6, 19),
                    Age: 29,
                    Employees: undefined
                },
                {
                    ID: 317,
                    Name: 'Monica Reyes',
                    HireDate: new Date(2014, 8, 18),
                    Age: 31,
                    Employees: [
                        {
                            ID: 711,
                            Name: 'Roland Mendel',
                            HireDate: new Date(2015, 9, 17),
                            Age: 35
                        },
                        {
                            ID: 998,
                            Name: 'Sven Ottlieb',
                            HireDate: new Date(2009, 10, 11),
                            Age: 44
                        },
                        {
                            ID: 299,
                            Name: 'Peter Lewis',
                            HireDate: new Date(2018, 3, 18),
                            Age: 25
                        }
                    ]
                }]
        },
        {
            ID: 19,
            Name: 'Yang Wang',
            HireDate: new Date(2010, 1, 1),
            Age: 61
        },
        {
            ID: 847,
            Name: 'Ana Sanders',
            HireDate: new Date(2014, 1, 22),
            Age: 42,
            Employees: [
                {
                    ID: 663,
                    Name: 'Elizabeth Richards',
                    HireDate: new Date(2017, 11, 9),
                    Age: 25
                }]
        }
    ];

    styles = {
        color: (_, __, value) => value > 10 && value % 2 === 0 ? 'purple' : 'gray',
        'font-weight': (_, __, value) => value > 10 && value % 2 === 0 ? 'bold' : 'normal',
    };

    constructor() {
        for (let i = 0; i < 100; i++) {
            this.data.push({
                id: i,
                padding: {
                    left: i - 10,
                    right: i + 10,
                    top: i - 0.5,
                    bottom: i + 0.5
                },
                margin: {
                    left: i * -100,
                    right: i * 100,
                    top: i * Math.PI,
                    bottom: i * Math.E
                },
                misc: {
                    font: {
                        lineHeight: Math.E * Math.sqrt(i),
                        family: 'monospace'
                    }
                }
            });

        }
    }
}
