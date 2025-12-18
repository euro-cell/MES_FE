// Forming 서브타입 키 배열
export const FORMING_SUBTYPES = ['cutting', 'forming', 'folding', 'topCutting'] as const;
export const FORMING_SUBTYPE_LABELS: Record<string, string> = {
  cutting: 'Cutting',
  forming: 'Forming',
  folding: 'Folding',
  topCutting: 'Top Cutting',
};

// Stacking NCR 서브타입 키 배열
export const STACKING_NCR_SUBTYPES = ['hiPot', 'weight', 'thickness', 'alignment'] as const;
export const STACKING_NCR_SUBTYPE_LABELS: Record<string, string> = {
  hiPot: 'Hi pot',
  weight: '무게',
  thickness: '두께',
  alignment: 'Alignment',
};

// PreWelding NCR 서브타입 키 배열
export const PRE_WELDING_NCR_SUBTYPES = ['burning', 'align', 'etc'] as const;
export const PRE_WELDING_NCR_SUBTYPE_LABELS: Record<string, string> = {
  burning: '소착',
  align: 'Align',
  etc: '기타',
};

// MainWelding NCR 서브타입 키 배열
export const MAIN_WELDING_NCR_SUBTYPES = ['hiPot', 'burning', 'align', 'taping', 'etc'] as const;
export const MAIN_WELDING_NCR_SUBTYPE_LABELS: Record<string, string> = {
  hiPot: 'Hi pot',
  burning: '소착',
  align: 'Align',
  taping: 'Taping',
  etc: '기타',
};

// Sealing NCR 서브타입 키 배열
export const SEALING_NCR_SUBTYPES = ['hiPot', 'appearance', 'thickness', 'etc'] as const;
export const SEALING_NCR_SUBTYPE_LABELS: Record<string, string> = {
  hiPot: 'Hi pot',
  appearance: '외관',
  thickness: '두께',
  etc: '기타',
};

// VisualInspection NCR 서브타입 키 배열
export const VISUAL_INSPECTION_NCR_SUBTYPES = [
  'gas',
  'foreignMatter',
  'scratch',
  'dent',
  'leakCorrosion',
  'cellSize',
] as const;
export const VISUAL_INSPECTION_NCR_SUBTYPE_LABELS: Record<string, string> = {
  gas: '가스',
  foreignMatter: '외관',
  scratch: '긁힘',
  dent: '찍힘',
  leakCorrosion: '누액, 부식',
  cellSize: '크기',
};

// 공정 이름 매핑
export const PROCESS_NAME_MAP: Record<string, string> = {
  // 전극 공정 (Electrode)
  mixing: 'Mixing',
  coatingSingle: 'Coating Single',
  coatingDouble: 'Coating Double',
  press: 'Press',
  slitting: 'Slitting',
  notching: 'Notching',
  // 조립 공정 (Assembly)
  vd: 'V/D',
  forming: 'Forming',
  stacking: 'Stack',
  preWelding: 'Pre\nWelding',
  mainWelding: 'Main\nWelding',
  sealing: 'Sealing',
  filling: 'E/L Filling',
  // 화성 공정 (Formation)
  preFormation: 'Pre Formation',
  degass: 'Degass',
  mainFormation: 'Main Formation',
  aging: 'Aging\nOCV/IR_2',
  grading: 'Grading\nOCV/IR_3',
  visualInspection: '외관검사',
};

// 공정별 생산량 단위 매핑
export const PROCESS_UNIT_MAP: Record<string, string> = {
  // 전극 공정 (Electrode)
  mixing: 'KG',
  coatingSingle: 'M',
  coatingDouble: 'M',
  press: 'M',
  slitting: 'M',
  notching: 'ea',
  // 조립 공정 (Assembly)
  vd: 'ea',
  forming: 'ea',
  stacking: 'ea',
  preWelding: 'ea',
  mainWelding: 'ea',
  sealing: 'ea',
  filling: 'ea',
  // 화성 공정 (Formation)
  preFormation: 'ea',
  degass: 'ea',
  mainFormation: 'ea',
  aging: 'ea',
  grading: 'ea',
  visualInspection: 'ea',
};

// 전극 공정 키 목록
export const ELECTRODE_PROCESS_KEYS = [
  'mixing',
  'coatingSingle',
  'coatingDouble',
  'press',
  'slitting',
  'notching',
] as const;

// 조립 공정 키 목록
export const ASSEMBLY_PROCESS_KEYS = [
  'vd',
  'forming',
  'stacking',
  'preWelding',
  'mainWelding',
  'sealing',
  'filling',
] as const;

// 화성 공정 키 목록
export const FORMATION_PROCESS_KEYS = [
  'preFormation',
  'degass',
  'mainFormation',
  'aging',
  'grading',
  'visualInspection',
] as const;

// 변경 버튼 스타일
export const CHANGE_BUTTON_STYLE: React.CSSProperties = {
  marginTop: '4px',
  padding: '2px 8px',
  fontSize: '11px',
  border: '1px solid #3b82f6',
  borderRadius: '4px',
  background: '#3b82f6',
  color: 'white',
  cursor: 'pointer',
};
