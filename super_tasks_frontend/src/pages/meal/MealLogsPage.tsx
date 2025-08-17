import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mealApi } from "../../features/meal/mealApi";
import SelectWithCreate from "../../components/form/SelectWithCreate";
import FormField from "../../components/form/FormField";

export default function MealLogsPage() {
  const qc = useQueryClient();

  const menusQ = useQuery({
    queryKey: ["meal_menus"],
    queryFn: mealApi.listMenus,
  });
  const [range, setRange] = useState({ from: "", to: "" });
  const logsQ = useQuery({
    queryKey: ["meal_logs", range],
    queryFn: () => mealApi.listLogs({ ...range }),
  });

  const [form, setForm] = useState<{
    meal_menu_id: string | number | "";
    amount: number; // 係数（1=1人前）
    meal_date: string; // yyyy-MM-ddTHH:mm
  }>({
    meal_menu_id: "",
    amount: 1,
    meal_date: new Date().toISOString().slice(0, 16),
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
      setForm((f) => ({ ...f, amount: 1 }));
    },
    onError: () => alert("登録に失敗しました"),
  });

  const deleteLog = useMutation({
    mutationFn: (id: number) => mealApi.deleteLog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meal_logs"] }),
    onError: () => alert("削除に失敗しました"),
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">食事管理：食事ログ</h1>

      {/* 新規登録 */}
      <section className="space-y-3 border rounded p-4">
        <h2 className="font-semibold">新規登録</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.meal_menu_id) return alert("メニューを選択してください");
            createLog.mutate();
          }}
        >
          <FormField label="メニュー" required className="md:col-span-2">
            <SelectWithCreate
              value={form.meal_menu_id ?? ""}
              options={(menusQ.data ?? []).map((m) => ({
                value: String(m.id),
                label: m.name,
              }))}
              onChange={(v) => setForm((f) => ({ ...f, meal_menu_id: v }))}
              onCreate={async (payload) => {
                // payload: name, time_category, category(caloriesのカテゴリ相当), calories
                const created = await mealApi.createMenu({
                  name: payload.name,
                  time_category: payload.time_category || "",
                  food_category: payload.category || "",
                  calories: Number(payload.calories || 0),
                });
                qc.setQueryData(["meal_menus"], (old: any) =>
                  old ? [...old, created] : [created]
                );
                qc.invalidateQueries({ queryKey: ["meal_menus"] });
                return { value: String(created.id), label: created.name };
              }}
              createFields={[
                { name: "name", label: "名前", required: true },
                { name: "time_category", label: "時間帯（朝/昼/夜）" },
                { name: "category", label: "カテゴリ（主食/主菜など）" },
                { name: "calories", label: "カロリー(kcal)" },
              ]}
            />
          </FormField>

          <FormField label="量（人前係数）" required>
            <input
              className="border rounded p-3 w-full"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: Number(e.target.value) }))
              }
            />
          </FormField>

          <FormField label="日時" required>
            <input
              className="border rounded p-3 w-full"
              type="datetime-local"
              value={form.meal_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, meal_date: e.target.value }))
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
            const m = menusQ.data?.find((x) => x.id === l.meal_menu_id);
            const kcal = (m?.calories ?? 0) * (l.amount ?? 1);
            return (
              <div
                key={l.id}
                className="border rounded p-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm opacity-70">
                    {new Date(l.meal_date).toLocaleString()}
                  </div>
                  <div className="font-medium truncate">
                    {m?.name ?? "メニュー"} — {l.amount ?? 1} 人前（
                    {Math.round(kcal)} kcal）
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
