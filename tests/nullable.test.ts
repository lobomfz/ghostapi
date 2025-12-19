import { describe, test, expect } from "bun:test";
import { Mock } from "../src";
import { z } from "zod";

describe("nullable vs optional", () => {
  test("nullable accepts null", async () => {
    const mock = new Mock(
      {
        t: z.object({
          v: z.string().nullable(),
        }),
      },
      () => {},
    );

    await mock.db.insertInto("t").values({ v: null }).execute();

    const r = await mock.db.selectFrom("t").selectAll().executeTakeFirstOrThrow();

    expect(r.v).toBeNull();
  });

  test("optional omits field", async () => {
    const mock = new Mock(
      {
        t: z.object({
          a: z.string(),
          b: z.string().optional(),
        }),
      },
      () => {},
    );

    await mock.db.insertInto("t").values({ a: "x" }).execute();

    const r = await mock.db.selectFrom("t").selectAll().executeTakeFirstOrThrow();

    expect(r.a).toBe("x");
    expect(r.b).toBeNull();
  });

  test("nullish stores as null", async () => {
    const mock = new Mock(
      {
        t: z.object({
          a: z.string(),
          b: z.string().nullish(),
        }),
      },
      () => {},
    );

    await mock.db.insertInto("t").values({ a: "x", b: null }).execute();
    await mock.db.insertInto("t").values({ a: "y" }).execute();

    const r = await mock.db.selectFrom("t").selectAll().execute();

    expect(r).toHaveLength(2);
    expect(r[0]!.b).toBeNull();
    expect(r[1]!.b).toBeNull();
  });
});
