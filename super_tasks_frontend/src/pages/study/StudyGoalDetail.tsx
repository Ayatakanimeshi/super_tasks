import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studyApi } from "../../features/study/studyApi";

export default function StudyGoalDetail() {
  const { id } = useParams();
  const goalId = Number(id);
  const qc = useQueryClient();

  const goalQ = useQuery({
    queryKey: ["study_goal", id],
    queryFn: () => studyApi.getGoal(goalId),
    enabled: !!id,
  });
  const logsQ = useQuery({
    queryKey: ["study_logs_by_goal", id],
    queryFn: () => studyApi.listLogs({ study_goal_id: goalId }),
  });

  const [form, setForm] = useState({
    hours: 1.0,
    study_date: new Date().toISOString().slice(0, 16),
  });

  const createLog = useMutation({
    mutationFn: () =>
      studyApi.createLog({
        study_goal_id: goalId,
        hours: Number(form.hours),
        study_date: new Date(form.study_date).toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["study_logs_by_goal", id] });
      setForm({
        hours: 1.0,
        study_date: new Date().toISOString().slice(0, 16),
      });
    },
  });

  if (goalQ.isLoading) return <div className="p-6">Loading...</div>;
  if (!goalQ.data) return <div className="p-6">Not Found</div>;

  return (
    <div className="p-6 space-y-6">
      <Link to="/study/goals" className="underline">
        ← 目標一覧に戻る
      </Link>
      <h1 className="text-2xl font-bold">{goalQ.data.name}</h1>
      {goalQ.data.description && <div>{goalQ.data.description}</div>}
      <div className="text-sm opacity-70">
        カテゴリ: {goalQ.data.category ?? "-"} ／ 目標時間:{" "}
        {goalQ.data.target_hours ?? 0}h
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">この目標の学習ログを追加</h2>
        <form
          className="grid md:grid-cols-3 gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            createLog.mutate();
          }}
        >
          <div>
            <label className="block text-sm">学習時間(h)</label>
            <input
              className="border rounded p-2 w-full"
              type="number"
              step="0.1"
              min="0"
              value={form.hours}
              onChange={(e) =>
                setForm({ ...form, hours: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="block text-sm">日時</label>
            <input
              className="border rounded p-2 w-full"
              type="datetime-local"
              value={form.study_date}
              onChange={(e) => setForm({ ...form, study_date: e.target.value })}
            />
          </div>
          <button className="bg-black text-white rounded px-4 py-2">
            追加
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">最近のログ</h2>
        <div className="space-y-2">
          {(logsQ.data ?? []).length === 0 && (
            <div className="text-sm opacity-70">まだログがありません</div>
          )}
          {logsQ.data?.slice(0, 30).map((l) => (
            <Link
              key={l.id}
              to={`/study/logs/${l.id}`}
              className="block border rounded p-3"
            >
              {new Date(l.study_date).toLocaleString()} — {l.hours}h
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
