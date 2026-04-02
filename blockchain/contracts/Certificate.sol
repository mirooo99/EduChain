// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Certificate {
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
    event CertificateRevoked(bytes32 indexed certId);

    // Модификатор: Само SuperAdmin
    modifier onlySuperAdmin() {
        require(isSuperAdmin[msg.sender], "Достъпът е отказан: Трябва да сте SuperAdmin");
        _;
    }

    // Модификатор: SuperAdmin ИЛИ Admin
    modifier onlyAdminOrSuper() {
        require(isAdmin[msg.sender] || isSuperAdmin[msg.sender], "Достъпът е отказан: Нямате права");
        _;
    }

    constructor() {
        // Този, който деплойва, става първият SuperAdmin
        isSuperAdmin[msg.sender] = true;
    }

    // --- Управление на Роли (Само за SuperAdmin) ---

    function addAdmin(address _addr) public onlySuperAdmin {
        isAdmin[_addr] = true;
    }

    function removeAdmin(address _addr) public onlySuperAdmin {
        isAdmin[_addr] = false;
    }

    function addSuperAdmin(address _addr) public onlySuperAdmin {
        isSuperAdmin[_addr] = true;
    }

    function removeSuperAdmin(address _addr) public onlySuperAdmin {
        require(_addr != msg.sender, "Не можете да премахнете сами себе си");
        isSuperAdmin[_addr] = false;
    }

    // --- Издаване и Анулиране (За всички Админи) ---

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
        require(bytes(certificates[_certId].studentName).length > 0, "Сертификатът не съществува");
        certificates[_certId].isValid = false;
        emit CertificateRevoked(_certId);
    }

    function verifyCertificate(bytes32 _certId) public view returns (string memory, string memory, string memory, bool) {
        CertDetails memory cert = certificates[_certId];
        // Проверяваме само дали името не е празно (съществува ли)
        require(bytes(cert.studentName).length > 0, "Сертификатът не е намерен");
        return (cert.studentName, cert.courseName, cert.date, cert.isValid);
    }
}