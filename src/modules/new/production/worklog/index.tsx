import { Route, Routes } from 'react-router-dom';
import WorklogProjectList from './WorklogProjectList';
import WorklogPage from './WorklogPage';
import BinderRegister from './processes/01-binder/BinderRegister';
import BinderView from './processes/01-binder/BinderView';
import BinderEdit from './processes/01-binder/BinderEdit';
import SlurryRegister from './processes/02-slurry/SlurryRegister';
import SlurryView from './processes/02-slurry/SlurryView';
import SlurryEdit from './processes/02-slurry/SlurryEdit';
import CoatingRegister from './processes/03-coating/CoatingRegister';
import CoatingView from './processes/03-coating/CoatingView';
import CoatingEdit from './processes/03-coating/CoatingEdit';
import PressRegister from './processes/04-press/PressRegister';
import PressView from './processes/04-press/PressView';
import PressEdit from './processes/04-press/PressEdit';
import NotchingRegister from './processes/06-notching/NotchingRegister';
import NotchingView from './processes/06-notching/NotchingView';
import NotchingEdit from './processes/06-notching/NotchingEdit';
import VdRegister from './processes/07-vd/VdRegister';
import VdView from './processes/07-vd/VdView';
import VdEdit from './processes/07-vd/VdEdit';
import FormingRegister from './processes/08-forming/FormingRegister';
import FormingView from './processes/08-forming/FormingView';
import FormingEdit from './processes/08-forming/FormingEdit';
import StackRegister from './processes/09-stacking/StackingRegister';
import StackView from './processes/09-stacking/StackingView';
import StackEdit from './processes/09-stacking/StackingEdit';
import WeldingRegister from './processes/10-welding/WeldingRegister';
import WeldingView from './processes/10-welding/WeldingView';
import WeldingEdit from './processes/10-welding/WeldingEdit';
import SealingRegister from './processes/11-sealing/SealingRegister';
import SealingView from './processes/11-sealing/SealingView';
import SealingEdit from './processes/11-sealing/SealingEdit';

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

      {/* Notching routes */}
      <Route path=':projectId/notching/register' element={<NotchingRegister />} />
      <Route path=':projectId/notching/view/:worklogId' element={<NotchingView />} />
      <Route path=':projectId/notching/edit/:worklogId' element={<NotchingEdit />} />

      {/* VD routes */}
      <Route path=':projectId/vd/register' element={<VdRegister />} />
      <Route path=':projectId/vd/view/:worklogId' element={<VdView />} />
      <Route path=':projectId/vd/edit/:worklogId' element={<VdEdit />} />

      {/* Forming routes */}
      <Route path=':projectId/forming/register' element={<FormingRegister />} />
      <Route path=':projectId/forming/view/:worklogId' element={<FormingView />} />
      <Route path=':projectId/forming/edit/:worklogId' element={<FormingEdit />} />

      {/* Stack routes */}
      <Route path=':projectId/stacking/register' element={<StackRegister />} />
      <Route path=':projectId/stacking/view/:worklogId' element={<StackView />} />
      <Route path=':projectId/stacking/edit/:worklogId' element={<StackEdit />} />

      {/* Welding routes */}
      <Route path=':projectId/welding/register' element={<WeldingRegister />} />
      <Route path=':projectId/welding/view/:worklogId' element={<WeldingView />} />
      <Route path=':projectId/welding/edit/:worklogId' element={<WeldingEdit />} />

      {/* Sealing routes */}
      <Route path=':projectId/sealing/register' element={<SealingRegister />} />
      <Route path=':projectId/sealing/view/:worklogId' element={<SealingView />} />
      <Route path=':projectId/sealing/edit/:worklogId' element={<SealingEdit />} />
    </Routes>
  );
}
