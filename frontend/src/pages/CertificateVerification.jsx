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
    <div style={{ padding: "40px", maxWidth: "700px" }}>
      <h1>Certificate Verification</h1>

      <p>
        <strong>Transaction Hash:</strong>
        <br />
        <code>{txHash}</code>
      </p>

      {loading && <p>🔍 Verifying certificate…</p>}

      {!loading && certificate && (
        <div style={{ marginTop: "20px" }}>
          <p><strong>Student Name:</strong> {certificate.studentName}</p>
          <p><strong>Student ID:</strong> {certificate.studentId}</p>
          <p><strong>Course:</strong> {certificate.course}</p>
          <p><strong>Grade:</strong> {certificate.grade}</p>
          <p><strong>Issue Date:</strong> {certificate.issueDate}</p>
          <p><strong>Issued By:</strong> {certificate.issuer}</p>

          {hashValid === true && (
            <p style={{ color: "green", marginTop: "12px" }}>
              ✅ Certificate data integrity verified
            </p>
          )}

          {hashValid === false && (
            <p style={{ color: "red", marginTop: "12px" }}>
              ❌ Certificate data has been tampered with
            </p>
          )}

          {hashValid === true && onChainExists === true && (
            <p style={{ color: "green" }}>
              ⛓️ Certificate hash found on blockchain
            </p>
          )}

          {hashValid === true && onChainExists === false && (
            <p style={{ color: "red" }}>
              ❌ Certificate hash NOT found on blockchain
            </p>
          )}

          {/* FINAL VERDICT */}
          {verificationStatus === "VALID" && (
            <div
              style={{
                marginTop: "30px",
                padding: "20px",
                border: "2px solid green",
                borderRadius: "8px",
              }}
            >
              <h2 style={{ color: "green" }}>✅ CERTIFICATE VALID</h2>
              <p>This certificate is authentic and verified.</p>
            </div>
          )}

          {verificationStatus === "INVALID" && (
            <div
              style={{
                marginTop: "30px",
                padding: "20px",
                border: "2px solid red",
                borderRadius: "8px",
              }}
            >
              <h2 style={{ color: "red" }}>❌ CERTIFICATE INVALID</h2>
              <p>This certificate failed verification checks.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CertificateVerification;
