import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSpecificationSummary } from './SpecService';
import TooltipButton from '../../../../components/TooltipButton';
import styles from '../../../../styles/production/spec/specList.module.css';

interface SpecItem {
  id: number;
  name: string;
  specStatus: boolean;
  materialStatus: boolean;
}

export default function SpecList() {
  const [list, setList] = useState<SpecItem[]>([]);
  const navigate = useNavigate();

  /** 🔹 스펙 리스트 불러오기 */
  const loadData = async () => {
    try {
      const data = await getSpecificationSummary();
      setList(data);
    } catch (err) {
      console.error('❌ 스펙 리스트 조회 실패:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className={styles.specList}>
      <table className={styles.specTable}>
        <thead>
          <tr>
            <th>프로젝트명</th>
            <th>조회</th>
            <th>설계 관리</th>
            <th>자재 관리</th>
          </tr>
        </thead>

        <tbody>
          {list.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>

              {/* 🔹 조회 */}
              <td>
                <div className={styles.actionButtons}>
                  <TooltipButton
                    label='조회'
                    variant='view'
                    disabled={!item.specStatus && !item.materialStatus}
                    tooltip='설계나 자재가 등록되어 있지 않습니다.'
                    onClick={() =>
                      (item.specStatus || item.materialStatus) && navigate('view', { state: { project: item } })
                    }
                  />
                </div>
              </td>

              {/* 🔹 설계 관리 */}
              <td>
                <div className={styles.actionButtons}>
                  <TooltipButton
                    label='등록'
                    variant='register'
                    disabled={item.specStatus}
                    tooltip='이미 설계가 등록되어 있습니다.'
                    onClick={() =>
                      !item.specStatus &&
                      navigate('new', {
                        state: {
                          projectName: item.name,
                          productionId: item.id,
                        },
                      })
                    }
                  />

                  <TooltipButton
                    label='수정'
                    variant='edit'
                    disabled={!item.specStatus}
                    tooltip='등록된 설계가 없습니다.'
                    onClick={() =>
                      item.specStatus &&
                      navigate('edit', {
                        state: {
                          projectName: item.name,
                          productionId: item.id,
                        },
                      })
                    }
                  />

                  <TooltipButton
                    label='삭제'
                    variant='delete'
                    disabled={!item.specStatus}
                    tooltip='등록된 설계가 없습니다.'
                    onClick={() => {
                      if (!item.specStatus) return;
                      if (confirm('설계 정보를 삭제하시겠습니까?')) {
                        console.log('🗑 설계 삭제:', item.id);
                      }
                    }}
                  />
                </div>
              </td>

              {/* 🔹 자재 관리 */}
              <td>
                <div className={styles.actionButtons}>
                  <TooltipButton
                    label='등록'
                    variant='register'
                    disabled={item.materialStatus}
                    tooltip='이미 자재가 등록되어 있습니다.'
                    onClick={() =>
                      !item.materialStatus &&
                      navigate('material/new', {
                        state: {
                          projectName: item.name,
                          productionId: item.id,
                        },
                      })
                    }
                  />

                  <TooltipButton
                    label='수정'
                    variant='edit'
                    disabled={!item.materialStatus}
                    tooltip='등록된 자재가 없습니다.'
                    onClick={() =>
                      item.materialStatus &&
                      navigate('material/edit', {
                        state: {
                          projectName: item.name,
                          productionId: item.id,
                        },
                      })
                    }
                  />

                  <TooltipButton
                    label='삭제'
                    variant='delete'
                    disabled={!item.materialStatus}
                    tooltip='등록된 자재가 없습니다.'
                    onClick={() => {
                      if (!item.materialStatus) return;
                      if (confirm('자재 정보를 삭제하시겠습니까?')) {
                        console.log('🗑 자재 삭제:', item.id);
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
