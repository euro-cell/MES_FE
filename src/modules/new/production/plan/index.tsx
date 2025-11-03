import { Route, Routes } from 'react-router-dom';
import PlanList from './PlanList';
import PlanRegister from './PlanRegister';
import PlanView from './PlanView';

export default function PlanPage() {
  return (
    <div className='module-page'>
      <Routes>
        <Route path='/' element={<PlanList />} />
        <Route path='register' element={<PlanRegister />} />
        <Route path='/view' element={<PlanView />} />
      </Routes>
    </div>
  );
}
