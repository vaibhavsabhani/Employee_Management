import { z } from "zod";

export const leaveSchema = z
  .object({
    leaveTypeId: z.string().min(1, "Leave type is required"),
    dayType: z.enum(["full", "half"]),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    halfDaySession: z.enum(["first_half", "second_half"]).optional(),
    reason: z.string().max(500, "Reason cannot exceed 500 characters").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.dayType === "half") {
      if (!data.halfDaySession) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select first or second half",
          path: ["halfDaySession"],
        });
      }
    } else {
      if (!data.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date is required",
          path: ["endDate"],
        });
      } else if (new Date(data.endDate) < new Date(data.startDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date must be on or after start date",
          path: ["endDate"],
        });
      }
    }
  });

export type LeaveFormValues = z.infer<typeof leaveSchema>;
