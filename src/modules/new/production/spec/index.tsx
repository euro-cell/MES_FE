import { Route, Routes } from 'react-router-dom';
import SpecList from './SpecList';
import SpecNew from './SpecNew';

export default function SpecPage() {
  return (
    <div className='module-page'>
      <Routes>
        <Route path='' element={<SpecList />} />
        <Route path='new' element={<SpecNew />} />
      </Routes>
    </div>
  );
}
