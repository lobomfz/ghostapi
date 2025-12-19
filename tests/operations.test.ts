import { describe, test, expect } from "bun:test";
import { Mock } from "../src";
import { z } from "zod";

describe("database operations", () => {
  test("empty select", async () => {
    const mock = new Mock(
      {
        t: z.object({
          v: z.string(),
        }),
      },
      () => {},
    );

    const r = await mock.db.selectFrom("t").selectAll().execute();

    expect(r).toEqual([]);
  });

  test("batch insert", async () => {
    const mock = new Mock(
      {
        t: z.object({
          v: z.number(),
        }),
      },
      () => {},
    );

    await mock.db
      .insertInto("t")
      .values([{ v: 1 }, { v: 2 }, { v: 3 }])
      .execute();

    const r = await mock.db.selectFrom("t").selectAll().execute();

    expect(r).toHaveLength(3);
  });

  test("update", async () => {
    const mock = new Mock(
      {
        t: z.object({
          id: z.string(),
          v: z.number(),
        }),
      },
      () => {},
    );

    await mock.db.insertInto("t").values({ id: "1", v: 10 }).execute();

    await mock.db.updateTable("t").set({ v: 20 }).where("id", "=", "1").execute();

    const r = await mock.db.selectFrom("t").selectAll().executeTakeFirstOrThrow();

    expect(r.v).toBe(20);
  });

  test("delete", async () => {
    const mock = new Mock(
      {
        t: z.object({
          id: z.string(),
        }),
      },
      () => {},
    );

    await mock.db.insertInto("t").values({ id: "1" }).execute();
    await mock.db.deleteFrom("t").where("id", "=", "1").execute();

    const r = await mock.db.selectFrom("t").selectAll().execute();

    expect(r).toHaveLength(0);
  });
});
