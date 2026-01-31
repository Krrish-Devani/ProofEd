import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

function VerifyEmail() {
    const navigate = useNavigate();

    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Get email from localStorage
    useEffect(() => {
        const savedEmail = localStorage.getItem("signupEmail");
        if (!savedEmail) {
            // If no email, user came here wrongly
            navigate("/university/signup");
        } else {
            setEmail(savedEmail);
        }
    }, [navigate]);

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                API_ENDPOINTS.VERIFY_EMAIL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        otp,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "OTP verification failed");
            }

            // OTP verified successfully
            navigate("/university/connect-wallet");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                API_ENDPOINTS.RESEND_OTP,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to resend OTP");
            }

            alert("OTP resent successfully");
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
                background: "#f9fafb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    background: "#ffffff",
                    padding: "32px",
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                }}
            >
                <h2
                    style={{
                        fontSize: "26px",
                        marginBottom: "6px",
                        color: "#111827",
                    }}
                >
                    Verify Email
                </h2>

                <p
                    style={{
                        color: "#374151",
                        fontSize: "14px",
                        marginBottom: "24px",
                    }}
                >
                    An OTP has been sent to
                    <br />
                    <strong style={{ color: "#111827" }}>{email}</strong>
                </p>

                <form onSubmit={handleVerifyOTP}>
                    {/* OTP INPUT */}
                    <div style={{ marginBottom: "18px" }}>
                        <label
                            style={{
                                fontSize: "14px",
                                color: "#374151",
                            }}
                        >
                            Enter OTP
                        </label>

                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            placeholder="6-digit OTP"
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginTop: "6px",
                                borderRadius: "10px",
                                border: "1px solid #d1d5db",
                                background: "#ffffff",
                                color: "#111827",
                                fontSize: "14px",
                                outline: "none",
                                letterSpacing: "2px",
                                textAlign: "center",
                            }}
                        />
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div
                            style={{
                                marginBottom: "16px",
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

                    {/* VERIFY BUTTON */}
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
                        {loading ? "Verifying…" : "Verify OTP"}
                    </button>
                </form>

                {/* RESEND */}
                <div style={{ marginTop: "18px", textAlign: "center" }}>
                    <button
                        onClick={handleResendOTP}
                        disabled={loading}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#2563eb",
                            fontSize: "14px",
                            cursor: "pointer",
                        }}
                    >
                        Resend OTP
                    </button>
                </div>
            </div>
        </div>
    );

}

export default VerifyEmail;
