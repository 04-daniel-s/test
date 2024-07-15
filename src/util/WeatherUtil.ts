import { Hourly, WeatherResult } from "./response/WeatherResult";

export const params = (latitude: string, longitude: string, start_date: string, end_date: string) => {
  return {
    latitude: latitude,
    longitude: longitude,
    hourly: ["temperature_2m", "rain", "wind_speed_10m"],
    daily: ["temperature_2m_max", "temperature_2m_min", "rain_sum"],
    start_date: start_date,
    end_date: end_date,
  };
};

const range = (start: number, stop: number, step: number) => Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

const formatHourly = (hourly: any, utcOffsetSeconds: number): Hourly[] => {
  const formatted = {
    time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
    temperature2m: hourly.variables(0)!.valuesArray()!,
    rain: hourly.variables(1)!.valuesArray()!,
    windSpeed10m: hourly.variables(2)!.valuesArray()!,
  };

  return formatted.time.map((time, index) => ({
    hour: time.getHours(),
    temperature: hourly.variables(0)!.valuesArray()![index],
    rain: hourly.variables(1)!.valuesArray()![index],
    wind_speed: hourly.variables(2)!.valuesArray()![index],
  }));
};

export const formatWeatherData = (daily: any, hourly: any, utcOffsetSeconds: number): { date: string; weather: WeatherResult }[] => {
  let counter = 24;
  let result: { date: string; weather: WeatherResult }[] = [];

  const days = range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map((t) => new Date((t + utcOffsetSeconds) * 1000));

  for (let i = 0; i < days.length; i++) {
    const date = days[i].toISOString();
    const max_temperature = daily.variables(0)!.valuesArray()![i];
    const min_temperature = daily.variables(1)!.valuesArray()![i];
    const rain_sum = daily.variables(2)!.valuesArray()![i];

    const formattedHourly = formatHourly(hourly, utcOffsetSeconds);
    const hourlyArray: Hourly[] = formattedHourly.slice(counter - 24, counter);
    counter += 24;

    result.push({
      date: date,
      weather: { min_temperature, max_temperature, rain_sum, hourly: hourlyArray },
    });
  }
  return result;
};
