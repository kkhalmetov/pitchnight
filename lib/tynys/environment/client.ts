import { z } from "zod";

import { createSnapshotResponse } from "@/lib/tynys/environment/fallback";
import {
  AirQualityProviderResponseSchema,
  EnvironmentApiResponseSchema,
  WeatherProviderResponseSchema,
} from "@/lib/tynys/environment/schema";
import type {
  EnvironmentApiResponse,
  EnvironmentHour,
  EnvironmentWarningCode,
} from "@/lib/tynys/environment/types";

const FETCH_TIMEOUT_MS = 4_000;
const CACHE_REVALIDATE_SECONDS = 15 * 60;
const FORECAST_HOURS = 48;

const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
weatherUrl.search = new URLSearchParams({
  latitude: "42.3155",
  longitude: "69.5869",
  hourly: "temperature_2m,apparent_temperature,uv_index",
  timezone: "GMT",
  forecast_hours: String(FORECAST_HOURS),
}).toString();

const airQualityUrl = new URL(
  "https://air-quality-api.open-meteo.com/v1/air-quality",
);
airQualityUrl.search = new URLSearchParams({
  latitude: "42.3155",
  longitude: "69.5869",
  hourly: "pm2_5,us_aqi",
  timezone: "GMT",
  forecast_hours: String(FORECAST_HOURS),
}).toString();

interface EnvironmentFetchInit extends RequestInit {
  next: {
    revalidate: number;
  };
}

export type EnvironmentFetcher = (
  input: string | URL | Request,
  init?: EnvironmentFetchInit,
) => Promise<Response>;

interface LoadEnvironmentOptions {
  fetcher?: EnvironmentFetcher;
  timeoutMs?: number;
  now?: () => Date;
}

class ProviderResponseError extends Error {}

function getFetchOptions(signal: AbortSignal): EnvironmentFetchInit {
  return {
    headers: { accept: "application/json" },
    next: { revalidate: CACHE_REVALIDATE_SECONDS },
    redirect: "error",
    signal,
  };
}

async function parseProviderResponse<T>(
  response: Response,
  schema: z.ZodType<T>,
): Promise<T> {
  if (!response.ok) {
    throw new TypeError("Provider request failed");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ProviderResponseError("Provider returned invalid JSON");
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ProviderResponseError("Provider response failed validation");
  }

  return parsed.data;
}

function normalizeHours(
  weather: z.infer<typeof WeatherProviderResponseSchema>,
  airQuality: z.infer<typeof AirQualityProviderResponseSchema>,
  fetchedAt: string,
): EnvironmentHour[] {
  if (
    weather.timezone !== "GMT" ||
    airQuality.timezone !== "GMT" ||
    weather.hourly.time.length < FORECAST_HOURS ||
    airQuality.hourly.time.length < FORECAST_HOURS
  ) {
    throw new ProviderResponseError("Provider response cannot be aligned");
  }

  return weather.hourly.time.slice(0, FORECAST_HOURS).map((time, index) => {
    if (time !== airQuality.hourly.time[index]) {
      throw new ProviderResponseError("Provider timestamps do not match");
    }

    return {
      time: `${time}:00Z`,
      temperatureC: weather.hourly.temperature_2m[index],
      apparentTemperatureC: weather.hourly.apparent_temperature[index],
      uvIndex: weather.hourly.uv_index[index],
      pm25UgM3: airQuality.hourly.pm2_5[index],
      usAqi: airQuality.hourly.us_aqi[index],
      source: "open-meteo",
      fetchedAt,
    };
  });
}

function classifyFailure(
  error: unknown,
  timedOut: boolean,
): EnvironmentWarningCode {
  if (timedOut) {
    return "LIVE_TIMEOUT";
  }
  if (error instanceof ProviderResponseError || error instanceof z.ZodError) {
    return "LIVE_INVALID";
  }
  return "LIVE_UNAVAILABLE";
}

export async function loadEnvironment(
  options: LoadEnvironmentOptions = {},
): Promise<EnvironmentApiResponse> {
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? FETCH_TIMEOUT_MS;
  const now = options.now ?? (() => new Date());
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort(new DOMException("Provider timeout", "TimeoutError"));
  }, timeoutMs);

  try {
    const [weatherResponse, airQualityResponse] = await Promise.all([
      fetcher(weatherUrl, getFetchOptions(controller.signal)),
      fetcher(airQualityUrl, getFetchOptions(controller.signal)),
    ]);
    const [weather, airQuality] = await Promise.all([
      parseProviderResponse(weatherResponse, WeatherProviderResponseSchema),
      parseProviderResponse(
        airQualityResponse,
        AirQualityProviderResponseSchema,
      ),
    ]);
    const fetchedAt = now().toISOString().replace(/\.\d{3}Z$/, "Z");

    return EnvironmentApiResponseSchema.parse({
      status: "live",
      source: "open-meteo-live",
      fetchedAt,
      snapshotDate: null,
      warning: null,
      hours: normalizeHours(weather, airQuality, fetchedAt),
    });
  } catch (error) {
    controller.abort();
    return createSnapshotResponse(classifyFailure(error, timedOut));
  } finally {
    clearTimeout(timeout);
  }
}
