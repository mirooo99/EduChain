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

    // Mapping от уникален хеш (ID) към детайлите на сертификата
    mapping(bytes32 => CertDetails) public certificates;

    // Събитие, което се излъчва при издаване на нов сертификат
    event CertificateIssued(bytes32 indexed certId, string studentName, string courseName);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Access denied: Only Admin can issue certificates");
        _;
    }

    constructor() {
        admin = msg.sender; // Този, който качва контракта, става админ
    }

    // Функция за издаване на сертификат
    function issueCertificate(
        string memory _studentName,
        string memory _courseName,
        string memory _date
    ) public onlyAdmin returns (bytes32) {
        // Генериране на уникално ID (хеш)
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

    // Функция за проверка на сертификат
    function verifyCertificate(bytes32 _certId) public view returns (string memory, string memory, string memory, bool) {
        CertDetails memory cert = certificates[_certId];
        require(cert.isValid, "Certificate not found or invalid");
        
        return (cert.studentName, cert.courseName, cert.date, cert.isValid);
    }
}