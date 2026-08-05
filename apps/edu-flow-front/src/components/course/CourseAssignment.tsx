'use client';

import styles from './course-components.module.scss';


export type AssignmentStatus = 'open' | 'closed' | 'pending';

export interface Assignment {
  id: number;
  title: string;
  dueDate: string;
  status: AssignmentStatus;
  color: string;
}

interface CourseAssignmentProps {
  assignments: Assignment[];
}

const STATUS_LABEL: Record<AssignmentStatus, string> = {
  open: 'เปิดรับ',
  closed: 'ปิดแล้ว',
  pending: 'รอตรวจ',
};

const STATUS_CLASS: Record<AssignmentStatus, string> = {
  open: styles.statusOpen,
  closed: styles.statusClosed,
  pending: styles.statusPending,
};

export const CourseAssignment = ({ assignments }: CourseAssignmentProps) => {
  if (assignments.length === 0) {
    return (
      <div className={styles.emptyState}>
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="2" width="6" height="4" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
        </svg>
        <p>ยังไม่มีงานที่ได้รับมอบหมาย</p>
      </div>
    );
  }

  return (
    <div className={styles.assignmentList}>
      {assignments.map((a) => (
        <div
          key={a.id}
          className={styles.assignmentItem}
          id={`assignment-item-${a.id}`}
        >
          {/* Icon */}
          <div
            className={styles.assignmentIcon}
            style={{ background: `${a.color}18`, border: `1px solid ${a.color}30` }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={a.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="2" width="6" height="4" rx="1" ry="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
            </svg>
          </div>

          {/* Info */}
          <div className={styles.assignmentInfo}>
            <p className={styles.assignmentTitle}>{a.title}</p>
            <div className={styles.assignmentMeta}>
              <span className={styles.assignmentDue}>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                กำหนดส่ง: {a.dueDate}
              </span>
              <span className={`${styles.statusChip} ${STATUS_CLASS[a.status]}`}>
                {STATUS_LABEL[a.status]}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <svg
            className={styles.assignmentArrow}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      ))}
    </div>
  );
};
