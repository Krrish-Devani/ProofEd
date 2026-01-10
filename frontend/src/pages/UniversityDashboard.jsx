import { useState } from "react";
import { ethers } from "ethers";
import ProofEdABI from "../contracts/ProofEdABI.json";
import { CONTRACT_ADDRESS } from "../contracts/contractConfig";
import { QRCodeCanvas } from "qrcode.react";

function UniversityDashboard() {
    // ===============================
    // Wallet & verification state
    // ===============================
    const [walletAddress, setWalletAddress] = useState("");
    const [isVerified, setIsVerified] = useState(null); // null = not checked
    const [loading, setLoading] = useState(false);
    const [universityName, setUniversityName] = useState("");

    // ===============================
    // Certificate form state
    // ===============================
    const [studentName, setStudentName] = useState("");
    const [studentId, setStudentId] = useState("");
    const [course, setCourse] = useState("");
    const [grade, setGrade] = useState("");
    const [issueDate, setIssueDate] = useState("");

    // ===============================
    // Certificate result state (Phase 4)
    // ===============================
    const [certificateId, setCertificateId] = useState("");
    const [certificateHash, setCertificateHash] = useState("");

    const [isIssued, setIsIssued] = useState(false);
    const [txHash, setTxHash] = useState("");


    // ===============================
    // MOCK: University verification
    // ===============================
    const checkUniversityVerification = async (wallet) => {
        setLoading(true);

        // simulate backend delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // replace with YOUR MetaMask address for testing
        const VERIFIED_WALLET =
            "0xc57ab1cef012cc669c89ca4efd929b807bd15a4c";

        if (wallet.toLowerCase() === VERIFIED_WALLET.toLowerCase()) {
            setIsVerified(true);
            setUniversityName("IIT Delhi");
        } else {
            setIsVerified(false);
            setUniversityName("");
        }

        setLoading(false);
    };

    // Replace mock function with this one when backend is ready
    /*
    const checkUniversityVerification = async (wallet) => {
    try {
        setLoading(true);

        const response = await fetch(
        `http://localhost:5000/university/me?wallet=${wallet}` // URL will change based on backend port
        );

        if (!response.ok) {
        throw new Error("Failed to fetch verification status");
        }

        const data = await response.json();

        if (data.verified) {
        setIsVerified(true);
        setUniversityName(data.universityName);
        } else {
        setIsVerified(false);
        }
    } catch (error) {
        console.error(error);
        setIsVerified(false);
    } finally {
        setLoading(false);
    }
    };
    */


    // ===============================
    // Connect MetaMask wallet
    // ===============================
    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                alert("MetaMask is not installed");
                return;
            }

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            const wallet = accounts[0];
            setWalletAddress(wallet);

            // Check verification status
            checkUniversityVerification(wallet);
        } catch (error) {
            console.error(error);
            alert("Wallet connection failed");
        }
    };


    // ===============================
    // MOCK Backend: store + hash certificate
    // ===============================
    const mockIssueCertificateAPI = async (metadata) => {
        // simulate backend delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // normalize metadata (VERY IMPORTANT)
        const normalizedMetadata = {
            studentName: metadata.studentName.trim(),
            studentId: metadata.studentId.trim(),
            course: metadata.course.trim(),
            grade: metadata.grade.trim(),
            issueDate: metadata.issueDate,
        };

        // deterministic hash
        const hash = ethers.keccak256(
            ethers.toUtf8Bytes(JSON.stringify(normalizedMetadata))
        );

        return {
            certificateId: "cert_" + Date.now(),
            hash,
        };
    };

    // Replace MockIssueCertificate function and add this
    /*
    const response = await fetch("http://localhost:5000/issue-certificate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(certificateData),
    });
    
    const data = await response.json();
    
    setCertificateId(data.certificateId);
    setCertificateHash(data.hash);
    */

    const issueCertificateOnChain = async (hash) => {
        if (!window.ethereum) {
            alert("MetaMask not installed");
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            ProofEdABI,
            signer
        );

        const tx = await contract.issueCertificate(hash);
        await tx.wait();

        return tx.hash;
    };

    const mockFinalizeCertificateAPI = async (certificateId, txHash) => {
        // simulate backend delay
        await new Promise((resolve) => setTimeout(resolve, 600));

        console.log("Backend sync:", {
            certificateId,
            txHash,
            status: "issued",
        });

        return {
            success: true,
        };
    };

    // Delete mockFinalizeCertificateAPI and add this when backend is ready
    /* 
    await fetch("http://localhost:5000/finalize-certificate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        certificateId,
        txHash,
    }),
    });
    */



    // ===============================
    // Handle certificate issuance (Phase 4)
    // ===============================
    const handleIssueCertificate = async (e) => {
        e.preventDefault();

        const certificateData = {
            studentName,
            studentId,
            course,
            grade,
            issueDate,
        };

        try {
            // Store metadata + hash (mock backend)
            const response = await mockIssueCertificateAPI(certificateData);
            setCertificateId(response.certificateId);
            setCertificateHash(response.hash);

            // Write hash to blockchain
            const txHash = await issueCertificateOnChain(response.hash);
            setTxHash(txHash);
            console.log("Blockchain Tx Hash:", txHash);

            // Finalize certificate (mock backend sync)
            await mockFinalizeCertificateAPI(response.certificateId, txHash);
            setIsIssued(true);
        } catch (error) {
            console.error("Issuance Failed", error);
        }
    };

    // Replace this function when backend is ready
    /*
    const handleIssueCertificate = async (e) => {
      e.preventDefault();
    
      const certificateData = {
        studentName,
        studentId,
        course,
        grade,
        issueDate,
      };
    
      try {
        const response = await fetch("http://localhost:5000/issue-certificate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(certificateData),
        });
    
        const data = await response.json();
    
        console.log("Backend Response:", data);
      } catch (error) {
        console.error("Failed to issue certificate", error);
      }
    };
    */

    const verificationURL =
        `https://concha-interangular-wamblingly.ngrok-free.dev/cert/${txHash}`;



    // ===============================
    // UI
    // ===============================
    return (
        <div style={{ padding: "40px" }}>
            <h1>University Dashboard</h1>

            {/* STEP 1: Wallet not connected */}
            {!walletAddress && (
                <button onClick={connectWallet}>Connect Wallet</button>
            )}

            {/* STEP 2: Checking verification */}
            {walletAddress && loading && (
                <p>🔍 Checking university verification...</p>
            )}

            {/* STEP 3: Wallet connected but NOT verified */}
            {walletAddress && !loading && isVerified === false && (
                <div>
                    <p>Connected Wallet: {walletAddress}</p>
                    <p>⏳ Waiting for admin approval</p>
                </div>
            )}

            {/* STEP 4: Wallet connected and VERIFIED */}
            {walletAddress && !loading && isVerified === true && (
                <div>
                    <p>✅ Verified University: {universityName}</p>
                    <p>Connected Wallet: {walletAddress}</p>

                    <h2 style={{ marginTop: "20px" }}>Issue Certificate</h2>

                    <form onSubmit={handleIssueCertificate}>
                        <div>
                            <label>Student Name</label>
                            <br />
                            <input
                                type="text"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label>Student Roll / ID</label>
                            <br />
                            <input
                                type="text"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label>Course</label>
                            <br />
                            <input
                                type="text"
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label>Grade</label>
                            <br />
                            <input
                                type="text"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label>Issue Date</label>
                            <br />
                            <input
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" style={{ marginTop: "10px" }}>
                            Issue Certificate
                        </button>
                    </form>

                    {/* Phase 4 Result */}
                    {certificateHash && (
                        <div style={{ marginTop: "20px" }}>
                            <p>
                                <strong>Certificate ID:</strong> {certificateId}
                            </p>
                            <p>
                                <strong>Certificate Hash:</strong>
                            </p>
                            <code>{certificateHash}</code>
                        </div>
                    )}

                    {/* Phase 6 Result */}
                    {isIssued && (
                        <p style={{ marginTop: "10px", color: "green" }}>
                            ✅ Certificate finalized and issued
                        </p>
                    )}

                    {isIssued && txHash && (
                        <div style={{ marginTop: "20px" }}>
                            <h3>Certificate QR Code</h3>

                            <QRCodeCanvas
                                value={verificationURL}
                                size={200}
                                level="H"
                                includeMargin={true}
                            />

                            <p style={{ marginTop: "10px" }}>
                                Verification URL:
                                <br />
                                <a href={verificationURL} target="_blank" rel="noreferrer">
                                    {verificationURL}
                                </a>
                            </p>

                            <button
                                style={{ marginTop: "10px" }}
                                onClick={() => {
                                    const canvas = document.querySelector("canvas");
                                    const image = canvas.toDataURL("image/png");
                                    const link = document.createElement("a");
                                    link.href = image;
                                    link.download = "certificate-qr.png";
                                    link.click();
                                }}
                            >
                                Download QR Code
                            </button>
                        </div>
                    )}


                </div>
            )}
        </div>
    );
}

export default UniversityDashboard;
