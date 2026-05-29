import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({
  hidePagination = false,
  // primary pagination props (compatible with DataTable usage)
  page = 1,
  limit = 10,
  total = 0,
  totalPages = 1,
  onPageChange = () => {},
  onLimitChange = () => {},

  // optional props to match your snippet
  displayData = [],
  limitSelectOptions = [5, 10, 20, 50],
  className = "",
}) {
  if (hidePagination) return null;

  const totalRecords = typeof total === 'number' ? total : 0;
  const displayLen = Array.isArray(displayData) ? displayData.length : 0;

  const canPrev = page > 1;
  const canNext = page < (totalPages || Math.ceil(totalRecords / (limit || 1)));

  const onPrev = () => {
    if (canPrev) onPageChange(page - 1);
  };

  const onNext = () => {
    if (canNext) onPageChange(page + 1);
  };

  // compute visible pages (current ±2)
  const makeVisiblePages = () => {
    const pages = [];
    const maxPages = totalPages || Math.ceil(totalRecords / (limit || 1)) || 1;
    const start = Math.max(1, page - 2);
    const end = Math.min(maxPages, page + 2);

    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  };

  const visiblePages = makeVisiblePages();

  const jumpToPage = (p) => {
    if (p >= 1 && p <= (totalPages || Math.ceil(totalRecords / (limit || 1)) || 1)) {
      onPageChange(p);
    }
  };

  const startRecord = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalRecords);

  return (
    <div
      className={`flex max-[570px]:flex-col min-[1033px]:flex-row flex-col min-[1033px]:gap-0 gap-3 items-center justify-between px-2 pt-4 ${className}`}
      id="hidePagination"
    >
      {/* LEFT */}
      <div>
        <div className="text-sm text-slate-500">Showing {startRecord}-{endRecord} of {totalRecords} employees</div>
      </div>

      {/* CENTER - page buttons */}
      {displayLen > 0 && totalRecords > 9 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => jumpToPage(Math.max(1, page - 1))}
            disabled={!canPrev}
            className="p-2 rounded border bg-white disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {visiblePages.map((p) => (
            <button
              key={p}
              onClick={() => jumpToPage(p)}
              className={`px-3 py-1 rounded ${p === page ? 'bg-indigo-600 text-white' : 'border bg-white text-slate-700'}`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => jumpToPage(Math.min(totalPages || Math.ceil(totalRecords / (limit || 1)), page + 1))}
            disabled={!canNext}
            className="p-2 rounded border bg-white disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* RIGHT - limit selector */}
      {onLimitChange && displayLen > 0 && totalRecords > 9 && (
        <div className="flex items-center gap-2">
          <select
            value={String(limit ?? '')}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="h-8 border rounded px-2 bg-white"
          >
            {limitSelectOptions.map((opt) => {
              if (typeof opt === 'object') {
                return (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                );
              }

              return (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              );
            })}
          </select>

          <span className="text-sm">Rows</span>
        </div>
      )}
    </div>
  )
}
