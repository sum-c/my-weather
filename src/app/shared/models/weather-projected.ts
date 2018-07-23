export module WeatherSearch {
    export class WeatherProjected {
        constructor(
           public city: string,
           public country: string,
           public daysForcast: Array<WeatherByDay>) {

        }
    }

    export class WeatherByDay {
        constructor(
            public  date: string,
            public avgTemp: number,
            public weatherByTime: Array<WeatherByTime>) {
        }
    }

    export class WeatherByTime {
        constructor(
            public time: string,
            public temp: number,
            public humidity: number,
            public main: string,
            public description: string,
            public icon: string) {
        }
    }
}
