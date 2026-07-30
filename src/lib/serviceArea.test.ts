import { describe, it, expect } from "vitest";
import { isInServiceArea } from "./serviceArea";

// Realistic Google Places formatted_address strings for each required case.
describe("isInServiceArea - DMV service area (VA, MD, DC), US only", () => {
  it("accepts a Virginia address", () => {
    expect(isInServiceArea("8 Coulter Lane, Stafford, VA 22554, USA")).toBe(true);
  });

  it("accepts a Maryland address", () => {
    expect(isInServiceArea("6501 Democracy Blvd, Bethesda, MD 20817, USA")).toBe(true);
  });

  it("accepts a Washington, D.C. address", () => {
    expect(isInServiceArea("1600 Pennsylvania Avenue NW, Washington, DC 20500, USA")).toBe(true);
  });

  it("accepts a route from Virginia to D.C. (both endpoints independently)", () => {
    const pickup = "8 Coulter Lane, Stafford, VA 22554, USA";
    const dropoff = "1600 Pennsylvania Avenue NW, Washington, DC 20500, USA";
    expect(isInServiceArea(pickup)).toBe(true);
    expect(isInServiceArea(dropoff)).toBe(true);
  });

  it("accepts a route from Maryland to Virginia (both endpoints independently)", () => {
    const pickup = "6501 Democracy Blvd, Bethesda, MD 20817, USA";
    const dropoff = "550 Courthouse Road, Stafford, VA 22554, USA";
    expect(isInServiceArea(pickup)).toBe(true);
    expect(isInServiceArea(dropoff)).toBe(true);
  });

  it("rejects an out-of-area US address (restriction still works)", () => {
    expect(isInServiceArea("350 5th Ave, New York, NY 10118, USA")).toBe(false);
    expect(isInServiceArea("123 Market St, Philadelphia, PA 19107, USA")).toBe(false);
  });

  it("is case-insensitive and matches common D.C. formatting variants", () => {
    expect(isInServiceArea("Union Station, Washington, D.C. 20002, USA")).toBe(true);
    expect(isInServiceArea("SOME PLACE, WASHINGTON, DC 20001, USA")).toBe(true);
  });

  it("matches full state-name spellings, not just abbreviations", () => {
    expect(isInServiceArea("Main St, Richmond, Virginia, USA")).toBe(true);
    expect(isInServiceArea("Main St, Annapolis, Maryland, USA")).toBe(true);
  });
});
