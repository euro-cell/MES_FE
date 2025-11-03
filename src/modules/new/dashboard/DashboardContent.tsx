// import DashboardSummary from './DashboardSummary';
// import DashboardProgress from './DashboardProgress';
// import DashboardProjectManage from './DashboardProjectManage';
// import DashboardSchedule from './DashboardSchedule';

export default function DashboardContent() {
  return (
    <div className='dashboard-content'>
      {/* =========================
          🔹 상단 영역
      ========================= */}
      <div className='dashboard-top'>
        <section className='dashboard-section'>
          <h2>현황</h2>
          {/* <DashboardSummary /> */}
        </section>

        <section className='dashboard-section'>
          <h2>진행률</h2>
          {/* <DashboardProgress /> */}
        </section>

        <section className='dashboard-section'>
          <h2>등록</h2>
          {/* <DashboardProjectManage /> */}
        </section>
      </div>

      {/* =========================
          🔹 하단 영역
      ========================= */}
      <div className='dashboard-bottom'>
        <section className='dashboard-section full'>
          <h2>스케줄</h2>
          {/* <DashboardSchedule /> */}
        </section>
      </div>
    </div>
  );
}
