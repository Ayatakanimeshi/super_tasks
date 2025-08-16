import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { mealApi } from "../../features/meal/mealApi";

export default function MealLogDetail() {
  const { id } = useParams();
  const logsQ = useQuery({
    queryKey: ["meal_logs_all"],
    queryFn: () => mealApi.listLogs({}),
  });
  const menusQ = useQuery({
    queryKey: ["meal_menus"],
    queryFn: mealApi.listMenus,
  });

  if (logsQ.isLoading || menusQ.isLoading)
    return <div className="p-6">Loading...</div>;
  const log = logsQ.data?.find((l) => String(l.id) === id);
  if (!log) return <div className="p-6">Not Found</div>;
  const menu = menusQ.data?.find((m) => m.id === log.meal_menu_id);
  const kcal = Math.round((menu?.calories ?? 0) * (Number(log.amount) || 0));

  return (
    <div className="p-6 space-y-4">
      <Link to="/meals" className="underline">
        ← 食事ログに戻る
      </Link>
      <h1 className="text-2xl font-bold">食事ログ 詳細</h1>
      <div className="border rounded p-4 space-y-1">
        <div>日時: {new Date(log.meal_date).toLocaleString()}</div>
        <div>
          メニュー: {menu?.name ?? "（不明）"}{" "}
          {menu?.time_category ? `— ${menu.time_category}` : ""}
        </div>
        <div>量: {log.amount} 人前</div>
        <div>推定カロリー: {kcal} kcal</div>
        <div className="text-xs opacity-60">ID: {log.id}</div>
      </div>
    </div>
  );
}
