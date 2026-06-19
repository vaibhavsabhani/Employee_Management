"use client";

import { type Control, type FieldValues, type Path } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type InputFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  required?: boolean;
  type?: "text" | "email" | "password" | "number" | "date" | "tel" | "url";
  placeholder?: string;
  description?: string;
  disabled?: boolean;
};

export function InputField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  type = "text",
  placeholder,
  description,
  disabled,
}: InputFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel required={required}>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              value={field.value ?? ""}
              onChange={(event) => {
                if (type === "number") {
                  const nextValue = event.target.value;
                  field.onChange(
                    nextValue === "" ? undefined : Number(nextValue),
                  );
                  return;
                }

                field.onChange(event);
              }}
            />
          </FormControl>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
