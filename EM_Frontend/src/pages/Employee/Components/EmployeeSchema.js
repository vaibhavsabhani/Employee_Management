import { z } from "zod";

export const employeeSchema = z.object({
  firstName: z.string().min(1, "required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "required"),

  email: z.email("Invalid email"),
  phoneNumber: z.string().min(1, "required"),

  role: z.string().min(1, "required"),
  isActive: z.string().min(1, "required"),
});

export default employeeSchema;
