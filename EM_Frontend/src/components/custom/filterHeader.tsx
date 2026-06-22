"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import React from "react";

interface FilterHeaderProps {
  text?: string;
  onClick?: () => void;
  isOpen?: boolean;
}

const FilterHeader: React.FC<FilterHeaderProps> = ({
  text = "Filter",
  onClick,
  isOpen = false,
}) => {
  return (
    <div
      className=" hidden w-full mb-4 cursor-pointer items-center justify-between rounded-lg border px-4 py-2 mt-0 sm:flex max-[980px]:flex shadow-md"
      onClick={onClick}
    >
      <span className="text-[15px] font-semibold">
        {text}
      </span>
      {isOpen ? (
        <ChevronUp size={20} className="transition-transform duration-300" />
      ) : (
        <ChevronDown size={20} className="transition-transform duration-300" />
      )}
    </div>
  );
};

export default FilterHeader;
