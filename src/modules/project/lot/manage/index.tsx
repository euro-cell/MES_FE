import { Route, Routes } from 'react-router-dom';
import LotProjectList from './LotProjectList';
import LotPage from './LotPage';

export default function ManageIndex() {
  return (
    <Routes>
      <Route path='' element={<LotProjectList />} />
      <Route path=':projectId' element={<LotPage />} />
    </Routes>
  );
}
