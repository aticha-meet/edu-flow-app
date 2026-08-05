'use client';

import { useState } from 'react';
import styles from '../test.module.scss';

interface CreateTestModalProps {
  onClose: () => void;
  onCreate: (testName: string, testDate: Date) => void;
}

export const CreateTestModal = ({ onClose, onCreate }: CreateTestModalProps) => {
  const [testName, setTestName] = useState('');
  const [testDate, setTestDate] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (testName.trim() && testDate) onCreate(testName.trim(), new Date(testDate));
  };

  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={onClose}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="create-test-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.eyebrow}>NEW TEST</span>
            <h2 id="create-test-title">สร้างแบบทดสอบ</h2>
          </div>
          <button className={styles.closeButton} type="button" onClick={onClose} aria-label="ปิดหน้าต่างสร้างแบบทดสอบ">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <label className={styles.fieldLabel} htmlFor="test-name">ชื่อแบบทดสอบ</label>
          <input id="test-name" className={styles.field} value={testName} onChange={(event) => setTestName(event.target.value)} placeholder="เช่น แบบทดสอบบทที่ 1" autoFocus required />
          <label className={styles.fieldLabel} htmlFor="test-date">วันและเวลาเปิดทำแบบทดสอบ</label>
          <input id="test-date" className={styles.field} type="datetime-local" value={testDate} onChange={(event) => setTestDate(event.target.value)} required />
          <div className={styles.modalActions}>
            <button className={styles.cancelButton} type="button" onClick={onClose}>ยกเลิก</button>
            <button className={styles.createButton} type="submit">สร้างแบบทดสอบ</button>
          </div>
        </form>
      </section>
    </div>
  );
};
