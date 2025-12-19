import { Database } from "bun:sqlite";
import { Elysia } from "elysia";
import { Kysely, ParseJSONResultsPlugin } from "kysely";
import { BunSqliteDialect } from "@lobomfz/kysely-bun-sqlite";
import type { SchemaWithJsonSchema, SetupFunction, TablesFromSchemas } from "./types";

export class Mock<Schemas extends Record<string, SchemaWithJsonSchema>> {
  private sqlite = new Database(":memory:");

  readonly app = new Elysia();

  readonly db = new Kysely<TablesFromSchemas<Schemas>>({
    dialect: new BunSqliteDialect({ database: this.sqlite }),
    plugins: [new ParseJSONResultsPlugin()],
  });

  constructor(
    private schemas: Schemas,
    setup: SetupFunction<Schemas>,
  ) {
    this.createTables();

    setup(this.app, { db: this.db, schemas: this.schemas });
  }

  private createTables(): void {
    for (const [tableName, schema] of Object.entries(this.schemas)) {
      const jsonSchema = schema["~standard"].jsonSchema.input({
        target: "draft-2020-12",
      });

      const columns: string[] = [];

      for (const [columnName, propSchema] of Object.entries(jsonSchema.properties as any)) {
        columns.push(this.jsonSchemaTypeToSql(columnName, (propSchema as any).type));
      }

      this.sqlite.run(`CREATE TABLE ${tableName} (${columns.join(", ")})`);
    }
  }

  private jsonSchemaTypeToSql(column: string, type: string): string {
    if (Array.isArray(type)) {
      type = type.find((t) => t !== "null") || "string";
    }

    let sqlType = "TEXT";

    switch (type) {
      case "string":
        sqlType = "TEXT";
        break;
      case "number":
        sqlType = "REAL";
        break;
      case "integer":
        sqlType = "INTEGER";
        break;
      case "boolean":
        sqlType = "INTEGER";
        break;
      case "object":
      case "array":
        sqlType = "TEXT";
        break;
    }

    return `${column} ${sqlType}`;
  }

  listen(port: number): void {
    this.app.listen(port);
  }

  reset(table?: keyof Schemas & string): void {
    if (table) {
      this.sqlite.run(`DELETE FROM ${table}`);
      return;
    }

    for (const table of Object.keys(this.schemas)) {
      this.sqlite.run(`DELETE FROM ${table}`);
    }
  }
}
