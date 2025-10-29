/* ==============================
  🔹 타입 정의
============================== */
export interface FieldData {
  value: string;
  remark: string;
}

export interface PairFieldData {
  value1: string;
  value2: string;
  remark: string;
}

export interface Cathode {
  activeMaterial1: FieldData;
  activeMaterial2: FieldData;
  conductor: FieldData;
  binder: FieldData;
  loadingLevel: FieldData;
  thickness: FieldData;
  electrodeDensity: FieldData;
}

export interface Anode {
  activeMaterial: FieldData;
  conductor: FieldData;
  binder: FieldData;
  loadingLevel: FieldData;
  thickness: FieldData;
  electrodeDensity: FieldData;
}

export interface Assembly {
  stackNo: PairFieldData;
  separator: FieldData;
  electrolyte: FieldData;
}

export interface Cell {
  npRatio: FieldData;
  nominalCapacity: FieldData;
  weight: FieldData;
  thickness: FieldData;
  energyDensity: {
    gravimetric: FieldData;
    volumetric: FieldData;
  };
}

export interface BatteryDesignFormData {
  cathode: Cathode;
  anode: Anode;
  assembly: Assembly;
  cell: Cell;
}
