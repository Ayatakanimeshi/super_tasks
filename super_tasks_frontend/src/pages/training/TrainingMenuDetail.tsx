import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { trainingApi } from "../../features/training/trainingApi";

export default function TrainingMenuDetail() {
  const { id } = useParams();
  const menuQ = useQuery({
    queryKey: ["training_menu", id],
    queryFn: () => trainingApi.getMenu(Number(id)),
  });

  const logsQ = useQuery({
    queryKey: ["training_logs_by_menu", id],
    queryFn: () => trainingApi.listLogs(),
    enabled: !!id,
  });

  const logs = logsQ.data?.filter((l) => String(l.training_menu_id) === id);

  if (menuQ.isLoading) return <div className="p-6">Loading...</div>;
  if (!menuQ.data) return <div className="p-6">Not Found</div>;

  return (
    <div className="p-6 space-y-6">
      <Link to="/training/menus" className="underline">
        ← 戻る
      </Link>
      <h1 className="text-2xl font-bold">{menuQ.data.name}</h1>
      <div className="text-sm opacity-70">カテゴリ: {menuQ.data.category}</div>
      <section className="space-y-2">
        <h2 className="font-semibold">最近のログ</h2>
        {logs?.slice(0, 20).map((l) => (
          <Link
            key={l.id}
            to={`/training/logs/${l.id}`}
            className="block border rounded p-3"
          >
            {new Date(l.performed_at).toLocaleString()} — {l.weight}kg ×{" "}
            {l.reps}回
          </Link>
        ))}
        {(!logs || logs.length === 0) && (
          <div className="text-sm">まだログがありません</div>
        )}
      </section>
    </div>
  );
}
