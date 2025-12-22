import type { DashboardProjectWithPlan } from './types';
import styles from '../../styles/dashboard/schedule.module.css';

interface Props {
  plans: DashboardProjectWithPlan[];
}

export default function DashboardSchedule({ plans }: Props) {
  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const calculateBarPosition = (startDate?: string, endDate?: string) => {
    if (!startDate) return null;

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    // 월의 일수
    const getDaysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const startMonth = start.getMonth(); // 0-11
    const endMonth = end.getMonth(); // 0-11
    const startDay = start.getDate();
    const endDay = end.getDate();

    // 시작 위치: 해당 월의 시작점 + 일수 비율
    const startMonthDays = getDaysInMonth(start);
    const leftPercent = (startMonth / 12 + (startDay - 1) / startMonthDays / 12) * 100;

    // 종료 위치: 해당 월의 시작점 + 일수 비율
    const endMonthDays = getDaysInMonth(end);
    const rightPercent = (endMonth / 12 + endDay / endMonthDays / 12) * 100;

    const widthPercent = rightPercent - leftPercent;

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className={styles.schedule}>
      <h3>프로젝트 스케줄</h3>

      <div className={styles.scheduleContainer}>
        {/* 헤더 */}
        <div className={styles.scheduleHeader}>
          <div className={styles.scheduleColProject}>프로젝트</div>
          <div className={styles.scheduleColTimeline}>
            <div className={styles.scheduleYear}>{currentYear}</div>
            <div className={styles.scheduleMonths}>
              {months.map(month => (
                <div key={month} className={styles.scheduleMonth}>
                  {month}월
                </div>
              ))}
            </div>
          </div>
          <div className={styles.scheduleColProgress}>진행률</div>
        </div>

        {/* 바디 */}
        <div className={styles.scheduleBody}>
          {plans.length === 0 ? (
            <div className={styles.scheduleEmpty}>등록된 프로젝트가 없습니다.</div>
          ) : (
            plans.map(({ project, plan, progress }) => {
              const barPosition = calculateBarPosition(plan?.startDate, plan?.endDate);

              return (
                <div key={project.id} className={styles.scheduleRow}>
                  <div className={styles.scheduleColProject}>
                    <div className={styles.scheduleProjectName}>{project.name}</div>
                    <div className={styles.scheduleProjectDate}>
                      {plan
                        ? `${formatDate(plan.startDate)} ~ ${plan.endDate ? formatDate(plan.endDate) : '진행 중'}`
                        : '일정 없음'}
                    </div>
                  </div>

                  <div className={styles.scheduleColTimeline}>
                    <div className={styles.scheduleTimelineTrack}>
                      <div className={styles.scheduleMonthsBg} />

                      {barPosition && (
                        <div
                          className={styles.scheduleTimelineBar}
                          style={{
                            left: barPosition.left,
                            width: barPosition.width,
                          }}
                        >
                          {plan?.startDate && (
                            <span className={styles.scheduleBarText}>
                              {`${new Date(plan.startDate).getMonth() + 1}.${new Date(plan.startDate).getDate()}${plan.endDate ? ` ~ ${new Date(plan.endDate).getMonth() + 1}.${new Date(plan.endDate).getDate()}` : ''}`}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.scheduleColProgress}>
                    {progress !== undefined ? `${Math.round(progress)}%` : '-'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
