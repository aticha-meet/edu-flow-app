'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './course-components.module.scss';
import { updateCourse, deleteCourse } from '@/api/course/controller';

interface CourseConfig {
  id: string;
  className: string;
  description: string | null;
  code: string | null;
  roomId: string | null;
  maxStudents: number;
  status: 'upcoming' | 'active' | 'complete';
}

interface CourseSettingsProps {
  course: CourseConfig;
  userRole: 'TEACHER' | 'ADMIN';
  userId: string;
  onCourseUpdated: (updated: CourseConfig) => void;
}

const STATUS_OPTIONS: { value: CourseConfig['status']; label: string }[] = [
  { value: 'upcoming', label: 'เร็วๆ นี้' },
  { value: 'active', label: 'กำลังเรียน' },
  { value: 'complete', label: 'เสร็จสิ้น' },
];

export const CourseSettings = ({
  course,
  userRole,
  userId,
  onCourseUpdated,
}: CourseSettingsProps) => {
  const router = useRouter();

  // ─── Config form state ────────────────────────────────────────
  const [form, setForm] = useState({
    className: course.className,
    description: course.description ?? '',
    code: course.code ?? '',
    roomId: course.roomId ?? '',
    maxStudents: course.maxStudents,
    status: course.status,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>(
    'idle',
  );
  const [saveError, setSaveError] = useState('');

  // ─── Danger Zone state ────────────────────────────────────────
  const [isDangerOpen, setIsDangerOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'maxStudents' ? parseInt(value) || 1 : value,
    }));
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    if (!form.className.trim()) {
      setSaveStatus('error');
      setSaveError('ชื่อรายวิชาไม่สามารถเว้นว่างได้');
      return;
    }
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const updated = await updateCourse(course.id, {
        ...form,
        role: userRole,
        userId,
      });
      onCourseUpdated(updated);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      setSaveStatus('error');
      setSaveError(
        err?.response?.data?.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== course.className) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteCourse(course.id, { role: userRole, userId });
      router.push('/course');
    } catch (err: any) {
      setDeleteError(
        err?.response?.data?.message ?? 'เกิดข้อผิดพลาดในการลบ กรุณาลองใหม่',
      );
      setIsDeleting(false);
    }
  };

  const isDeleteReady = deleteConfirmText === course.className;

  return (
    <div className={styles.settingsPage}>
      {/* ── Section: Course Configuration ── */}
      <div className={styles.settingsSection}>
        <div className={styles.settingsSectionHeader}>
          <div className={styles.settingsSectionIcon}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <div>
            <h3 className={styles.settingsSectionTitle}>
              Course Configuration
            </h3>
            <p className={styles.settingsSectionSubtitle}>
              ปรับแต่งข้อมูลและตั้งค่าของรายวิชา
            </p>
          </div>
        </div>

        <div className={styles.settingsCard}>
          <div className={styles.settingsFormGrid}>
            {/* Course Name */}
            <div
              className={styles.settingsFormGroup}
              style={{ gridColumn: '1 / -1' }}
            >
              <label
                className={styles.settingsLabel}
                htmlFor="settings-className"
              >
                ชื่อรายวิชา <span className={styles.settingsRequired}>*</span>
              </label>
              <input
                id="settings-className"
                name="className"
                className={styles.settingsInput}
                value={form.className}
                onChange={handleFormChange}
                placeholder="เช่น วิศวกรรมไฟฟ้าเบื้องต้น"
              />
            </div>

            {/* Description */}
            <div
              className={styles.settingsFormGroup}
              style={{ gridColumn: '1 / -1' }}
            >
              <label
                className={styles.settingsLabel}
                htmlFor="settings-description"
              >
                คำอธิบายรายวิชา
              </label>
              <textarea
                id="settings-description"
                name="description"
                className={styles.settingsTextarea}
                value={form.description}
                onChange={handleFormChange}
                rows={3}
                placeholder="อธิบายรายวิชาโดยย่อ..."
              />
            </div>

            {/* Course Code */}
            <div className={styles.settingsFormGroup}>
              <label className={styles.settingsLabel} htmlFor="settings-code">
                รหัสวิชา
              </label>
              <input
                id="settings-code"
                name="code"
                className={styles.settingsInput}
                value={form.code}
                onChange={handleFormChange}
                placeholder="เช่น EE101"
              />
            </div>

            {/* Room */}
            <div className={styles.settingsFormGroup}>
              <label className={styles.settingsLabel} htmlFor="settings-roomId">
                ห้องเรียน
              </label>
              <input
                id="settings-roomId"
                name="roomId"
                className={styles.settingsInput}
                value={form.roomId}
                onChange={handleFormChange}
                placeholder="เช่น ห้อง A201"
              />
            </div>

            {/* Max Students */}
            <div className={styles.settingsFormGroup}>
              <label
                className={styles.settingsLabel}
                htmlFor="settings-maxStudents"
              >
                จำนวนนักศึกษาสูงสุด
              </label>
              <input
                id="settings-maxStudents"
                name="maxStudents"
                type="number"
                min={1}
                max={500}
                className={styles.settingsInput}
                value={form.maxStudents}
                onChange={handleFormChange}
              />
            </div>

            {/* Status */}
            <div className={styles.settingsFormGroup}>
              <label className={styles.settingsLabel} htmlFor="settings-status">
                สถานะรายวิชา
              </label>
              <select
                id="settings-status"
                name="status"
                className={styles.settingsSelect}
                value={form.status}
                onChange={handleFormChange}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Save Status Messages */}
          {saveStatus === 'success' && (
            <div className={styles.settingsAlert} data-type="success">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              บันทึกข้อมูลเรียบร้อยแล้ว
            </div>
          )}
          {saveStatus === 'error' && (
            <div className={styles.settingsAlert} data-type="error">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {saveError}
            </div>
          )}

          {/* Save Button */}
          <div className={styles.settingsActions}>
            <button
              id="settings-save-btn"
              className={styles.settingsSaveBtn}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className={styles.settingsSpinner} />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  บันทึกการเปลี่ยนแปลง
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Section: Danger Zone ── */}
      <div className={styles.dangerZone}>
        <button
          className={styles.dangerZoneToggle}
          onClick={() => {
            setIsDangerOpen((o) => !o);
            setDeleteConfirmText('');
            setDeleteError('');
          }}
          id="danger-zone-toggle"
          aria-expanded={isDangerOpen}
        >
          <div className={styles.dangerZoneToggleLeft}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            <div>
              <span className={styles.dangerZoneTitle}>Danger Zone</span>
              <span className={styles.dangerZoneSubtitle}>
                การดำเนินการที่ไม่สามารถย้อนกลับได้
              </span>
            </div>
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isDangerOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
              flexShrink: 0,
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {isDangerOpen && (
          <div className={styles.dangerZoneBody}>
            <div className={styles.dangerDeleteCard}>
              <div className={styles.dangerDeleteHeader}>
                <div className={styles.dangerDeleteIcon}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <h4 className={styles.dangerDeleteTitle}>ลบรายวิชานี้</h4>
                  <p className={styles.dangerDeleteDesc}>
                    การลบจะลบข้อมูลทั้งหมดที่เกี่ยวข้องกับรายวิชานี้อย่างถาวร
                    ได้แก่ บันทึก syllabus, การสมัครเรียนของนักศึกษา
                    และแบบทดสอบทั้งหมด
                  </p>
                </div>
              </div>

              <div className={styles.dangerConfirmBox}>
                <label
                  className={styles.dangerConfirmLabel}
                  htmlFor="delete-confirm-input"
                >
                  พิมพ์{' '}
                  <code className={styles.dangerConfirmCode}>
                    {course.className}
                  </code>{' '}
                  เพื่อยืนยันการลบ
                </label>
                <input
                  id="delete-confirm-input"
                  className={styles.dangerConfirmInput}
                  value={deleteConfirmText}
                  onChange={(e) => {
                    setDeleteConfirmText(e.target.value);
                    setDeleteError('');
                  }}
                  placeholder="พิมพ์ชื่อรายวิชา..."
                  autoComplete="off"
                />
              </div>

              {deleteError && (
                <div className={styles.settingsAlert} data-type="error">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {deleteError}
                </div>
              )}

              <button
                id="delete-course-btn"
                className={styles.dangerDeleteBtn}
                onClick={handleDelete}
                disabled={!isDeleteReady || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className={styles.settingsSpinner} />
                    กำลังลบรายวิชา...
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                    ลบรายวิชานี้อย่างถาวร
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
