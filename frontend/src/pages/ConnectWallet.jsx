import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
        "http://localhost:5000/api/university/connect-wallet",
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
    <div style={{ padding: "40px", maxWidth: "500px", margin: "auto" }}>
      <h2>Connect Wallet</h2>

      <p>
        Email verified for:
        <br />
        <strong>{email}</strong>
      </p>

      {wallet && (
        <p>
          Connected Wallet:
          <br />
          <strong>{wallet}</strong>
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={connectWallet} disabled={loading}>
        {loading ? "Connecting..." : "Connect MetaMask"}
      </button>

      <p style={{ marginTop: "20px", fontSize: "14px", color: "#555" }}>
        ⚠️ Wallet can be connected only once and cannot be changed later.
      </p>
    </div>
  );
}

export default ConnectWallet;
