"use client";

type FilterTab<T = string | boolean | number> = {
  label: string;
  value: T;
};

interface FilterTabsProps<T = string | boolean | number> {
  tabs: FilterTab<T>[];
  activeValue: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterTabs<T extends string | boolean | number>({
  tabs,
  activeValue,
  onChange,
  className = "",
}: FilterTabsProps<T>) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`} id="FilterTabs">
      {tabs.map((tab) => (
        <button
          key={String(tab.value)}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            activeValue === tab.value
              ? "bg-sidebar-primary text-white border-sidebar-primary"
              : "bg-pill-bg text-pill-fg border-pill-ring hover:border-violet-400 hover:text-violet-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}