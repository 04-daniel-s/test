import { NextRequest, NextResponse } from "next/server";
import { fetchWeatherApi } from "openmeteo";
import axios from "axios";
import { formatWeatherData, params } from "@/util/WeatherUtil";

export async function GET(request: NextRequest) {
  const radius = request.nextUrl.searchParams.get("radius")!;
  const latitude = request.nextUrl.searchParams.get("latitude")!;
  const longitude = request.nextUrl.searchParams.get("longitude")!;
  const start = request.nextUrl.searchParams.get("start")!;
  const end = request.nextUrl.searchParams.get("end")!;

  const result = await getResult(latitude, longitude, radius, start, end);
  return NextResponse.json(result);
}

const getResult = async (latitude: string, longitude: string, radius: string, start: string, end: string) => {
  const weatherData = await getWeatherData(latitude, longitude, start, end);
  const locations = await getRecommendedLocations(latitude, longitude, radius, ["commercial"]);

  const result = weatherData.map((element) => {
    return { date: element.date, weather: element.weather, places: locations };
  });

  console.log(result);

  return result;
};

const getWeatherData = async (latitude: string, longitude: string, start_date: string, end_date: string) => {
  const responses = await fetchWeatherApi("https://api.open-meteo.com/v1/forecast", params(latitude, longitude, start_date, end_date));
  const response = responses[0];

  const utcOffsetSeconds = response.utcOffsetSeconds();

  const daily = response.daily()!;
  const hourly = response.hourly()!;

  const data = formatWeatherData(daily, hourly, utcOffsetSeconds);
  return data;
};

const getRecommendedLocations = async (latitude: string, longitude: string, radius: string, categories: string[]) => {
  const response = await axios.get(
    `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${longitude},${latitude},${radius}&bias=proximity:${longitude},${latitude}&limit=20&apiKey=${process.env.GEOAPIFY_API_KEY}`
  );

  const formattedPlaces = response.data.features.map((element: any) => ({
    latitude: element.properties.lat,
    longitude: element.properties.lon,
    name: element.properties.name,
    street: element.properties.street,
    house_number: element.properties.housenumber,
    postcode: element.properties.postcode,
    city: element.properties.city,
    categories,
  }));

  return formattedPlaces;
};
