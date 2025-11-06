import { Route, Routes } from 'react-router-dom';
import SpecList from './SpecList';
import SpecNew from './SpecNew';
import SpecView from './SpecView';

export default function SpecPage() {
  return (
    <div className='module-page'>
      <Routes>
        <Route path='' element={<SpecList />} />
        <Route path='new' element={<SpecNew />} />
        <Route path='view' element={<SpecView />} />
      </Routes>
    </div>
  );
}
