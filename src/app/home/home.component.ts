import { Component, OnInit } from '@angular/core';
import { WeatherService } from 'src/app/shared/services/weather.service';
import { WeatherSearch } from 'src/app/shared/models/weather-projected';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  location: Coordinates;
  weatherForcast: WeatherSearch.WeatherProjected;
  constructor(private toastr: ToastrService,
    private weatherService: WeatherService) {

  }

  ngOnInit() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.location = position.coords;
        console.log(position.coords);
        this.loadWeather();
      }, err => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
      }, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
    }
  }

  loadWeather(): any {
    this.weatherService.getWeatherForcast(this.location.latitude, this.location.longitude)
      .subscribe(res => {
        this.weatherForcast = res;
      }, err => {
        this.toastr.error('Failed to get weather forcast, please try after sometime.');
      });
  }

}
