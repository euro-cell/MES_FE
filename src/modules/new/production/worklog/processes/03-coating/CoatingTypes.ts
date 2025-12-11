export interface CoatingWorklog {
  id: number;
  projectId: number;
  processId: string;
  workDate: string;
  round: number;
  writer: string;
  createdAt: string;
  updatedAt: string;

  // 자재 투입 정보 1
  materialType: string;
  materialLot: string;
  manufacturer: string;
  spec: string;
  inputAmount: number;
  usageAmount: number;

  // 자재 투입 정보 2
  materialType2: string;
  materialLot2: string;
  solidContent: number;
  viscosity: string;
  inputAmountDesign: number;
  inputAmountActual: number;

  // 생산 정보 1차
  coatingLot1: string;
  productionQuantity1: number;
  coatingSide1: string;
  monoPumpFront1: number;
  monoPumpRear1: number;
  coatingSpeedFront1: number;
  coatingSpeedRear1: number;
  weightPerAreaFront1M: number;
  weightPerAreaFront1C: number;
  weightPerAreaFront1D: number;
  weightPerAreaRear1M: number;
  weightPerAreaRear1C: number;
  weightPerAreaRear1D: number;
  thicknessFront1M: number;
  thicknessFront1C: number;
  thicknessFront1D: number;
  thicknessRear1M: number;
  thicknessRear1C: number;
  thicknessRear1D: number;

  // 생산 정보 2차
  coatingLot2: string;
  productionQuantity2: number;
  coatingSide2: string;
  monoPumpFront2: number;
  monoPumpRear2: number;
  coatingSpeedFront2: number;
  coatingSpeedRear2: number;
  weightPerAreaFront2M: number;
  weightPerAreaFront2C: number;
  weightPerAreaFront2D: number;
  weightPerAreaRear2M: number;
  weightPerAreaRear2C: number;
  weightPerAreaRear2D: number;
  thicknessFront2M: number;
  thicknessFront2C: number;
  thicknessFront2D: number;
  thicknessRear2M: number;
  thicknessRear2C: number;
  thicknessRear2D: number;

  // 생산 정보 3차
  coatingLot3: string;
  productionQuantity3: number;
  coatingSide3: string;
  monoPumpFront3: number;
  monoPumpRear3: number;
  coatingSpeedFront3: number;
  coatingSpeedRear3: number;
  weightPerAreaFront3M: number;
  weightPerAreaFront3C: number;
  weightPerAreaFront3D: number;
  weightPerAreaRear3M: number;
  weightPerAreaRear3C: number;
  weightPerAreaRear3D: number;
  thicknessFront3M: number;
  thicknessFront3C: number;
  thicknessFront3D: number;
  thicknessRear3M: number;
  thicknessRear3C: number;
  thicknessRear3D: number;

  // 생산 정보 4차
  coatingLot4: string;
  productionQuantity4: number;
  coatingSide4: string;
  monoPumpFront4: number;
  monoPumpRear4: number;
  coatingSpeedFront4: number;
  coatingSpeedRear4: number;
  weightPerAreaFront4M: number;
  weightPerAreaFront4C: number;
  weightPerAreaFront4D: number;
  weightPerAreaRear4M: number;
  weightPerAreaRear4C: number;
  weightPerAreaRear4D: number;
  thicknessFront4M: number;
  thicknessFront4C: number;
  thicknessFront4D: number;
  thicknessRear4M: number;
  thicknessRear4C: number;
  thicknessRear4D: number;

  // 건조 조건
  zone1TempUpper: number;
  zone1TempLower: number;
  zone2TempUpper: number;
  zone2TempLower: number;
  zone3Temp: number;
  zone4Temp: number;

  // 공급 풍량
  zone1SupplyAirflowUpper: number;
  zone1SupplyAirflowLower: number;
  zone2SupplyAirflowUpper: number;
  zone2SupplyAirflowLower: number;
  zone3SupplyAirflow: number;
  zone4SupplyAirflow: number;

  // 배기 풍량
  zone12ExhaustAirflow: number;
  zone34ExhaustAirflow: number;
  capsuleFilter: number;
  coatingSpeed: number;
  meshFilter: number;

  // 장력
  tensionUnT: number;
  tensionOfT: number;
  tensionReT: number;

  // 코팅 조건
  coatingConditionSingle: string;
  coatingConditionDouble: string;
}

