import { Route, Routes } from 'react-router-dom';
import SpecList from './SpecList';
import SpecNew from './specification/SpecNew';
import SpecView from './specification/SpecView';
import SpecEdit from './specification/SpecEdit';
import MaterialNew from './material/MaterialNew';

export default function SpecPage() {
  return (
    <div className='module-page'>
      <Routes>
        <Route path='' element={<SpecList />} />
        <Route path='new' element={<SpecNew />} />
        <Route path='view' element={<SpecView />} />
        <Route path='edit' element={<SpecEdit />} />
        <Route path='material/new' element={<MaterialNew />} />
      </Routes>
    </div>
  );
}
