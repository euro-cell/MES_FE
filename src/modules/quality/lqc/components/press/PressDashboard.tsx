import { useState, useEffect } from 'react';
import styles from '../../../../../styles/quality/lqc/LQCTable.module.css';
import PressCathodeTable from './PressCathodeTable';
import PressMeasurementTable, { type PressMeasurementRow } from './PressMeasurementTable';
import PressXbarChart from './PressXbarChart';
import PressRChart from './PressRChart';
import ControlChartConstantsTable from '../common/ControlChartConstantsTable';
import { getLQCSpecs } from '../../../../../api/quality/LQCService';

interface PressDashboardProps {
  projectId: number;
}

export default function PressDashboard({ projectId }: PressDashboardProps) {
  const [currentN, setCurrentN] = useState<number>(0);
  const [pressData, setPressData] = useState<PressMeasurementRow[]>([]);
  const [usl, setUsl] = useState<number | null>(null);
  const [lsl, setLsl] = useState<number | null>(null);

  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const specs = await getLQCSpecs(projectId, 'PRESS_CATHODE');
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
      <PressCathodeTable projectId={projectId} />
      <PressMeasurementTable
        projectId={projectId}
        usl={usl}
        lsl={lsl}
        onNChange={setCurrentN}
        onDataChange={setPressData}
      />
      <PressXbarChart data={pressData} />
      <PressRChart data={pressData} />
      <ControlChartConstantsTable currentN={currentN} />
    </div>
  );
}
