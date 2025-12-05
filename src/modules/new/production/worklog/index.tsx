import { Route, Routes } from 'react-router-dom';
import WorklogProjectList from './WorklogProjectList';
import WorklogPage from './WorklogPage';

export default function WorklogIndex() {
  return (
    <Routes>
      <Route path='' element={<WorklogProjectList />} />
      <Route path=':projectId' element={<WorklogPage />} />
    </Routes>
  );
}