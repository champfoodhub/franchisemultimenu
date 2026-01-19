import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";

// Use local SQLite file for database
const sqlite = new Database("foodhub.db");
export const db = drizzle(sqlite, { schema });

