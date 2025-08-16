import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trainingApi } from "../../features/training/trainingApi";

export default function TrainingLogsPage() {
  const qc = useQueryClient();
  const menusQ = useQuery({
    queryKey: ["training_menus"],
    queryFn: trainingApi.listMenus,
  });
  const [range, setRange] = useState({ from: "", to: "" });
  const logsQ = useQuery({
    queryKey: ["training_logs", range],
    queryFn: () => trainingApi.listLogs({ ...range }),
  });

  const [form, setForm] = useState({
    training_menu_id: "",
    weight: 60,
    reps: 8,
    performed_at: new Date().toISOString().slice(0, 16),
    duration_minutes: 40,
  });

  const createLog = useMutation({
    mutationFn: () =>
      trainingApi.createLog({
        training_menu_id: Number(form.training_menu_id),
        weight: Number(form.weight),
        reps: Number(form.reps),
        performed_at: new Date(form.performed_at).toISOString(),
        duration_minutes: Number(form.duration_minutes) || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["training_logs"] });
      setForm((f) => ({ ...f, weight: 60, reps: 8 }));
    },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">ジム管理：トレーニングログ</h1>

      <section className="space-y-3">
        <h2 className="font-semibold">新規登録</h2>
        <form
          className="grid md:grid-cols-5 gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            createLog.mutate();
          }}
        >
          <div>
            <label className="block text-sm">種目</label>
            <select
              className="border rounded p-2 w-full"
              value={form.training_menu_id}
              onChange={(e) =>
                setForm({ ...form, training_menu_id: e.target.value })
              }
            >
              <option value="">選択してください</option>
              {menusQ.data?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm">重量(kg)</label>
            <input
              className="border rounded p-2 w-full"
              type="number"
              value={form.weight}
              onChange={(e) =>
                setForm({ ...form, weight: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="block text-sm">回数(reps)</label>
            <input
              className="border rounded p-2 w-full"
              type="number"
              value={form.reps}
              onChange={(e) =>
                setForm({ ...form, reps: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="block text-sm">日時</label>
            <input
              className="border rounded p-2 w-full"
              type="datetime-local"
              value={form.performed_at}
              onChange={(e) =>
                setForm({ ...form, performed_at: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm">所要(分)</label>
            <input
              className="border rounded p-2 w-full"
              type="number"
              value={form.duration_minutes}
              onChange={(e) =>
                setForm({ ...form, duration_minutes: Number(e.target.value) })
              }
            />
          </div>
          <button className="bg-black text-white rounded px-4 py-2 md:col-span-1">
            追加
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">一覧</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm">From</label>
            <input
              className="border rounded p-2 w-full"
              type="date"
              value={range.from}
              onChange={(e) =>
                setRange((r) => ({ ...r, from: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm">To</label>
            <input
              className="border rounded p-2 w-full"
              type="date"
              value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            />
          </div>
        </div>
        <div className="space-y-2">
          {logsQ.data?.map((l) => (
            <a
              key={l.id}
              href={`/training/logs/${l.id}`}
              className="block border rounded p-3"
            >
              <div className="text-sm opacity-70">
                {new Date(l.performed_at).toLocaleString()}
              </div>
              <div className="font-medium">
                {menusQ.data?.find((m) => m.id === l.training_menu_id)?.name} —{" "}
                {l.weight}kg × {l.reps}回
              </div>
              {l.duration_minutes ? (
                <div className="text-sm">所要: {l.duration_minutes}分</div>
              ) : null}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
