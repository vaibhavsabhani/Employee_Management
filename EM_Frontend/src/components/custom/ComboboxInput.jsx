"use client";

import React, { useState } from "react";
import { Controller } from "react-hook-form";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";

import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

function ComboboxInput({
  label,
  placeholder = "Select an option",
  options,
  className,
  disabled,
  width = "w-full",
  isRequired,
  ...props
}) {
  const [open, setOpen] = useState(false);

  const isGrouped = (opt) => "options" in opt;

  const flattenedOptions = options.flatMap((opt) =>
    isGrouped(opt) ? opt.options : [opt]
  );

  const renderOptions = (
    selectedValue,
    onSelect
  ) =>
    options.map((opt) =>
      isGrouped(opt) ? (
        <CommandGroup
          heading={opt.label}
          key={opt.label}
        >
          {opt.options.map((item) => (
            <CommandItem
              key={item.value}
              value={item.value}
              keywords={[item.label]}
              onSelect={() => {
                onSelect(item.value);
                setOpen(false);
              }}
            >
              {item.label}

              <Check
                className={cn(
                  "ml-auto h-4 w-4",
                  item.value === selectedValue
                    ? "opacity-100"
                    : "opacity-0"
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      ) : (
        <CommandItem
          key={opt.value}
          value={opt.value}
          keywords={[opt.label]}
          onSelect={() => {
            onSelect(opt.value);
            setOpen(false);
          }}
        >
          {opt.label}

          <Check
            className={cn(
              "ml-auto h-4 w-4",
              opt.value === selectedValue
                ? "opacity-100"
                : "opacity-0"
            )}
          />
        </CommandItem>
      )
    );

  // RHF VERSION
  if ("control" in props) {
    const { control, name, onChange } = props;

    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <Field className={className}>
            {label && (
              <FieldLabel>
                {label}
                {isRequired && (
                  <span className="text-red-500">
                    *
                  </span>
                )}
              </FieldLabel>
            )}

            <Popover
              open={open}
              onOpenChange={setOpen}
              modal={false}
            >
              <PopoverTrigger asChild>
                <Button
                  disabled={disabled}
                  variant="outline"
                  role="combobox"
                  aria-invalid={
                    fieldState.invalid
                  }
                  className={cn(
                    width,
                    "justify-between font-light border-input hover:bg-white hover:text-black hover:border-accent",
                    field.value
                      ? "text-black"
                      : "text-muted-foreground",
                    fieldState.error &&
                      "border-destructive"
                  )}
                >
                  <span className="flex-1 truncate text-left">
                    {field.value
                      ? flattenedOptions.find(
                          (opt) =>
                            opt.value ===
                            field.value
                        )?.label
                      : placeholder}
                  </span>

                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className={cn(
                  width,
                  "p-0"
                )}
                onWheel={(e) =>
                  e.stopPropagation()
                }
                onTouchMove={(e) =>
                  e.stopPropagation()
                }
              >
                <Command>
                  <CommandInput
                    placeholder="Search..."
                    className="h-9"
                  />

                  <CommandList>
                    <CommandEmpty>
                      No option found.
                    </CommandEmpty>

                    {renderOptions(
                      field.value,
                      (val) => {
                        field.onChange(val);
                        onChange?.(val);
                      }
                    )}
                  </CommandList>
                </Command>
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
        )}
      />
    );
  }

  // STANDALONE VERSION
  const { value, onChange } = props;

  return (
    <Field className={className}>
      {label && (
        <FieldLabel>
          {label}
          {isRequired && (
            <span className="text-red-500">
              *
            </span>
          )}
        </FieldLabel>
      )}

      <Popover
        open={open}
        onOpenChange={setOpen}
        modal={false}
      >
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            variant="outline"
            role="combobox"
            className={cn(
              width,
              "justify-between font-light border-input hover:gradient-hover hover:border-accent",
              value
                ? "text-primary-text"
                : "text-muted-foreground"
            )}
          >
            <span className="flex-1 truncate text-left">
              {value
                ? flattenedOptions.find(
                    (opt) =>
                      opt.value === value
                  )?.label
                : placeholder}
            </span>

            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className={cn(width, "p-0")}
          onWheel={(e) =>
            e.stopPropagation()
          }
          onTouchMove={(e) =>
            e.stopPropagation()
          }
        >
          <Command>
            <CommandInput
              placeholder="Search..."
              className="h-9"
            />

            <CommandList>
              <CommandEmpty>
                No option found.
              </CommandEmpty>

              {renderOptions(
                value,
                onChange
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </Field>
  );
}

export default ComboboxInput;