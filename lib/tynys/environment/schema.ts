import { z } from "zod";

import type {
  EnvironmentHour,
  EnvironmentSnapshot,
} from "@/lib/tynys/environment/types";

const providerTimeSchema = z.iso.datetime({
  local: true,
  precision: -1,
});

const weatherTimeSeriesSchema = z.array(providerTimeSchema).min(1).max(384);
const weatherValueSeriesSchema = z.array(z.number()).min(1).max(384);
const airTimeSeriesSchema = z.array(providerTimeSchema).min(1).max(168);
const airValueSeriesSchema = z
  .array(z.number().nonnegative())
  .min(1)
  .max(168);

function hasParallelHourlyArrays(
  hourly: Record<string, readonly unknown[]>,
): boolean {
  const lengths = Object.values(hourly).map((values) => values.length);
  return lengths.every((length) => length > 0 && length === lengths[0]);
}

export const WeatherProviderResponseSchema = z.object({
  timezone: z.string().min(1),
  hourly: z
    .object({
      time: weatherTimeSeriesSchema,
      temperature_2m: weatherValueSeriesSchema,
      apparent_temperature: weatherValueSeriesSchema,
      uv_index: z.array(z.number().nonnegative()).min(1).max(384),
    })
    .refine(hasParallelHourlyArrays, {
      message: "Weather hourly arrays must be non-empty and equal in length",
    }),
});

export const AirQualityProviderResponseSchema = z.object({
  timezone: z.string().min(1),
  hourly: z
    .object({
      time: airTimeSeriesSchema,
      pm2_5: airValueSeriesSchema,
      us_aqi: airValueSeriesSchema,
    })
    .refine(hasParallelHourlyArrays, {
      message: "Air-quality hourly arrays must be non-empty and equal in length",
    }),
});

const normalizedTimeSchema = z.iso.datetime({
  offset: true,
  precision: 0,
});

export const EnvironmentHourSchema = z.strictObject({
  time: normalizedTimeSchema,
  temperatureC: z.number(),
  apparentTemperatureC: z.number(),
  uvIndex: z.number().nonnegative(),
  pm25UgM3: z.number().nonnegative(),
  usAqi: z.number().nonnegative(),
  source: z.literal("open-meteo"),
  fetchedAt: normalizedTimeSchema,
}) satisfies z.ZodType<EnvironmentHour>;

export const EnvironmentSnapshotSchema = z
  .strictObject({
    mode: z.literal("historical-demo"),
    label: z.literal("Historical demo data"),
    snapshotDate: z.iso.date(),
    location: z.strictObject({
      name: z.string().min(1),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      timezone: z.string().min(1),
    }),
    provenance: z.strictObject({
      collectedAt: normalizedTimeSchema,
      weatherUrl: z.url({ protocol: /^https$/ }),
      airQualityUrl: z.url({ protocol: /^https$/ }),
    }),
    hours: z.array(EnvironmentHourSchema).min(48),
  })
  .superRefine((snapshot, context) => {
    for (let index = 1; index < snapshot.hours.length; index += 1) {
      const previous = Date.parse(snapshot.hours[index - 1].time);
      const current = Date.parse(snapshot.hours[index].time);

      if (current - previous !== 60 * 60 * 1000) {
        context.addIssue({
          code: "custom",
          message: "Snapshot hours must be consecutive",
          path: ["hours", index, "time"],
        });
      }
    }
  }) satisfies z.ZodType<EnvironmentSnapshot>;
