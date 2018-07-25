export module WeatherSearchSettings {
    export class Coord {
        constructor(public lat: number, public lon: number) {
        }
    }
    export class Location {
        constructor(public name: string, public coord: Coord) { }
    }
    export class Settings {
        constructor(public location: Location, public unit: string) {

        }
    }
}