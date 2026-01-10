import Certificate from "../models/certificate.model.js";
import University from "../models/university.model.js";
import { ExpressError } from "../lib/ExpressError.js";
import { wrapAsync } from "../lib/wrapAsync.js";
import { ethers } from "ethers";

/**
 * ===============================
 * PHASE 6.2 + 6.3
 * Issue certificate (OFF-CHAIN)
 * ===============================
 */
export const issueCertificate = wrapAsync(async (req, res) => {
    const {
        studentName,
        studentId,
        studentEmail,
        course,
        grade,
        issueDate,
        issuerEmail,
    } = req.body;

    if (
        !studentName ||
        !studentId ||
        !studentEmail ||
        !course ||
        !grade ||
        !issueDate ||
        !issuerEmail
    ) {
        throw new ExpressError(400, "All fields are required");
    }

    // 1️⃣ Verify issuing university
    const university = await University.findOne({
        email: issuerEmail.toLowerCase(),
        status: "approved",
    });

    if (!university) {
        throw new ExpressError(
            403,
            "University not authorized to issue certificates"
        );
    }

    // 2️⃣ Normalize metadata (CRITICAL – must match verification logic)
    const normalizedMetadata = {
        studentName: studentName.trim(),
        studentId: studentId.trim(),
        course: course.trim(),
        grade: grade.trim(),
        issueDate: new Date(issueDate).toISOString().split("T")[0],
    };


    // 3️⃣ Deterministic hash
    const certificateHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(normalizedMetadata))
    );

    // 4️⃣ Prevent duplicate issuance
    const existing = await Certificate.findOne({ certificateHash });
    if (existing) {
        throw new ExpressError(409, "Certificate already exists");
    }

    // 5️⃣ Create immutable off-chain record
    const certificate = await Certificate.create({
        studentName,
        studentId,
        studentEmail,
        course,
        grade,
        issueDate,
        universityId: university._id,
        certificateHash,
        issued: false, // locked until blockchain tx
    });

    // 6️⃣ Respond to frontend
    res.status(201).json({
        success: true,
        data: {
            certificateId: certificate._id,
            certificateHash,
        },
    });
});

/**
 * ===============================
 * PHASE 6.4
 * Finalize certificate (ON-CHAIN SYNC)
 * ===============================
 */
export const finalizeCertificate = wrapAsync(async (req, res) => {
    const { certificateId, transactionHash } = req.body;

    if (!certificateId || !transactionHash) {
        throw new ExpressError(
            400,
            "certificateId and transactionHash are required"
        );
    }

    const certificate = await Certificate.findById(certificateId);

    if (!certificate) {
        throw new ExpressError(404, "Certificate not found");
    }

    if (certificate.issued) {
        throw new ExpressError(400, "Certificate already finalized");
    }

    // ✅ Finalize issuance (ONLY allowed mutations)
    certificate.issued = true;
    certificate.issuedAt = new Date();
    certificate.transactionHash = transactionHash;
    certificate.blockchainVerified = true;

    await certificate.save();

    res.json({
        success: true,
        message: "Certificate finalized successfully",
    });
});

/**
 * ===============================
 * PHASE 7
 * Public verification fetch (NO MOCK)
 * ===============================
 */
export const getCertificateByTxHash = wrapAsync(async (req, res) => {
    console.log("✅ VERIFICATION API HIT: ", req.params.txHash)
    const { txHash } = req.params;

    const certificate = await Certificate.findOne({
        transactionHash: txHash,
        issued: true,
    }).populate("universityId", "name walletAddress");

    if (!certificate) {
        throw new ExpressError(404, "Certificate not found");
    }

    res.json({
        success: true,
        data: {
            studentName: certificate.studentName,
            studentId: certificate.studentId,
            studentEmail: certificate.studentEmail,
            course: certificate.course,
            grade: certificate.grade,
            issueDate: certificate.issueDate,
            issuer: certificate.universityId.name,
            issuerWallet: certificate.universityId.walletAddress,
            certificateHash: certificate.certificateHash,
            transactionHash: certificate.transactionHash,
            issuedAt: certificate.issuedAt,
        },
    });
});
