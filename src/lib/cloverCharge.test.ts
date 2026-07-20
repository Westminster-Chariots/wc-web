import { describe, it, expect, beforeEach, vi } from "vitest";
import { chargeBooking } from "./cloverCharge";

// No test in this file reaches a real network - fetch is fully stubbed.
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

beforeEach(() => {
  fetchMock.mockReset();
  localStorage.clear();
});

describe("chargeBooking", () => {
  it("attaches the Bearer token from localStorage, mirroring the centralized axios client's own source", async () => {
    localStorage.setItem("access_token", "test-token-123");
    fetchMock.mockResolvedValueOnce(jsonResponse({ reservationNumber: "WC-1" }, 200));

    await chargeBooking("booking-1", "clv_tok", 1000, new AbortController().signal);

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-token-123");
  });

  it("prefers `details` over the generic `error` string on a 402 decline", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "Payment failed", details: "Insufficient funds", code: "card_declined" }, 402)
    );
    const result = await chargeBooking("booking-1", "clv_tok", 1000, new AbortController().signal);
    expect(result).toEqual({ kind: "decline", message: "Insufficient funds" });
  });

  it("falls back to a generic message when a 402 has neither details nor error", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 402));
    const result = await chargeBooking("booking-1", "clv_tok", 1000, new AbortController().signal);
    if (result.kind !== "decline") throw new Error(`expected a decline result, got ${result.kind}`);
    expect(result.message).toMatch(/check your card details/i);
  });

  it("returns a structured mismatch payload on a 409 totals_mismatch, never a blank total", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          code: "totals_mismatch",
          authoritativeAmount: 150,
          authoritativeAmountCents: 15000,
          legs: [{ legOrder: 1, pickupLocation: "A", dropoffLocation: "B", totalPrice: 150 }],
        },
        409
      )
    );
    const result = await chargeBooking("booking-1", "clv_tok", 1000, new AbortController().signal);
    expect(result.kind).toBe("mismatch");
    if (result.kind === "mismatch") {
      expect(result.authoritativeAmountCents).toBe(15000);
      expect(result.legs.length).toBeGreaterThan(0);
    }
  });

  it("treats a 409 without totals_mismatch code as ambiguous, not a decline", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "please wait", code: "stale_processing" }, 409));
    const result = await chargeBooking("booking-1", "clv_tok", 1000, new AbortController().signal);
    expect(result).toEqual({ kind: "ambiguous", status: 409, code: "stale_processing" });
  });

  it("treats a 500 as ambiguous - never signals safe-to-retry the way a decline does", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "internal error" }, 500));
    const result = await chargeBooking("booking-1", "clv_tok", 1000, new AbortController().signal);
    expect(result.kind).toBe("ambiguous");
    expect(result.kind).not.toBe("decline");
  });

  it("returns success with the reservation number on 200", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ reservationNumber: "WC-42" }, 200));
    const result = await chargeBooking("booking-1", "clv_tok", 1000, new AbortController().signal);
    expect(result).toEqual({ kind: "success", reservationNumber: "WC-42" });
  });
});
