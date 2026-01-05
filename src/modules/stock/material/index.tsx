import { Routes, Route } from 'react-router-dom';
import SubmenuBar from '../../../components/SubmenuBar';
import styles from '../../../styles/moduleIndex.module.css';
import ElectrodeIndex from './electrode';
import AssemblyIndex from './assembly';

const MATERIAL_MENUS = [
  { title: '전극', path: '/stock/material/electrode' },
  { title: '조립', path: '/stock/material/assembly' },
];

export default function MaterialIndex() {
  return (
    <div className={styles.modulePage}>
      <SubmenuBar menus={MATERIAL_MENUS} />

      <div className='module-content'>
        <Routes>
          <Route path='electrode/*' element={<ElectrodeIndex />} />
          <Route path='assembly/*' element={<AssemblyIndex />} />
        </Routes>
      </div>
    </div>
  );
}