export interface CoatingWorklogPayload {
  processId: string;
  workDate: string;
  round: number;
  writer: string;

  // 자재 투입 정보 1
  materialType?: string;
  materialLot?: string;
  manufacturer?: string;
  spec?: string;
  inputAmount?: number;
  usageAmount?: number;

  // 자재 투입 정보 2
  materialType2?: string;
  materialLot2?: string;
  solidContent?: number;
  viscosity?: string;
  inputAmountDesign?: number;
  inputAmountActual?: number;

  // 생산 정보 1차
  coatingLot1?: string;
  productionQuantity1?: number;
  coatingSide1?: string;
  monoPumpFront1?: number;
  monoPumpRear1?: number;
  coatingSpeedFront1?: number;
  coatingSpeedRear1?: number;
  weightPerAreaFront1M?: number;
  weightPerAreaFront1C?: number;
  weightPerAreaFront1D?: number;
  weightPerAreaRear1M?: number;
  weightPerAreaRear1C?: number;
  weightPerAreaRear1D?: number;
  thicknessFront1M?: number;
  thicknessFront1C?: number;
  thicknessFront1D?: number;
  thicknessRear1M?: number;
  thicknessRear1C?: number;
  thicknessRear1D?: number;

  // 생산 정보 2차
  coatingLot2?: string;
  productionQuantity2?: number;
  coatingSide2?: string;
  monoPumpFront2?: number;
  monoPumpRear2?: number;
  coatingSpeedFront2?: number;
  coatingSpeedRear2?: number;
  weightPerAreaFront2M?: number;
  weightPerAreaFront2C?: number;
  weightPerAreaFront2D?: number;
  weightPerAreaRear2M?: number;
  weightPerAreaRear2C?: number;
  weightPerAreaRear2D?: number;
  thicknessFront2M?: number;
  thicknessFront2C?: number;
  thicknessFront2D?: number;
  thicknessRear2M?: number;
  thicknessRear2C?: number;
  thicknessRear2D?: number;

  // 생산 정보 3차
  coatingLot3?: string;
  productionQuantity3?: number;
  coatingSide3?: string;
  monoPumpFront3?: number;
  monoPumpRear3?: number;
  coatingSpeedFront3?: number;
  coatingSpeedRear3?: number;
  weightPerAreaFront3M?: number;
  weightPerAreaFront3C?: number;
  weightPerAreaFront3D?: number;
  weightPerAreaRear3M?: number;
  weightPerAreaRear3C?: number;
  weightPerAreaRear3D?: number;
  thicknessFront3M?: number;
  thicknessFront3C?: number;
  thicknessFront3D?: number;
  thicknessRear3M?: number;
  thicknessRear3C?: number;
  thicknessRear3D?: number;

  // 생산 정보 4차
  coatingLot4?: string;
  productionQuantity4?: number;
  coatingSide4?: string;
  monoPumpFront4?: number;
  monoPumpRear4?: number;
  coatingSpeedFront4?: number;
  coatingSpeedRear4?: number;
  weightPerAreaFront4M?: number;
  weightPerAreaFront4C?: number;
  weightPerAreaFront4D?: number;
  weightPerAreaRear4M?: number;
  weightPerAreaRear4C?: number;
  weightPerAreaRear4D?: number;
  thicknessFront4M?: number;
  thicknessFront4C?: number;
  thicknessFront4D?: number;
  thicknessRear4M?: number;
  thicknessRear4C?: number;
  thicknessRear4D?: number;

  // 건조 조건
  zone1TempUpper?: number;
  zone1TempLower?: number;
  zone2TempUpper?: number;
  zone2TempLower?: number;
  zone3Temp?: number;
  zone4Temp?: number;

  // 공급 풍량
  zone1SupplyAirflowUpper?: number;
  zone1SupplyAirflowLower?: number;
  zone2SupplyAirflowUpper?: number;
  zone2SupplyAirflowLower?: number;
  zone3SupplyAirflow?: number;
  zone4SupplyAirflow?: number;

  // 배기 풍량
  zone12ExhaustAirflow?: number;
  zone34ExhaustAirflow?: number;
  capsuleFilter?: number;
  coatingSpeed?: number;
  meshFilter?: number;

  // 장력
  tensionUnT?: number;
  tensionOfT?: number;
  tensionReT?: number;

  // 코팅 조건
  coatingConditionSingle?: string;
  coatingConditionDouble?: string;
}
