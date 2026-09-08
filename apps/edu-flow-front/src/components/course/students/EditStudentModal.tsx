'use client';

import { useEffect, useState } from 'react';
import { updateStudent } from '@/api/user/controller';
import { useToast } from '@/components/ToastProvider';
import styles from '@/app/(main)/course/[id]/students/students.module.scss';
import type { StudentEditForm, StudentItem } from './types';

interface EditStudentModalProps {
  student: StudentItem['student'];
  onClose: () => void;
  onUpdated: () => Promise<void>;
}

const toForm = (student: StudentItem['student']): StudentEditForm => ({
  name: student.name ?? '',
  sureName: student.sureName ?? '',
  email: student.email,
  studentId: student.studentProfile?.studentId ?? '',
  section: student.studentProfile?.section ?? '',
  room: student.studentProfile?.room ? String(student.studentProfile.room) : '',
});

export function EditStudentModal({ student, onClose, onUpdated }: EditStudentModalProps) {
  const notify = useToast();
  const [form, setForm] = useState(() => toForm(student));
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => setForm(toForm(student)), [student]);

  const updateField = (field: keyof StudentEditForm, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.studentId.trim()) {
      setError('กรุณากรอกชื่อ อีเมล และรหัสนักเรียนให้ครบถ้วน');
      return;
    }
    if (form.room && (!/^\d+$/.test(form.room) || Number(form.room) < 1)) {
      setError('ห้องต้องเป็นเลขจำนวนเต็มที่มากกว่า 0');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await updateStudent(student.id, {
        name: form.name.trim(),
        sureName: form.sureName.trim(),
        email: form.email.trim(),
        studentId: form.studentId.trim(),
        section: form.section.trim(),
        room: form.room ? Number(form.room) : null,
      });
      notify('แก้ไขข้อมูลนักเรียนสำเร็จ');
      await onUpdated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'แก้ไขข้อมูลนักเรียนไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={() => !isSaving && onClose()} id="edit-student-modal-overlay">
      <div className={`${styles.modal} ${styles.editModal}`} onClick={(event) => event.stopPropagation()} id="edit-student-modal">
        <button className={styles.modalClose} onClick={onClose} disabled={isSaving} aria-label="ปิด">×</button>
        <div className={styles.modalHeader}>
          <div className={`${styles.modalIcon} ${styles.editModalIcon}`}>✎</div>
          <h2 className={styles.modalTitle}>แก้ไขข้อมูลนักเรียน</h2>
          <p className={styles.modalSubtitle}>ข้อมูลจะถูกอัปเดตในระบบกลาง</p>
        </div>
        <div className={styles.editFormGrid}>
          <Field label="ชื่อ *" value={form.name} onChange={(value) => updateField('name', value)} />
          <Field label="นามสกุล" value={form.sureName} onChange={(value) => updateField('sureName', value)} />
          <Field label="อีเมล *" type="email" value={form.email} onChange={(value) => updateField('email', value)} />
          <Field label="รหัสนักเรียน *" value={form.studentId} onChange={(value) => updateField('studentId', value)} />
          <Field label="ระดับชั้น" value={form.section} onChange={(value) => updateField('section', value)} />
          <Field label="ห้อง" type="number" min="1" value={form.room} onChange={(value) => updateField('room', value)} />
        </div>
        {error && <div className={styles.msgError}>{error}</div>}
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>ยกเลิก</button>
          <button className={styles.submitBtn} onClick={handleSave} disabled={isSaving}>
            {isSaving ? <><span className={styles.spinner} /> กำลังบันทึก...</> : 'บันทึกการแก้ไข'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', min, value, onChange }: { label: string; type?: string; min?: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className={styles.formField}>
      <span className={styles.formLabel}>{label}</span>
      <input type={type} min={min} className={styles.formInput} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
