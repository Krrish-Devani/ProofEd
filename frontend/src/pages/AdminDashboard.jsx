import { useEffect, useState } from "react";

function AdminDashboard() {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPendingUniversities = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                "http://localhost:5000/api/admin/pending-universities",
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
            `http://localhost:5000/api/admin/universities/${universityId}/approve`,
            {
                method: "POST",
                credentials: "include",
            }
        );
        fetchPendingUniversities();
    };

    const rejectUniversity = async (universityId) => {
        const res = await fetch(
            `http://localhost:5000/api/admin/universities/${universityId}/reject`,
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
        <div style={{ padding: "40px" }}>
            <h2>Admin Dashboard</h2>

            {loading && <p>Loading universities...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && universities.length === 0 && (
                <p>No pending universities</p>
            )}

            {!loading &&
                universities.map((uni) => (
                    <div
                        key={uni.universityId}   // ✅ FIXED
                        style={{
                            border: "1px solid #ccc",
                            padding: "10px",
                            marginBottom: "10px",
                        }}
                    >
                        <p><strong>{uni.name}</strong></p>
                        <p>{uni.email}</p>
                        <p>{uni.website}</p>
                        <p><strong>Wallet:</strong> {uni.walletAddress}</p>

                        <button
                            onClick={() => approveUniversity(uni.universityId)}  // ✅ FIXED
                        >
                            Approve
                        </button>{" "}
                        <button
                            onClick={() => rejectUniversity(uni.universityId)}   // ✅ FIXED
                        >
                            Reject
                        </button>
                    </div>
                ))}
        </div>
    );
}

export default AdminDashboard;
