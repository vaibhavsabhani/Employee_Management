import { cn } from "@/src/lib/utils";
import React from "react";
import { TailSpin } from "react-loader-spinner";

const Loader = ({
  className,
  color = "var(--hyperlink-bg)", // default blue
}: {
  className?: string;
  color?: string;
}) => {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <TailSpin
        visible={true}
        height="50"
        width="50"
        color={color}
        ariaLabel="tail-spin-loading"
        radius="1"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </div>
  );
};

export default Loader;
