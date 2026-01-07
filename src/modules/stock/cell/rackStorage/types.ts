export interface RackLocation {
  key: string;
  letter: string;
  number: number;
  count: number;
  capacity: number;
  usage: number;
}

export interface RackStorageData {
  locations: RackLocation[];
  updatedAt: string;
}
