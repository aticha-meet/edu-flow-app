'use client';

import styles from './course-components.module.scss';


interface SyllabusWeek {
  week: number;
  title: string;
  description: string;
  topics: string[];
}

interface CourseSyllabusProps {
  weeks: SyllabusWeek[];
  openWeeks: Set<number>;
  onToggleWeek: (week: number) => void;
}

export const CourseSyllabus = ({
  weeks,
  openWeeks,
  onToggleWeek,
}: CourseSyllabusProps) => {
  if (weeks.length === 0) {
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <p>ยังไม่มีเนื้อหาหลักสูตร</p>
      </div>
    );
  }

  return (
    <div className={styles.syllabusWeekList}>
      {weeks.map((w) => {
        const isOpen = openWeeks.has(w.week);
        return (
          <div key={w.week} className={styles.syllabusWeek}>
            <button
              className={styles.weekHeader}
              onClick={() => onToggleWeek(w.week)}
              aria-expanded={isOpen}
              id={`syllabus-week-${w.week}`}
            >
              <span className={styles.weekNumber}>{w.week}</span>
              <div className={styles.weekInfo}>
                <p className={styles.weekTitle}>{w.title}</p>
                <p className={styles.weekDesc}>{w.description}</p>
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

            <div className={`${styles.weekBody} ${isOpen ? styles.open : ''}`}>
              <ul className={styles.weekTopics}>
                {w.topics.map((topic, i) => (
                  <li key={i} className={styles.weekTopic}>
                    <span className={styles.topicDot} />
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
};
