import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studyApi } from "../../features/study/studyApi";
import SelectWithCreate from "../../components/form/SelectWithCreate";
import FormField from "../../components/form/FormField";

export default function StudyLogsPage() {
  const qc = useQueryClient();

  const goalsQ = useQuery({
    queryKey: ["study_goals"],
    queryFn: studyApi.listGoals,
  });
  const [range, setRange] = useState({ from: "", to: "" });
  const logsQ = useQuery({
    queryKey: ["study_logs", range],
    queryFn: () => studyApi.listLogs({ ...range }),
  });

  const [form, setForm] = useState<{
    study_goal_id: string | number | "";
    hours: number;
    study_date: string; // yyyy-MM-ddTHH:mm
  }>({
    study_goal_id: "",
    hours: 1,
    study_date: new Date().toISOString().slice(0, 16),
  });

  const createLog = useMutation({
    mutationFn: () =>
      studyApi.createLog({
        study_goal_id: Number(form.study_goal_id),
        hours: Number(form.hours),
        study_date: new Date(form.study_date).toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["study_logs"] });
      setForm((f) => ({ ...f, hours: 1 }));
    },
    onError: () => alert("登録に失敗しました"),
  });

  const deleteLog = useMutation({
    mutationFn: (id: number) => studyApi.deleteLog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["study_logs"] }),
    onError: () => alert("削除に失敗しました"),
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">勉強管理：学習ログ</h1>

      {/* 新規登録 */}
      <section className="space-y-3 border rounded p-4">
        <h2 className="font-semibold">新規登録</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.study_goal_id) return alert("目標を選択してください");
            createLog.mutate();
          }}
        >
          <FormField label="目標" required className="md:col-span-2">
            <SelectWithCreate
              value={form.study_goal_id ?? ""}
              options={(goalsQ.data ?? []).map((g) => ({
                value: String(g.id),
                label: g.name,
              }))}
              onChange={(v) => setForm((f) => ({ ...f, study_goal_id: v }))}
              onCreate={async (payload) => {
                const created = await studyApi.createGoal({
                  name: payload.name,
                  category: payload.category || "",
                  description: payload.description || "",
                  target_hours: 0,
                  completed: false,
                });
                qc.setQueryData(["study_goals"], (old: any) =>
                  old ? [...old, created] : [created]
                );
                qc.invalidateQueries({ queryKey: ["study_goals"] });
                return { value: String(created.id), label: created.name };
              }}
              createFields={[
                { name: "name", label: "目標名", required: true },
                { name: "category", label: "カテゴリ" },
                { name: "description", label: "説明", type: "textarea" },
              ]}
            />
          </FormField>

          <FormField label="学習時間(h)" required>
            <input
              className="border rounded p-3 w-full"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={form.hours}
              onChange={(e) =>
                setForm((f) => ({ ...f, hours: Number(e.target.value) }))
              }
            />
          </FormField>

          <FormField label="日時" required>
            <input
              className="border rounded p-3 w-full"
              type="datetime-local"
              value={form.study_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, study_date: e.target.value }))
              }
            />
          </FormField>

          <button
            className="bg-black text-white rounded px-4 py-3 active:opacity-80"
            type="submit"
          >
            追加
          </button>
        </form>
      </section>

      {/* 一覧 */}
      <section className="space-y-3 border rounded p-4">
        <h2 className="font-semibold">一覧</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">From</label>
            <input
              className="border rounded p-3 w-full"
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
              className="border rounded p-3 w-full"
              type="date"
              value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          {logsQ.data?.map((l) => {
            const g = goalsQ.data?.find((x) => x.id === l.study_goal_id);
            return (
              <div
                key={l.id}
                className="border rounded p-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm opacity-70">
                    {new Date(l.study_date).toLocaleString()}
                  </div>
                  <div className="font-medium truncate">
                    {g?.name ?? "目標"} — {l.hours} h
                  </div>
                </div>
                <button
                  className="text-red-600 underline px-2 py-1"
                  onClick={() => {
                    if (confirm("このログを削除しますか？"))
                      deleteLog.mutate(l.id);
                  }}
                >
                  削除
                </button>
              </div>
            );
          })}
          {!logsQ.data?.length && (
            <div className="text-sm opacity-70">ログがありません</div>
          )}
        </div>
      </section>
    </div>
  );
}
