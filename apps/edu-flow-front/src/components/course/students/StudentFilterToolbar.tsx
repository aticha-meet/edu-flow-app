'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '@/app/(main)/course/[id]/students/students.module.scss';

interface StudentFilterToolbarProps {
  search: string;
  section: string;
  sections: string[];
  onSearchChange: (value: string) => void;
  onSectionChange: (value: string) => void;
}

export function StudentFilterToolbar({
  search,
  section,
  sections,
  onSearchChange,
  onSectionChange,
}: StudentFilterToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const selectSection = (value: string) => {
    onSectionChange(value);
    setIsOpen(false);
  };

  return (
    <div className={styles.searchRow}>
      <div className={styles.searchBox}>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.searchIcon}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="ค้นหาชื่อหรืออีเมล..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          id="search-student"
        />
      </div>

      {sections.length > 0 && (
        <div className={styles.sectionDropdown} ref={dropdownRef}>
          <button
            type="button"
            className={styles.filterSelect}
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls="filter-section-options"
            id="filter-section"
          >
            <span>{section || 'ทุกห้อง'}</span>
            <svg
              className={styles.filterChevron}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {isOpen && (
            <div
              className={styles.filterMenu}
              id="filter-section-options"
              role="listbox"
              aria-label="เลือกระดับชั้น"
            >
              <SectionOption selected={!section} label="ทุกห้อง" onClick={() => selectSection('')} />
              {sections.map((item) => (
                <SectionOption
                  key={item}
                  selected={section === item}
                  label={item}
                  onClick={() => selectSection(item)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionOption({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className={styles.filterOption}
      data-selected={selected}
      onClick={onClick}
    >
      <span>{label}</span>
      {selected && <span className={styles.optionCheck}>✓</span>}
    </button>
  );
}
