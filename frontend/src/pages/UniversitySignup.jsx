import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

function UniversitySignup() {
    const navigate = useNavigate();

    // form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [website, setWebsite] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                API_ENDPOINTS.UNIVERSITY_SIGNUP,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        website,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Signup failed");
            }

            // Save email for OTP verification step
            localStorage.setItem("signupEmail", email);

            // Redirect to OTP verification screen
            navigate("/university/verify-email");
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
                        fontSize: "28px",
                        fontWeight: "700",
                        marginBottom: "8px",
                        color: "#111827",
                    }}
                >
                    University Signup
                </h2>

                <p
                    style={{
                        color: "#374151",
                        fontSize: "14px",
                        marginBottom: "24px",
                    }}
                >
                    Register your institution to issue blockchain-verified certificates.
                </p>

                <form onSubmit={handleSubmit}>
                    {/* UNIVERSITY NAME */}
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                fontSize: "14px",
                                color: "#374151",
                            }}
                        >
                            University Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="e.g. IIT Delhi"
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
                            }}
                        />
                    </div>

                    {/* EMAIL */}
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                fontSize: "14px",
                                color: "#374151",
                            }}
                        >
                            Official Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@university.edu"
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
                            }}
                        />
                    </div>

                    {/* WEBSITE */}
                    <div style={{ marginBottom: "20px" }}>
                        <label
                            style={{
                                fontSize: "14px",
                                color: "#374151",
                            }}
                        >
                            Website
                        </label>

                        <input
                            type="text"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            required
                            placeholder="https://university.edu"
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

                    {/* SUBMIT */}
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
                        {loading ? "Signing up…" : "Sign Up"}
                    </button>
                </form>
            </div>
        </div>
    );

}

export default UniversitySignup;
