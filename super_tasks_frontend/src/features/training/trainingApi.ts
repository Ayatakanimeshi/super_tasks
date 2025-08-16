import { api } from "../../lib/api";

export type TrainingMenu = {
  id: number;
  name: string;
  category: string;
  created_at: string;
  updated_at: string;
};
export type TrainingLog = {
  id: number;
  user_id: number;
  training_menu_id: number;
  weight: number;
  reps: number;
  performed_at: string;
  duration_minutes?: number | null;
  created_at: string;
  updated_at: string;
};

export const trainingApi = {
  // Menus
  listMenus: async (): Promise<TrainingMenu[]> =>
    (await api.get("/training_menus")).data,
  getMenu: async (id: number): Promise<TrainingMenu> =>
    (await api.get(`/training_menus/${id}`)).data,
  createMenu: async (payload: Pick<TrainingMenu, "name" | "category">) =>
    (await api.post("/training_menus", { training_menu: payload })).data,
  updateMenu: async (
    id: number,
    payload: Partial<Pick<TrainingMenu, "name" | "category">>
  ) =>
    (await api.patch(`/training_menus/${id}`, { training_menu: payload })).data,
  deleteMenu: async (id: number) =>
    (await api.delete(`/training_menus/${id}`)).data,

  // Logs
  listLogs: async (params?: {
    from?: string;
    to?: string;
  }): Promise<TrainingLog[]> =>
    (await api.get("/training_logs", { params })).data,

  getLog: async (id: number): Promise<TrainingLog> =>
    (await api.get(`/training_logs/${id}`)).data,

  // 個別取得APIが未定義のため、当面は list を用いてクライアント側で抽出
  createLog: async (
    payload: Pick<
      TrainingLog,
      | "training_menu_id"
      | "weight"
      | "reps"
      | "performed_at"
      | "duration_minutes"
    >
  ) => (await api.post("/training_logs", { training_log: payload })).data,
  updateLog: async (
    id: number,
    payload: Partial<
      Pick<
        TrainingLog,
        | "training_menu_id"
        | "weight"
        | "reps"
        | "performed_at"
        | "duration_minutes"
      >
    >
  ) =>
    (await api.patch(`/training_logs/${id}`, { training_log: payload })).data,
  deleteLog: async (id: number) =>
    (await api.delete(`/training_logs/${id}`)).data,
};
[];
