import type { DashboardProgressData } from './types';
import '../../styles/dashboard/progress.css';

interface Props {
  progress: DashboardProgressData;
}

export default function DashboardProgress({ progress }: Props) {
  return (
    <div className='dashboard-progress box'>
      <h3>프로젝트 진행률</h3>

      <div className='progress-chart-wrapper'>
        <div className='chart-container'>
          <canvas id='processChart'></canvas>
          <div className='chart-center-text' id='chart-center-text'>
            -
          </div>
        </div>

        <div className='process-list'>
          <div className='process-item'>
            <span className='label'>전극 공정</span>
            <span className='value'>{progress.electrode}</span>
          </div>
          <div className='process-item'>
            <span className='label'>조립 공정</span>
            <span className='value'>{progress.assembly}</span>
          </div>
          <div className='process-item'>
            <span className='label'>화성 공정</span>
            <span className='value'>{progress.formation}</span>
          </div>
        </div>

        <div className='chart-title' id='chart-title'>
          프로젝트를 선택하세요
        </div>
      </div>
    </div>
  );
}
