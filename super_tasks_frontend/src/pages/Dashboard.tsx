import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">メインメニュー</h1>
        <div className="text-sm">
          {user?.name}（{user?.email}）
          <button onClick={signOut} className="ml-3 underline">
            ログアウト
          </button>
        </div>
      </header>

      <nav className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link className="border rounded p-4 hover:bg-gray-50" to="/training">
          ジム管理
        </Link>
        <Link className="border rounded p-4 hover:bg-gray-50" to="/meals">
          食事管理
        </Link>
        <Link className="border rounded p-4 hover:bg-gray-50" to="/study">
          勉強管理
        </Link>
        <Link className="border rounded p-4 hover:bg-gray-50" to="/mentor">
          メンター業務
        </Link>
      </nav>

      <p className="text-sm text-gray-600">
        ※ 各機能ページはこの後のスプリントで実装します。
      </p>
    </div>
  );
}
