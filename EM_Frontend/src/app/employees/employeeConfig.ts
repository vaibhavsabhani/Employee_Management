import { initials } from "@/src/lib/utils";
import {
  CalendarDays,
  CreditCard,
  Fingerprint,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Employee } from "./EmployeePage";

export const employeeDialogConfig = (viewEmployee: Employee | null) =>
  viewEmployee
    ? {
        avatar: viewEmployee.profilePicture,
        initials: initials(viewEmployee),

        title: [
          viewEmployee.firstName,
          viewEmployee.middleName,
          viewEmployee.lastName,
        ]
          .filter(Boolean)
          .join(" "),

        subtitle: viewEmployee.role?.name ?? "Employee",

        isActive: viewEmployee.isActive,

        fields: [
          {
            icon: Mail,
            label: "Email",
            value: viewEmployee.email,
          },
          {
            icon: Phone,
            label: "Phone Number",
            value: [viewEmployee.countryCode, viewEmployee.phoneNumber]
              .filter(Boolean)
              .join(" ") || undefined,
          },
          {
            icon: CreditCard,
            label: "PAN Number",
            value: viewEmployee.panNumber,
          },
          {
            icon: Fingerprint,
            label: "Aadhaar Number",
            value: viewEmployee.aadhaarNumber,
          },
          {
            icon: MapPin,
            label: "Address",
            value: viewEmployee.address,
          },
          {
            icon: CalendarDays,
            label: "Joined",
            value: viewEmployee.createdAt
              ? new Date(viewEmployee.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : undefined,
          },
        ],
      }
    : undefined;
