import { useState } from 'react';
import '../../styles/batteryDesign/form.css';
import { batteryDesignService } from './BatteryDesignService';
import type { BatteryDesignFormData } from './BatteryDesignTypes';
import { CathodeSection, AnodeSection, AssemblySection, CellSection } from './BatteryDesignComponents';

export default function BatteryDesignForm() {
  const [formData, setFormData] = useState<BatteryDesignFormData>({
    cathode: {
      active_material_1: { value: '', remark: '' },
      active_material_2: { value: '', remark: '' },
      conductor: { value: '', remark: '' },
      binder: { value: '', remark: '' },
      loading_level: { value: '', remark: '' },
      thickness: { value: '', remark: '' },
      electrode_density: { value: '', remark: '' },
    },
    anode: {
      active_material: { value: '', remark: '' },
      conductor: { value: '', remark: '' },
      binder: { value: '', remark: '' },
      loading_level: { value: '', remark: '' },
      thickness: { value: '', remark: '' },
      electrode_density: { value: '', remark: '' },
    },
    assembly: {
      stack_no: { value1: '', value2: '', remark: '' },
      separator: { value: '', remark: '' },
      electrolyte: { value: '', remark: '' },
    },
    cell: {
      np_ratio: { value: '', remark: '' },
      nominal_capacity: { value: '', remark: '' },
      weight: { value: '', remark: '' },
      thickness: { value: '', remark: '' },
      energy_density: {
        gravimetric: { value: '', remark: '' },
        volumetric: { value: '', remark: '' },
      },
    },
  });

  const handleChange = (
    section: keyof BatteryDesignFormData | string,
    field: string,
    key: 'value' | 'remark' | 'value1' | 'value2',
    value: string
  ) => {
    setFormData(prev => {
      const updated: BatteryDesignFormData = structuredClone(prev);
      if (section.includes('.')) {
        const [parent, child] = section.split('.') as [keyof BatteryDesignFormData, string];
        (updated[parent] as any)[child][field][key] = value;
      } else {
        (updated[section as keyof BatteryDesignFormData] as any)[field][key] = value;
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    try {
      await batteryDesignService.saveDesign(formData);
      alert('✅ 전지 설계가 저장되었습니다.');
      console.log('📦 전송 데이터:', formData);
    } catch (err) {
      console.error(err);
      alert('❌ 저장 실패');
    }
  };

  return (
    <div className='battery-design-form'>
      <h2>전지 설계 입력</h2>

      <table className='design-table'>
        <thead>
          <tr>
            <th colSpan={3}>Classification</th>
            <th>Value</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          <CathodeSection formData={formData} handleChange={handleChange} />
          <AnodeSection formData={formData} handleChange={handleChange} />
          <AssemblySection formData={formData} handleChange={handleChange} />
          <CellSection formData={formData} handleChange={handleChange} />
        </tbody>
      </table>

      <div className='button-wrap'>
        <button className='save-btn' onClick={handleSubmit}>
          저장
        </button>
      </div>
    </div>
  );
}
