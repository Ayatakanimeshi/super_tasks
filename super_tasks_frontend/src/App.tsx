import { Routes, Route, Link, Navigate } from "react-router-dom";
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

export default function App() {
  return (
    <div className="min-h-screen p-6 space-y-6">
      <nav className="flex gap-4">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
      </nav>

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

        <Route
          path="/mentor"
          element={
            <ProtectedRoute>
              <div className="p-6">Mentor（準備中）</div>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </div>
  );
}
