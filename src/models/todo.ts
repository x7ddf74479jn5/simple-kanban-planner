import * as z from "zod";

export const todoSchema = z.object({
  id: z.string().optional(),
  task: z.string().max(40),
  done: z.boolean(),
});

export type Todo = z.infer<typeof todoSchema>;
