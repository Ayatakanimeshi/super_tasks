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
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-900 text-gray-100">
      {/* ヘッダー（日本語ラベル＋ログイン状態で出し分け） */}
      <header className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur border-b border-gray-800">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-2 sm:gap-3">
          {/* 左：ブランド（トップへ） */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-black text-white grid place-items-center font-bold">
              S
            </div>
            <Link
              to="/"
              className="text-xl font-extrabold tracking-tight text-white truncate"
            >
              SuperTasks
            </Link>
          </div>

          {/* 右：ナビ＋クイックアクション */}
          <div className="flex items-center gap-3 shrink-0">
            {/* ナビ：モバイルでも表示される簡易版（text-sm） */}
            <nav className="flex items-center gap-3 text-sm">
              <Link
                to="/"
                className="text-gray-300 hover:text-white hidden sm:inline"
              >
                トップ
              </Link>

              {!user ? (
                <div className="flex items-center gap-2">
                  {/* ログイン */}
                  <Link
                    to="/login"
                    aria-label="ログイン"
                    title="ログイン"
                    className="h-9 w-9 grid place-items-center rounded-full border border-gray-700 bg-gray-800 hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/60 text-white"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5 block max-w-none fill-none stroke-white"
                      strokeWidth={2}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 17l5-5-5-5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15 12H3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>

                  {/* ユーザー登録 */}
                  <Link
                    to="/signup"
                    aria-label="ユーザー登録"
                    title="ユーザー登録"
                    className="h-9 w-9 grid place-items-center rounded-full border border-gray-700 bg-gray-800 hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/60 text-white"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5 block max-w-none fill-none stroke-white"
                      strokeWidth={2}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20 21a8 8 0 0 0-16 0"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 8v6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 11h6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* （任意）ユーザー丸アイコン */}
                  <div className="hidden sm:grid place-items-center h-9 w-9 rounded-full bg-gray-700 text-white text-xs font-bold">
                    {user.email?.[0]?.toUpperCase() ?? "U"}
                  </div>

                  {/* ログアウト */}
                  <button
                    aria-label="ログアウト"
                    title="ログアウト"
                    onClick={signOut}
                    className="h-9 w-9 grid place-items-center rounded-full border border-gray-700 bg-gray-800 hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/60 text-white p-0"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5 block max-w-none fill-none stroke-white"
                      strokeWidth={2}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 17l5-5-5-5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 12H9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </nav>

            {/* クイックアクション（サイズ/アイコン調整） */}
            <button
              aria-label="どの記録を登録しますか？"
              title="どの記録を登録しますか？"
              onClick={() => setOpenQuick(true)}
              className="h-10 w-10 grid place-items-center rounded-full border border-gray-700 bg-gray-800
             hover:bg-gray-700 active:opacity-80 focus:outline-none focus-visible:ring-2
             focus-visible:ring-brand-secondary/60 text-white p-0"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 block max-w-none fill-none stroke-white"
                strokeWidth={2}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 2L3 14h7l-1 8 12-16h-7l1-6z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
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
