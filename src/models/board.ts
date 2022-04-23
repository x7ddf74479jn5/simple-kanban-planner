import * as z from "zod";

export const boardSchema = z.object({
  id: z.string().optional(),
  name: z.string().nonempty(),
});

export type Board = z.infer<typeof boardSchema>;
