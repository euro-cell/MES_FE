import DashboardContent from './DashboardContent';
import '../../styles/dashboard.css';

export default function Dashboard() {
  return (
    <div className='dashboard-page'>
      <div id='main-content'>
        <DashboardContent />
      </div>
    </div>
  );
}
