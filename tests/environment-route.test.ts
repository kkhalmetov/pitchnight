import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/environment/route";
import { loadEnvironment } from "@/lib/tynys/environment/client";
import { EnvironmentApiResponseSchema } from "@/lib/tynys/environment/schema";

const providerTimes = Array.from({ length: 48 }, (_, index) => {
  const time = new Date(Date.UTC(2026, 6, 24, index));
  return time.toISOString().slice(0, 16);
});

const weatherResponse = {
  timezone: "GMT",
  hourly: {
    time: providerTimes,
    temperature_2m: providerTimes.map((_, index) => 24 + index / 10),
    apparent_temperature: providerTimes.map((_, index) => 23 + index / 10),
    uv_index: providerTimes.map((_, index) => index % 12),
  },
};

const airQualityResponse = {
  timezone: "GMT",
  hourly: {
    time: providerTimes,
    pm2_5: providerTimes.map((_, index) => 5 + index / 10),
    us_aqi: providerTimes.map((_, index) => 30 + index),
  },
};

function jsonResponse(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GET /api/environment", () => {
  it("returns 48 normalized live hours from fixed cached provider URLs", async () => {
    const fetchMock = vi.fn(
      async (
        input: string | URL | Request,
        init?: RequestInit & { next: { revalidate: number } },
      ): Promise<Response> => {
        void init;
        const url = String(input);
        return url.includes("air-quality-api")
          ? jsonResponse(airQualityResponse)
          : jsonResponse(weatherResponse);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new Request(
        "http://localhost/api/environment?url=http://169.254.169.254/latest",
      ),
    );
    const body = EnvironmentApiResponseSchema.parse(await response.json());

    expect(response.status).toBe(200);
    expect(body.status).toBe("live");
    expect(body.source).toBe("open-meteo-live");
    expect(body.warning).toBeNull();
    expect(body.snapshotDate).toBeNull();
    expect(body.hours).toHaveLength(48);
    expect(body.hours[0]).toMatchObject({
      time: "2026-07-24T00:00:00Z",
      temperatureC: 24,
      apparentTemperatureC: 23,
      uvIndex: 0,
      pm25UgM3: 5,
      usAqi: 30,
      source: "open-meteo",
    });
    expect(
      EnvironmentApiResponseSchema.safeParse({
        ...body,
        source: "open-meteo-historical-snapshot",
      }).success,
    ).toBe(false);

    const requestedHosts = fetchMock.mock.calls.map(([input]) => {
      return new URL(String(input)).hostname;
    });
    expect(requestedHosts).toEqual([
      "api.open-meteo.com",
      "air-quality-api.open-meteo.com",
    ]);

    for (const [, init] of fetchMock.mock.calls) {
      expect(init).toMatchObject({
        next: { revalidate: 900 },
        redirect: "error",
      });
      expect(init?.signal).toBeInstanceOf(AbortSignal);
    }
  });

  it("returns a schema-labelled snapshot for malformed provider data", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        if (String(input).includes("air-quality-api")) {
          return jsonResponse(airQualityResponse);
        }

        return jsonResponse({
          ...weatherResponse,
          hourly: {
            time: providerTimes,
            temperature_2m: weatherResponse.hourly.temperature_2m,
          },
        });
      }),
    );

    const response = await GET(
      new Request("http://localhost/api/environment", {
        headers: { "x-request-id": "route-test-123" },
      }),
    );
    const body = EnvironmentApiResponseSchema.parse(await response.json());

    expect(response.status).toBe(200);
    expect(body.status).toBe("snapshot");
    expect(body.source).toBe("open-meteo-historical-snapshot");
    expect(body.snapshotDate).toBe("2026-07-20");
    expect(body.warning?.code).toBe("LIVE_INVALID");
    expect(body.hours).toHaveLength(48);

    const logEvent = JSON.parse(String(consoleWarn.mock.calls[0][0]));
    expect(logEvent).toMatchObject({
      event: "environment_fallback",
      requestId: "route-test-123",
      reason: "LIVE_INVALID",
    });
  });

  it("rejects a live timeline with a missing hourly interval", async () => {
    const gappedTimes = providerTimes.map((time, index) =>
      index === 12 ? "2026-07-24T12:30" : time,
    );
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        return String(input).includes("air-quality-api")
          ? jsonResponse({
              ...airQualityResponse,
              hourly: { ...airQualityResponse.hourly, time: gappedTimes },
            })
          : jsonResponse({
              ...weatherResponse,
              hourly: { ...weatherResponse.hourly, time: gappedTimes },
            });
      }),
    );

    const response = await GET(
      new Request("http://localhost/api/environment"),
    );
    const body = EnvironmentApiResponseSchema.parse(await response.json());

    expect(response.status).toBe(200);
    expect(body.status).toBe("snapshot");
    expect(body.warning?.code).toBe("LIVE_INVALID");
  });

  it("returns a generic snapshot warning without leaking network errors", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("PRIVATE provider diagnostic");
      }),
    );

    const response = await GET(
      new Request("http://localhost/api/environment"),
    );
    const responseText = await response.text();
    const body = EnvironmentApiResponseSchema.parse(JSON.parse(responseText));

    expect(response.status).toBe(200);
    expect(body.status).toBe("snapshot");
    expect(body.warning?.code).toBe("LIVE_UNAVAILABLE");
    expect(responseText).not.toContain("PRIVATE provider diagnostic");
    expect(String(consoleWarn.mock.calls[0][0])).not.toContain(
      "PRIVATE provider diagnostic",
    );
  });
});

describe("environment timeout", () => {
  it("aborts slow providers and returns the snapshot contract", async () => {
    vi.useFakeTimers();

    const pendingFetcher = vi.fn(
      async (
        _input: string | URL | Request,
        init?: RequestInit,
      ): Promise<Response> => {
        return await new Promise((_, reject) => {
          init?.signal?.addEventListener(
            "abort",
            () => reject(init.signal?.reason),
            { once: true },
          );
        });
      },
    );

    const responsePromise = loadEnvironment({
      fetcher: pendingFetcher,
      timeoutMs: 25,
      now: () => new Date("2026-07-24T00:00:00Z"),
    });
    await vi.advanceTimersByTimeAsync(25);
    const body = await responsePromise;

    expect(body.status).toBe("snapshot");
    expect(body.warning?.code).toBe("LIVE_TIMEOUT");
    expect(body.hours).toHaveLength(48);
  });
});
