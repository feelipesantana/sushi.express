import { z } from "zod";


const envSchemaZod = z.object({
  URL_DB: z.string().url(),
  JWT_SECRET: z.string(),
  API_BASE_URL: z.string().url(),
AUTH_REDIRECT_URL:z.string().url()
})

export const env = envSchemaZod.parse(process.env)