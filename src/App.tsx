import { Routes, Route, Navigate } from 'react-router-dom';
import BaseLayout from './layouts/BaseLayout';
import Dashboard from './modules/dashboard/Dashboard';
import Projects from './modules/production/ProductionList';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './hooks/useAuth';
import type { ReactElement } from 'react';

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
        path='/projects'
        element={
          <ProtectedRoute>
            <BaseLayout>
              <Projects />
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
