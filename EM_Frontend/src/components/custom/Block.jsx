import React from "react";

const Block = ({ children, className = "", ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export default Block;