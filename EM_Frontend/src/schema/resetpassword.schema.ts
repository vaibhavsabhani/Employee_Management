import { z } from "zod";

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type ResetPasswordFormInput = z.input<typeof resetPasswordSchema>;
export type ResetPasswordFormValues = z.output<typeof resetPasswordSchema>;
