import express from 'express';
import {
    login,
    logout,
    getProfile,
    getPendingUniversities,
    getAllUniversities,
    getUniversityDetails,
    approveUniversity,
    rejectUniversity,
} from '../controllers/admin.controller.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin Login
router.post('/login', login);

router.use(authenticateAdmin);

router.post('/logout', logout);
router.get('/profile', getProfile);

// Admin Dashboard Routes
router.get('/pending-universities', getPendingUniversities);
router.get('/universities', getAllUniversities);
router.get('/universities/:universityId', getUniversityDetails);
router.post('/universities/:universityId/approve', approveUniversity);
router.post('/universities/:universityId/reject', rejectUniversity);

export default router;