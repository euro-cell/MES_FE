import React, { useEffect, useState } from 'react';
import { buildScheduleTable } from './processUtils';

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

  return (
    <div className='modal'>
      <div className='modal-content'>
        <span className='close' onClick={onClose}>
          &times;
        </span>
        <h2>{project.name} 일정 조회</h2>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
