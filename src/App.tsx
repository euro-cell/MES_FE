import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import BaseLayout from './layouts/BaseLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './hooks/useAuth';
import Dashboard from './modules/dashboard';
import ProductionPage from './modules/production';
import User from './modules/users';
import Permission from './modules/permission';
import BatteryDesignPage from './modules/batteryDesign';
import MaterialPage from './modules/material';

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>로딩 중...</div>;
  if (!isAuthenticated) return <Navigate to='/login' replace />;

  return children;
}

function App() {
  return (
    <Routes>
      {/* 로그인 & 회원가입은 레이아웃 없이 표시 */}
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />

      {/* 보호된 라우트 (로그인 필요) */}
      <Route
        path='/'
        element={
          <ProtectedRoute>
            <BaseLayout>
              <Dashboard />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <BaseLayout>
              <Dashboard />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/production'
        element={
          <ProtectedRoute>
            <BaseLayout>
              <ProductionPage />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/specification'
        element={
          <ProtectedRoute>
            <BaseLayout>
              <BatteryDesignPage />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/material'
        element={
          <ProtectedRoute>
            <BaseLayout>
              <MaterialPage />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/users'
        element={
          <ProtectedRoute>
            <BaseLayout>
              <User />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/permission'
        element={
          <ProtectedRoute>
            <BaseLayout>
              <Permission />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      {/* 잘못된 경로 → 대시보드로 리다이렉트 */}
      <Route path='*' element={<Navigate to='/dashboard' replace />} />
    </Routes>
  );
}
export default App;
