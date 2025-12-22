import { useState } from 'react';
import styles from '../../../../styles/material/rawMaterial.module.css';
import StatusAll from './status/StatusAll';
import StatusElectrode from './status/StatusElectrode';
import StatusAssembly from './status/StatusAssembly';
import ProductionList from './production/ProductionList';

export default function RawMaterialList() {
  const [subTab, setSubTab] = useState<'status' | 'project'>('status');
  const [statusTab, setStatusTab] = useState<'all' | 'electrode' | 'assembly'>('all');

  return (
    <div className={styles.rawMaterialPage}>
      <h3>📦 원부자재</h3>

      {/* 상위 메뉴 */}
      <div className={styles.subNav}>
        <button className={subTab === 'status' ? styles.active : ''} onClick={() => setSubTab('status')}>
          현황
        </button>
        <button className={subTab === 'project' ? styles.active : ''} onClick={() => setSubTab('project')}>
          프로젝트
        </button>
      </div>

      {/* 현황 하위 탭 */}
      {subTab === 'status' && (
        <div className={styles.subSubNav}>
          <button className={statusTab === 'all' ? styles.active : ''} onClick={() => setStatusTab('all')}>
            전체
          </button>
          <button className={statusTab === 'electrode' ? styles.active : ''} onClick={() => setStatusTab('electrode')}>
            전극
          </button>
          <button className={statusTab === 'assembly' ? styles.active : ''} onClick={() => setStatusTab('assembly')}>
            조립
          </button>
        </div>
      )}

      {/* 내용 */}
      <div className={styles.rawMaterialContent}>
        {subTab === 'status' && statusTab === 'all' && <StatusAll />}
        {subTab === 'status' && statusTab === 'electrode' && <StatusElectrode />}
        {subTab === 'status' && statusTab === 'assembly' && <StatusAssembly />}
        {subTab === 'project' && <ProductionList />}
      </div>
    </div>
  );
}
