export interface InspectionWorklog {
  id: number;
  projectId: number;
  processId: string;
  workDate: string;
  round: number;
  writer: string;
  createdAt: string;
  updatedAt: string;

  line?: string;
  plant?: string;

  // A. 자재 투입 정보
  cellNumberRange?: string;

  // B. 생산 정보 - 가스 발생
  gasInputQuantity?: number;
  gasGoodQuantity?: number;
  gasDefectQuantity?: number;
  gasDiscardQuantity?: number;
  gasDefectRate?: number;

  // B. 생산 정보 - 이물질 외관
  foreignMatterInputQuantity?: number;
  foreignMatterGoodQuantity?: number;
  foreignMatterDefectQuantity?: number;
  foreignMatterDiscardQuantity?: number;
  foreignMatterDefectRate?: number;

  // B. 생산 정보 - 긁힘
  scratchInputQuantity?: number;
  scratchGoodQuantity?: number;
  scratchDefectQuantity?: number;
  scratchDiscardQuantity?: number;
  scratchDefectRate?: number;

  // B. 생산 정보 - 찍힘
  dentInputQuantity?: number;
  dentGoodQuantity?: number;
  dentDefectQuantity?: number;
  dentDiscardQuantity?: number;
  dentDefectRate?: number;

  // B. 생산 정보 - 누액 및 부식
  leakCorrosionInputQuantity?: number;
  leakCorrosionGoodQuantity?: number;
  leakCorrosionDefectQuantity?: number;
  leakCorrosionDiscardQuantity?: number;
  leakCorrosionDefectRate?: number;

  // B. 생산 정보 - 전지 크기 > 폭
  cellSizeWidthDiscardQuantity?: number;
  cellSizeWidthDefectRemark?: string;

  // B. 생산 정보 - 전지 크기 > 길이
  cellSizeLengthDiscardQuantity?: number;
  cellSizeLengthDefectRemark?: string;

  // B. 생산 정보 - 전지 크기 > 두께
  cellSizeThicknessDiscardQuantity?: number;
  cellSizeThicknessDefectRemark?: string;

  // D. 비고
  remark?: string;
}

export interface InspectionWorklogPayload {
  projectId: number;
  processId?: string;
  workDate?: string;
  round?: number;
  writer?: string;
  line?: string;
  plant?: any;

  // A. 자재 투입 정보
  cellNumberRange?: string;

  // B. 생산 정보 - 가스 발생
  gasInputQuantity?: number;
  gasGoodQuantity?: number;
  gasDefectQuantity?: number;
  gasDiscardQuantity?: number;
  gasDefectRate?: number;

  // B. 생산 정보 - 이물질 외관
  foreignMatterInputQuantity?: number;
  foreignMatterGoodQuantity?: number;
  foreignMatterDefectQuantity?: number;
  foreignMatterDiscardQuantity?: number;
  foreignMatterDefectRate?: number;

  // B. 생산 정보 - 긁힘
  scratchInputQuantity?: number;
  scratchGoodQuantity?: number;
  scratchDefectQuantity?: number;
  scratchDiscardQuantity?: number;
  scratchDefectRate?: number;

  // B. 생산 정보 - 찍힘
  dentInputQuantity?: number;
  dentGoodQuantity?: number;
  dentDefectQuantity?: number;
  dentDiscardQuantity?: number;
  dentDefectRate?: number;

  // B. 생산 정보 - 누액 및 부식
  leakCorrosionInputQuantity?: number;
  leakCorrosionGoodQuantity?: number;
  leakCorrosionDefectQuantity?: number;
  leakCorrosionDiscardQuantity?: number;
  leakCorrosionDefectRate?: number;

  // B. 생산 정보 - 전지 크기 > 폭
  cellSizeWidthDiscardQuantity?: number;
  cellSizeWidthDefectRemark?: string;

  // B. 생산 정보 - 전지 크기 > 길이
  cellSizeLengthDiscardQuantity?: number;
  cellSizeLengthDefectRemark?: string;

  // B. 생산 정보 - 전지 크기 > 두께
  cellSizeThicknessDiscardQuantity?: number;
  cellSizeThicknessDefectRemark?: string;

  // D. 비고
  remark?: string;
}
