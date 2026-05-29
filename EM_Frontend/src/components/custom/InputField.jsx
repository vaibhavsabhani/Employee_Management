"use client";

import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";

export const isRequiredLabel = <span className="text-red-500">*</span>;

function InputField({
  control,
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  className = "",
  description,
  hideInput = false,
  value,
  onChange,
  step,
  onKeyDown,
  onBeforeInput,
  onPaste,
  textAfterLabel,
  isLabelWithText = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const renderInput = (field, fieldState) => {
    if (hideInput) return null;

    const inputType =
      type === "password" ? (showPassword ? "text" : "password") : type;

    const isNumber = type === "number";

    return (
      <div className="relative">
        <Input
          {...field}
          id={name}
          type={inputType}
          placeholder={placeholder}
          className={`pr-10 ${className}`}
          aria-invalid={fieldState?.invalid}
          step={isNumber ? step : undefined}
          onKeyDown={onKeyDown}
          onBeforeInput={onBeforeInput}
          onPaste={onPaste}
          onChange={(e) => {
            field?.onChange?.(e);
            onChange?.(e);
          }}
        />

        {type === "password" && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    );
  };

  if (control) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            {isLabelWithText ? (
              <div className="flex items-center justify-between">
                <FieldLabel
                  htmlFor={name}
                  className={fieldState.error ? "text-red-500" : ""}
                >
                  {label} {required && isRequiredLabel}
                </FieldLabel>

                {textAfterLabel}
              </div>
            ) : (
              <FieldLabel
                htmlFor={name}
                className={fieldState.error ? "text-red-500" : ""}
              >
                {label} {required && isRequiredLabel}
              </FieldLabel>
            )}

            {renderInput(field, fieldState)}

            {description && <FieldDescription>{description}</FieldDescription>}

            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    );
  }

  return (
    <Field>
      <FieldLabel htmlFor={name}>
        {label} {required && isRequiredLabel}
      </FieldLabel>

      {!hideInput && renderInput({ value, onChange }, { invalid: false })}
    </Field>
  );
}

export default InputField;
