import { Route, Routes } from 'react-router-dom';
import OQCProjectList from './OQCProjectList';
import OQCPage from './OQCPage';

export default function OQCIndex() {
  return (
    <Routes>
      <Route path='' element={<OQCProjectList />} />
      <Route path=':projectId' element={<OQCPage />} />
    </Routes>
  );
}
