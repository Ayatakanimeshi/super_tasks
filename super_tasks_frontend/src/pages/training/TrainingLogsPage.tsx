import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trainingApi } from "../../features/training/trainingApi";
import SelectWithCreate from "../../components/form/SelectWithCreate";
import FormField from "../../components/form/FormField";

export default function TrainingLogsPage() {
  const qc = useQueryClient();

  // メニュー一覧
  const menusQ = useQuery({
    queryKey: ["training_menus"],
    queryFn: trainingApi.listMenus,
  });

  // 日付範囲（一覧表示）
  const [range, setRange] = useState({ from: "", to: "" });
  const logsQ = useQuery({
    queryKey: ["training_logs", range],
    queryFn: () => trainingApi.listLogs({ ...range }),
  });

  // フォーム状態
  const [form, setForm] = useState<{
    training_menu_id: string | number | "";
    weight: number;
    reps: number;
    performed_at: string; // yyyy-MM-ddTHH:mm (local)
    duration_minutes: number | "";
  }>({
    training_menu_id: "",
    weight: 60,
    reps: 8,
    performed_at: new Date().toISOString().slice(0, 16),
    duration_minutes: 40,
  });

  // 追加
  const createLog = useMutation({
    mutationFn: () =>
      trainingApi.createLog({
        training_menu_id: Number(form.training_menu_id),
        weight: Number(form.weight),
        reps: Number(form.reps),
        performed_at: new Date(form.performed_at).toISOString(),
        duration_minutes:
          form.duration_minutes === ""
            ? undefined
            : Number(form.duration_minutes),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["training_logs"] });
      setForm((f) => ({ ...f, weight: 60, reps: 8 }));
    },
    onError: () => {
      alert("登録に失敗しました。入力内容をご確認ください。");
    },
  });

  // 削除
  const deleteLog = useMutation({
    mutationFn: (id: number) => trainingApi.deleteLog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["training_logs"] }),
    onError: () => alert("削除に失敗しました"),
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">
        ジム管理：トレーニングログ
      </h1>

      {/* ===== 新規登録 ===== */}
      <section className="space-y-3 border rounded p-4">
        <h2 className="font-semibold">新規登録</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.training_menu_id) {
              alert("種目を選択してください");
              return;
            }
            createLog.mutate();
          }}
        >
          {/* 種目：SelectWithCreate で「選択＋新規」統一 */}
          <FormField label="種目" required className="md:col-span-2">
            <SelectWithCreate
              value={form.training_menu_id ?? ""}
              options={(menusQ.data ?? []).map((m) => ({
                value: String(m.id),
                label: m.name,
              }))}
              onChange={(v) => setForm((f) => ({ ...f, training_menu_id: v }))}
              createFields={[
                { name: "name", label: "名前", required: true },
                { name: "category", label: "カテゴリ" },
              ]}
              onCreate={async (payload) => {
                // APIで新規メニュー作成
                const created = await trainingApi.createMenu({
                  name: payload.name,
                  category: payload.category ?? "",
                });
                // 一覧へ即時反映＋再取得（堅め）
                qc.setQueryData(["training_menus"], (old: any) =>
                  old ? [...old, created] : [created]
                );
                qc.invalidateQueries({ queryKey: ["training_menus"] });
                // セレクトへ反映
                return { value: String(created.id), label: created.name };
              }}
            />
          </FormField>

          <FormField label="重量(kg)" required>
            <input
              className="border rounded p-3 w-full"
              type="number"
              inputMode="decimal"
              value={form.weight}
              onChange={(e) =>
                setForm({ ...form, weight: Number(e.target.value) })
              }
            />
          </FormField>

          <FormField label="回数(reps)" required>
            <input
              className="border rounded p-3 w-full"
              type="number"
              inputMode="numeric"
              value={form.reps}
              onChange={(e) =>
                setForm({ ...form, reps: Number(e.target.value) })
              }
            />
          </FormField>

          <FormField label="日時" required>
            <input
              className="border rounded p-3 w-full"
              type="datetime-local"
              value={form.performed_at}
              onChange={(e) =>
                setForm({ ...form, performed_at: e.target.value })
              }
            />
          </FormField>

          <FormField label="所要(分)">
            <input
              className="border rounded p-3 w-full"
              type="number"
              inputMode="numeric"
              value={form.duration_minutes}
              onChange={(e) =>
                setForm({
                  ...form,
                  duration_minutes:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              placeholder="任意"
            />
          </FormField>

          <button
            className="bg-black text-white rounded px-4 py-3 md:col-span-1 active:opacity-80"
            type="submit"
          >
            追加
          </button>
        </form>
      </section>

      {/* ===== 一覧 ===== */}
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
            const menu = menusQ.data?.find((m) => m.id === l.training_menu_id);
            return (
              <div
                key={l.id}
                className="border rounded p-3 flex items-center justify-between"
              >
                <a
                  href={`/training/logs/${l.id}`}
                  className="flex-1 min-w-0 mr-3"
                >
                  <div className="text-sm opacity-70">
                    {new Date(l.performed_at).toLocaleString()}
                  </div>
                  <div className="font-medium truncate">
                    {menu?.name ?? "種目"} — {l.weight}kg × {l.reps}回
                  </div>
                  {l.duration_minutes ? (
                    <div className="text-sm">所要: {l.duration_minutes}分</div>
                  ) : null}
                </a>
                <button
                  className="text-red-600 underline px-2 py-1"
                  onClick={() => {
                    if (confirm("このログを削除しますか？")) {
                      deleteLog.mutate(l.id);
                    }
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
