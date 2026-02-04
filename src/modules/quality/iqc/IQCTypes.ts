export interface IQCProject {
  id: number;
  name: string;
}

/** IQC 메뉴 타입 */
export type IQCMenuType =
  | 'Summary'
  | 'CathodeMaterial1'
  | 'CathodeMaterial2'
  | 'AnodeMaterial'
  | 'ConductiveMaterial'
  | 'CurrentCollector'
  | 'Separator'
  | 'Electrolyte'
  | 'Pouch'
  | 'LeadTab';
