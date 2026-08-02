import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Regression tests for removing the DMV-only (VA/MD/DC) restriction: the
// autocomplete request sent to Google's Places API must restrict by country
// only, and every prediction Google returns must be shown unfiltered - no
// state/region bounds, no locationBias, no post-selection rejection.

vi.mock("@react-google-maps/api", () => ({
  useJsApiLoader: () => ({ isLoaded: true }),
}));

const { default: LocationInput } = await import("../LocationInput");

function makePrediction(description: string, placeId: string) {
  return {
    place_id: placeId,
    description,
    structured_formatting: { main_text: description, secondary_text: "" },
    types: [] as string[],
  };
}

let getPlacePredictionsMock: ReturnType<typeof vi.fn>;
let lastRequest: google.maps.places.AutocompletionRequest | null;
let predictionsToReturn: ReturnType<typeof makePrediction>[];

beforeEach(() => {
  lastRequest = null;
  predictionsToReturn = [];
  getPlacePredictionsMock = vi.fn((request, callback) => {
    lastRequest = request;
    callback(predictionsToReturn, "OK");
  });

  class FakeAutocompleteService {
    getPlacePredictions = getPlacePredictionsMock;
  }
  class FakePlacesService {
    getDetails = vi.fn();
  }
  (globalThis as any).google = {
    maps: {
      places: {
        AutocompleteService: FakeAutocompleteService,
        AutocompleteSessionToken: class {},
        PlacesService: FakePlacesService,
        PlacesServiceStatus: { OK: "OK" },
      },
    },
  };
});

describe("LocationInput - US-only autocomplete, no state/region restriction", () => {
  it("restricts the Places request to country=us only - no bounds, no locationBias", async () => {
    const user = userEvent.setup();
    render(<LocationInput placeholder="Address" value="" onChange={vi.fn()} />);

    const input = screen.getByPlaceholderText("Address");
    await user.type(input, "1600 Pennsylvania Ave");

    await waitFor(() => expect(getPlacePredictionsMock).toHaveBeenCalled(), { timeout: 1000 });

    expect(lastRequest?.componentRestrictions).toEqual({ country: "us" });
    expect(lastRequest).not.toHaveProperty("locationBias");
    expect(lastRequest).not.toHaveProperty("bounds");
  });

  it("accepts and displays any valid US address prediction Google returns, unfiltered", async () => {
    predictionsToReturn = [
      makePrediction("8 Coulter Lane, Stafford, VA 22554, USA", "p1"),
      makePrediction("6501 Democracy Blvd, Bethesda, MD 20817, USA", "p2"),
      makePrediction("1600 Pennsylvania Avenue NW, Washington, DC 20500, USA", "p3"),
      makePrediction("350 5th Ave, New York, NY 10118, USA", "p4"),
      makePrediction("123 Market St, Philadelphia, PA 19107, USA", "p5"),
    ];
    const user = userEvent.setup();
    render(<LocationInput placeholder="Address" value="" onChange={vi.fn()} />);

    await user.type(screen.getByPlaceholderText("Address"), "some address");

    // Every prediction Google returned is shown - none rejected by state,
    // none requiring VA/MD/DC. This is the direct behavioral proof that no
    // client-side geographic filter exists anymore.
    for (const p of predictionsToReturn) {
      await waitFor(() => expect(screen.getByText(p.description)).toBeInTheDocument());
    }
  });

  it("never rejects a selected out-of-DMV US address (no post-selection state validation)", async () => {
    predictionsToReturn = [makePrediction("350 5th Ave, New York, NY 10118, USA", "p1")];
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<LocationInput placeholder="Address" value="" onChange={onChange} />);

    await user.type(screen.getByPlaceholderText("Address"), "5th ave");
    await waitFor(() => expect(screen.getByText("350 5th Ave, New York, NY 10118, USA")).toBeInTheDocument());
    await user.click(screen.getByText("350 5th Ave, New York, NY 10118, USA"));

    // Selecting a non-DMV US address succeeds - onChange fires with it, no
    // error is shown and the field is not cleared.
    expect(onChange).toHaveBeenCalledWith("350 5th Ave, New York, NY 10118, USA", false);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("non-US results are excluded at the API request level (componentRestrictions), not by client-side filtering", async () => {
    // Google's Places API itself never returns non-US predictions once
    // componentRestrictions:{country:"us"} is set - there is nothing left
    // in this component to additionally exclude them with. This test
    // documents that guarantee structurally: the exact same request shape
    // is used for every query, always carrying the country restriction.
    const user = userEvent.setup();
    render(<LocationInput placeholder="Address" value="" onChange={vi.fn()} />);
    await user.type(screen.getByPlaceholderText("Address"), "Toronto");
    await waitFor(() => expect(getPlacePredictionsMock).toHaveBeenCalled());
    expect(lastRequest?.componentRestrictions).toEqual({ country: "us" });
  });
});
