import { NextRequest, NextResponse } from "next/server";
import { fetchWeatherApi } from "openmeteo";
import axios from "axios";
import { formatWeatherData, params } from "@/util/WeatherUtil";

export async function GET(request: NextRequest) {
  const categories = request.nextUrl.searchParams.get("categories");
  const radius = request.nextUrl.searchParams.get("r");
  const latitude = request.nextUrl.searchParams.get("lat")!;
  const longitude = request.nextUrl.searchParams.get("long")!;

  const response = await getWeatherData(latitude, longitude, "2024-07-14", "2024-07-18");
  return NextResponse.json(response);
}

const getWeatherData = async (latitude: string, longitude: string, start_date: string, end_date: string) => {
  const responses = await fetchWeatherApi("https://api.open-meteo.com/v1/forecast", params(latitude, longitude, start_date, end_date));

  const response = responses[0];

  const utcOffsetSeconds = response.utcOffsetSeconds();
  const timezone = response.timezone();
  const timezoneAbbreviation = response.timezoneAbbreviation();

  const current = response.current()!;
  const hourly = response.hourly()!;

  return formatWeatherData(current, hourly, utcOffsetSeconds);
};

const getRecommendedLocations = async (latitude: number, longitude: number, radius: number, categories: string) => {
  /*
  const categories = request.nextUrl.searchParams.get("categories");
  const radius = request.nextUrl.searchParams.get("r");
  const latitude = request.nextUrl.searchParams.get("lat");
  const longitude = request.nextUrl.searchParams.get("long");
  */

  const response = await axios.get(
    `https://api.geoapify.com/v2/places?categories="${categories}&filter=circle:${longitude},${latitude},${radius}&bias=proximity:${longitude},${latitude}&limit=20&apiKey=${process.env.GEOAPIFY_API_KEY}`
  );

  return response.data;
};
