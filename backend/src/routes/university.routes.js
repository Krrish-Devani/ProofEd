import express from "express";
import {
  signup,
  resendOTP,
  verifyEmail,
  connectWallet,
  getSignupStatus,
} from "../controllers/university.controller.js";

import {
  issueCertificate,
  finalizeCertificate,
} from "../controllers/certificate.controller.js";

import { validateInstitutionalEmail } from "../middleware/validateEmail.js";
import {
  validateWalletFormat,
  checkWalletExists,
} from "../middleware/validateWallet.js";

const router = express.Router();

// ===============================
// University Onboarding
// ===============================
router.post("/signup", validateInstitutionalEmail, signup);
router.post("/resend-otp", resendOTP);
router.post("/verify-email", verifyEmail);
router.post(
  "/connect-wallet",
  validateWalletFormat,
  checkWalletExists,
  connectWallet
);
router.get("/signup-status", getSignupStatus);

// ===============================
// Certificate Issuance
// ===============================

// Phase 6.2–6.3: Create certificate (off-chain, hash generated)
router.post("/issue-certificate", issueCertificate);

// Phase 6.4: Finalize after blockchain tx
router.post("/finalize-certificate", finalizeCertificate);

export default router;
