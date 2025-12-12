import { Routes } from 'react-router-dom';
import { MENU_CONFIG } from '../menuConfig';
import SubmenuBar from '../../components/SubmenuBar';
import '../../styles/moduleIndex.css';

export default function StockIndex() {
  const { sub } = MENU_CONFIG.stock;

  return (
    <div className='module-page'>
      <SubmenuBar menus={sub} />

      <div className='module-content'>
        <Routes></Routes>
      </div>
    </div>
  );
}
