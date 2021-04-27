import { onError } from "@apollo/client/link/error";
import { GraphQLError } from "graphql";
import Observable from "zen-observable";
import { ShopifyExecutionResult, ShopifyRetryLinkOptions } from "../types";
import { calculateDelayCost } from "./calculateDelayCost";
import { exceedsMaximumCost } from "./exceedsMaximumCost";

const defaultOptions: ShopifyRetryLinkOptions = {
  debug: true,
};

function isThrottledError(error: GraphQLError) {
  return error.extensions?.code === "THROTTLED";
}

function delay(msToWait: number) {
  return new Observable((observer) => {
    let timer = setTimeout(() => {
      observer.complete();
    }, msToWait);

    return () => clearTimeout(timer);
  });
}

export function createShopifyRetryLink(
  optionsOverride?: ShopifyRetryLinkOptions
) {
  const options = {
    ...defaultOptions,
    ...(optionsOverride || {}),
  };

  return onError(
    ({ graphQLErrors, networkError, forward, operation, response }) => {
      if (networkError) {
        // A non 429 connection error.
        // Fallback to ApolloClient's own error handler.
        return;
      }

      if (!graphQLErrors) {
        // An error we cannot respond to with rate limit handling. We require a specific error extension.
        // Fallback to ApolloClient's own error handler.
        return;
      }

      if (!graphQLErrors.some(isThrottledError)) {
        // There was no throttling for this request.
        // Fallback to ApolloClient's own error handler.
        return;
      }

      const cost = (response as ShopifyExecutionResult | undefined)?.extensions
        ?.cost;

      if (!cost) {
        // We require the cost extension to calculate the delay.
        // Fallback to ApolloClient's own error handler.
        return;
      }

      if (exceedsMaximumCost(cost)) {
        // Your query costs more than the maximum allowed cost.
        // Fallback to ApolloClient's own error handler.
        return;
      }

      const msToWait = calculateDelayCost(cost);
      if (options.debug) {
        console.log(`Throttled. Milliseconds to wait: ${msToWait}`);
      }

      operation.setContext({ retry: true });
      return delay(msToWait).concat(forward(operation));
    }
  );
}
