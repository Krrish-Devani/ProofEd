import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../config/api";

function AdminDashboard() {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPendingUniversities = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                API_ENDPOINTS.PENDING_UNIVERSITIES,
                {
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch");
            }

            setUniversities(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const approveUniversity = async (universityId) => {
        await fetch(
            API_ENDPOINTS.APPROVE_UNIVERSITY(universityId),
            {
                method: "POST",
                credentials: "include",
            }
        );
        fetchPendingUniversities();
    };

    const rejectUniversity = async (universityId) => {
        const res = await fetch(
            API_ENDPOINTS.REJECT_UNIVERSITY(universityId),
            {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: "Rejected by admin" })
            }
        );

        const data = await res.json();

        if (!res.ok) {
            alert(data.message);
            return;
        }

        fetchPendingUniversities();
    };


    useEffect(() => {
        fetchPendingUniversities();
    }, []);

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
                    maxWidth: "900px",
                    margin: "0 auto",
                    background: "#ffffff",
                    padding: "36px",
                    borderRadius: "18px",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
                    color: "#0f172a",
                }}
            >
                <h2
                    style={{
                        fontSize: "30px",
                        fontWeight: "700",
                        marginBottom: "6px",
                    }}
                >
                    Admin Dashboard
                </h2>

                <p
                    style={{
                        fontSize: "15px",
                        color: "#334155",
                        marginBottom: "26px",
                    }}
                >
                    Review and approve verified universities before they can issue certificates.
                </p>

                {loading && (
                    <p style={{ fontSize: "15px", fontWeight: "500", color: "#334155" }}>
                        Loading universities…
                    </p>
                )}

                {error && (
                    <div
                        style={{
                            padding: "14px",
                            marginBottom: "22px",
                            background: "#fee2e2",
                            color: "#7f1d1d",
                            borderRadius: "12px",
                            fontWeight: "500",
                        }}
                    >
                        {error}
                    </div>
                )}

                {!loading && universities.length === 0 && (
                    <div
                        style={{
                            padding: "24px",
                            background: "#f8fafc",
                            borderRadius: "14px",
                            color: "#475569",
                            fontSize: "15px",
                        }}
                    >
                        No pending universities.
                    </div>
                )}

                {!loading &&
                    universities.map((uni) => (
                        <div
                            key={uni.universityId}
                            style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: "16px",
                                padding: "22px",
                                marginBottom: "18px",
                                background: "#ffffff",
                            }}
                        >
                            <div style={{ marginBottom: "14px" }}>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: "18px",
                                        fontWeight: "700",
                                    }}
                                >
                                    {uni.name}
                                </h3>

                                <p
                                    style={{
                                        margin: "6px 0",
                                        color: "#334155",
                                        fontSize: "15px",
                                    }}
                                >
                                    {uni.email}
                                </p>

                                <p
                                    style={{
                                        margin: "6px 0",
                                        color: "#334155",
                                        fontSize: "15px",
                                    }}
                                >
                                    {uni.website}
                                </p>

                                <p style={{ marginTop: "10px", fontSize: "14px" }}>
                                    <span style={{ color: "#475569", fontWeight: "500" }}>
                                        Wallet:
                                    </span>{" "}
                                    <span
                                        style={{
                                            fontFamily: "monospace",
                                            fontWeight: "600",
                                            color: "#020617",
                                        }}
                                    >
                                        {uni.walletAddress}
                                    </span>
                                </p>
                            </div>

                            <div style={{ display: "flex", gap: "12px" }}>
                                <button
                                    onClick={() => approveUniversity(uni.universityId)}
                                    style={{
                                        padding: "10px 18px",
                                        borderRadius: "10px",
                                        border: "none",
                                        background: "#16a34a",
                                        color: "#ffffff",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                    }}
                                >
                                    Approve
                                </button>

                                <button
                                    onClick={() => rejectUniversity(uni.universityId)}
                                    style={{
                                        padding: "10px 18px",
                                        borderRadius: "10px",
                                        border: "2px solid #dc2626",
                                        background: "#ffffff",
                                        color: "#dc2626",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                    }}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );


}

export default AdminDashboard;
