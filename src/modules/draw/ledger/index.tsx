import SubmenuBar from '../../../components/SubmenuBar';
import DrawingLedgerPage from './DrawingLedgerPage';

const LEDGER_MENUS = [
  { title: '전체', path: '/draw/list' },
  { title: '공장', path: '/draw/list?category=공장' },
  { title: '설비', path: '/draw/list?category=설비' },
  { title: '제품', path: '/draw/list?category=제품' },
  { title: 'OEM/ODM', path: '/draw/list?category=OEM/ODM' },
];

export default function DrawingLedgerIndex() {
  return (
    <div>
      <SubmenuBar menus={LEDGER_MENUS} />
      <DrawingLedgerPage />
    </div>
  );
}
