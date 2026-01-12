import { Route, Routes } from 'react-router-dom';
import LQCProjectList from './LQCProjectList';
import LQCPage from './LQCPage';

export default function LQCIndex() {
  return (
    <Routes>
      <Route path='' element={<LQCProjectList />} />
      <Route path=':projectId' element={<LQCPage />} />
    </Routes>
  );
}
