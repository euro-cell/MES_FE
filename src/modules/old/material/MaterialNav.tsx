import '../../../styles/material/material.css';

interface Props {
  activeTab: 'raw' | 'cell';
  setActiveTab: (tab: 'raw' | 'cell') => void;
}

export default function MaterialNav({ activeTab, setActiveTab }: Props) {
  return (
    <div className='material-nav'>
      <button className={activeTab === 'raw' ? 'active' : ''} onClick={() => setActiveTab('raw')}>
        원부자재
      </button>
      <button className={activeTab === 'cell' ? 'active' : ''} onClick={() => setActiveTab('cell')}>
        셀
      </button>
    </div>
  );
}
