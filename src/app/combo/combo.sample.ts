import { Component, ViewChild, OnInit, TemplateRef, AfterViewInit, ElementRef } from '@angular/core';
import { IgxComboComponent, IComboSelectionChangeEventArgs,
    DisplayDensity, OverlaySettings, VerticalAlignment, HorizontalAlignment, GlobalPositionStrategy,
    scaleInCenter, scaleOutCenter, ElasticPositionStrategy, ConnectedPositioningStrategy
} from 'igniteui-angular';
import { ButtonGroupAlignment } from 'igniteui-angular';
import { take } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';

const primitive = ['1', '2', '3', '4', '5', '6'];
const complex = [{
    field: 1,
    value: 1
}, {
    field: 2,
    value: 2
}, {
    field: 3,
    value: 3
}, {
    field: 4,
    value: 4
}, {
    field: 5,
    value: 5
}, {
    field: 6,
    value: 6
}];
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'combo-sample',
    templateUrl: './combo.sample.html',
    styleUrls: ['combo.sample.css']
})
export class ComboSampleComponent implements OnInit, AfterViewInit {
    private overlaySettings: OverlaySettings[] = [null, null, null, null];
    @ViewChild('playgroundCombo', { static: true }) public igxCombo: IgxComboComponent;
    @ViewChild('playgroundCombo', { read: ElementRef, static: true }) private comboRef: ElementRef;
    @ViewChild('comboTemplate', { read: IgxComboComponent }) public comboTemplate: IgxComboComponent;
    alignment = ButtonGroupAlignment.vertical;
    public toggleItemState = false;
    private initData: any[] = [];
    public filterableFlag = true;
    public customValuesFlag = true;
    public autoFocusSearch = true;
    public items: any[] = [];
    public values1:  Array<any> = ['Arizona'];
    public values2:  Array<any>;

    public valueKeyVar = 'field';
    public currentDataType = '';
    @ViewChild('customItemTemplate', { read: TemplateRef, static: true })
    private customItemTemplate;
    private initialItemTemplate: TemplateRef<any> = null;

    public comfortable: DisplayDensity = DisplayDensity.comfortable;
    public cosy: DisplayDensity = DisplayDensity.cosy;
    public compact: DisplayDensity = DisplayDensity.compact;

    public genres = [];
    public user: FormGroup;
    constructor(fb: FormBuilder) {
        this.user = fb.group({
            date: [''],
            dateTime: [''],
            email: ['', Validators.required],
            fullName: new FormControl('', Validators.required),
            genres: ['', Validators.required],
            movie: ['', Validators.required],
            phone: ['']
        });

        this.genres = [
            { type: 'Action' , movies: ['The Matrix', 'Kill Bill: Vol.1', 'The Dark Knight Rises']},
            { type: 'Adventure' , movies: ['Interstellar', 'Inglourious Basterds', 'Inception']},
            // tslint:disable-next-line:object-literal-sort-keys
            { type: 'Comedy' , movies: ['Wild Tales', 'In Bruges', 'Three Billboards Outside Ebbing, Missouri',
                'Untouchable', '3 idiots']},
            { type: 'Crime' , movies: ['Training Day', 'Heat', 'American Gangster']},
            { type: 'Drama' , movies: ['Fight Club', 'A Beautiful Mind', 'Good Will Hunting', 'City of God']},
            { type: 'Biography' , movies: ['Amadeus', 'Bohemian Rhapsody']},
            { type: 'Mystery' , movies: ['The Prestige', 'Memento', 'Cloud Atlas']},
            { type: 'Musical' , movies: ['All That Jazz']},
            { type: 'Romance' , movies: ['Love Actually', 'In The Mood for Love']},
            { type: 'Sci-Fi' , movies: ['The Fifth Element']},
            { type: 'Thriller' , movies: ['The Usual Suspects']},
            { type: 'Western' , movies: ['Django Unchained']}];

        const division = {
            'New England 01': ['Connecticut', 'Maine', 'Massachusetts'],
            'New England 02': ['New Hampshire', 'Rhode Island', 'Vermont'],
            'Mid-Atlantic': ['New Jersey', 'New York', 'Pennsylvania'],
            'East North Central 02': ['Michigan', 'Ohio', 'Wisconsin'],
            'East North Central 01': ['Illinois', 'Indiana'],
            'West North Central 01': ['Missouri', 'Nebraska', 'North Dakota', 'South Dakota'],
            'West North Central 02': ['Iowa', 'Kansas', 'Minnesota'],
            'South Atlantic 01': ['Delaware', 'Florida', 'Georgia', 'Maryland'],
            'South Atlantic 02': ['North Carolina', 'South Carolina', 'Virginia'],
            'South Atlantic 03': ['District of Columbia', 'West Virginia'],
            'East South Central 01': ['Alabama', 'Kentucky'],
            'East South Central 02': ['Mississippi', 'Tennessee'],
            'West South Central': ['Arkansas', 'Louisiana', 'Oklahome', 'Texas'],
            'Mountain': ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming'],
            'Pacific 01': ['Alaska', 'California'],
            'Pacific 02': ['Hawaii', 'Oregon', 'Washington']
        };
        const keys = Object.keys(division);
        for (const key of keys) {
            division[key].map((e) => {
                this.items.push({
                    field: e,
                    region: key.substring(0, key.length - 3)
                });
                this.initData = this.items;
            });
        }
    }

