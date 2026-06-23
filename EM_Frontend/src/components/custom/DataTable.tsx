"use client";

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { SelectField } from "../form/SelectField";
import useDynamicHeight from "@/src/hooks/useDynamicHeight";
import { Loader } from "lucide-react";
import ScrollAreaComponent from "./ScrollAreaComponent";


interface DataTableProps<TData = unknown, TValue = unknown> {
  columns?: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  hidePagination?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  canNext?: boolean;
  canPrev?: boolean;
  page?: number;
  total?: number;
  totalRecords?: number;
  maxHeight?: string;
  showExtraHeader?: string[];
  showAllRows?: boolean;
  className?: string;
  limit?: number;
  setLimit?: (limit: number) => void;
  limitOptions?: number[];
  hideDataTable?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  onNext,
  onPrev,
  canNext,
  canPrev,
  page,
  hidePagination = false,
  total,
  totalRecords,
  maxHeight,
  showExtraHeader,
  showAllRows = false,
  className,
  limit,
  setLimit,
  limitOptions = [10, 20, 30, 40, 50, 100],
  hideDataTable = true,
}: DataTableProps<TData, TValue>) {
  const currentPage = page ?? 1;
  const totalPages = total ?? 1;
  const effectiveLimit = limit ?? 10;

  const displayData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return hidePagination && !showAllRows
      ? data.slice(0, effectiveLimit)
      : data;
  }, [data, hidePagination, showAllRows, effectiveLimit]);

  const table = useReactTable({
    data: displayData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const measuredElements = ["header", "Filter", "hidePagination"];
  if (showExtraHeader) measuredElements.push(showExtraHeader);

  const totalOffset = useDynamicHeight(measuredElements, 100);
  const finalHeight = maxHeight || `calc(100vh - ${totalOffset}px)`;

  const PAGE_WINDOW = 5;

  const startPage = Math.max(1, currentPage - Math.floor(PAGE_WINDOW / 2));

  const endPage = Math.min(totalPages, startPage + PAGE_WINDOW - 1);

  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  );

  const jumpToPage = (targetPage: number) => {
    if (!onNext || !onPrev || targetPage === currentPage) return;

    const diff = targetPage - currentPage;

    if (diff > 0) {
      for (let i = 0; i < diff; i++) onNext();
    } else {
      for (let i = 0; i < Math.abs(diff); i++) onPrev();
    }
  };

  const limitSelectOptions = limitOptions.map((opt) => ({
    name: String(opt),
    value: String(opt),
  }));

  return loading ? (
    <Loader />
  ) : (
    <div>
      {hideDataTable ? (
        <ScrollAreaComponent
          style={{
            height:
              typeof window !== "undefined" && window.innerWidth >= 1024
                ? finalHeight
                : "auto",
          }}
        >
          <div className={`px-2 py-3 ${className}`}>
            {displayData.length > 0 ? (
              <div className="rounded outline-8">
                <Table>
                  <TableHeader className="rounded!">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow
                        key={headerGroup.id}
                        className="bg-sidebar-primary text-heading font-primary"
                      >
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead
                              key={header.id}
                              className="first:rounded-tl-md last:rounded-tr-md text-left p-4 text-white font-extrabold"
                              style={{
                                width: header.getSize(),
                                minWidth: header.column.columnDef.minSize,
                                maxWidth: header.column.columnDef.maxSize,
                              }}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {!loading ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className="p-4 first:rounded-bl-md last:rounded-br-md "
                              style={{
                                width: cell.column.getSize(),
                                minWidth: cell.column.columnDef.minSize,
                                maxWidth: cell.column.columnDef.maxSize,
                              }}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <>
                <p className="w-full flex justify-center ">No Data Found</p>
              </>
            )}
          </div>
        </ScrollAreaComponent>
      ) : null}

      {hidePagination ? null : (
        <div
          className="flex max-[570px]:flex-col min-[1033px]:flex-row flex-col min-[1033px]:gap-0 gap-3 items-center justify-between px-2 pt-4"
          id="hidePagination"
        >
          {/* LEFT */}
          {setLimit && displayData.length > 0 && totalRecords > 9 && (
            <div className="flex items-center gap-2">
              <SelectField
                name="limit"
                placeholder="Rows"
                value={String(limit ?? "")}
                options={limitSelectOptions}
                onChange={(val) => setLimit?.(Number    (val))}
              />

              <span className="text-sm  ">Records Per Page</span>
            </div>
          )}

          {/* CENTER */}
          <span className="text-sm ">Total Records : {totalRecords ?? 0}</span>

          {/* RIGHT */}
          {displayData.length > 0 && totalRecords > 9 && (
            <>
              <div className="flex items-center gap-1">
                <button
                  onClick={onPrev}
                  disabled={!canPrev}
                  className={`px-2 py-1 text-sm disabled:opacity-50 font-semibold hover:underline ${!canPrev ? "" : "cursor-pointer"}`}
                >
                  Prev
                </button>

                {visiblePages.map((p) => (
                  <button
                    key={p}
                    onClick={() => jumpToPage(p)}
                    className={`px-3 py-1 border-blue-400 text-sm rounded cursor-pointer ${
                      p === currentPage ? "text-white " : "border"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={onNext}
                  disabled={!canNext}
                  className={`px-2 py-1 text-sm disabled:opacity-50 font-semibold hover:underline ${!canNext ? "" : "cursor-pointer"}`}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
