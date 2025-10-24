import { useEffect, useState } from 'react';
import { batteryDesignService } from './BatteryDesignService';
import '../../styles/batteryDesign/list.css';

interface BatteryDesign {
  id: number;
  version: string;
  np_ratio: string;
  capacity: string;
  weight: string;
  energy_gravimetric: string;
  energy_volumetric: string;
}

export default function BatteryDesignList() {
  const [list, setList] = useState<BatteryDesign[]>([]);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await batteryDesignService.getAll();
        setList(res.data);
      } catch (err) {
        console.error('❌ 설계 리스트 조회 실패:', err);
      }
    };
    fetchList();
  }, []);

  return (
    <div className='battery-design-list'>
      <h2>전지 설계 리스트</h2>
      <table className='design-table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Version</th>
            <th>N/P Ratio</th>
            <th>Capacity (Ah)</th>
            <th>Weight (g)</th>
            <th>Energy Density (Wh/kg)</th>
            <th>Volumetric (Wh/L)</th>
          </tr>
        </thead>
        <tbody>
          {list.length > 0 ? (
            list.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.version}</td>
                <td>{item.np_ratio}</td>
                <td>{item.capacity}</td>
                <td>{item.weight}</td>
                <td>{item.energy_gravimetric}</td>
                <td>{item.energy_volumetric}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className='no-data'>
                등록된 전지 설계 데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
