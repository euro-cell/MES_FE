import { useState } from 'react';
import styles from '../../../../styles/quality/lqc/LQCTable.module.css';
import VDCathodeTable from './VDCathodeTable';
import VDMeasurementTable, { type VDMeasurementRow } from './VDMeasurementTable';
import VDXbarChart from './VDXbarChart';
import VDRChart from './VDRChart';
import ControlChartConstantsTable from './ControlChartConstantsTable';

interface VDDashboardProps {
  projectId: number;
}

export default function VDDashboard({ projectId }: VDDashboardProps) {
  const [currentN, setCurrentN] = useState<number>(0);
  const [vdData, setVdData] = useState<VDMeasurementRow[]>([]);

  return (
    <div className={styles.tableContainer}>
      <VDCathodeTable projectId={projectId} />
      <VDMeasurementTable
        projectId={projectId}
        onNChange={setCurrentN}
        onDataChange={setVdData}
      />
      <VDXbarChart data={vdData} />
      <VDRChart data={vdData} />
      <ControlChartConstantsTable currentN={currentN} />
    </div>
  );
}
