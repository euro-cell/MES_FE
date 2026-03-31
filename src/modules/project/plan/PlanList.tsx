import { useNavigate } from 'react-router-dom';
import styles from '../../../styles/project/plan/PlanList.module.css';
import { deleteProjectPlan } from '../../../api/project/plan';
import { useProjects } from '../../../hooks/useProjects';
import { useQueryClient } from '@tanstack/react-query';
import type { PlanProject } from './PlanTypes';
import TooltipButton from '../../../components/TooltipButton';

export default function PlanList() {
  const { data, isLoading } = useProjects();
  const planData: PlanProject[] = data ?? [];
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loadData = async () => {
    await queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  if (isLoading) return <p>⏳ 데이터를 불러오는 중...</p>;

  return (
    <div className={styles.planList}>
      <table className={styles.planTable}>
        <thead>
          <tr>
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
          {planData.map((item: PlanProject) => (
            <tr key={item.id}>
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
                <div className={styles.actionButtons}>
                  <TooltipButton
                    label='등록'
                    variant='register'
                    disabled={item.isPlan}
                    tooltip='이미 계획이 등록되어 있습니다.'
                    onClick={() => !item.isPlan && navigate(`register/${item.id}`)}
                  />

                  <TooltipButton
                    label='조회'
                    variant='view'
                    disabled={!item.isPlan}
                    tooltip='계획이 등록되어 있지 않습니다.'
                    onClick={() => item.isPlan && navigate(`view/${item.id}`)}
                  />

                  <TooltipButton
                    label='수정'
                    variant='edit'
                    disabled={!item.isPlan}
                    tooltip='계획이 등록되어 있지 않습니다.'
                    onClick={() => navigate(`edit/${item.id}`)}
                  />

                  <TooltipButton
                    label='삭제'
                    variant='delete'
                    onClick={() => {
                      if (confirm('생산 계획을 삭제하시겠습니까?')) {
                        deleteProjectPlan(item.id).then(loadData);
                      }
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
