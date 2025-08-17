import type { UseQueryResult } from "@tanstack/react-query";

export function useQueryStatus<T>(q: UseQueryResult<T>) {
  return {
    isLoading: q.isLoading,
    isError: q.isError,
    isEmpty:
      !q.isLoading &&
      !q.isError &&
      (Array.isArray(q.data) ? q.data.length === 0 : !q.data),
  };
}
