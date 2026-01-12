export interface LQCProject {
  id: number;
  name: string;
}

export interface LQCEntry {
  id: number;
  projectId: number;
  date: string;
  inspector: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
