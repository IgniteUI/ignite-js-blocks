import { Component, ViewChild, ViewChildren } from '@angular/core';
import { IgxChipsAreaComponent, IgxChipComponent } from 'igniteui-angular';

@Component({
    selector: 'app-chips-sample',
    styleUrls: ['chips.sample.css', '../app.component.css'],
    templateUrl: 'chips.sample.html'
})
export class ChipsSampleComponent {
    public chipList = [
        { id: 'Country', text: 'Country' },
        { id: 'City', text: 'City' },
        { id: 'Town', text: 'Town' },
        { id: 'FirstName', text: 'First Name' },
    ];

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent})
    public chipsArea: IgxChipsAreaComponent;

    chipsOrderChanged(event) {
        const newChipList = [];
        for (let i = 0; i < event.chipsArray.length; i++) {
            const chipItem = this.chipList.filter((item) => {
                return item.id === event.chipsArray[i].id;
            })[0];
            newChipList.push(chipItem);
        }
        this.chipList = newChipList;
        event.isValid = true;
    }

    chipMovingEnded() {
    }

    chipRemoved(event) {
        this.chipList = this.chipList.filter((item) => {
            return item.id !== event.owner.id;
        });
        this.chipsArea.cdr.detectChanges();
    }

    selectChip(chipId) {
        const chipToSelect = this.chipsArea.chipsList.toArray().find((chip) => {
            return chip.id === chipId;
        });
        chipToSelect.selected = true;
    }

    onChipsSelected(event) {
        console.log(event.newSelection);
    }
}
