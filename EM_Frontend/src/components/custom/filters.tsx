"use client";

import React, { useState } from "react";
import FilterHeader from "./filterHeader";

interface PageProps {
  children: React.ReactNode;
}

const Filter: React.FC<PageProps> = ({ children }) => {
  const [open, setOpen] = useState(false);

  const closeFilter = () => setOpen(false);

  return (
    <div id="Filter">
      <div className="xl:hidden flex">
        <FilterHeader
          text="Filter"
          isOpen={open}
          onClick={() => setOpen((prev) => !prev)}
        />
      </div>
      <div
        className={` ${
          open ? "block" : "hidden"
        } xl:block  w-full bg-primary-background backdrop-blur-background flex flex-col mb-[30px] justify-between items-center p-[4px] glass-card rounded`}
      >
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<any>, { closeFilter })
            : child
        )}
      </div>
    </div>
  );
};

export default Filter;
