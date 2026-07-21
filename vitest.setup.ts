import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// RTL's auto-cleanup only self-registers when it detects Jest/Vitest globals
// on the global object; with `globals: false` in vitest.config.ts, it has to
// be wired up explicitly, otherwise each test's rendered tree leaks into the
// next test's `document.body` and `screen` queries.
afterEach(() => {
  cleanup();
});
