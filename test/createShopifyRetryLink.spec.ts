import { ApolloLink, execute, gql, Observable } from "@apollo/client/core";
import { createShopifyRetryLink } from "../src/main";

describe("createShopifyRetryLink", () => {
  it("Does not retry a successful operation", (done) => {
    const query = gql`
      {
        foo
      }
    `;

    let retried: boolean | undefined;
    const successLink = new ApolloLink((request) => {
      retried = request.getContext().retry;

      return Observable.of({
        data: {
          foo: "Hello world!",
        },
        context: {},
        extensions: {
          cost: {
            requestedQueryCost: 5,
            actualQueryCost: 5,
            throttleStatus: {
              maximumAvailable: 1000,
              currentlyAvailable: 5,
              restoreRate: 50,
            },
          },
        },
      } as any);
    });

    const retry = createShopifyRetryLink();
    const link = retry.concat(successLink);

    execute(link, { query }).subscribe({
      next: (value: any) => {
        expect(value.data).toEqual({
          foo: "Hello world!",
        });
        expect(retried).toBeFalsy();
      },
      complete: done,
    });
  });

  it("Does not retry if a non-throttle error", (done) => {
    const query = gql`
      {
        foo
      }
    `;

    let retried: boolean | undefined;
    const errorLink = new ApolloLink((request) => {
      retried = request.getContext().retry;

      return Observable.of({
        data: undefined,
        errors: [{ message: "Undefined variable $input" }],
        context: {},
        extensions: {
          cost: {
            requestedQueryCost: 5,
            actualQueryCost: 5,
            throttleStatus: {
              maximumAvailable: 1000,
              currentlyAvailable: 1000,
              restoreRate: 50,
            },
          },
        },
      } as any);
    });

    const retry = createShopifyRetryLink();
    const link = retry.concat(errorLink);

    execute(link, { query }).subscribe({
      next: (value: any) => {
        expect(value.data).toBeUndefined();
        expect(retried).toBeFalsy();
      },
      complete: done,
    });
  });

  it("Retries until success", (done) => {
    const query = gql`
      {
        foo
      }
    `;

    let retried: boolean | undefined;
    const successLink = new ApolloLink((request) => {
      retried = request.getContext().retry;

      if (retried) {
        return Observable.of({
          data: {
            foo: "Hello world!",
          },
          context: {},
          extensions: {
            cost: {
              requestedQueryCost: 5,
              actualQueryCost: 5,
              throttleStatus: {
                maximumAvailable: 1000,
                currentlyAvailable: 49,
                restoreRate: 50,
              },
            },
          },
        } as any);
      }

      return Observable.of({
        data: undefined,
        errors: [{ message: "Throttled", extensions: { code: "THROTTLED" } }],
        context: {},
        extensions: {
          cost: {
            requestedQueryCost: 5,
            actualQueryCost: 5,
            throttleStatus: {
              maximumAvailable: 1000,
              currentlyAvailable: 4,
              restoreRate: 50,
            },
          },
        },
      } as any);
    });

    const retry = createShopifyRetryLink();
    const link = retry.concat(successLink);

    execute(link, { query }).subscribe({
      next: (value: any) => {
        expect(value.data).toEqual({
          foo: "Hello world!",
        });
        expect(retried).toBe(true);
      },
      complete: done,
    });
  });
});
