import { Component, OnInit } from '@angular/core';
import { NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';
import { WeatherService } from 'src/app/shared/services/weather.service';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap, filter } from 'rxjs/operators';
import { WeatherSearchSettings } from '../shared/models/weather-settings';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css'],
  providers: [NgbTypeaheadConfig]
})
export class SettingComponent implements OnInit {

  settingForm = this.fb.group({
    city: [null, Validators.required],
    unitOption: ['', Validators.required],
    refreshInterval: [0, Validators.required],
  });

  searching = false;
  searchFailed = false;

  constructor(private weatherService: WeatherService,
    private toastr: ToastrService,
    private router: Router,
    private fb: FormBuilder) {
  }

  ngOnInit() {
    this.settingForm.get('city').valueChanges
      .subscribe(v => {
        const value = v ? v : { name: '', coord: [] };
        this.settingForm.value.city = value;
      });
    this.weatherService.getSettings()
      .subscribe((currentSavedWeather) => {
        if (currentSavedWeather) {
          this.mapFormProps(currentSavedWeather);
        } else {
          this.mapFormProps(WeatherSearchSettings.DefaultSettings);
        }
      });
  }

  mapFormProps(currentSavedWeather: WeatherSearchSettings.Settings) {
    this.settingForm.patchValue({
      'city': currentSavedWeather.location,
      'unitOption': currentSavedWeather.unit,
      'refreshInterval': currentSavedWeather.refreshInterval
    });
  }

  cityFormatter = (result: any) => result.name;

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(query => (query || '').length > 2),
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
      new WeatherSearchSettings.Location(this.settingForm.value.city.name, this.settingForm.value.city.coord),
      this.settingForm.value.unitOption,
      this.settingForm.value.refreshInterval);
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
