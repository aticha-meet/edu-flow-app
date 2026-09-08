'use client';

import { useEffect, useMemo, useState } from 'react';
import { addEnrollments } from '@/api/course/controller';
import { getListUsers, getStudentClassrooms } from '@/api/user/controller';
import { useToast } from '@/components/ToastProvider';
import styles from '@/app/(main)/course/[id]/students/students.module.scss';

interface AddStudentsModalProps {
  courseId: string;
  courseName: string;
  onClose: () => void;
  onAdded: () => Promise<void>;
}

type Classroom = { section: string | null; room: number | null };

export function AddStudentsModal({ courseId, courseName, onClose, onAdded }: AddStudentsModalProps) {
  const notify = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [section, setSection] = useState('');
  const [room, setRoom] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableCount, setAvailableCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadClassrooms = async () => {
      try {
        const data = await getStudentClassrooms();
        if (!cancelled) setClassrooms(data);
      } catch {
        if (!cancelled) setClassrooms([]);
      }
    };
    void loadClassrooms();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await getListUsers('/users/student', {
          courseId,
          section: section || undefined,
          room: room || undefined,
          search: search.trim() || undefined,
        });
        if (!cancelled) {
          setStudents(response.data.users);
          setAvailableCount(response.data.count);
        }
      } catch {
        if (!cancelled) {
          setStudents([]);
          setAvailableCount(null);
          setError('โหลดรายชื่อนักเรียนไม่สำเร็จ กรุณาลองใหม่');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [courseId, room, search, section]);

  const sections = useMemo(() => Array.from(new Set(classrooms.map((item) => item.section).filter(Boolean) as string[])).sort(), [classrooms]);
  const rooms = useMemo(() => Array.from(new Set(classrooms.filter((item) => !section || item.section === section).map((item) => item.room).filter((value): value is number => value !== null))).sort((a, b) => a - b), [classrooms, section]);
  const allVisibleSelected = students.length > 0 && students.every((student) => selectedIds.includes(student.id));

  const toggleStudent = (studentId: string) => {
    setSelectedIds((current) => current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId]);
    setError('');
  };

  const toggleAllVisible = () => {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        const visibleIds = new Set(students.map((student) => student.id));
        return current.filter((studentId) => !visibleIds.has(studentId));
      }
      return Array.from(new Set([...current, ...students.map((student) => student.id)]));
    });
  };

  const handleAdd = async () => {
    if (selectedIds.length === 0) {
      setError('กรุณาเลือกนักเรียน');
      return;
    }
    setIsAdding(true);
    setError('');
    try {
      const result = await addEnrollments(courseId, selectedIds);
      const message = result.added > 0 ? `เพิ่มนักเรียนสำเร็จ ${result.added} คน` : 'ไม่มีนักเรียนที่ถูกเพิ่มใหม่';
      notify(message, result.added > 0 ? 'success' : 'info');
      setSuccess(message);
      await onAdded();
      window.setTimeout(onClose, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose} id="add-student-modal-overlay">
      <div className={styles.modal} onClick={(event) => event.stopPropagation()} id="add-student-modal">
        <button className={styles.modalClose} onClick={onClose} aria-label="ปิด" disabled={isAdding}>×</button>
        <div className={styles.modalHeader}>
          <div className={styles.modalIcon}>+</div>
          <h2 className={styles.modalTitle}>เพิ่มนักเรียนเข้าวิชา</h2>
          <p className={styles.modalSubtitle}>เลือกนักเรียนที่ต้องการเพิ่มเข้า {courseName}</p>
        </div>

        <div className={styles.studentPicker}>
          <div className={styles.pickerToolbar}>
            <div>
              <p className={styles.formLabel}>เลือกนักเรียน</p>
              <p className={styles.selectionCount}>เลือกแล้ว {selectedIds.length} จาก {isLoading ? '…' : availableCount ?? '—'} คน</p>
            </div>
            <button type="button" className={styles.selectAllBtn} onClick={toggleAllVisible} disabled={isLoading || students.length === 0}>
              {allVisibleSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
            </button>
          </div>

          <div className={styles.pickerFilters}>
            <input className={styles.pickerSearch} type="search" placeholder="ค้นหาชื่อ อีเมล หรือรหัสนักเรียน" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select className={styles.pickerSelect} value={section} onChange={(event) => { setSection(event.target.value); setRoom(''); }}>
              <option value="">ทุกระดับชั้น</option>
              {sections.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className={styles.pickerSelect} value={room} onChange={(event) => setRoom(event.target.value)}>
              <option value="">ทุกห้อง</option>
              {rooms.map((item) => <option key={item} value={String(item)}>ห้อง {item}</option>)}
            </select>
          </div>

          <div className={styles.studentOptions}>
            {isLoading ? <div className={styles.optionsEmpty}>กำลังโหลดรายชื่อนักเรียน...</div> : students.length === 0 ? <div className={styles.optionsEmpty}>ไม่พบนักเรียนที่ตรงกับตัวกรอง</div> : students.map((student) => {
              const fullName = [student.name, student.sureName].filter(Boolean).join(' ') || student.email;
              const classroom = [student.studentProfile?.section, student.studentProfile?.room ? `ห้อง ${student.studentProfile.room}` : null].filter(Boolean).join(' · ');
              const checked = selectedIds.includes(student.id);
              return (
                <label key={student.id} className={`${styles.studentOption} ${checked ? styles.studentOptionSelected : ''}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggleStudent(student.id)} />
                  <span className={styles.checkboxMark} />
                  <span className={styles.optionInfo}>
                    <span className={styles.optionName}>{fullName}</span>
                    <span className={styles.optionMeta}>{classroom || 'ยังไม่มีข้อมูลห้อง'} · {student.email}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {error && <div className={styles.msgError}>{error}</div>}
        {success && <div className={styles.msgSuccess}>{success}</div>}
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={isAdding}>ยกเลิก</button>
          <button className={styles.submitBtn} onClick={handleAdd} disabled={isAdding || selectedIds.length === 0} id="confirm-add-student-btn">
            {isAdding ? <><span className={styles.spinner} /> กำลังเพิ่ม...</> : 'เพิ่มนักเรียน'}
          </button>
        </div>
      </div>
    </div>
  );
}
