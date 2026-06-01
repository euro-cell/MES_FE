import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const WorklogProjectList = lazy(() => import('./WorklogProjectList'));
const WorklogPage = lazy(() => import('./WorklogPage'));
const BinderRegister = lazy(() => import('./processes/01-binder/BinderRegister'));
const BinderView = lazy(() => import('./processes/01-binder/BinderView'));
const BinderEdit = lazy(() => import('./processes/01-binder/BinderEdit'));
const SlurryRegister = lazy(() => import('./processes/02-slurry/SlurryRegister'));
const SlurryView = lazy(() => import('./processes/02-slurry/SlurryView'));
const SlurryEdit = lazy(() => import('./processes/02-slurry/SlurryEdit'));
const CoatingRegister = lazy(() => import('./processes/03-coating/CoatingRegister'));
const CoatingView = lazy(() => import('./processes/03-coating/CoatingView'));
const CoatingEdit = lazy(() => import('./processes/03-coating/CoatingEdit'));
const PressRegister = lazy(() => import('./processes/04-press/PressRegister'));
const PressView = lazy(() => import('./processes/04-press/PressView'));
const PressEdit = lazy(() => import('./processes/04-press/PressEdit'));
const NotchingRegister = lazy(() => import('./processes/06-notching/NotchingRegister'));
const NotchingView = lazy(() => import('./processes/06-notching/NotchingView'));
const NotchingEdit = lazy(() => import('./processes/06-notching/NotchingEdit'));
const VDRegister = lazy(() => import('./processes/07-vd/VDRegister'));
const VDView = lazy(() => import('./processes/07-vd/VDView'));
const VDEdit = lazy(() => import('./processes/07-vd/VDEdit'));
const FormingRegister = lazy(() => import('./processes/08-forming/FormingRegister'));
const FormingView = lazy(() => import('./processes/08-forming/FormingView'));
const FormingEdit = lazy(() => import('./processes/08-forming/FormingEdit'));
const StackRegister = lazy(() => import('./processes/09-stacking/StackingRegister'));
const StackView = lazy(() => import('./processes/09-stacking/StackingView'));
const StackEdit = lazy(() => import('./processes/09-stacking/StackingEdit'));
const WeldingRegister = lazy(() => import('./processes/10-welding/WeldingRegister'));
const WeldingView = lazy(() => import('./processes/10-welding/WeldingView'));
const WeldingEdit = lazy(() => import('./processes/10-welding/WeldingEdit'));
const SealingRegister = lazy(() => import('./processes/11-sealing/SealingRegister'));
const SealingView = lazy(() => import('./processes/11-sealing/SealingView'));
const SealingEdit = lazy(() => import('./processes/11-sealing/SealingEdit'));
const FillingRegister = lazy(() => import('./processes/12-filling/FillingRegister'));
const FillingView = lazy(() => import('./processes/12-filling/FillingView'));
const FillingEdit = lazy(() => import('./processes/12-filling/FillingEdit'));
const FormationRegister = lazy(() => import('./processes/13-formation/FormationRegister'));
const FormationView = lazy(() => import('./processes/13-formation/FormationView'));
const FormationEdit = lazy(() => import('./processes/13-formation/FormationEdit'));
const GradingRegister = lazy(() => import('./processes/14-grading/GradingRegister'));
const GradingView = lazy(() => import('./processes/14-grading/GradingView'));
const GradingEdit = lazy(() => import('./processes/14-grading/GradingEdit'));
const InspectionRegister = lazy(() => import('./processes/15-inspection/InspectionRegister'));
const InspectionView = lazy(() => import('./processes/15-inspection/InspectionView'));
const InspectionEdit = lazy(() => import('./processes/15-inspection/InspectionEdit'));

export default function WorklogIndex() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
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
      <Route path=':projectId/vd/register' element={<VDRegister />} />
      <Route path=':projectId/vd/view/:worklogId' element={<VDView />} />
      <Route path=':projectId/vd/edit/:worklogId' element={<VDEdit />} />

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

      {/* Filling routes */}
      <Route path=':projectId/filling/register' element={<FillingRegister />} />
      <Route path=':projectId/filling/view/:worklogId' element={<FillingView />} />
      <Route path=':projectId/filling/edit/:worklogId' element={<FillingEdit />} />

      {/* Formation routes */}
      <Route path=':projectId/formation/register' element={<FormationRegister />} />
      <Route path=':projectId/formation/view/:worklogId' element={<FormationView />} />
      <Route path=':projectId/formation/edit/:worklogId' element={<FormationEdit />} />

      {/* Grading routes */}
      <Route path=':projectId/grading/register' element={<GradingRegister />} />
      <Route path=':projectId/grading/view/:worklogId' element={<GradingView />} />
      <Route path=':projectId/grading/edit/:worklogId' element={<GradingEdit />} />

      {/* Inspection routes */}
      <Route path=':projectId/inspection/register' element={<InspectionRegister />} />
      <Route path=':projectId/inspection/view/:worklogId' element={<InspectionView />} />
      <Route path=':projectId/inspection/edit/:worklogId' element={<InspectionEdit />} />
    </Routes>
    </Suspense>
  );
}
