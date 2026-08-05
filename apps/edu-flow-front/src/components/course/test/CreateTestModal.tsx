'use client';

import { useState, useRef } from 'react';
import styles from './create-test-modal.module.scss';

// ─── Types ────────────────────────────────────────────────────────
interface ChoiceInput {
  value: string;
  isCorrect: boolean;
}

interface QuestionInput {
  questionText: string;
  choices: ChoiceInput[];
}

interface CreateTestModalProps {
  courseId: string;
  createdById: string;
  onClose: () => void;
  onCreate: (title: string, questions: QuestionInput[]) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────
const emptyChoice = (): ChoiceInput => ({ value: '', isCorrect: false });
const emptyQuestion = (): QuestionInput => ({
  questionText: '',
  choices: [emptyChoice(), emptyChoice(), emptyChoice(), emptyChoice()],
});

// JSON template ให้ download เป็นตัวอย่าง
const JSON_TEMPLATE = {
  title: 'ชื่อแบบทดสอบ',
  questions: [
    {
      questionText: 'คำถามข้อที่ 1',
      choices: [
        { value: 'ตัวเลือก ก', isCorrect: false },
        { value: 'ตัวเลือก ข', isCorrect: true },
        { value: 'ตัวเลือก ค', isCorrect: false },
        { value: 'ตัวเลือก ง', isCorrect: false },
      ],
    },
    {
      questionText: 'คำถามข้อที่ 2',
      choices: [
        { value: 'ตัวเลือก ก', isCorrect: true },
        { value: 'ตัวเลือก ข', isCorrect: false },
        { value: 'ตัวเลือก ค', isCorrect: false },
        { value: 'ตัวเลือก ง', isCorrect: false },
      ],
    },
  ],
};

const downloadTemplate = () => {
  const blob = new Blob([JSON.stringify(JSON_TEMPLATE, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'exam-template.json';
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Component ────────────────────────────────────────────────────
export const CreateTestModal = ({
  onClose,
  onCreate,
}: CreateTestModalProps) => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<QuestionInput[]>([
    emptyQuestion(),
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── JSON Import handler ─────────────────────────────────────────
  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-imported
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        // Validate structure
        if (!Array.isArray(json.questions) || json.questions.length === 0) {
          setError('ไฟล์ JSON ไม่ถูกต้อง: ต้องมี questions เป็น array ที่ไม่ว่างเปล่า');
          return;
        }

        const parsed: QuestionInput[] = [];
        for (let i = 0; i < json.questions.length; i++) {
          const q = json.questions[i];
          if (!q.questionText || typeof q.questionText !== 'string') {
            setError(`ข้อที่ ${i + 1}: ไม่มี questionText`);
            return;
          }
          if (!Array.isArray(q.choices) || q.choices.length < 2) {
            setError(`ข้อที่ ${i + 1}: choices ต้องมีอย่างน้อย 2 ตัวเลือก`);
            return;
          }
          const hasCorrect = q.choices.some((c: any) => c.isCorrect === true);
          if (!hasCorrect) {
            setError(`ข้อที่ ${i + 1}: ต้องมีตัวเลือกที่ถูกต้อง (isCorrect: true) อย่างน้อย 1 ข้อ`);
            return;
          }
          parsed.push({
            questionText: q.questionText,
            choices: q.choices.map((c: any) => ({
              value: String(c.value ?? ''),
              isCorrect: Boolean(c.isCorrect),
            })),
          });
        }

        // Populate form
        if (json.title && typeof json.title === 'string') {
          setTitle(json.title);
        }
        setQuestions(parsed);
        setError('');
        setImportSuccess(`นำเข้าสำเร็จ ${parsed.length} ข้อ${json.title ? ` — "${json.title}"` : ''}`);
        setTimeout(() => setImportSuccess(''), 4000);
      } catch {
        setError('ไม่สามารถอ่านไฟล์ JSON ได้ กรุณาตรวจสอบรูปแบบไฟล์');
      }
    };
    reader.readAsText(file);
  };

  // ─── Question handlers ──────────────────────────────────────────
  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);

  const removeQuestion = (qi: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== qi));

  const updateQuestionText = (qi: number, text: string) =>
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, questionText: text } : q)),
    );

  // ─── Choice handlers ────────────────────────────────────────────
  const updateChoiceValue = (qi: number, ci: number, value: string) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qi
          ? q
          : {
              ...q,
              choices: q.choices.map((c, j) =>
                j === ci ? { ...c, value } : c,
              ),
            },
      ),
    );

  const setCorrectChoice = (qi: number, ci: number) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qi
          ? q
          : {
              ...q,
              choices: q.choices.map((c, j) => ({
                ...c,
                isCorrect: j === ci,
              })),
            },
      ),
    );

  const addChoice = (qi: number) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qi ? q : { ...q, choices: [...q.choices, emptyChoice()] },
      ),
    );

  const removeChoice = (qi: number, ci: number) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qi ? q : { ...q, choices: q.choices.filter((_, j) => j !== ci) },
      ),
    );

  // ─── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('กรุณาระบุชื่อแบบทดสอบ');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`กรุณาระบุข้อความของข้อที่ ${i + 1}`);
        return;
      }
      if (q.choices.some((c) => !c.value.trim())) {
        setError(`กรุณาระบุตัวเลือกให้ครบทุกข้อในข้อที่ ${i + 1}`);
        return;
      }
      if (!q.choices.some((c) => c.isCorrect)) {
        setError(`กรุณาเลือกคำตอบที่ถูกต้องสำหรับข้อที่ ${i + 1}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onCreate(title.trim(), questions);
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-test-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.eyebrow}>NEW TEST</span>
            <h2 id="create-test-title">สร้างแบบทดสอบ</h2>
          </div>
          <div className={styles.headerActions}>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="json-file-input"
            />
            {/* Template download */}
            <button
              type="button"
              className={styles.templateBtn}
              onClick={downloadTemplate}
              title="ดาวน์โหลดไฟล์ JSON ตัวอย่าง"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Template
            </button>
            {/* Import JSON */}
            <button
              type="button"
              className={styles.importBtn}
              onClick={handleImportClick}
              id="import-json-btn"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Import JSON
            </button>
            <button
              className={styles.closeBtn}
              type="button"
              onClick={onClose}
              aria-label="ปิด"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* ชื่อแบบทดสอบ */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="test-title">
              ชื่อแบบทดสอบ
            </label>
            <input
              id="test-title"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น แบบทดสอบบทที่ 1"
              autoFocus
              required
            />
          </div>

          {/* Questions */}
          <div className={styles.questionSection}>
            <div className={styles.sectionTitle}>
              <span>ข้อสอบ</span>
              <span className={styles.questionCount}>
                {questions.length} ข้อ
              </span>
            </div>

            {questions.map((q, qi) => (
              <div className={styles.questionCard} key={qi}>
                {/* Question header */}
                <div className={styles.questionHeader}>
                  <span className={styles.questionNum}>ข้อ {qi + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeQuestion(qi)}
                      aria-label={`ลบข้อที่ ${qi + 1}`}
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Question text */}
                <textarea
                  className={styles.textarea}
                  value={q.questionText}
                  onChange={(e) => updateQuestionText(qi, e.target.value)}
                  placeholder={`คำถามข้อที่ ${qi + 1}...`}
                  rows={2}
                  required
                />

                {/* Choices */}
                <div className={styles.choicesLabel}>
                  ตัวเลือก{' '}
                  <span className={styles.choiceHint}>
                    (คลิก ● เพื่อเลือกคำตอบที่ถูก)
                  </span>
                </div>
                <div className={styles.choices}>
                  {q.choices.map((c, ci) => (
                    <div className={styles.choiceRow} key={ci}>
                      <button
                        type="button"
                        className={`${styles.correctToggle} ${c.isCorrect ? styles.correct : ''}`}
                        onClick={() => setCorrectChoice(qi, ci)}
                        aria-label={`เลือกตัวเลือก ${ci + 1} เป็นคำตอบที่ถูก`}
                        title="คลิกเพื่อตั้งเป็นคำตอบที่ถูก"
                      >
                        {c.isCorrect ? '✓' : '○'}
                      </button>
                      <input
                        className={`${styles.choiceInput} ${c.isCorrect ? styles.choiceInputCorrect : ''}`}
                        value={c.value}
                        onChange={(e) =>
                          updateChoiceValue(qi, ci, e.target.value)
                        }
                        placeholder={`ตัวเลือก ${ci + 1}`}
                        required
                      />
                      {q.choices.length > 2 && (
                        <button
                          type="button"
                          className={styles.removeChoiceBtn}
                          onClick={() => removeChoice(qi, ci)}
                          aria-label="ลบตัวเลือก"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addChoiceBtn}
                    onClick={() => addChoice(qi)}
                  >
                    + เพิ่มตัวเลือก
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className={styles.addQuestionBtn}
              onClick={addQuestion}
            >
              + เพิ่มข้อสอบ
            </button>
          </div>

          {/* Import success / Error */}
          {importSuccess && (
            <p className={styles.successMsg}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              {importSuccess}
            </p>
          )}
          {error && <p className={styles.error}>{error}</p>}

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'สร้างแบบทดสอบ'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
