import { Routes, Route, Navigate } from 'react-router-dom';
import BaseLayout from './layouts/BaseLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Routes>
      {/* 로그인 & 회원가입은 레이아웃 없이 표시 */}
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />

      {/* 나머지는 공통 BaseLayout으로 감싸기 */}
      <Route
        path='/'
        element={
          <BaseLayout>
            <Dashboard />
          </BaseLayout>
        }
      />

      <Route
        path='/dashboard'
        element={
          <BaseLayout>
            <Dashboard />
          </BaseLayout>
        }
      />

      <Route
        path='/projects'
        element={
          <BaseLayout>
            <Projects />
          </BaseLayout>
        }
      />

      {/* 잘못된 경로 → 대시보드로 리다이렉트 */}
      <Route path='*' element={<Navigate to='/dashboard' replace />} />
    </Routes>
  );
}

export default App;
