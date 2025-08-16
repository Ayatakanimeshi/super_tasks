import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trainingApi } from "../../features/training/trainingApi";

export default function TrainingMenusPage() {
  const qc = useQueryClient();
  const menusQ = useQuery({
    queryKey: ["training_menus"],
    queryFn: trainingApi.listMenus,
  });
  const [form, setForm] = useState({ name: "", category: "" });

  const createMenu = useMutation({
    mutationFn: () => trainingApi.createMenu(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["training_menus"] });
      setForm({ name: "", category: "" });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">トレーニング種目（メニュー）</h1>

      <section className="space-y-3">
        <h2 className="font-semibold">新規追加</h2>
        <form
          className="grid md:grid-cols-3 gap-3 items-end"
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
            <label className="block text-sm">カテゴリ</label>
            <input
              className="border rounded p-2 w-full"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
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
                <div className="text-sm opacity-70">{m.category}</div>
              </div>
              <a className="underline" href={`/training/menus/${m.id}`}>
                詳細
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
