import { useState, useEffect } from 'react';
import styles from '../../../../../styles/quality/lqc/LQCTable.module.css';
import CoatingCathodeTable from './CoatingCathodeTable';
import CoatingMeasurementTable, { type MeasurementRow } from './CoatingMeasurementTable';
import XbarChart from '../common/XbarChart';
import RChart from '../common/RChart';
import ControlChartConstantsTable from '../common/ControlChartConstantsTable';
import { getLQCSpecs } from '../../../../../api/quality/LQCService';

interface CoatingDashboardProps {
  projectId: number;
}

export default function CoatingDashboard({ projectId }: CoatingDashboardProps) {
  const [currentN, setCurrentN] = useState<number>(0);
  const [measurementData, setMeasurementData] = useState<MeasurementRow[]>([]);
  const [usl, setUsl] = useState<number | null>(null);
  const [lsl, setLsl] = useState<number | null>(null);

  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const specs = await getLQCSpecs(projectId, 'COATING_CATHODE');
        const coatingSpec = specs.find(s => s.itemType === 'COATING');
        const ds = coatingSpec?.specs?.doubleSideDensity;
        if (ds?.target !== undefined && ds?.tolerance !== undefined) {
          setUsl(ds.target + ds.tolerance);
          setLsl(ds.target - ds.tolerance);
        }
      } catch (error) {
        console.error('Failed to load specs:', error);
      }
    };
    loadSpecs();
  }, [projectId]);

  return (
    <div className={styles.tableContainer}>
      <CoatingCathodeTable projectId={projectId} />
      <CoatingMeasurementTable
        projectId={projectId}
        usl={usl}
        lsl={lsl}
        onNChange={setCurrentN}
        onDataChange={setMeasurementData}
      />
      <XbarChart data={measurementData} />
      <RChart data={measurementData} />
      <ControlChartConstantsTable currentN={currentN} />
    </div>
  );
}
