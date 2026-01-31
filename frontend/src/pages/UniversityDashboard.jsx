import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { QRCodeCanvas } from "qrcode.react";

import ProofEdABI from "../contracts/ProofEdABI.json";
import { CONTRACT_ADDRESS } from "../contracts/contractConfig";
import { API_ENDPOINTS } from "../config/api";

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
                `${API_ENDPOINTS.SIGNUP_STATUS}?email=${email}`,
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
            API_ENDPOINTS.ISSUE_CERTIFICATE,
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
            API_ENDPOINTS.FINALIZE_CERTIFICATE,
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
        <div
            style={{
                minHeight: "100vh",
                background: "#f9fafb",
                padding: "40px 20px",
            }}
        >
            <div
                style={{
                    maxWidth: "900px",
                    margin: "0 auto",
                }}
            >
                {/* PAGE TITLE */}
                <h1
                    style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        marginBottom: "28px",
                        color: "#111827",
                    }}
                >
                    University Dashboard
                </h1>

                {/* WALLET CARD */}
                <div
                    style={{
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "16px",
                        padding: "24px",
                        marginBottom: "28px",
                    }}
                >
                    {!walletAddress ? (
                        <>
                            <p
                                style={{
                                    color: "#374151",
                                    marginBottom: "16px",
                                    fontSize: "14px",
                                }}
                            >
                                Connect your verified wallet to issue blockchain-backed
                                certificates.
                            </p>

                            <button
                                onClick={connectWallet}
                                style={{
                                    padding: "12px 18px",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: "#111827",
                                    color: "white",
                                    fontSize: "14px",
                                    cursor: "pointer",
                                }}
                            >
                                Connect Wallet
                            </button>
                        </>
                    ) : (
                        <p
                            style={{
                                fontSize: "14px",
                                color: "#374151",
                            }}
                        >
                            <strong>Connected Wallet:</strong>{" "}
                            <span
                                style={{
                                    fontFamily: "monospace",
                                    background: "#f3f4f6",
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                }}
                            >
                                {walletAddress}
                            </span>
                        </p>
                    )}
                </div>

                {/* ISSUE CERTIFICATE CARD */}
                {walletAddress && (
                    <div
                        style={{
                            background: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "16px",
                            padding: "28px",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "22px",
                                marginBottom: "22px",
                                color: "#111827",
                            }}
                        >
                            Issue Certificate
                        </h2>

                        <form onSubmit={handleIssueCertificate}>
                            {[
                                { placeholder: "Student Name", value: studentName, setter: setStudentName },
                                { placeholder: "Student ID", value: studentId, setter: setStudentId },
                                { placeholder: "Student Email", value: studentEmail, setter: setStudentEmail, type: "email" },
                                { placeholder: "Course", value: course, setter: setCourse },
                                { placeholder: "Grade", value: grade, setter: setGrade },
                            ].map((field, idx) => (
                                <input
                                    key={idx}
                                    type={field.type || "text"}
                                    placeholder={field.placeholder}
                                    value={field.value}
                                    onChange={(e) => field.setter(e.target.value)}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        marginBottom: "14px",
                                        borderRadius: "10px",
                                        border: "1px solid #d1d5db",
                                        background: "#ffffff",
                                        color: "#111827",
                                        fontSize: "14px",
                                        outline: "none",
                                    }}
                                />
                            ))}

                            <input
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    marginBottom: "20px",
                                    borderRadius: "10px",
                                    border: "1px solid #d1d5db",
                                    background: "#ffffff",
                                    color: "#111827",
                                    fontSize: "14px",
                                }}
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "14px",
                                    borderRadius: "12px",
                                    border: "none",
                                    background: "#111827",
                                    color: "white",
                                    fontSize: "15px",
                                    cursor: "pointer",
                                }}
                            >
                                {loading ? "Issuing…" : "Issue Certificate"}
                            </button>
                        </form>

                        {error && (
                            <div
                                style={{
                                    marginTop: "16px",
                                    padding: "12px",
                                    borderRadius: "10px",
                                    background: "#fef2f2",
                                    color: "#991b1b",
                                    fontSize: "14px",
                                }}
                            >
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {/* SUCCESS + QR */}
                {issued && (
                    <div
                        style={{
                            marginTop: "36px",
                            background: "#f0fdf4",
                            border: "1px solid #bbf7d0",
                            borderRadius: "16px",
                            padding: "26px",
                        }}
                    >
                        <h3
                            style={{
                                color: "#166534",
                                marginBottom: "12px",
                                fontSize: "18px",
                            }}
                        >
                            ✅ Certificate Issued Successfully
                        </h3>

                        <p style={{ fontSize: "14px", color: "#374151" }}>
                            <strong>Certificate ID:</strong> {certificateId}
                        </p>

                        <p style={{ marginTop: "12px", fontSize: "14px", color: "#374151" }}>
                            <strong>Blockchain Transaction</strong>
                        </p>

                        <code
                            style={{
                                display: "block",
                                marginTop: "6px",
                                fontSize: "13px",
                                background: "#ecfdf5",
                                padding: "10px",
                                borderRadius: "8px",
                                color: "#065f46",          // 🔥 darker green text
                                fontFamily: "monospace",
                            }}
                        >
                            {txHash}
                        </code>



                        <h4
                            style={{
                                marginTop: "22px",
                                marginBottom: "10px",
                                color: "#111827",
                            }}
                        >
                            Verification QR Code
                        </h4>

                        <QRCodeCanvas
                            value={verificationURL}
                            size={220}
                            level="H"
                            includeMargin
                        />

                        <p style={{ marginTop: "12px", fontSize: "13px" }}>
                            <a
                                href={verificationURL}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#2563eb" }}
                            >
                                {verificationURL}
                            </a>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );



}

export default UniversityDashboard;
