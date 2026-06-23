import { z } from "zod";

export const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  profilePicture: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number is required"),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number format (e.g., ABCDE1234F)")
    .optional()
    .or(z.literal("")),
  aadhaarNumber: z
    .string()
    .regex(/^\d{12}$/, "Aadhaar must be a 12-digit number")
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
  role: z.enum(["admin", "employee"]),
  isActive: z.boolean(),
});

export type EmployeeFormInput = z.infer<typeof employeeSchema>;
export type EmployeeFormValues = EmployeeFormInput;
