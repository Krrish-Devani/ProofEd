import jwt from 'jsonwebtoken';
import { wrapAsync } from '../lib/wrapAsync.js';
import { ExpressError } from '../lib/ExpressError.js';
import University from '../models/university.model.js';
import Admin from '../models/admin.model.js';

// Middleware to authenticate university (wallet-based)
export const authenticateUniversity = wrapAsync(async (req, res, next) => {
    const token = req.cookies?.universityToken || req.headers?.authorization?.split(' ')[1];
        
    if (!token) {
        throw new ExpressError(401, 'Authentication required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
    const university = await University.findById(decoded.id);
        
    if (!university) {
            throw new ExpressError(401, 'University not found');
    }

    if (university.status !== 'approved') {
            throw new ExpressError(403, 'University not approved');
    }

    req.university = university;
    next();
});

// Middleware to authenticate admin
export const authenticateAdmin = wrapAsync(async (req, res, next) => {
    const token = req.cookies?.adminToken || req.headers?.authorization?.split(' ')[1];
        
    if (!token) {
        throw new ExpressError(401, 'Authentication required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
    const admin = await Admin.findById(decoded.id);
        
    if (!admin) {
        throw new ExpressError(401, 'Admin not found');
    }

    req.admin = admin;
    next();
});