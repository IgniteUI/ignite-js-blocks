import { AfterViewInit,
        Component,
        ElementRef,
        NgModule,
        QueryList,
        Renderer2,
        ViewChild,
        ViewChildren } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-bottomnav-sample',
    styleUrls: ['bottomnav.sample.css'],
    templateUrl: 'bottomnav.sample.html'
})
export class BottomNavSampleComponent implements AfterViewInit {

    @ViewChildren('tabbarEl')
    tabbar: QueryList<ElementRef>;

    options = {};

    contacts = [{
        avatar: 'assets/images/avatar/1.jpg',
        favorite: true,
        key: '1',
        link: '#',
        phone: '770-504-2217',
        text: 'Terrance Orta'
    }, {
        avatar: 'assets/images/avatar/2.jpg',
        favorite: false,
        key: '2',
        link: '#',
        phone: '423-676-2869',
        text: 'Richard Mahoney'
    }, {
        avatar: 'assets/images/avatar/3.jpg',
        favorite: false,
        key: '3',
        link: '#',
        phone: '859-496-2817',
        text: 'Donna Price'
    }, {
        avatar: 'assets/images/avatar/4.jpg',
        favorite: false,
        key: '4',
        link: '#',
        phone: '901-747-3428',
        text: 'Lisa Landers'
    }, {
        avatar: 'assets/images/avatar/12.jpg',
        favorite: true,
        key: '5',
        link: '#',
        phone: '573-394-9254',
        text: 'Dorothy H. Spencer'
    }, {
        avatar: 'assets/images/avatar/13.jpg',
        favorite: false,
        key: '6',
        link: '#',
        phone: '323-668-1482',
        text: 'Stephanie May'
    }, {
        avatar: 'assets/images/avatar/14.jpg',
        favorite: false,
        key: '7',
        link: '#',
        phone: '401-661-3742',
        text: 'Marianne Taylor'
    }];

    constructor(private router: Router, private renderer: Renderer2) { }

    route(event) {
        if (event.panel.index === 2) {
            this.router.navigate(['/bottom-navigation/tabbar', { outlets: { tabPanelOutlet: ['tabbarInnerPath'] } }]);
        }
    }

    ngAfterViewInit() {
        this.tabbar.map((e) => {
            menubar = e.nativeElement.querySelector('.igx-bottom-nav__menu');
            this.renderer.setStyle(menubar, 'position', 'absolute');
        });
    }
}

@Component({
    selector: 'app-custom-content',
    templateUrl: 'template.html'
})

export class CustomContentComponent {

}
