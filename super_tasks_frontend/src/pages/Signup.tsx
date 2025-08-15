import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { register, bootstrapCsrf } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

export default function SignupPage() {
  const { user, refresh } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password || !password2) {
      setError("全て入力してください");
      return;
    }
    if (password.length < 8) {
      setError("パスワードは8文字以上です");
      return;
    }
    if (password !== password2) {
      setError("パスワードが一致しません");
      return;
    }
    setLoading(true);
    try {
      await bootstrapCsrf();
      await register({
        name,
        email,
        password,
        password_confirmation: password2,
      });
      await refresh();
      nav("/dashboard", { replace: true });
    } catch (e: any) {
      setError("登録に失敗しました（メール重複の可能性）");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">新規登録</h1>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">名前</label>
          <input
            className="border rounded w-full p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
        <div>
          <label className="block text-sm">パスワード（確認）</label>
          <input
            className="border rounded w-full p-2"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
        </div>
        <button
          className="bg-black text-white rounded px-4 py-2 w-full"
          disabled={loading}
        >
          {loading ? "処理中..." : "登録する"}
        </button>
      </form>
      <div className="text-sm">
        アカウントをお持ちの方は{" "}
        <Link className="underline" to="/login">
          ログイン
        </Link>
      </div>
    </div>
  );
}
