'use client';

import styles from './course-components.module.scss';
import type { SyllabusWeek } from '@/api/course/controller';

interface CourseSyllabusProps {
  weeks: SyllabusWeek[];
  openWeeks: Set<number>;
  onToggleWeek: (week: number) => void;
  canEdit?: boolean;
  onAddWeek?: () => void;
  onEditWeek?: (week: SyllabusWeek) => void;
  onDeleteWeek?: (week: number) => void;
}

export const CourseSyllabus = ({
  weeks,
  openWeeks,
  onToggleWeek,
  canEdit = false,
  onAddWeek,
  onEditWeek,
  onDeleteWeek,
}: CourseSyllabusProps) => {
  if (weeks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <p>ยังไม่มีเนื้อหาหลักสูตร</p>
        {canEdit && onAddWeek && (
          <button className={styles.emptyAddBtn} onClick={onAddWeek} id="syllabus-add-first-btn">
            + เพิ่มสัปดาห์แรก
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.syllabusWeekList}>
      {weeks.map((w) => {
        const isOpen = openWeeks.has(w.week);
        return (
          <div key={w.week} className={styles.syllabusWeek}>
            <div className={styles.weekHeaderRow}>
              <button
                className={styles.weekHeader}
                onClick={() => onToggleWeek(w.week)}
                aria-expanded={isOpen}
                id={`syllabus-week-${w.week}`}
              >
                <span className={styles.weekNumber}>{w.week}</span>
                <div className={styles.weekInfo}>
                  <p className={styles.weekTitle}>{w.title}</p>
                  {w.description && <p className={styles.weekDesc}>{w.description}</p>}
                </div>
                <svg
                  className={`${styles.weekChevron} ${isOpen ? styles.open : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Edit / Delete buttons — เฉพาะ TEACHER / ADMIN */}
              {canEdit && (
                <div className={styles.weekActions}>
                  <button
                    className={styles.weekEditBtn}
                    onClick={() => onEditWeek?.(w)}
                    aria-label={`แก้ไขสัปดาห์ที่ ${w.week}`}
                    id={`edit-week-${w.week}-btn`}
                    title="แก้ไข"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    className={styles.weekDeleteBtn}
                    onClick={() => onDeleteWeek?.(w.week)}
                    aria-label={`ลบสัปดาห์ที่ ${w.week}`}
                    id={`delete-week-${w.week}-btn`}
                    title="ลบ"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className={`${styles.weekBody} ${isOpen ? styles.open : ''}`}>
              {w.topics.length > 0 ? (
                <ul className={styles.weekTopics}>
                  {w.topics.map((topic, i) => (
                    <li key={i} className={styles.weekTopic}>
                      <span className={styles.topicDot} />
                      {topic}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.weekNoTopics}>ยังไม่มีหัวข้อย่อย</p>
              )}
            </div>
          </div>
        );
      })}

      {/* Add week button at bottom */}
      {canEdit && onAddWeek && (
        <button className={styles.syllabusAddWeekBtn} onClick={onAddWeek} id="syllabus-add-week-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          เพิ่มสัปดาห์
        </button>
      )}
    </div>
  );
};
