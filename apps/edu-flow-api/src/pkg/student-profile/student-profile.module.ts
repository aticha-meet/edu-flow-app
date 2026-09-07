import { Router } from 'express';
import { studentProfileController } from './student-profile.controller';

export const StudentRouter: Router = Router();

// ─── List & Create ──────────────────────────────────────────────
StudentRouter.get('/students', (req, res) =>
  studentProfileController.getStudentProfiles(req, res),
);
StudentRouter.post('/student', (req, res) =>
  studentProfileController.createStudentProfile(req, res),
);

// ─── CSV Import ─────────────────────────────────────────────────
StudentRouter.get('/students/import-csv/example', (req, res) =>
  studentProfileController.downloadExample(req, res),
);
StudentRouter.post('/students/import-csv', (req, res) =>
  studentProfileController.importCSV(req, res),
);
