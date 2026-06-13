"use client";

import React from "react";
import { Controller } from "react-hook-form";

import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import { Textarea } from "@/components/ui/textarea";
import { isRequiredLabel } from "./InputTextArea";

export default function TextAreaField({
  control,
  name,
  label,
  placeholder = "",
  className = "",
  isRequired = false,
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={name}>
            {label}
            {isRequired && isRequiredLabel}
          </FieldLabel>

          <Textarea
            {...field}
            id={name}
            placeholder={placeholder}
            className={className}
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