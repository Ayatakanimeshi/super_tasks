import React, { useMemo, useState } from "react";
import Modal from "../common/Modal";
import FormField from "./FormField";

type Option = { value: string | number; label: string };
type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea";
  required?: boolean;
  placeholder?: string;
};

type Props = {
  label?: string;
  value: string | number | "";
  options: Option[];
  onChange: (v: string) => void;
  createButtonLabel?: string; // デフォルト "＋ 新規作成…"
  createFields?: Field[]; // デフォルト name/category/description
  onCreate: (payload: Record<string, string>) => Promise<Option>;
  disabled?: boolean;
  className?: string;
};

export default function SelectWithCreate({
  label,
  value,
  options,
  onChange,
  createButtonLabel,
  createFields,
  onCreate,
  disabled,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const fields = useMemo<Field[]>(
    () =>
      createFields ?? [
        { name: "name", label: "名前", required: true, placeholder: "必須" },
        { name: "category", label: "カテゴリ", placeholder: "任意" },
        {
          name: "description",
          label: "説明",
          type: "textarea",
          placeholder: "任意",
        },
      ],
    [createFields]
  );

  const createLabel = createButtonLabel ?? "＋ 新規作成…";

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      {label && <label className="block text-sm text-gray-800">{label}</label>}
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "__create__") {
            setOpen(true);
            return;
          }
          onChange(v);
        }}
        className="border rounded p-2 w-full"
      >
        <option value="">選択してください</option>
        {options.map((o) => (
          <option key={o.value} value={String(o.value)}>
            {o.label}
          </option>
        ))}
        <option value="__create__">{createLabel}</option>
      </select>

      {/* 作成モーダル */}
      <Modal open={open} onClose={() => setOpen(false)} title="新規作成">
        <div className="space-y-3">
          {fields.map((f) => (
            <FormField key={f.name} label={f.label} required={f.required}>
              {f.type === "textarea" ? (
                <textarea
                  className="border rounded p-2 w-full"
                  placeholder={f.placeholder}
                  rows={3}
                  value={form[f.name] ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [f.name]: e.target.value }))
                  }
                />
              ) : (
                <input
                  className="border rounded p-2 w-full"
                  placeholder={f.placeholder}
                  value={form[f.name] ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [f.name]: e.target.value }))
                  }
                />
              )}
            </FormField>
          ))}
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded border"
              onClick={() => setOpen(false)}
            >
              キャンセル
            </button>
            <button
              className="px-4 py-2 rounded bg-black text-white"
              onClick={async () => {
                // 必須チェック
                for (const f of fields) {
                  if (f.required && !String(form[f.name] ?? "").trim()) {
                    alert(`${f.label} を入力してください`);
                    return;
                  }
                }
                try {
                  const created = await onCreate(form);
                  onChange(String(created.value)); // セレクトに反映
                  setOpen(false);
                  setForm({});
                } catch (e) {
                  console.error(e);
                  alert("作成に失敗しました");
                }
              }}
            >
              作成する
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
