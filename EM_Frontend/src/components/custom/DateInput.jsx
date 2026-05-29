"use client";

import { useState } from "react";
import { Controller } from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

export const isRequiredLabel = (
  <span className="text-red-500">*</span>
);

function DateInput({
  control,
  name,
  label,
  isRequired = false,
  disabled = false,
  className = "",
  minDate,
  maxDate,
}) {
  const [open, setOpen] = useState(false);

  const renderPicker = (
    value,
    onChange,
    error
  ) => {
    const parsedDate = value ? new Date(value) : null;

    const isDateDisabled = (date) => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    };

    return (
      <>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-between text-left font-normal",
                error && "border-destructive",
                className
              )}
            >
              {parsedDate ? (
                format(parsedDate, "dd/MM/yyyy")
              ) : (
                <span>DD/MM/YYYY</span>
              )}

              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-auto p-0"
            align="start"
          >
            <Calendar
              mode="single"
              selected={parsedDate ?? undefined}
              disabled={isDateDisabled}
              onSelect={(date) => {
                if (date) {
                  const year = date.getFullYear();
                  const month = String(
                    date.getMonth() + 1
                  ).padStart(2, "0");
                  const day = String(
                    date.getDate()
                  ).padStart(2, "0");

                  onChange(
                    `${year}-${month}-${day}`
                  );
                } else {
                  onChange(null);
                }

                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </>
    );
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          {label && (
            <FieldLabel>
              {label}
              {isRequired && isRequiredLabel}
            </FieldLabel>
          )}

          {renderPicker(
            field.value,
            field.onChange,
            fieldState.error
          )}

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

export default DateInput;