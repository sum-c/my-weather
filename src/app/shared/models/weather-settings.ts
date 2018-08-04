export module WeatherSearchSettings {

    export class Coord {
        constructor(public lat: number, public lon: number) {
        }
    }
    export class Location {
        constructor(public name: string, public coord: Coord) { }
    }
    export class Settings {
        constructor(public location: Location, public unit: string = 'C', public refreshInterval: number = 5) {

        }
    }
    export const DefaultSettings =  new Settings(new Location('Delhi, IN', new Coord(28.7041, 77.1025)));

}
