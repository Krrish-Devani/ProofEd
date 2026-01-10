import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ProofEdABI from "../contracts/ProofEdABI.json";
import { CONTRACT_ADDRESS } from "../contracts/contractConfig";

function CertificateVerification() {
  const { txHash } = useParams();

  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null); // VALID | INVALID
  const [error, setError] = useState("");

  // ===============================
  // Recompute hash (MUST match issuance)
  // ===============================
  const recomputeHash = (cert) => {
    const normalizedMetadata = {
      studentName: cert.studentName.trim(),
      studentId: cert.studentId.trim(),
      course: cert.course.trim(),
      grade: cert.grade.trim(),
      issueDate: new Date(cert.issueDate).toISOString().split("T")[0],
    };

    return ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(normalizedMetadata))
    );
  };

  // ===============================
  // Blockchain read (read-only)
  // ===============================
  const checkOnChainCertificate = async (certHash) => {
    try {
      const provider = new ethers.JsonRpcProvider(
        "https://eth-sepolia.g.alchemy.com/v2/kNGCTtO0akTqvyPS1Rlsx"
      );

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ProofEdABI,
        provider
      );

      // assumes mapping(bytes32 => bool)
      const exists = await contract.certificates(certHash);
      return exists;
    } catch (err) {
      console.error("Blockchain read failed", err);
      return false;
    }
  };

  // ===============================
  // REAL backend fetch (NO MOCK)
  // ===============================
  const fetchCertificate = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/certificate/${txHash}`
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Certificate not found");
    }

    return data.data;
  };

  // ===============================
  // Full verification pipeline
  // ===============================
  useEffect(() => {
    const verify = async () => {
      try {
        // 1️⃣ Fetch real certificate from DB
        const cert = await fetchCertificate();
        setCertificate(cert);

        // 2️⃣ Recompute hash from metadata
        const recomputedHash = recomputeHash(cert);

        if (recomputedHash !== cert.certificateHash) {
          setVerificationStatus("INVALID");
          return;
        }

        // 3️⃣ Verify on blockchain
        const onChain = await checkOnChainCertificate(recomputedHash);

        if (!onChain) {
          setVerificationStatus("INVALID");
          return;
        }

        // 4️⃣ Final verdict
        setVerificationStatus("VALID");
      } catch (err) {
        console.error("Verification failed", err);
        setError(err.message);
        setVerificationStatus("INVALID");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [txHash]);

  // ===============================
  // UI
  // ===============================
  return (
    <div style={{ padding: "40px", maxWidth: "720px", margin: "0 auto" }}>
      <h1>Certificate Verification</h1>

      <p style={{ fontSize: "14px", color: "#666" }}>
        Transaction Hash:
        <br />
        <code style={{ fontSize: "12px" }}>{txHash}</code>
      </p>

      {loading && <p>🔍 Verifying certificate…</p>}

      {!loading && verificationStatus && (
        <div
          style={{
            marginTop: "24px",
            padding: "24px",
            borderRadius: "10px",
            border:
              verificationStatus === "VALID"
                ? "2px solid #16a34a"
                : "2px solid #dc2626",
            background:
              verificationStatus === "VALID" ? "#f0fdf4" : "#fef2f2",
          }}
        >
          <h2
            style={{
              color: verificationStatus === "VALID" ? "#16a34a" : "#dc2626",
            }}
          >
            {verificationStatus === "VALID" ? "✅ Certificate is Authentic" : "❌ Certificate is Invalid"}
          </h2>

          <p style={{ marginTop: "8px" }}>
            {verificationStatus === "VALID"
              ? "This certificate has been verified using blockchain and issuer records."
              : "This certificate failed verification checks and should not be trusted."}
          </p>
        </div>
      )}

      {/* DETAILS */}
      {!loading && certificate && (
        <div style={{ marginTop: "28px" }}>
          <h3>Certificate Details</h3>

          <p><strong>Student Name:</strong> {certificate.studentName}</p>
          <p><strong>Student ID:</strong> {certificate.studentId}</p>
          <p><strong>Student Email:</strong> {certificate.studentEmail}</p>
          <p><strong>Course:</strong> {certificate.course}</p>
          <p><strong>Grade:</strong> {certificate.grade}</p>
          <p><strong>Issue Date:</strong> {certificate.issueDate}</p>

          <p style={{ marginTop: "10px" }}>
            <strong>Issued By:</strong> {certificate.issuer}
            <span
              style={{
                marginLeft: "8px",
                padding: "2px 6px",
                fontSize: "12px",
                background: "#e0f2fe",
                color: "#0369a1",
                borderRadius: "6px",
              }}
            >
              ✔ Verified Issuer
            </span>
          </p>

          {verificationStatus === "VALID" && (
            <p style={{ marginTop: "12px" }}>
              🔗 Blockchain Proof:{" "}
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                View on Sepolia Explorer
              </a>
            </p>
          )}
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default CertificateVerification;
