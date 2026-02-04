import { Route, Routes } from 'react-router-dom';
import IQCProjectList from './IQCProjectList';
import IQCPage from './IQCPage';

export default function IQCIndex() {
  return (
    <Routes>
      <Route path='' element={<IQCProjectList />} />
      <Route path=':projectId' element={<IQCPage />} />
    </Routes>
  );
}
