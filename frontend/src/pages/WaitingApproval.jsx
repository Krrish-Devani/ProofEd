import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

function WaitingApproval() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("pending");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Get email
    useEffect(() => {
        const savedEmail = localStorage.getItem("signupEmail");
        if (!savedEmail) {
            navigate("/university/signup");
        } else {
            setEmail(savedEmail);
        }
    }, [navigate]);

    // Fetch status from backend
    const fetchStatus = useCallback(async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API_ENDPOINTS.SIGNUP_STATUS}?email=${email}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch status");
            }

            setStatus(data.data.status);
            setMessage(data.data.message);

            if (data.data.status === "approved") {
                navigate("/university/dashboard");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [email, navigate]);

    // Poll once on load
    useEffect(() => {
        if (email) {
            fetchStatus();
        }
    }, [email, fetchStatus]);

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
                    maxWidth: "520px",
                    background: "#ffffff",
                    padding: "32px",
                    borderRadius: "16px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                    textAlign: "center",
                }}
            >
                <h2
                    style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        marginBottom: "12px",
                        color: "#111827",
                    }}
                >
                    University Verification
                </h2>

                <p
                    style={{
                        fontSize: "15px",
                        color: "#374151",
                        marginBottom: "24px",
                    }}
                >
                    Your university registration is being reviewed
                </p>

                {loading && (
                    <p style={{ color: "#4b5563" }}>
                        Checking approval status…
                    </p>
                )}

                {!loading && error && (
                    <div
                        style={{
                            padding: "12px",
                            borderRadius: "8px",
                            background: "#fef2f2",
                            color: "#991b1b",
                            fontSize: "14px",
                        }}
                    >
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* STATUS BADGE */}
                        <div
                            style={{
                                display: "inline-block",
                                padding: "8px 16px",
                                borderRadius: "999px",
                                fontSize: "14px",
                                fontWeight: "600",
                                marginBottom: "16px",
                                background:
                                    status === "approved"
                                        ? "#dcfce7"
                                        : status === "rejected"
                                            ? "#fee2e2"
                                            : "#e5e7eb",
                                color:
                                    status === "approved"
                                        ? "#166534"
                                        : status === "rejected"
                                            ? "#991b1b"
                                            : "#374151",
                            }}
                        >
                            {status.toUpperCase()}
                        </div>

                        <p
                            style={{
                                fontSize: "15px",
                                color: "#374151",
                                marginBottom: "20px",
                            }}
                        >
                            {message}
                        </p>

                        {status === "pending" && (
                            <button
                                onClick={fetchStatus}
                                style={{
                                    padding: "10px 18px",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: "#111827",
                                    color: "white",
                                    fontSize: "14px",
                                    cursor: "pointer",
                                }}
                            >
                                Refresh Status
                            </button>
                        )}

                        {status === "rejected" && (
                            <p
                                style={{
                                    marginTop: "16px",
                                    color: "#991b1b",
                                    fontSize: "14px",
                                }}
                            >
                                Your university registration was rejected.
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );

}

export default WaitingApproval;
