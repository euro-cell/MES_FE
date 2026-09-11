import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../../../styles/project/plan/PlanTemplate.module.css';
import type { ProcessTemplate } from '../PlanTypes';
import { getTemplates, duplicateTemplate, deleteTemplate } from './templateApi';

export default function PlanTemplateList() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ProcessTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    setIsLoading(true);
    getTemplates()
      .then(setTemplates)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDuplicate = async (id: number) => {
    await duplicateTemplate(id);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 템플릿을 삭제하시겠습니까?')) return;
    await deleteTemplate(id);
    load();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h3>🧩 공정 템플릿 관리</h3>
        <div className={styles.headerActions}>
          <button className={styles.backBtn} onClick={() => navigate('/project/plan')}>
            ← 생산계획 목록
          </button>
          <button className={styles.primaryBtn} onClick={() => navigate('new')}>
            + 새 템플릿
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.templateTable}>
          <thead>
            <tr>
              <th>템플릿명</th>
              <th>전지 종류</th>
              <th>공정 수</th>
              <th>최종수정일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  불러오는 중...
                </td>
              </tr>
            ) : templates.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  등록된 템플릿이 없습니다.
                </td>
              </tr>
            ) : (
              templates.map(template => (
                <tr key={template.id}>
                  <td>{template.name}</td>
                  <td>{template.formFactor}</td>
                  <td>{template.items.length}</td>
                  <td>{template.updatedAt}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.editLink} onClick={() => navigate(`${template.id}`)}>
                        편집
                      </button>
                      <button className={styles.duplicateLink} onClick={() => handleDuplicate(template.id)}>
                        복제
                      </button>
                      <button className={styles.deleteLink} onClick={() => handleDelete(template.id)}>
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
