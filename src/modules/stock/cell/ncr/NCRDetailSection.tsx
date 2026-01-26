import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../../../styles/stock/cell/NCRStatus.module.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface DetailSubItem {
  id: number;
  title: string;
  details: string;
  type: string;
  count: number;
}

interface NCRDetailItem {
  id: number;
  code: string;
  title: string;
  category: 'Formation' | 'Inspection' | 'Other';
  ncrType: string;
  items: DetailSubItem[];
}

interface NCRDetailData {
  projectName: string;
  ncrDetails: NCRDetailItem[];
}

interface Project {
  id: string;
  name: string;
  projectName: string;
  projectNo: string | null;
}

export default function NCRDetailSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [detailData, setDetailData] = useState<NCRDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<NCRDetailData | null>(null);

  // 프로젝트 리스트 로드
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await axios.get(`${API_BASE}/cell-inventory/statistics`, { withCredentials: true });
        const projectList: Project[] = response.data.map((item: any) => ({
          id: item.projectNo ? `${item.projectName}|${item.projectNo}` : item.projectName,
          name: item.projectNo ? `${item.projectName}(${item.projectNo})` : item.projectName,
          projectName: item.projectName,
          projectNo: item.projectNo || null,
        }));
        setProjects(projectList);
      } catch (err) {
        console.error('프로젝트 목록 로드 실패:', err);
      }
    };
    loadProjects();
  }, []);

  // 프로젝트 선택 시 상세 데이터 로드
  useEffect(() => {
    if (!selectedProjectId) {
      setDetailData(null);
      setEditedData(null);
      setIsEditMode(false);
      return;
    }

    const loadDetail = async () => {
      setLoading(true);
      const selectedProject = projects.find(p => p.id === selectedProjectId);
      if (!selectedProject) return;

      const params = new URLSearchParams();
      params.append('projectName', selectedProject.projectName);
      if (selectedProject.projectNo) {
        params.append('projectNo', selectedProject.projectNo);
      }

      try {
        const response = await axios.get<NCRDetailData>(`${API_BASE}/cell-inventory/ncr/detail?${params.toString()}`, {
          withCredentials: true,
        });
        setDetailData(response.data);
        setEditedData(null);
        setIsEditMode(false);
      } catch (err) {
        console.error('NCR 상세 데이터 로드 실패:', err);
        setDetailData({
          projectName: selectedProject.projectName,
          ncrDetails: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [selectedProjectId, projects]);

  const handleEditClick = () => {
    if (isEditMode) {
      setIsEditMode(false);
      setEditedData(null);
    } else {
      if (detailData) {
        setEditedData(JSON.parse(JSON.stringify(detailData)));
        setIsEditMode(true);
      }
    }
  };

  const handleSave = async () => {
    if (editedData) {
      const selectedProject = projects.find(p => p.id === selectedProjectId);
      if (!selectedProject) return;

      const params = new URLSearchParams();
      params.append('projectName', selectedProject.projectName);
      if (selectedProject.projectNo) {
        params.append('projectNo', selectedProject.projectNo);
      }

      try {
        await axios.patch(`${API_BASE}/cell-inventory/ncr/detail?${params.toString()}`, editedData, {
          withCredentials: true,
        });
        setDetailData(editedData);
        setIsEditMode(false);
        setEditedData(null);
        alert('저장되었습니다.');
      } catch (err) {
        console.error('저장 실패:', err);
        alert('저장에 실패했습니다.');
      }
    }
  };

  const handleRowCountChange = (ncrIdx: number, itemIdx: number, newCount: number) => {
    if (editedData) {
      const updated = JSON.parse(JSON.stringify(editedData));
      updated.ncrDetails[ncrIdx].items[itemIdx].count = newCount;
      setEditedData(updated);
    }
  };

  const handleRowFieldChange = (ncrIdx: number, itemIdx: number, field: string, value: string) => {
    if (editedData) {
      const updated = JSON.parse(JSON.stringify(editedData));
      updated.ncrDetails[ncrIdx].items[itemIdx][field] = value;
      setEditedData(updated);
    }
  };

  const handleAddRow = (ncrIdx: number) => {
    if (editedData) {
      const updated = JSON.parse(JSON.stringify(editedData));
      const currentNcrType = updated.ncrDetails[ncrIdx].ncrType || '';
      updated.ncrDetails[ncrIdx].items.push({
        id: 0,
        title: currentNcrType,
        details: '',
        type: '',
        count: 0,
      });
      setEditedData(updated);
    }
  };

  const handleDeleteRow = (ncrIdx: number, itemIdx: number) => {
    if (editedData) {
      const updated = JSON.parse(JSON.stringify(editedData));
      updated.ncrDetails[ncrIdx].items.splice(itemIdx, 1);
      setEditedData(updated);
    }
  };

  const handleNcrTypeChange = (ncrIdx: number, value: string) => {
    if (editedData) {
      const updated = JSON.parse(JSON.stringify(editedData));
      updated.ncrDetails[ncrIdx].ncrType = value;
      // 모든 items의 title에도 범위 값 저장
      updated.ncrDetails[ncrIdx].items.forEach((item: DetailSubItem) => {
        item.title = value;
      });
      setEditedData(updated);
    }
  };

  const displayData = isEditMode && editedData ? editedData : detailData;

  // 아이템 소계 계산
  const getSubtotal = (items: DetailSubItem[]) => {
    return items.reduce((sum, item) => sum + item.count, 0);
  };

  const renderNCRTable = (ncrItem: NCRDetailItem, ncrIdx: number) => {
    const items = ncrItem.items;
    // 범위 값: items의 첫 번째 title 또는 ncrType 또는 기본값 '범위'
    const rangeValue = items[0]?.title || ncrItem.ncrType || '범위';

    return (
      <div key={ncrItem.id} className={styles.detailTable}>
        <h4 className={styles.detailTableTitle}>
          {ncrItem.code} - {ncrItem.title}
        </h4>
        <table className={styles.detailDataTable}>
          <thead>
            <tr>
              <th>구분</th>
              <th>
                {isEditMode ? (
                  <input
                    type='text'
                    value={rangeValue}
                    onChange={e => handleNcrTypeChange(ncrIdx, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 6px',
                      border: '1px solid #2563eb',
                      borderRadius: '4px',
                      textAlign: 'center',
                      boxSizing: 'border-box',
                      fontWeight: 600,
                    }}
                  />
                ) : (
                  rangeValue
                )}
              </th>
              <th style={{ width: '80px' }}>수량</th>
              {isEditMode && <th style={{ width: '40px', textAlign: 'center' }}>작업</th>}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={isEditMode ? 4 : 3} style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  데이터 없음
                </td>
              </tr>
            ) : (
              items.map((item, itemIdx) => (
                <tr key={itemIdx}>
                  <td>
                    {isEditMode ? (
                      <input
                        type='text'
                        value={item.details}
                        onChange={e => handleRowFieldChange(ncrIdx, itemIdx, 'details', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '4px 6px',
                          border: '1px solid #2563eb',
                          borderRadius: '4px',
                          textAlign: 'center',
                          boxSizing: 'border-box',
                        }}
                      />
                    ) : (
                      item.details
                    )}
                  </td>
                  <td>
                    {isEditMode ? (
                      <input
                        type='text'
                        value={item.type}
                        onChange={e => handleRowFieldChange(ncrIdx, itemIdx, 'type', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '4px 6px',
                          border: '1px solid #2563eb',
                          borderRadius: '4px',
                          textAlign: 'center',
                          boxSizing: 'border-box',
                        }}
                      />
                    ) : (
                      item.type
                    )}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 500 }}>
                    {isEditMode ? (
                      <input
                        type='number'
                        value={item.count}
                        onChange={e => handleRowCountChange(ncrIdx, itemIdx, parseInt(e.target.value) || 0)}
                        style={{
                          width: '60px',
                          padding: '4px 6px',
                          border: '1px solid #2563eb',
                          borderRadius: '4px',
                          textAlign: 'center',
                        }}
                      />
                    ) : item.count === 0 ? (
                      '-'
                    ) : (
                      item.count
                    )}
                  </td>
                  {isEditMode && (
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteRow(ncrIdx, itemIdx)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 500,
                        }}
                      >
                        삭제
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
            <tr className={styles.detailSubtotalRow}>
              <td colSpan={isEditMode ? 3 : 2} style={{ textAlign: 'center', paddingRight: '10px' }}>
                합계
              </td>
              <td style={{ textAlign: 'center', fontWeight: 600 }}>{getSubtotal(items)}</td>
              {isEditMode && <td />}
            </tr>
            {isEditMode && (
              <tr>
                <td colSpan={isEditMode ? 4 : 3} style={{ textAlign: 'center', padding: '8px' }}>
                  <button
                    onClick={() => handleAddRow(ncrIdx)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    + 행 추가
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={styles.detailSection}>
      {/* 프로젝트 드롭박스 */}
      <div className={styles.projectSelectContainer}>
        <label htmlFor='project-select' className={styles.projectSelectLabel}>
          프로젝트:
        </label>
        <select
          id='project-select'
          className={styles.projectSelect}
          value={selectedProjectId}
          onChange={e => setSelectedProjectId(e.target.value)}
          disabled={isEditMode}
        >
          <option value=''>-- 선택해주세요 --</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* 편집/저장 버튼 */}
      {selectedProjectId && (
        <div style={{ display: 'flex', gap: '8px', padding: '0 10px 12px 10px' }}>
          <button className={styles.editButton} onClick={handleEditClick}>
            {isEditMode ? '취소' : '편집'}
          </button>
          {isEditMode && (
            <button
              className={styles.editButton}
              onClick={handleSave}
              style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
            >
              저장
            </button>
          )}
        </div>
      )}

      {/* 세부 내용 */}
      <div className={styles.detailContent}>
        {!displayData ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>프로젝트를 선택해주세요</div>
        ) : loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
        ) : (
          displayData.ncrDetails.map((ncrItem, ncrIdx) => renderNCRTable(ncrItem, ncrIdx))
        )}
      </div>
    </div>
  );
}
