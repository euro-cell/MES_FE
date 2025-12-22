import React from 'react';
import type { DashboardProjectWithPlan } from './types';
import '../../styles/dashboard/schedule.css';

interface Props {
  plans: DashboardProjectWithPlan[];
}

export default function DashboardSchedule({ plans }: Props) {
  const formatDate = (d?: string) => {
    if (!d) return '-';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '-';
    return `${date.getMonth() + 1}.${date.getDate()}`;
  };

  const calculateTimelineBar = (startDate?: string, endDate?: string) => {
    if (!startDate) return { start: 1, span: 1 };

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    const startMonth = Math.max(1, Math.min(12, start.getMonth() + 1));
    let endMonth = Math.max(1, Math.min(12, end.getMonth() + 1));
    if (end.getFullYear() > start.getFullYear()) endMonth = 12;

    let span = endMonth - startMonth + 1;
    if (span < 1) span = 1;

    return { start: startMonth, span };
  };

  return (
    <div className='dashboard-bottom'>
      <div className='schedule box'>
        <h3>프로젝트 스케줄</h3>
        <div className='schedule-timeline'>
          <div className='schedule-grid schedule-header'>
            <div className='project-cell'>프로젝트</div>
            <div className='timeline-cell'>
              <div className='year-label'>{new Date().getFullYear()}</div>
              <div className='month-grid'>
                {[...Array(12)].map((_, i) => (
                  <span key={i}>{i + 1}월</span>
                ))}
              </div>
            </div>
            <div className='progress-cell'>진행률</div>
          </div>

          <div className='schedule-body'>
            {plans.length === 0 ? (
              <div className='timeline-message'>등록된 프로젝트가 없습니다.</div>
            ) : (
              plans.map(({ project, plan, progress }) => {
                const { start, span } = calculateTimelineBar(plan?.startDate, plan?.endDate);
                return (
                  <div className='schedule-grid schedule-row' key={project.id}>
                    <div className='project-cell'>
                      <strong>{project.name}</strong>
                      <span className='date-range'>
                        {plan ? `${plan.startDate} ~ ${plan.endDate ?? '진행 중'}` : '일정 없음'}
                      </span>
                    </div>
                    <div className='timeline-cell'>
                      <div className='timeline-track'>
                        <div
                          className='timeline-bar'
                          style={
                            {
                              '--start': start,
                              '--span': span,
                            } as React.CSSProperties
                          }
                        >
                          <span className='bar-label'>{formatDate(plan?.startDate)}</span>
                          <span className='bar-label'>{plan?.endDate ? formatDate(plan.endDate) : '진행 중'}</span>
                        </div>
                      </div>
                    </div>
                    <div className='progress-cell'>
                      <span className='progress-value'>
                        {progress !== undefined ? `${Math.round(progress)}%` : '-'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
