import { exceedsMaximumCost } from "../src";
import { CostExtension } from "../types";

describe("exceedsMaximumCost", () => {
  it("returns true if requestedQueryCost is 1001", () => {
    const cost: CostExtension = {
      requestedQueryCost: 1001,
      throttleStatus: {
        currentlyAvailable: 1000,
        maximumAvailable: 1000,
        restoreRate: 50,
      },
    };

    expect(exceedsMaximumCost(cost)).toBe(true);
  });

  it("returns false if requestedQueryCost is 1000", () => {
    const cost: CostExtension = {
      requestedQueryCost: 1000,
      throttleStatus: {
        currentlyAvailable: 1000,
        maximumAvailable: 1000,
        restoreRate: 50,
      },
    };

    expect(exceedsMaximumCost(cost)).toBe(false);
  });

  it("returns true if actualQueryCost is 1001", () => {
    const cost: CostExtension = {
      requestedQueryCost: 400,
      actualQueryCost: 1001,
      throttleStatus: {
        currentlyAvailable: 1000,
        maximumAvailable: 1000,
        restoreRate: 50,
      },
    };

    expect(exceedsMaximumCost(cost)).toBe(true);
  });

  it("returns false if actualQueryCost is 1000", () => {
    const cost: CostExtension = {
      requestedQueryCost: 400,
      actualQueryCost: 1000,
      throttleStatus: {
        currentlyAvailable: 1000,
        maximumAvailable: 1000,
        restoreRate: 50,
      },
    };

    expect(exceedsMaximumCost(cost)).toBe(false);
  });
});
