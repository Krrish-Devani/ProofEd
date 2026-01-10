import express from "express";
import { getCertificateByTxHash } from "../controllers/certificate.controller.js";

const router = express.Router();

router.get("/:txHash", getCertificateByTxHash);

export default router;
