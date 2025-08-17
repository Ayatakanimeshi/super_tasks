import React, { useMemo, useState } from "react";
import Section from "../components/common/Section";
import StatCard from "../components/common/StatCard";
import Spinner from "../components/common/Spinner";
import Empty from "../components/common/Empty";
import ErrorMessage from "../components/common/ErrorMessage";
import Modal from "../components/common/Modal";
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
  // === fetch: 直近7日で取得（UI体感が良い）
  const [range] = useState(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 6);
    return { from: from.toISOString(), to: to.toISOString() };
  });

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

  // === 集計（今日）
  const todayTrainingCount = useMemo(
    () =>
      (logsQ.data ?? []).filter(
        (l) => l.performed_at?.slice(0, 10) === todayISO
      ).length,
    [logsQ.data]
  );
  const todayCalories = useMemo(() => {
    // meal_logs: amount * menu.calories を合算（amountが未使用の設計なら menu.calories を加算）
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
    const hours = (studyLogsQ.data ?? [])
      .filter((l) => l.study_date?.slice(0, 10) === todayISO)
      .reduce((sum, l) => sum + (l.hours ?? 0), 0);
    return hours; // h単位
  }, [studyLogsQ.data]);

  const overdueMentorCount = useMemo(() => {
    const now = new Date().toISOString();
    return (mentorLogsQ.data ?? []).filter(
      (l) => !l.completed && l.deadline && l.deadline < now
    ).length;
  }, [mentorLogsQ.data]);

  // === クイックアクション（簡易モーダルの例：今はリンク中心に）
  const [openQuick, setOpenQuick] = useState(false);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <button
          className="px-4 py-2 rounded bg-black text-white"
          onClick={() => setOpenQuick(true)}
        >
          ＋ クイックアクション
        </button>
      </div>

      {/* 概況カード */}
      <div className="grid md:grid-cols-4 gap-3">
        <StatCard
          label="今日のトレーニング回数"
          value={logsQ.isLoading ? <Spinner /> : todayTrainingCount}
          hint="直近7日のログから集計"
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
          hint="直近7日の食事ログから集計"
          onClick={() => (window.location.href = "/meals")}
        />
        <StatCard
          label="今日の学習時間"
          value={studyLogsQ.isLoading ? <Spinner /> : `${todayStudyHours} h`}
          hint="直近7日の学習ログから集計"
          onClick={() => (window.location.href = "/study")}
        />
        <StatCard
          label="期限超過タスク"
          value={mentorLogsQ.isLoading ? <Spinner /> : overdueMentorCount}
          hint="メンター業務（未完 & 期限切れ）"
          onClick={() => (window.location.href = "/mentor")}
        />
      </div>

      {/* 最近の項目（各3件） */}
      <div className="grid md:grid-cols-2 gap-4">
        <Section
          title="最近のトレーニング"
          actions={
            <a className="underline" href="/training">
              すべて見る
            </a>
          }
        >
          {logsQ.isError ? (
            <ErrorMessage />
          ) : logsQ.isLoading ? (
            <Spinner />
          ) : (
            (logsQ.data ?? [])
              .slice(-3)
              .reverse()
              .map((l) => {
                const menu = (menusQ.data ?? []).find(
                  (m) => m.id === l.training_menu_id
                );
                return (
                  <a
                    key={l.id}
                    href={`/training/logs/${l.id}`}
                    className="block border rounded p-3 hover:bg-gray-50"
                  >
                    <div className="text-sm opacity-70">
                      {new Date(l.performed_at).toLocaleString()}
                    </div>
                    <div className="font-medium">
                      {menu?.name ?? "種目"} — {l.weight}kg × {l.reps}回
                    </div>
                  </a>
                );
              }) || <Empty />
          )}
        </Section>

        <Section
          title="期限が近いメンタータスク"
          actions={
            <a className="underline" href="/mentor">
              カレンダーへ
            </a>
          }
        >
          {mentorLogsQ.isError ? (
            <ErrorMessage />
          ) : mentorLogsQ.isLoading ? (
            <Spinner />
          ) : (
            (mentorLogsQ.data ?? [])
              .filter((l) => !l.completed && l.deadline)
              .sort(
                (a, b) =>
                  new Date(a.deadline!).getTime() -
                  new Date(b.deadline!).getTime()
              )
              .slice(0, 5)
              .map((l) => {
                const t = (mentorTasksQ.data ?? []).find(
                  (x) => x.id === l.mentor_task_id
                );
                return (
                  <div
                    key={l.id}
                    className="border rounded p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{t?.name ?? "タスク"}</div>
                      <div className="text-xs opacity-70">
                        期限:{" "}
                        {l.deadline
                          ? new Date(l.deadline).toLocaleString()
                          : "-"}
                      </div>
                    </div>
                    <a className="underline text-sm" href="/mentor">
                      開く
                    </a>
                  </div>
                );
              })
              .concat(
                (mentorLogsQ.data ?? []).filter((l) => !l.completed).length ===
                  0
                  ? [<Empty key="empty" />]
                  : []
              )
          )}
        </Section>
      </div>

      <Modal
        open={openQuick}
        onClose={() => setOpenQuick(false)}
        title="クイックアクション"
      >
        <div className="grid md:grid-cols-2 gap-3">
          <a href="/training" className="border rounded p-3 hover:bg-gray-50">
            ＋ トレーニングログを追加
          </a>
          <a href="/meals" className="border rounded p-3 hover:bg-gray-50">
            ＋ 食事ログを追加
          </a>
          <a href="/study" className="border rounded p-3 hover:bg-gray-50">
            ＋ 学習ログ/目標を追加
          </a>
          <a href="/mentor" className="border rounded p-3 hover:bg-gray-50">
            ＋ メンタータスクを追加
          </a>
        </div>
      </Modal>
    </div>
  );
}
