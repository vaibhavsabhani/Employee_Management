"use client";

import React from "react";
import { Controller } from "react-hook-form";

import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

export const isRequiredLabel = (
  <span className="text-red-500">*</span>
);

function InputTextArea({
  control,
  name,
  label,
  placeholder,
  isRequired = false,
  className = "",
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={field.name}>
            {label}
            {isRequired && isRequiredLabel}
          </FieldLabel>

          <Textarea
            {...field}
            id={field.name}
            placeholder={placeholder}
            className={`resize-none ${className}`}
            aria-invalid={fieldState.invalid}
          />

          {fieldState.error && (
            <FieldError
              errors={[fieldState.error]}
            />
          )}
        </Field>
      )}
    />
  );
}

export default InputTextArea;