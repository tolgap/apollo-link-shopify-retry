import { ExecutionResult } from "graphql";

export interface ShopifyRetryLinkOptions {
  debug?: boolean;
}

export type ShopifyExecutionResult = ExecutionResult<
  unknown,
  { cost: CostExtension, retry?: boolean }
>;

export interface CostExtension {
  requestedQueryCost: number;
  actualQueryCost?: number;
  throttleStatus: CostExtensionThrottle;
}

export interface CostExtensionThrottle {
  maximumAvailable: number;
  currentlyAvailable: number;
  restoreRate: number;
}
