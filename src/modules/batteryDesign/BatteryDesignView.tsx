import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/batteryDesign/view.css';
import type { BatteryDesignFormData } from './BatteryDesignTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface BatteryDesignViewProps {
  project: { id: number; name: string };
}

export default function BatteryDesignView({ project }: BatteryDesignViewProps) {
  const [data, setData] = useState<BatteryDesignFormData | null>(null);
  const [loading, setLoading] = useState(true);

  /** ✅ 전지 설계 데이터 불러오기 */
  const fetchDesign = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/specification/${project.id}`, { withCredentials: true });
      setData(res.data);
    } catch (err) {
      console.error('전지 설계 데이터 불러오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesign();
  }, [project.id]);

  if (loading) return <p>로딩 중...</p>;
  if (!data) return <p>전지 설계 데이터가 없습니다.</p>;

  return (
    <div className='battery-design-view'>
      <h2>전지 설계 조회</h2>

      {/* ✅ 프로젝트 기본 정보 */}
      <div className='project-info'>
        <p>
          <strong>ID:</strong> {project.id}
        </p>
        <p>
          <strong>프로젝트명:</strong> {project.name}
        </p>
      </div>

      {/* ✅ 설계 정보 테이블 */}
      <table className='design-table'>
        <thead>
          <tr>
            <th colSpan={3}>Classification</th>
            <th>Value</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          {/* Cathode */}
          <tr className='section-header'>
            <td colSpan={5}>Cathode</td>
          </tr>
          {Object.entries(data.cathode).map(([key, item]) => (
            <tr key={key}>
              <td colSpan={3}>{key.replace(/_/g, ' ')}</td>
              <td>{'value' in item ? (item as any).value : '-'}</td>
              <td>{'remark' in item ? (item as any).remark : '-'}</td>
            </tr>
          ))}

          {/* Anode */}
          <tr className='section-header'>
            <td colSpan={5}>Anode</td>
          </tr>
          {Object.entries(data.anode).map(([key, item]) => (
            <tr key={key}>
              <td colSpan={3}>{key.replace(/_/g, ' ')}</td>
              <td>{'value' in item ? (item as any).value : '-'}</td>
              <td>{'remark' in item ? (item as any).remark : '-'}</td>
            </tr>
          ))}

          {/* Assembly */}
          <tr className='section-header'>
            <td colSpan={5}>Assembly</td>
          </tr>
          {Object.entries(data.assembly).map(([key, item]) => (
            <tr key={key}>
              <td colSpan={3}>{key.replace(/_/g, ' ')}</td>
              <td>
                {'value' in item
                  ? (item as any).value
                  : (item as any).value1
                  ? `${(item as any).value1} / ${(item as any).value2}`
                  : '-'}
              </td>
              <td>{'remark' in item ? (item as any).remark : '-'}</td>
            </tr>
          ))}

          {/* Cell */}
          <tr className='section-header'>
            <td colSpan={5}>Cell</td>
          </tr>
          {Object.entries(data.cell).map(([key, item]) => {
            if (key === 'energy_density') {
              return (
                <React.Fragment key={key}>
                  <tr>
                    <td rowSpan={2} colSpan={3}>
                      Energy density
                    </td>
                    <td>Gravimetric: {(item as any).gravimetric.value}</td>
                    <td>{(item as any).gravimetric.remark}</td>
                  </tr>
                  <tr>
                    <td>Volumetric: {(item as any).volumetric.value}</td>
                    <td>{(item as any).volumetric.remark}</td>
                  </tr>
                </React.Fragment>
              );
            }
            return (
              <tr key={key}>
                <td colSpan={3}>{key.replace(/_/g, ' ')}</td>
                <td>{'value' in item ? (item as any).value : '-'}</td>
                <td>{'remark' in item ? (item as any).remark : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
