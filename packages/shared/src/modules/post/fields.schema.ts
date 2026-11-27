import { z } from "zod";

export const postFieldsSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  slug: z.string(),
  content: z.string().nullable(),
});
