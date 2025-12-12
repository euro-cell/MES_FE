import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import BaseLayout from './layouts/BaseLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './hooks/useAuth';
import { MENU_CONFIG } from './modules/menuConfig'; // ✅ 중앙 메뉴 설정 import

// ✅ 현재 모듈
import Dashboard from './modules/dashboard';
import Production from './modules/production';
import Stock from './modules/stock';
import Quality from './modules/quality';
import Plant from './modules/plant';
import Draw from './modules/draw';
import Etc from './modules/etc';

// ✅ Old 모듈 (임시 유지)
import MaterialOld from './modules/old/material';
import StatusOld from './modules/old/status';
import UsersOld from './modules/old/users';
import PermissionOld from './modules/old/permission';

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>로딩 중...</div>;
  if (!isAuthenticated) return <Navigate to='/login' replace />;

  return children;
}

function App() {
  return (
    <Routes>
      {/* ✅ 로그인 & 회원가입은 레이아웃 없이 표시 */}
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />

      {/* ✅ 보호된 라우트 (로그인 필요) */}
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

      {/* ✅ 현재 메뉴 라우팅 - MENU_CONFIG 사용 */}
      <Route
        path={MENU_CONFIG.dashboard.path}
        element={
          <ProtectedRoute>
            <BaseLayout>
              <Dashboard />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${MENU_CONFIG.production.path}/*`}
        element={
          <ProtectedRoute>
            <BaseLayout>
              <Production />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${MENU_CONFIG.stock.path}/*`}
        element={
          <ProtectedRoute>
            <BaseLayout>
              <Stock />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${MENU_CONFIG.quality.path}/*`}
        element={
          <ProtectedRoute>
            <BaseLayout>
              <Quality />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${MENU_CONFIG.plant.path}/*`}
        element={
          <ProtectedRoute>
            <BaseLayout>
              <Plant />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${MENU_CONFIG.draw.path}/*`}
        element={
          <ProtectedRoute>
            <BaseLayout>
              <Draw />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${MENU_CONFIG.etc.path}/*`}
        element={
          <ProtectedRoute>
            <BaseLayout>
              <Etc />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      {/* ✅ Old 메뉴 라우팅 (임시 유지) */}
      <Route
        path='/material/*'
        element={
          <ProtectedRoute>
            <BaseLayout>
              <MaterialOld />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/status/*'
        element={
          <ProtectedRoute>
            <BaseLayout>
              <StatusOld />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/users/*'
        element={
          <ProtectedRoute>
            <BaseLayout>
              <UsersOld />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/permission/*'
        element={
          <ProtectedRoute>
            <BaseLayout>
              <PermissionOld />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      {/* ✅ 잘못된 경로 → 메인으로 리다이렉트 */}
      <Route path='*' element={<Navigate to='/main' replace />} />
    </Routes>
  );
}
export default App;
