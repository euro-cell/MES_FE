import type { DashboardProjectWithPlan } from './types';
import styles from '../../styles/dashboard/schedule.module.css';

interface Props {
  plans: DashboardProjectWithPlan[];
  hasError?: boolean;
}

export default function DashboardSchedule({ plans, hasError }: Props) {
  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const calculateBarPosition = (startDate?: string, endDate?: string) => {
    if (!startDate) return null;

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    // 현재 연도 기준 범위
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear + 1, 0, 1);

    // 프로젝트가 현재 연도와 겹치지 않으면 null 반환 (표시 안 함)
    if (end < yearStart || start >= yearEnd) {
      return null;
    }

    const yearDays = (yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24);

    // 시작/종료 날짜를 현재 연도 범위로 클리핑
    const displayStart = start >= yearStart ? start : yearStart;
    const displayEnd = end <= yearEnd ? end : yearEnd;

    // 보이는 시작/종료 위치 계산
    const leftDays = (displayStart.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24);
    const widthDays = (displayEnd.getTime() - displayStart.getTime()) / (1000 * 60 * 60 * 24);

    return {
      left: `${(leftDays / yearDays) * 100}%`,
      width: `${(widthDays / yearDays) * 100}%`,
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
          {hasError ? (
            <div className={styles.scheduleEmpty} style={{ color: '#ef4444' }}>서버와 연결할 수 없습니다.</div>
          ) : plans.length === 0 ? (
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
