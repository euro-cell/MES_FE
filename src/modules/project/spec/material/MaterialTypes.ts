export interface MaterialRow {
  category: string;
  materialType: string;
  model: string;
  company: string;
  unit: string;
  quantity: string;
}

export interface MaterialForm {
  cathode: MaterialRow[];
  anode: MaterialRow[];
  assembly: MaterialRow[];
}
