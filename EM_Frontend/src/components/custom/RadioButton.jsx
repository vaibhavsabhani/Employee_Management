"use client";

import React from "react";
import { Controller } from "react-hook-form";

import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

function RadioButton({
  label,
  name,
  control,
  options,
  direction = "row",
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={name}>
            {label}
          </FieldLabel>

          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            className={
              direction === "row"
                ? "flex flex-row gap-4"
                : "flex flex-col gap-2"
            }
          >
            {options.map((option) => (
              <div
                key={option.value}
                className="flex items-center gap-2"
              >
                <RadioGroupItem
                  id={option.value}
                  value={option.value}
                />

                <label
                  htmlFor={option.value}
                  className={`cursor-pointer text-sm ${
                    field.value === option.value
                      ? "font-medium text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {option.label}
                </label>
              </div>
            ))}
          </RadioGroup>

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

export default RadioButton;