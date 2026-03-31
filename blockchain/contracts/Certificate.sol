// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Certificate {
    address public admin;

    struct CertDetails {
        string studentName;
        string courseName;
        string date;
        bool isValid;
    }

    mapping(bytes32 => CertDetails) public certificates;

    event CertificateIssued(bytes32 indexed certId, string studentName, string courseName);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Access denied: Only Admin can issue certificates");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function issueCertificate(
        string memory _studentName,
        string memory _courseName,
        string memory _date
    ) public onlyAdmin returns (bytes32) {
        bytes32 certId = keccak256(abi.encodePacked(_studentName, _courseName, _date, block.timestamp));
        
        certificates[certId] = CertDetails({
            studentName: _studentName,
            courseName: _courseName,
            date: _date,
            isValid: true
        });

        emit CertificateIssued(certId, _studentName, _courseName);
        return certId;
    }

    function verifyCertificate(bytes32 _certId) public view returns (string memory, string memory, string memory, bool) {
        CertDetails memory cert = certificates[_certId];
        require(cert.isValid, "Certificate not found or invalid");
        
        return (cert.studentName, cert.courseName, cert.date, cert.isValid);
    }
}
