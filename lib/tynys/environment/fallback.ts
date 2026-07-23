import snapshotJson from "@/data/environment-snapshot.json";
import { EnvironmentSnapshotSchema } from "@/lib/tynys/environment/schema";
import type {
  EnvironmentApiResponse,
  EnvironmentWarningCode,
} from "@/lib/tynys/environment/types";

const snapshot = EnvironmentSnapshotSchema.parse(snapshotJson);

const warningMessages: Record<EnvironmentWarningCode, string> = {
  LIVE_TIMEOUT:
    "Live environmental data timed out. Historical demo data is shown.",
  LIVE_UNAVAILABLE:
    "Live environmental data is unavailable. Historical demo data is shown.",
  LIVE_INVALID:
    "Live environmental data could not be verified. Historical demo data is shown.",
};

export function createSnapshotResponse(
  warningCode: EnvironmentWarningCode,
): EnvironmentApiResponse {
  return {
    status: "snapshot",
    source: "open-meteo-historical-snapshot",
    fetchedAt: snapshot.provenance.collectedAt,
    snapshotDate: snapshot.snapshotDate,
    warning: {
      code: warningCode,
      message: warningMessages[warningCode],
    },
    hours: snapshot.hours,
  };
}
