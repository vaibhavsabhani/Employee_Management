import React from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export const PageHeader = ({
  title,
  description,
  action,
}: PageHeaderProps) => {
  return (
    <div className="flex gap-4 flex-row md:items-center justify-between" id="pageHeading">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>

        {description && (
          <p className="sm:block hidden text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="flex items-center">
          {action}
        </div>
      )}
    </div>
  );
};