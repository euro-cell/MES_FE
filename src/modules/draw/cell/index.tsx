import { Route, Routes } from 'react-router-dom';
import CellDrawingProjectList from './CellDrawingProjectList';
import CellDrawingPage from './CellDrawingPage';

export default function CellDrawingIndex() {
  return (
    <Routes>
      <Route path='' element={<CellDrawingProjectList />} />
      <Route path=':projectId' element={<CellDrawingPage />} />
    </Routes>
  );
}
