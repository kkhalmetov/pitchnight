export type EnvironmentSource = "open-meteo";

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
