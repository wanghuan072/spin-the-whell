import { z } from "zod";
import { seedInitialAdmin } from "../services/admin-auth.js";

const input = z.object({
  ADMIN_USERNAME: z.string().min(1).max(64),
  ADMIN_INITIAL_PASSWORD: z.string().min(1).max(256),
}).parse(process.env);

const result = await seedInitialAdmin(input.ADMIN_USERNAME, input.ADMIN_INITIAL_PASSWORD);
console.log(result.created ? `Admin "${input.ADMIN_USERNAME}" created.` : `Admin "${input.ADMIN_USERNAME}" already exists.`);
