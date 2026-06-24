"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { type Control, type FieldValues, type Path } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";

type InputFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  required?: boolean;
  type?: "text" | "email" | "password" | "number" | "date" | "time" | "tel" | "url";
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
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const isPasswordField = type === "password";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel required={required}>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={isPasswordField && passwordVisible ? "text" : type}
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
                className={cn(isPasswordField && "pr-11")}
              />

              {isPasswordField ? (
                <button
                  type="button"
                  onClick={() => setPasswordVisible((current) => !current)}
                  aria-label={
                    passwordVisible ? "Hide password" : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
                >
                  {passwordVisible ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              ) : null}
            </div>
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
