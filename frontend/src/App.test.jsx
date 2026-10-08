import { describe, expect, it } from "vitest";
import { App } from "./App.jsx";

describe("App", () => {
  it("exports the application root component", () => {
    expect(App).toBeTypeOf("function");
  });
});
