export interface WeatherResult {
  min_temperature: number;
  max_temperature: number;
  rain_sum: number;
  hourly: Hourly[];
}

export interface Hourly {
  hour: number;
  temperature: number;
  rain: number;
  wind_speed: number;
}
