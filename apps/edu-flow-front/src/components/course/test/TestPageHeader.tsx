import type { ReactNode } from 'react';
import styles from './test-page-header.module.scss';

interface TestPageHeaderProps {
  title: string;
  description: string;
  count?: string;
  actions?: ReactNode;
}

export function TestPageHeader({
  title,
  description,
  count,
  actions,
}: TestPageHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {(count || actions) && (
        <div className={styles.actions}>
          {count && <span className={styles.count}>{count}</span>}
          {actions}
        </div>
      )}
    </header>
  );
}
