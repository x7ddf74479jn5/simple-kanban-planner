import * as z from "zod";

export const defaultColumnSchema = z.object({
  id: z.string().nonempty().max(20),
  title: z.string().nonempty(),
  taskIds: z.array(z.string()),
});

export const columnOrderSchema = z.object({
  id: z.string().nonempty(),
  order: z.array(z.string()),
});

export const columnSchema = z.union([defaultColumnSchema, columnOrderSchema]);

export type Column = z.infer<typeof columnSchema>;
export type DefaultColumn = z.infer<typeof defaultColumnSchema>;
export type ColumnOrder = z.infer<typeof columnOrderSchema>;
