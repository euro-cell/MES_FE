import type { SpecForm } from './SpecTypes';

export const initialSpecForm: SpecForm = {
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
};
