import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CloverPayment from "../CloverPayment";

// Mirrors the minimal surface CloverPayment.tsx's own CloverInstance
// interface actually calls (elements().create().mount/addEventListener,
// createToken) - not exported from that file, so restated here just enough
// to type the fakes below without `any`.
interface FakeCloverInstance {
  elements: () => { create: () => { mount: () => void; addEventListener: () => void } };
  createToken: () => Promise<{ token?: string; errors?: Record<string, string> }>;
}
type CloverConstructor = NonNullable<Window["Clover"]>;

// A minimal fake of the Clover hosted-iframe SDK. loadScriptOnce() resolves
// immediately once window.Clover exists, so pre-setting this avoids any real
// script injection or network access - the SDK never actually loads in this
// test, only this stand-in.
function installFakeClover() {
  const createToken = vi.fn().mockResolvedValue({ token: "clv_test_token" });
  // A plain function (not an arrow function, and not vi.fn()'s default mock
  // implementation) so `new window.Clover(...)` in the component under test
  // works - arrow functions and some mock wrappers cannot be used as
  // constructors.
  function FakeClover(this: FakeCloverInstance) {
    this.elements = () => ({
      create: () => ({ mount: vi.fn(), addEventListener: vi.fn() }),
    });
    this.createToken = createToken;
  }
  window.Clover = FakeClover as unknown as CloverConstructor;
  return { createToken };
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CLOVER_API_ACCESS_KEY", "test-access-key");
  vi.stubEnv("NEXT_PUBLIC_CLOVER_MERCHANT_ID", "test-merchant-id");
});

afterEach(() => {
  delete window.Clover;
  vi.unstubAllEnvs();
});

describe("CloverPayment - double-click / busy guard", () => {
  it("disables the Pay button while isProcessing is true, so a second click cannot fire another charge", async () => {
    installFakeClover();
    render(<CloverPayment amount={120} onSuccess={vi.fn()} onError={vi.fn()} isProcessing={true} />);

    const payButton = await screen.findByRole("button", { name: /processing payment/i });
    expect(payButton).toBeDisabled();
  });

  it("enables the Pay button once ready and not processing, and clicking tokenizes exactly once per click", async () => {
    const { createToken } = installFakeClover();
    const onSuccess = vi.fn();
    render(<CloverPayment amount={120} onSuccess={onSuccess} onError={vi.fn()} isProcessing={false} />);

    const payButton = await screen.findByRole("button", { name: /pay & reserve ride/i });
    expect(payButton).not.toBeDisabled();

    const user = userEvent.setup();
    await user.click(payButton);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith("clv_test_token"));
    expect(createToken).toHaveBeenCalledTimes(1);
  });

  it("re-disables itself the instant tokenization starts, even though the parent's isProcessing hasn't flipped yet", async () => {
    // isTokenizing (component-local) is what closes the gap between "user
    // clicked" and "parent state catches up" - this is the actual
    // double-click guard, not just the parent's isProcessing prop. Uses a
    // deferred (not-yet-resolved) createToken so the transient disabled
    // window can actually be observed instead of resolving before the first
    // assertion runs.
    let resolveToken!: (v: { token: string }) => void;
    const tokenPromise = new Promise<{ token: string }>((resolve) => {
      resolveToken = resolve;
    });
    function DeferredFakeClover(this: FakeCloverInstance) {
      this.elements = () => ({ create: () => ({ mount: vi.fn(), addEventListener: vi.fn() }) });
      this.createToken = () => tokenPromise;
    }
    window.Clover = DeferredFakeClover as unknown as CloverConstructor;

    render(<CloverPayment amount={120} onSuccess={vi.fn()} onError={vi.fn()} isProcessing={false} />);

    const payButton = await screen.findByRole("button", { name: /pay & reserve ride/i });
    const user = userEvent.setup();
    await user.click(payButton);

    await waitFor(() => expect(screen.getByRole("button")).toBeDisabled());

    resolveToken({ token: "clv_deferred" });
  });
});
