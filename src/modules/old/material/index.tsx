import { useState } from 'react';
import styles from '../../../styles/material/material.module.css';
import MaterialNav from './MaterialNav';
import RawMaterialList from './rawMaterial/RawMaterialList';

export default function MaterialPage() {
  const [activeTab, setActiveTab] = useState<'raw' | 'cell'>('raw');

  return (
    <div className={styles.materialPage}>
      <MaterialNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className={styles.materialContent}>
        {activeTab === 'raw' && <RawMaterialList />}
        {/* {activeTab === 'cell' && <CellMaterialList />} */}
      </div>
    </div>
  );
}
