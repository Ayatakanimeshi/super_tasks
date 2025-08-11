import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await api.get("/api/health_check");
      return response.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">error</div>;
  return (
    <div className="rounded-xl p-4 bg-gray-100">
      <div className="font-bold mb-2">health:</div>
      <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
