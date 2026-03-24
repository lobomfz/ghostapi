import { Database, type SchemaRecord, type TablesFromSchemas } from "@lobomfz/db";
import { Elysia } from "elysia";
import type { Kysely } from "kysely";
import type { MockConfig, SetupFunction } from "./types";

export class Mock<T extends SchemaRecord> {
  private database: Database<T>;

  private readonly app = new Elysia();

  readonly db: Kysely<TablesFromSchemas<T>>;

  constructor(
    tables: T,
    setup: SetupFunction<T>,
    config?: MockConfig,
  ) {
    this.database = new Database({ path: ":memory:", schema: { tables } });
    this.db = this.database.kysely;

    setup(this.app, { db: this.db, schemas: tables });

    if (config) {
      this.listen(this.getPort(config));
    }
  }

  private getPort(config: MockConfig): number {
    if (config.port !== undefined) {
      return config.port;
    }

    const port = new URL(config.base_url).port;

    if (port) {
      return Number(port);
    }

    throw new Error(`base_url must include a port: ${config.base_url}`);
  }

  listen(port: number): void {
    this.app.listen(port);
  }

  reset(table?: keyof T & string): void {
    this.database.reset(table);
  }
}
