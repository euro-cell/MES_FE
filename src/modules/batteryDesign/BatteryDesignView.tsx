import { useState } from 'react';
import BatteryDesignForm from './BatteryDesignForm';
import BatteryDesignList from './BatteryDesignList';
import '../../styles/batteryDesign/view.css';

export default function BatteryDesignView() {
  const [tab, setTab] = useState<'form' | 'list'>('form');

  return (
    <div className='battery-design-page'>
      <div className='tab-buttons'>
        <button className={tab === 'form' ? 'active' : ''} onClick={() => setTab('form')}>
          설계 입력
        </button>
        <button className={tab === 'list' ? 'active' : ''} onClick={() => setTab('list')}>
          설계 리스트
        </button>
      </div>

      {tab === 'form' ? <BatteryDesignForm /> : <BatteryDesignList />}
    </div>
  );
}
