import React from "react";
import { Input } from "@/components/ui/input";

export default function SearchFilter({
  value,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
