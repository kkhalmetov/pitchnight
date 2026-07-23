export type ExposureLevel = "low" | "elevated" | "high" | "extreme";

export interface ExposureInput {
  apparentTemperatureC: number;
  uvIndex: number;
  usAqi: number;
}

export interface ExposureComponent<Unit extends string> {
  inputValue: number;
  unit: Unit;
  normalizedScore: number;
  weight: number;
  contribution: number;
}

export interface ExposureComponents {
  heat: ExposureComponent<"°C">;
  uv: ExposureComponent<"UVI">;
  aqi: ExposureComponent<"US AQI">;
}

export interface ExposureResult {
  modelVersion: "1.0";
  score: number;
  level: ExposureLevel;
  components: ExposureComponents;
}
