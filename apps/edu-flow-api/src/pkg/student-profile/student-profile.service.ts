import prisma from '../../configs/prisma';

export interface CSVStudentRow {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  section?: string;
  room?: string;
}

export class StudentProfileService {
  /**
   * ดึง student profiles ทั้งหมด พร้อมข้อมูล user
   */
  async findAll() {
    return prisma.studentProfile.findMany({
      include: {
        user: {
          select: { id: true, name: true, sureName: true, email: true, status: true },
        },
      },
      orderBy: [{ section: 'asc' }, { room: 'asc' }],
    });
  }

  /**
   * สร้าง student profile ใหม่
   */
  async create(data: any) {
    return prisma.studentProfile.create({ data });
  }

  /** อัปเดตข้อมูล User และ StudentProfile พร้อมกัน */
  async updateStudent(userId: string, data: {
    name: string;
    sureName?: string | null;
    email: string;
    studentId: string;
    section?: string | null;
    room?: number | null;
  }) {
    return prisma.$transaction(async (tx) => {
      const student = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true },
      });

      if (!student || student.role !== 'STUDENT') return null;

      return tx.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          sureName: data.sureName ?? null,
          email: data.email,
          studentProfile: {
            upsert: {
              create: {
                studentId: data.studentId,
                section: data.section ?? null,
                room: data.room ?? null,
              },
              update: {
                studentId: data.studentId,
                section: data.section ?? null,
                room: data.room ?? null,
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          sureName: true,
          email: true,
          status: true,
          studentProfile: {
            select: { studentId: true, section: true, room: true },
          },
        },
      });
    });
  }

  /**
   * Import นักเรียนจาก CSV rows (bulk)
   * Logic: ถ้า email มีอยู่แล้ว → skip, ถ้าไม่มี → สร้าง User + StudentProfile
   */
  async importFromCSV(rows: CSVStudentRow[]): Promise<{
    imported: number;
    skipped: number;
    errors: { row: number; studentId: string; reason: string }[];
    userIds: string[];
  }> {
    let imported = 0;
    let skipped = 0;
    const errors: { row: number; studentId: string; reason: string }[] = [];
    const userIds: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 เพราะ row 1 คือ header

      // Validate required fields
      if (!row.studentId || !row.email || !row.firstName) {
        errors.push({ row: rowNum, studentId: row.studentId || '?', reason: 'ข้อมูลไม่ครบ (ต้องมี studentId, email, firstName)' });
        continue;
      }

      try {
        // ตรวจสอบ email ซ้ำ
        const existingUser = await prisma.user.findUnique({
          where: { email: row.email },
          include: { studentProfile: true },
        });
        if (existingUser) {
          if (existingUser.role === 'STUDENT' && existingUser.studentProfile) {
            userIds.push(existingUser.id);
          }
          skipped++;
          continue;
        }

        // ตรวจสอบ studentId ซ้ำ
        const existingProfile = await prisma.studentProfile.findUnique({ where: { studentId: row.studentId } });
        if (existingProfile) {
          userIds.push(existingProfile.userId);
          skipped++;
          continue;
        }

        // สร้าง User + StudentProfile ในคราวเดียว
        const createdUser = await prisma.user.create({
          data: {
            email: row.email,
            name: row.firstName,
            sureName: row.lastName || null,
            role: 'STUDENT',
            studentProfile: {
              create: {
                studentId: row.studentId,
                section: row.section || null,
                room: row.room ? parseInt(row.room) : null,
              },
            },
          },
        });
        userIds.push(createdUser.id);
        imported++;
      } catch (err: any) {
        errors.push({
          row: rowNum,
          studentId: row.studentId,
          reason: err?.message ?? 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
        });
      }
    }

    return { imported, skipped, errors, userIds };
  }
}

export const studentProfileService = new StudentProfileService();
