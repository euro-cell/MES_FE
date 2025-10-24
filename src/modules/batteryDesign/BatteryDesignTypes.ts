/* ==============================
   🔹 타입 정의
============================== */
export interface FieldData {
  value: string;
  remark: string;
}

export interface Cathode {
  [key: string]: FieldData;
  active_material_1: FieldData;
  active_material_2: FieldData;
  conductor: FieldData;
  binder: FieldData;
  loading_level: FieldData;
  thickness: FieldData;
  electrode_density: FieldData;
}

export interface Anode {
  [key: string]: FieldData;
  active_material: FieldData;
  conductor: FieldData;
  binder: FieldData;
  loading_level: FieldData;
  thickness: FieldData;
  electrode_density: FieldData;
}

export interface Assembly {
  [key: string]: FieldData | { value1: string; value2: string; remark: string };
  stack_no: { value1: string; value2: string; remark: string };
  separator: FieldData;
  electrolyte: FieldData;
}

export interface Cell {
  [key: string]: any;
  np_ratio: FieldData;
  nominal_capacity: FieldData;
  weight: FieldData;
  thickness: FieldData;
  energy_density: {
    [key: string]: FieldData;
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
