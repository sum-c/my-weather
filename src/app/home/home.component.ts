import { Component, OnInit } from '@angular/core';
import { WeatherService } from 'src/app/shared/services/weather.service';
import { WeatherSearch } from 'src/app/shared/models/weather-projected';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { WeatherSearchSettings } from 'src/app/shared/models/weather-settings';
import { Observable } from '../../../node_modules/rxjs';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  settings: WeatherSearchSettings.Settings;
  weatherForcast: WeatherSearch.WeatherProjected;
  constructor(private toastr: ToastrService,
    private weatherService: WeatherService,
    private router: Router) {

  }

  ngOnInit() {
    this.weatherService.getSettings().subscribe(settings => {
      if (settings) {
        this.settings = settings;
        this.loadWeather();
      } else {
        this.loadWeatherOnBrowserLocation();
      }
    });
  }

  loadWeatherOnBrowserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.settings = new WeatherSearchSettings.Settings(
            new WeatherSearchSettings.Location('', new WeatherSearchSettings.Coord(position.coords.latitude, position.coords.longitude)),
          WeatherService.DFAULT_UNIT);
        this.weatherService.saveSettings(this.settings);
        this.loadWeather();
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
    this.weatherService.getWeatherForcast(this.settings)
      .subscribe(res => {
        this.weatherForcast = res;
      }, err => {
        this.toastr.error('Failed to get weather forcast, please try after sometime.');
      });
  }

  private routeToSettings(): any {
    this.router.navigate(['setting']);
  }

}
