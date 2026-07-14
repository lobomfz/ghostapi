import { Database, type SchemaRecord, type TablesFromSchemas, type Kysely } from "@lobomfz/db";
import { Elysia } from "elysia";
import type { MockConfig, SetupFunction } from "./types";

export class Mock<T extends SchemaRecord, H = void> {
  readonly app = new Elysia();

  readonly db: Kysely<TablesFromSchemas<T>>;

  readonly helpers: H;

  private constructor(
    private readonly database: Database<T>,
    tables: T,
    setup: SetupFunction<T, H>,
    config?: MockConfig,
  ) {
    this.db = database.kysely;

    this.helpers = setup(this.app, { db: this.db, schemas: tables });

    if (config) {
      this.listen(this.getPort(config));
    }
  }

  static async create<T extends SchemaRecord, H = void>(
    tables: T,
    setup: SetupFunction<T, H>,
    config?: MockConfig,
  ): Promise<Mock<T, H>> {
    const database = await Database.open({ path: ":memory:", schema: { tables } });

    return new Mock(database, tables, setup, config);
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
