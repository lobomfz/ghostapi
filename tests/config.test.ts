import { describe, test, expect } from "bun:test";
import axios from "redaxios";
import { type } from "arktype";
import { Mock } from "../src";

const userSchema = type({
  id: "string",
  name: "string",
});

describe("mock config", () => {
  test("listens automatically when port is provided", async () => {
    const mock = await Mock.create(
      { users: userSchema },
      (app, { db }) => {
        app.get("/users", () => db.selectFrom("users").selectAll().execute());
      },
      { port: 3457 },
    );

    await mock.db.insertInto("users").values({ id: "1", name: "Alice" }).execute();

    const { data } = await axios.get("http://localhost:3457/users");

    expect(data).toEqual([{ id: "1", name: "Alice" }]);
  });

  test("listens automatically when base_url is provided", async () => {
    const mock = await Mock.create(
      { users: userSchema },
      (app, { db }) => {
        app.get("/users", () => db.selectFrom("users").selectAll().execute());
      },
      { base_url: "http://localhost:3458/api" },
    );

    await mock.db.insertInto("users").values({ id: "1", name: "Alice" }).execute();

    const { data } = await axios.get("http://localhost:3458/users");

    expect(data).toEqual([{ id: "1", name: "Alice" }]);
  });
});
