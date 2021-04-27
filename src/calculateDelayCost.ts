import { CostExtension } from "../types";

export function calculateDelayCost(cost: CostExtension) {
  const {
    requestedQueryCost,
    actualQueryCost,
    throttleStatus: { currentlyAvailable, restoreRate },
  } = cost;

  const requested = actualQueryCost || requestedQueryCost;
  const restoreAmount = Math.max(0, requested - currentlyAvailable);

  return Math.ceil(restoreAmount / restoreRate) * 1000;
}
