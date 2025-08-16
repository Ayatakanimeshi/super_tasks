import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studyApi } from "../../features/study/studyApi";
import { Link } from "react-router-dom";

function genLastNDaysLabels(n: number) {
  const arr: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    arr.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
  }
  return arr;
}

export default function StudyLogsPage() {
  const qc = useQueryClient();

  const goalsQ = useQuery({
    queryKey: ["study_goals"],
    queryFn: studyApi.listGoals,
  });
  const [filters, setFilters] = useState<{
    from: string;
    to: string;
    goalId: string;
  }>({
    from: "",
    to: "",
    goalId: "",
  });

  const logsQ = useQuery({
    queryKey: ["study_logs", filters],
    queryFn: () =>
      studyApi.listLogs({
        from: filters.from || undefined,
        to: filters.to || undefined,
        study_goal_id: filters.goalId ? Number(filters.goalId) : undefined,
      }),
  });

  // ===== 単位を「分」に統一した集計 =====
  const totalMinutes = useMemo(
    () =>
      (logsQ.data ?? []).reduce(
        (sum, l) => sum + Math.round((Number(l.hours) || 0) * 60),
        0
      ),
    [logsQ.data]
  );

  // 直近7日ミニ棒グラフ（値：分）
  const miniChart = useMemo(() => {
    const labels = genLastNDaysLabels(7);
    const sumByDate: Record<string, number> = {};
    labels.forEach((k) => (sumByDate[k] = 0));
    (logsQ.data ?? []).forEach((l) => {
      const day = new Date(l.study_date).toISOString().slice(0, 10);
      if (day in sumByDate)
        sumByDate[day] += Math.round((Number(l.hours) || 0) * 60);
    });
    const values = labels.map((k) => sumByDate[k]);
    const max = Math.max(1, ...values);
    // SVG（幅 180, 高さ 60）
    const W = 180,
      H = 60,
      pad = 6;
    const bw = (W - pad * 2) / labels.length - 4;
    const bars = values.map((v, idx) => {
      const x = pad + idx * ((W - pad * 2) / labels.length) + 2;
      const h = Math.round((v / max) * (H - 2 * pad));
      const y = H - pad - h;
      return <rect key={idx} x={x} y={y} width={bw} height={h} rx="2" />;
    });
    return (
      <svg width={W} height={H} aria-label="直近7日学習時間（分）">
        <g>{bars}</g>
      </svg>
    );
  }, [logsQ.data]);

  // --- 新規ログフォーム（分で入力） ---
  const [form, setForm] = useState({
    study_goal_id: "",
    minutes: 60, // ← 分
    study_date: new Date().toISOString().slice(0, 16),
  });

  const createLog = useMutation({
    mutationFn: () =>
      studyApi.createLog({
        study_goal_id: Number(form.study_goal_id),
        // APIはhoursを受けるので、分→時間に変換
        hours: Math.max(0, Number(form.minutes)) / 60,
        study_date: new Date(form.study_date).toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["study_logs"] });
      setForm((f) => ({ ...f, minutes: 60 }));
    },
  });

  // 削除
  const deleteLog = useMutation({
    mutationFn: (id: number) => studyApi.deleteLog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["study_logs"] }),
  });

  // インライン編集（分で編集 → hoursに変換して送信）
  const updateLog = useMutation({
    mutationFn: (v: { id: number; minutes: number }) =>
      studyApi.updateLog(v.id, { hours: Math.max(0, Number(v.minutes)) / 60 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["study_logs"] }),
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMinutes, setEditMinutes] = useState<number>(60);

  // --- 目標のモーダル作成（新規登録） ---
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    name: "",
    category: "",
    description: "",
    target_hours: 10,
  });

  const createGoal = useMutation({
    mutationFn: () =>
      studyApi.createGoal({
        name: goalForm.name,
        category: goalForm.category || null,
        description: goalForm.description || null,
        target_hours: Number(goalForm.target_hours) || 0,
        completed: false,
      }),
    onSuccess: (newGoal) => {
      // 目標一覧を更新 & 直ちにセレクトを新規目標に
      qc.setQueryData(["study_goals"], (old: any) =>
        old ? [...old, newGoal] : [newGoal]
      );
      setForm((f) => ({ ...f, study_goal_id: String(newGoal.id) }));
      setShowGoalModal(false);
      setGoalForm({
        name: "",
        category: "",
        description: "",
        target_hours: 10,
      });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">勉強管理：学習ログ</h1>

      {/* 新規登録（分で入力） */}
      <section className="space-y-3">
        <h2 className="font-semibold">新規登録</h2>
        <form
          className="grid md:grid-cols-4 gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            createLog.mutate();
          }}
        >
          <div>
            <label className="block text-sm">目標</label>
            <select
              className="border rounded p-2 w-full"
              value={form.study_goal_id}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "__new__") {
                  setShowGoalModal(true);
                  return;
                }
                setForm({ ...form, study_goal_id: v });
              }}
            >
              <option value="">選択してください</option>
              {goalsQ.data?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
              <option value="__new__">＋ 新規目標を作成…</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">学習時間（分）</label>
            <input
              className="border rounded p-2 w-full"
              type="number"
              step="1"
              min="0"
              value={form.minutes}
              onChange={(e) =>
                setForm({ ...form, minutes: Number(e.target.value) })
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

      {/* フィルタ & 合計（分） & ミニグラフ（分） */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">一覧</h2>
          {/* 目標管理ページへの導線も残すと便利 */}
          <Link to="/study/goals" className="text-sm underline">
            目標を管理する（一覧・達成率）
          </Link>
        </div>
        <div className="grid md:grid-cols-6 gap-3">
          <div>
            <label className="block text-sm">From</label>
            <input
              className="border rounded p-2 w-full"
              type="date"
              value={filters.from}
              onChange={(e) =>
                setFilters((f) => ({ ...f, from: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm">To</label>
            <input
              className="border rounded p-2 w-full"
              type="date"
              value={filters.to}
              onChange={(e) =>
                setFilters((f) => ({ ...f, to: e.target.value }))
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm">目標で絞り込み</label>
            <select
              className="border rounded p-2 w-full"
              value={filters.goalId}
              onChange={(e) =>
                setFilters((f) => ({ ...f, goalId: e.target.value }))
              }
            >
              <option value="">すべて</option>
              {goalsQ.data?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col justify-end">
            <div className="text-sm">
              合計学習時間:{" "}
              <span className="font-semibold">{totalMinutes}</span> m
            </div>
          </div>
          <div className="flex items-end">{miniChart}</div>
        </div>

        <div className="space-y-2">
          {(logsQ.data ?? []).length === 0 && (
            <div className="text-sm opacity-70">ログがありません</div>
          )}
          {logsQ.data?.map((l) => {
            const goal = goalsQ.data?.find((g) => g.id === l.study_goal_id);
            const isEditing = editingId === l.id;
            const minutes = Math.round((Number(l.hours) || 0) * 60);
            return (
              <div
                key={l.id}
                className="flex items-center justify-between border rounded p-3"
              >
                <div>
                  <div className="text-sm opacity-70">
                    {new Date(l.study_date).toLocaleString()}
                  </div>
                  <div className="font-medium">
                    {goal?.name ?? "（不明な目標）"}
                  </div>
                  {isEditing ? (
                    <div className="mt-1">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        className="border rounded p-1 w-28"
                        value={editMinutes}
                        onChange={(e) => setEditMinutes(Number(e.target.value))}
                      />{" "}
                      m
                    </div>
                  ) : (
                    <div className="text-sm">学習: {minutes} m</div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Link className="underline" to={`/study/logs/${l.id}`}>
                    詳細
                  </Link>
                  {isEditing ? (
                    <>
                      <button
                        className="underline"
                        onClick={() => {
                          updateLog.mutate({ id: l.id, minutes: editMinutes });
                          setEditingId(null);
                        }}
                      >
                        保存
                      </button>
                      <button
                        className="underline opacity-70"
                        onClick={() => setEditingId(null)}
                      >
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <button
                      className="underline"
                      onClick={() => {
                        setEditingId(l.id);
                        setEditMinutes(minutes);
                      }}
                    >
                      編集
                    </button>
                  )}
                  <button
                    className="text-red-600 underline"
                    disabled={deleteLog.isPending}
                    onClick={() => {
                      if (confirm("このログを削除しますか？"))
                        deleteLog.mutate(l.id);
                    }}
                  >
                    {deleteLog.isPending ? "削除中…" : "削除"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== 目標作成モーダル ===== */}
      {showGoalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* 背景 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowGoalModal(false)}
          />
          {/* 本体（文字色修正） */}
          <div className="relative z-10 w-[92vw] max-w-lg rounded-lg bg-white p-6 shadow-lg text-gray-900">
            <h3 className="text-lg font-semibold mb-4">新規学習目標を作成</h3>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!goalForm.name.trim())
                  return alert("目標名を入力してください");
                createGoal.mutate();
              }}
            >
              <div>
                <label className="block text-sm text-gray-800">目標名</label>
                <input
                  className="border rounded p-2 w-full"
                  value={goalForm.name}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, name: e.target.value })
                  }
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-800">
                    カテゴリ（任意）
                  </label>
                  <input
                    className="border rounded p-2 w-full"
                    value={goalForm.category}
                    onChange={(e) =>
                      setGoalForm({ ...goalForm, category: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-800">
                    目標時間(h)
                  </label>
                  <input
                    className="border rounded p-2 w-full"
                    type="number"
                    min="0"
                    step="1"
                    value={goalForm.target_hours}
                    onChange={(e) =>
                      setGoalForm({
                        ...goalForm,
                        target_hours: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-800">
                  説明（任意）
                </label>
                <input
                  className="border rounded p-2 w-full"
                  value={goalForm.description}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, description: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded border"
                  onClick={() => setShowGoalModal(false)}
                >
                  キャンセル
                </button>
                <button
                  className="px-4 py-2 rounded bg-black text-white"
                  disabled={createGoal.isPending}
                >
                  {createGoal.isPending ? "作成中…" : "作成して選択"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
