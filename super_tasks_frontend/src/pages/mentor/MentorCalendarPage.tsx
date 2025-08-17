import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mentorApi } from "../../features/mentor/mentorApi";
import type {
  MentorTask,
  MentorTaskLog,
} from "../../features/mentor/mentorApi";

// ===== 小ユーティリティ =====
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function startOfWeek(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const w = x.getDay();
  x.setDate(x.getDate() - w);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfWeek(d: Date) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}
function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}
function sameDayISO(aISO: string, bISO: string) {
  return aISO.slice(0, 10) === bISO.slice(0, 10);
}
function toLocalHM(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}
function joinDateTimeISO(dayISO: string, hm: string) {
  const dt = new Date(`${dayISO}T${hm}:00`);
  return dt.toISOString();
}

// APIレスポンスの形を正規化（{id,...} か {mentor_task:{...}} の両対応）
function extractTask(x: any): MentorTask {
  if (!x) throw new Error("empty response");
  if ("id" in x) return x as MentorTask;
  if ("mentor_task" in x) return x.mentor_task as MentorTask;
  if ("data" in x && x.data?.mentor_task)
    return x.data.mentor_task as MentorTask;
  throw new Error("unexpected createTask response shape");
}
function extractLog(x: any): MentorTaskLog {
  if (!x) throw new Error("empty response");
  if ("id" in x && "mentor_task_id" in x) return x as MentorTaskLog;
  if ("mentor_task_log" in x) return x.mentor_task_log as MentorTaskLog;
  if ("data" in x && x.data?.mentor_task_log)
    return x.data.mentor_task_log as MentorTaskLog;
  throw new Error("unexpected createLog response shape");
}

type ViewMode = "month" | "week" | "day";

