"use client";

import { Control, FieldValues, Path } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

type SelectOption = {
  label: string;
  value: string;
};

type BaseProps = {
  label?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
  description?: string;
  disabled?: boolean;
};

type FormSelectProps<T extends FieldValues> = BaseProps & {
  control: Control<T>;
  name: Path<T>;
  value?: never;
  onValueChange?: never;
};

type NormalSelectProps = BaseProps & {
  control?: never;
  name?: never;
  value?: string;
  onValueChange?: (value: string) => void;
};

type SelectFieldProps<T extends FieldValues> =
  | FormSelectProps<T>
  | NormalSelectProps;

export function SelectField<T extends FieldValues>(props: SelectFieldProps<T>) {
  const renderSelect = (value?: string, onChange?: (value: string) => void) => (
    <Select
      disabled={props.disabled}
      value={value ?? ""}
      onValueChange={onChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={props.placeholder ?? "Select an option"} />
      </SelectTrigger>

      <SelectContent>
        {props.options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if ("control" in props && props.control) {
    return (
      <FormField
        control={props.control}
        name={props.name}
        render={({ field }) => (
          <FormItem>
            {props.label && (
              <FormLabel required={props.required}>{props.label}</FormLabel>
            )}

            <FormControl>
              {renderSelect(field.value, field.onChange)}
            </FormControl>

            {props.description && (
              <FormDescription>{props.description}</FormDescription>
            )}

            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <div className="space-y-2">
      {props.label && (
        <label className="text-sm font-medium">{props.label}</label>
      )}

      {renderSelect(props.value, props.onValueChange)}

      {props.description && (
        <p className="text-sm text-muted-foreground">{props.description}</p>
      )}
    </div>
  );
}
