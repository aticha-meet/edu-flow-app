'use client';

import { useState, useEffect } from 'react';
import type { SyllabusWeek } from '@/api/course/controller';
import styles from './course-components.module.scss';

interface SyllabusEditModalProps {
  courseId: string;
  existingWeek?: SyllabusWeek | null;
  usedWeeks: number[];
  onSave: (week: number, data: { title: string; description: string; topics: string[] }) => Promise<void>;
  onClose: () => void;
}

export const SyllabusEditModal = ({
  courseId,
  existingWeek,
  usedWeeks,
  onSave,
  onClose,
}: SyllabusEditModalProps) => {
  const isEdit = !!existingWeek;

  const [week, setWeek] = useState<number>(existingWeek?.week ?? 1);
  const [title, setTitle] = useState(existingWeek?.title ?? '');
  const [description, setDescription] = useState(existingWeek?.description ?? '');
  const [topics, setTopics] = useState<string[]>(existingWeek?.topics?.length ? existingWeek.topics : ['']);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingWeek) {
      setWeek(existingWeek.week);
      setTitle(existingWeek.title);
      setDescription(existingWeek.description ?? '');
      setTopics(existingWeek.topics.length ? existingWeek.topics : ['']);
    }
  }, [existingWeek]);

  const handleTopicChange = (idx: number, val: string) => {
    setTopics((prev) => prev.map((t, i) => (i === idx ? val : t)));
  };

  const handleAddTopic = () => setTopics((prev) => [...prev, '']);

  const handleRemoveTopic = (idx: number) => {
    setTopics((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setError('');
    if (!title.trim()) {
      setError('กรุณากรอกชื่อหัวข้อ');
      return;
    }
    if (!isEdit && usedWeeks.includes(week)) {
      setError(`สัปดาห์ที่ ${week} มีอยู่แล้ว`);
      return;
    }
    const cleanTopics = topics.map((t) => t.trim()).filter(Boolean);
    setIsSaving(true);
    try {
      await onSave(week, { title: title.trim(), description: description.trim(), topics: cleanTopics });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.syllabusModalOverlay} onClick={onClose} id="syllabus-edit-modal-overlay">
      <div className={styles.syllabusModal} onClick={(e) => e.stopPropagation()} id="syllabus-edit-modal">
        {/* Close */}
        <button className={styles.syllabusModalClose} onClick={onClose} aria-label="ปิด">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className={styles.syllabusModalHeader}>
          <div className={styles.syllabusModalIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h2 className={styles.syllabusModalTitle}>
            {isEdit ? 'แก้ไขเนื้อหาสัปดาห์' : 'เพิ่มสัปดาห์ใหม่'}
          </h2>
          <p className={styles.syllabusModalSubtitle}>
            {isEdit ? `กำลังแก้ไขสัปดาห์ที่ ${existingWeek?.week}` : 'กรอกข้อมูลสัปดาห์ที่ต้องการเพิ่ม'}
          </p>
        </div>

        {/* Form */}
        <div className={styles.syllabusFormBody}>
          {/* Week Number (only for new) */}
          {!isEdit && (
            <div className={styles.syllabusFormGroup}>
              <label className={styles.syllabusFormLabel}>
                สัปดาห์ที่ <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                min={1}
                max={20}
                className={styles.syllabusFormInput}
                value={week}
                onChange={(e) => setWeek(parseInt(e.target.value, 10) || 1)}
                id="syllabus-week-input"
              />
            </div>
          )}

          {/* Title */}
          <div className={styles.syllabusFormGroup}>
            <label className={styles.syllabusFormLabel}>
              ชื่อหัวข้อ <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.syllabusFormInput}
              placeholder="เช่น บทที่ 1 — แนวคิดพื้นฐาน"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id="syllabus-title-input"
            />
          </div>

          {/* Description */}
          <div className={styles.syllabusFormGroup}>
            <label className={styles.syllabusFormLabel}>คำอธิบาย</label>
            <textarea
              className={styles.syllabusFormTextarea}
              placeholder="คำอธิบายเพิ่มเติม..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              id="syllabus-description-input"
            />
          </div>

          {/* Topics */}
          <div className={styles.syllabusFormGroup}>
            <label className={styles.syllabusFormLabel}>หัวข้อย่อย</label>
            <div className={styles.topicList}>
              {topics.map((topic, idx) => (
                <div key={idx} className={styles.topicRow}>
                  <span className={styles.topicBullet}>{idx + 1}</span>
                  <input
                    type="text"
                    className={styles.topicInput}
                    placeholder={`หัวข้อที่ ${idx + 1}`}
                    value={topic}
                    onChange={(e) => handleTopicChange(idx, e.target.value)}
                    id={`topic-input-${idx}`}
                  />
                  {topics.length > 1 && (
                    <button
                      className={styles.topicRemoveBtn}
                      onClick={() => handleRemoveTopic(idx)}
                      aria-label="ลบหัวข้อ"
                      type="button"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button className={styles.addTopicBtn} onClick={handleAddTopic} type="button" id="add-topic-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                เพิ่มหัวข้อย่อย
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.msgError}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.syllabusModalActions}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>
            ยกเลิก
          </button>
          <button
            className={styles.submitBtn}
            onClick={handleSave}
            disabled={isSaving}
            id="syllabus-save-btn"
          >
            {isSaving ? (
              <><span className={styles.spinner} /> กำลังบันทึก...</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                บันทึก
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
