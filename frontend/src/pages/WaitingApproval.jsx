import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const fetchStatus = async () => {
  try {
    setLoading(true);

    const response = await fetch(
      `http://localhost:5000/api/university/signup-status?email=${email}`
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
};


  // Poll once on load
  useEffect(() => {
    if (email) {
      fetchStatus();
    }
  }, [email]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>University Verification</h2>

      {loading && <p>Checking approval status...</p>}

      {!loading && error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          <p><strong>Status:</strong> {status.toUpperCase()}</p>
          <p>{message}</p>

          {status === "pending" && (
            <button onClick={fetchStatus} style={{ marginTop: "10px" }}>
              Refresh Status
            </button>
          )}

          {status === "rejected" && (
            <p style={{ color: "red", marginTop: "10px" }}>
              Your university registration was rejected.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default WaitingApproval;
