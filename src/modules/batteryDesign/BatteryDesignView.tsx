import { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/batteryDesign/view.css';
import type { BatteryDesignFormData } from './BatteryDesignTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Props {
  project: { id: number; name: string };
}

export default function BatteryDesignView({ project }: Props) {
  const [data, setData] = useState<BatteryDesignFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        const res = await axios.get(`${API_BASE}/specification/${project.id}`, {
          withCredentials: true,
        });
        setData(res.data);
      } catch (err) {
        console.error('전지 설계 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDesign();
  }, [project.id]);

  if (loading) return <p>로딩 중...</p>;
  if (!data) return <p>데이터가 없습니다.</p>;

  const renderCell = (value?: string | number) => <span>{value ?? '-'}</span>;

  return (
    <div className='battery-design-view'>
      <h2>
        ID: {project.id} <br />
        프로젝트명: {project.name}
      </h2>

      <table className='design-table'>
        <thead>
          <tr>
            <th colSpan={3}>Classification</th>
            <th>Value</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          {/* ===================== Cathode ===================== */}
          <tr>
            <td rowSpan={7} className='group-cell'>
              Cathode
            </td>
            <td colSpan={2}>Active material 1 (%)</td>
            <td>{renderCell(data.cathode.activeMaterial1.value)}</td>
            <td>{renderCell(data.cathode.activeMaterial1.remark)}</td>
          </tr>
          <tr>
            <td colSpan={2}>Active material 2 (%)</td>
            <td>{renderCell(data.cathode.activeMaterial2.value)}</td>
            <td>{renderCell(data.cathode.activeMaterial2.remark)}</td>
          </tr>
          <tr>
            <td colSpan={2}>Conductor (%)</td>
            <td>{renderCell(data.cathode.conductor.value)}</td>
            <td>{renderCell(data.cathode.conductor.remark)}</td>
          </tr>
          <tr>
            <td colSpan={2}>Binder (%)</td>
            <td>{renderCell(data.cathode.binder.value)}</td>
            <td>{renderCell(data.cathode.binder.remark)}</td>
          </tr>
          <tr>
            <td colSpan={2}>Loading level (mg/cm²)</td>
            <td>{renderCell(data.cathode.loadingLevel.value)}</td>
            <td>{renderCell(data.cathode.loadingLevel.remark)}</td>
          </tr>
          <tr>
            <td colSpan={2}>Thickness (μm)</td>
            <td>{renderCell(data.cathode.thickness.value)}</td>
            <td>{renderCell(data.cathode.thickness.remark)}</td>
          </tr>
          <tr>
            <td colSpan={2}>Electrode density (g/cc)</td>
            <td>{renderCell(data.cathode.electrodeDensity.value)}</td>
            <td>{renderCell(data.cathode.electrodeDensity.remark)}</td>
          </tr>

          {/* ===================== Anode ===================== */}
          <tr>
            <td rowSpan={6} className='group-cell'>
              Anode
            </td>
            <td colSpan={2}>Active material (%)</td>
            <td>{renderCell(data.anode.activeMaterial.value)}</td>
            <td>{renderCell(data.anode.activeMaterial.remark)}</td>
          </tr>
          <tr>
            <td colSpan={2}>Conductor (%)</td>
            <td>{renderCell(data.anode.conductor.value)}</td>
            <td>{renderCell(data.anode.conductor.remark)}</td>
          </tr>
          <tr>
            <td colSpan={2}>Binder (%)</td>
            <td>{renderCell(data.anode.binder.value)}</td>
            <td>{renderCell(data.anode.binder.remark)}</td>
          </tr>
          <tr>
            <td colSpan={2}>Loading level (mg/cm²)</td>
            <td>{renderCell(data.anode.loadingLevel.value)}</td>
            <td>{renderCell(data.anode.loadingLevel.remark)}</td>
          </tr>
          <tr>
            <td colSpan={2}>Thickness (μm)</td>
            <td>{renderCell(data.anode.thickness.value)}</td>
            <td>{renderCell(data.anode.thickness.remark)}</td>
          </tr>
          <tr>
            <td colSpan={2}>Electrode density (g/cc)</td>
            <td>{renderCell(data.anode.electrodeDensity.value)}</td>
            <td>{renderCell(data.anode.electrodeDensity.remark)}</td>
          </tr>

          {/* ===================== Assembly ===================== */}
          <tr>
            <td rowSpan={3} className='group-cell'>
              Assembly
            </td>
            <td colSpan={2}>Stack no. (ea)</td>
            <td>
              {data.assembly.stackNo.value1}/{data.assembly.stackNo.value2}
            </td>
            <td>{renderCell(data.assembly.stackNo.remark)}</td>
          </tr>
          <tr>
            <td colSpan={2}>Separator (μm)</td>
            <td>{renderCell(data.assembly.separator.value)}</td>
            <td>{renderCell(data.assembly.separator.remark)}</td>
          </tr>
          <tr>
            <td colSpan={2}>Electrolyte (g)</td>
            <td>{renderCell(data.assembly.electrolyte.value)}</td>
            <td>{renderCell(data.assembly.electrolyte.remark)}</td>
          </tr>

          {/* ===================== Cell ===================== */}
          <tr>
            <td rowSpan={6} className='group-cell'>
              Cell
            </td>
            <td colSpan={2}>N/P ratio</td>
            <td>{renderCell(data.cell.npRatio.value)}</td>
            <td>{renderCell(data.cell.npRatio.remark)}</td>
          </tr>
          <tr>
            <td colSpan={2}>Nominal capacity (Ah)</td>
            <td>{renderCell(data.cell.nominalCapacity.value)}</td>
            <td>{renderCell(data.cell.nominalCapacity.remark)}</td>
          </tr>
          <tr>
            <td colSpan={2}>Weight (g)</td>
            <td>{renderCell(data.cell.weight.value)}</td>
            <td>{renderCell(data.cell.weight.remark)}</td>
          </tr>
          <tr>
            <td colSpan={2}>Thickness (mm)</td>
            <td>{renderCell(data.cell.thickness.value)}</td>
            <td>{renderCell(data.cell.thickness.remark)}</td>
          </tr>
          <tr>
            <td rowSpan={2}>Energy density</td>
            <td>Gravimetric (Wh/kg)</td>
            <td>{renderCell(data.cell.energyDensity.gravimetric.value)}</td>
            <td>{renderCell(data.cell.energyDensity.gravimetric.remark)}</td>
          </tr>
          <tr>
            <td>Volumetric (Wh/L)</td>
            <td>{renderCell(data.cell.energyDensity.volumetric.value)}</td>
            <td>{renderCell(data.cell.energyDensity.volumetric.remark)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
