import { useQueryClient } from "@tanstack/react-query";

export function useInvalidate() {
  const qc = useQueryClient();
  return (key: readonly unknown[] | { queryKey: readonly unknown[] }) =>
    qc.invalidateQueries(
      Array.isArray(key as any) ? { queryKey: key as any } : (key as any)
    );
}
