import { describe, it, expect, vi, beforeEach } from "vitest";

const getMock = vi.fn();
const postMock = vi.fn();

// The centralized `api` axios instance carries the auth interceptor (Bearer
// token attach, 401 refresh, CSRF header, etc.) - mocking it here (rather
// than mocking axios itself) proves paymentEmailService routes every call
// through that shared client instead of a standalone fetch/axios instance
// that would bypass those interceptors.
vi.mock("./api", () => ({
  api: { get: getMock, post: postMock },
}));

const { paymentEmailService } = await import("./services");

beforeEach(() => {
  getMock.mockReset();
  postMock.mockReset();
});

describe("paymentEmailService", () => {
  it("getStatus calls the admin-only GET endpoint via the shared authenticated client", async () => {
    getMock.mockResolvedValueOnce({
      data: { confirmation: { status: "sent", timestamp: "2026-01-01T00:00:00.000Z" }, invoice: { status: "not_sent", timestamp: null } },
    });
    const result = await paymentEmailService.getStatus("booking-1");
    expect(getMock).toHaveBeenCalledWith("/clover-payments/booking-1/email-status");
    expect(result.confirmation.status).toBe("sent");
  });

  it("resend calls the admin-only POST endpoint via the shared authenticated client", async () => {
    postMock.mockResolvedValueOnce({ data: { confirmationEmailSentAt: null, invoiceEmailSentAt: null } });
    await paymentEmailService.resend("booking-1");
    expect(postMock).toHaveBeenCalledWith("/clover-payments/booking-1/resend-emails");
  });
});
