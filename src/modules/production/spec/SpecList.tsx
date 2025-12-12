import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteSpecification, getSpecificationSummary } from './specification/SpecService';
import TooltipButton from '../../../components/TooltipButton';
import styles from '../../../styles/production/spec/specList.module.css';
import { deleteProductionMaterial } from './material/MaterialService';

interface SpecItem {
  id: number;
  name: string;
  specStatus: boolean;
  materialStatus: boolean;
}

export default function SpecList() {
  const [list, setList] = useState<SpecItem[]>([]);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const data = await getSpecificationSummary();
      setList(data);
    } catch (err) {
      console.error('❌ 스펙 리스트 조회 실패:', err);
    }
  };

  const handleDelete = async (projectId: number, projectName: string) => {
    if (!confirm(`🗑 ${projectName} 설계 정보를 삭제하시겠습니까?`)) return;

    try {
      await deleteSpecification(projectId);
      alert('✅ 설계 정보가 삭제되었습니다.');
      loadData();
    } catch (err: any) {
      console.error('❌ 설계 삭제 실패:', err);
      if (err.response) {
        const { error, message, statusCode } = err.response.data;
        alert(`${error}(${statusCode}): ${message}`);
        return;
      }
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleMaterialDelete = async (productionId: number, projectName: string) => {
    if (!confirm(`🗑 ${projectName} 자재 정보를 삭제하시겠습니까?`)) return;

    try {
      await deleteProductionMaterial(productionId);
      alert('✅ 자재 소요량 정보가 삭제되었습니다.');
      loadData(); // 리스트 새로고침
    } catch (err: any) {
      console.error('❌ 자재 삭제 실패:', err);
      if (err.response) {
        const { error, message, statusCode } = err.response.data;
        alert(`${error}(${statusCode}): ${message}`);
        return;
      }
      alert('삭제 중 오류가 발생했습니다.');
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
                    onClick={() => item.specStatus && handleDelete(item.id, item.name)}
                  />
                </div>
              </td>

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
                    onClick={() => item.materialStatus && handleMaterialDelete(item.id, item.name)}
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
