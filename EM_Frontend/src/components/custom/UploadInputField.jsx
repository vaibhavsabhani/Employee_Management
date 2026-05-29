"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { Controller } from "react-hook-form";

import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";

import { Button } from "@/components/ui/button";

const truncateText = (
  text,
  maxLength
) => {
  if (text.length <= maxLength)
    return text;

  return (
    text.slice(0, maxLength) + "..."
  );
};

function UploadInput({
  control,
  name,
  label,
  placeholder = "Click here to select the files you wish to upload.",
  required = false,
  isSelect = true,
  className = "",
  type = "file",
  accept,
  disabled = false,
  bottomText,
  multiple = false,
  value,
  onChange,
}) {
  const fileInputRef = useRef(null);

  const [displayText, setDisplayText] =
    useState(placeholder);

  useEffect(() => {
    if (value) {
      if (Array.isArray(value)) {
        setDisplayText(
          `${value.length} file${
            value.length > 1 ? "s" : ""
          } selected`
        );
      } else {
        setDisplayText(value.name);
      }
    } else {
      setDisplayText(placeholder);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [value, placeholder]);

  const handleFileChange = (
    e,
    rhfOnChange
  ) => {
    const files = Array.from(
      e.target.files || []
    );

    const fileValue = multiple
      ? files
      : files[0] || null;

    setDisplayText(
      files.length > 0
        ? multiple
          ? `${files.length} file${
              files.length > 1
                ? "s"
                : ""
            } selected`
          : files[0].name
        : placeholder
    );

    rhfOnChange?.(fileValue);
    onChange?.(fileValue);
  };

  const renderInput = (
    field,
    fieldState
  ) => (
    <div className="relative">
      <input
        id={field?.name || name}
        ref={(el) => {
          field?.ref?.(el);
          fileInputRef.current = el;
        }}
        type={type}
        accept={accept}
        disabled={disabled}
        multiple={multiple}
        className="hidden"
        onChange={(e) =>
          handleFileChange(
            e,
            field?.onChange
          )
        }
      />

      <div
        onClick={() =>
          !disabled &&
          fileInputRef.current?.click()
        }
        className={`
          border
          h-[48px]
          rounded-md
          px-4
          py-2
          flex
          items-center
          text-sm
          w-full
          ${
            disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          }
          ${
            fieldState?.error
              ? "border-destructive"
              : "border-input"
          }
          ${
            displayText === placeholder
              ? "text-muted-foreground"
              : "text-primary-text"
          }
          ${className}
        `}
      >
        <span title={displayText}>
          {truncateText(
            displayText,
            35
          )}
        </span>
      </div>

      {isSelect && (
        <Button
          type="button"
          disabled={disabled}
          onClick={() =>
            fileInputRef.current?.click()
          }
          className="absolute right-3 top-1/2 h-[35px] -translate-y-1/2"
        >
          {multiple
            ? "Select Files"
            : "Select File"}
        </Button>
      )}
    </div>
  );

  // RHF VERSION
  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({
          field,
          fieldState,
        }) => (
          <Field>
            {label && (
              <FieldLabel>
                {label}
                {required && (
                  <span className="text-red-500">
                    *
                  </span>
                )}
              </FieldLabel>
            )}

            {renderInput(
              field,
              fieldState
            )}

            {bottomText && (
              <FieldDescription>
                {bottomText}
              </FieldDescription>
            )}

            {fieldState.error && (
              <FieldError
                errors={[
                  fieldState.error,
                ]}
              />
            )}
          </Field>
        )}
      />
    );
  }

  // STANDALONE VERSION
  return (
    <Field>
      {label && (
        <FieldLabel>
          {label}
          {required && (
            <span className="text-red-500">
              *
            </span>
          )}
        </FieldLabel>
      )}

      {renderInput()}

      {bottomText && (
        <FieldDescription>
          {bottomText}
        </FieldDescription>
      )}
    </Field>
  );
}

export default UploadInput;