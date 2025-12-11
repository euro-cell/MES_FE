import { Route, Routes } from 'react-router-dom';
import WorklogProjectList from './WorklogProjectList';
import WorklogPage from './WorklogPage';
import BinderRegister from './processes/binder/BinderRegister';
import BinderView from './processes/binder/BinderView';
import BinderEdit from './processes/binder/BinderEdit';
import SlurryRegister from './processes/slurry/SlurryRegister';
import SlurryView from './processes/slurry/SlurryView';
import SlurryEdit from './processes/slurry/SlurryEdit';
import CoatingRegister from './processes/coating/CoatingRegister';
import CoatingView from './processes/coating/CoatingView';
import CoatingEdit from './processes/coating/CoatingEdit';
import PressRegister from './processes/press/PressRegister';
import PressView from './processes/press/PressView';
import PressEdit from './processes/press/PressEdit';

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

      {/* Coating routes */}
      <Route path=':projectId/coating/register' element={<CoatingRegister />} />
      <Route path=':projectId/coating/view/:worklogId' element={<CoatingView />} />
      <Route path=':projectId/coating/edit/:worklogId' element={<CoatingEdit />} />

      {/* Press routes */}
      <Route path=':projectId/press/register' element={<PressRegister />} />
      <Route path=':projectId/press/view/:worklogId' element={<PressView />} />
      <Route path=':projectId/press/edit/:worklogId' element={<PressEdit />} />
    </Routes>
  );
}
