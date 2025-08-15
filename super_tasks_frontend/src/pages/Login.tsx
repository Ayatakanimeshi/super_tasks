import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { login, bootstrapCsrf } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { user, refresh } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("メールとパスワードを入力してください");
      return;
    }
    setLoading(true);
    try {
      await bootstrapCsrf();
      await login(email, password);
      await refresh();
      nav("/dashboard", { replace: true });
    } catch (e: any) {
      setError("メールまたはパスワードが正しくありません");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">ログイン</h1>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">メールアドレス</label>
          <input
            className="border rounded w-full p-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm">パスワード</label>
          <input
            className="border rounded w-full p-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          className="bg-black text-white rounded px-4 py-2 w-full"
          disabled={loading}
        >
          {loading ? "処理中..." : "ログイン"}
        </button>
      </form>
      <div className="text-sm">
        アカウントが未作成の方は{" "}
        <Link className="underline" to="/signup">
          新規登録
        </Link>
      </div>
    </div>
  );
}
