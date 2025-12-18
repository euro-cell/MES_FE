import { Route, Routes } from 'react-router-dom';
import ManageIndex from './manage';

export default function LotIndex() {
  return (
    <Routes>
      <Route path='/*' element={<ManageIndex />} />
      {/* 나중에 추가: <Route path='search/*' element={<SearchIndex />} /> */}
    </Routes>
  );
}
