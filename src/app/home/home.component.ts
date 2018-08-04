import { Component, OnInit, OnDestroy } from '@angular/core';
import { WeatherService } from 'src/app/shared/services/weather.service';
import { WeatherSearch } from 'src/app/shared/models/weather-projected';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { WeatherSearchSettings } from 'src/app/shared/models/weather-settings';
import { Observable, interval } from 'rxjs';
import { tap } from '../../../node_modules/rxjs/operators';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  settings: WeatherSearchSettings.Settings;
  weatherForcast: WeatherSearch.WeatherProjected;
  autoLloadWeatherSub: any;
  hasError: boolean;
  lastUpdatedDate:Date;
  refreshing: boolean;
  constructor(private toastr: ToastrService,
    private weatherService: WeatherService,
    private router: Router) {

  }

  ngOnInit() {
    this.weatherService.getSettings().subscribe(settings => {
      if (settings) {
        this.settings = settings;
        this.loadWeather();
        this.triggerAutoReload(this.settings.refreshInterval);
      } else {
        this.loadWeatherOnBrowserLocation();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.autoLloadWeatherSub) {
      this.autoLloadWeatherSub.unsubscribe();
    }
  }

  triggerAutoReload(intervalInmins: number) {
    const source = interval((intervalInmins || 1) * 60 * 1000);
    this.autoLloadWeatherSub = source.subscribe(() => {
      this.toastr.info('Updating weather...');
      this.loadWeather();
    });
  }

  loadWeatherOnBrowserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.settings = new WeatherSearchSettings.Settings(
          new WeatherSearchSettings.Location('', new WeatherSearchSettings.Coord(position.coords.latitude, position.coords.longitude)));
        this.weatherService.saveSettings(this.settings);
        this.loadWeather();
        this.triggerAutoReload(this.settings.refreshInterval);
      }, err => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        this.routeToSettings();
      }, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
    } else {
      this.routeToSettings();
    }

  }
  loadWeather() {
    this.refreshing = true;
    this.weatherService.getWeatherForcast(this.settings)
      .subscribe(res => {
        this.weatherForcast = res;
        this.lastUpdatedDate = new Date();
        this.refreshing = false;
      }, err => {
        this.refreshing = false;
        this.hasError = true;
        this.toastr.error('Failed to get weather forcast, please try after sometime.');
      });
  }

  private routeToSettings(): any {
    this.router.navigate(['setting']);
  }

}
