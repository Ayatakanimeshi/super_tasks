import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mealApi } from "../../features/meal/mealApi";
import { Link } from "react-router-dom";

export default function MealMenusPage() {
  const qc = useQueryClient();
  const menusQ = useQuery({
    queryKey: ["meal_menus"],
    queryFn: mealApi.listMenus,
  });
  const [form, setForm] = useState({
    name: "",
    time_category: "",
    food_category: "",
    calories: 500,
  });

  const createMenu = useMutation({
    mutationFn: () =>
      mealApi.createMenu({
        name: form.name,
        time_category: form.time_category || null,
        food_category: form.food_category || null,
        calories: Number(form.calories) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meal_menus"] });
      setForm({
        name: "",
        time_category: "",
        food_category: "",
        calories: 500,
      });
    },
  });

  const deleteMenu = useMutation({
    mutationFn: (id: number) => mealApi.deleteMenu(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meal_menus"] }),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">食事メニュー</h1>

      <section className="space-y-3">
        <h2 className="font-semibold">新規メニュー</h2>
        <form
          className="grid grid-cols-1 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            createMenu.mutate();
          }}
        >
          <div>
            <label className="block text-sm">名前</label>
            <input
              className="border rounded p-2 w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm">食事区分</label>
            <select
              className="border rounded p-2 w-full"
              value={form.time_category}
              onChange={(e) =>
                setForm({ ...form, time_category: e.target.value })
              }
            >
              <option value="">（任意）</option>
              <option value="breakfast">breakfast</option>
              <option value="lunch">lunch</option>
              <option value="dinner">dinner</option>
              <option value="snack">snack</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">カテゴリ</label>
            <input
              className="border rounded p-2 w-full"
              value={form.food_category}
              onChange={(e) =>
                setForm({ ...form, food_category: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm">カロリー（kcal/1人前）</label>
            <input
              className="border rounded p-2 w-full"
              type="number"
              min="0"
              step="1"
              value={form.calories}
              onChange={(e) =>
                setForm({ ...form, calories: Number(e.target.value) })
              }
            />
          </div>
          <button className="bg-black text-white rounded px-4 py-2">
            追加
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">一覧</h2>
        <ul className="space-y-2">
          {menusQ.data?.map((m) => (
            <li
              key={m.id}
              className="border rounded p-3 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-sm opacity-70">
                  {m.time_category ?? "-"} ／ {m.food_category ?? "-"} ／{" "}
                  {m.calories} kcal
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link className="underline" to={`/meals/menus/${m.id}`}>
                  詳細
                </Link>
                <button
                  className="text-red-600 underline"
                  disabled={deleteMenu.isPending}
                  onClick={() => {
                    if (confirm("このメニューを削除しますか？"))
                      deleteMenu.mutate(m.id);
                  }}
                >
                  {deleteMenu.isPending ? "削除中…" : "削除"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
