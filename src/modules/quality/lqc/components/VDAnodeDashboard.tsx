import { useState } from 'react';
import styles from '../../../../styles/quality/lqc/LQCTable.module.css';
import VDAnodeTable from './VDAnodeTable';
import VDAnodeMeasurementTable, { type VDAnodeMeasurementRow } from './VDAnodeMeasurementTable';
import VDAnodeXbarChart from './VDAnodeXbarChart';
import VDAnodeRChart from './VDAnodeRChart';
import ControlChartConstantsTable from './ControlChartConstantsTable';

interface VDAnodeDashboardProps {
  projectId: number;
}

export default function VDAnodeDashboard({ projectId }: VDAnodeDashboardProps) {
  const [currentN, setCurrentN] = useState<number>(0);
  const [vdData, setVdData] = useState<VDAnodeMeasurementRow[]>([]);

  return (
    <div className={styles.tableContainer}>
      <VDAnodeTable projectId={projectId} />
      <VDAnodeMeasurementTable
        projectId={projectId}
        onNChange={setCurrentN}
        onDataChange={setVdData}
      />
      <VDAnodeXbarChart data={vdData} />
      <VDAnodeRChart data={vdData} />
      <ControlChartConstantsTable currentN={currentN} />
    </div>
  );
}
