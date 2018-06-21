import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IgxNavigationDrawerComponent, IgxIconService } from 'igniteui-angular';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    @ViewChild('navdrawer', { read: IgxNavigationDrawerComponent })
    navdrawer;

    drawerState = {
        enableGestures: true,
        open: true,
        pin: false,
        pinThreshold: 768,
        position: 'left',
        width: '300px',
        miniWidth: '80px',
        miniVariant: false
    };

    componentLinks = [
        {
            link: '/avatar',
            icon: 'account_circle',
            name: 'Avatar'
        },
        {
            link: '/badge',
            icon: 'error',
            name: 'Badge'
        },
        {
            link: '/buttonGroup',
            icon: 'group_work',
            name: 'Button Group'
        },
        {
            link: '/calendar',
            icon: 'event',
            name: 'Calendar'
        },
        {
            link: '/card',
            icon: 'home',
            name: 'Card'
        },
        {
            link: '/carousel',
            icon: 'view_carousel',
            name: 'Carousel'
        },
        {
            link: '/datePicker',
            icon: 'date_range',
            name: 'DatePicker'
        },
        {
            link: '/timePicker',
            icon: 'date_range',
            name: 'TimePicker'
        },
        {
            link: '/dropDown',
            icon: 'drop_down',
            name: 'DropDown'
        },
        {
            link: '/drag-drop',
            icon: 'view_column',
            name: 'Drag and Drop'
        },
        {
            link: '/grid',
            icon: 'view_column',
            name: 'Grid'
        },
        {
            link: '/gridColumnMoving',
            icon: 'view_column',
            name: 'Grid Column Moving'
        },
        {
            link: '/gridColumnPinning',
            icon: 'view_column',
            name: 'Grid Column Pinning'
        },
        {
            link: '/gridColumnResizing',
            icon: 'view_column',
            name: 'Grid Column Resizing'
        },
        {
            link: '/gridPerformance',
            icon: 'view_column',
            name: 'Grid Performance'
        },
        {
            link: '/gridRemoteVirtualization',
            icon: 'view_column',
            name: 'Grid Remote Virtualization'
        },
        {
            link: '/gridSummary',
            icon: 'view_column',
            name: 'Grid Summary'
        },
        {
            link: '/gridCellEditing',
            icon: 'view_column',
            name: 'Grid Cell Editing'
        },
        {
            link: '/gridSelection',
            icon: 'view_column',
            name: 'Grid Selection'
        },
        {
            link: '/gridToolbar',
            icon: 'view_column',
            name: 'Grid Toolbar'
        },
        {
            link: '/dialog',
            icon: 'all_out',
            name: 'Dialog'
        },
        {
            link: '/inputs',
            icon: 'web',
            name: 'Forms'
        },
        {
            link: '/icon',
            icon: 'android',
            name: 'Icon'
        },
        {
            link: '/list',
            icon: 'list',
            name: 'List'
        },
        {
            link: '/listPerformance',
            icon: 'list',
            name: 'List Performance'
        },
        {
            link: '/navbar',
            icon: 'arrow_back',
            name: 'Navbar'
        },
        {
            link: '/navdrawer',
            icon: 'menu',
            name: 'Navdrawer'
        },
        {
            link: '/progressbar',
            icon: 'poll',
            name: 'Progress Indicators'
        },
        {
            link: '/slider',
            icon: 'linear_scale',
            name: 'Slider'
        },
        {
            link: '/snackbar',
            icon: 'feedback',
            name: 'Snackbar'
        },
        {
            link: '/bottom-navigation',
            icon: 'tab',
            name: 'Bottom Navigation'
        },
        {
            link: '/tabs',
            icon: 'tab',
            name: 'Tabs'
        },
        {
            link: '/toast',
            icon: 'android',
            name: 'Toast'
        }
    ];

    directiveLinks = [
        {
            link: '/buttons',
            icon: 'radio_button_unchecked',
            name: 'Buttons'
        },
        {
            link: '/input-group',
            icon: 'web',
            name: 'Input Group'
        },
        {
            link: '/layout',
            icon: 'view_quilt',
            name: 'Layout'
        },
        {
            link: '/ripple',
            icon: 'wifi_tethering',
            name: 'Ripple'
        },
        {
            link: '/virtualForDirective',
            icon: 'view_column',
            name: 'Virtual-For Directive'
        },
        {
            link: '/mask',
            icon: 'view_column',
            name: 'Mask Directive'
        }
    ];

    styleLinks = [
        {
            link: '/colors',
            icon: 'color_lens',
            name: 'Colors'
        },
        {
            link: '/typography',
            icon: 'font_download',
            name: 'Typography'
        },
        {
            link: '/shadows',
            icon: 'layers',
            name: 'Shadows'
        }
    ];

    constructor(private router: Router, private iconService: IgxIconService) {
        iconService.registerFontSetAlias('fa-solid', 'fa');
        iconService.registerFontSetAlias('fa-brands', 'fab');
    }

    ngOnInit() {
        this.router.events.pipe(
            filter(x => x instanceof NavigationStart)
        )
            .subscribe((event: NavigationStart) => {
                if (event.url !== '/' && !this.navdrawer.pin) {
                    this.navdrawer.close();
                }
            });
    }
}
