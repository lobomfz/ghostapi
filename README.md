# ghostapi

Mock http server with typed in-memory SQLite database. powered by [Elysia](https://elysiajs.com). works with any [Standard Schema](https://standardschema.dev) library. uses [Kysely](https://kysely.dev) for type-safe database queries.

```bash
bun add -d @lobomfz/ghostapi
```

## Usage

your app probably calls external APIs using a base URL from env:

```ts
// src/billing.ts
const STRIPE_API = process.env.STRIPE_API; // https://api.stripe.com in prod

export async function updateSubscription(customerId: string, plan: string) {
  const res = await fetch(`${STRIPE_API}/customers/${customerId}/subscription`, {
    method: "POST",
    body: JSON.stringify({ plan }),
  });

  return res.json();
}
```

create a mock that handles those routes:

```ts
import { Mock } from "@lobomfz/ghostapi";
import { type } from "arktype";

const schema = type({
  id: "string",
  plan: "string",
});

const stripeMock = new Mock(
  { customers: schema },
  // db is fully typed based on your schemas
  // app is a full elysia instance
  (app, { db }) => {
    app.post(
      "/customers/:id/subscription",
      async ({ params, body }) => {
        await db
          .updateTable("customers")
          .set({ plan: body.plan })
          .where("id", "=", params.id)
          .execute();

        return db
          .selectFrom("customers")
          .selectAll()
          .where("id", "=", params.id)
          .executeTakeFirst();
      },
      { body: schema },
    );
  },
);
```

in tests, set `STRIPE_API=http://localhost:4100` and your code calls the mock transparently:

```ts
import { test, expect } from "bun:test";
// your production code
import { updateSubscription } from "../src/billing";

stripeMock.listen(4100)

test("update subscription", async () => {
  // you have access to your mocked api database directly
  await stripeMock.db
    .insertInto("customers")
    .values({ id: "cus_123", plan: "free" })
    .execute();

  const customer = await updateSubscription("cus_123", "pro");

  expect(customer.plan).toBe("pro");
});
```

## API

```ts
new Mock<T>(schemas: T, setup: (app: Elysia, ctx: { db: Kysely<T>, schemas: T }) => void)

mock.app     // Elysia instance
mock.db      // Kysely client
mock.listen(port: number): void
mock.reset(table?: keyof T): void
```

## Notes

- Booleans are stored as `0`/`1`
