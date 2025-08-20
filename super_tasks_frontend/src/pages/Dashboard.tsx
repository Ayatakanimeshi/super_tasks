import React, { useMemo, useState } from "react";
import Section from "../components/common/Section";
import StatCard from "../components/common/StatCard";
import Spinner from "../components/common/Spinner";
import Empty from "../components/common/Empty";
import ErrorMessage from "../components/common/ErrorMessage";
import { useQuery } from "@tanstack/react-query";
import { trainingApi } from "../features/training/trainingApi";
import { studyApi } from "../features/study/studyApi";
import { mealApi } from "../features/meal/mealApi";
import { mentorApi } from "../features/mentor/mentorApi";

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}
const todayISO = ymd(new Date());

export default function Dashboard() {
  // 直近7日レンジ
  const [range] = useState(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 6);
    return { from: from.toISOString(), to: to.toISOString() };
  });

  // fetch
  const menusQ = useQuery({
    queryKey: ["training_menus"],
    queryFn: trainingApi.listMenus,
  });
  const logsQ = useQuery({
    queryKey: ["training_logs", "7d"],
    queryFn: () => trainingApi.listLogs({ from: range.from, to: range.to }),
  });

  const studyGoalsQ = useQuery({
    queryKey: ["study_goals"],
    queryFn: studyApi.listGoals,
  });
  const studyLogsQ = useQuery({
    queryKey: ["study_logs", "7d"],
    queryFn: () => studyApi.listLogs({ from: range.from, to: range.to }),
  });

  const mealMenusQ = useQuery({
    queryKey: ["meal_menus"],
    queryFn: mealApi.listMenus,
  });
  const mealLogsQ = useQuery({
    queryKey: ["meal_logs", "7d"],
    queryFn: () => mealApi.listLogs({ from: range.from, to: range.to }),
  });

  const mentorTasksQ = useQuery({
    queryKey: ["mentor_tasks"],
    queryFn: mentorApi.listTasks,
  });
  const mentorLogsQ = useQuery({
    queryKey: ["mentor_task_logs", "7d"],
    queryFn: () => mentorApi.listLogs({ from: range.from, to: range.to }),
  });

  // 集計（今日）
  const todayTrainingCount = useMemo(
    () =>
      (logsQ.data ?? []).filter(
        (l) => l.performed_at?.slice(0, 10) === todayISO
      ).length,
    [logsQ.data]
  );

  const todayCalories = useMemo(() => {
    const byId = new Map((mealMenusQ.data ?? []).map((m) => [m.id, m]));
    return (mealLogsQ.data ?? [])
      .filter((l) => l.meal_date?.slice(0, 10) === todayISO)
      .reduce((sum, l) => {
        const menu = byId.get(l.meal_menu_id);
        if (!menu) return sum;
        const c = menu.calories ?? 0;
        const amt = l.amount ?? 1;
        return sum + c * amt;
      }, 0);
  }, [mealLogsQ.data, mealMenusQ.data]);

  const todayStudyHours = useMemo(() => {
    return (studyLogsQ.data ?? [])
      .filter((l) => l.study_date?.slice(0, 10) === todayISO)
      .reduce((sum, l) => sum + (l.hours ?? 0), 0);
  }, [studyLogsQ.data]);

  // 置換: 期限超過ではなく「今日が期限」
  const todayDueMentorCount = useMemo(() => {
    return (mentorLogsQ.data ?? []).filter((l) => {
      if (l.completed) return false;
      if (!l.deadline) return false;
      const due = l.deadline.slice(0, 10);
      return due === todayISO; // 今日が期限
    }).length;
  }, [mentorLogsQ.data]);

  // 表示ラベル
  const rangeLabel = useMemo(() => {
    const f = new Date(range.from);
    const t = new Date(range.to);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${f.getFullYear()}/${pad(f.getMonth() + 1)}/${pad(
      f.getDate()
    )} - ${t.getFullYear()}/${pad(t.getMonth() + 1)}/${pad(t.getDate())}`;
  }, [range.from, range.to]);

  // 最近
  const recentTrainings = useMemo(
    () => (logsQ.data ?? []).slice(-3).reverse(),
    [logsQ.data]
  );
  const dueSoonMentor = useMemo(() => {
    return (mentorLogsQ.data ?? [])
      .filter((l) => !l.completed && l.deadline)
      .sort(
        (a, b) =>
          new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
      )
      .slice(0, 5);
  }, [mentorLogsQ.data]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      {/* タイトルだけ（ヘッダーやクイックモーダルは App.tsx 側で制御） */}
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          本日の記録
        </h1>
      </div>

      {/* 概況カード（スマホ2列） */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard
          label="今日のトレーニング回数"
          value={logsQ.isLoading ? <Spinner /> : todayTrainingCount}
          onClick={() => (window.location.href = "/training")}
        />
        <StatCard
          label="今日の摂取カロリー"
          value={
            mealLogsQ.isLoading || mealMenusQ.isLoading ? (
              <Spinner />
            ) : (
              `${Math.round(todayCalories)} kcal`
            )
          }
          onClick={() => (window.location.href = "/meals")}
        />
        <StatCard
          label="今日の学習時間"
          value={studyLogsQ.isLoading ? <Spinner /> : `${todayStudyHours} h`}
          onClick={() => (window.location.href = "/study")}
        />
        <StatCard
          label="今日が期限のタスク"
          value={mentorLogsQ.isLoading ? <Spinner /> : todayDueMentorCount}
          onClick={() => (window.location.href = "/mentor")}
        />
      </section>

      {/* 最近の項目（各3件） */}
      <section className="grid grid-cols-1 gap-4">
        <Section
          title="最近のトレーニング"
          actions={
            <a
              className="text-blue-400 hover:text-blue-300 underline"
              href="/training"
            >
              すべて見る
            </a>
          }
        >
          {logsQ.isError ? (
            <ErrorMessage />
          ) : logsQ.isLoading ? (
            <Spinner />
          ) : (logsQ.data ?? []).slice(-3).reverse().length === 0 ? (
            <Empty />
          ) : (
            recentTrainings.map((l) => {
              const menu = (menusQ.data ?? []).find(
                (m) => m.id === l.training_menu_id
              );
              return (
                <a
                  key={l.id}
                  href={`/training/logs/${l.id}`}
                  className="block rounded border border-gray-800 bg-gray-800 p-3 hover:bg-gray-700"
                >
                  <div className="text-sm text-gray-400">
                    {new Date(l.performed_at).toLocaleString()}
                  </div>
                  <div className="font-medium text-white">
                    {menu?.name ?? "種目"} — {l.weight}kg × {l.reps}回
                  </div>
                </a>
              );
            })
          )}
        </Section>

        <Section
          title="期限が近いメンタータスク"
          actions={
            <a
              className="text-blue-400 hover:text-blue-300 underline"
              href="/mentor"
            >
              カレンダーへ
            </a>
          }
        >
          {mentorLogsQ.isError ? (
            <ErrorMessage />
          ) : mentorLogsQ.isLoading ? (
            <Spinner />
          ) : dueSoonMentor.length === 0 ? (
            <Empty />
          ) : (
            dueSoonMentor.map((l) => {
              const t = (mentorTasksQ.data ?? []).find(
                (x) => x.id === l.mentor_task_id
              );
              return (
                <div
                  key={l.id}
                  className="rounded border border-gray-800 bg-gray-800 p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-white">
                      {t?.name ?? "タスク"}
                    </div>
                    <div className="text-xs text-gray-400">
                      期限:{" "}
                      {l.deadline ? new Date(l.deadline).toLocaleString() : "-"}
                    </div>
                  </div>
                  <a
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                    href="/mentor"
                  >
                    開く
                  </a>
                </div>
              );
            })
          )}
        </Section>
      </section>
    </div>
  );
}
