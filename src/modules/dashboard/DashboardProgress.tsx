interface Props {
  progress: {
    electrode: string;
    assembly: string;
    formation: string;
  };
}

export default function DashboardProgress({ progress }: Props) {
  return (
    <div className='project-status box'>
      <h3>프로젝트 진행률</h3>
      <div className='project-progress'>
        <div className='total-progress'>
          <canvas id='processChart' width='220' height='220'></canvas>
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
      </div>
    </div>
  );
}
