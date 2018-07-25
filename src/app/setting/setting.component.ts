import { Component, OnInit } from '@angular/core';
import { NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';
import { WeatherService } from 'src/app/shared/services/weather.service';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap } from 'rxjs/operators';
import { WeatherSearchSettings } from '../shared/models/weather-settings';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css'],
  providers: [NgbTypeaheadConfig]
})
export class SettingComponent implements OnInit {

  city: WeatherSearchSettings.Location;
  unitOption: string;
  searching = false;
  searchFailed = false;

  constructor(private weatherService: WeatherService,
    private toastr: ToastrService,
    private router: Router) {
      this.unitOption = WeatherService.DFAULT_UNIT;
  }

  ngOnInit() {
  }

  cityFormatter = (result: any) => result.name;

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(query =>
        this.weatherService.getCity(query).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ),
      tap(() => this.searching = false)
    )

  saveSettings() {
    const settings = new WeatherSearchSettings.Settings(
      new WeatherSearchSettings.Location(this.city.name, this.city.coord), this.unitOption);
    this.weatherService.saveSettings(settings).subscribe((result) => {
      if (result) {
        this.toastr.success('Settings saved successfully');
        this.router.navigate(['']);
      } else {
        this.toastr.error('Failed to saved settings.');
      }
    }, (err) => {
      this.toastr.error('Failed to saved settings.');
      console.log(err);
    });
  }
}
