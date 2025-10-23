import { useState } from 'react';
import { saveProductionPlan } from './productionService';

// 🔹 데이터 타입 정의
interface ProcessRow {
  group: string;
  name: string;
  type: string | null;
  key: string;
  hasElectrode: boolean;
}

// 🔹 주차 계산 함수
function getWeekOfMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfWeek = firstDay.getDay();
  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
}

export default function ProductionForm({ projectId }: { projectId: number }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weekInfo, setWeekInfo] = useState('');
  const [processPlans, setProcessPlans] = useState<Record<string, { start: string; end: string }>>({});

  // 🔹 공정 리스트
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

  // 🔹 날짜 변경 시 주차 계산
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

      const resultText = `${startMonth}월 ${startWeek}주차 ~ ${endMonth}월 ${endWeek}주차`;
      setWeekInfo(resultText);

      console.log('📅 주차 계산 결과:', {
        startDate: s,
        endDate: e,
        startMonth,
        startWeek,
        endMonth,
        endWeek,
      });
    }
  };

  // 🔹 공정별 일정 변경
  const handleProcessChange = (key: string, field: 'start' | 'end', value: string) => {
    setProcessPlans(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  // 🔹 저장
  const handleSave = async () => {
    if (!startDate || !endDate) {
      alert('시작일과 종료일을 입력해주세요.');
      return;
    }

    try {
      const payload = { startDate, endDate, weekInfo, processPlans };
      console.log('📦 전송 데이터:', payload);

      await saveProductionPlan(projectId, payload); // ✅ 서비스 함수 호출
      alert('✅ 일정이 성공적으로 저장되었습니다!');
    } catch (err) {
      console.error('❌ 저장 오류:', err);
      alert('⚠️ 서버에 저장 중 오류가 발생했습니다.');
    }
  };

  // ✅ 타입 명시한 flatMap
  const tableData: ProcessRow[] = processList.flatMap(group =>
    group.items.flatMap<ProcessRow>(item => {
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
    })
  );

  // 🔹 병합 계산
  const getRowSpans = () => {
    const spans: Record<number, { groupSpan: number; nameSpan: number }> = {};
    let i = 0;
    while (i < tableData.length) {
      const currentGroup = tableData[i].group;
      const sameGroup = tableData.filter(r => r.group === currentGroup);
      const groupCount = sameGroup.length;
      let j = 0;
      while (j < sameGroup.length) {
        const currentName = sameGroup[j].name;
        const sameName = sameGroup.filter(r => r.name === currentName);
        const nameCount = sameName.length;
        const startIndex = tableData.findIndex(
          r => r.group === currentGroup && r.name === currentName && r.type === sameName[0].type
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
    <div className='production-form'>
      <h3>📅 일정 등록</h3>

      <div className='date-inputs'>
        <label>
          시작일:
          <input type='date' value={startDate} onChange={e => handleChange('start', e.target.value)} />
        </label>
        <label>
          종료일:
          <input type='date' value={endDate} onChange={e => handleChange('end', e.target.value)} />
        </label>
      </div>

      {weekInfo && (
        <div className='week-result'>
          <strong>🗓 {weekInfo}</strong>
        </div>
      )}

      {startDate && endDate && (
        <div className='process-table'>
          <h4 style={{ marginTop: '25px', marginBottom: '10px' }}>공정별 일정 입력</h4>

          <table className='production-temp-table'>
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
                    {/* 🔹 대공정 병합 */}
                    {span.groupSpan > 0 && <td rowSpan={span.groupSpan}>{row.group}</td>}

                    {/* 🔹 공정명 병합 (전극 없는 경우 colSpan=2) */}
                    {row.hasElectrode ? (
                      span.nameSpan > 0 && <td rowSpan={span.nameSpan}>{row.name}</td>
                    ) : (
                      <td colSpan={2}>{row.name}</td>
                    )}

                    {/* 🔹 전극 */}
                    {row.hasElectrode && <td>{row.type}</td>}

                    {/* 🔹 일정 입력 */}
                    <td>
                      <input
                        type='date'
                        value={processPlans[row.key]?.start || ''}
                        onChange={e => handleProcessChange(row.key, 'start', e.target.value)}
                      />{' '}
                      ~{' '}
                      <input
                        type='date'
                        value={processPlans[row.key]?.end || ''}
                        onChange={e => handleProcessChange(row.key, 'end', e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ textAlign: 'right', marginTop: '15px' }}>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: '#4e73df',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              저장
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
