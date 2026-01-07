import { useState, useEffect } from 'react';
import type { InOutFormData, TableData, GroupedTableData } from './types';
import InOutForm from './InOutForm';
import InOutTable from './InOutTable';
import { getTodayDate, convertKoreanToEnglish, hasKorean } from './utils';
import styles from '../../../../styles/stock/cell/InOut.module.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function InOutIndex() {
  const [formData, setFormData] = useState<InOutFormData>({
    cellLotType: 'in',
    cellLotDate: getTodayDate(),
    cellLot: '',
    inPerson: '',
    outPerson: '',
    outStatus: '',
    projectName: '',
    model: '',
    grade: '양품',
    ncrGrade: '',
    storageLocation: '',
    projectNo: '',
    details: '',
    restriction: '',
  });

  const [tableData, setTableData] = useState<TableData[]>([]);
  const [showLotWarning, setShowLotWarning] = useState(false);
  const [projectList, setProjectList] = useState<string[]>([]);

  // 프로젝트 리스트 조회
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE}/production`);
        const data = await response.json();
        const names = data.map((item: any) => item.name || item.projectName);
        setProjectList(names);
      } catch (error) {
        console.error('프로젝트 리스트 로드 실패:', error);
      }
    };
    fetchProjects();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'cellLot') {
      if (hasKorean(value)) {
        setShowLotWarning(true);
      } else {
        setShowLotWarning(false);
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddToTable = () => {
    const convertedLot = convertKoreanToEnglish(formData.cellLot);

    const newRow: TableData = {
      projectName: formData.projectName,
      grade: formData.grade,
      totalQty: 0,
      holdingQty: 0,
      inboundQty: formData.cellLotType === 'in' ? 1 : 0,
      outboundQty: formData.cellLotType === 'out' ? 1 : 0,
      other: '',
    };

    setTableData([...tableData, newRow]);
    setFormData(prev => ({ ...prev, cellLot: '' }));
    console.log('Converted Lot:', convertedLot);
  };

  const handleCellLotKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e as any).keyCode === 16 || (e as any).keyCode === 17 || (e as any).keyCode === 229) {
      e.preventDefault();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const convertedLot = convertKoreanToEnglish(formData.cellLot);
      console.log('Form Data:', { ...formData, cellLot: convertedLot });
      handleAddToTable();
    }

    console.log('KeyDown Event:', {
      key: e.key,
      code: e.code,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
      keyCode: (e as any).keyCode,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddToTable();
  };

  // 프로젝트가 선택되었는지 확인
  const isProjectSelected = projectList.includes(formData.projectName);

  // Lot 입력 활성화 조건
  const isLotInputEnabled =
    formData.inPerson.trim() !== '' && formData.outPerson.trim() !== '' && formData.projectName.trim() !== '';

  // 테이블 데이터 그룹화
  const groupedData: GroupedTableData[] = tableData.reduce((acc, row) => {
    const existing = acc.find(g => g.projectName === row.projectName);
    if (existing) {
      existing.rows.push(row);
    } else {
      acc.push({ projectName: row.projectName, rows: [row] });
    }
    return acc;
  }, [] as GroupedTableData[]);

  return (
    <div className={styles.inOutContainer}>
      <InOutForm
        formData={formData}
        projectList={projectList}
        showLotWarning={showLotWarning}
        isLotInputEnabled={isLotInputEnabled}
        isProjectSelected={isProjectSelected}
        onInputChange={handleInputChange}
        onCellLotKeyDown={handleCellLotKeyDown}
        onSubmit={handleSubmit}
      />

      <div className={styles.divider}></div>

      <InOutTable groupedData={groupedData} />
    </div>
  );
}
