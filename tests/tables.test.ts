import { describe, test, expect } from "bun:test";
import { Mock } from "../src";
import { z } from "zod";

describe("multiple tables", () => {
  test("creates all tables", async () => {
    const mock = new Mock(
      {
        users: z.object({
          id: z.string(),
          name: z.string(),
        }),
        posts: z.object({
          id: z.string(),
          userId: z.string(),
          title: z.string(),
        }),
        comments: z.object({
          id: z.string(),
          postId: z.string(),
          body: z.string(),
        }),
      },
      () => {},
    );

    await mock.db.insertInto("users").values({ id: "u1", name: "Alice" }).execute();
    await mock.db.insertInto("posts").values({ id: "p1", userId: "u1", title: "Hello" }).execute();

    await mock.db
      .insertInto("comments")
      .values({ id: "c1", postId: "p1", body: "Nice!" })
      .execute();

    const users = await mock.db.selectFrom("users").selectAll().execute();
    const posts = await mock.db.selectFrom("posts").selectAll().execute();
    const comments = await mock.db.selectFrom("comments").selectAll().execute();

    expect(users).toHaveLength(1);
    expect(posts).toHaveLength(1);
    expect(comments).toHaveLength(1);
  });

  test("join across tables", async () => {
    const mock = new Mock(
      {
        users: z.object({
          id: z.string(),
          name: z.string(),
        }),
        posts: z.object({
          id: z.string(),
          userId: z.string(),
          title: z.string(),
        }),
      },
      () => {},
    );

    await mock.db.insertInto("users").values({ id: "u1", name: "Alice" }).execute();
    await mock.db.insertInto("posts").values({ id: "p1", userId: "u1", title: "Hello" }).execute();

    const r = await mock.db
      .selectFrom("posts")
      .innerJoin("users", "users.id", "posts.userId")
      .select(["posts.title", "users.name"])
      .executeTakeFirstOrThrow();

    expect(r.title).toBe("Hello");
    expect(r.name).toBe("Alice");
  });
});
