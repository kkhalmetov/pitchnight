import { describe, expect, it } from "vitest";

import snapshot from "@/data/environment-snapshot.json";
import {
  AirQualityProviderResponseSchema,
  EnvironmentHourSchema,
  EnvironmentSnapshotSchema,
  WeatherProviderResponseSchema,
} from "@/lib/tynys/environment/schema";

const providerTimes = [
  "2026-07-20T00:00",
  "2026-07-20T01:00",
  "2026-07-20T02:00",
];

const validWeatherResponse = {
  timezone: "Asia/Almaty",
  hourly: {
    time: providerTimes,
    temperature_2m: [33.6, 34.7, 34.4],
    apparent_temperature: [30.9, 31.3, 31.1],
    uv_index: [0, 0, 0],
  },
};

const validAirQualityResponse = {
  timezone: "Asia/Almaty",
  hourly: {
    time: providerTimes,
    pm2_5: [4.4, 3.2, 3.2],
    us_aqi: [47, 44, 41],
  },
};

describe("Open-Meteo provider response schemas", () => {
  it("accepts complete weather and air-quality fixtures", () => {
    expect(WeatherProviderResponseSchema.safeParse(validWeatherResponse).success)
      .toBe(true);
    expect(
      AirQualityProviderResponseSchema.safeParse(validAirQualityResponse)
        .success,
    ).toBe(true);
  });

  it("rejects partial provider payloads", () => {
    const partialHourly = {
      time: validWeatherResponse.hourly.time,
      temperature_2m: validWeatherResponse.hourly.temperature_2m,
      apparent_temperature:
        validWeatherResponse.hourly.apparent_temperature,
    };

    expect(
      WeatherProviderResponseSchema.safeParse({
        ...validWeatherResponse,
        hourly: partialHourly,
      }).success,
    ).toBe(false);
  });

  it("rejects malformed values and unequal hourly arrays", () => {
    expect(
      AirQualityProviderResponseSchema.safeParse({
        ...validAirQualityResponse,
        hourly: {
          ...validAirQualityResponse.hourly,
          pm2_5: [4.4, null, 3.2],
        },
      }).success,
    ).toBe(false);

    expect(
      WeatherProviderResponseSchema.safeParse({
        ...validWeatherResponse,
        hourly: {
          ...validWeatherResponse.hourly,
          uv_index: [0, 0],
        },
      }).success,
    ).toBe(false);
  });

  it("rejects provider series larger than the documented forecast windows", () => {
    const oversizedSeries = Array.from({ length: 385 }, () => 0);

    expect(
      WeatherProviderResponseSchema.safeParse({
        ...validWeatherResponse,
        hourly: {
          time: Array.from({ length: 385 }, () => providerTimes[0]),
          temperature_2m: oversizedSeries,
          apparent_temperature: oversizedSeries,
          uv_index: oversizedSeries,
        },
      }).success,
    ).toBe(false);
  });
});

describe("normalized environment contract", () => {
  it("accepts a complete provider-independent hour", () => {
    expect(
      EnvironmentHourSchema.safeParse({
        time: "2026-07-20T00:00:00+05:00",
        temperatureC: 33.6,
        apparentTemperatureC: 30.9,
        uvIndex: 0,
        pm25UgM3: 4.4,
        usAqi: 47,
        source: "open-meteo",
        fetchedAt: "2026-07-24T02:20:00+05:00",
      }).success,
    ).toBe(true);
  });

  it("rejects hours missing a required measurement", () => {
    const incompleteHour = {
      time: "2026-07-20T00:00:00+05:00",
      temperatureC: 33.6,
      apparentTemperatureC: 30.9,
      uvIndex: 0,
      pm25UgM3: 4.4,
      source: "open-meteo",
      fetchedAt: "2026-07-24T02:20:00+05:00",
    };

    expect(EnvironmentHourSchema.safeParse(incompleteHour).success).toBe(false);
  });

  it("rejects impossible negative environmental indices", () => {
    expect(
      EnvironmentHourSchema.safeParse({
        time: "2026-07-20T00:00:00+05:00",
        temperatureC: 33.6,
        apparentTemperatureC: 30.9,
        uvIndex: -1,
        pm25UgM3: 4.4,
        usAqi: 47,
        source: "open-meteo",
        fetchedAt: "2026-07-24T02:20:00+05:00",
      }).success,
    ).toBe(false);
  });
});

describe("dated environment snapshot", () => {
  it("contains explicit provenance and 48 consecutive historical demo hours", () => {
    const parsed = EnvironmentSnapshotSchema.parse(snapshot);

    expect(parsed.mode).toBe("historical-demo");
    expect(parsed.snapshotDate).toBe("2026-07-20");
    expect(parsed.provenance.weatherUrl).toContain("api.open-meteo.com");
    expect(parsed.provenance.airQualityUrl).toContain(
      "air-quality-api.open-meteo.com",
    );
    expect(parsed.hours).toHaveLength(48);

    for (let index = 1; index < parsed.hours.length; index += 1) {
      const previous = Date.parse(parsed.hours[index - 1].time);
      const current = Date.parse(parsed.hours[index].time);
      expect(current - previous).toBe(60 * 60 * 1000);
    }
  });

  it("rejects a 48-hour snapshot with a gap in its timeline", () => {
    const snapshotWithGap = structuredClone(snapshot);
    snapshotWithGap.hours[12].time = "2026-07-20T12:30:00+05:00";

    expect(EnvironmentSnapshotSchema.safeParse(snapshotWithGap).success).toBe(
      false,
    );
  });
});
