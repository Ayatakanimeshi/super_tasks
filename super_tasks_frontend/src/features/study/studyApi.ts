import { api } from "../../lib/api";

export type StudyGoal = {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  category: string | null;
  target_hours: number | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type StudyLog = {
  id: number;
  user_id: number;
  study_goal_id: number;
  hours: number;
  study_date: string;
  created_at: string;
  updated_at: string;
};

export const studyApi = {
  // Goals
  listGoals: async (): Promise<StudyGoal[]> =>
    (await api.get("/study_goals")).data,
  getGoal: async (id: number): Promise<StudyGoal> =>
    (await api.get(`/study_goals/${id}`)).data,
  createGoal: async (
    p: Pick<
      StudyGoal,
      "name" | "description" | "category" | "target_hours" | "completed"
    >
  ) => (await api.post("/study_goals", { study_goal: p })).data,
  updateGoal: async (
    id: number,
    p: Partial<
      Pick<
        StudyGoal,
        "name" | "description" | "category" | "target_hours" | "completed"
      >
    >
  ) => (await api.patch(`/study_goals/${id}`, { study_goal: p })).data,
  deleteGoal: async (id: number) =>
    (await api.delete(`/study_goals/${id}`)).data,

  // Logs
  listLogs: async (params?: {
    from?: string;
    to?: string;
    study_goal_id?: number;
  }): Promise<StudyLog[]> => {
    const res = (await api.get("/study_logs", { params })).data as StudyLog[];
    // サーバ側の goal 絞り込みが未実装でも安全に動くよう保険
    if (params?.study_goal_id)
      return res.filter((l) => l.study_goal_id === params.study_goal_id);
    return res;
  },
  createLog: async (
    p: Pick<StudyLog, "study_goal_id" | "hours" | "study_date">
  ) => (await api.post("/study_logs", { study_log: p })).data,
  updateLog: async (
    id: number,
    p: Partial<Pick<StudyLog, "study_goal_id" | "hours" | "study_date">>
  ) => (await api.patch(`/study_logs/${id}`, { study_log: p })).data,
  deleteLog: async (id: number) => (await api.delete(`/study_logs/${id}`)).data,
};
