export type EnvironmentSource = "open-meteo";
export type EnvironmentWarningCode =
  | "LIVE_TIMEOUT"
  | "LIVE_UNAVAILABLE"
  | "LIVE_INVALID";

export interface EnvironmentHour {
  time: string;
  temperatureC: number;
  apparentTemperatureC: number;
  uvIndex: number;
  pm25UgM3: number;
  usAqi: number;
  source: EnvironmentSource;
  fetchedAt: string;
}

export interface EnvironmentSnapshot {
  mode: "historical-demo";
  label: "Historical demo data";
  snapshotDate: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  provenance: {
    collectedAt: string;
    weatherUrl: string;
    airQualityUrl: string;
  };
  hours: EnvironmentHour[];
}

export interface EnvironmentWarning {
  code: EnvironmentWarningCode;
  message: string;
}

interface EnvironmentApiResponseBase {
  fetchedAt: string;
  hours: EnvironmentHour[];
}

export interface LiveEnvironmentResponse extends EnvironmentApiResponseBase {
  status: "live";
  source: "open-meteo-live";
  snapshotDate: null;
  warning: null;
}

export interface SnapshotEnvironmentResponse
  extends EnvironmentApiResponseBase {
  status: "snapshot";
  source: "open-meteo-historical-snapshot";
  snapshotDate: string;
  warning: EnvironmentWarning;
}

export type EnvironmentApiResponse =
  | LiveEnvironmentResponse
  | SnapshotEnvironmentResponse;
