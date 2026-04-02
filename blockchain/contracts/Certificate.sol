// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Certificate {
    // Дефинираме двете роли
    mapping(address => bool) public isSuperAdmin;
    mapping(address => bool) public isAdmin;

    struct CertDetails {
        string studentName;
        string courseName;
        string date;
        bool isValid;
    }

    mapping(bytes32 => CertDetails) public certificates;

    event CertificateIssued(bytes32 indexed certId, string studentName, string courseName);
    event CertificateRevoked(bytes32 indexed certId); // Ново събитие за анулиране

    modifier onlySuperAdmin() {
        require(isSuperAdmin[msg.sender], "Access denied: SuperAdmin only");
        _;
    }

    modifier onlyAdminOrSuper() {
        require(isAdmin[msg.sender] || isSuperAdmin[msg.sender], "Access denied: Admins only");
        _;
    }

    constructor() {
        // Деплойърът става и двете, за да имаш пълни права от самото начало
        isSuperAdmin[msg.sender] = true;
        isAdmin[msg.sender] = true;
    }

    // --- УПРАВЛЕНИЕ НА РОЛИ ---
    function addAdmin(address _addr) public onlySuperAdmin {
        isAdmin[_addr] = true;
    }

    function removeAdmin(address _addr) public onlySuperAdmin {
        isAdmin[_addr] = false;
    }

    // --- ИЗДАВАНЕ И АНУЛИРАНЕ ---
    function issueCertificate(
        string memory _studentName,
        string memory _courseName,
        string memory _date
    ) public onlyAdminOrSuper returns (bytes32) {
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

    function revokeCertificate(bytes32 _certId) public onlyAdminOrSuper {
        require(bytes(certificates[_certId].studentName).length > 0, "Certificate not found");
        certificates[_certId].isValid = false;
        emit CertificateRevoked(_certId);
    }

    // --- ПРОВЕРКА ---
    function verifyCertificate(bytes32 _certId) public view returns (string memory, string memory, string memory, bool) {
        CertDetails memory cert = certificates[_certId];
        require(bytes(cert.studentName).length > 0, "Certificate not found");
        // Вече не гърми, ако е невалиден. Просто връща isValid = false.
        return (cert.studentName, cert.courseName, cert.date, cert.isValid);
    }
}