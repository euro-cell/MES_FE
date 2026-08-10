import { Route, Routes } from 'react-router-dom';
import IQCProto2ProjectList from './IQCProto2ProjectList';
import IQCProto2Page from './IQCProto2Page';

export default function IQCProto2Index() {
  return (
    <Routes>
      <Route path='' element={<IQCProto2ProjectList />} />
      <Route path=':projectId' element={<IQCProto2Page />} />
    </Routes>
  );
}
