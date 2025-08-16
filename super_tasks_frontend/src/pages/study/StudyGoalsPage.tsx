import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studyApi } from "../../features/study/studyApi";
import type { StudyGoal, StudyLog } from "../../features/study/studyApi";
import { Link } from "react-router-dom";

function calcHours(logs: StudyLog[], goalId: number, days?: number) {
  const now = Date.now();
  const fromTs = days ? now - days * 24 * 60 * 60 * 1000 : null;
  return logs
    .filter(
      (l) =>
        l.study_goal_id === goalId &&
        (!fromTs || new Date(l.study_date).getTime() >= fromTs)
    )
    .reduce((s, l) => s + (Number(l.hours) || 0), 0);
}

export default function StudyGoalsPage() {
  const qc = useQueryClient();
  const goalsQ = useQuery({
    queryKey: ["study_goals"],
    queryFn: studyApi.listGoals,
  });
  const logsQ = useQuery({
    queryKey: ["study_logs_for_goals"],
    queryFn: () => studyApi.listLogs({}),
  });

  const [form, setForm] = useState<
    Pick<StudyGoal, "name" | "description" | "category" | "target_hours">
  >({
    name: "",
    description: "",
    category: "",
    target_hours: 10,
  });

  const createGoal = useMutation({
    mutationFn: () => studyApi.createGoal({ ...form, completed: false }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["study_goals"] });
      setForm({ name: "", description: "", category: "", target_hours: 10 });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: (id: number) => studyApi.deleteGoal(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["study_goals"] }),
  });

  const progressMap = useMemo(() => {
    const map: Record<number, { h30: number; h90: number; hall: number }> = {};
    const logs = logsQ.data ?? [];
    (goalsQ.data ?? []).forEach((g) => {
      map[g.id] = {
        h30: calcHours(logs, g.id, 30),
        h90: calcHours(logs, g.id, 90),
        hall: calcHours(logs, g.id, undefined),
      };
    });
    return map;
  }, [goalsQ.data, logsQ.data]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">勉強管理：学習目標</h1>

      {/* 新規追加 */}
      <section className="space-y-3">
        <h2 className="font-semibold">新規目標</h2>
        <form
          className="grid md:grid-cols-5 gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            createGoal.mutate();
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
              value={form.category ?? ""}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm">目標時間(h)</label>
            <input
              className="border rounded p-2 w-full"
              type="number"
              min="0"
              step="1"
              value={form.target_hours ?? 0}
              onChange={(e) =>
                setForm({ ...form, target_hours: Number(e.target.value) })
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm">説明</label>
            <input
              className="border rounded p-2 w-full"
              value={form.description ?? ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <button className="bg-black text-white rounded px-4 py-2">
            追加
          </button>
        </form>
      </section>

      {/* 一覧 */}
      <section className="space-y-3">
        <h2 className="font-semibold">一覧</h2>
        <div className="space-y-2">
          {(goalsQ.data ?? []).length === 0 && (
            <div className="text-sm opacity-70">目標がありません</div>
          )}

          {goalsQ.data?.map((g) => {
            const p = progressMap[g.id] ?? { h30: 0, h90: 0, hall: 0 };
            const target = g.target_hours ?? 0;
            const rate =
              target > 0
                ? Math.min(100, Math.round((p.hall / target) * 100))
                : 0;

            return (
              <div key={g.id} className="border rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {g.name}{" "}
                      {g.completed && (
                        <span className="text-xs ml-2 px-2 py-0.5 border rounded">
                          完了
                        </span>
                      )}
                    </div>
                    <div className="text-sm opacity-70">
                      {g.category ?? "-"} ／ 目標: {target}h
                    </div>
                    {g.description && (
                      <div className="text-sm">{g.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Link className="underline" to={`/study/goals/${g.id}`}>
                      詳細
                    </Link>
                    <button
                      className="text-red-600 underline"
                      disabled={deleteGoal.isPending}
                      onClick={() => {
                        if (confirm("この目標を削除しますか？"))
                          deleteGoal.mutate(g.id);
                      }}
                    >
                      {deleteGoal.isPending ? "削除中…" : "削除"}
                    </button>
                  </div>
                </div>
                {/* 進捗バー */}
                <div className="space-y-1">
                  <div className="h-2 bg-gray-200 rounded overflow-hidden">
                    <div
                      className="h-2 bg-black"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <div className="text-xs opacity-70">
                    累計: {Math.round((p.hall + Number.EPSILON) * 10) / 10}
                    h（30日: {p.h30.toFixed(1)}h / 90日: {p.h90.toFixed(1)}
                    h）達成率: {rate}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
