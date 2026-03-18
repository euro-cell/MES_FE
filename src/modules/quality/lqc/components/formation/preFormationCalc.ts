import type { DistributionPoint } from './DistributionChart';

export const CLASS_INTERVAL = 0.5;
export const CHARGE_CLASSES = Array.from({ length: 41 }, (_, i) => 32 + i * CLASS_INTERVAL);
export const DISCHARGE_CLASSES = Array.from({ length: 41 }, (_, i) => 22 + i * CLASS_INTERVAL);

export function calcMean(data: number[]): number {
  return data.reduce((a, b) => a + b, 0) / data.length;
}

export function calcStdev(data: number[], mean: number): number {
  return Math.sqrt(data.map(v => Math.pow(v - mean, 2)).reduce((a, b) => a + b, 0) / data.length);
}

export function calcFrequency(data: number[], classes: number[]): number[] {
  return classes.map((cls, i) => {
    const lower = i === 0 ? -Infinity : classes[i - 1];
    return data.filter(v => v > lower && v <= cls).length;
  });
}

export function normalPDF(x: number, mean: number, stdev: number): number {
  return (1 / (stdev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdev, 2));
}

export function calcDensity(classes: number[], mean: number, stdev: number): number[] {
  return classes.map(cls => normalPDF(cls, mean, stdev) * CLASS_INTERVAL);
}

export function toDistPoints(classes: number[], values: number[]): DistributionPoint[] {
  return classes.map((x, i) => ({ x, y: values[i] }));
}
