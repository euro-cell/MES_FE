import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../../../styles/stock/cell/NCRStatus.module.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface DetailItem {
  category: string;
  range: string;
  count: number;
}

interface DetailTable {
  title: string;
  columns: string[];
  rows: DetailItem[];
  subtotal: number;
}

interface ProjectDetail {
  projectName: string;
  tables: DetailTable[];
}

interface Project {
  id: string;
  name: string;
}

interface CellInventoryProject {
  projectName: string;
  grades: Array<{
    grade: string;
    inStock: number | null;
    shipped: number | null;
    available: number | null;
  }>;
  totalAvailable: number;
}

// 더미 프로젝트별 세부 데이터
const projectDetailData: Record<string, ProjectDetail> = {
  v52: {
    projectName: 'V5.2',
    tables: [
      {
        title: '1. Final 실링 Cutting 폭(7±0.5mm)',
        columns: ['구분', 'Cutting 폭(mm)', '수량'],
        rows: [
          { category: 'BA', range: '4.0-4.9', count: 5 },
          { category: 'BB', range: '3.0-3.9', count: 3 },
          { category: 'BC', range: '2.0-2.9', count: 0 },
        ],
        subtotal: 8,
      },
      {
        title: '2. 외관 검사',
        columns: ['구분', '외관 상태', '수량'],
        rows: [
          { category: 'BA', range: '양호', count: 12 },
          { category: 'BB', range: '미흡', count: 2 },
        ],
        subtotal: 14,
      },
    ],
  },
  v55: {
    projectName: 'V5.5',
    tables: [
      {
        title: '1. Final 실링 Cutting 폭(7±0.5mm)',
        columns: ['구분', 'Cutting 폭(mm)', '수량'],
        rows: [
          { category: 'BA', range: '4.0-4.9', count: 120 },
          { category: 'BB', range: '3.0-3.9', count: 80 },
          { category: 'BC', range: '2.0-2.9', count: 44 },
        ],
        subtotal: 244,
      },
      {
        title: '2. 파우치 표면 검사',
        columns: ['구분', '표면 상태', '수량'],
        rows: [
          { category: 'BA', range: '정상', count: 200 },
          { category: 'BB', range: '미세 결함', count: 109 },
        ],
        subtotal: 309,
      },
    ],
  },
  v56: {
    projectName: 'V5.6',
    tables: [
      {
        title: '1. Final 실링 Cutting 폭(7±0.5mm)',
        columns: ['구분', 'Cutting 폭(mm)', '수량'],
        rows: [
          { category: 'BA', range: '4.0-4.9', count: 150 },
          { category: 'BB', range: '3.0-3.9', count: 100 },
          { category: 'BC', range: '2.0-2.9', count: 108 },
        ],
        subtotal: 358,
      },
      {
        title: '2. 가스 발생 검사',
        columns: ['구분', '가스 발생 여부', '수량'],
        rows: [
          { category: 'BA', range: '발생함', count: 270 },
          { category: 'BB', range: '발생 안함', count: 79 },
        ],
        subtotal: 349,
      },
      {
        title: '3. 외관 크랙 검사',
        columns: ['구분', '크랙 유무', '수량'],
        rows: [
          { category: 'BA', range: '크랙 있음', count: 355 },
        ],
        subtotal: 355,
      },
    ],
  },
  v57: {
    projectName: 'V5.7',
    tables: [
      {
        title: '1. 보관 후 OCV4 △V ratio',
        columns: ['구분', 'mV/month', '수량'],
        rows: [
          { category: 'BA', range: '> 10', count: 3 },
          { category: 'BB', range: '5-10', count: 2 },
        ],
        subtotal: 5,
      },
      {
        title: '2. 파우치 표면 결함',
        columns: ['구분', '결함 유형', '수량'],
        rows: [
          { category: 'BA', range: '찍힘', count: 10 },
          { category: 'BB', range: '돌출', count: 6 },
        ],
        subtotal: 16,
      },
      {
        title: '3. 외관 크랙',
        columns: ['구분', '크랙 위치', '수량'],
        rows: [
          { category: 'BA', range: '모서리', count: 18 },
        ],
        subtotal: 18,
      },
    ],
  },
  v58: {
    projectName: 'V5.8',
    tables: [
      {
        title: '1. MF OCV2 aging 후 검사',
        columns: ['구분', 'V(volt)', '수량'],
        rows: [
          { category: 'BA', range: '2.5-2.8', count: 35 },
          { category: 'BB', range: '2.1-2.5', count: 6 },
        ],
        subtotal: 41,
      },
      {
        title: '2. 파우치 표면 찍힘',
        columns: ['구분', '직경(mm)', '수량'],
        rows: [
          { category: 'BA', range: '≤ 1.0', count: 50 },
          { category: 'BB', range: '> 1.0', count: 57 },
        ],
        subtotal: 107,
      },
      {
        title: '3. 보관 후 OCV4 검사',
        columns: ['구분', 'ratio(mV/month)', '수량'],
        rows: [
          { category: 'BA', range: '> 10', count: 12 },
          { category: 'BB', range: '5-10', count: 15 },
        ],
        subtotal: 27,
      },
    ],
  },
  navitas6T: {
    projectName: 'Navitas 6T',
    tables: [
      {
        title: '1. 파우치 표면 찍힘(직경≤1mm)',
        columns: ['구분', '직경 범위(mm)', '수량'],
        rows: [
          { category: 'BA', range: '0.5-1.0', count: 8 },
          { category: 'BB', range: '< 0.5', count: 3 },
        ],
        subtotal: 11,
      },
      {
        title: '2. MF OCV2 검사',
        columns: ['구분', 'V(volt)', '수량'],
        rows: [
          { category: 'BA', range: '2.5-2.8', count: 5 },
        ],
        subtotal: 5,
      },
    ],
  },
  kkk55d25b1: {
    projectName: '55D25B1-KKK55',
    tables: [
      {
        title: '1. NCR 세부 분석',
        columns: ['구분', '상세 내용', '수량'],
        rows: [
          { category: 'Formation', range: 'Final 실링 Cutting 폭', count: 5 },
          { category: 'Formation', range: 'MF OCV2 aging 후', count: 8 },
          { category: 'Inspection', range: '기준용량', count: 3 },
          { category: 'Inspection', range: '가스 발생 검사', count: 15 },
          { category: 'Inspection', range: '파우치 표면 찍힘', count: 12 },
          { category: 'Other', range: '파우치 크랙', count: 20 },
          { category: 'Other', range: '실란트 돌출', count: 10 },
        ],
        subtotal: 73,
      },
    ],
  },
};

