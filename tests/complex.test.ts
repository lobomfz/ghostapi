import { describe, test, expect } from "bun:test";
import { Mock } from "../src";
import { z } from "zod";

describe("complex types", () => {
  test("array", async () => {
    const mock = new Mock(
      {
        t: z.object({
          v: z.array(z.string()),
        }),
      },
      () => {},
    );

    await mock.db
      .insertInto("t")
      .values({ v: ["a", "b", "c"] })
      .execute();

    const r = await mock.db.selectFrom("t").selectAll().executeTakeFirstOrThrow();

    expect(r.v).toEqual(["a", "b", "c"]);
  });

  test("nested object", async () => {
    const mock = new Mock(
      {
        t: z.object({
          v: z.object({
            x: z.number(),
            y: z.number(),
          }),
        }),
      },
      () => {},
    );

    await mock.db
      .insertInto("t")
      .values({ v: { x: 1, y: 2 } })
      .execute();

    const r = await mock.db.selectFrom("t").selectAll().executeTakeFirstOrThrow();

    expect(r.v).toEqual({ x: 1, y: 2 });
  });

  test("array of objects", async () => {
    const mock = new Mock(
      {
        t: z.object({
          v: z.array(
            z.object({
              id: z.number(),
            }),
          ),
        }),
      },
      () => {},
    );

    await mock.db
      .insertInto("t")
      .values({ v: [{ id: 1 }, { id: 2 }] })
      .execute();

    const r = await mock.db.selectFrom("t").selectAll().executeTakeFirstOrThrow();

    expect(r.v).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
