import { Route, Routes } from 'react-router-dom';
import WorklogProjectList from './WorklogProjectList';
import WorklogPage from './WorklogPage';
import BinderRegister from './processes/binder/BinderRegister';

export default function WorklogIndex() {
  return (
    <Routes>
      <Route path='' element={<WorklogProjectList />} />
      <Route path=':projectId' element={<WorklogPage />} />

      {/* Binder routes */}
      <Route path=':projectId/binder/register' element={<BinderRegister />} />
    </Routes>
  );
}