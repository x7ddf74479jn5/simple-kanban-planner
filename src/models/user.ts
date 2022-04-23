import * as z from "zod";

export const userSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  displayName: z.string().nonempty(),
  email: z.string().nonempty(),
});

export type User = z.infer<typeof userSchema>;
