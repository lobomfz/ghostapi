import { describe, test, expect } from "bun:test";
import { Mock } from "../src";
import { z } from "zod";

describe("reset", () => {
  test("reset() clears all tables", async () => {
    const mock = new Mock(
      {
        a: z.object({
          v: z.string(),
        }),
        b: z.object({
          v: z.string(),
        }),
      },
      () => {},
    );

    await mock.db.insertInto("a").values({ v: "1" }).execute();
    await mock.db.insertInto("b").values({ v: "2" }).execute();

    mock.reset();

    expect(await mock.db.selectFrom("a").selectAll().execute()).toHaveLength(0);
    expect(await mock.db.selectFrom("b").selectAll().execute()).toHaveLength(0);
  });

  test("reset(table) clears only that table", async () => {
    const mock = new Mock(
      {
        a: z.object({
          v: z.string(),
        }),
        b: z.object({
          v: z.string(),
        }),
      },
      () => {},
    );

    await mock.db.insertInto("a").values({ v: "1" }).execute();
    await mock.db.insertInto("b").values({ v: "2" }).execute();

    mock.reset("a");

    expect(await mock.db.selectFrom("a").selectAll().execute()).toHaveLength(0);
    expect(await mock.db.selectFrom("b").selectAll().execute()).toHaveLength(1);
  });
});
