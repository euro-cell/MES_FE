import styles from '../../../styles/material/material.module.css';

interface Props {
  activeTab: 'raw' | 'cell';
  setActiveTab: (tab: 'raw' | 'cell') => void;
}

export default function MaterialNav({ activeTab, setActiveTab }: Props) {
  return (
    <div className={styles.materialNav}>
      <button className={activeTab === 'raw' ? styles.active : ''} onClick={() => setActiveTab('raw')}>
        원부자재
      </button>
      <button className={activeTab === 'cell' ? styles.active : ''} onClick={() => setActiveTab('cell')}>
        셀
      </button>
    </div>
  );
}
