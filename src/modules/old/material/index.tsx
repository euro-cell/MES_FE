import { useState } from 'react';
import '../../../styles/material/material.css';
import MaterialNav from './MaterialNav';
import RawMaterialList from './rawMaterial/RawMaterialList';

export default function MaterialPage() {
  const [activeTab, setActiveTab] = useState<'raw' | 'cell'>('raw');

  return (
    <div className='material-page'>
      <MaterialNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className='material-content'>
        {activeTab === 'raw' && <RawMaterialList />}
        {/* {activeTab === 'cell' && <CellMaterialList />} */}
      </div>
    </div>
  );
}