export default function MentorCalendarPage() {
  const qc = useQueryClient();

  // ===== 表示モード & 日付カーソル =====
  const todayISO = ymd(new Date());
  const [view, setView] = useState<ViewMode>("month");
  const [anchor, setAnchor] = useState<Date>(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);

  // 週・日用のベース日（選択日）
  const [selectedDay, setSelectedDay] = useState<string>(todayISO);

  // グリッド（month: 6週固定, week: 1週）
  const monthGridDays = useMemo(() => {
    const firstWeekday = (monthStart.getDay() + 7) % 7;
    const start = new Date(monthStart);
    start.setDate(start.getDate() - firstWeekday);
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [anchor]);

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
    const arr: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [weekStart]);

  // 取得範囲（viewに応じて）
  const rangeFrom = useMemo(() => {
    if (view === "month") return new Date(monthGridDays[0]);
    if (view === "week") return new Date(weekStart);
    return new Date(`${selectedDay}T00:00:00`);
  }, [view, monthGridDays, weekStart, selectedDay]);

  const rangeTo = useMemo(() => {
    const d = new Date(rangeFrom);
    if (view === "month") {
      const end = new Date(monthGridDays[41]);
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
  }, [view, rangeFrom, monthGridDays, weekEnd]);

  // ===== データ取得 =====
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

  // 日付ごとログ
  const logsByDate = useMemo(() => {
    const map: Record<string, MentorTaskLog[]> = {};
    (logsQ.data ?? []).forEach((l) => {
      const key = l.deadline ? l.deadline.slice(0, 10) : "";
      if (!key) return;
      (map[key] ||= []).push(l);
    });
    return map;
  }, [logsQ.data]);

  // ===== モーダル（既存仕様） =====
  const [openDay, setOpenDay] = useState<string | null>(null);

  // ===== 日モーダル内のフィルタ =====
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterTaskId, setFilterTaskId] = useState<string>("");

  // ===== 追加フォーム（既存 or 新規作成） =====
  const [selectTaskId, setSelectTaskId] = useState<string>("");
  const [showNewTaskFields, setShowNewTaskFields] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    category: "",
    description: "",
  });
  const [newDeadlineTime, setNewDeadlineTime] = useState("09:00");

  // ---- Task作成
  const createTask = useMutation({
    mutationFn: () =>
      mentorApi.createTask({
        name: newTask.name,
        category: newTask.category || null,
        description: newTask.description || null,
      }),
    onSuccess: (res) => {
      const created = extractTask(res);
      // 一覧に即時追加＆サーバ整合のためinvalidate
      qc.setQueryData(["mentor_tasks"], (old: any) =>
        old ? [...old, created] : [created]
      );
      qc.invalidateQueries({ queryKey: ["mentor_tasks"] });
      // セレクトに反映
      setSelectTaskId(String(created.id));
      // 入力モード解除
      setShowNewTaskFields(false);
    },
    onError: (e: any) => {
      console.error("[createTask] failed", e);
      alert("タスクの作成に失敗しました。");
    },
  });

  // ---- Log作成
  const createLog = useMutation({
    mutationFn: (payload: { dayISO: string; mentor_task_id: number }) =>
      mentorApi.createLog({
        mentor_task_id: payload.mentor_task_id,
        deadline: joinDateTimeISO(payload.dayISO, newDeadlineTime),
        executed_at: null,
        completed: false,
      }),
    onSuccess: (res) => {
      // 一覧更新（month/week/day すべてに効く）
      qc.invalidateQueries({ queryKey: ["mentor_task_logs"] });
      // ここでは selectTaskId をクリアしない（「選択されていません」を避ける）
      setShowNewTaskFields(false);
      setNewTask({ name: "", category: "", description: "" });
    },
    onError: (e: any) => {
      console.error("[createLog] failed", e);
      alert("ログの作成に失敗しました。");
    },
  });

  // 追加処理
  const onAdd = async (dayISO: string) => {
    if (!showNewTaskFields) {
      // 選択が空ならフィルタのタスクIDをフォールバック利用
      let idToUse = selectTaskId || filterTaskId;
      if (!idToUse) {
        alert("タスクを選択してください");
        return;
      }
      createLog.mutate({ dayISO, mentor_task_id: Number(idToUse) });
    } else {
      if (!newTask.name.trim()) {
        alert("タスク名を入力してください");
        return;
      }
      const createdAny = await createTask.mutateAsync();
      const created = extractTask(createdAny);
      setSelectTaskId(String(created.id));
      createLog.mutate({ dayISO, mentor_task_id: created.id });
    }
  };

  // 完了トグル／削除
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

  // ===== 表示用ヘルパ =====
  const weekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const nowISO = new Date().toISOString();

  // 日のログ（フィルタ＋並び替え）
  const getDayLogsFilteredSorted = (dayISO: string) => {
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

  // カテゴリ候補
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    (tasksQ.data ?? []).forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasksQ.data]);

  // ===== UI =====
  return (
    <div className="p-6 space-y-6">
      {/* ヘッダ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">メンター業務：カレンダー</h1>

        <div className="flex items-center gap-2">
          {view === "month" && (
            <>
              <button
                className="px-3 py-1 border rounded"
                onClick={() =>
                  setAnchor(
                    (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)
                  )
                }
              >
                ← 前月
              </button>
              <div className="min-w-[160px] text-center font-medium">
                {anchor.getFullYear()} /{" "}
                {String(anchor.getMonth() + 1).padStart(2, "0")}
              </div>
              <button
                className="px-3 py-1 border rounded"
                onClick={() =>
                  setAnchor(
                    (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)
                  )
                }
              >
                次月 →
              </button>
            </>
          )}
          {view === "week" && (
            <>
              <button
                className="px-3 py-1 border rounded"
                onClick={() => {
                  const prev = new Date(weekStart);
                  prev.setDate(prev.getDate() - 7);
                  setSelectedDay(ymd(prev));
                }}
              >
                ← 前週
              </button>
              <div className="min-w-[200px] text-center font-medium">
                {ymd(weekStart)} ~ {ymd(weekEnd)}
              </div>
              <button
                className="px-3 py-1 border rounded"
                onClick={() => {
                  const next = new Date(weekStart);
                  next.setDate(next.getDate() + 7);
                  setSelectedDay(ymd(next));
                }}
              >
                次週 →
              </button>
            </>
          )}
          {view === "day" && (
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 border rounded"
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
                className="border rounded p-1"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
              />
              <button
                className="px-3 py-1 border rounded"
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

        {/* 表示モード切替 */}
        <div className="flex items-center gap-1 border rounded overflow-hidden">
          <button
            className={`px-3 py-1 ${
              view === "month" ? "bg-black text-white" : ""
            }`}
            onClick={() => setView("month")}
          >
            月
          </button>
          <button
            className={`px-3 py-1 ${
              view === "week" ? "bg-black text-white" : ""
            }`}
            onClick={() => setView("week")}
          >
            週
          </button>
          <button
            className={`px-3 py-1 ${
              view === "day" ? "bg-black text-white" : ""
            }`}
            onClick={() => setView("day")}
          >
            日
          </button>
        </div>
      </div>

      {/* 曜日ヘッダ */}
      {(view === "month" || view === "week") && (
        <div className="grid grid-cols-7 gap-1">
          {weekLabels.map((w) => (
            <div key={w} className="text-center text-xs opacity-70 py-1">
              {w}
            </div>
          ))}
        </div>
      )}

      {/* ===== 月表示 ===== */}
      {view === "month" && (
        <div className="grid grid-cols-7 gap-1">
          {monthGridDays.map((d, idx) => {
            const key = ymd(d);
            const isThisMonth = d.getMonth() === anchor.getMonth();
            const items = logsByDate[key] ?? [];
            const done = items.filter((i) => i.completed).length;
            const undone = items.length - done;
            const overdue = items.some(
              (i) => !i.completed && i.deadline && i.deadline < nowISO
            );
            const isToday = sameDayISO(key, todayISO);

            return (
              <button
                key={idx}
                className={[
                  "h-28 border rounded p-2 text-left relative",
                  isThisMonth ? "" : "opacity-50",
                  isToday ? "ring-2 ring-black" : "",
                  overdue
                    ? "bg-red-50 border-red-200"
                    : undone > 0
                    ? "bg-yellow-50"
                    : "",
                ].join(" ")}
                onClick={() => {
                  setOpenDay(key);
                  setSelectedDay(key);
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

      {/* ===== 週表示 ===== */}
      {view === "week" && (
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d, idx) => {
            const key = ymd(d);
            const items = logsByDate[key] ?? [];
            const done = items.filter((i) => i.completed).length;
            const undone = items.length - done;
            const overdue = items.some(
              (i) => !i.completed && i.deadline && i.deadline < nowISO
            );
            const isToday = sameDayISO(key, todayISO);
            return (
              <button
                key={idx}
                className={[
                  "h-36 border rounded p-2 text-left relative",
                  isToday ? "ring-2 ring-black" : "",
                  overdue
                    ? "bg-red-50 border-red-200"
                    : undone > 0
                    ? "bg-yellow-50"
                    : "",
                ].join(" ")}
                onClick={() => setOpenDay(key)}
              >
                <div className="text-xs font-medium">
                  {key}{" "}
                  <span className="opacity-60">({weekLabels[d.getDay()]})</span>
                </div>
                <div className="mt-1 space-y-1 text-xs">
                  {getDayLogsFilteredSorted(key)
                    .slice(0, 4)
                    .map((l) => (
                      <div key={l.id} className="flex items-center gap-1">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            l.completed ? "bg-green-600" : "bg-yellow-600"
                          }`}
                        />
                        <span className="opacity-70">
                          {toLocalHM(l.deadline) || "--:--"}
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

      {/* ===== 日表示（ページ内でモーダル相当の内容を展開） ===== */}
      {view === "day" && (
        <DayPanel
          dayISO={selectedDay}
          tasksQ={tasksQ.data ?? []}
          getList={() => getDayLogsFilteredSorted(selectedDay)}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterTaskId={filterTaskId}
          setFilterTaskId={setFilterTaskId}
          selectTaskId={selectTaskId}
          setSelectTaskId={setSelectTaskId}
          showNewTaskFields={showNewTaskFields}
          setShowNewTaskFields={setShowNewTaskFields}
          newTask={newTask}
          setNewTask={setNewTask}
          newDeadlineTime={newDeadlineTime}
          setNewDeadlineTime={setNewDeadlineTime}
          onAdd={() => onAdd(selectedDay)}
          updateLog={updateLog}
          deleteLog={deleteLog}
          onClose={undefined}
        />
      )}

      {/* ===== 日モーダル（month / week で日クリック時） ===== */}
      {openDay && view !== "day" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setOpenDay(null);
              qc.invalidateQueries({ queryKey: ["mentor_tasks"] });
            }}
          />
          <div className="relative z-10 w-[94vw] max-w-3xl bg-white text-gray-900 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">{openDay} のタスク</h2>
              <button
                className="text-sm underline"
                onClick={() => {
                  setOpenDay(null);
                  qc.invalidateQueries({ queryKey: ["mentor_tasks"] });
                }}
              >
                閉じる
              </button>
            </div>

            <DayPanel
              dayISO={openDay}
              tasksQ={tasksQ.data ?? []}
              getList={() => getDayLogsFilteredSorted(openDay)}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterTaskId={filterTaskId}
              setFilterTaskId={setFilterTaskId}
              selectTaskId={selectTaskId}
              setSelectTaskId={setSelectTaskId}
              showNewTaskFields={showNewTaskFields}
              setShowNewTaskFields={setShowNewTaskFields}
              newTask={newTask}
              setNewTask={setNewTask}
              newDeadlineTime={newDeadlineTime}
              setNewDeadlineTime={setNewDeadlineTime}
              onAdd={() => onAdd(openDay)}
              updateLog={updateLog}
              deleteLog={deleteLog}
              onClose={() => {
                setOpenDay(null);
                qc.invalidateQueries({ queryKey: ["mentor_tasks"] });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/** 日単位の一覧＋追加フォーム（モーダル/日表示の共通コンポーネント） */
function DayPanel(props: {
  dayISO: string;
  tasksQ: MentorTask[];
  getList: () => MentorTaskLog[];
  filterCategory: string;
  setFilterCategory: (v: string) => void;
  filterTaskId: string;
  setFilterTaskId: (v: string) => void;
  selectTaskId: string;
  setSelectTaskId: (v: string) => void;
  showNewTaskFields: boolean;
  setShowNewTaskFields: (v: boolean) => void;
  newTask: { name: string; category: string; description: string };
  setNewTask: (v: {
    name: string;
    category: string;
    description: string;
  }) => void;
  newDeadlineTime: string;
  setNewDeadlineTime: (v: string) => void;
  onAdd: () => void;
  updateLog: ReturnType<typeof useMutation<any, any, any>>;
  deleteLog: ReturnType<typeof useMutation<any, any, any>>;
  onClose?: () => void;
}) {
  const {
    tasksQ,
    getList,
    filterCategory,
    setFilterCategory,
    filterTaskId,
    setFilterTaskId,
    selectTaskId,
    setSelectTaskId,
    showNewTaskFields,
    setShowNewTaskFields,
    newTask,
    setNewTask,
    newDeadlineTime,
    setNewDeadlineTime,
    onAdd,
    updateLog,
    deleteLog,
    onClose,
  } = props;

  const list = getList();

  // 追加フォームの候補（フィルタ適用後）
  const tasksForSelect = useMemo(() => {
    let arr = tasksQ;
    if (filterCategory) arr = arr.filter((t) => t.category === filterCategory);
    if (filterTaskId) arr = arr.filter((t) => String(t.id) === filterTaskId);
    return arr;
  }, [tasksQ, filterCategory, filterTaskId]);

  // タスクIDフィルタが入ったら選択状態へ同期
  useEffect(() => {
    if (filterTaskId) setSelectTaskId(filterTaskId);
  }, [filterTaskId, setSelectTaskId]);

  // フィルタで選択値が候補外になったらクリア
  useEffect(() => {
    if (
      selectTaskId &&
      !tasksForSelect.some((t) => String(t.id) === selectTaskId)
    ) {
      setSelectTaskId("");
    }
  }, [tasksForSelect, selectTaskId, setSelectTaskId]);

  // カテゴリ候補（重複排除）
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    tasksQ.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasksQ]);

  return (
    <div>
      {/* フィルタ */}
      <div className="grid md:grid-cols-4 gap-3 mb-3">
        <div>
          <label className="block text-sm text-gray-800">
            カテゴリで絞り込み
          </label>
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
        </div>
        <div>
          <label className="block text-sm text-gray-800">
            タスクで絞り込み
          </label>
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
        </div>
      </div>

      {/* 追加フォーム */}
      <div className="border rounded p-3 space-y-3 mb-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-800">タスク</label>
            {!showNewTaskFields ? (
              <select
                className="border rounded p-2 w-full"
                value={selectTaskId}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "__new__") {
                    setShowNewTaskFields(true);
                    return;
                  }
                  setSelectTaskId(v);
                }}
              >
                <option value="">選択してください</option>
                {tasksForSelect.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
                <option value="__new__">＋ 新規タスクを作成…</option>
              </select>
            ) : (
              <div className="space-y-2">
                <input
                  className="border rounded p-2 w-full"
                  placeholder="タスク名（必須）"
                  value={newTask.name}
                  onChange={(e) =>
                    setNewTask({ ...newTask, name: e.target.value })
                  }
                />
                <div className="grid md:grid-cols-2 gap-2">
                  <input
                    className="border rounded p-2 w-full"
                    placeholder="カテゴリ（任意）"
                    value={newTask.category}
                    onChange={(e) =>
                      setNewTask({ ...newTask, category: e.target.value })
                    }
                  />
                  <input
                    className="border rounded p-2 w-full"
                    placeholder="説明（任意）"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                  />
                </div>
                <div className="text-xs">
                  <button
                    className="underline"
                    onClick={() => {
                      setShowNewTaskFields(false);
                      setNewTask({ name: "", category: "", description: "" });
                    }}
                  >
                    ← 既存タスクを選ぶ
                  </button>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-800">期限（時刻）</label>
            <input
              type="time"
              className="border rounded p-2 w-full"
              value={newDeadlineTime}
              onChange={(e) => setNewDeadlineTime(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          {onClose && (
            <button className="px-4 py-2 rounded border" onClick={onClose}>
              キャンセル
            </button>
          )}
          <button
            className="px-4 py-2 rounded bg-black text-white"
            onClick={onAdd}
          >
            この日に追加
          </button>
        </div>
      </div>

      {/* 一覧 */}
      <div className="space-y-2 max-h-[50vh] overflow-auto pr-1">
        {list.length === 0 && (
          <div className="text-sm opacity-70">この日のタスクはありません</div>
        )}
        {list.map((l) => {
          const task = tasksQ.find((t) => t.id === l.mentor_task_id);
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
                    {task?.name ?? "（不明なタスク）"}
                  </span>
                  {task?.category && (
                    <span className="ml-2 text-xs px-2 py-0.5 border rounded">
                      {task.category}
                    </span>
                  )}
                </div>
                {task?.description && (
                  <div className="text-sm opacity-80">{task.description}</div>
                )}
                <div className="text-xs opacity-70">
                  期限:{" "}
                  {l.deadline ? new Date(l.deadline).toLocaleString() : "-"}（
                  {toLocalHM(l.deadline) || "--:--"}） ／ 実行:{" "}
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
                    onChange={(e) =>
                      updateLog.mutate({
                        id: l.id,
                        completed: e.target.checked,
                      })
                    }
                  />
                  完了
                </label>
                <button
                  className="text-red-600 underline"
                  onClick={() => {
                    if (confirm("このタスクログを削除しますか？"))
                      deleteLog.mutate(l.id);
                  }}
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
