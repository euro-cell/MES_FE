export interface Field {
  value: string;
  remark: string;
}

export interface SpecForm {
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
