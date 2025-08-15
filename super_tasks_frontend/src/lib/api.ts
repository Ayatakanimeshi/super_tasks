import axios from "axios";

const BASE_URL = "/api"; // 開発時は Vite の devServer で /api にプロキシ or 同一オリジン

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// 起動時に一度CSRFトークンを取得して、以降の書き込み系で送る
export async function bootstrapCsrf() {
  try {
    const { data } = await api.get("csrf");
    api.defaults.headers.common["X-CSRF-Token"] = data.csrfToken;
    console.info("[bootstrapCsrf] OK", data);
  } catch (e) {
    console.warn("Failed to fetch CSRF token", e);
  }
}

// 認証系API（/signup に合わせて修正）
export async function register(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  const res = await api.post("signup", { user: payload });
  return res.data;
}

export async function login(email: string, password: string) {
  const res = await api.post("login", { email, password });
  return res.data;
}

export async function logout() {
  const res = await api.delete("logout");
  return res.data;
}

export async function me() {
  const res = await api.get("me");
  return res.data;
}

// 401 のときに /login へ（無限ループを避けるため、現在位置が /login /signup なら何もしない）
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/signup") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
