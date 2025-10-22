import React from 'react';

interface Production {
  id: number;
  name: string;
  company: string;
  mode: string;
  year: number;
  month: number;
  round: number;
  batteryType: string;
  capacity: number;
}

interface Props {
  productions: Production[];
  onRegister: (production: Production) => void;
  onView: (production: Production) => void;
  onDelete: (id: number, name: string) => void;
}

export default function ProductionTable({ productions, onRegister, onView, onDelete }: Props) {
  return (
    <table className='table-list'>
      <thead>
        <tr>
          <th>ID</th>
          <th>프로젝트명</th>
          <th>회사</th>
          <th>유형</th>
          <th>년도</th>
          <th>월</th>
          <th>회차</th>
          <th>전지 타입</th>
          <th>용량</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        {productions.map(p => (
          <tr key={p.id}>
            <td>{p.id}</td>
            <td>{p.name}</td>
            <td>{p.company}</td>
            <td>{p.mode}</td>
            <td>{p.year}</td>
            <td>{p.month}</td>
            <td>{p.round}</td>
            <td>{p.batteryType}</td>
            <td>{p.capacity}</td>
            <td>
              <button className='open-plan-modal' onClick={() => onRegister(p)}>
                등록
              </button>
              <button className='open-view-modal' onClick={() => onView(p)}>
                조회
              </button>
              <button className='delete-production' onClick={() => onDelete(p.id, p.name)}>
                삭제
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
