import { api } from "../../lib/api";

export type MealMenu = {
  id: number;
  name: string;
  time_category: string | null; // breakfast / lunch / dinner / snack など
  food_category: string | null; // rice / meat / salad など
  calories: number; // 1人前(=1.0) あたりの kcal
  created_at: string;
  updated_at: string;
};

export type MealLog = {
  id: number;
  user_id: number;
  meal_menu_id: number;
  amount: number; // 量（1.0=1人前）
  meal_date: string; // ISO
  created_at: string;
  updated_at: string;
};

export const mealApi = {
  // Menus
  listMenus: async (): Promise<MealMenu[]> =>
    (await api.get("/meal_menus")).data,
  getMenu: async (id: number): Promise<MealMenu> =>
    (await api.get(`/meal_menus/${id}`)).data,
  createMenu: async (
    p: Pick<MealMenu, "name" | "time_category" | "food_category" | "calories">
  ) => (await api.post("/meal_menus", { meal_menu: p })).data,
  updateMenu: async (
    id: number,
    p: Partial<
      Pick<MealMenu, "name" | "time_category" | "food_category" | "calories">
    >
  ) => (await api.patch(`/meal_menus/${id}`, { meal_menu: p })).data,
  deleteMenu: async (id: number) =>
    (await api.delete(`/meal_menus/${id}`)).data,

  // Logs
  listLogs: async (params?: {
    from?: string;
    to?: string;
    meal_menu_id?: number;
    time_category?: string;
  }): Promise<MealLog[]> => {
    const res = (await api.get("/meal_logs", { params })).data as MealLog[];
    // サーバ側の絞り込みが未実装でもクライアント側で落ちないように保険
    let out = res;
    if (params?.meal_menu_id)
      out = out.filter((l) => l.meal_menu_id === params.meal_menu_id);
    if (params?.time_category) {
      const menus = (await api.get("/meal_menus")).data as MealMenu[];
      const ids = new Set(
        menus
          .filter((m) => m.time_category === params.time_category)
          .map((m) => m.id)
      );
      out = out.filter((l) => ids.has(l.meal_menu_id));
    }
    return out;
  },
  createLog: async (
    p: Pick<MealLog, "meal_menu_id" | "amount" | "meal_date">
  ) => (await api.post("/meal_logs", { meal_log: p })).data,
  updateLog: async (
    id: number,
    p: Partial<Pick<MealLog, "meal_menu_id" | "amount" | "meal_date">>
  ) => (await api.patch(`/meal_logs/${id}`, { meal_log: p })).data,
  deleteLog: async (id: number) => (await api.delete(`/meal_logs/${id}`)).data,
};
