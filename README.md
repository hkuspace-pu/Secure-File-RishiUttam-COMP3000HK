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

Cloud breaches have exposed millions of plaintext data across industries, with inherent risks in relying on cloud infrastructure for data security. SecureFile demonstrates this by using our opensource  browser middleware acting as a secure proxy to read, encrypting and save data before it leaves the client's environment, ensuring cloud providers only handle encrypted data without access to decryption keys.

## Package Contents

<table data-full-width="true"><thead><tr><th>Tutke</th><th>Location</th><th>Description</th><th>Usage</th></tr></thead><tbody><tr><td>Crypto-Middleware</td><td>./crypto-middleware</td><td>Middleware proxies your File object in a stream and outputs a encrypted Readable stream</td><td><code>npm i crypto-middleware</code></td></tr><tr><td>SecureFile</td><td>./demo</td><td>Client side application demonstrating ways in which Crypto-middleware can be sued with comparison</td><td><code>cd demo</code><br><code>npm install</code><br><code>npm run dev</code></td></tr><tr><td></td><td></td><td></td><td></td></tr><tr><td>Crypto-CLI</td><td>./crypto-cli</td><td>NodeJS terminal proof of concept wrapper around openssl</td><td><code>node index</code></td></tr></tbody></table>

