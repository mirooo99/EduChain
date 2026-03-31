const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Certificate Contract", function () {
  let certificate, owner, addr1;

  beforeEach(async function () {
  
    [owner, addr1] = await ethers.getSigners();
    
    const CertificateFactory = await ethers.getContractFactory("Certificate");
    certificate = await CertificateFactory.deploy();
    
   
    await certificate.waitForDeployment();
  });

  it("Should set the right admin", async function () {
    expect(await certificate.admin()).to.equal(owner.address);
  });

  it("Should issue and verify a certificate", async function () {
    const tx = await certificate.issueCertificate(
      "Miroslav Radukanov", 
      "TUESFEST Winner", 
      "2026-04-26"
    );
    
    const receipt = await tx.wait();
    
   
    const filter = certificate.filters.CertificateIssued();
    const events = await certificate.queryFilter(filter, receipt.blockNumber);
    const certId = events[0].args.certId;

    const certData = await certificate.verifyCertificate(certId);
    
    expect(certData[0]).to.equal("Miroslav Radukanov"); 
    expect(certData[1]).to.equal("TUESFEST Winner"); 
    expect(certData[3]).to.equal(true);
  });
});