import { describe, test, expect, afterAll } from "bun:test";
import { Mock } from "../src";
import { z } from "zod";
import axios from "redaxios";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const mock = new Mock({ users: userSchema }, (app, { db }) => {
  app.get("/users", () => db.selectFrom("users").selectAll().execute());

  app.get("/users/:id", ({ params }) =>
    db.selectFrom("users").selectAll().where("id", "=", params.id).executeTakeFirst(),
  );

  app.post(
    "/users",
    ({ body }) => db.insertInto("users").values(body).returningAll().executeTakeFirst(),
    { body: userSchema },
  );
});

mock.listen(3456);

afterAll(() => {
  mock.app.stop();
});

describe("http", () => {
  test("POST and GET", async () => {
    const { data: created } = await axios.post("http://localhost:3456/users", {
      id: "1",
      name: "Alice",
    });

    expect(created.name).toBe("Alice");

    const { data: user } = await axios.get("http://localhost:3456/users/1");

    expect(user.name).toBe("Alice");
  });

  test("GET all", async () => {
    const { data: users } = await axios.get("http://localhost:3456/users");

    expect(users.length).toBeGreaterThan(0);
  });
});
