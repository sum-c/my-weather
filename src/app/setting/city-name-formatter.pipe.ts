import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cityFormatter' })
export class CityFormatter implements PipeTransform {
    transform(val) {
        return val ? val.name : null;
    }
}
