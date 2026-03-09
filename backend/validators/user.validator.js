const { z } = require("zod");

const stageEnum = z.enum([
  "penginputan",
  "penelitian",
  "pengarsipan",
  "pengiriman",
  "pemeriksaan",
]);

const createUserSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.email().transform((value) => value.toLowerCase()),
  userName: z.string().min(4),
  password: z.string().min(6),
  role: z.enum(["admin", "operator", "viewer"]),
  stages: z.array(stageEnum).optional(),
  adminSecret: z.string().optional(),
});

module.exports = { createUserSchema };
