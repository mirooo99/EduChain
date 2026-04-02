// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Certificate {
    mapping(address => bool) public isAdmin;

    struct CertDetails {
        string studentName;
        string courseName;
        string date;
        bool isValid;
    }

    mapping(bytes32 => CertDetails) public certificates;

    event CertificateIssued(bytes32 indexed certId, string studentName, string courseName);
    event CertificateRevoked(bytes32 indexed certId);
    event AdminStatusChanged(address indexed admin, bool status);

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Access denied: Admins only");
        _;
    }

    constructor() {
        // Човекът, който деплойва договора, става първият админ
        isAdmin[msg.sender] = true;
        emit AdminStatusChanged(msg.sender, true);
    }

    // Вече всеки админ може да добавя други админи
    function addAdmin(address _addr) public onlyAdmin {
        isAdmin[_addr] = true;
        emit AdminStatusChanged(_addr, true);
    }

    // Всеки админ може да премахва други (внимавай да не премахнеш себе си!)
    function removeAdmin(address _addr) public onlyAdmin {
        isAdmin[_addr] = false;
        emit AdminStatusChanged(_addr, false);
    }

    function issueCertificate(
        string memory _studentName,
        string memory _courseName,
        string memory _date
    ) public onlyAdmin returns (bytes32) {
        bytes32 certId = keccak256(abi.encodePacked(_studentName, _courseName, _date, block.timestamp, msg.sender));
        
        certificates[certId] = CertDetails({
            studentName: _studentName,
            courseName: _courseName,
            date: _date,
            isValid: true
        });

        emit CertificateIssued(certId, _studentName, _courseName);
        return certId;
    }

    function revokeCertificate(bytes32 _certId) public onlyAdmin {
        require(bytes(certificates[_certId].studentName).length > 0, "Certificate not found");
        certificates[_certId].isValid = false;
        emit CertificateRevoked(_certId);
    }

    function verifyCertificate(bytes32 _certId) public view returns (string memory, string memory, string memory, bool) {
        CertDetails memory cert = certificates[_certId];
        require(bytes(cert.studentName).length > 0, "Certificate not found");
        return (cert.studentName, cert.courseName, cert.date, cert.isValid);
    }
}
