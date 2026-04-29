import { z } from "zod";

export const createSpaceSchema = z.object({
  name: z.string().min(2, "Nome demasiado curto").max(80, "Nome demasiado longo"),
  description: z.string().max(500, "Descrição demasiado longa").default(""),
});

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
