import { ExpressError } from '../lib/ExpressError.js';

// Valid institutional email domains
const INSTITUTIONAL_DOMAINS = [
    '.edu',
    '.ac.in',
    '.edu.in',
    '.ac.uk',
    '.edu.au',
    '.ac.za',
    '.edu.sg',
    '.ac.nz'
];

// Middleware to validate institutional email domain
export const validateInstitutionalEmail = (req, res, next) => {
    const { email } = req.body;
        
    if (!email) {
        throw new ExpressError(400, 'Email is required');
    }

    const emailDomain = email.toLowerCase().split('@')[1];
        
    if (!emailDomain) {
        throw new ExpressError(400, 'Invalid email format');
    }

        // Check if email domain contains any institutional domain
    const isInstitutional = INSTITUTIONAL_DOMAINS.some(domain => 
        emailDomain.endsWith(domain)
    );

    if (!isInstitutional) {
        throw new ExpressError(400, 'Email must be from an institutional domain (.edu, .ac.in, etc.)');
    }

    req.emailDomain = emailDomain;
    next();

};