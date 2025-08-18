import React, { useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import Modal from "./components/common/Modal";

import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

import TrainingLogsPage from "./pages/training/TrainingLogsPage";
import TrainingLogDetail from "./pages/training/TrainingLogDetail";
import TrainingMenusPage from "./pages/training/TrainingMenusPage";
import TrainingMenuDetail from "./pages/training/TrainingMenuDetail";

import StudyLogsPage from "./pages/study/StudyLogsPage";
import StudyLogDetail from "./pages/study/StudyLogDetail";
import StudyGoalsPage from "./pages/study/StudyGoalsPage";
import StudyGoalDetail from "./pages/study/StudyGoalDetail";

import MealLogsPage from "./pages/meal/MealLogsPage";
import MealLogDetail from "./pages/meal/MealLogDetail";
import MealMenusPage from "./pages/meal/MealMenusPage";
import MealMenuDetail from "./pages/meal/MealMenuDetail";

import MentorCalendarPage from "./pages/mentor/MentorCalendarPage";

export default function App() {
  const { user, signOut } = useAuth();
  const [openQuick, setOpenQuick] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* ヘッダー（日本語ラベル＋ログイン状態で出し分け） */}
      <header className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur border-b border-gray-800">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          {/* 左：ブランド（トップへ） */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-black text-white grid place-items-center font-bold">
              S
            </div>
            <Link
              to="/"
              className="text-xl font-extrabold tracking-tight text-white"
            >
              SuperTasks
            </Link>
          </div>

          {/* 右：ナビ＋クイックアクション */}
          <div className="flex items-center gap-3">
            <nav className="hidden sm:flex items-center gap-4 text-sm">
              <Link to="/" className="text-gray-300 hover:text-white">
                トップ
              </Link>
              {!user ? (
                <>
                  <Link to="/login" className="text-gray-300 hover:text-white">
                    ログイン
                  </Link>
                  <Link to="/signup" className="text-gray-300 hover:text-white">
                    ユーザー登録
                  </Link>
                </>
              ) : (
                <button
                  onClick={signOut}
                  className="text-gray-300 hover:text-white"
                  title="ログアウト"
                >
                  ログアウト
                </button>
              )}
            </nav>

            {/* クイックアクション（右上の丸アイコン） */}
            <button
              aria-label="クイックアクション"
              title="クイックアクション"
              onClick={() => setOpenQuick(true)}
              className="h-9 w-9 rounded-full bg-gray-800 border border-gray-700 grid place-items-center hover:bg-gray-700 active:opacity-80"
            >
              {/* 稲妻アイコン */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-white"
              >
                <path d="M13 3L4 14h6l-1 7 9-11h-6l1-7z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 本文 */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* トレーニング管理 */}
          <Route
            path="/training"
            element={
              <ProtectedRoute>
                <TrainingLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training/logs/:id"
            element={
              <ProtectedRoute>
                <TrainingLogDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training/menus"
            element={
              <ProtectedRoute>
                <TrainingMenusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training/menus/:id"
            element={
              <ProtectedRoute>
                <TrainingMenuDetail />
              </ProtectedRoute>
            }
          />

          {/* 食事管理 */}
          <Route
            path="/meals"
            element={
              <ProtectedRoute>
                <MealLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meals/logs/:id"
            element={
              <ProtectedRoute>
                <MealLogDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meals/menus"
            element={
              <ProtectedRoute>
                <MealMenusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meals/menus/:id"
            element={
              <ProtectedRoute>
                <MealMenuDetail />
              </ProtectedRoute>
            }
          />

          {/* 勉強管理 */}
          <Route
            path="/study"
            element={
              <ProtectedRoute>
                <StudyLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study/logs/:id"
            element={
              <ProtectedRoute>
                <StudyLogDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study/goals"
            element={
              <ProtectedRoute>
                <StudyGoalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study/goals/:id"
            element={
              <ProtectedRoute>
                <StudyGoalDetail />
              </ProtectedRoute>
            }
          />

          {/* メンター業務 */}
          <Route
            path="/mentor"
            element={
              <ProtectedRoute>
                <MentorCalendarPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </main>

      {/* クイックアクション：モーダル（右上アイコンから） */}
      <Modal
        open={openQuick}
        onClose={() => setOpenQuick(false)}
        title="クイックアクション"
      >
        <div className="grid grid-cols-1 gap-3">
          <a
            href="/training"
            className="rounded border border-gray-800 bg-gray-800 p-3 hover:bg-gray-700"
          >
            ＋ トレーニングログを追加
          </a>
          <a
            href="/meals"
            className="rounded border border-gray-800 bg-gray-800 p-3 hover:bg-gray-700"
          >
            ＋ 食事ログを追加
          </a>
          <a
            href="/study"
            className="rounded border border-gray-800 bg-gray-800 p-3 hover:bg-gray-700"
          >
            ＋ 学習ログ/目標を追加
          </a>
          <a
            href="/mentor"
            className="rounded border border-gray-800 bg-gray-800 p-3 hover:bg-gray-700"
          >
            ＋ メンタータスクを追加
          </a>
        </div>
      </Modal>
    </div>
  );
}
