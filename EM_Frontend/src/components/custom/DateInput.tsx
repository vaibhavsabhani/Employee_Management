  "use client";


import { useState } from "react";
  import { Control, FieldValues, Path } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
  import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { cn } from "@/src/lib/utils";

  type CommonProps = {
    label?: string;
    isRequired?: boolean;
    disabled?: boolean;
    className?: string;
    minDate?: Date;
    maxDate?: Date;
  };

  type ControlledProps<T extends FieldValues> = CommonProps & {
    control: Control<T>;
    name: Path<T>;
    value?: never;
    onChange?: never;
  };

  type UncontrolledProps = CommonProps & {
    value: Date | string | null;
    onChange: (date: string | null) => void;
    control?: never;
    name?: never;
  };

  type DateInputProps<T extends FieldValues = FieldValues> =
    | ControlledProps<T>
    | UncontrolledProps;

  const DateInput = <T extends FieldValues = FieldValues>(
    props: DateInputProps<T>,
  ) => {
    const [open, setOpen] = useState(false);

    const renderDateInput = (
      value: string | null,
      onChange: (date: string | null) => void,
      error?: string,
    ) => {
      const parsedDate = value ? new Date(value) : null;

      // Create disabled function for dates outside min/max range
      const isDateDisabled = (date: Date) => {
        if (props.minDate) {
          // Reset time to start of day for accurate date comparison
          const dateToCheck = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
          );
          const minDateToCheck = new Date(
            props.minDate.getFullYear(),
            props.minDate.getMonth(),
            props.minDate.getDate(),
          );
          if (dateToCheck < minDateToCheck) {
            return true;
          }
        }
        if (props.maxDate) {
          // Reset time to start of day for accurate date comparison
          const dateToCheck = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
          );
          const maxDateToCheck = new Date(
            props.maxDate.getFullYear(),
            props.maxDate.getMonth(),
            props.maxDate.getDate(),
          );
          if (dateToCheck > maxDateToCheck) {
            return true;
          }
        }
        return false;
      };

      return (
        <div className="flex flex-col gap-1 relative">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                type="button"
                disabled={props.disabled}
                onClick={() => setOpen(!open)}
                className={cn(
                  "w-full h-10 pl-3 text-left font-normal rounded-md flex items-center justify-between bg-transparent text-muted-foreground",
                  parsedDate && "",
                  error ? "border-red-500 focus:ring-red-500" : "border-input",
                  props.className,
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
              className="w-auto p-0 z-50"
              align="start"
              sideOffset={5}
            >
              <Calendar
                mode="single"
                selected={parsedDate ?? undefined}
                onSelect={(date) => {
                  if (date) {
                    // Format date as YYYY-MM-DD in local timezone
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    const localDateString = `${year}-${month}-${day}`;
                    const ISODate = new Date(localDateString).toISOString();
                    onChange(ISODate);
                  } else {
                    onChange(null);
                  }
                  setOpen(false);
                }}
                disabled={isDateDisabled}
                className="rounded-md glass-card"
              />
            </PopoverContent>
          </Popover>
          {error && <FormMessage className="text-red-500">{error}</FormMessage>}
        </div>
      );
    };

    if ("control" in props && props.control && props.name) {
      const { control, name, label, isRequired } = props;

      return (
        <FormField
          control={control}
          name={name}
          render={({ field, fieldState }) => (
            <FormItem>
              {label && (
                <FormLabel htmlFor={field.name}>
                  {label} {isRequired && <span className="text-red-500">*</span>}
                </FormLabel>
              )}
              <FormControl>
                {renderDateInput(
                  field.value,
                  field.onChange,
                  fieldState.error?.message,
                )}
              </FormControl>
            </FormItem>
          )}
        />
      );
    }

    // Standalone usage
    const { value, onChange, label, isRequired } = props;

    // Convert Date to string if needed
    const stringValue = value instanceof Date ? value.toISOString() : value;

    return (
      <div className="max-[450px]:w-full flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-primary-text">
            {label} {isRequired && <span className="text-red-500">*</span>}
          </label>
        )}
        {renderDateInput(stringValue ?? null, onChange!)}
      </div>
    );
  };

  export default DateInput;
