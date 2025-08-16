import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { studyApi } from "../../features/study/studyApi";

export default function StudyLogDetail() {
  const { id } = useParams();
  const logsQ = useQuery({
    queryKey: ["study_logs_all"],
    queryFn: () => studyApi.listLogs({}),
  });
  const goalsQ = useQuery({
    queryKey: ["study_goals"],
    queryFn: studyApi.listGoals,
  });

  if (logsQ.isLoading || goalsQ.isLoading)
    return <div className="p-6">Loading...</div>;
  const log = logsQ.data?.find((l) => String(l.id) === id);
  if (!log) return <div className="p-6">Not Found</div>;
  const goal = goalsQ.data?.find((g) => g.id === log.study_goal_id);

  return (
    <div className="p-6 space-y-4">
      <Link to="/study" className="underline">
        ← ログ一覧に戻る
      </Link>
      <h1 className="text-2xl font-bold">学習ログ 詳細</h1>
      <div className="border rounded p-4 space-y-1">
        <div>日時: {new Date(log.study_date).toLocaleString()}</div>
        <div>目標: {goal?.name ?? "（不明な目標）"}</div>
        <div>学習時間: {log.hours} h</div>
        <div className="text-xs opacity-60">ID: {log.id}</div>
      </div>
    </div>
  );
}
