import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mentorApi } from "../../features/mentor/mentorApi";
import type {
  MentorTask,
  MentorTaskLog,
} from "../../features/mentor/mentorApi";
import SelectWithCreate from "../../components/form/SelectWithCreate";
import FormField from "../../components/form/FormField";
import Modal from "../../components/common/Modal";

// ====== date helpers ======
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const startOfWeek = (d: Date) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - x.getDay());
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfWeek = (d: Date) => {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
};
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const hm = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
};
const joinISO = (dayISO: string, hmStr: string) =>
  new Date(`${dayISO}T${hmStr || "09:00"}:00`).toISOString();

type ViewMode = "month" | "week" | "day";

export default function MentorCalendarPage() {
  const qc = useQueryClient();
  const todayISO = ymd(new Date());

  // 表示状態
  const [view, setView] = useState<ViewMode>("month");
  const [anchor, setAnchor] = useState<Date>(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string>(todayISO);

  // 月グリッド
  const monthDays = useMemo(() => {
    const first = startOfMonth(anchor);
    const firstWeekday = first.getDay();
    const start = new Date(first);
    start.setDate(start.getDate() - firstWeekday);
    const arr: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [anchor]);

  // 週
  const weekStart = useMemo(
    () => startOfWeek(new Date(selectedDay)),
    [selectedDay]
  );
  const weekEnd = useMemo(
    () => endOfWeek(new Date(selectedDay)),
    [selectedDay]
  );
  const weekDays = useMemo(() => {
    const s = new Date(weekStart);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      return d;
    });
  }, [weekStart]);

  // 取得レンジ
  const rangeFrom = useMemo(() => {
    if (view === "month") return new Date(monthDays[0]);
    if (view === "week") return new Date(weekStart);
    return new Date(`${selectedDay}T00:00:00`);
  }, [view, monthDays, weekStart, selectedDay]);

  const rangeTo = useMemo(() => {
    const d = new Date(rangeFrom);
    if (view === "month") {
      const end = new Date(monthDays[41]);
      end.setHours(23, 59, 59, 999);
      return end;
    }
    if (view === "week") {
      const end = new Date(weekEnd);
      end.setHours(23, 59, 59, 999);
      return end;
    }
    d.setHours(23, 59, 59, 999);
    return d;
  }, [view, rangeFrom, monthDays, weekEnd]);

  // === データ ===
  const tasksQ = useQuery({
    queryKey: ["mentor_tasks"],
    queryFn: mentorApi.listTasks,
  });
  const logsQ = useQuery({
    queryKey: ["mentor_task_logs", ymd(rangeFrom), ymd(rangeTo)],
    queryFn: () =>
      mentorApi.listLogs({
        from: rangeFrom.toISOString(),
        to: rangeTo.toISOString(),
      }),
  });

  const logsByDate = useMemo(() => {
    const map: Record<string, MentorTaskLog[]> = {};
    (logsQ.data ?? []).forEach((l) => {
      const key = l.deadline?.slice(0, 10);
      if (!key) return;
      (map[key] ||= []).push(l);
    });
    return map;
  }, [logsQ.data]);

  // === モーダル + フィルタ + 追加 ===
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterTaskId, setFilterTaskId] = useState("");
  const [selectTaskId, setSelectTaskId] = useState<string>("");
  const [deadlineTime, setDeadlineTime] = useState("09:00");

  // タスク作成
  const createTask = useMutation({
    mutationFn: (payload: {
      name: string;
      category?: string;
      description?: string;
    }) =>
      mentorApi.createTask({
        name: payload.name,
        category: payload.category || null,
        description: payload.description || null,
      }),
    onSuccess: (res: any) => {
      const created: MentorTask = res?.mentor_task ?? res;
      qc.setQueryData(["mentor_tasks"], (old: any) =>
        old ? [...old, created] : [created]
      );
      qc.invalidateQueries({ queryKey: ["mentor_tasks"] });
      setSelectTaskId(String(created.id)); // 直後に選択状態へ
    },
  });

  // ログ作成/更新/削除
  const createLog = useMutation({
    mutationFn: (args: { dayISO: string; mentor_task_id: number }) =>
      mentorApi.createLog({
        mentor_task_id: args.mentor_task_id,
        deadline: joinISO(args.dayISO, deadlineTime),
        executed_at: null,
        completed: false,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mentor_task_logs"] }),
  });

  const updateLog = useMutation({
    mutationFn: (args: { id: number; completed: boolean }) =>
      mentorApi.updateLog(args.id, {
        completed: args.completed,
        executed_at: args.completed ? new Date().toISOString() : null,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mentor_task_logs"] }),
  });

  const deleteLog = useMutation({
    mutationFn: (id: number) => mentorApi.deleteLog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mentor_task_logs"] }),
  });

  const addToDay = async (dayISO: string) => {
    const id = selectTaskId || filterTaskId;
    if (!id) return alert("タスクを選択してください");
    await createLog.mutateAsync({ dayISO, mentor_task_id: Number(id) });
  };

  // フィルタと選択の同期（カテゴリ/タスク選択に応じて候補を絞る）
  const tasksForSelect = useMemo(() => {
    let arr = tasksQ.data ?? [];
    if (filterCategory) arr = arr.filter((t) => t.category === filterCategory);
    if (filterTaskId) arr = arr.filter((t) => String(t.id) === filterTaskId);
    return arr;
  }, [tasksQ.data, filterCategory, filterTaskId]);

  useEffect(() => {
    // タスクの絞り込みで直接選ばれたら、それを選択値へ反映
    if (filterTaskId) setSelectTaskId(filterTaskId);
  }, [filterTaskId]);

  useEffect(() => {
    // 絞り込みにより選択値が候補から外れたらクリア
    if (
      selectTaskId &&
      !tasksForSelect.some((t) => String(t.id) === selectTaskId)
    ) {
      setSelectTaskId("");
    }
  }, [tasksForSelect, selectTaskId]);

  // カテゴリ一覧
  const categoryOptions = useMemo(() => {
    const s = new Set<string>();
    (tasksQ.data ?? []).forEach((t) => t.category && s.add(t.category));
    return Array.from(s);
  }, [tasksQ.data]);

  const weekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const nowISO = new Date().toISOString();

  // 日ごとの一覧（未完→完了、時刻昇順）
  const dayList = (dayISO: string) => {
    let list = (logsByDate[dayISO] ?? []).slice();
    if (filterCategory) {
      const ids = new Set(
        (tasksQ.data ?? [])
          .filter((t) => t.category === filterCategory)
          .map((t) => t.id)
      );
      list = list.filter((l) => ids.has(l.mentor_task_id));
    }
    if (filterTaskId)
      list = list.filter((l) => String(l.mentor_task_id) === filterTaskId);
    list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const ta = a.deadline
        ? new Date(a.deadline).getTime()
        : Number.POSITIVE_INFINITY;
      const tb = b.deadline
        ? new Date(b.deadline).getTime()
        : Number.POSITIVE_INFINITY;
      return ta - tb;
    });
    return list;
  };

  // ===== UI =====
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* ヘッダ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold">
          メンター業務：カレンダー
        </h1>
        <div className="flex items-center gap-1 border rounded overflow-hidden">
          {(["month", "week", "day"] as ViewMode[]).map((v) => (
            <button
              key={v}
              className={`px-3 py-2 ${view === v ? "bg-black text-white" : ""}`}
              onClick={() => setView(v)}
            >
              {v === "month" ? "月" : v === "week" ? "週" : "日"}
            </button>
          ))}
        </div>
      </div>

      {/* ナビ */}
      <div className="flex items-center justify-between">
        {view === "month" && (
          <>
            <button
              className="px-3 py-2 border rounded"
              onClick={() =>
                setAnchor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
              }
            >
              ← 前月
            </button>
            <div className="font-medium">
              {anchor.getFullYear()} /{" "}
              {String(anchor.getMonth() + 1).padStart(2, "0")}
            </div>
            <button
              className="px-3 py-2 border rounded"
              onClick={() =>
                setAnchor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
              }
            >
              次月 →
            </button>
          </>
        )}
        {view === "week" && (
          <>
            <button
              className="px-3 py-2 border rounded"
              onClick={() => {
                const p = new Date(weekStart);
                p.setDate(p.getDate() - 7);
                setSelectedDay(ymd(p));
              }}
            >
              ← 前週
            </button>
            <div className="font-medium">
              {ymd(weekStart)} ~ {ymd(weekEnd)}
            </div>
            <button
              className="px-3 py-2 border rounded"
              onClick={() => {
                const n = new Date(weekStart);
                n.setDate(n.getDate() + 7);
                setSelectedDay(ymd(n));
              }}
            >
              次週 →
            </button>
          </>
        )}
        {view === "day" && (
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 border rounded"
              onClick={() => {
                const d = new Date(selectedDay);
                d.setDate(d.getDate() - 1);
                setSelectedDay(ymd(d));
              }}
            >
              ← 前日
            </button>
            <input
              type="date"
              className="border rounded p-2"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            />
            <button
              className="px-3 py-2 border rounded"
              onClick={() => {
                const d = new Date(selectedDay);
                d.setDate(d.getDate() + 1);
                setSelectedDay(ymd(d));
              }}
            >
              次日 →
            </button>
          </div>
        )}
      </div>

      {/* 曜日ヘッダ（week/month） */}
      {(view === "month" || view === "week") && (
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
            <div key={w} className="text-center text-xs opacity-70 py-1">
              {w}
            </div>
          ))}
        </div>
      )}

      {/* 月 */}
      {view === "month" && (
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((d, i) => {
            const key = ymd(d);
            const items = logsByDate[key] ?? [];
            const done = items.filter((x) => x.completed).length;
            const undone = items.length - done;
            const overdue = items.some(
              (x) => !x.completed && x.deadline && x.deadline < nowISO
            );
            const isToday = key === todayISO;
            const isThisMonth = d.getMonth() === anchor.getMonth();

            return (
              <button
                key={i}
                className={[
                  "h-28 border rounded p-2 text-left relative",
                  !isThisMonth ? "opacity-50" : "",
                  overdue
                    ? "bg-red-50 border-red-200"
                    : undone > 0
                    ? "bg-yellow-50"
                    : "",
                  isToday ? "ring-2 ring-black" : "",
                ].join(" ")}
                onClick={() => {
                  setSelectedDay(key);
                  setOpenDay(key);
                }}
              >
                <div className="text-xs font-medium">{d.getDate()}</div>
                <div className="absolute bottom-2 left-2 flex gap-2 text-[11px]">
                  {items.length > 0 && (
                    <>
                      <span className="px-1 border rounded">
                        全 {items.length}
                      </span>
                      {undone > 0 && (
                        <span className="px-1 border rounded bg-yellow-100">
                          未 {undone}
                        </span>
                      )}
                      {done > 0 && (
                        <span className="px-1 border rounded bg-green-100">
                          完 {done}
                        </span>
                      )}
                    </>
                  )}
                </div>
                {overdue && (
                  <div className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-white">
                    Overdue
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 週 */}
      {view === "week" && (
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d) => {
            const key = ymd(d);
            const items = logsByDate[key] ?? [];
            const done = items.filter((x) => x.completed).length;
            const undone = items.length - done;
            const overdue = items.some(
              (x) => !x.completed && x.deadline && x.deadline < nowISO
            );
            const isToday = key === todayISO;

            return (
              <button
                key={key}
                className={[
                  "h-36 border rounded p-2 text-left relative",
                  overdue
                    ? "bg-red-50 border-red-200"
                    : undone > 0
                    ? "bg-yellow-50"
                    : "",
                  isToday ? "ring-2 ring-black" : "",
                ].join(" ")}
                onClick={() => setOpenDay(key)}
              >
                <div className="text-xs font-medium">
                  {key}{" "}
                  <span className="opacity-60">
                    (
                    {
                      ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                        d.getDay()
                      ]
                    }
                    )
                  </span>
                </div>
                <div className="mt-1 space-y-1 text-xs">
                  {dayList(key)
                    .slice(0, 4)
                    .map((l) => (
                      <div key={l.id} className="flex items-center gap-1">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            l.completed ? "bg-green-600" : "bg-yellow-600"
                          }`}
                        />
                        <span className="opacity-70">
                          {hm(l.deadline) || "--:--"}
                        </span>
                        <span
                          className={`${
                            l.completed
                              ? "line-through opacity-60"
                              : "font-medium"
                          }`}
                        >
                          {(tasksQ.data ?? []).find(
                            (t) => t.id === l.mentor_task_id
                          )?.name ?? "（不明）"}
                        </span>
                      </div>
                    ))}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 日（ページ展開） */}
      {view === "day" && (
        <DayPanel
          dayISO={selectedDay}
          tasksQ={tasksQ.data ?? []}
          list={dayList(selectedDay)}
          categoryOptions={categoryOptions}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterTaskId={filterTaskId}
          setFilterTaskId={setFilterTaskId}
          selectTaskId={selectTaskId}
          setSelectTaskId={setSelectTaskId}
          optionsForSelect={tasksForSelect.map((t) => ({
            value: String(t.id),
            label: t.name,
          }))}
          deadlineTime={deadlineTime}
          setDeadlineTime={setDeadlineTime}
          onCreateTask={async (p) => {
            const created: any = await createTask.mutateAsync(p);
            return {
              value: String(created?.mentor_task?.id ?? created?.id),
              label: p.name,
            };
          }}
          onAdd={() => addToDay(selectedDay)}
          onUpdate={(id, completed) => updateLog.mutate({ id, completed })}
          onDelete={(id) => {
            if (confirm("このタスクログを削除しますか？")) deleteLog.mutate(id);
          }}
        />
      )}

      {/* 日モーダル */}
      {openDay && view !== "day" && (
        <Modal
          open={!!openDay}
          onClose={() => setOpenDay(null)}
          title={`${openDay} のタスク`}
        >
          <DayPanel
            dayISO={openDay}
            tasksQ={tasksQ.data ?? []}
            list={dayList(openDay)}
            categoryOptions={categoryOptions}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterTaskId={filterTaskId}
            setFilterTaskId={setFilterTaskId}
            selectTaskId={selectTaskId}
            setSelectTaskId={setSelectTaskId}
            optionsForSelect={tasksForSelect.map((t) => ({
              value: String(t.id),
              label: t.name,
            }))}
            deadlineTime={deadlineTime}
            setDeadlineTime={setDeadlineTime}
            onCreateTask={async (p) => {
              const created: any = await createTask.mutateAsync(p);
              return {
                value: String(created?.mentor_task?.id ?? created?.id),
                label: p.name,
              };
            }}
            onAdd={() => addToDay(openDay)}
            onUpdate={(id, completed) => updateLog.mutate({ id, completed })}
            onDelete={(id) => {
              if (confirm("このタスクログを削除しますか？"))
                deleteLog.mutate(id);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function DayPanel(props: {
  dayISO: string;
  tasksQ: MentorTask[];
  list: MentorTaskLog[];
  categoryOptions: string[];
  filterCategory: string;
  setFilterCategory: (v: string) => void;
  filterTaskId: string;
  setFilterTaskId: (v: string) => void;
  selectTaskId: string;
  setSelectTaskId: (v: string) => void;
  optionsForSelect: { value: string; label: string }[];
  deadlineTime: string;
  setDeadlineTime: (v: string) => void;
  // ★ 任意payloadを受け取れるよう緩める（SelectWithCreateに合わせる）
  onCreateTask: (
    payload: Record<string, any>
  ) => Promise<{ value: string; label: string }>;
  onAdd: () => void;
  onUpdate: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}) {
  const {
    dayISO,
    list,
    categoryOptions,
    filterCategory,
    setFilterCategory,
    filterTaskId,
    setFilterTaskId,
    selectTaskId,
    setSelectTaskId,
    optionsForSelect,
    deadlineTime,
    setDeadlineTime,
    onCreateTask,
    onAdd,
    onUpdate,
    onDelete,
    tasksQ,
  } = props;

  return (
    <div className="space-y-4">
      {/* フィルタ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <FormField label="カテゴリで絞り込み">
          <select
            className="border rounded p-2 w-full"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">すべて</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="タスクで絞り込み">
          <select
            className="border rounded p-2 w-full"
            value={filterTaskId}
            onChange={(e) => setFilterTaskId(e.target.value)}
          >
            <option value="">すべて</option>
            {tasksQ.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* 追加フォーム：SelectWithCreate */}
      <div className="border rounded p-3 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <FormField label="タスク" required className="md:col-span-2">
            <SelectWithCreate
              value={selectTaskId}
              options={optionsForSelect}
              onChange={(v) => setSelectTaskId(v)}
              onCreate={onCreateTask}
            />
          </FormField>
          <FormField label="期限（時刻）">
            <input
              type="time"
              className="border rounded p-2 w-full"
              value={deadlineTime}
              onChange={(e) => setDeadlineTime(e.target.value)}
            />
          </FormField>
        </div>
        <div className="flex justify-end">
          <button
            className="px-4 py-3 rounded bg-black text-white active:opacity-80"
            onClick={onAdd}
          >
            {dayISO} に追加
          </button>
        </div>
      </div>

      {/* 一覧 */}
      <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
        {list.length === 0 && (
          <div className="text-sm opacity-70">この日のタスクはありません</div>
        )}
        {list.map((l) => {
          const t = tasksQ.find((x) => x.id === l.mentor_task_id);
          const overdue =
            !l.completed && l.deadline && l.deadline < new Date().toISOString();
          return (
            <div
              key={l.id}
              className={`border rounded p-3 flex items-center justify-between ${
                overdue ? "border-red-300 bg-red-50" : ""
              }`}
            >
              <div className="space-y-1">
                <div className="font-medium">
                  <span
                    className={l.completed ? "line-through opacity-70" : ""}
                  >
                    {t?.name ?? "（不明なタスク）"}
                  </span>
                  {t?.category && (
                    <span className="ml-2 text-xs px-2 py-0.5 border rounded">
                      {t.category}
                    </span>
                  )}
                </div>
                {t?.description && (
                  <div className="text-sm opacity-80">{t.description}</div>
                )}
                <div className="text-xs opacity-70">
                  期限:{" "}
                  {l.deadline ? new Date(l.deadline).toLocaleString() : "-"}（
                  {hm(l.deadline) || "--:--"}） ／ 実行:{" "}
                  {l.executed_at
                    ? new Date(l.executed_at).toLocaleString()
                    : "-"}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={l.completed}
                    onChange={(e) => onUpdate(l.id, e.target.checked)}
                  />
                  完了
                </label>
                <button
                  className="text-red-600 underline"
                  onClick={() => onDelete(l.id)}
                >
                  削除
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
