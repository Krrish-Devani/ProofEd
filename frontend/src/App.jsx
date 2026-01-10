import { Routes, Route } from "react-router-dom";
import UniversityDashboard from "./pages/UniversityDashboard";
import CertificateVerification from "./pages/CertificateVerification";

function App() {
  return (
    <Routes>
      <Route path="/" element={<UniversityDashboard />} />
      <Route path="/cert/:txHash" element={<CertificateVerification />} />
    </Routes>
  );
}

export default App;