export default function NCRDetailSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [detailData, setDetailData] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<ProjectDetail | null>(null);

  // 프로젝트 리스트 로드 (마운트 시)
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await axios.get<CellInventoryProject[]>(
          `${API_BASE}/cell-inventory/statistics`,
          { withCredentials: true }
        );
        const projectList: Project[] = response.data.map((item) => ({
          id: item.projectName,
          name: item.projectName,
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

    setLoading(true);
    // 실제로는 여기서 API 호출 필요
    // const data = await fetchNCRDetail(selectedProjectId);
    setTimeout(() => {
      const data = projectDetailData[selectedProjectId];
      setDetailData(data);
      setEditedData(null);
      setIsEditMode(false);
      setLoading(false);
    }, 100);
  }, [selectedProjectId]);

  const handleEditClick = () => {
    if (isEditMode) {
      // 편집 모드 취소
      setIsEditMode(false);
      setEditedData(null);
    } else {
      // 편집 모드 시작
      if (detailData) {
        setEditedData(JSON.parse(JSON.stringify(detailData))); // Deep copy
        setIsEditMode(true);
      }
    }
  };

  const handleSave = () => {
    if (editedData) {
      setDetailData(editedData);
      setIsEditMode(false);
      setEditedData(null);
    }
  };

  const handleRowCountChange = (tableIdx: number, rowIdx: number, newCount: number) => {
    if (editedData) {
      const updated = JSON.parse(JSON.stringify(editedData));
      updated.tables[tableIdx].rows[rowIdx].count = newCount;
      // 합계 자동 계산
      updated.tables[tableIdx].subtotal = updated.tables[tableIdx].rows.reduce(
        (sum: number, row: any) => sum + row.count,
        0
      );
      setEditedData(updated);
    }
  };

  const handleRowFieldChange = (tableIdx: number, rowIdx: number, field: string, value: string) => {
    if (editedData) {
      const updated = JSON.parse(JSON.stringify(editedData));
      updated.tables[tableIdx].rows[rowIdx][field] = value;
      setEditedData(updated);
    }
  };

  const handleAddRow = (tableIdx: number) => {
    if (editedData) {
      const updated = JSON.parse(JSON.stringify(editedData));
      const newRow = {
        category: '',
        range: '',
        count: 0,
      };
      updated.tables[tableIdx].rows.push(newRow);
      // 합계 자동 계산
      updated.tables[tableIdx].subtotal = updated.tables[tableIdx].rows.reduce(
        (sum: number, row: any) => sum + row.count,
        0
      );
      setEditedData(updated);
    }
  };

  const handleDeleteRow = (tableIdx: number, rowIdx: number) => {
    if (editedData) {
      const updated = JSON.parse(JSON.stringify(editedData));
      updated.tables[tableIdx].rows.splice(rowIdx, 1);
      // 합계 자동 계산
      updated.tables[tableIdx].subtotal = updated.tables[tableIdx].rows.reduce(
        (sum: number, row: any) => sum + row.count,
        0
      );
      setEditedData(updated);
    }
  };

  const handleTableTitleChange = (tableIdx: number, newTitle: string) => {
    if (editedData) {
      const updated = JSON.parse(JSON.stringify(editedData));
      updated.tables[tableIdx].title = newTitle;
      setEditedData(updated);
    }
  };

  const displayData = isEditMode && editedData ? editedData : detailData;

  return (
    <div className={styles.detailSection}>
      {/* 프로젝트 드롭박스 */}
      <div className={styles.projectSelectContainer}>
        <label htmlFor="project-select" className={styles.projectSelectLabel}>
          프로젝트:
        </label>
        <select
          id="project-select"
          className={styles.projectSelect}
          value={selectedProjectId}
          onChange={e => setSelectedProjectId(e.target.value)}
          disabled={isEditMode}
        >
          <option value="">-- 선택해주세요 --</option>
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
          <button
            className={styles.editButton}
            onClick={handleEditClick}
          >
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
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            프로젝트를 선택해주세요
          </div>
        ) : loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
        ) : (
          displayData.tables.map((table, tableIdx) => (
            <div key={tableIdx} className={styles.detailTable}>
              {isEditMode ? (
                <input
                  type="text"
                  value={table.title}
                  onChange={e => handleTableTitleChange(tableIdx, e.target.value)}
                  className={styles.detailTableTitle}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: '1px solid #2563eb',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    boxSizing: 'border-box',
                  }}
                />
              ) : (
                <h4 className={styles.detailTableTitle}>{table.title}</h4>
              )}
              <table className={styles.detailDataTable}>
                <thead>
                  <tr>
                    {table.columns.map(column => (
                      <th key={column}>{column}</th>
                    ))}
                    {isEditMode && <th style={{ width: '40px', textAlign: 'center' }}>작업</th>}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      <td>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={row.category}
                            onChange={e => handleRowFieldChange(tableIdx, rowIdx, 'category', e.target.value)}
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
                          row.category
                        )}
                      </td>
                      <td>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={row.range}
                            onChange={e => handleRowFieldChange(tableIdx, rowIdx, 'range', e.target.value)}
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
                          row.range
                        )}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 500 }}>
                        {isEditMode ? (
                          <input
                            type="number"
                            value={row.count}
                            onChange={e => handleRowCountChange(tableIdx, rowIdx, parseInt(e.target.value) || 0)}
                            style={{
                              width: '50px',
                              padding: '4px 6px',
                              border: '1px solid #2563eb',
                              borderRadius: '4px',
                              textAlign: 'center',
                            }}
                          />
                        ) : (
                          row.count === 0 ? '-' : row.count
                        )}
                      </td>
                      {isEditMode && (
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => handleDeleteRow(tableIdx, rowIdx)}
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
                  ))}
                  <tr className={styles.detailSubtotalRow}>
                    <td colSpan={isEditMode ? 3 : 2} style={{ textAlign: 'center', paddingRight: '10px' }}>
                      합계
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      {table.subtotal}
                    </td>
                    {isEditMode && <td />}
                  </tr>
                  {isEditMode && (
                    <tr>
                      <td colSpan={isEditMode ? 4 : 3} style={{ textAlign: 'center', padding: '8px' }}>
                        <button
                          onClick={() => handleAddRow(tableIdx)}
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
          ))
        )}
      </div>
    </div>
  );
}
