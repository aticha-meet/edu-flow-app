import Link from 'next/link';
import styles from './test-breadcrumb.module.scss';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TestBreadcrumbProps {
  courseId: string;
  courseName: string;
  items: BreadcrumbItem[];
}

export function TestBreadcrumb({
  courseId,
  courseName,
  items,
}: TestBreadcrumbProps) {
  const baseItems: BreadcrumbItem[] = [
    { label: 'ห้องเรียน', href: '/course' },
    { label: courseName, href: `/course/${courseId}` },
  ];

  return (
    <nav className={styles.breadcrumb} aria-label="breadcrumb">
      {[...baseItems, ...items].map((item, index) => (
        <span className={styles.item} key={`${item.label}-${index}`}>
          {index > 0 && <span className={styles.separator}>/</span>}
          {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
        </span>
      ))}
    </nav>
  );
}
