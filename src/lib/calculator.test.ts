import { describe, it, expect } from "vitest";
import { parsePrice } from "./calculator";

describe("parsePrice", () => {
  it("parses per-verification USD", () => {
    expect(parsePrice("$0.55 per verification")).toEqual({
      type: "per-check",
      usd: 0.55,
    });
  });

  it("parses per-check with slash format", () => {
    expect(parsePrice("$0.28 / verification")).toEqual({
      type: "per-check",
      usd: 0.28,
    });
  });

  it("parses per-check with monthly minimum", () => {
    expect(parsePrice("$0.80 per verification / $49 month min")).toEqual({
      type: "per-check",
      usd: 0.80,
      monthlyMin: 49,
    });
  });

  it("parses per-check with minimum variant", () => {
    expect(parsePrice("$1.39 per verification / $99 month min")).toEqual({
      type: "per-check",
      usd: 1.39,
      monthlyMin: 99,
    });
  });

  it("parses / per check format", () => {
    expect(parsePrice("$0.95 / per check")).toEqual({
      type: "per-check",
      usd: 0.95,
    });
  });

  it("treats $0 / per check as free", () => {
    expect(parsePrice("$0 / per check")).toEqual({ type: "free" });
  });

  it("parses flat monthly /month", () => {
    expect(parsePrice("$199/month")).toEqual({ type: "flat", usd: 199 });
  });

  it("parses flat monthly /mo", () => {
    expect(parsePrice("$99/mo")).toEqual({ type: "flat", usd: 99 });
  });

  it("treats ambiguous /mo without per-check keyword as flat", () => {
    expect(parsePrice("$0.45 / mo")).toEqual({ type: "flat", usd: 0.45 });
  });

  it("parses per-user monthly", () => {
    expect(parsePrice("$50/user/month")).toEqual({
      type: "flat",
      usd: 50,
      label: "/user/month",
    });
  });

  it("parses GBP per candidate", () => {
    const result = parsePrice("from £6 per candidate");
    expect(result.type).toBe("per-check");
    if (result.type === "per-check") {
      expect(result.usd).toBeCloseTo(7.62, 1);
      expect(result.approx).toBe(true);
    }
  });

  it("parses Free string", () => {
    expect(parsePrice("Free")).toEqual({ type: "free" });
  });

  it("parses $0 as free", () => {
    expect(parsePrice("$0")).toEqual({ type: "free" });
  });

  it("parses Contact sales as custom", () => {
    expect(parsePrice("Contact sales")).toEqual({
      type: "custom",
      label: "Contact Sales",
    });
  });

  it("parses Custom pricing as custom", () => {
    expect(parsePrice("Custom pricing")).toEqual({
      type: "custom",
      label: "Contact Sales",
    });
  });

  it("parses null string as custom", () => {
    expect(parsePrice("null")).toEqual({ type: "custom", label: "Contact Sales" });
  });

  it("parses N/A as custom", () => {
    expect(parsePrice("N/A")).toEqual({ type: "custom", label: "Contact Sales" });
  });
});
