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
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" id="pageHeading">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>

        {description && (
          <p className="text-muted-foreground">
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