import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { getErrorMessage } from '../../../api/errorHandler';
import { downloadCellExcel } from '../../../api/stock/InOutService';
import SubmenuBar from '../../../components/SubmenuBar';
import styles from '../../../styles/components/moduleIndex.module.css';
import InOutIndex from './inOut';
import RackStorageIndex from './rackStorage';
import NcrIndex from './ncr';
import ProjectIndex from './project';

const CELL_MENUS = [
  { title: '입/출고 등록', path: '/stock/cell/in-out' },
  { title: 'RACK 보관 현황', path: '/stock/cell/rack-storage' },
  { title: 'NCR 세부 현황', path: '/stock/cell/ncr' },
  { title: '프로젝트별 입/출고 현황', path: '/stock/cell/project' },
];

export default function CellIndex() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadCellExcel();
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      alert(getErrorMessage(error, '엑셀 다운로드에 실패했습니다.'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={styles.modulePage}>
      <div className={styles.submenuWrapper}>
        <SubmenuBar menus={CELL_MENUS} />
        <button className={styles.downloadBtn} onClick={handleDownload} disabled={isDownloading}>
          {isDownloading ? '⏳ 다운로드 중...' : '📥 엑셀 다운로드'}
        </button>
      </div>

      <div className='module-content'>
        <Routes>
          <Route path='in-out/*' element={<InOutIndex />} />
          <Route path='rack-storage/*' element={<RackStorageIndex />} />
          <Route path='ncr/*' element={<NcrIndex />} />
          <Route path='project/*' element={<ProjectIndex />} />
        </Routes>
      </div>
    </div>
  );
}
