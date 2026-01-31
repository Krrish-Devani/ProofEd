import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

function AdminLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                API_ENDPOINTS.ADMIN_LOGIN,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ email, password }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            navigate("/admin/dashboard");
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
                background: "#f1f5f9",
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
                    padding: "36px",
                    borderRadius: "18px",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
                    color: "#0f172a",
                }}
            >
                <h2
                    style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        marginBottom: "6px",
                    }}
                >
                    Admin Login
                </h2>

                <p
                    style={{
                        fontSize: "15px",
                        color: "#334155",
                        marginBottom: "26px",
                    }}
                >
                    Access the ProofEd administration panel.
                </p>

                <form onSubmit={handleLogin}>
                    {/* EMAIL */}
                    <div style={{ marginBottom: "18px" }}>
                        <label
                            style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#475569",
                            }}
                        >
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="admin@proofed.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "12px 14px",
                                marginTop: "6px",
                                borderRadius: "10px",
                                border: "1.5px solid #e5e7eb",
                                background: "#ffffff",
                                outline: "none",
                                fontSize: "15px",
                                color: "#0f172a",
                            }}

                        />
                    </div>

                    {/* PASSWORD */}
                    <div style={{ marginBottom: "18px" }}>
                        <label
                            style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#475569",
                            }}
                        >
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "12px 14px",
                                marginTop: "6px",
                                borderRadius: "10px",
                                border: "1.5px solid #e5e7eb",
                                background: "#ffffff",
                                outline: "none",
                                fontSize: "15px",
                                color: "#0f172a",
                            }}

                        />
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div
                            style={{
                                marginBottom: "18px",
                                padding: "12px",
                                borderRadius: "10px",
                                background: "#fee2e2",
                                color: "#7f1d1d",
                                fontSize: "14px",
                                fontWeight: "500",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "14px",
                            borderRadius: "12px",
                            border: "none",
                            background: "#020617",
                            color: "#ffffff",
                            fontSize: "15px",
                            fontWeight: "600",
                            cursor: "pointer",
                        }}
                    >
                        {loading ? "Logging in…" : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );


}

export default AdminLogin;