    onSelection(ev) {
    }

    handleAddition(evt) {
        console.log(evt);
        evt.addedItem[this.igxCombo.groupKey] = 'MyCustomGroup';
    }

    toggleItem(itemID) {
        this.toggleItemState = !this.toggleItemState;
        this.igxCombo.setSelectedItem(itemID, this.toggleItemState);
    }

    ngOnInit() {
        this.igxCombo.onOpening.subscribe(() => {
            console.log('Opening log!');
        });

        this.igxCombo.onOpened.subscribe(() => {
            console.log('Opened log!');
        });

        this.igxCombo.onOpened.pipe(take(1)).subscribe(() => {
            console.log('Attaching');
            if (this.igxCombo.searchInput) {
                this.igxCombo.searchInput.nativeElement.onchange = (e) => {
                    console.log(e);
                };
            }
        });

        this.igxCombo.onClosing.subscribe(() => {
            console.log('Closing log!');
        });

        this.igxCombo.onClosed.subscribe(() => {
            console.log('Closed log!');
        });

        this.igxCombo.onSearchInput.subscribe((e) => {
            console.log(e);
        });
    }

    ngAfterViewInit() {
        this.overlaySettings[0] = cloneDeep(this.igxCombo.overlaySettings);
        this.overlaySettings[1] = {
            target: this.comboRef.nativeElement,
            positionStrategy: new ElasticPositionStrategy({
                verticalDirection: VerticalAlignment.Top, verticalStartPoint: VerticalAlignment.Bottom,
                horizontalDirection: HorizontalAlignment.Left, horizontalStartPoint: HorizontalAlignment.Right }),
            modal: false,
            closeOnOutsideClick: true
        };
        this.overlaySettings[2] = {
            positionStrategy: new GlobalPositionStrategy({ openAnimation: scaleInCenter, closeAnimation: scaleOutCenter }),
            modal: true,
            closeOnOutsideClick: true
        };
        this.overlaySettings[3] = {
            target: this.comboRef.nativeElement,
            positionStrategy: new ConnectedPositioningStrategy(),
            modal: false,
            closeOnOutsideClick: true
        };
    }

    changeOverlaySettings(index: number) {
        this.igxCombo.overlaySettings = this.overlaySettings[index];
    }

    changeItemTemplate() {
        const comboTemplate = this.initialItemTemplate ? null : this.igxCombo.itemTemplate;
        this.igxCombo.itemTemplate = this.initialItemTemplate ? this.initialItemTemplate : this.customItemTemplate ;
        this.initialItemTemplate = comboTemplate;
    }

    setDensity(density: DisplayDensity) {
        this.igxCombo.displayDensity = density;
    }

    handleSelectionChange(event: IComboSelectionChangeEventArgs) {
        console.log(event);
    }
}
