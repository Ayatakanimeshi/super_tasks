import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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

  const totalVolume = useMemo(() => {
    return (logsQ.data ?? []).reduce(
      (sum, l) => sum + (Number(l.weight) || 0) * (Number(l.reps) || 0),
      0
    );
  }, [logsQ.data]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editWeight, setEditWeight] = useState<number>(0);
  const [editReps, setEditReps] = useState<number>(0);

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

  const deleteLog = useMutation({
    mutationFn: (id: number) => trainingApi.deleteLog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["training_logs"] }),
  });

  const updateLog = useMutation({
    mutationFn: (vars: {
      id: number;
      payload: { weight?: number; reps?: number };
    }) => trainingApi.updateLog(vars.id, vars.payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["training_logs"] });
      setEditingId(null);
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
        <div className="text-sm opacity-70">
          合計ボリューム:{" "}
          <span className="font-semibold">{Math.round(totalVolume)}</span>
        </div>
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
          {logsQ.data?.map((l) => {
            const menuName = menusQ.data?.find(
              (m) => m.id === l.training_menu_id
            )?.name;
            const isEditing = editingId === l.id;
            return (
              <div key={l.id} className="border rounded p-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm opacity-70">
                      {new Date(l.performed_at).toLocaleString()}
                    </div>
                    {!isEditing ? (
                      <div className="font-medium">
                        {menuName} — {l.weight}kg × {l.reps}回
                      </div>
                    ) : (
                      <form
                        className="flex items-center gap-2 flex-wrap"
                        onSubmit={(e) => {
                          e.preventDefault();
                          updateLog.mutate({
                            id: l.id,
                            payload: { weight: editWeight, reps: editReps },
                          });
                        }}
                      >
                        <span className="text-sm">{menuName}</span>
                        <input
                          className="border rounded p-1 w-24"
                          type="number"
                          value={editWeight}
                          onChange={(e) =>
                            setEditWeight(Number(e.target.value))
                          }
                        />
                        <span>kg ×</span>
                        <input
                          className="border rounded p-1 w-20"
                          type="number"
                          value={editReps}
                          onChange={(e) => setEditReps(Number(e.target.value))}
                        />
                        <span>回</span>
                        <button
                          className="ml-2 px-3 py-1 rounded bg-black text-white"
                          disabled={updateLog.isPending}
                        >
                          {updateLog.isPending ? "保存中..." : "保存"}
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 rounded border"
                          onClick={() => setEditingId(null)}
                        >
                          キャンセル
                        </button>
                      </form>
                    )}
                    {l.duration_minutes ? (
                      <div className="text-sm">
                        所要: {l.duration_minutes}分
                      </div>
                    ) : null}
                  </div>
                  <div className="flex gap-4 shrink-0">
                    {!isEditing ? (
                      <>
                        <Link
                          className="underline"
                          to={`/training/logs/${l.id}`}
                        >
                          詳細
                        </Link>
                        <button
                          className="underline"
                          onClick={() => {
                            setEditingId(l.id);
                            setEditWeight(l.weight);
                            setEditReps(l.reps);
                          }}
                        >
                          編集
                        </button>
                        <button
                          className="text-red-600 underline"
                          disabled={deleteLog.isPending}
                          onClick={() => {
                            if (confirm("このログを削除しますか？"))
                              deleteLog.mutate(l.id);
                          }}
                        >
                          {deleteLog.isPending ? "削除中..." : "削除"}
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
          {logsQ.data && logsQ.data.length === 0 && (
            <div className="text-sm text-gray-500">ログがありません</div>
          )}
        </div>
      </section>
    </div>
  );
}
