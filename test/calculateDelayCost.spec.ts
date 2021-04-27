import { calculateDelayCost } from "../src";
import { CostExtension } from "../types";

describe("calculateDelayCost", () => {
  it("returns 2000 milliseconds if restore rate is 50", () => {
    const cost: CostExtension = {
      requestedQueryCost: 212,
      throttleStatus: {
        currentlyAvailable: 123,
        maximumAvailable: 1000,
        restoreRate: 50,
      },
    };

    expect(calculateDelayCost(cost)).toStrictEqual(2000);
  });

  it("returns 1000 milliseconds if restore rate is 100", () => {
    const cost: CostExtension = {
      requestedQueryCost: 212,
      throttleStatus: {
        currentlyAvailable: 123,
        maximumAvailable: 1000,
        restoreRate: 100,
      },
    };

    expect(calculateDelayCost(cost)).toStrictEqual(1000);
  });

  it("returns 17000 milliseconds if restore rate is 50", () => {
    const cost: CostExtension = {
      requestedQueryCost: 950,
      throttleStatus: {
        currentlyAvailable: 100,
        maximumAvailable: 1000,
        restoreRate: 50,
      },
    };

    expect(calculateDelayCost(cost)).toStrictEqual(17000);
  });

  it("returns 1000 as actualQueryCost overrides", () => {
    const cost: CostExtension = {
      requestedQueryCost: 950,
      actualQueryCost: 150,
      throttleStatus: {
        currentlyAvailable: 100,
        maximumAvailable: 1000,
        restoreRate: 50,
      },
    };

    expect(calculateDelayCost(cost)).toStrictEqual(1000);
  });
});
