import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import styles from '../../../styles/project/plan/PlanRegister.module.css';
import { savePlan, getPlanProjects } from '../../../api/project/plan';
import type { PlanPayload, ProcessTemplate } from './PlanTypes';
import { getTemplates } from './template/templateApi';
import DateInput from '../../../components/DateInput';
import { getErrorMessage } from '../../../api/errorHandler';

interface ProcessRow {
  group: string;
  name: string;
  type: string | null;
  key: string;
  hasElectrode: boolean;
}

export default function PlanRegister() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const projectId = id ? Number(id) : null;
  const [projectName, setProjectName] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weekInfo, setWeekInfo] = useState('');
  const [processPlans, setProcessPlans] = useState<Record<string, { start: string; end: string }>>({});

  const [templates, setTemplates] = useState<ProcessTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | ''>('');

  useEffect(() => {
    if (!projectId) return;
    getPlanProjects().then(projects => {
      const found = projects.find(p => p.id === projectId);
      if (found) setProjectName(found.name);
    });
  }, [projectId]);

  useEffect(() => {
    getTemplates().then(setTemplates);
  }, []);

  const handleTemplateChange = (value: string) => {
    setSelectedTemplateId(value ? Number(value) : '');
    setProcessPlans({});
  };

  /** 주차 계산 */
  const getWeekOfMonth = (date: Date): number => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayOfWeek = firstDay.getDay();
    const dayOfMonth = date.getDate();
    return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
  };

  /** 날짜 변경 */
  const handleChange = (field: 'start' | 'end', value: string) => {
    if (field === 'start') setStartDate(value);
    else setEndDate(value);

    const s = field === 'start' ? value : startDate;
    const e = field === 'end' ? value : endDate;

    if (s && e) {
      const sDate = new Date(s);
      const eDate = new Date(e);

      const startMonth = sDate.getMonth() + 1;
      const endMonth = eDate.getMonth() + 1;
      const startWeek = getWeekOfMonth(sDate);
      const endWeek = getWeekOfMonth(eDate);

      const text = `${startMonth}월 ${startWeek}주차 ~ ${endMonth}월 ${endWeek}주차`;
      setWeekInfo(text);
    }
  };

  /** 공정별 일정 입력 */
  const handleProcessChange = (key: string, field: 'start' | 'end', value: string) => {
    setProcessPlans(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  /** 저장 */
  const handleSave = async () => {
    if (!startDate || !endDate) {
      alert('시작일과 종료일을 입력해주세요.');
      return;
    }
    if (!selectedTemplateId) {
      alert('공정 템플릿을 선택해주세요.');
      return;
    }

    const payload: PlanPayload = { startDate, endDate, weekInfo, processPlans, templateId: selectedTemplateId };

    try {
      await savePlan(projectId!, payload);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'projects'] }),
      ]);
      alert('✅ 저장 완료!');
      navigate('/project/plan');
    } catch (err: any) {
      console.error(err);
      alert(getErrorMessage(err, '❌ 저장 실패'));
    }
  };

  /** 선택된 템플릿의 공정 리스트를 테이블 데이터로 변환 */
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const tableData: ProcessRow[] = !selectedTemplate
    ? []
    : selectedTemplate.items
        .slice()
        .sort((a, b) => a.order - b.order)
        .flatMap((item): ProcessRow[] => {
          if (item.types.length === 0) {
            return [
              {
                group: item.group,
                name: item.name,
                type: null,
                key: `${item.group}_${item.name}`,
                hasElectrode: false,
              },
            ];
          }
          return item.types.map(
            (type): ProcessRow => ({
              group: item.group,
              name: item.name,
              type,
              key: `${item.group}_${item.name}_${type}`,
              hasElectrode: true,
            }),
          );
        });

  /** rowspan 계산 */
  const getRowSpans = () => {
    const spans: Record<number, { groupSpan: number; nameSpan: number }> = {};
    let i = 0;
    while (i < tableData.length) {
      const group = tableData[i].group;
      const sameGroup = tableData.filter(r => r.group === group);
      const groupCount = sameGroup.length;
      let j = 0;
      while (j < sameGroup.length) {
        const name = sameGroup[j].name;
        const sameName = sameGroup.filter(r => r.name === name);
        const nameCount = sameName.length;
        const startIndex = tableData.findIndex(
          r => r.group === group && r.name === name && r.type === sameName[0].type,
        );
        spans[startIndex] = { groupSpan: 0, nameSpan: nameCount };
        if (j === 0) spans[startIndex].groupSpan = groupCount;
        j += nameCount;
      }
      i += groupCount;
    }
    return spans;
  };

  const spans = getRowSpans();

  return (
    <div className={styles.planRegisterPage}>
      <div className={styles.header}>
        <h3>📅 생산계획 등록 - {projectName}</h3>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← 돌아가기
        </button>
      </div>

      <div className={styles.dateInputs}>
        <label>
          시작일:
          <DateInput value={startDate} onChange={value => handleChange('start', value)} />
        </label>
        <label>
          종료일:
          <DateInput value={endDate} onChange={value => handleChange('end', value)} />
        </label>
        <label>
          공정 템플릿:
          <select value={selectedTemplateId} onChange={e => handleTemplateChange(e.target.value)}>
            <option value=''>선택</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* ✅ 주차 계산 + 템플릿 선택 후에만 아래 공정표 렌더링 */}
      {weekInfo && selectedTemplate && (
        <>
          <div className={styles.weekResult}>
            <strong>🗓 {weekInfo}</strong>
          </div>

          <div className={styles.processTable}>
            <h4>공정별 일정 입력</h4>
            <table className={styles.planProcessTable}>
              <thead>
                <tr>
                  <th colSpan={3}>Process</th>
                  <th>일정 (시작 ~ 종료)</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => {
                  const span = spans[index] || { groupSpan: 0, nameSpan: 0 };
                  return (
                    <tr key={row.key}>
                      {span.groupSpan > 0 && <td rowSpan={span.groupSpan}>{row.group}</td>}
                      {row.hasElectrode ? (
                        span.nameSpan > 0 && <td rowSpan={span.nameSpan}>{row.name}</td>
                      ) : (
                        <td colSpan={2}>{row.name}</td>
                      )}
                      {row.hasElectrode && <td>{row.type}</td>}
                      <td>
                        <DateInput
                          value={processPlans[row.key]?.start || ''}
                          onChange={value => handleProcessChange(row.key, 'start', value)}
                        />
                        {' ~ '}
                        <DateInput
                          value={processPlans[row.key]?.end || ''}
                          onChange={value => handleProcessChange(row.key, 'end', value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className={styles.saveArea}>
              <button onClick={handleSave} className={styles.saveBtn}>
                💾 저장
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
