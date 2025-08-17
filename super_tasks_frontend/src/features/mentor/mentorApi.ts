import { api } from "../../lib/api";

export type MentorTask = {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
};

export type MentorTaskLog = {
  id: number;
  user_id: number;
  mentor_task_id: number;
  executed_at: string | null; // 実行日時（完了時に入れる想定）
  deadline: string | null; // 期日（カレンダー表示の基準）
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export const mentorApi = {
  // tasks (マスタ)
  listTasks: async (): Promise<MentorTask[]> =>
    (await api.get("/mentor_tasks")).data,
  createTask: async (
    p: Pick<MentorTask, "name" | "description" | "category">
  ) => (await api.post("/mentor_tasks", { mentor_task: p })).data,
  getTask: async (id: number): Promise<MentorTask> =>
    (await api.get(`/mentor_tasks/${id}`)).data,
  updateTask: async (
    id: number,
    p: Partial<Pick<MentorTask, "name" | "description" | "category">>
  ) => (await api.patch(`/mentor_tasks/${id}`, { mentor_task: p })).data,
  deleteTask: async (id: number) =>
    (await api.delete(`/mentor_tasks/${id}`)).data,

  // logs（1日単位・deadline基準で配置）
  listLogs: async (params?: {
    from?: string;
    to?: string;
  }): Promise<MentorTaskLog[]> =>
    (await api.get("/mentor_task_logs", { params })).data,
  createLog: async (
    p: Pick<
      MentorTaskLog,
      "mentor_task_id" | "deadline" | "executed_at" | "completed"
    >
  ) => (await api.post("/mentor_task_logs", { mentor_task_log: p })).data,
  updateLog: async (
    id: number,
    p: Partial<
      Pick<
        MentorTaskLog,
        "mentor_task_id" | "deadline" | "executed_at" | "completed"
      >
    >
  ) =>
    (await api.patch(`/mentor_task_logs/${id}`, { mentor_task_log: p })).data,
  deleteLog: async (id: number) =>
    (await api.delete(`/mentor_task_logs/${id}`)).data,
};
