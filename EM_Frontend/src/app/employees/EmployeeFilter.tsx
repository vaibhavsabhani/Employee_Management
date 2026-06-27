import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Mail, Search } from "lucide-react";

interface employeeFilterProps {
  draft: DraftFilters;
  setDraft: React.Dispatch<React.SetStateAction<DraftFilters>>;
  onApply: () => void;
  onReset: () => void;
  closeFilter?: () => void;
}

export interface DraftFilters {
  search: string;
  email: string;
  isActive: string;
}

const EmployeeFilter = ({
  draft,
  setDraft,
  onApply,
  onReset,
}: {
  draft: DraftFilters;
  setDraft: React.Dispatch<React.SetStateAction<DraftFilters>>;
  onApply: () => void;
  onReset: () => void;
  closeFilter?: () => void;
}) => (
  <div className="flex flex-col xl:flex-row xl:items-end gap-4 p-3 w-full">
    {/* Name search */}
    <div className="flex-1 min-w-0">
      <label className="block text-sm font-semibold mb-1.5">
        Search by Name
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="First or last name…"
          value={draft.search}
          onChange={(e) => setDraft((p) => ({ ...p, search: e.target.value }))}
          className="pl-9"
        />
      </div>
    </div>

    {/* Email search */}
    <div className="flex-1 min-w-0">
      <label className="block text-sm font-semibold mb-1.5">
        Search by Email
      </label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Email address…"
          value={draft.email}
          onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
          className="pl-9"
        />
      </div>
    </div>

    <div className="flex gap-3 shrink-0 xl:pb-0 pb-1">
      <Button
        type="button"
        onClick={onApply}
        className="h-10 px-6 bg-sidebar-primary hover:bg-violet-700 text-white"
      >
        Apply Filter
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        className="h-10 px-6"
      >
        Reset
      </Button>
    </div>
  </div>
);

export default EmployeeFilter;