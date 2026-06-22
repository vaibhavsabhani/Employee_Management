"use client";
// hooks/usePaginatedQuery.ts
import { useEffect, useState, useCallback } from "react";

interface UsePaginatedQueryOptions<T> {
  defaultFilters?: Record<string, any>;
  defaultLimit?: number;
  transformResponse?: (response: any) => { data: T[]; total: number };
  enabled?: boolean;
  mode?: "pagination" | "infinite";
}

function usePaginatedQuery<T>(
  fetchDataFn: (args: any) => Promise<any>,
  {
    defaultFilters = {},
    defaultLimit = 10,
    transformResponse = (res) => ({
      data: res?.data?.items || [],
      total: res?.data?.total || 0,
    }),
    enabled = true,
    mode = "pagination",
  }: UsePaginatedQueryOptions<T> = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchDataFn({ page, limit, ...filters });
      const transformed = transformResponse(response);

      setData((prev) =>
        mode === "infinite" && page > 1
          ? [...prev, ...transformed.data]
          : transformed.data
      );
      setTotal(transformed.total);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters, fetchDataFn, transformResponse]);

  useEffect(() => {
    if (!enabled) return;
    fetchData();
  }, [fetchData]);

  const updateFilters = (newFilters: Record<string, any>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
    if (mode === "infinite") {
      setData([]);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const canNext = page * limit < total;
  const canPrev = page > 1;

  const nextPage = () => {
    if (canNext) setPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (canPrev) setPage((prev) => prev - 1);
  };

  const setPageLimit = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const resetLimit = useCallback(() => {
    setLimit(defaultLimit);
    setPage(1);
  }, [defaultLimit]);

  const hasMoreData = page * limit < total;

  return {
    data,
    total,
    totalPages,
    page,
    limit,
    filters,
    loading,
    error,
    setPage,
    setLimit: setPageLimit,
    updateFilters,
    nextPage,
    prevPage,
    canNext,
    canPrev,
    refetch: fetchData,
    hasMoreData,
    resetLimit,
  };
}

export default usePaginatedQuery;
