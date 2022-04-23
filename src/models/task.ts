import * as z from "zod";

import { todoSchema } from "@/models/todo";

export const taskSchema = z.object({
  id: z.string().nonempty(),
  title: z.string().nonempty().max(45),
  description: z.string().optional(),
  priority: z.union([z.literal("low"), z.literal("medium"), z.literal("high")]),
  dateAdded: z.date().optional(),
  todos: z.array(todoSchema).default([]),
});

export type Task = z.infer<typeof taskSchema>;
export type Priority = z.infer<typeof taskSchema.shape.priority>;
