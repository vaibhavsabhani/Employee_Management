"use client";

import { useEffect, useState, useCallback } from "react";

function usePaginatedQuery(
  fetchDataFn,
  {
    defaultFilters = {},
    defaultLimit = 10,
    transformResponse = (res) => ({
      data: res?.data?.items || [],
      total: res?.data?.total || 0,
    }),
    enabled = true,
    mode = "pagination",
  } = {}
) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchDataFn({
        page,
        limit,
        ...filters,
      });

      const transformed =
        transformResponse(response);

      setData((prev) =>
        mode === "infinite" && page > 1
          ? [...prev, ...transformed.data]
          : transformed.data
      );

      setTotal(transformed.total);
    } catch (err) {
      setError(
        err?.message || "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    filters,
    fetchDataFn,
    transformResponse,
    mode,
  ]);

  useEffect(() => {
    if (!enabled) return;

    fetchData();
  }, [fetchData, enabled]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));

    setPage(1);

    if (mode === "infinite") {
      setData([]);
    }
  };

  const totalPages = Math.ceil(
    total / limit
  );

  const canNext = page * limit < total;
  const canPrev = page > 1;

  const nextPage = () => {
    if (canNext) {
      setPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (canPrev) {
      setPage((prev) => prev - 1);
    }
  };

  const setPageLimit = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const resetLimit = useCallback(() => {
    setLimit(defaultLimit);
  }, [defaultLimit]);

  const hasMoreData =
    page * limit < total;

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