import { z } from "zod";

export const timeEntrySchema = z
  .object({
    date: z.string().min(1, "Date is required"),

    startTime: z.string().min(1, "Start time is required"),

    endTime: z.string().min(1, "End time is required"),

    breakDuration: z.coerce
      .number()
      .min(0, "Break duration cannot be negative")
      .default(0),

    notes: z
      .string()
      .max(1000, "Notes cannot exceed 1000 characters")
      .optional(),
  })
  .refine(
    (data) => {
      const start = new Date(`2000-01-01T${data.startTime}`);
      const end = new Date(`2000-01-01T${data.endTime}`);

      return end > start;
    },
    {
      message: "End time must be greater than start time",
      path: ["endTime"],
    }
  );

export type TimeEntryFormValues = z.infer<typeof timeEntrySchema>;