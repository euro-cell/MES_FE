import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MENU_CONFIG } from '../menuConfig';
import SubmenuBar from '../../components/SubmenuBar';
import styles from '../../styles/components/moduleIndex.module.css';

const IQCIndex = lazy(() => import('./iqc'));
const LQCIndex = lazy(() => import('./lqc'));
const OQCIndex = lazy(() => import('./oqc'));
const IQCProtoIndex = lazy(() => import('./iqc-proto'));
const IQCProto2Index = lazy(() => import('./iqc-proto2'));

export default function QualityIndex() {
  const { sub } = MENU_CONFIG.quality;

  return (
    <div className={styles.modulePage}>
      <SubmenuBar menus={sub} />

      <div className='module-content'>
        <Suspense fallback={<div>로딩 중...</div>}>
          <Routes>
            <Route path='iqc/*' element={<IQCIndex />} />
            <Route path='lqc/*' element={<LQCIndex />} />
            <Route path='oqc/*' element={<OQCIndex />} />
            <Route path='iqc-proto/*' element={<IQCProtoIndex />} />
            <Route path='iqc-proto2/*' element={<IQCProto2Index />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}
