import { ExpressError } from '../lib/ExpressError.js';
import { wrapAsync } from '../lib/wrapAsync.js';
import University from '../models/university.model.js';

// Middleware to verify wallet address format
export const validateWalletFormat = (req, res, next) => {
    try {
        const { walletAddress } = req.body;
        
        if (!walletAddress) {
            throw new ExpressError(400, 'Wallet address is required');
        }

        // Validate Ethereum address format (0x + 40 hex characters)
        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            throw new ExpressError(400, 'Invalid wallet address format');
        }

        req.walletAddress = walletAddress.toLowerCase();
        next();
    } catch (error) {
        next(error);
    }
};

// Middleware to check if wallet is already registered
export const checkWalletExists = wrapAsync(async (req, res, next) => {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
        throw new ExpressError(400, 'Wallet address is required');
    }

    const existingUniversity = await University.findOne({ 
        walletAddress: walletAddress.toLowerCase() 
    });

    if (existingUniversity) {
        throw new ExpressError(409, 'Wallet address already registered');
    }

    next();
});

// Middleware to verify wallet matches university's registered wallet (for login)
export const validateWalletMatch = wrapAsync(async (req, res, next) => {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
        throw new ExpressError(400, 'Wallet address is required');
    }

    if (!req.university) {
        throw new ExpressError(401, 'University not authenticated');
    }

    if (req.university.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new ExpressError(403, 'Wallet address does not match registered wallet');
    }

    next();
});