import { useState } from 'react';
import '../../../styles/material/rawMaterial.css';
import StatusAll from './status/StatusAll';
import StatusElectrode from './status/StatusElectrode';
import StatusAssembly from './status/StatusAssembly';

export default function RawMaterialList() {
  const [subTab, setSubTab] = useState<'status' | 'project'>('status');
  const [statusTab, setStatusTab] = useState<'all' | 'electrode' | 'assembly'>('all');

  return (
    <div className='raw-material-page'>
      <h3>📦 원부자재</h3>

      {/* 상위 메뉴 */}
      <div className='sub-nav'>
        <button className={subTab === 'status' ? 'active' : ''} onClick={() => setSubTab('status')}>
          현황
        </button>
        <button className={subTab === 'project' ? 'active' : ''} onClick={() => setSubTab('project')}>
          프로젝트
        </button>
      </div>

      {/* 현황 하위 탭 */}
      {subTab === 'status' && (
        <div className='sub-sub-nav'>
          <button className={statusTab === 'all' ? 'active' : ''} onClick={() => setStatusTab('all')}>
            전체
          </button>
          <button className={statusTab === 'electrode' ? 'active' : ''} onClick={() => setStatusTab('electrode')}>
            전극
          </button>
          <button className={statusTab === 'assembly' ? 'active' : ''} onClick={() => setStatusTab('assembly')}>
            조립
          </button>
        </div>
      )}

      {/* 내용 */}
      <div className='raw-material-content'>
        {subTab === 'status' && statusTab === 'all' && <StatusAll />}
        {subTab === 'status' && statusTab === 'electrode' && <StatusElectrode />}
        {subTab === 'status' && statusTab === 'assembly' && <StatusAssembly />}
        {subTab === 'project' && <p>프로젝트 자재 관리 표시</p>}
      </div>
    </div>
  );
}
