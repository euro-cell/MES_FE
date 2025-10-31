import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import BaseLayout from './layouts/BaseLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './hooks/useAuth';
import { MENU_CONFIG } from './modules/menuConfig'; // ✅ 중앙 메뉴 설정 import

// ✅ 기존 모듈
import Dashboard from './modules/dashboard';
import ProductionPage from './modules/production';
import User from './modules/users';
import Permission from './modules/permission';
import BatteryDesignPage from './modules/batteryDesign';
import MaterialPage from './modules/material';
import StatusPage from './modules/status';

// ✅ 신규 모듈 (modules-new)
import ProductionNew from './modules/new/production';
import StockNew from './modules/new/stock';
import QualityNew from './modules/new/quality';
import PlantNew from './modules/new/plant';
import DrawNew from './modules/new/draw';
import EtcNew from './modules/new/etc';

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

      {/* ✅ 기존 메뉴 라우팅 */}
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
        path='/status'
        element={
          <ProtectedRoute>
            <BaseLayout>
              <StatusPage />
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

      {/* ✅ 신규 메뉴 (modules-new) - MENU_CONFIG 사용 */}
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
              <ProductionNew />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${MENU_CONFIG.stock.path}/*`}
        element={
          <ProtectedRoute>
            <BaseLayout>
              <StockNew />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${MENU_CONFIG.quality.path}/*`}
        element={
          <ProtectedRoute>
            <BaseLayout>
              <QualityNew />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${MENU_CONFIG.plant.path}/*`}
        element={
          <ProtectedRoute>
            <BaseLayout>
              <PlantNew />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${MENU_CONFIG.draw.path}/*`}
        element={
          <ProtectedRoute>
            <BaseLayout>
              <DrawNew />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${MENU_CONFIG.etc.path}/*`}
        element={
          <ProtectedRoute>
            <BaseLayout>
              <EtcNew />
            </BaseLayout>
          </ProtectedRoute>
        }
      />

      {/* ✅ 잘못된 경로 → 대시보드로 리다이렉트 */}
      <Route path='*' element={<Navigate to='/dashboard' replace />} />
    </Routes>
  );
}
export default App;
