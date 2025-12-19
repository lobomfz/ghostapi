import type { StandardJSONSchemaV1 } from "@standard-schema/spec";
import type Elysia from "elysia";
import type { Kysely } from "kysely";

type ReplaceBooleanWithNumber<T> = T extends boolean
  ? number
  : T extends object
    ? { [K in keyof T]: ReplaceBooleanWithNumber<T[K]> }
    : T;

export type SchemaWithJsonSchema = StandardJSONSchemaV1<Record<string, unknown>>;

export type InferTableType<T> =
  T extends StandardJSONSchemaV1<unknown, infer Output> ? ReplaceBooleanWithNumber<Output> : never;

export type TablesFromSchemas<T extends Record<string, SchemaWithJsonSchema>> = {
  [K in keyof T]: InferTableType<T[K]>;
};

export type SetupContext<TSchemas extends Record<string, SchemaWithJsonSchema>> = {
  db: Kysely<TablesFromSchemas<TSchemas>>;
  schemas: TSchemas;
};

export type SetupFunction<TSchemas extends Record<string, SchemaWithJsonSchema>> = (
  app: Elysia,
  context: SetupContext<TSchemas>,
) => void;
