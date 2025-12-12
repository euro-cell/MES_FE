import { Route, Routes } from 'react-router-dom';
import StatusProjectList from './StatusProjectList';
import StatusPage from './StatusPage';

export default function StatusIndex() {
  return (
    <Routes>
      <Route path='' element={<StatusProjectList />} />
      <Route path=':projectId' element={<StatusPage />} />
    </Routes>
  );
}
