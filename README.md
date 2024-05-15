---
description: A COMP3000HK 2023/24 FINAL YEAR CYBER SECRUITY PROJECT
layout:
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: false
---

# Client-Side Encryption: The Key to Confidentiality for Cloud Storage

***

Client-Side Encryption: The Key to Confidentiality for Cloud Storage

### About this project

This project aims to demonstrate how businesses can maintain data privacy controls for data in the Cloud through self-managed encryption keys . Our open-source Crypto-Middleware package integrates as a proxy before you send data to the cloud, for now we support AWS S3, or your local disk.&#x20;

The end result is End-to-End encryption for your sensitive data.

### Qualitative Objectives

* Maintain Confidentiality, Integrity & Authenticity
* Large File Encryption & Decryption
* High Entropy
* Browser only,  no server side encryption.
* Large file encryption & decryption without exhausting memory > 5GB
* Optional PKI to share keys

## Motives

Healthcare providers, educational institutions & legal firms are just some of the industries that have suffered cloud breaches as per IBM Cloud Breach Survey report (2023).  These breaches exposed million of plaintext data. The reliance on cloud infrastructure to manage data security including the management of keys have inherent risks, namely insider access, APT breaches and limited control over encryption methods.

SecureFile is a client-side application to demonstrate how intergrating the opensrouce Crypto-Middle ware library encryption tool that aims to mitigate the above risks and add an additional layer of security by ensuring the data is encrypted before it leaves the client's environment. At a high-level, this ensures that cloud providers only ever handle encrypted data and do not have access to the keys necessary to decrypt it.



y encrypting sensitive information prior to ingress (transmission out of the organization's boundary, into an external provider), and decrypting data after egress (data leaving the provider)&#x20;

