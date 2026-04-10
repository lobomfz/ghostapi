import { describe, test, expect } from "bun:test";
import { Mock } from "../src";
import { type } from "arktype";

const userSchema = type({
  id: "string",
  name: "string",
});

describe("helpers", () => {
  test("helper executes and affects the database", async () => {
    const mock = new Mock({ users: userSchema }, (_app, { db }) => {
      return {
        clearAllUsers: () => db.deleteFrom("users").execute(),
      };
    });

    await mock.db.insertInto("users").values({ id: "1", name: "Alice" }).execute();

    expect(await mock.db.selectFrom("users").selectAll().execute()).toHaveLength(1);

    await mock.helpers.clearAllUsers();

    expect(await mock.db.selectFrom("users").selectAll().execute()).toHaveLength(0);
  });

  test("multiple helpers are all accessible", async () => {
    const mock = new Mock({ users: userSchema }, (_app, { db }) => {
      return {
        clearAllUsers: () => db.deleteFrom("users").execute(),
        seedUser: (id: string, name: string) =>
          db.insertInto("users").values({ id, name }).returningAll().executeTakeFirstOrThrow(),
      };
    });

    const user = await mock.helpers.seedUser("1", "Alice");

    expect(user.name).toBe("Alice");

    await mock.helpers.clearAllUsers();

    expect(await mock.db.selectFrom("users").selectAll().execute()).toHaveLength(0);
  });
});
