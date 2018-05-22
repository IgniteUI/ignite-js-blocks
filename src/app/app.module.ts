import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { IgxIconModule } from 'igniteui-angular';
import { SharedModule } from './shared/shared.module';

import { routing } from './routing';
import { AppComponent } from './app.component';
import { AvatartSampleComponent } from './avatar/avatar.sample';
import { PageHeaderComponent } from './pageHeading/pageHeading.component';
import { BadgeSampleComponent } from './badge/badge.sample';
import { ButtonSampleComponent } from './button/button.sample';
import { CalendarSampleComponent } from './calendar/calendar.sample';
import { CardSampleComponent } from './card/card.sample';
import { CarouselSampleComponent } from './carousel/carousel.sample';
import { DatePickerSampleComponent } from './date-picker/date-picker.sample';
import { DialogSampleComponent } from './dialog/dialog.sample';
import { MaskSampleComponent } from './mask/mask.sample';
import { IconSampleComponent } from './icon/icon.sample';
import { InputSampleComponent } from './input/input.sample';
import { InputGroupSampleComponent } from './input-group/input-group.sample';
import { LayoutSampleComponent } from './layout/layout.sample';
import { ListSampleComponent } from './list/list.sample';
import { ListPerformanceSampleComponent } from './list-performance/list-performance.sample';
import { NavbarSampleComponent } from './navbar/navbar.sample';
import { NavdrawerSampleComponent } from './navdrawer/navdrawer.sample';
import { ProgressbarSampleComponent } from './progressbar/progressbar.sample';
import { RippleSampleComponent } from './ripple/ripple.sample';
import { SliderSampleComponent } from './slider/slider.sample';
import { SnackbarSampleComponent } from './snackbar/snackbar.sample';
import { ColorsSampleComponent } from './styleguide/colors/color.sample';
import { ShadowsSampleComponent } from './styleguide/shadows/shadows.sample';
import { TypographySampleComponent } from './styleguide/typography/typography.sample';
import { BottomNavSampleComponent, CustomContentComponent } from './bottomnav/bottomnav.sample';
import { TabsSampleComponent } from './tabs/tabs.sample';
import { TimePickerSampleComponent } from './time-picker/time-picker.sample';
import { ToastSampleComponent } from './toast/toast.sample';


const components = [
    AppComponent,
    AvatartSampleComponent,
    BadgeSampleComponent,
    ButtonSampleComponent,
    CalendarSampleComponent,
    CardSampleComponent,
    CarouselSampleComponent,
    DialogSampleComponent,
    DatePickerSampleComponent,
    IconSampleComponent,
    InputSampleComponent,
    InputGroupSampleComponent,
    LayoutSampleComponent,
    ListSampleComponent,
    ListPerformanceSampleComponent,
    MaskSampleComponent,
    NavbarSampleComponent,
    NavdrawerSampleComponent,
    PageHeaderComponent,
    ProgressbarSampleComponent,
    RippleSampleComponent,
    SliderSampleComponent,
    SnackbarSampleComponent,
    BottomNavSampleComponent,
    TabsSampleComponent,
    TimePickerSampleComponent,
    ToastSampleComponent,

    CustomContentComponent,
    ColorsSampleComponent,
    ShadowsSampleComponent,
    TypographySampleComponent
];

@NgModule({
    declarations: components,
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        IgxIconModule.forRoot(),
        SharedModule,
        routing
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
