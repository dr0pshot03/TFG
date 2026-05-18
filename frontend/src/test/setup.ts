import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  (globalThis as typeof globalThis & { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
    ResizeObserverMock as unknown as typeof ResizeObserver;
}

if (typeof window !== "undefined" && !window.scrollTo) {
  window.scrollTo = vi.fn();
}

if (typeof HTMLElement !== "undefined" && !HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = vi.fn();
}

if (typeof HTMLElement !== "undefined") {
  const focusMock = vi.fn();

  for (const prototype of [Element.prototype, HTMLElement.prototype, HTMLInputElement.prototype, HTMLButtonElement.prototype]) {
    try {
      Object.defineProperty(prototype, "focus", {
        configurable: true,
        writable: true,
        value: focusMock,
      });
    } catch {
      // Ignore environments where the descriptor cannot be overridden.
    }
  }
}