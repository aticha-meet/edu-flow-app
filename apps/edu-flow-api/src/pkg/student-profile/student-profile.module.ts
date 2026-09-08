import { Router } from 'express';
import { studentProfileController } from './student-profile.controller';
import { requireRoles } from '../../middleware/requireRoles';

export const StudentRouter: Router = Router();

// ─── List & Create ──────────────────────────────────────────────
StudentRouter.get('/students', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  studentProfileController.getStudentProfiles(req, res),
);
StudentRouter.post('/student', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  studentProfileController.createStudentProfile(req, res),
);
StudentRouter.patch('/students/:id', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  studentProfileController.updateStudentProfile(req, res),
);

// ─── CSV Import ─────────────────────────────────────────────────
StudentRouter.get('/students/import-csv/example', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  studentProfileController.downloadExample(req, res),
);
StudentRouter.post('/students/import-csv', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  studentProfileController.importCSV(req, res),
);
