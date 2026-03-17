import { useState, useEffect } from 'react';
import styles from '../../../../styles/quality/lqc/LQCTable.module.css';
import CoatingAnodeTable from './CoatingAnodeTable';
import CoatingAnodeMeasurementTable, { type CoatingAnodeMeasurementRow } from './CoatingAnodeMeasurementTable';
import CoatingAnodeXbarChart from './CoatingAnodeXbarChart';
import CoatingAnodeRChart from './CoatingAnodeRChart';
import ControlChartConstantsTable from './ControlChartConstantsTable';
import { getLQCSpecs } from '../../../../api/quality/LQCService';

interface CoatingAnodeDashboardProps {
  projectId: number;
}

export default function CoatingAnodeDashboard({ projectId }: CoatingAnodeDashboardProps) {
  const [currentN, setCurrentN] = useState<number>(0);
  const [measurementData, setMeasurementData] = useState<CoatingAnodeMeasurementRow[]>([]);
  const [usl, setUsl] = useState<number | null>(null);
  const [lsl, setLsl] = useState<number | null>(null);

  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const specs = await getLQCSpecs(projectId, 'COATING_ANODE');
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
      <CoatingAnodeTable projectId={projectId} />
      <CoatingAnodeMeasurementTable
        projectId={projectId}
        usl={usl}
        lsl={lsl}
        onNChange={setCurrentN}
        onDataChange={setMeasurementData}
      />
      <CoatingAnodeXbarChart data={measurementData} />
      <CoatingAnodeRChart data={measurementData} />
      <ControlChartConstantsTable currentN={currentN} />
    </div>
  );
}
