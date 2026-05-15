import { Route, Routes } from 'react-router-dom';
import SpecList from './SpecList';
import SpecNew from './specification/SpecNew';
import SpecView from './specification/SpecView';
import SpecEdit from './specification/SpecEdit';
import MaterialNew from './material/MaterialNew';
import MaterialEdit from './material/MaterialEdit';
import BomNew from './bom/BomNew';
import BomView from './bom/BomView';
import BomEdit from './bom/BomEdit';

export default function SpecPage() {
  return (
    <div className='module-page'>
      <Routes>
        <Route path='' element={<SpecList />} />
        <Route path='new/:id' element={<SpecNew />} />
        <Route path='view/:id' element={<SpecView />} />
        <Route path='edit/:id' element={<SpecEdit />} />
        <Route path='material/new/:id' element={<MaterialNew />} />
        <Route path='material/edit/:id' element={<MaterialEdit />} />
        <Route path='bom/new/:id' element={<BomNew />} />
        <Route path='bom/view/:id' element={<BomView />} />
        <Route path='bom/edit/:id' element={<BomEdit />} />
      </Routes>
    </div>
  );
}
