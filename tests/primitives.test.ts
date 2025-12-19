import { describe, test, expect } from "bun:test";
import { Mock } from "../src";
import { z } from "zod";

describe("primitive types", () => {
  test("string", async () => {
    const mock = new Mock(
      {
        t: z.object({ v: z.string() }),
      },
      () => {},
    );

    await mock.db.insertInto("t").values({ v: "hello" }).execute();

    const r = await mock.db.selectFrom("t").selectAll().executeTakeFirstOrThrow();

    expect(r.v).toBe("hello");
  });

  test("number", async () => {
    const mock = new Mock(
      {
        t: z.object({
          v: z.number(),
        }),
      },
      () => {},
    );

    await mock.db.insertInto("t").values({ v: 3.14 }).execute();

    const r = await mock.db.selectFrom("t").selectAll().executeTakeFirstOrThrow();

    expect(r.v).toBe(3.14);
  });

  test("integer", async () => {
    const mock = new Mock(
      {
        t: z.object({
          v: z.number().int(),
        }),
      },
      () => {},
    );

    await mock.db.insertInto("t").values({ v: 42 }).execute();

    const r = await mock.db.selectFrom("t").selectAll().executeTakeFirstOrThrow();

    expect(r.v).toBe(42);
  });

  test("boolean as 0/1", async () => {
    const mock = new Mock(
      {
        t: z.object({
          v: z.boolean(),
        }),
      },
      () => {},
    );

    await mock.db.insertInto("t").values({ v: 1 }).execute();

    const r = await mock.db.selectFrom("t").selectAll().executeTakeFirstOrThrow();

    expect(r.v).toBe(1);
  });
});
