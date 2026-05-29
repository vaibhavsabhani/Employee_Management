"use client";

import React from "react";
import { Control, Controller } from "react-hook-form";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import { cn } from "@/lib/utils";
import { isRequiredLabel } from "./InputField";

function MultiSelectInput(props) {
  const {
    label,
    placeholder,
    options,
    hideLabel,
    isRequired,
    className,
    disabled,
    storeAs = "array",
    checkBoxDisabled,
  } = props;

  const flattenOptions = (opts) =>
    opts.flatMap((opt) => ("data" in opt ? opt.data : [opt]));

  const flattened = flattenOptions(options);

  const renderOptions = (
    selected,
    handleCheck
  ) =>
    options.map((opt, i) => {
      const isGroup = "data" in opt;
      const groupItems = isGroup ? opt.data : [opt];

      return (
        <div
          key={`group-${opt.name}-${i}`}
          className="space-y-1"
        >
          {isGroup && (
            <div className="px-1.5 text-sm font-semibold text-muted-foreground">
              {opt.name}
            </div>
          )}

          {groupItems.map((item, idx) => {
            const itemDisabled =
              checkBoxDisabled || item.disabled;

            return (
              <label
                key={`${item.value}-${idx}`}
                className={cn(
                  "flex items-center space-x-2 px-2 py-1.5 text-sm",
                  itemDisabled
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer"
                )}
              >
                <Checkbox
                  checked={selected.includes(
                    item.value
                  )}
                  disabled={itemDisabled}
                  onCheckedChange={(checked) =>
                    handleCheck(
                      Boolean(checked),
                      item.value
                    )
                  }
                />

                <span>{item.name}</span>
              </label>
            );
          })}
        </div>
      );
    });

  const getDisplayValue = (selected) =>
    selected.length
      ? flattened
          .filter((opt) =>
            selected.includes(opt.value)
          )
          .map((opt) => opt.name)
          .join(", ")
      : placeholder;

  const convertValue = (value) =>
    typeof value === "string"
      ? value.split(",").filter(Boolean)
      : value || [];

  const finalValue = (value) =>
    storeAs === "string"
      ? value.join(",")
      : value;

  const baseClass = cn(
    "w-full h-[48px] px-3 flex items-center justify-between min-w-0",
    "border-input",
    className
  );

  // React Hook Form Version
  if ("control" in props) {
    const { control, name, onChange } = props;

    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => {
          const selected = convertValue(
            field.value
          );

          const handleCheck = (
            checked,
            val
          ) => {
            const updated = checked
              ? [...selected, val]
              : selected.filter(
                  (v) => v !== val
                );

            const result =
              finalValue(updated);

            field.onChange(result);
            onChange?.(result);
          };

          return (
            <Field>
              {!hideLabel && (
                <FieldLabel>
                  {label}
                  {isRequired &&
                    isRequiredLabel}
                </FieldLabel>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    aria-invalid={
                      fieldState.invalid
                    }
                    className={cn(
                      baseClass,
                      fieldState.error &&
                        "border-destructive"
                    )}
                  >
                    <span
                      className={cn(
                        selected.length === 0
                          ? "text-muted-foreground"
                          : "text-primary-text",
                        "flex-1 truncate text-left"
                      )}
                      title={getDisplayValue(
                        selected
                      )}
                    >
                      {getDisplayValue(
                        selected
                      )}
                    </span>
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  className="max-h-60 overflow-y-auto p-2"
                >
                  {renderOptions(
                    selected,
                    handleCheck
                  )}
                </PopoverContent>
              </Popover>

              {fieldState.error && (
                <FieldError
                  errors={[
                    fieldState.error,
                  ]}
                />
              )}
            </Field>
          );
        }}
      />
    );
  }

  // Standalone Version
  const { value, onChange } = props;

  const selected = convertValue(value);

  const handleCheck = (
    checked,
    val
  ) => {
    const updated = checked
      ? [...selected, val]
      : selected.filter(
          (v) => v !== val
        );

    onChange(finalValue(updated));
  };

  return (
    <Field>
      {!hideLabel && (
        <FieldLabel>
          {label}
          {isRequired &&
            isRequiredLabel}
        </FieldLabel>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={baseClass}
          >
            <span
              className={cn(
                selected.length === 0
                  ? "text-muted-foreground"
                  : "text-primary-text",
                "flex-1 truncate text-left"
              )}
              title={getDisplayValue(
                selected
              )}
            >
              {getDisplayValue(selected)}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="max-h-60 overflow-y-auto p-2"
        >
          {renderOptions(
            selected,
            handleCheck
          )}
        </PopoverContent>
      </Popover>
    </Field>
  );
}

export default MultiSelectInput;