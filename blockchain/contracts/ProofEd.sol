// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ProofEd {
    mapping(bytes32 => bool) public certificates;

    event CertificateIssued(bytes32 certHash, address issuer);

    function issueCertificate(bytes32 certHash) external {
        require(!certificates[certHash], "Certificate already exists");

        certificates[certHash] = true;

        emit CertificateIssued(certHash, msg.sender);
    }
}
