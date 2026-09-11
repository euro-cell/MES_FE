import { Route, Routes } from 'react-router-dom';
import PlanList from './PlanList';
import PlanRegister from './PlanRegister';
import PlanView from './PlanView';
import PlanEdit from './PlanEdit';
import PlanTemplateList from './template/PlanTemplateList';
import PlanTemplateEdit from './template/PlanTemplateEdit';

export default function PlanPage() {
  return (
    <div className='module-page'>
      <Routes>
        <Route path='' element={<PlanList />} />
        <Route path='register/:id' element={<PlanRegister />} />
        <Route path='view/:id' element={<PlanView />} />
        <Route path='edit/:id' element={<PlanEdit />} />
        <Route path='template' element={<PlanTemplateList />} />
        <Route path='template/:id' element={<PlanTemplateEdit />} />
      </Routes>
    </div>
  );
}
