import { jsPDF } from 'jspdf';
import { sarabunRegularBase64 } from '@/config/fonts/Sarabun-Regular';
import type { ExamQuestion } from '@/app/exam/page';

// ─── Types ───────────────────────────────────────────────────────
interface GenerateExamPDFParams {
  examData: ExamQuestion[];
  selectedAnswers: Record<number, number>;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  percentage: number;
}

// ─── PDF Generation ──────────────────────────────────────────────
export function generateExamPDF({
  examData,
  selectedAnswers,
  correctCount,
  wrongCount,
  totalQuestions,
  percentage,
}: GenerateExamPDFParams) {
  const doc = new jsPDF();

  // 1. นำ Font Base64 ฝังเข้า Virtual File System ของ jsPDF
  doc.addFileToVFS('Sarabun-Regular.ttf', sarabunRegularBase64);

  // 2. ลงทะเบียน Font เพื่อให้ใช้งานได้
  doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal');

  // 3. ตั้งค่า Font ปัจจุบันเป็นภาษาไทย
  doc.setFont('Sarabun', 'normal');

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Title
  doc.setFontSize(22);
  doc.text('EduFlow - สรุปผลการสอบ', pageWidth / 2, y, { align: 'center' });
  y += 12;

  // Date
  doc.setFontSize(12);
  doc.setTextColor(120, 120, 120);
  const dateStr = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`วันที่ทำแบบทดสอบ: ${dateStr}`, pageWidth / 2, y, {
    align: 'center',
  });
  y += 16;

  // Score summary box
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 28, 4, 4);
  y += 8;

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `คะแนนรวมทั้งหมด: ${correctCount} จาก ${totalQuestions} คะแนน`,
    margin + 10,
    y + 6,
  );

  doc.setFontSize(16);
  doc.text(`${percentage}%`, pageWidth - margin - 10, y + 6, {
    align: 'right',
  });

  y += 14;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `ตอบถูก: ${correctCount} ข้อ  |  ตอบผิด: ${wrongCount} ข้อ`,
    margin + 10,
    y + 2,
  );
  y += 18;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Questions detail
  examData.forEach((q, index) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    const userAnswer = selectedAnswers[q.questionID];
    const isCorrect = userAnswer === q.correct;
    const correctAnswer = q.answer.find((a) => a.id === q.correct);
    const userAnswerText = q.answer.find((a) => a.id === userAnswer);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);

    const statusIcon = isCorrect ? '[ถูกต้อง]' : '[ผิด]';
    const statusColor = isCorrect ? [34, 197, 94] : [239, 68, 68];
    doc.text(`ข้อ ${index + 1}.`, margin, y);

    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFontSize(12);
    doc.text(statusIcon, margin + 14, y);

    y += 8;

    // Question text
    doc.setFontSize(13);
    doc.setTextColor(40, 40, 40);
    const questionLines = doc.splitTextToSize(q.Question, contentWidth - 10);
    doc.text(questionLines, margin + 5, y);
    y += questionLines.length * 6 + 3;

    // User's answer
    doc.setFontSize(12);
    if (isCorrect) {
      doc.setTextColor(34, 150, 80);
      doc.text(
        `คำตอบของคุณ: ${userAnswerText?.value || 'ไม่ได้ตอบ'}`,
        margin + 5,
        y,
      );
    } else {
      doc.setTextColor(200, 60, 60);
      doc.text(
        `คำตอบของคุณ: ${userAnswerText?.value || 'ไม่ได้ตอบ'}`,
        margin + 5,
        y,
      );
      y += 6;
      doc.setTextColor(34, 150, 80);
      doc.text(`คำตอบที่ถูกต้อง: ${correctAnswer?.value || ''}`, margin + 5, y);
    }
    y += 12;

    // Separator line
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.1);
    doc.line(margin + 5, y - 4, pageWidth - margin - 5, y - 4);
    y += 4;
  });

  // Footer
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  y += 5;
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'สร้างโดยระบบ EduFlow - Education Management System',
    pageWidth / 2,
    y,
    { align: 'center' },
  );

  doc.save(`EduFlow_Exam_Result_${new Date().toISOString().slice(0, 10)}.pdf`);
}
