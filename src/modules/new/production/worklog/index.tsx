import { Route, Routes } from 'react-router-dom';
import WorklogProjectList from './WorklogProjectList';
import WorklogPage from './WorklogPage';
import BinderRegister from './processes/binder/BinderRegister';
import BinderView from './processes/binder/BinderView';
import BinderEdit from './processes/binder/BinderEdit';

export default function WorklogIndex() {
  return (
    <Routes>
      <Route path='' element={<WorklogProjectList />} />
      <Route path=':projectId' element={<WorklogPage />} />

      {/* Binder routes */}
      <Route path=':projectId/binder/register' element={<BinderRegister />} />
      <Route path=':projectId/binder/view/:worklogId' element={<BinderView />} />
      <Route path=':projectId/binder/edit/:worklogId' element={<BinderEdit />} />
    </Routes>
  );
}