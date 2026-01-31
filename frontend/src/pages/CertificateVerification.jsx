import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ProofEdABI from "../contracts/ProofEdABI.json";
import { CONTRACT_ADDRESS } from "../contracts/contractConfig";
import { API_ENDPOINTS } from "../config/api";

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
      API_ENDPOINTS.GET_CERTIFICATE(txHash)
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
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "36px",
          borderRadius: "18px",
          boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
          color: "#0f172a",
        }}
      >
        <h1
          style={{
            fontSize: "30px",
            fontWeight: "700",
            marginBottom: "6px",
          }}
        >
          Certificate Verification
        </h1>

        <p
          style={{
            fontSize: "15px",
            color: "#334155",
            marginBottom: "26px",
          }}
        >
          Verify the authenticity of an academic certificate using blockchain records.
        </p>

        <div
          style={{
            padding: "14px",
            background: "#e5e7eb",
            borderRadius: "12px",
            fontSize: "13px",
            wordBreak: "break-all",
            color: "#1e293b",
            border: "1px solid #cbd5f5",
          }}
        >
          <strong>Transaction Hash</strong>
          <br />
          <code style={{ fontSize: "12px" }}>{txHash}</code>
        </div>

        {loading && (
          <p
            style={{
              marginTop: "22px",
              fontSize: "15px",
              fontWeight: "500",
              color: "#334155",
            }}
          >
            🔍 Verifying certificate…
          </p>
        )}

        {!loading && verificationStatus && (
          <div
            style={{
              marginTop: "30px",
              padding: "26px",
              borderRadius: "16px",
              border:
                verificationStatus === "VALID"
                  ? "2px solid #16a34a"
                  : "2px solid #dc2626",
              background:
                verificationStatus === "VALID"
                  ? "#ecfdf5"
                  : "#fef2f2",
            }}
          >
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color:
                  verificationStatus === "VALID"
                    ? "#15803d"
                    : "#b91c1c",
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

            <p
              style={{
                marginTop: "10px",
                fontSize: "15px",
                color: "#1e293b",
              }}
            >
              {verificationStatus === "VALID"
                ? "This certificate has been verified using blockchain and issuer records."
                : "This certificate failed verification checks and should not be trusted."}
            </p>
          </div>
        )}

        {!loading && certificate && (
          <div style={{ marginTop: "34px" }}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "16px",
              }}
            >
              Certificate Details
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px 22px",
                fontSize: "15px",
              }}
            >
              <p>
                <span style={{ color: "#475569", fontWeight: "500" }}>Student Name:</span>{" "}
                <span style={{ color: "#020617", fontWeight: "600" }}>
                  {certificate.studentName}
                </span>
              </p>

              <p>
                <span style={{ color: "#475569", fontWeight: "500" }}>Student ID:</span>{" "}
                <span style={{ color: "#020617", fontWeight: "600" }}>
                  {certificate.studentId}
                </span>
              </p>

              <p>
                <span style={{ color: "#475569", fontWeight: "500" }}>Email:</span>{" "}
                <span style={{ color: "#020617", fontWeight: "600" }}>
                  {certificate.studentEmail}
                </span>
              </p>

              <p>
                <span style={{ color: "#475569", fontWeight: "500" }}>Course:</span>{" "}
                <span style={{ color: "#020617", fontWeight: "600" }}>
                  {certificate.course}
                </span>
              </p>

              <p>
                <span style={{ color: "#475569", fontWeight: "500" }}>Grade:</span>{" "}
                <span style={{ color: "#020617", fontWeight: "600" }}>
                  {certificate.grade}
                </span>
              </p>

              <p>
                <span style={{ color: "#475569", fontWeight: "500" }}>Issue Date:</span>{" "}
                <span style={{ color: "#020617", fontWeight: "600" }}>
                  {new Date(certificate.issueDate).toLocaleDateString()}
                </span>
              </p>
            </div>


            <div style={{ marginTop: "18px", fontSize: "15px" }}>
              <strong>Issued By:</strong>{" "}
              <span style={{ fontWeight: "600" }}>{certificate.issuer}</span>
              <span
                style={{
                  marginLeft: "10px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  borderRadius: "999px",
                  fontWeight: "600",
                }}
              >
                ✔ Verified Issuer
              </span>
            </div>

            {verificationStatus === "VALID" && (
              <div
                style={{
                  marginTop: "18px",
                  fontSize: "15px",
                  fontWeight: "500",
                }}
              >
                🔗 Blockchain Proof:{" "}
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "#1d4ed8",
                    fontWeight: "600",
                    textDecoration: "underline",
                  }}
                >
                  View on Sepolia Explorer
                </a>
              </div>
            )}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "22px",
              padding: "14px",
              background: "#fee2e2",
              color: "#7f1d1d",
              borderRadius: "12px",
              fontWeight: "500",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );


}

export default CertificateVerification;
