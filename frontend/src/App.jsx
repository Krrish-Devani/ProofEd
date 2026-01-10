import { Routes, Route, Navigate } from "react-router-dom";
import UniversitySignup from "./pages/UniversitySignup";
import VerifyEmail from "./pages/VerifyEmail";
import ConnectWallet from "./pages/ConnectWallet";
import WaitingApproval from "./pages/WaitingApproval";
import UniversityDashboard from "./pages/UniversityDashboard";
import CertificateVerification from "./pages/CertificateVerification";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/university/signup" />} />

      {/* University flow */}
      <Route path="/university/signup" element={<UniversitySignup />} />
      <Route path="/university/verify-email" element={<VerifyEmail />} />
      <Route path="/university/connect-wallet" element={<ConnectWallet />} />
      <Route path="/university/waiting-approval" element={<WaitingApproval />} />
      <Route path="/university/dashboard" element={<UniversityDashboard />} />

      {/* Admin flow */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Public verification */}
      <Route path="/cert/:txHash" element={<CertificateVerification />} />
    </Routes>
  );
}

export default App;
