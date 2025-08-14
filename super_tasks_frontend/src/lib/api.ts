// Axiosライブラリをインポート
import axios from "axios";

// APIのベースURLを定義
const BASE_URL = "/api";

// Axiosインスタンスを作成し、共通設定を適用
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // クッキーを含むリクエストを許可
  timeout: 10000, // 10秒でタイムアウト
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

// 認証系API
export async function register(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  const res = await api.post("register", { user: payload });
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

// レスポンスインターセプターを設定
api.interceptors.response.use(
  (res) => res, // 成功時はそのままレスポンスを返す
  (error) => {
    // 401エラー（認証エラー）の場合はログインページにリダイレクト
    if (error.response.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
