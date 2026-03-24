import type { SchemaRecord, TablesFromSchemas } from "@lobomfz/db";
import type Elysia from "elysia";
import type { Kysely } from "kysely";

export type SetupContext<T extends SchemaRecord> = {
  db: Kysely<TablesFromSchemas<T>>;
  schemas: T;
};

export type SetupFunction<T extends SchemaRecord> = (
  app: Elysia,
  context: SetupContext<T>,
) => void;

export type MockConfig =
  | {
      port: number;
      base_url?: never;
    }
  | {
      port?: never;
      base_url: string;
    };
