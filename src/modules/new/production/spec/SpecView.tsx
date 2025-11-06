import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSpecificationByProject } from './SpecService';
import type { SpecForm } from './SpecTypes';
import { initialSpecForm } from './SpecInitialState';
import styles from '../../../../styles/production/spec/specView.module.css';

export default function SpecView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { project } = (location.state as { project: any }) || {};
  const [form, setForm] = useState<SpecForm>(initialSpecForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!project) {
      alert('⚠️ 프로젝트 정보가 없습니다.');
      navigate(-1);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await getSpecificationByProject(project.id);
        const safeData: SpecForm = {
          cathode: data.cathode ?? initialSpecForm.cathode,
          anode: data.anode ?? initialSpecForm.anode,
          assembly: data.assembly ?? initialSpecForm.assembly,
          cell: data.cell ?? initialSpecForm.cell,
        };
        setForm(safeData);
      } catch (err: any) {
        console.error('❌ 설계 조회 실패:', err);
        if (err.response) {
          const { error, message, statusCode } = err.response.data;
          alert(`${error}(${statusCode}): ${message}`);
          return;
        }
        alert('설계 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [project, navigate]);

  if (loading) return <div>로딩 중...</div>;

  const renderArrayRows = (arr: { value: string; remark: string }[], label: string) =>
    arr.map((item, i) => (
      <tr key={`${label}-${i}`}>
        <td colSpan={2}>{arr.length === 1 ? `${label} (%)` : `${label} ${i + 1} (%)`}</td>
        <td>{item.value || '-'}</td>
        <td>{item.remark || '-'}</td>
      </tr>
    ));

  return (
    <div className={styles.specView}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← 목록으로
      </button>

      <h2>{project.name} 전지 설계 조회</h2>

      <table className={styles.specViewTable}>
        <thead>
          <tr>
            <th colSpan={3}>Classification</th>
            <th>Value</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          {form.cathode.activeMaterial.map((_, i) => (
            <tr key={`cathode-active-${i}`}>
              {i === 0 && (
                <td
                  rowSpan={
                    form.cathode.activeMaterial.length + form.cathode.conductor.length + form.cathode.binder.length + 3
                  }
                  className={styles.specViewGroupCell}
                >
                  Cathode
                </td>
              )}
              <td colSpan={2}>
                {form.cathode.activeMaterial.length === 1 ? 'Active material (%)' : `Active material ${i + 1} (%)`}
              </td>
              <td>{form.cathode.activeMaterial[i].value || '-'}</td>
              <td>{form.cathode.activeMaterial[i].remark || '-'}</td>
            </tr>
          ))}

          {renderArrayRows(form.cathode.conductor, 'Conductor')}
          {renderArrayRows(form.cathode.binder, 'Binder')}

          <tr>
            <td colSpan={2}>Loading level (mg/cm²)</td>
            <td>{form.cathode.loadingLevel.value || '-'}</td>
            <td>{form.cathode.loadingLevel.remark || '-'}</td>
          </tr>
          <tr>
            <td colSpan={2}>Thickness (μm)</td>
            <td>{form.cathode.thickness.value || '-'}</td>
            <td>{form.cathode.thickness.remark || '-'}</td>
          </tr>
          <tr>
            <td colSpan={2}>Electrode density (g/cc)</td>
            <td>{form.cathode.electrodeDensity.value || '-'}</td>
            <td>{form.cathode.electrodeDensity.remark || '-'}</td>
          </tr>

          {form.anode.activeMaterial.map((_, i) => (
            <tr key={`anode-active-${i}`}>
              {i === 0 && (
                <td
                  rowSpan={
                    form.anode.activeMaterial.length + form.anode.conductor.length + form.anode.binder.length + 3
                  }
                  className={styles.specViewGroupCell}
                >
                  Anode
                </td>
              )}
              <td colSpan={2}>
                {form.anode.activeMaterial.length === 1 ? 'Active material (%)' : `Active material ${i + 1} (%)`}
              </td>
              <td>{form.anode.activeMaterial[i].value || '-'}</td>
              <td>{form.anode.activeMaterial[i].remark || '-'}</td>
            </tr>
          ))}

          {renderArrayRows(form.anode.conductor, 'Conductor')}
          {renderArrayRows(form.anode.binder, 'Binder')}

          <tr>
            <td colSpan={2}>Loading level (mg/cm²)</td>
            <td>{form.anode.loadingLevel.value || '-'}</td>
            <td>{form.anode.loadingLevel.remark || '-'}</td>
          </tr>
          <tr>
            <td colSpan={2}>Thickness (μm)</td>
            <td>{form.anode.thickness.value || '-'}</td>
            <td>{form.anode.thickness.remark || '-'}</td>
          </tr>
          <tr>
            <td colSpan={2}>Electrode density (g/cc)</td>
            <td>{form.anode.electrodeDensity.value || '-'}</td>
            <td>{form.anode.electrodeDensity.remark || '-'}</td>
          </tr>

          <tr>
            <td rowSpan={3} className={styles.specViewGroupCell}>
              Assembly
            </td>
            <td colSpan={2}>Stack no. (ea)</td>
            <td>
              {form.assembly.stackNo.value1 || '-'} / {form.assembly.stackNo.value2 || '-'}
            </td>
            <td>{form.assembly.stackNo.remark || '-'}</td>
          </tr>
          <tr>
            <td colSpan={2}>Separator (μm)</td>
            <td>{form.assembly.separator.value || '-'}</td>
            <td>{form.assembly.separator.remark || '-'}</td>
          </tr>
          <tr>
            <td colSpan={2}>Electrolyte (g)</td>
            <td>{form.assembly.electrolyte.value || '-'}</td>
            <td>{form.assembly.electrolyte.remark || '-'}</td>
          </tr>

          <tr>
            <td rowSpan={6} className={styles.specViewGroupCell}>
              Cell
            </td>
            <td colSpan={2}>N/P ratio</td>
            <td>{form.cell.npRatio.value || '-'}</td>
            <td>{form.cell.npRatio.remark || '-'}</td>
          </tr>
          <tr>
            <td colSpan={2}>Nominal capacity (Ah)</td>
            <td>{form.cell.nominalCapacity.value || '-'}</td>
            <td>{form.cell.nominalCapacity.remark || '-'}</td>
          </tr>
          <tr>
            <td colSpan={2}>Weight (g)</td>
            <td>{form.cell.weight.value || '-'}</td>
            <td>{form.cell.weight.remark || '-'}</td>
          </tr>
          <tr>
            <td colSpan={2}>Thickness (mm)</td>
            <td>{form.cell.thickness.value || '-'}</td>
            <td>{form.cell.thickness.remark || '-'}</td>
          </tr>
          <tr>
            <td rowSpan={2}>Energy density</td>
            <td>Gravimetric (Wh/kg)</td>
            <td>{form.cell.energyDensity.gravimetric.value || '-'}</td>
            <td>{form.cell.energyDensity.gravimetric.remark || '-'}</td>
          </tr>
          <tr>
            <td>Volumetric (Wh/L)</td>
            <td>{form.cell.energyDensity.volumetric.value || '-'}</td>
            <td>{form.cell.energyDensity.volumetric.remark || '-'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
