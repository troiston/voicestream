import { describe, expect, it, vi } from "vitest";

vi.mock("../env", () => ({
  env: {
    STRIPE_PRICE_PRO: "price_pro_test",
    STRIPE_PRICE_ENTERPRISE: "price_enterprise_test",
  },
}));

import { BILLING_ADD_ONS, BILLING_PLANS, PLAN_LIMITS, planFromPriceId } from "./plans";

describe("billing plans", () => {
  it("keeps plan limits and add-on pricing centralized", () => {
    expect(PLAN_LIMITS.free.minutesPerMonth).toBe(60);
    expect(PLAN_LIMITS.free.spaces).toBe(1);
    expect(PLAN_LIMITS.pro.minutesPerMonth).toBe(500);
    expect(PLAN_LIMITS.pro.spaces).toBe("unlimited");
    expect(PLAN_LIMITS.enterprise.minutesPerMonth).toBe(2000);
    expect(PLAN_LIMITS.enterprise.spaces).toBe("unlimited");

    expect(BILLING_PLANS.pro.priceCents).toBe(5900);
    expect(BILLING_PLANS.enterprise.priceCents).toBe(24900);
    expect(BILLING_ADD_ONS.extraMinutes200.priceCents).toBe(2900);
  });

  it("maps stripe prices to plans", () => {
    expect(planFromPriceId("price_pro_test")).toBe("pro");
    expect(planFromPriceId("price_enterprise_test")).toBe("enterprise");
    expect(planFromPriceId(null)).toBe("free");
  });
});
