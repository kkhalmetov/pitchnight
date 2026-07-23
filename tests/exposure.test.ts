import { describe, expect, it } from "vitest";

import {
  calculateExposure,
  EXPOSURE_WEIGHTS,
  HEAT_MAX_C,
  HEAT_MIN_C,
} from "@/lib/tynys/exposure";
import type {
  ExposureInput,
  ExposureLevel,
} from "@/lib/tynys/exposure/types";

function inputAtNormalizedScore(normalizedScore: number): ExposureInput {
  const ratio = normalizedScore / 100;

  return {
    apparentTemperatureC: HEAT_MIN_C + (HEAT_MAX_C - HEAT_MIN_C) * ratio,
    uvIndex: 11 * ratio,
    usAqi: 300 * ratio,
  };
}

describe("calculateExposure", () => {
  it("returns a deterministic weighted component breakdown", () => {
    const input = inputAtNormalizedScore(50);

    const first = calculateExposure(input);
    const second = calculateExposure(input);

    expect(second).toEqual(first);
    expect(first).toEqual({
      modelVersion: "1.0",
      score: 50,
      level: "high",
      components: {
        heat: {
          inputValue: input.apparentTemperatureC,
          unit: "°C",
          normalizedScore: 50,
          weight: EXPOSURE_WEIGHTS.heat,
          contribution: 22.5,
        },
        uv: {
          inputValue: 5.5,
          unit: "UVI",
          normalizedScore: 50,
          weight: EXPOSURE_WEIGHTS.uv,
          contribution: 15,
        },
        aqi: {
          inputValue: 150,
          unit: "US AQI",
          normalizedScore: 50,
          weight: EXPOSURE_WEIGHTS.aqi,
          contribution: 12.5,
        },
      },
    });
  });

  it("clamps every component and the total score to 0–100", () => {
    const minimum = calculateExposure({
      apparentTemperatureC: -40,
      uvIndex: 0,
      usAqi: 0,
    });
    const maximum = calculateExposure({
      apparentTemperatureC: 80,
      uvIndex: 25,
      usAqi: 800,
    });

    expect(minimum.score).toBe(0);
    expect(minimum.level).toBe("low");
    expect(
      Object.values(minimum.components).map(
        (component) => component.normalizedScore,
      ),
    ).toEqual([0, 0, 0]);
    expect(maximum.score).toBe(100);
    expect(maximum.level).toBe("extreme");
    expect(
      Object.values(maximum.components).map(
        (component) => component.normalizedScore,
      ),
    ).toEqual([100, 100, 100]);
  });

  it.each([
    [0, "low"],
    [24, "low"],
    [25, "elevated"],
    [49, "elevated"],
    [50, "high"],
    [74, "high"],
    [75, "extreme"],
    [100, "extreme"],
  ] satisfies [number, ExposureLevel][])(
    "maps score %i to the %s level",
    (normalizedScore, expectedLevel) => {
      expect(calculateExposure(inputAtNormalizedScore(normalizedScore))).toEqual(
        expect.objectContaining({
          score: normalizedScore,
          level: expectedLevel,
        }),
      );
    },
  );

  it.each([
    ["apparentTemperatureC", 30, 45],
    ["uvIndex", 3, 9],
    ["usAqi", 50, 180],
  ] satisfies [keyof ExposureInput, number, number][])(
    "does not decrease when %s worsens",
    (factor, baseline, worsened) => {
      const input: ExposureInput = {
        apparentTemperatureC: 30,
        uvIndex: 3,
        usAqi: 50,
      };
      const baselineResult = calculateExposure({
        ...input,
        [factor]: baseline,
      });
      const worsenedResult = calculateExposure({
        ...input,
        [factor]: worsened,
      });
      const component =
        factor === "apparentTemperatureC"
          ? "heat"
          : factor === "uvIndex"
            ? "uv"
            : "aqi";

      expect(worsenedResult.score).toBeGreaterThanOrEqual(
        baselineResult.score,
      );
      expect(
        worsenedResult.components[component].normalizedScore,
      ).toBeGreaterThanOrEqual(
        baselineResult.components[component].normalizedScore,
      );
    },
  );

  it.each([
    {
      apparentTemperatureC: Number.NaN,
      uvIndex: 1,
      usAqi: 1,
    },
    {
      apparentTemperatureC: 30,
      uvIndex: Number.POSITIVE_INFINITY,
      usAqi: 1,
    },
    {
      apparentTemperatureC: 30,
      uvIndex: -1,
      usAqi: 1,
    },
    {
      apparentTemperatureC: 30,
      uvIndex: 1,
      usAqi: -1,
    },
  ])("rejects invalid numeric input %#", (input) => {
    expect(() => calculateExposure(input)).toThrow(RangeError);
  });
});
