import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import type { ReactElement } from 'react';
import BaseLayout from './layouts/BaseLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './hooks/useAuth';
import { MENU_CONFIG } from './modules/menuConfig'; // ✅ 중앙 메뉴 설정 import

// ✅ 도메인 모듈 lazy load (코드 분할)
const Dashboard = lazy(() => import('./modules/dashboard'));
const Project = lazy(() => import('./modules/project'));
const Stock = lazy(() => import('./modules/stock'));
const Quality = lazy(() => import('./modules/quality'));
const Plant = lazy(() => import('./modules/plant'));
const Draw = lazy(() => import('./modules/draw'));
const Etc = lazy(() => import('./modules/etc'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));


function ProtectedRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>로딩 중...</div>;
  if (!isAuthenticated) return <Navigate to='/login' replace />;

  return children;
}

function App() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
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
        path={`${MENU_CONFIG.project.path}/*`}
        element={
          <ProtectedRoute>
            <BaseLayout>
              <Project />
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

      <Route
        path='/profile'
        element={
          <ProtectedRoute>
            <BaseLayout>
              <ProfilePage />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      {/* ✅ 잘못된 경로 → 메인으로 리다이렉트 */}
      <Route path='*' element={<Navigate to='/main' replace />} />
    </Routes>
    </Suspense>
  );
}
export default App;
