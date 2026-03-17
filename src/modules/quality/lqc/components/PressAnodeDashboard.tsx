import { useState, useEffect } from 'react';
import styles from '../../../../styles/quality/lqc/LQCTable.module.css';
import PressAnodeTable from './PressAnodeTable';
import PressAnodeMeasurementTable, { type PressAnodeMeasurementRow } from './PressAnodeMeasurementTable';
import PressAnodeXbarChart from './PressAnodeXbarChart';
import PressAnodeRChart from './PressAnodeRChart';
import ControlChartConstantsTable from './ControlChartConstantsTable';
import { getLQCSpecs } from '../../../../api/quality/LQCService';

interface PressAnodeDashboardProps {
  projectId: number;
}

export default function PressAnodeDashboard({ projectId }: PressAnodeDashboardProps) {
  const [currentN, setCurrentN] = useState<number>(0);
  const [pressData, setPressData] = useState<PressAnodeMeasurementRow[]>([]);
  const [usl, setUsl] = useState<number | null>(null);
  const [lsl, setLsl] = useState<number | null>(null);

  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const specs = await getLQCSpecs(projectId, 'PRESS_ANODE');
        const pressSpec = specs.find(s => s.itemType === 'PRESS');
        const th = pressSpec?.specs?.thickness;
        if (th?.target !== undefined && th?.tolerance !== undefined) {
          setUsl(th.target + th.tolerance);
          setLsl(th.target - th.tolerance);
        }
      } catch (error) {
        console.error('Failed to load specs:', error);
      }
    };
    loadSpecs();
  }, [projectId]);

  return (
    <div className={styles.tableContainer}>
      <PressAnodeTable projectId={projectId} />
      <PressAnodeMeasurementTable
        projectId={projectId}
        usl={usl}
        lsl={lsl}
        onNChange={setCurrentN}
        onDataChange={setPressData}
      />
      <PressAnodeXbarChart data={pressData} />
      <PressAnodeRChart data={pressData} />
      <ControlChartConstantsTable currentN={currentN} />
    </div>
  );
}
