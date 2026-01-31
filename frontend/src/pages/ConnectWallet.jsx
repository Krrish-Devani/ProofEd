import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

function ConnectWallet() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [wallet, setWallet] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Get email from localStorage
    useEffect(() => {
        const savedEmail = localStorage.getItem("signupEmail");
        if (!savedEmail) {
            navigate("/university/signup");
        } else {
            setEmail(savedEmail);
        }
    }, [navigate]);

    const connectWallet = async () => {
        setError("");

        if (!window.ethereum) {
            setError("MetaMask not detected");
            return;
        }

        try {
            setLoading(true);

            // 1️⃣ Request wallet
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            const walletAddress = accounts[0];
            setWallet(walletAddress);

            // 2️⃣ Send wallet to backend
            const response = await fetch(
                API_ENDPOINTS.CONNECT_WALLET,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        walletAddress,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Wallet connection failed");
            }

            // 3️⃣ Success → waiting screen
            navigate("/university/waiting-approval");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f9fafb",
                padding: "20px",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "460px",
                    background: "#ffffff",
                    padding: "32px",
                    borderRadius: "16px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                }}
            >
                <h2
                    style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        marginBottom: "6px",
                        color: "#111827", 
                    }}
                >
                    Connect Wallet
                </h2>


                <p style={{ color: "#555", marginBottom: "24px" }}>
                    Link your university wallet for certificate issuance
                </p>

                {/* Email */}
                <div style={{ marginBottom: "18px" }}>
                    <p style={{ fontSize: "14px", color: "#444", marginBottom: "6px" }}>
                        Verified Email
                    </p>
                    <div
                        style={{
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: "1.5px solid #e5e7eb",
                            background: "#f9fafb",
                            fontSize: "14px",
                            color: "#0f172a",
                            wordBreak: "break-all",
                        }}
                    >
                        {email}
                    </div>
                </div>

                {/* Wallet */}
                {wallet && (
                    <div style={{ marginBottom: "18px" }}>
                        <p style={{ fontSize: "14px", color: "#444", marginBottom: "6px" }}>
                            Connected Wallet
                        </p>
                        <div
                            style={{
                                padding: "12px 14px",
                                borderRadius: "10px",
                                border: "1.5px solid #e5e7eb",
                                background: "#f9fafb",
                                fontSize: "13px",
                                color: "#0f172a",
                                fontFamily: "monospace",
                                wordBreak: "break-all",
                            }}
                        >
                            {wallet}
                        </div>
                    </div>
                )}

                {error && (
                    <div
                        style={{
                            marginBottom: "16px",
                            padding: "10px",
                            borderRadius: "8px",
                            background: "#fef2f2",
                            color: "#991b1b",
                            fontSize: "14px",
                        }}
                    >
                        {error}
                    </div>
                )}

                <button
                    onClick={connectWallet}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "none",
                        background: "#111827",
                        color: "white",
                        fontSize: "15px",
                        cursor: "pointer",
                    }}
                >
                    {loading ? "Connecting…" : "Connect MetaMask"}
                </button>

                <p
                    style={{
                        marginTop: "18px",
                        fontSize: "13px",
                        color: "#6b7280",
                        lineHeight: "1.5",
                    }}
                >
                    ⚠️ This wallet will be permanently linked to your university and
                    cannot be changed later.
                </p>
            </div>
        </div>
    );

}

export default ConnectWallet;
