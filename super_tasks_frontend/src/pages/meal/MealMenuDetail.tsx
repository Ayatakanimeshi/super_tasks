import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { mealApi } from "../../features/meal/mealApi";

export default function MealMenuDetail() {
  const { id } = useParams();
  const menuQ = useQuery({
    queryKey: ["meal_menu", id],
    queryFn: () => mealApi.getMenu(Number(id)),
  });
  const logsQ = useQuery({
    queryKey: ["meal_logs_all"],
    queryFn: () => mealApi.listLogs({}),
  });

  if (menuQ.isLoading) return <div className="p-6">Loading...</div>;
  if (!menuQ.data) return <div className="p-6">Not Found</div>;
  const logs =
    logsQ.data?.filter((l) => l.meal_menu_id === menuQ.data.id) ?? [];

  return (
    <div className="p-6 space-y-6">
      <Link to="/meals/menus" className="underline">
        ← メニュー一覧に戻る
      </Link>
      <h1 className="text-2xl font-bold">{menuQ.data.name}</h1>
      <div className="opacity-70 text-sm">
        {menuQ.data.time_category ?? "-"} ／ {menuQ.data.food_category ?? "-"}{" "}
        ／ {menuQ.data.calories} kcal
      </div>
      <section className="space-y-2">
        <h2 className="font-semibold">最近のログ</h2>
        {logs.length === 0 && (
          <div className="text-sm opacity-70">まだログがありません</div>
        )}
        {logs.slice(0, 30).map((l) => {
          const kcal = Math.round(
            menuQ.data.calories * (Number(l.amount) || 0)
          );
          return (
            <Link
              key={l.id}
              to={`/meals/logs/${l.id}`}
              className="block border rounded p-3"
            >
              {new Date(l.meal_date).toLocaleString()} — {l.amount}人前／{kcal}{" "}
              kcal
            </Link>
          );
        })}
      </section>
    </div>
  );
}
