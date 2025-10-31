import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../../styles/production/plan/PlanList.css';
import { getPlanProjects, deleteProject } from './PlanService';
import type { PlanProject } from './PlanTypes';

export default function PlanList() {
  const [data, setData] = useState<PlanProject[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    const res = await getPlanProjects();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <p>⏳ 데이터를 불러오는 중...</p>;

  return (
    <div className='plan-list'>
      <table className='plan-table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>프로젝트명</th>
            <th>회사</th>
            <th>유형</th>
            <th>년도</th>
            <th>월</th>
            <th>회차</th>
            <th>전지 타입</th>
            <th>용량</th>
            <th>목표수량</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.company}</td>
              <td>{item.mode}</td>
              <td>{item.year}</td>
              <td>{item.month}</td>
              <td>{item.round}</td>
              <td>{item.batteryType}</td>
              <td>{item.capacity}</td>
              <td>{item.targetQuantity}</td>
              <td>
                <div className='action-buttons'>
                  <button onClick={() => navigate('register', { state: { project: item } })} className='register-btn'>
                    등록
                  </button>

                  <button
                    disabled={!item.isPlan}
                    onClick={() => item.isPlan && navigate('view', { state: { project: item } })}
                    className={item.isPlan ? 'view-btn' : 'view-btn disabled'}
                  >
                    조회
                  </button>

                  <button
                    disabled={!item.isPlan}
                    onClick={() => navigate('register', { state: { project: item, edit: true } })}
                    className={item.isPlan ? 'edit-btn' : 'edit-btn disabled'}
                  >
                    수정
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('삭제하시겠습니까?')) deleteProject(item.id).then(loadData);
                    }}
                    className='delete-btn'
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
