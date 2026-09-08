import { Request, Response } from 'express';
import { studentProfileService, CSVStudentRow } from './student-profile.service';

// Example CSV content สำหรับ download
const EXAMPLE_CSV = `studentId,firstName,lastName,email,section,room
6401001,สมชาย,ใจดี,somchai.jaidee@example.com,ปวส.1,2
6401002,สมหญิง,รักเรียน,somying.rakrian@example.com,ปวส.1,2
6401003,ณัฐพล,มานะ,nuttapon.mana@example.com,ปวช.2,1
6401004,พิมพ์ชนก,สุขใจ,pimchanok.sukjai@example.com,ปวช.2,1
6401005,วิชัย,ดีเลิศ,wichai.dilert@example.com,ปวส.2,3
6401006,นภา,ฟ้าใส,napa.fasai@example.com,ม.6,1
`;

/**
 * แปลง CSV text → array of rows (รองรับ BOM UTF-8)
 */
export function parseCSV(text: string): CSVStudentRow[] {
  // ลบ BOM ถ้ามี
  const cleaned = text.replace(/^\uFEFF/, '').trim();
  const lines = cleaned.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

  const colIndex = {
    studentId: headers.indexOf('studentid'),
    firstName: headers.indexOf('firstname'),
    lastName: headers.indexOf('lastname'),
    email: headers.indexOf('email'),
    section: headers.indexOf('section'),
    room: headers.indexOf('room'),
  };

  const rows: CSVStudentRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    rows.push({
      studentId: colIndex.studentId >= 0 ? cols[colIndex.studentId] ?? '' : '',
      firstName: colIndex.firstName >= 0 ? cols[colIndex.firstName] ?? '' : '',
      lastName: colIndex.lastName >= 0 ? cols[colIndex.lastName] ?? '' : '',
      email: colIndex.email >= 0 ? cols[colIndex.email] ?? '' : '',
      section: colIndex.section >= 0 ? cols[colIndex.section] ?? '' : undefined,
      room: colIndex.room >= 0 ? cols[colIndex.room] ?? '' : undefined,
    });
  }
  return rows;
}

export class StudentProfileController {
  async getStudentProfiles(req: Request, res: Response) {
    try {
      const students = await studentProfileService.findAll();
      return res.status(200).json({ message: 'Student profiles fetched successfully', data: students });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error });
    }
  }

  async createStudentProfile(req: Request, res: Response) {
    try {
      const studentData = req.body;
      const createdStudent = await studentProfileService.create(studentData);
      return res.status(201).json({ message: 'Student profile created successfully', data: createdStudent });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error });
    }
  }

  async updateStudentProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, sureName, email, studentId, section, room } = req.body;
      const parsedRoom = room === null || room === '' || room === undefined
        ? null
        : Number(room);

      if (!id || !name?.trim() || !email?.trim() || !studentId?.trim()) {
        return res.status(400).json({
          message: 'name, email and studentId are required',
        });
      }
      if (parsedRoom !== null && (!Number.isInteger(parsedRoom) || parsedRoom < 1)) {
        return res.status(400).json({ message: 'room must be a positive integer' });
      }

      const student = await studentProfileService.updateStudent(id, {
        name: name.trim(),
        sureName: typeof sureName === 'string' ? sureName.trim() || null : null,
        email: email.trim(),
        studentId: studentId.trim(),
        section: typeof section === 'string' ? section.trim() || null : null,
        room: parsedRoom,
      });

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      return res.status(200).json({ message: 'Student updated successfully', data: student });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        return res.status(409).json({ message: 'Email or student ID already exists' });
      }
      console.error('Update student error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * POST /students/import-csv
   * Body: { csv: string }  (CSV text ที่ frontend ส่งมา)
   */
  async importCSV(req: Request, res: Response) {
    try {
      const { csv } = req.body;
      if (!csv || typeof csv !== 'string') {
        return res.status(400).json({ message: 'csv field (string) is required' });
      }

      const rows = parseCSV(csv);
      if (rows.length === 0) {
        return res.status(400).json({ message: 'ไม่พบข้อมูลใน CSV หรือ format ไม่ถูกต้อง' });
      }

      const result = await studentProfileService.importFromCSV(rows);
      return res.status(200).json({
        message: `Import เสร็จสิ้น: นำเข้า ${result.imported} คน, ข้าม ${result.skipped} คน`,
        data: result,
      });
    } catch (error) {
      console.error('Import CSV error:', error);
      return res.status(500).json({ message: 'Internal server error', error });
    }
  }

  /**
   * GET /students/import-csv/example
   * ดาวน์โหลดไฟล์ example CSV
   */
  async downloadExample(req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="students_example.csv"');
    // ส่ง BOM ให้ Excel เปิดภาษาไทยได้ถูกต้อง
    return res.status(200).send('\uFEFF' + EXAMPLE_CSV);
  }
}

export const studentProfileController = new StudentProfileController();
