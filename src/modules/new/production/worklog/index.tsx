import { Route, Routes } from 'react-router-dom';
import WorklogProjectList from './WorklogProjectList';
import WorklogPage from './WorklogPage';
import BinderRegister from './processes/binder/BinderRegister';
import BinderView from './processes/binder/BinderView';
import BinderEdit from './processes/binder/BinderEdit';
import SlurryRegister from './processes/slurry/SlurryRegister';
import SlurryView from './processes/slurry/SlurryView';
import SlurryEdit from './processes/slurry/SlurryEdit';

export default function WorklogIndex() {
  return (
    <Routes>
      <Route path='' element={<WorklogProjectList />} />
      <Route path=':projectId' element={<WorklogPage />} />

      {/* Binder routes */}
      <Route path=':projectId/binder/register' element={<BinderRegister />} />
      <Route path=':projectId/binder/view/:worklogId' element={<BinderView />} />
      <Route path=':projectId/binder/edit/:worklogId' element={<BinderEdit />} />

      {/* Slurry routes */}
      <Route path=':projectId/slurry/register' element={<SlurryRegister />} />
      <Route path=':projectId/slurry/view/:worklogId' element={<SlurryView />} />
      <Route path=':projectId/slurry/edit/:worklogId' element={<SlurryEdit />} />
    </Routes>
  );
}
