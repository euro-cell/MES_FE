import React from 'react';
import type { FieldData, BatteryDesignFormData } from './BatteryDesignTypes';

interface SectionProps {
  formData: BatteryDesignFormData;
  handleChange: (
    section: keyof BatteryDesignFormData | string,
    field: string,
    key: 'value' | 'remark' | 'value1' | 'value2',
    value: string
  ) => void;
}

/* ======================
   🔹 Cathode Section
====================== */
export const CathodeSection: React.FC<SectionProps> = ({ formData, handleChange }) => {
  const cathodeKeys: (keyof BatteryDesignFormData['cathode'])[] = [
    'activeMaterial1',
    'activeMaterial2',
    'conductor',
    'binder',
    'loadingLevel',
    'thickness',
    'electrodeDensity',
  ];

  const labels = [
    'Active material 1 (%)',
    'Active material 2 (%)',
    'Conductor (%)',
    'Binder (%)',
    'Loading level (mg/cm²)',
    'Thickness (μm)',
    'Electrode density (g/cc)',
  ];

  return (
    <>
      {cathodeKeys.map((key, i) => (
        <tr key={key}>
          {i === 0 && (
            <td rowSpan={cathodeKeys.length} className='group-cell'>
              Cathode
            </td>
          )}
          <td colSpan={2}>{labels[i]}</td>
          <td>
            <input
              value={formData.cathode[key].value}
              onChange={e => handleChange('cathode', key, 'value', e.target.value)}
            />
          </td>
          <td>
            <input
              value={formData.cathode[key].remark}
              onChange={e => handleChange('cathode', key, 'remark', e.target.value)}
            />
          </td>
        </tr>
      ))}
    </>
  );
};

/* ======================
   🔹 Anode Section
====================== */
export const AnodeSection: React.FC<SectionProps> = ({ formData, handleChange }) => {
  const anodeKeys: (keyof BatteryDesignFormData['anode'])[] = [
    'activeMaterial',
    'conductor',
    'binder',
    'loadingLevel',
    'thickness',
    'electrodeDensity',
  ];

  const labels = [
    'Active material (%)',
    'Conductor (%)',
    'Binder (%)',
    'Loading level (mg/cm²)',
    'Thickness (μm)',
    'Electrode density (g/cc)',
  ];

  return (
    <>
      {anodeKeys.map((key, i) => (
        <tr key={key}>
          {i === 0 && (
            <td rowSpan={anodeKeys.length} className='group-cell'>
              Anode
            </td>
          )}
          <td colSpan={2}>{labels[i]}</td>
          <td>
            <input
              value={formData.anode[key].value}
              onChange={e => handleChange('anode', key, 'value', e.target.value)}
            />
          </td>
          <td>
            <input
              value={formData.anode[key].remark}
              onChange={e => handleChange('anode', key, 'remark', e.target.value)}
            />
          </td>
        </tr>
      ))}
    </>
  );
};

/* ======================
   🔹 Assembly Section
====================== */
export const AssemblySection: React.FC<SectionProps> = ({ formData, handleChange }) => (
  <>
    <tr>
      <td rowSpan={3} className='group-cell'>
        Assembly
      </td>
      <td colSpan={2}>Stack no. (ea)</td>
      <td className='multi-input'>
        <input
          className='small-input'
          value={formData.assembly.stackNo.value1}
          onChange={e => handleChange('assembly', 'stackNo', 'value1', e.target.value)}
        />
        /
        <input
          className='small-input'
          value={formData.assembly.stackNo.value2}
          onChange={e => handleChange('assembly', 'stackNo', 'value2', e.target.value)}
        />
      </td>
      <td>
        <input
          value={formData.assembly.stackNo.remark}
          onChange={e => handleChange('assembly', 'stackNo', 'remark', e.target.value)}
        />
      </td>
    </tr>

    {(Object.keys(formData.assembly) as (keyof BatteryDesignFormData['assembly'])[])
      .filter(k => k !== 'stackNo')
      .map(key => (
        <tr key={key}>
          <td colSpan={2}>{key === 'separator' ? 'Separator (μm)' : 'Electrolyte (g)'}</td>
          <td>
            <input
              value={(formData.assembly[key] as FieldData).value}
              onChange={e => handleChange('assembly', key, 'value', e.target.value)}
            />
          </td>
          <td>
            <input
              value={(formData.assembly[key] as FieldData).remark}
              onChange={e => handleChange('assembly', key, 'remark', e.target.value)}
            />
          </td>
        </tr>
      ))}
  </>
);

/* ======================
   🔹 Cell Section
====================== */
export const CellSection: React.FC<SectionProps> = ({ formData, handleChange }) => {
  const cellKeys: (keyof BatteryDesignFormData['cell'])[] = ['npRatio', 'nominalCapacity', 'weight', 'thickness'];

  const labels: Record<string, string> = {
    npRatio: 'N/P ratio',
    nominalCapacity: 'Nominal capacity (Ah)',
    weight: 'Weight (g)',
    thickness: 'Thickness (mm)',
  };

  return (
    <>
      {cellKeys.map((key, i) => (
        <tr key={key}>
          {i === 0 && (
            <td rowSpan={6} className='group-cell'>
              Cell
            </td>
          )}
          <td colSpan={2}>{labels[key]}</td>
          <td>
            <input
              value={(formData.cell[key] as FieldData).value}
              onChange={e => handleChange('cell', key, 'value', e.target.value)}
            />
          </td>
          <td>
            <input
              value={(formData.cell[key] as FieldData).remark}
              onChange={e => handleChange('cell', key, 'remark', e.target.value)}
            />
          </td>
        </tr>
      ))}

      {/* ✅ Energy density */}
      <tr>
        <td rowSpan={2}>Energy density</td>
        <td>Gravimetric (Wh/kg)</td>
        <td>
          <input
            value={formData.cell.energyDensity.gravimetric.value}
            onChange={e => handleChange('cell.energyDensity', 'gravimetric', 'value', e.target.value)}
          />
        </td>
        <td>
          <input
            value={formData.cell.energyDensity.gravimetric.remark}
            onChange={e => handleChange('cell.energyDensity', 'gravimetric', 'remark', e.target.value)}
          />
        </td>
      </tr>
      <tr>
        <td>Volumetric (Wh/L)</td>
        <td>
          <input
            value={formData.cell.energyDensity.volumetric.value}
            onChange={e => handleChange('cell.energyDensity', 'volumetric', 'value', e.target.value)}
          />
        </td>
        <td>
          <input
            value={formData.cell.energyDensity.volumetric.remark}
            onChange={e => handleChange('cell.energyDensity', 'volumetric', 'remark', e.target.value)}
          />
        </td>
      </tr>
    </>
  );
};
