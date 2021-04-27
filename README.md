# apollo-link-shopify-retry

Easy setup for retrying rate limited request in Shopify's (Admin) GraphQL API.

## Installation

For npm:

```
npm i apollo-link-shopify-retry
```

For yarn:

```
yarn add apollo-link-shopify-retry
```

## Usage

When creating your client, inject this `link` as a middleware:

```js
// client.js
import {
  ApolloClient,
  HttpLink,
  ApolloLink,
  InMemoryCache,
} from "@apollo/client";
import { createShopifyRetryLink } from "apollo-link-shopify-retry";

export const createClient = (shop, accessToken) => {
  const endpoint = new HttpLink({
    uri: `https://${shop}/admin/api/2021-04/graphql.json`,
  });
  const rateLimit = createShopifyRetryLink();

  const link = ApolloLink.from([
    rateLimit,
    endpoint,
  ]);

  return new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });
};
```

## Options

By default, we log the throttles to console.log. You can disable this by passing `{ debug: false }` to `createShopifyRetryLink`.

## Behavior

It utilizes `@apollo/client/link/error`. This link checks how much cost needs to be restored in order to perform a GraphQL operation, allows you to wait until the operation can succeed. If the operation succeeds the maximum allowed cost of your Shopify API, the error will still be raised.
