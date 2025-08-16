import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mealApi } from "../../features/meal/mealApi";
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

export default function MealLogsPage() {
  const qc = useQueryClient();

  const menusQ = useQuery({
    queryKey: ["meal_menus"],
    queryFn: mealApi.listMenus,
  });

  const [filters, setFilters] = useState<{
    from: string;
    to: string;
    menuId: string;
    timeCat: string;
  }>({
    from: "",
    to: "",
    menuId: "",
    timeCat: "",
  });

  const logsQ = useQuery({
    queryKey: ["meal_logs", filters],
    queryFn: () =>
      mealApi.listLogs({
        from: filters.from || undefined,
        to: filters.to || undefined,
        meal_menu_id: filters.menuId ? Number(filters.menuId) : undefined,
        time_category: filters.timeCat || undefined,
      }),
  });

  // 合計カロリー（メニュー kcal × 量）
  const totalKcal = useMemo(() => {
    const menus = menusQ.data ?? [];
    return (logsQ.data ?? []).reduce((sum, l) => {
      const m = menus.find((mm) => mm.id === l.meal_menu_id);
      const kcal = (m?.calories ?? 0) * (Number(l.amount) || 0);
      return sum + kcal;
    }, 0);
  }, [menusQ.data, logsQ.data]);

  // 直近7日ミニ棒グラフ（1日あたり総カロリー）
  const miniChart = useMemo(() => {
    const labels = genLastNDaysLabels(7);
    const menus = menusQ.data ?? [];
    const sumByDate: Record<string, number> = Object.fromEntries(
      labels.map((d) => [d, 0])
    );
    (logsQ.data ?? []).forEach((l) => {
      const day = new Date(l.meal_date).toISOString().slice(0, 10);
      const m = menus.find((mm) => mm.id === l.meal_menu_id);
      if (day in sumByDate)
        sumByDate[day] += (m?.calories ?? 0) * (Number(l.amount) || 0);
    });
    const values = labels.map((k) => sumByDate[k]);
    const max = Math.max(1, ...values);
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
      <svg width={W} height={H} aria-label="直近7日 総カロリー">
        <g>{bars}</g>
      </svg>
    );
  }, [logsQ.data, menusQ.data]);

  // 新規登録フォーム
  const [form, setForm] = useState({
    meal_menu_id: "",
    amount: 1.0, // 1人前
    meal_date: new Date().toISOString().slice(0, 16), // datetime-local
  });

  const createLog = useMutation({
    mutationFn: () =>
      mealApi.createLog({
        meal_menu_id: Number(form.meal_menu_id),
        amount: Number(form.amount),
        meal_date: new Date(form.meal_date).toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meal_logs"] });
      setForm((f) => ({ ...f, amount: 1.0 }));
    },
  });

  // 削除
  const deleteLog = useMutation({
    mutationFn: (id: number) => mealApi.deleteLog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meal_logs"] }),
  });

  // インライン編集（量のみ）
  const updateLog = useMutation({
    mutationFn: (v: { id: number; amount: number }) =>
      mealApi.updateLog(v.id, { amount: v.amount }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meal_logs"] }),
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<number>(1.0);

  // メニュー新規作成モーダル
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuForm, setMenuForm] = useState({
    name: "",
    time_category: "",
    food_category: "",
    calories: 500,
  });
  const createMenu = useMutation({
    mutationFn: () =>
      mealApi.createMenu({
        name: menuForm.name,
        time_category: menuForm.time_category || null,
        food_category: menuForm.food_category || null,
        calories: Number(menuForm.calories) || 0,
      }),
    onSuccess: (newMenu) => {
      qc.setQueryData(["meal_menus"], (old: any) =>
        old ? [...old, newMenu] : [newMenu]
      );
      setForm((f) => ({ ...f, meal_menu_id: String(newMenu.id) }));
      setShowMenuModal(false);
      setMenuForm({
        name: "",
        time_category: "",
        food_category: "",
        calories: 500,
      });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">食事管理：食事ログ</h1>

      {/* 新規登録 */}
      <section className="space-y-3">
        <h2 className="font-semibold">新規登録</h2>
        <form
          className="grid md:grid-cols-5 gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.meal_menu_id) return alert("メニューを選択してください");
            createLog.mutate();
          }}
        >
          <div>
            <label className="block text-sm">メニュー</label>
            <select
              className="border rounded p-2 w-full"
              value={form.meal_menu_id}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "__new__") {
                  setShowMenuModal(true);
                  return;
                }
                setForm({ ...form, meal_menu_id: v });
              }}
            >
              <option value="">選択してください</option>
              {menusQ.data?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.time_category ? `(${m.time_category})` : ""} —{" "}
                  {m.calories}kcal
                </option>
              ))}
              <option value="__new__">＋ 新規メニューを作成…</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">量（人前）</label>
            <input
              className="border rounded p-2 w-full"
              type="number"
              step="0.1"
              min="0"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="block text-sm">日時</label>
            <input
              className="border rounded p-2 w-full"
              type="datetime-local"
              value={form.meal_date}
              onChange={(e) => setForm({ ...form, meal_date: e.target.value })}
            />
          </div>
          {/* カロリーの参考表示 */}
          <div className="md:col-span-2 text-sm">
            {(() => {
              const m = menusQ.data?.find(
                (mm) => String(mm.id) === form.meal_menu_id
              );
              if (!m) return null;
              const kcal = Math.round(
                (m.calories ?? 0) * (Number(form.amount) || 0)
              );
              return (
                <div className="opacity-70">
                  この登録のカロリー見込み:{" "}
                  <span className="font-semibold">{kcal}</span> kcal
                </div>
              );
            })()}
          </div>
          <button className="bg-black text-white rounded px-4 py-2 md:col-span-1">
            追加
          </button>
        </form>
      </section>

      {/* 一覧・合計・フィルタ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">一覧</h2>
          <div className="text-sm opacity-70">
            合計: <span className="font-semibold">{Math.round(totalKcal)}</span>{" "}
            kcal
          </div>
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
          <div>
            <label className="block text-sm">メニュー</label>
            <select
              className="border rounded p-2 w-full"
              value={filters.menuId}
              onChange={(e) =>
                setFilters((f) => ({ ...f, menuId: e.target.value }))
              }
            >
              <option value="">すべて</option>
              {menusQ.data?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm">食事区分</label>
            <select
              className="border rounded p-2 w-full"
              value={filters.timeCat}
              onChange={(e) =>
                setFilters((f) => ({ ...f, timeCat: e.target.value }))
              }
            >
              <option value="">すべて</option>
              <option value="breakfast">breakfast</option>
              <option value="lunch">lunch</option>
              <option value="dinner">dinner</option>
              <option value="snack">snack</option>
            </select>
          </div>
          <div className="flex items-end">{miniChart}</div>
        </div>

        <div className="space-y-2">
          {(logsQ.data ?? []).length === 0 && (
            <div className="text-sm opacity-70">ログがありません</div>
          )}
          {logsQ.data?.map((l) => {
            const m = menusQ.data?.find((mm) => mm.id === l.meal_menu_id);
            const kcal = Math.round(
              (m?.calories ?? 0) * (Number(l.amount) || 0)
            );
            const isEditing = editingId === l.id;
            return (
              <div
                key={l.id}
                className="flex items-center justify-between border rounded p-3"
              >
                <div>
                  <div className="text-sm opacity-70">
                    {new Date(l.meal_date).toLocaleString()}
                  </div>
                  <div className="font-medium">
                    {m?.name ?? "（不明なメニュー）"}{" "}
                    {m?.time_category ? `— ${m.time_category}` : ""}
                  </div>
                  {isEditing ? (
                    <div className="mt-1">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        className="border rounded p-1 w-28"
                        value={editAmount}
                        onChange={(e) => setEditAmount(Number(e.target.value))}
                      />{" "}
                      人前
                    </div>
                  ) : (
                    <div className="text-sm">
                      量: {l.amount} 人前 ／ {kcal} kcal
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Link className="underline" to={`/meals/logs/${l.id}`}>
                    詳細
                  </Link>
                  {isEditing ? (
                    <>
                      <button
                        className="underline"
                        onClick={() => {
                          updateLog.mutate({ id: l.id, amount: editAmount });
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
                        setEditAmount(l.amount);
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

      {/* メニュー作成モーダル */}
      {showMenuModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMenuModal(false)}
          />
          <div className="relative z-10 w-[92vw] max-w-lg rounded-lg bg-white p-6 shadow-lg text-gray-900">
            <h3 className="text-lg font-semibold mb-4">
              新規食事メニューを作成
            </h3>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!menuForm.name.trim())
                  return alert("メニュー名を入力してください");
                if (!Number(menuForm.calories))
                  return alert("カロリー（kcal）を入力してください");
                createMenu.mutate();
              }}
            >
              <div>
                <label className="block text-sm text-gray-800">
                  メニュー名
                </label>
                <input
                  className="border rounded p-2 w-full"
                  value={menuForm.name}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, name: e.target.value })
                  }
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-800">
                    食事区分
                  </label>
                  <select
                    className="border rounded p-2 w-full"
                    value={menuForm.time_category}
                    onChange={(e) =>
                      setMenuForm({
                        ...menuForm,
                        time_category: e.target.value,
                      })
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
                  <label className="block text-sm text-gray-800">
                    カテゴリ
                  </label>
                  <input
                    className="border rounded p-2 w-full"
                    placeholder="rice / meat / salad など"
                    value={menuForm.food_category}
                    onChange={(e) =>
                      setMenuForm({
                        ...menuForm,
                        food_category: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-800">
                  カロリー（kcal / 1人前）
                </label>
                <input
                  className="border rounded p-2 w-full"
                  type="number"
                  min="0"
                  step="1"
                  value={menuForm.calories}
                  onChange={(e) =>
                    setMenuForm({
                      ...menuForm,
                      calories: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded border"
                  onClick={() => setShowMenuModal(false)}
                >
                  キャンセル
                </button>
                <button
                  className="px-4 py-2 rounded bg-black text-white"
                  disabled={createMenu.isPending}
                >
                  {createMenu.isPending ? "作成中…" : "作成して選択"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
