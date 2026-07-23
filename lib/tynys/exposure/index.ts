import type {
  ExposureComponent,
  ExposureInput,
  ExposureLevel,
  ExposureResult,
} from "@/lib/tynys/exposure/types";

export type {
  ExposureComponent,
  ExposureComponents,
  ExposureInput,
  ExposureLevel,
  ExposureResult,
} from "@/lib/tynys/exposure/types";

export const EXPOSURE_MODEL_VERSION = "1.0" as const;

export const EXPOSURE_WEIGHTS = {
  heat: 0.45,
  uv: 0.3,
  aqi: 0.25,
} as const;

// NWS apparent-temperature reference range: 80–130 °F.
export const HEAT_MIN_C = (80 - 32) * (5 / 9);
export const HEAT_MAX_C = (130 - 32) * (5 / 9);

const UV_MAX = 11;
const AQI_MAX = 300;

function roundToHundredth(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizeLinear(value: number, minimum: number, maximum: number) {
  const ratio = (value - minimum) / (maximum - minimum);
  return roundToHundredth(Math.min(1, Math.max(0, ratio)) * 100);
}

function assertValidInput(input: ExposureInput): void {
  const values = [
    input.apparentTemperatureC,
    input.uvIndex,
    input.usAqi,
  ];

  if (
    values.some((value) => !Number.isFinite(value)) ||
    input.uvIndex < 0 ||
    input.usAqi < 0
  ) {
    throw new RangeError(
      "Exposure inputs must be finite; UV Index and US AQI cannot be negative",
    );
  }
}

function createComponent<Unit extends string>(
  inputValue: number,
  unit: Unit,
  normalizedScore: number,
  weight: number,
): ExposureComponent<Unit> {
  return {
    inputValue,
    unit,
    normalizedScore,
    weight,
    contribution: roundToHundredth(normalizedScore * weight),
  };
}

function exposureLevel(score: number): ExposureLevel {
  if (score < 25) {
    return "low";
  }
  if (score < 50) {
    return "elevated";
  }
  if (score < 75) {
    return "high";
  }
  return "extreme";
}

/**
 * Calculates the deterministic TYNYS decision-support index.
 *
 * This is a transparent planning model, not a medical assessment. Each input is
 * normalized to 0–100, multiplied by its published weight, and then summed.
 */
export function calculateExposure(input: ExposureInput): ExposureResult {
  assertValidInput(input);

  const components = {
    heat: createComponent(
      input.apparentTemperatureC,
      "°C",
      normalizeLinear(input.apparentTemperatureC, HEAT_MIN_C, HEAT_MAX_C),
      EXPOSURE_WEIGHTS.heat,
    ),
    uv: createComponent(
      input.uvIndex,
      "UVI",
      normalizeLinear(input.uvIndex, 0, UV_MAX),
      EXPOSURE_WEIGHTS.uv,
    ),
    aqi: createComponent(
      input.usAqi,
      "US AQI",
      normalizeLinear(input.usAqi, 0, AQI_MAX),
      EXPOSURE_WEIGHTS.aqi,
    ),
  };
  const score = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        components.heat.contribution +
          components.uv.contribution +
          components.aqi.contribution,
      ),
    ),
  );

  return {
    modelVersion: EXPOSURE_MODEL_VERSION,
    score,
    level: exposureLevel(score),
    components,
  };
}
