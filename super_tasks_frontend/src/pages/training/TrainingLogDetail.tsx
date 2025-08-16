import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { trainingApi } from "../../features/training/trainingApi";

export default function TrainingLogDetail() {
  const { id } = useParams();
  const logQ = useQuery({
    queryKey: ["training_log", id],
    queryFn: () => trainingApi.getLog(Number(id)),
    enabled: !!id,
  });
  const menusQ = useQuery({
    queryKey: ["training_menus"],
    queryFn: trainingApi.listMenus,
  });

  if (logQ.isLoading || menusQ.isLoading)
    return <div className="p-6">Loading...</div>;
  const log = logQ.data;
  if (!log) return <div className="p-6">Not Found</div>;
  const menu = menusQ.data?.find((m) => m.id === log.training_menu_id);

  return (
    <div className="p-6 space-y-4">
      <Link to="/training" className="underline">
        ← ログ一覧に戻る
      </Link>
      <h1 className="text-2xl font-bold">トレーニングログ 詳細</h1>
      <div className="border rounded p-4 space-y-1">
        <div>日時: {new Date(log.performed_at).toLocaleString()}</div>
        <div>
          種目: {menu?.name}（{menu?.category}）
        </div>
        <div>重量: {log.weight} kg</div>
        <div>回数: {log.reps} 回</div>
        {log.duration_minutes ? (
          <div>所要: {log.duration_minutes} 分</div>
        ) : null}
        <div className="text-xs opacity-60">ID: {log.id}</div>
      </div>
    </div>
  );
}
