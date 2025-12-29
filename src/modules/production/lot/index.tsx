import { Route, Routes } from 'react-router-dom';
import ManageIndex from './manage';
import SearchIndex from './search';

export default function LotIndex() {
  return (
    <Routes>
      <Route path='/*' element={<ManageIndex />} />
      <Route path='search/*' element={<SearchIndex />} />
    </Routes>
  );
}
