import { Component, ViewChild, OnInit, TemplateRef, AfterViewInit, ElementRef } from '@angular/core';
import { IgxComboComponent, IComboSelectionChangeEventArgs,
    DisplayDensity, OverlaySettings, VerticalAlignment, HorizontalAlignment, GlobalPositionStrategy,
    scaleInCenter, scaleOutCenter, ElasticPositionStrategy, ConnectedPositioningStrategy
} from 'igniteui-angular';
import { ButtonGroupAlignment } from 'igniteui-angular';
import { take } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'combo-sample',
    templateUrl: './combo.sample.html',
    styleUrls: ['combo.sample.css']
})
export class ComboSampleComponent implements OnInit, AfterViewInit {
    @ViewChild('playgroundCombo', { static: true })
    public igxCombo: IgxComboComponent;
    @ViewChild('playgroundCombo', { read: ElementRef, static: true })
    private comboRef: ElementRef;
    @ViewChild('customItemTemplate', { read: TemplateRef, static: true })
    private customItemTemplate;

    public alignment: ButtonGroupAlignment = ButtonGroupAlignment.vertical;
    public toggleItemState = false;
    public filterableFlag = true;
    public customValuesFlag = true;
    public autoFocusSearch = true;
    public items: any[] = [];
    public values1:  Array<any> = ['Arizona'];
    public values2:  Array<any>;
    public isDisabled = false;

    public valueKeyVar = 'field';
    public currentDataType = '';

    public comfortable: DisplayDensity = DisplayDensity.comfortable;
    public cosy: DisplayDensity = DisplayDensity.cosy;
    public compact: DisplayDensity = DisplayDensity.compact;

    public genres = [];
    public user: FormGroup;
    private overlaySettings: OverlaySettings[] = [null, null, null, null];
    private initialItemTemplate: TemplateRef<any> = null;

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
            Mountain: ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming'],
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
            });
        }
    }

    public handleAddition(evt) {
        console.log(evt);
        evt.addedItem[this.igxCombo.groupKey] = 'MyCustomGroup';
    }

    public toggleItem(itemID) {
        this.toggleItemState = !this.toggleItemState;
        this.igxCombo.setSelectedItem(itemID, this.toggleItemState);
    }

    public ngOnInit() {
        this.igxCombo.opening.subscribe(() => {
            console.log('Opening log!');
        });

        this.igxCombo.opened.subscribe(() => {
            console.log('Opened log!');
        });

        this.igxCombo.opened.pipe(take(1)).subscribe(() => {
            console.log('Attaching');
            if (this.igxCombo.searchInput) {
                this.igxCombo.searchInput.nativeElement.onchange = (e) => {
                    console.log(e);
                };
            }
        });

        this.igxCombo.closing.subscribe(() => {
            console.log('Closing log!');
        });

        this.igxCombo.closed.subscribe(() => {
            console.log('Closed log!');
        });

        this.igxCombo.searchInputUpdate.subscribe((e) => {
            console.log(e);
        });
    }

    public ngAfterViewInit() {
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

    public changeOverlaySettings(index: number) {
        this.igxCombo.overlaySettings = this.overlaySettings[index];
    }

    public changeItemTemplate() {
        const comboTemplate = this.initialItemTemplate ? null : this.igxCombo.itemTemplate;
        this.igxCombo.itemTemplate = this.initialItemTemplate ? this.initialItemTemplate : this.customItemTemplate ;
        this.initialItemTemplate = comboTemplate;
    }

    public setDensity(density: DisplayDensity) {
        this.igxCombo.displayDensity = density;
    }

    public handleSelectionChange(event: IComboSelectionChangeEventArgs) {
        console.log(event);
    }
}
