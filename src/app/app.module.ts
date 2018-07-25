import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavMenuComponent } from 'src/app/nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { WeatherCardComponent } from './weather-card/weather-card.component';
import { ToastrModule } from 'ngx-toastr';
import { MomentModule } from 'ngx-moment';
import { SettingComponent } from './setting/setting.component';
import { CityFormatter } from 'src/app/setting/city-name-formatter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    WeatherCardComponent,
    SettingComponent,
    CityFormatter
  ],
  imports: [
    BrowserModule,
    NgbModule.forRoot(),
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ToastrModule.forRoot(),
    MomentModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
       { path: 'setting', component: SettingComponent },
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
