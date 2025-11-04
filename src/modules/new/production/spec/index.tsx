import { Route, Routes } from 'react-router-dom';
import SpecList from './SpecList';

export default function SpecPage() {
  return (
    <div className='module-page'>
      <Routes>
        <Route path='' element={<SpecList />} />
      </Routes>
    </div>
  );
}
