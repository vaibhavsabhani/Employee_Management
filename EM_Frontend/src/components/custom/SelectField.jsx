"use client";

import React from "react";
import { Controller } from "react-hook-form";

import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";

export const isRequiredLabel = (
  <span className="text-red-500">*</span>
);

function SelectField({
  control,
  name,
  label,
  placeholder,
  options = [],
  isRequired = false,
  hideLabel = false,
  disabled = false,
  className = "",
}) {
  const renderOptions = () =>
    options.map((option, index) => {
      const isGroup = option?.data;
      const isLast = index === options.length - 1;

      if (isGroup) {
        return (
          <div key={option.name}>
            <SelectGroup>
              <SelectLabel>
                {option.name}
              </SelectLabel>

              {option.data.map((item) => (
                <SelectItem
                  key={item.value}
                  value={String(item.value)}
                  disabled={item.disabled}
                >
                  {item.name}
                </SelectItem>
              ))}
            </SelectGroup>

            {!isLast && <SelectSeparator />}
          </div>
        );
      }

      return (
        <SelectItem
          key={option.value}
          value={String(option.value)}
          disabled={option.disabled}
        >
          {option.name}
        </SelectItem>
      );
    });

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          {!hideLabel && (
            <FieldLabel>
              {label}
              {isRequired && isRequiredLabel}
            </FieldLabel>
          )}

          <Select
            value={field.value ? String(field.value) : ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={className}
              aria-invalid={fieldState.invalid}
            >
              <SelectValue
                placeholder={placeholder}
              />
            </SelectTrigger>

            <SelectContent>
              {renderOptions()}
            </SelectContent>
          </Select>

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

export default SelectField;