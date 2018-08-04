import { Injectable } from '@angular/core';
import { Observable } from '../../../../node_modules/rxjs';
import { HttpClient } from '../../../../node_modules/@angular/common/http';
import { WeatherSearch } from '../models/weather-projected';
import { WeatherSearchResponse } from '../models/weather-search-result';
import { WeatherSearchSettings } from '../models/weather-settings';
import * as _ from 'underscore';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as moment from 'moment';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  static readonly SETTING_KEY = 'SETTINGS';
  constructor(private http: HttpClient, private localStorage: LocalStorage) { }

  getWeatherForcast(settings: WeatherSearchSettings.Settings): Observable<WeatherSearch.WeatherProjected> {
    const unit = settings.unit === 'C' ? 'metric' : 'imperial';
    const url = `${environment.openweathermapUrl}/forecast?lat=${settings.location.coord.lat}` +
      `&lon=${settings.location.coord.lon}&appid=${environment.appId}&units=${unit}`;
    return this.http.get(url)
      .pipe(map((data: WeatherSearchResponse.WeatherForcast) => {
        return this.mapWeatherResult(data);
      }), catchError(error => {
        console.error(error);
        return throwError('Something went wrong!');
      }));
  }

  getCity(query: string): Observable<WeatherSearchSettings.Location> {
    const url = `${environment.openweathermapUrl}/find?q=${query}&type=like&sort=population&cnt=30&appid=${environment.appId}`;
    return this.http.get(url)
      .pipe(map((data: any) => {
        if (data && data.cod && data.cod === '200') {
          return data.list.map((city: any) =>
            new WeatherSearchSettings.Location(city.name + ', ' + city.sys.country,
              new WeatherSearchSettings.Coord(+city.coord.lat, +city.coord.lon)));
        } else {
          return [];
        }
      }), catchError(error => {
        console.error(error);
        return throwError('Something went wrong!');
      }));
  }

  saveSettings(Settings: WeatherSearchSettings.Settings): Observable<boolean> {
    return this.localStorage.setItem(WeatherService.SETTING_KEY, Settings);
  }

  getSettings(): Observable<WeatherSearchSettings.Settings> {
    return this.localStorage.getItem(WeatherService.SETTING_KEY)
      .pipe(map(sett =>
        _.extend(WeatherSearchSettings.DefaultSettings, sett)
      ));
  }

  private mapWeatherResult(rawResponse: WeatherSearchResponse.WeatherForcast): WeatherSearch.WeatherProjected {
    const city = rawResponse.city.name;
    const country = rawResponse.city.country;
    const daysForcast = new Array<WeatherSearch.WeatherByDay>();
    const weatherGroupByDay = _.groupBy(rawResponse.list, (t) => {
      const dateTime = moment.utc(new Date(t.dt * 1000));
      const dateValue = moment({
        year: dateTime.year(),
        month: dateTime.month(),
        day: dateTime.date()
      });
      return dateValue.unix().toString();
    });

    for (const key in weatherGroupByDay) {
      if (weatherGroupByDay.hasOwnProperty(key)) {
        const value = weatherGroupByDay[key];
        const syatemDate = moment();
        const thisDate = moment.utc(+key * 1000);
        if (syatemDate.isAfter(thisDate, 'day')) {
          continue;
        }

        const weatherByTime = value.map(t => {
          const time = moment.utc(t.dt * 1000).format('LT');
          const temp = t.main.temp;
          const humidity = t.main.humidity;
          const main = t.weather[0].main;
          const description = t.weather[0].description;
          const icon = t.weather[0].icon;
          return new WeatherSearch.WeatherByTime(time, temp, humidity, main, description, icon, );
        });

        const avgTemp = weatherByTime.map(t => t.temp).reduce((a, b) => a > b ? a : b, 0);
        const date = thisDate.format('DD MMM');
        const weatherByDay = new WeatherSearch.WeatherByDay(date, avgTemp, weatherByTime);
        daysForcast.push(weatherByDay);
      }
    }

    return new WeatherSearch.WeatherProjected(city, country, daysForcast);
  }
}
