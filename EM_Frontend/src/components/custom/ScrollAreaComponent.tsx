"use client";

import * as React from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { cn } from "@/src/lib/utils";


const ScrollAreaComponent: React.FC<any> = ({
  children,
  style,
  type = "hover",
  size = "3",
  scrollbars = "both",
  radius = "full",
  className,
  ...props
}) => {
  return (
    <ScrollArea
      type={type}
      scrollbars={scrollbars}
      size={size}
      radius={radius}
      style={style}
      className={cn(
        "relative",
        "[&_[data-slot=scroll-area-scrollbar]]:-mr-5 ",
        "[&_[data-slot=scroll-area-scrollbar][data-orientation=horizontal]]:-mb-2",
        className
      )}
      {...props}
    >
      {children}
    </ScrollArea>
  );
};

export default ScrollAreaComponent;
