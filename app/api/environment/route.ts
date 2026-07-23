import { randomUUID } from "node:crypto";

import { loadEnvironment } from "@/lib/tynys/environment/client";
import { EnvironmentApiResponseSchema } from "@/lib/tynys/environment/schema";

const requestIdPattern = /^[A-Za-z0-9._-]{1,64}$/;

function getRequestId(request: Request): string {
  const candidate = request.headers.get("x-request-id");
  return candidate && requestIdPattern.test(candidate) ? candidate : randomUUID();
}

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  const startedAt = performance.now();
  const environment = await loadEnvironment();

  if (environment.status === "snapshot") {
    console.warn(
      JSON.stringify({
        event: "environment_fallback",
        requestId,
        reason: environment.warning?.code,
        durationMs: Math.round(performance.now() - startedAt),
      }),
    );
  }

  return Response.json(EnvironmentApiResponseSchema.parse(environment), {
    headers: {
      "cache-control": "no-store",
      "x-request-id": requestId,
    },
    status: 200,
  });
}
