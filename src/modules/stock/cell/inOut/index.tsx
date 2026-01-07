import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { InOutFormData, GroupedTableData, ProjectStatistics } from './types';
import InOutForm from './InOutForm';
import InOutTable from './InOutTable';
import { getTodayDate, convertKoreanToEnglish, hasKorean, buildCellInventoryPayload, transformStatisticsToTableData } from './utils';
import { createCellInventory, updateCellInventoryOut, updateCellInventoryRestock, fetchCellInventoryStatistics } from './InOutService';
import styles from '../../../../styles/stock/cell/InOut.module.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function InOutIndex() {
  const [formData, setFormData] = useState<InOutFormData>({
    cellLotType: 'in',
    cellLotDate: getTodayDate(),
    cellLot: '',
    inPerson: '',
    outPerson: '',
    shippingStatus: '',
    projectName: '',
    model: '',
    grade: '양품',
    ncrGrade: '',
    storageLocation: '',
    projectNo: '',
    details: '',
  });

  const [statistics, setStatistics] = useState<ProjectStatistics[]>([]);
  const [showLotWarning, setShowLotWarning] = useState(false);
  const [projectList, setProjectList] = useState<string[]>([]);

  // 프로젝트 리스트와 통계 조회
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

    const fetchStatistics = async () => {
      try {
        const data = await fetchCellInventoryStatistics();
        setStatistics(data);
      } catch (error) {
        console.error('통계 조회 실패:', error);
      }
    };

    fetchProjects();
    fetchStatistics();
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

  const handleAddToTable = async () => {
    const convertedLot = convertKoreanToEnglish(formData.cellLot).toUpperCase();

    try {
      const payload = buildCellInventoryPayload(formData, convertedLot);

      if (formData.cellLotType === 'in') {
        await createCellInventory(payload);
      } else if (formData.cellLotType === 'out') {
        await updateCellInventoryOut(payload);
      } else if (formData.cellLotType === 'restock') {
        await updateCellInventoryRestock(payload);
      }

      // 통계 데이터 새로 조회
      const data = await fetchCellInventoryStatistics();
      setStatistics(data);

      toast.success('✅ 등록되었습니다.');
    } catch (error) {
      alert('❌ ' + (error as any)?.message || '알 수 없는 오류');
    } finally {
      setFormData(prev => ({ ...prev, cellLot: '' }));
    }
  };

  const handleCellLotKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e as any).keyCode === 16 || (e as any).keyCode === 17 || (e as any).keyCode === 229) {
      e.preventDefault();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      await handleAddToTable();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAddToTable();
  };

  // 프로젝트가 선택되었는지 확인
  const isProjectSelected = projectList.includes(formData.projectName);

  // Lot 입력 활성화 조건
  const isLotInputEnabled =
    formData.inPerson.trim() !== '' && formData.outPerson.trim() !== '' && formData.projectName.trim() !== '';

  // API 통계 데이터를 테이블 형식으로 변환
  const groupedData: GroupedTableData[] = transformStatisticsToTableData(statistics);

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
