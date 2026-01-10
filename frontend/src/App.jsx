import { Routes, Route, Navigate } from "react-router-dom";
import UniversitySignup from "./pages/UniversitySignup";
import VerifyEmail from "./pages/VerifyEmail";
import ConnectWallet from "./pages/ConnectWallet";
import WaitingApproval from "./pages/WaitingApproval";
import UniversityDashboard from "./pages/UniversityDashboard";
import CertificateVerification from "./pages/CertificateVerification";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/university/signup" />} />

      {/* University onboarding */}
      <Route path="/university/signup" element={<UniversitySignup />} />
      <Route path="/university/verify-email" element={<VerifyEmail />} />
      <Route path="/university/connect-wallet" element={<ConnectWallet />} />
      <Route
        path="/university/waiting-approval"
        element={<WaitingApproval />}
      />

      {/* University dashboard (locked later) */}
      <Route
        path="/university/dashboard"
        element={<UniversityDashboard />}
      />

      {/* Public certificate verification */}
      <Route
        path="/cert/:txHash"
        element={<CertificateVerification />}
      />
    </Routes>
  );
}

export default App;
