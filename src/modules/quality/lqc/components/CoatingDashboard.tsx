import { useState } from 'react';
import styles from '../../../../styles/quality/lqc/LQCTable.module.css';
import CoatingCathodeTable from './CoatingCathodeTable';
import CoatingMeasurementTable, { type MeasurementRow } from './CoatingMeasurementTable';
import XbarChart from './XbarChart';
import RChart from './RChart';
import ControlChartConstantsTable from './ControlChartConstantsTable';

interface CoatingDashboardProps {
  projectId: number;
}

export default function CoatingDashboard({ projectId }: CoatingDashboardProps) {
  const [currentN, setCurrentN] = useState<number>(0);
  const [measurementData, setMeasurementData] = useState<MeasurementRow[]>([]);

  return (
    <div className={styles.tableContainer}>
      <CoatingCathodeTable projectId={projectId} />
      <CoatingMeasurementTable
        projectId={projectId}
        onNChange={setCurrentN}
        onDataChange={setMeasurementData}
      />
      <XbarChart data={measurementData} />
      <RChart data={measurementData} />
      <ControlChartConstantsTable currentN={currentN} />
    </div>
  );
}
