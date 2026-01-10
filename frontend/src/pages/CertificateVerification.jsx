import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ProofEdABI from "../contracts/ProofEdABI.json";
import { CONTRACT_ADDRESS } from "../contracts/contractConfig";

function CertificateVerification() {
  const { txHash } = useParams();

  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);

  const [hashValid, setHashValid] = useState(null);        // integrity check
  const [onChainExists, setOnChainExists] = useState(null); // blockchain check
  const [verificationStatus, setVerificationStatus] = useState(null); 
  // null | "VALID" | "INVALID"

  // ===============================
  // MOCK backend fetch (replace later)
  // ===============================
  const mockFetchCertificate = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const normalized = {
      studentName: "Jash Bohare",
      studentId: "24BCP326",
      course: "B.Tech CE",
      grade: "A+",
      issueDate: "2026-01-09",
    };

    return {
      ...normalized,
      issuer: "IIT Delhi",
      hash: ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(normalized))
      ),
    };
  };

  // ===============================
  // Recompute hash (same as issuance)
  // ===============================
  const recomputeHash = (cert) => {
    const normalizedMetadata = {
      studentName: cert.studentName.trim(),
      studentId: cert.studentId.trim(),
      course: cert.course.trim(),
      grade: cert.grade.trim(),
      issueDate: cert.issueDate,
    };

    return ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(normalizedMetadata))
    );
  };

  // ===============================
  // Read blockchain (read-only)
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

      const exists = await contract.certificates(certHash);
      return exists;
    } catch (error) {
      console.error("Blockchain read failed", error);
      return false;
    }
  };

  // ===============================
  // Final verification decision
  // ===============================
  const evaluateVerification = ({ hashValid, onChainExists, issuer }) => {
    const issuerTrusted = issuer && issuer.length > 0;

    if (hashValid && onChainExists && issuerTrusted) {
      return "VALID";
    }

    return "INVALID";
  };

  // ===============================
  // Full verification pipeline
  // ===============================
  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        const data = await mockFetchCertificate();
        setCertificate(data);

        // 1️⃣ Integrity check
        const recomputed = recomputeHash(data);
        const integrityPass = recomputed === data.hash;
        setHashValid(integrityPass);

        let chainPass = false;

        // 2️⃣ Blockchain check (only if integrity passes)
        if (integrityPass) {
          chainPass = await checkOnChainCertificate(recomputed);
          setOnChainExists(chainPass);
        } else {
          setOnChainExists(false);
        }

        // 3️⃣ Final verdict
        const status = evaluateVerification({
          hashValid: integrityPass,
          onChainExists: chainPass,
          issuer: data.issuer,
        });

        setVerificationStatus(status);
      } catch (error) {
        console.error("Verification failed", error);
        setCertificate(null);
        setHashValid(false);
        setOnChainExists(false);
        setVerificationStatus("INVALID");
      } finally {
        setLoading(false);
      }
    };

    verifyCertificate();
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
        {/* BIG RESULT */}
        <h2
          style={{
            color: verificationStatus === "VALID" ? "#16a34a" : "#dc2626",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {verificationStatus === "VALID" ? "✅" : "❌"}
          {verificationStatus === "VALID"
            ? "Certificate is Authentic"
            : "Certificate is Invalid"}
        </h2>

        <p style={{ marginTop: "6px", fontSize: "15px" }}>
          {verificationStatus === "VALID"
            ? "This certificate has been successfully verified using blockchain records."
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
        <p><strong>Course:</strong> {certificate.course}</p>
        <p><strong>Grade:</strong> {certificate.grade}</p>
        <p><strong>Issue Date:</strong> {certificate.issueDate}</p>

        {/* ISSUER */}
        <p style={{ marginTop: "10px" }}>
          <strong>Issued By:</strong> {certificate.issuer}{" "}
          <span
            style={{
              marginLeft: "6px",
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

        {/* BLOCKCHAIN LINK */}
        {verificationStatus === "VALID" && (
          <p style={{ marginTop: "12px" }}>
            🔗 Blockchain Proof:{" "}
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#2563eb" }}
            >
              View on Sepolia Explorer
            </a>
          </p>
        )}
      </div>
    )}
  </div>
);

}

export default CertificateVerification;
