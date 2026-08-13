import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getEnv } from "../config/env.js";
import * as schema from "./schema.js";

const sqlClient = neon(getEnv().DATABASE_URL);

export const db = drizzle({ client: sqlClient, schema });
