import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from '../../../styles/production/plan/PlanRegister.module.css';
import { getProductionPlan, updateProductionPlan } from './PlanService';
import type { PlanPayload } from './PlanTypes';
import DateInput from '../../../components/DateInput';

interface ProcessRow {
  group: string;
  name: string;
  type: string | null;
  key: string;
  hasElectrode: boolean;
}

export default function PlanEdit() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const project = state?.project;

  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weekInfo, setWeekInfo] = useState('');
  const [processPlans, setProcessPlans] = useState<Record<string, { start: string; end: string }>>({});

  /** 📅 주차 계산 */
  const getWeekOfMonth = (date: Date): number => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayOfWeek = firstDay.getDay();
    const dayOfMonth = date.getDate();
    return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
  };

  /** 🔹 기존 계획 불러오기 */
  useEffect(() => {
    if (!project?.id) return;

    const fetchPlan = async () => {
      try {
        const res = await getProductionPlan(project.id);
        const data = Array.isArray(res) ? res[0] : res;

        console.log('✅ Loaded Plan Data:', data);

        setStartDate(data.startDate.split('T')[0]);
        setEndDate(data.endDate.split('T')[0]);

        const keyMap: Record<string, string> = {
          mixingCathode: 'Electrode_Slurry Mixing_Cathode',
          mixingAnode: 'Electrode_Slurry Mixing_Anode',
          coatingCathode: 'Electrode_Coating_Cathode',
          coatingAnode: 'Electrode_Coating_Anode',
          calenderingCathode: 'Electrode_Calendering_Cathode',
          calenderingAnode: 'Electrode_Calendering_Anode',
          notchingCathode: 'Electrode_Notching_Cathode',
          notchingAnode: 'Electrode_Notching_Anode',
          pouchForming: 'Cell Assembly_Pouch Forming',
          vacuumDryingCathode: 'Cell Assembly_Vacuum Drying_Cathode',
          vacuumDryingAnode: 'Cell Assembly_Vacuum Drying_Anode',
          stacking: 'Cell Assembly_Stacking',
          tabWelding: 'Cell Assembly_Tab Welding',
          sealing: 'Cell Assembly_Sealing',
          elFilling: 'Cell Assembly_E/L Filling',
          pfMf: 'Cell Formation_PF/MF',
          grading: 'Cell Formation_Grading',
        };

        const converted: Record<string, { start: string; end: string }> = {};
        Object.entries(data.planData || {}).forEach(([key, value]) => {
          const mappedKey = keyMap[key];
          if (!mappedKey) return;

          if (typeof value === 'string') {
            if (value.includes('~')) {
              const [s, e] = value.split('~').map(v => v.trim());
              converted[mappedKey] = { start: s, end: e };
            } else {
              converted[mappedKey] = { start: value, end: '' }; // ✅ 단일 날짜는 end 비움
            }
          }
        });

        setProcessPlans(converted);

        const sDate = new Date(data.startDate);
        const eDate = new Date(data.endDate);
        const startMonth = sDate.getMonth() + 1;
        const endMonth = eDate.getMonth() + 1;
        const startWeek = getWeekOfMonth(sDate);
        const endWeek = getWeekOfMonth(eDate);
        setWeekInfo(`${startMonth}월 ${startWeek}주차 ~ ${endMonth}월 ${endWeek}주차`);
      } catch (err) {
        console.error('❌ 계획 데이터 불러오기 실패:', err);
        alert('계획 데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [project?.id]);

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

  /** 수정 저장 */
  const handleSave = async () => {
    if (!startDate || !endDate) {
      alert('시작일과 종료일을 입력해주세요.');
      return;
    }

    const payload: PlanPayload = { startDate, endDate, weekInfo, processPlans };

    try {
      await updateProductionPlan(project.id, payload); // ✅ 수정용 PATCH
      alert('✅ 수정 완료!');
      navigate('/prod/plan');
    } catch (err) {
      console.error(err);
      alert('❌ 수정 실패');
    }
  };

  /** 공정 구조 */
  const processList = [
    {
      group: 'Electrode',
      items: [
        { name: 'Slurry Mixing', types: ['Cathode', 'Anode'] },
        { name: 'Coating', types: ['Cathode', 'Anode'] },
        { name: 'Calendering', types: ['Cathode', 'Anode'] },
        { name: 'Notching', types: ['Cathode', 'Anode'] },
      ],
    },
    {
      group: 'Cell Assembly',
      items: [
        { name: 'Pouch Forming', types: [] },
        { name: 'Vacuum Drying', types: ['Cathode', 'Anode'] },
        { name: 'Stacking', types: [] },
        { name: 'Tab Welding', types: [] },
        { name: 'Sealing', types: [] },
        { name: 'E/L Filling', types: [] },
      ],
    },
    {
      group: 'Cell Formation',
      items: [
        { name: 'PF/MF', types: [] },
        { name: 'Grading', types: [] },
      ],
    },
  ];

  /** ✅ 타입 명시로 flatMap 오류 해결 */
  const tableData: ProcessRow[] = processList.flatMap((group): ProcessRow[] => {
    return group.items.flatMap((item): ProcessRow[] => {
      if (item.types.length === 0) {
        return [
          {
            group: group.group,
            name: item.name,
            type: null,
            key: `${group.group}_${item.name}`,
            hasElectrode: false,
          },
        ];
      }
      return item.types.map(
        (type): ProcessRow => ({
          group: group.group,
          name: item.name,
          type,
          key: `${group.group}_${item.name}_${type}`,
          hasElectrode: true,
        })
      );
    });
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
          r => r.group === group && r.name === name && r.type === sameName[0].type
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

  if (loading) return <div className={styles.planRegisterPage}>⏳ 불러오는 중...</div>;

  return (
    <div className={styles.planRegisterPage}>
      <div className={styles.header}>
        <h3>✏️ 생산계획 수정 - {project?.name}</h3>
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
      </div>

      {weekInfo && (
        <>
          <div className={styles.weekResult}>
            <strong>🗓 {weekInfo}</strong>
          </div>

          <div className={styles.processTable}>
            <h4>공정별 일정 수정</h4>
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
                💾 수정 저장
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
