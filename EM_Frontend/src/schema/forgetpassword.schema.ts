import { z } from "zod";

export const ForgetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export type forgetPasswordFormInput = z.input<typeof ForgetPasswordSchema>;
export type forgetPasswordFormValues = z.output<typeof ForgetPasswordSchema>;
