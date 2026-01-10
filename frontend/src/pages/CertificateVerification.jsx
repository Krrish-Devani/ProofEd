import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

function CertificateVerification() {
  const { txHash } = useParams();

  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [hashValid, setHashValid] = useState(null); // null = not checked

  // ===============================
  // MOCK backend fetch (replace later)
  // ===============================
  const mockFetchCertificate = async (txHash) => {
    // simulate backend delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      studentName: "Rahul Sharma",
      studentId: "2021CS045",
      course: "B.Tech Computer Science",
      grade: "A",
      issueDate: "2026-01-10",
      issuer: "IIT Delhi",
      // IMPORTANT: this hash MUST match recomputed hash for success
      hash: ethers.keccak256(
        ethers.toUtf8Bytes(
          JSON.stringify({
            studentName: "Rahul Sharma",
            studentId: "2021CS045",
            course: "B.Tech Computer Science",
            grade: "A",
            issueDate: "2026-01-10",
          })
        )
      ),
    };
  };

  // ===============================
  // Recompute hash (same as issuance)
  // ===============================
  const recomputeHash = (certificate) => {
    const normalizedMetadata = {
      studentName: certificate.studentName.trim(),
      studentId: certificate.studentId.trim(),
      course: certificate.course.trim(),
      grade: certificate.grade.trim(),
      issueDate: certificate.issueDate,
    };

    const recomputedHash = ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(normalizedMetadata))
    );

    return recomputedHash;
  };

  // ===============================
  // Fetch + integrity check
  // ===============================
  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const data = await mockFetchCertificate(txHash);
        /* 
        Replace this:
        const data = await mockFetchCertificate(txHash);

        With this:
        const response = await fetch(
        `http://localhost:5000/certificate/${txHash}`
        );

        if (!response.ok) {
        throw new Error("Certificate not found");
        }

        const data = await response.json();
        */
        setCertificate(data);

        const recomputed = recomputeHash(data);

        if (recomputed === data.hash) {
          setHashValid(true);
        } else {
          setHashValid(false);
        }
      } catch (error) {
        console.error("Failed to fetch certificate", error);
        setCertificate(null);
        setHashValid(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [txHash]);

  // ===============================
  // UI
  // ===============================
  return (
    <div style={{ padding: "40px" }}>
      <h1>Certificate Verification</h1>

      <p>
        <strong>Transaction Hash:</strong>
        <br />
        <code>{txHash}</code>
      </p>

      {loading && <p>🔍 Fetching certificate details...</p>}

      {!loading && certificate && (
        <div style={{ marginTop: "20px" }}>
          <p><strong>Student Name:</strong> {certificate.studentName}</p>
          <p><strong>Student ID:</strong> {certificate.studentId}</p>
          <p><strong>Course:</strong> {certificate.course}</p>
          <p><strong>Grade:</strong> {certificate.grade}</p>
          <p><strong>Issue Date:</strong> {certificate.issueDate}</p>
          <p><strong>Issued By:</strong> {certificate.issuer}</p>

          {hashValid === true && (
            <p style={{ color: "green", marginTop: "10px" }}>
              ✅ Certificate data integrity verified
            </p>
          )}

          {hashValid === false && (
            <p style={{ color: "red", marginTop: "10px" }}>
              ❌ Certificate data has been tampered with
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default CertificateVerification;
