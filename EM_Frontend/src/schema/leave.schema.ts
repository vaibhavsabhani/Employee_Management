import { z } from "zod";

export const leaveSchema = z
  .object({
    leaveTypeId: z.string().min(1, "Leave type is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z.string().max(500, "Reason cannot exceed 500 characters").optional(),
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    { message: "End date must be on or after start date", path: ["endDate"] }
  );

export type LeaveFormValues = z.infer<typeof leaveSchema>;
