import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { QRCodeCanvas } from "qrcode.react";

import ProofEdABI from "../contracts/ProofEdABI.json";
import { CONTRACT_ADDRESS } from "../contracts/contractConfig";

function UniversityDashboard() {
  const navigate = useNavigate();

  // ===============================
  // Access control
  // ===============================
  const [authChecked, setAuthChecked] = useState(false);

  // ===============================
  // Wallet
  // ===============================
  const [walletAddress, setWalletAddress] = useState("");

  // ===============================
  // Certificate form
  // ===============================
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [course, setCourse] = useState("");
  const [grade, setGrade] = useState("");
  const [issueDate, setIssueDate] = useState("");

  // ===============================
  // Result state
  // ===============================
  const [certificateId, setCertificateId] = useState("");
  const [certificateHash, setCertificateHash] = useState("");
  const [txHash, setTxHash] = useState("");
  const [issued, setIssued] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===============================
  // PHASE 6.1 — Access Guard
  // ===============================
  useEffect(() => {
    const checkAccess = async () => {
      const email = localStorage.getItem("signupEmail");

      if (!email) {
        navigate("/university/signup");
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/university/signup-status?email=${email}`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (!res.ok || data.data.status !== "approved") {
        navigate("/university/waiting-approval");
        return;
      }

      setAuthChecked(true);
    };

    checkAccess();
  }, [navigate]);

  if (!authChecked) {
    return <p style={{ padding: "40px" }}>Checking dashboard access…</p>;
  }

  // ===============================
  // Wallet connect
  // ===============================
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setWalletAddress(accounts[0]);
  };

  // ===============================
  // Backend — Create certificate (6.2–6.3)
  // ===============================
  const issueCertificateBackend = async (metadata) => {
    const issuerEmail = localStorage.getItem("signupEmail");

    const res = await fetch(
      "http://localhost:5000/api/university/issue-certificate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...metadata,
          issuerEmail,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Certificate creation failed");
    }

    return data.data; // { certificateId, certificateHash }
  };

  // ===============================
  // Blockchain write (6.4)
  // ===============================
  const issueCertificateOnChain = async (hash) => {
    if (!window.ethereum) {
      throw new Error("MetaMask not installed");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ProofEdABI,
      signer
    );

    const tx = await contract.issueCertificate(hash);
    await tx.wait();

    return tx.hash;
  };

  // ===============================
  // Backend finalize (6.4)
  // ===============================
  const finalizeCertificateBackend = async (certificateId, transactionHash) => {
    const res = await fetch(
      "http://localhost:5000/api/university/finalize-certificate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          certificateId,
          transactionHash,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Finalization failed");
    }
  };

  // ===============================
  // FULL ISSUE FLOW (END-TO-END)
  // ===============================
  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Off-chain create
      const payload = {
        studentName,
        studentId,
        studentEmail,
        course,
        grade,
        issueDate,
      };

      const res = await issueCertificateBackend(payload);
      setCertificateId(res.certificateId);
      setCertificateHash(res.certificateHash);

      // 2️⃣ On-chain write
      const tx = await issueCertificateOnChain(res.certificateHash);
      setTxHash(tx);

      // 3️⃣ Backend finalize
      await finalizeCertificateBackend(res.certificateId, tx);

      setIssued(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verificationURL = `${window.location.origin}/cert/${txHash}`;

  // ===============================
  // UI
  // ===============================
  return (
    <div style={{ padding: "40px", maxWidth: "540px" }}>
      <h1>University Dashboard</h1>

      {!walletAddress && (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}

      {walletAddress && (
        <>
          <p><strong>Connected Wallet:</strong> {walletAddress}</p>

          <h2>Issue Certificate</h2>

          <form onSubmit={handleIssueCertificate}>
            <input
              placeholder="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
            /><br />

            <input
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            /><br />

            <input
              type="email"
              placeholder="Student Email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              required
            /><br />

            <input
              placeholder="Course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
            /><br />

            <input
              placeholder="Grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
            /><br />

            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              required
            /><br />

            <button type="submit" disabled={loading}>
              {loading ? "Issuing…" : "Issue Certificate"}
            </button>
          </form>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      )}

      {issued && (
        <div style={{ marginTop: "30px" }}>
          <p style={{ color: "green", fontSize: "16px" }}>
            ✅ Certificate Issued Successfully
          </p>

          <p><strong>Certificate ID:</strong> {certificateId}</p>

          <p><strong>Blockchain Transaction:</strong></p>
          <code>{txHash}</code>

          <h3 style={{ marginTop: "20px" }}>Verification QR Code</h3>

          <QRCodeCanvas
            value={verificationURL}
            size={220}
            level="H"
            includeMargin={true}
          />

          <p style={{ marginTop: "10px" }}>
            <a href={verificationURL} target="_blank" rel="noreferrer">
              {verificationURL}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default UniversityDashboard;
