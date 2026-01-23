import { Route, Routes } from 'react-router-dom';
import LotSearchPage from './LotSearchPage';

export default function SearchIndex() {
  return (
    <Routes>
      <Route path="" element={<LotSearchPage />} />
    </Routes>
  );
}
