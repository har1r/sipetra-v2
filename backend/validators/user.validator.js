const { z, email } = require("zod");

const stageEnum = z.enum([
  "penginputan",
  "penelitian",
  "pengarsipan",
  "pengiriman",
  "pemeriksaan",
]);

const createUserSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.email("Format email tidak valid").transform((v) => v.toLowerCase()),
  userName: z.string().min(4, "Username minimal 4 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["admin", "operator", "viewer"]),
  stages: z.array(stageEnum).optional(),
  adminSecret: z.string().optional(),
});

const signInSchema = z.object({
  email: z.email("Format email tidak valid").transform((v) => v.toLowerCase()),
  userName: z.string().min(4, "Username minimal 4 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

module.exports = { createUserSchema, signInSchema };
