import { describe, it, expect } from "vitest";
import { buildDurationOptionsMinutes, findDurationOption, snapToNearestDuration, formatDurationMinutes } from "../hourlyDuration";
import type { HourlyPricingSummaryOption } from "@/types";

function option(durationMinutes: number, overrides: Partial<HourlyPricingSummaryOption> = {}): HourlyPricingSummaryOption {
  return {
    durationMinutes,
    includedMiles: 50,
    priceCents: 13000,
    priceSource: "rate",
    ...overrides,
  };
}

describe("buildDurationOptionsMinutes", () => {
  it("extracts and sorts durations ascending", () => {
    const options = [option(240), option(120), option(180)];
    expect(buildDurationOptionsMinutes(options)).toEqual([120, 180, 240]);
  });

  it("returns an empty list for no options", () => {
    expect(buildDurationOptionsMinutes([])).toEqual([]);
  });
});

describe("findDurationOption", () => {
  it("finds the option matching an exact duration", () => {
    const options = [option(120), option(180, { includedMiles: 75 })];
    expect(findDurationOption(options, 180)?.includedMiles).toBe(75);
  });

  it("returns undefined when no option matches", () => {
    const options = [option(120)];
    expect(findDurationOption(options, 180)).toBeUndefined();
  });
});

describe("snapToNearestDuration", () => {
  it("snaps to the closest offered duration", () => {
    const options = [option(120), option(180), option(300)];
    expect(snapToNearestDuration(200, options)).toBe(180);
  });

  it("resolves ties to the smaller option", () => {
    const options = [option(120), option(180)];
    expect(snapToNearestDuration(150, options)).toBe(120);
  });

  it("returns the only option when just one is offered", () => {
    const options = [option(240)];
    expect(snapToNearestDuration(60, options)).toBe(240);
  });
});

describe("formatDurationMinutes", () => {
  it("formats whole hours without a minutes part", () => {
    expect(formatDurationMinutes(120)).toBe("2h");
  });

  it("formats sub-hour durations as minutes only", () => {
    expect(formatDurationMinutes(45)).toBe("45m");
  });

  it("formats mixed hours and minutes", () => {
    expect(formatDurationMinutes(150)).toBe("2h 30m");
  });
});
