import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createSpecification } from './SpecService';
import styles from '../../../../styles/production/spec/specNew.module.css';

interface Field {
  value: string;
  remark: string;
}

interface SpecForm {
  cathode: {
    activeMaterial: Field[];
    conductor: Field[];
    binder: Field[];
    loadingLevel: Field;
    thickness: Field;
    electrodeDensity: Field;
  };
  anode: {
    activeMaterial: Field[];
    conductor: Field[];
    binder: Field[];
    loadingLevel: Field;
    thickness: Field;
    electrodeDensity: Field;
  };
  assembly: {
    stackNo: { value1: string; value2: string; remark: string };
    separator: Field;
    electrolyte: Field;
  };
  cell: {
    npRatio: Field;
    nominalCapacity: Field;
    weight: Field;
    thickness: Field;
    energyDensity: {
      gravimetric: Field;
      volumetric: Field;
    };
  };
}

export default function SpecNew() {
  const location = useLocation();
  const { projectName, productionId } = location.state || {};

  if (!projectName || !productionId) return <p style={{ color: 'red' }}>⚠️ 프로젝트 정보가 없습니다.</p>;

  const [form, setForm] = useState<SpecForm>({
    cathode: {
      activeMaterial: [{ value: '', remark: '' }],
      conductor: [{ value: '', remark: '' }],
      binder: [{ value: '', remark: '' }],
      loadingLevel: { value: '', remark: '' },
      thickness: { value: '', remark: '' },
      electrodeDensity: { value: '', remark: '' },
    },
    anode: {
      activeMaterial: [{ value: '', remark: '' }],
      conductor: [{ value: '', remark: '' }],
      binder: [{ value: '', remark: '' }],
      loadingLevel: { value: '', remark: '' },
      thickness: { value: '', remark: '' },
      electrodeDensity: { value: '', remark: '' },
    },
    assembly: {
      stackNo: { value1: '', value2: '', remark: '' },
      separator: { value: '', remark: '' },
      electrolyte: { value: '', remark: '' },
    },
    cell: {
      npRatio: { value: '', remark: '' },
      nominalCapacity: { value: '', remark: '' },
      weight: { value: '', remark: '' },
      thickness: { value: '', remark: '' },
      energyDensity: {
        gravimetric: { value: '', remark: '' },
        volumetric: { value: '', remark: '' },
      },
    },
  });

  const handleChange = (section: string, field: string, index: number, key: string, value: string) => {
    setForm(prev => {
      const copy = structuredClone(prev);
      if (Array.isArray((copy as any)[section][field])) {
        (copy as any)[section][field][index][key] = value;
      } else {
        (copy as any)[section][field][key] = value;
      }
      return copy;
    });
  };

  const addRow = (section: string, field: string) => {
    setForm(prev => {
      const copy = structuredClone(prev);
      (copy as any)[section][field].push({ value: '', remark: '' });
      return copy;
    });
  };

  const removeRow = (section: string, field: string, index: number) => {
    setForm(prev => {
      const copy = structuredClone(prev);
      (copy as any)[section][field].splice(index, 1);
      return copy;
    });
  };

  const handleSubmit = async () => {
    try {
      await createSpecification(productionId, form);
      alert('✅ 저장 완료');
    } catch (err) {
      console.error(err);
      alert('❌ 저장 실패');
    }
  };

  return (
    <div className={styles.specNew}>
      <h2>{projectName} 전지 설계 등록</h2>

      <table className={styles.specNewTable}>
        <thead>
          <tr>
            <th colSpan={3}>Classification</th>
            <th>Value</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          {/* ---------------- Cathode ---------------- */}
          {(() => {
            const cathodeRowSpan =
              form.cathode.activeMaterial.length + form.cathode.conductor.length + form.cathode.binder.length + 3;

            return (
              <>
                {form.cathode.activeMaterial.map((item, i) => (
                  <tr key={`cathode-active-${i}`}>
                    {i === 0 && (
                      <td rowSpan={cathodeRowSpan} className={styles.specNewGroupCell}>
                        Cathode
                      </td>
                    )}
                    <td colSpan={2}>Active material (%)</td>
                    <td>
                      <input
                        value={item.value}
                        onChange={e => handleChange('cathode', 'activeMaterial', i, 'value', e.target.value)}
                      />
                    </td>
                    <td className={styles.remarkCell}>
                      <div className={styles.inputWithButtons}>
                        <input
                          value={item.remark}
                          onChange={e => handleChange('cathode', 'activeMaterial', i, 'remark', e.target.value)}
                        />
                        <div className={styles.buttonGroup}>
                          <button
                            type='button'
                            className={styles.addBtn}
                            onClick={() => addRow('cathode', 'activeMaterial')}
                          >
                            +
                          </button>
                          {i > 0 && (
                            <button
                              type='button'
                              className={styles.removeBtn}
                              onClick={() => removeRow('cathode', 'activeMaterial', i)}
                            >
                              −
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {form.cathode.conductor.map((item, i) => (
                  <tr key={`cathode-cond-${i}`}>
                    <td colSpan={2}>Conductor (%)</td>
                    <td>
                      <input
                        value={item.value}
                        onChange={e => handleChange('cathode', 'conductor', i, 'value', e.target.value)}
                      />
                    </td>
                    <td className={styles.remarkCell}>
                      <div className={styles.inputWithButtons}>
                        <input
                          value={item.remark}
                          onChange={e => handleChange('cathode', 'conductor', i, 'remark', e.target.value)}
                        />
                        <div className={styles.buttonGroup}>
                          <button
                            type='button'
                            className={styles.addBtn}
                            onClick={() => addRow('cathode', 'conductor')}
                          >
                            +
                          </button>
                          {i > 0 && (
                            <button
                              type='button'
                              className={styles.removeBtn}
                              onClick={() => removeRow('cathode', 'conductor', i)}
                            >
                              −
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {form.cathode.binder.map((item, i) => (
                  <tr key={`cathode-binder-${i}`}>
                    <td colSpan={2}>Binder (%)</td>
                    <td>
                      <input
                        value={item.value}
                        onChange={e => handleChange('cathode', 'binder', i, 'value', e.target.value)}
                      />
                    </td>
                    <td className={styles.remarkCell}>
                      <div className={styles.inputWithButtons}>
                        <input
                          value={item.remark}
                          onChange={e => handleChange('cathode', 'binder', i, 'remark', e.target.value)}
                        />
                        <div className={styles.buttonGroup}>
                          <button type='button' className={styles.addBtn} onClick={() => addRow('cathode', 'binder')}>
                            +
                          </button>
                          {i > 0 && (
                            <button
                              type='button'
                              className={styles.removeBtn}
                              onClick={() => removeRow('cathode', 'binder', i)}
                            >
                              −
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {['loadingLevel', 'thickness', 'electrodeDensity'].map(field => (
                  <tr key={`cathode-${field}`}>
                    <td colSpan={2}>
                      {field === 'loadingLevel'
                        ? 'Loading level (mg/cm²)'
                        : field === 'thickness'
                        ? 'Thickness (μm)'
                        : 'Electrode density (g/cc)'}
                    </td>
                    <td>
                      <input
                        value={(form.cathode as any)[field].value}
                        onChange={e => handleChange('cathode', field, 0, 'value', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        value={(form.cathode as any)[field].remark}
                        onChange={e => handleChange('cathode', field, 0, 'remark', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </>
            );
          })()}

          {/* ---------------- Anode ---------------- */}
          {(() => {
            const anodeRowSpan =
              form.anode.activeMaterial.length + form.anode.conductor.length + form.anode.binder.length + 3;

            return (
              <>
                {form.anode.activeMaterial.map((item, i) => (
                  <tr key={`anode-active-${i}`}>
                    {i === 0 && (
                      <td rowSpan={anodeRowSpan} className={styles.specNewGroupCell}>
                        Anode
                      </td>
                    )}
                    <td colSpan={2}>Active material (%)</td>
                    <td>
                      <input
                        value={item.value}
                        onChange={e => handleChange('anode', 'activeMaterial', i, 'value', e.target.value)}
                      />
                    </td>
                    <td className={styles.remarkCell}>
                      <div className={styles.inputWithButtons}>
                        <input
                          value={item.remark}
                          onChange={e => handleChange('anode', 'activeMaterial', i, 'remark', e.target.value)}
                        />
                        <div className={styles.buttonGroup}>
                          <button
                            type='button'
                            className={styles.addBtn}
                            onClick={() => addRow('anode', 'activeMaterial')}
                          >
                            +
                          </button>
                          {i > 0 && (
                            <button
                              type='button'
                              className={styles.removeBtn}
                              onClick={() => removeRow('anode', 'activeMaterial', i)}
                            >
                              −
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {form.anode.conductor.map((item, i) => (
                  <tr key={`anode-cond-${i}`}>
                    <td colSpan={2}>Conductor (%)</td>
                    <td>
                      <input
                        value={item.value}
                        onChange={e => handleChange('anode', 'conductor', i, 'value', e.target.value)}
                      />
                    </td>
                    <td className={styles.remarkCell}>
                      <div className={styles.inputWithButtons}>
                        <input
                          value={item.remark}
                          onChange={e => handleChange('anode', 'conductor', i, 'remark', e.target.value)}
                        />
                        <div className={styles.buttonGroup}>
                          <button type='button' className={styles.addBtn} onClick={() => addRow('anode', 'conductor')}>
                            +
                          </button>
                          {i > 0 && (
                            <button
                              type='button'
                              className={styles.removeBtn}
                              onClick={() => removeRow('anode', 'conductor', i)}
                            >
                              −
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {form.anode.binder.map((item, i) => (
                  <tr key={`anode-binder-${i}`}>
                    <td colSpan={2}>Binder (%)</td>
                    <td>
                      <input
                        value={item.value}
                        onChange={e => handleChange('anode', 'binder', i, 'value', e.target.value)}
                      />
                    </td>
                    <td className={styles.remarkCell}>
                      <div className={styles.inputWithButtons}>
                        <input
                          value={item.remark}
                          onChange={e => handleChange('anode', 'binder', i, 'remark', e.target.value)}
                        />
                        <div className={styles.buttonGroup}>
                          <button type='button' className={styles.addBtn} onClick={() => addRow('anode', 'binder')}>
                            +
                          </button>
                          {i > 0 && (
                            <button
                              type='button'
                              className={styles.removeBtn}
                              onClick={() => removeRow('anode', 'binder', i)}
                            >
                              −
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {['loadingLevel', 'thickness', 'electrodeDensity'].map(field => (
                  <tr key={`anode-${field}`}>
                    <td colSpan={2}>
                      {field === 'loadingLevel'
                        ? 'Loading level (mg/cm²)'
                        : field === 'thickness'
                        ? 'Thickness (μm)'
                        : 'Electrode density (g/cc)'}
                    </td>
                    <td>
                      <input
                        value={(form.anode as any)[field].value}
                        onChange={e => handleChange('anode', field, 0, 'value', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        value={(form.anode as any)[field].remark}
                        onChange={e => handleChange('anode', field, 0, 'remark', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </>
            );
          })()}

          {/* ---------------- Assembly ---------------- */}
          <tr>
            <td rowSpan={3} className={styles.specNewGroupCell}>
              Assembly
            </td>
            <td colSpan={2}>Stack no. (ea)</td>
            <td>
              <input
                style={{ width: '48%' }}
                value={form.assembly.stackNo.value1}
                onChange={e => handleChange('assembly', 'stackNo', 0, 'value1', e.target.value)}
              />
              /
              <input
                style={{ width: '48%' }}
                value={form.assembly.stackNo.value2}
                onChange={e => handleChange('assembly', 'stackNo', 0, 'value2', e.target.value)}
              />
            </td>
            <td>
              <input
                value={form.assembly.stackNo.remark}
                onChange={e => handleChange('assembly', 'stackNo', 0, 'remark', e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <td colSpan={2}>Separator (μm)</td>
            <td>
              <input
                value={form.assembly.separator.value}
                onChange={e => handleChange('assembly', 'separator', 0, 'value', e.target.value)}
              />
            </td>
            <td>
              <input
                value={form.assembly.separator.remark}
                onChange={e => handleChange('assembly', 'separator', 0, 'remark', e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <td colSpan={2}>Electrolyte (g)</td>
            <td>
              <input
                value={form.assembly.electrolyte.value}
                onChange={e => handleChange('assembly', 'electrolyte', 0, 'value', e.target.value)}
              />
            </td>
            <td>
              <input
                value={form.assembly.electrolyte.remark}
                onChange={e => handleChange('assembly', 'electrolyte', 0, 'remark', e.target.value)}
              />
            </td>
          </tr>

          {/* ---------------- Cell ---------------- */}
          <tr>
            <td rowSpan={6} className={styles.specNewGroupCell}>
              Cell
            </td>
            <td colSpan={2}>N/P ratio</td>
            <td>
              <input
                value={form.cell.npRatio.value}
                onChange={e => handleChange('cell', 'npRatio', 0, 'value', e.target.value)}
              />
            </td>
            <td>
              <input
                value={form.cell.npRatio.remark}
                onChange={e => handleChange('cell', 'npRatio', 0, 'remark', e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <td colSpan={2}>Nominal capacity (Ah)</td>
            <td>
              <input
                value={form.cell.nominalCapacity.value}
                onChange={e => handleChange('cell', 'nominalCapacity', 0, 'value', e.target.value)}
              />
            </td>
            <td>
              <input
                value={form.cell.nominalCapacity.remark}
                onChange={e => handleChange('cell', 'nominalCapacity', 0, 'remark', e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <td colSpan={2}>Weight (g)</td>
            <td>
              <input
                value={form.cell.weight.value}
                onChange={e => handleChange('cell', 'weight', 0, 'value', e.target.value)}
              />
            </td>
            <td>
              <input
                value={form.cell.weight.remark}
                onChange={e => handleChange('cell', 'weight', 0, 'remark', e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <td colSpan={2}>Thickness (mm)</td>
            <td>
              <input
                value={form.cell.thickness.value}
                onChange={e => handleChange('cell', 'thickness', 0, 'value', e.target.value)}
              />
            </td>
            <td>
              <input
                value={form.cell.thickness.remark}
                onChange={e => handleChange('cell', 'thickness', 0, 'remark', e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <td rowSpan={2}>Energy density</td>
            <td>Gravimetric (Wh/kg)</td>
            <td>
              <input
                value={form.cell.energyDensity.gravimetric.value}
                onChange={e => handleChange('cell.energyDensity', 'gravimetric', 0, 'value', e.target.value)}
              />
            </td>
            <td>
              <input
                value={form.cell.energyDensity.gravimetric.remark}
                onChange={e => handleChange('cell.energyDensity', 'gravimetric', 0, 'remark', e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <td>Volumetric (Wh/L)</td>
            <td>
              <input
                value={form.cell.energyDensity.volumetric.value}
                onChange={e => handleChange('cell.energyDensity', 'volumetric', 0, 'value', e.target.value)}
              />
            </td>
            <td>
              <input
                value={form.cell.energyDensity.volumetric.remark}
                onChange={e => handleChange('cell.energyDensity', 'volumetric', 0, 'remark', e.target.value)}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div className={styles.saveWrap}>
        <button className={styles.saveBtn} onClick={handleSubmit}>
          저장
        </button>
      </div>
    </div>
  );
}
