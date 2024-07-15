import { PlaceResult } from "./PlaceResult";
import { WeatherResult } from "./WeatherResult";

export interface Result {
  date: string;
  weather: WeatherResult;
  places: PlaceResult[];
}
