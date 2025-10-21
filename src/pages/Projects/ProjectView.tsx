import React, { useEffect, useState } from 'react';
import { buildScheduleTable } from './processUtils';
import { exportHtmlTableToExcel } from './exportExcel';

export default function ProjectView({ project, onClose }: { project: any; onClose: () => void }) {
  const [html, setHtml] = useState('<p>📡 데이터를 불러오는 중...</p>');

  useEffect(() => {
    fetch(`http://127.0.0.1:8080/projects/${project.id}/plan/search`)
      .then(res => res.json())
      .then(data => {
        console.log('🚀 ~ data:', data);
        if (!data.length) return setHtml('<p>등록된 일정이 없습니다.</p>');
        setHtml(buildScheduleTable(data[0]).html);
      })
      .catch(() => setHtml('<p style="color:red;">조회 실패</p>'));
  }, [project.id]);

  const handleExportExcel = () => {
    exportHtmlTableToExcel(html, `${project.name}_schedule`);
  };

  return (
    <div className='modal'>
      <div className='modal-content'>
        <span className='close' onClick={onClose}>
          &times;
        </span>
        <h2>{project.name} 일정 조회</h2>

        <button
          onClick={handleExportExcel}
          style={{
            margin: '10px 0',
            padding: '6px 12px',
            background: '#1b263b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          📥 엑셀 다운로드
        </button>

        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
