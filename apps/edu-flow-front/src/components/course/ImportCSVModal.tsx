'use client';

import { useState, useRef, useCallback } from 'react';
import { importStudentsIntoCourse } from '@/api/course/controller';
import type { ImportCourseStudentsResult } from '@/api/course/controller';
import { getStudentCSVExampleUrl } from '@/api/user/controller';
import styles from './import-csv-modal.module.scss';

interface ImportCSVModalProps {
  courseId: string;
  onClose: () => void;
  onImported: () => void;
}

type ModalStep = 'upload' | 'importing' | 'result';

export const ImportCSVModal = ({ courseId, onClose, onImported }: ImportCSVModalProps) => {
  const [step, setStep] = useState<ModalStep>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportCourseStudentsResult | null>(null);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Drag-and-Drop ─────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith('.csv')) {
      setFile(dropped);
      setImportError('');
    } else {
      setImportError('กรุณาอัปโหลดไฟล์ .csv เท่านั้น');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.name.endsWith('.csv')) {
      setFile(selected);
      setImportError('');
    } else if (selected) {
      setImportError('กรุณาเลือกไฟล์ .csv เท่านั้น');
    }
  };

  // ─── Import ─────────────────────────────────────────────────
  const handleImport = async () => {
    if (!file) return;
    setStep('importing');
    setImportError('');
    try {
      const text = await file.text();
      const res = await importStudentsIntoCourse(courseId, text);
      setResult(res);
      setStep('result');
      if (res.imported > 0 || res.enrolled > 0) onImported();
    } catch (err: any) {
      setImportError(err?.response?.data?.message ?? 'เกิดข้อผิดพลาดในการ import');
      setStep('upload');
    }
  };

  const handleClose = () => {
    if (step !== 'importing') onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose} id="import-csv-modal-overlay">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} id="import-csv-modal">

        {/* ── Header ── */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <h2 className={styles.modalTitle}>Import นักเรียนจาก CSV</h2>
              <p className={styles.modalSubtitle}>อัปโหลดไฟล์ CSV เพื่อเพิ่มนักเรียนหลายคนพร้อมกัน</p>
            </div>
          </div>
          {step !== 'importing' && (
            <button className={styles.closeBtn} onClick={handleClose} aria-label="ปิด" id="close-import-modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* ══════════════════════════════════
            Step: Upload
        ══════════════════════════════════ */}
        {step === 'upload' && (
          <>
            {/* Format hint */}
            <div className={styles.formatHint}>
              <div className={styles.formatHintHeader}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                รูปแบบไฟล์ CSV ที่รองรับ
              </div>
              <code className={styles.csvPreview}>
                studentId,firstName,lastName,email,section,room{'\n'}
                6401001,สมชาย,ใจดี,somchai@example.com,ปวส.1,2{'\n'}
                6401002,สมหญิง,รักเรียน,somying@example.com,ปวช.2,1
              </code>
              <a
                className={styles.downloadExample}
                href={getStudentCSVExampleUrl()}
                target="_blank"
                rel="noopener noreferrer"
                id="download-example-csv"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                ดาวน์โหลด Example CSV
              </a>
            </div>

            {/* Drop Zone */}
            <div
              className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''} ${file ? styles.dropZoneHasFile : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              id="csv-drop-zone"
            >
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="csv-file-input"
              />
              {file ? (
                <div className={styles.filePreview}>
                  <div className={styles.fileIcon}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div>
                    <p className={styles.fileName}>{file.name}</p>
                    <p className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    className={styles.removeFile}
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    aria-label="ลบไฟล์"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className={styles.dropPlaceholder}>
                  <div className={styles.dropIcon}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className={styles.dropText}>ลากไฟล์ CSV มาวางที่นี่</p>
                  <p className={styles.dropSubtext}>หรือ <span>คลิกเพื่อเลือกไฟล์</span></p>
                </div>
              )}
            </div>

            {importError && (
              <div className={styles.errorMsg}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {importError}
              </div>
            )}

            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={handleClose}>ยกเลิก</button>
              <button
                className={styles.importBtn}
                onClick={handleImport}
                disabled={!file}
                id="confirm-import-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Import นักเรียน
              </button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════
            Step: Importing
        ══════════════════════════════════ */}
        {step === 'importing' && (
          <div className={styles.importing}>
            <div className={styles.importingSpinner} />
            <p className={styles.importingText}>กำลัง import ข้อมูลนักเรียน...</p>
            <p className={styles.importingSubtext}>กรุณารอสักครู่ อย่าปิดหน้าต่างนี้</p>
          </div>
        )}

        {/* ══════════════════════════════════
            Step: Result
        ══════════════════════════════════ */}
        {step === 'result' && result && (
          <>
            <div className={styles.resultSummary}>
              <div className={styles.resultCard} data-type="enrolled">
                <span className={styles.resultNum}>{result.enrolled}</span>
                <span className={styles.resultLabel}>เพิ่มเข้า course</span>
              </div>
              <div className={styles.resultCard} data-type="success">
                <span className={styles.resultNum}>{result.imported}</span>
                <span className={styles.resultLabel}>นำเข้าสำเร็จ</span>
              </div>
              <div className={styles.resultCard} data-type="skip">
                <span className={styles.resultNum}>{result.skipped}</span>
                <span className={styles.resultLabel}>ข้ามซ้ำ</span>
              </div>
              <div className={styles.resultCard} data-type="error">
                <span className={styles.resultNum}>{result.errors.length}</span>
                <span className={styles.resultLabel}>มีข้อผิดพลาด</span>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className={styles.errorTable}>
                <p className={styles.errorTableTitle}>รายการที่มีปัญหา</p>
                <div className={styles.errorList}>
                  {result.errors.map((e, i) => (
                    <div key={i} className={styles.errorRow}>
                      <span className={styles.errorRowNum}>แถว {e.row}</span>
                      <span className={styles.errorRowId}>{e.studentId}</span>
                      <span className={styles.errorRowReason}>{e.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.imported === 0 && result.enrolled === 0 && result.errors.length === 0 && (
              <div className={styles.allSkipped}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                นักเรียนทั้งหมดมีในระบบแล้ว ไม่มีรายการใหม่
              </div>
            )}

            <div className={styles.actions}>
              <button className={styles.importBtn} onClick={handleClose} id="done-import-btn">
                เสร็จสิ้น
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
