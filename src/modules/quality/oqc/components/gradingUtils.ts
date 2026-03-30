export const calcDeltaV = (ocv3: number, ocv4: number | null): number | null =>
  ocv4 !== null ? Math.round((ocv3 - ocv4) * 10000) / 10 : null;
