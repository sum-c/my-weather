import { Injectable } from '@angular/core';
import { Observable } from '../../../../node_modules/rxjs';
import { HttpClient } from '../../../../node_modules/@angular/common/http';
import { WeatherSearch } from '../models/weather-projected';
import { WeatherSearchResponse } from '../models/weather-search-result';
import * as _ from 'underscore';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  weatherBaseUrl = 'https://api.openweathermap.org/data/2.5/';
  appId = '1aec44cd4800d0a527ea9567e05768bf';
  constructor(private http: HttpClient) { }

  getWeatherForcast(lat: number, long: number): Observable<WeatherSearch.WeatherProjected> {
    const url = `${this.weatherBaseUrl}/forecast?lat=${lat}&lon=${long}&appid=${this.appId}&&units=metric`;
    return this.http.get(url)
      .pipe(map((data: WeatherSearchResponse.WeatherForcast) => {
        return this.mapWeatherResult(data);
      }), catchError(error => {
        console.error(error);
        return throwError('Something went wrong!');
      }));
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

        const avgTemp = weatherByTime.map(t => t.temp).reduce((a, b) => a + b, 0) / value.length;
        const date = thisDate.format('DD MMM');
        const weatherByDay = new WeatherSearch.WeatherByDay(date, avgTemp, weatherByTime);
        daysForcast.push(weatherByDay);
      }
    }

    return new WeatherSearch.WeatherProjected(city, country, daysForcast);

  }

}
