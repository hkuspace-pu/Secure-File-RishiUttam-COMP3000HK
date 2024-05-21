/**
 * 
 * Crypto-Middleware - A simple library for encrypting and decrypting files using the Web Crypto API
 * with support for streaming and chunking encryption and decryption.
 *
 * Rishi Uttam - rishi.uttamchandani@students.plymouth.ac.uk
 *
 * Licensed under the MIT License
 *
 * @author Rishi Uttam
 *
 */


/** 
BufferSize, this is the size of the buffer that will be used to read the file in chunks and encrypt it in chunks
This is a global variable that can be changed to suit the needs of the application.
The default value is 5MB
AWS Upload Parts minimum is 5MB, hence the default value is set to 5MB, but can be changed to any value from 64KB.
It is important to keep the buffersize the same for both encryption and decryption.
*/

let bufferSize = 5 * 1024 * 1024 // 5MB buffer size


async function startStreaming(file, passPhrase, gzip = 0) {
    try {
        const fileStream = await readFileChunk(file);
        const gzipStream = gzip && await startGzipStreaming(fileStream)
        console.log('gzipstream', gzipStream)

        let resultStream = fileStream;
        if (gzipStream) {
            resultStream = resultStream.pipeThrough(gzipStream);
            console.log('resultstream', resultStream)
        }
        const encryptionStream = await encryptStream(passPhrase);


        const encryptedStream = resultStream.pipeThrough(encryptionStream);


        return encryptedStream
    } catch (e) {
        console.log('An error occurred during streaming encryption:', e)
        throw e
    }
}



// async function startStreaming(file, passPhrase, gzip = 1) {
//     try {
//         const fileStream = await readFileChunk(file);
//         const gzipStream = gzip && await startGzipStreaming()
//         const zippedStream = fileStream.pipeThrough(gzipStream);

        

//         return zippedStream
//     } catch (e) {
//         console.log('An error occurred:', e.message)
//         throw e
//     }
// }

async function startGzipStreaming() {
    try {
     return new CompressionStream('gzip');
    } catch (e) {
        throw new Error('Failed to compress file: ' + e.message)
    }
}



/**
 * Reads a chunk of data from a file using the file's stream method.
 * Used in conjunction with the XXX read and process files in chunks.
 * @param {File} file - The file from which to read.
 * @returns {ReadableStream} A readable stream from which chunks of data can be read.
 *
 * @example
 * const file = new File(["foo"], "foo.txt", {
 *   type: "text/plain",
 * });
 * const stream = await readFileChunk(file);
 * const reader = stream.getReader();
 * const { value, done } = await reader.read();
 * console.log(value); // Logs the first chunk of data from the file.
 * This is the first part of the startStreaming pipeline 
 */
async function readFileChunk(file) {
    try {
        return file.stream()
    } catch (e) {
        throw new Error('Failed to read file: ' + e.message)

    }
}




/**
 * Creates a TransformStream that encrypts input data in chunks using a derived key from a passphrase.
 * Each chunk is encrypted separately with its own initialization vector (IV).
 *
 * @param {string} passphrase - The passphrase from which to derive the encryption key.
 * @returns {TransformStream} A TransformStream that encrypts input data in chunks.
 *
 * @example
 * const encryptedStream = encryptStream('my secure passphrase');
 * // Use the encryptedStream with a ReadableStream or WritableStream...
 */
async function encryptStream(passphrase) {
    const key = await deriveKey(passphrase);
    return new TransformStream({
        start() {
            this.buffer = new Uint8Array(bufferSize); // Default is 5MB 
            this.bufferLength = 0;
            this.chunkCount = 0; // Add a counter for the chunks
        },

        async transform(chunk, controller) {
            let chunkOffset = 0;

            while (chunkOffset < chunk.byteLength) {
                const spaceLeftInBuffer = this.buffer.byteLength - this.bufferLength;
                const chunkSize = Math.min(spaceLeftInBuffer, chunk.byteLength - chunkOffset);

                const piece = chunk.subarray(chunkOffset, chunkOffset + chunkSize);
                this.buffer.set(piece, this.bufferLength);
                this.bufferLength += chunkSize;

                if (this.bufferLength === this.buffer.byteLength) {
                    const iv = generateIV();

                    const dataToEncrypt = this.buffer.subarray(0, this.bufferLength);

                    // This code uses the Web Cryptography API's `encrypt` method to encrypt data.
                    // The encryption algorithm used is AES-GCM, which is a block cipher mode of operation that provides high speed of authenticated encryption and data integrity.
                    // An initialization vector (IV) is used for AES-GCM to ensure that different encryption results are obtained even for the same plaintext and key.
                    // The `key` is a CryptoKey object representing the AES key to be used for encryption.
                    // `dataToEncrypt` is the data to be encrypted, which should be an ArrayBuffer or ArrayBufferView.

                    const encryptedFile = await crypto.subtle.encrypt(
                        {
                            name: 'AES-GCM',
                            iv: iv

                        },
                        key,
                        dataToEncrypt

                    );
                    // Helper function to prepend the IV and encryption algorithm to the encrypted file
                    const metaDataAndEncryption = handleIV(iv, encryptedFile)
                    controller.enqueue(metaDataAndEncryption);
                    this.buffer = new Uint8Array(bufferSize); // Create a new buffer
                    this.bufferLength = 0;
                    this.chunkCount++;
                }

                chunkOffset += chunkSize;
            }
        },

        /**
         * The FlushHandles any remaining data in the buffer when there is no more data to be consumed from the stream.
         * If there is data left in the buffer, it generates a new initialization vector (IV), 
         * creates a subarray from the buffer containing the remaining data, and encrypts this data using the AES-GCM algorithm.
         */
        async flush(controller) {

            if (this.bufferLength > 0) {
                // console.log('encrypt flush No.', this.chunkCount)
                const iv = generateIV();


                const dataToEncrypt = this.buffer.subarray(0, this.bufferLength);
                const encryptedFile = await crypto.subtle.encrypt(
                    {
                        name: 'AES-GCM',
                        iv: iv
                    },
                    key,
                    dataToEncrypt



                );

                const metaDataAndEncryption = handleIV(iv, encryptedFile)
                controller.enqueue(metaDataAndEncryption);
                this.buffer = new Uint8Array(bufferSize); // Create a new buffer
                this.bufferLength = 0;
                this.chunkCount++;
            }
            // console.log('Total chunks processed:', this.chunkCount); // Log the total number of chunks
        }
    });
}




/**
 * Generates an initialization vector (IV) for cryptographic operations.
 * The IV is a random string of 16 bytes, generated using the crypto API.
 *
 * @returns {Uint8Array} A 16-byte typed array of unsigned integers, suitable for use as an IV.
 */
function generateIV() {
    return crypto.getRandomValues(new Uint8Array(16));

}


/**
 * Prepends the initialization vector (IV) and the encryption algorithm used to the encrypted file.
 * The IV is 16 bytes and the algorithm used ('AES-GCM') takes up the remaining bytes, making a total of 23 bytes.
 *
 * @param {Uint8Array} iv - The initialization vector used in the encryption.
 * @param {ArrayBuffer} encryptedFile - The encrypted file data.
 * @returns {Uint8Array} A new Uint8Array containing the metadata (IV and algorithm) and the encrypted file data.
 *
 * @example
 * const iv = crypto.getRandomValues(new Uint8Array(16));
 * const encryptedFile = await encryptFile(file, iv);
 * const fileWithMetadata = handleIV(iv, encryptedFile);
 */
function handleIV(iv, encryptedFile) {

    const metaDataBuffer = new Uint8Array(23);
    const algorithmBuffer = new TextEncoder().encode('AES-GCM');
    metaDataBuffer.set(iv, 0);
    metaDataBuffer.set(algorithmBuffer, iv.byteLength);

    const encryptedData = new Uint8Array(encryptedFile);

    // Create a new Uint8Array to hold the metadata and the encrypted data
    const MetaDataAndEncryptedFile = new Uint8Array(metaDataBuffer.byteLength + encryptedData.byteLength);

    // Set the metadata and the encrypted data in the new array
    MetaDataAndEncryptedFile.set(metaDataBuffer);
    MetaDataAndEncryptedFile.set(encryptedData, metaDataBuffer.byteLength);
    return MetaDataAndEncryptedFile

}


/**
 * Encrypts a file using a derived key from a passphrase.
 * The encryption algorithm used is AES-GCM, and an initialization vector (IV) is generated for each encryption.
 * Note: This function reads the whole file into memory at once, which may not be ideal for large files.
 *
 * @param {File} file - The file to be encrypted.
 * @param {string} passphrase - The passphrase from which to derive the encryption key.
 * @returns {Promise<Uint8Array>} A promise that resolves with the encrypted file data as a Uint8Array.
 *
 * @example
 * const file = new File(["foo"], "foo.txt", {
 *   type: "text/plain",
 * });
 * const encryptedFileData = await encryptFile(file, 'my secure passphrase');
 * Not Recommened for large files over 50MB
 
 */
async function encryptFile(file, passphrase) {

    const key = await deriveKey(passphrase)
    const iv = generateIV();
    let fileBuffer = await file.arrayBuffer();
    // this reads the whole file at once, this is not ideal for large files
    const encryptedFile = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        fileBuffer

    );
    fileBuffer = null;
    return new Uint8Array(encryptedFile);
}



/**
 * Decrypts a file using a derived key from a passphrase.
 * The decryption algorithm used is AES-GCM, and the initialization vector (IV) used for encryption is required.
 * Note: This function reads the whole file into memory at once, which may not be ideal for large files.
 *
 * @param {File} file - The file to be decrypted.
 * @param {string} passphrase - The passphrase from which to derive the decryption key.
 * @returns {Promise<ArrayBuffer>} A promise that resolves with the decrypted file data as an ArrayBuffer.
 *
 * @throws Will throw an error if the decryption fails.
 *
 * @example
 * const file = new File([encryptedData], "foo.txt", {
 *   type: "text/plain",
 * });
 * const
 * */
async function decryptFile(file, passphrase) {
    try {
        const fileBuffer = await file.arrayBuffer();

        const key = await deriveKey(passphrase)

        const decryptedFile = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: savedIV
            },
            key,
            fileBuffer
        );
        return decryptedFile;
    } catch (error) {
        throw error
    }
}



/**
 * Extracts the metadata (initialization vector and algorithm) from an encrypted file.
 * The metadata is expected to be in the first 23 bytes of the file, with the IV in the first 16 bytes and the algorithm in the remaining bytes.
 *
 * @param {Uint8Array} encryptedFile - The encrypted file data.
 * @returns {Object} An object containing the initialization vector (as a Uint8Array) and the encrypted data (as a Uint8Array).
 *
 * @example
 * const { iv, encryptedData } = extractMeta(encryptedFileData);
 * 23 bytes = 16 bytes IV + 7 bytes algorithm
 */
function extractMeta(encryptedFile) {
    const metadataBuffer = new Uint8Array(encryptedFile.buffer, 0, 23);
    const encryptedData = new Uint8Array(encryptedFile.buffer, 23);
    const iv = metadataBuffer.slice(0, 16);
    const algorithm = new TextDecoder().decode(metadataBuffer.slice(16));
    return { iv, encryptedData }
}


/**
 * Creates a TransformStream that decrypts data as it is read.
 * The decryption algorithm used is AES-GCM, and the initialization vector (IV) and algorithm are extracted from each chunk.
 * The data is held in a buffer to match the buffer length of the encrypted file, allowing the header IV and algorithm to be extracted from each chunk.
 * The passphrase is used to authenticate each chunk. If any chunk fails authentication, the whole decryption will fail.
 *
 * @param {string|File} privateKeyOrPassphrase - The passphrase or private key to use for decryption.
 * @returns {TransformStream} A TransformStream that decrypts data as it is read.
 *
 * @throws Will throw an error if the decryption fails.
 *
 * @example
 * const encryptedFile = new File([encryptedData], "foo.txt", {
 *   type: "text/plain",
 * });
 * const rs = encryptedFile.stream().pipeThrough(decryptStream('my secure passphrase'));
 */
function decryptStream(privateKeyOrPassphrase) {
    try {
        let key
        return new TransformStream({
            async start() {

                if (typeof privateKeyOrPassphrase === 'string') {
                    key = await deriveKey(privateKeyOrPassphrase);
                } else {


                    const privateKey = await privateKeyOrPassphrase.text();
                    key = await decryptPassPhraseWithPrivateKey
                }

                this.buffer = new Uint8Array(23 + bufferSize + 16); // 64KB buffer
                this.bufferLength = 0;
                this.chunkCount = 0; // Add a counter for the chunks
            },

            async transform(chunk, controller) {
                let chunkOffset = 0;
                while (chunkOffset < chunk.byteLength) {
                    const spaceLeftInBuffer = this.buffer.byteLength - this.bufferLength;
                    const chunkSize = Math.min(spaceLeftInBuffer, chunk.byteLength - chunkOffset);

                    const piece = chunk.subarray(chunkOffset, chunkOffset + chunkSize);
                    this.buffer.set(piece, this.bufferLength);
                    this.bufferLength += chunkSize;

                    if (this.bufferLength === this.buffer.byteLength) {
                        const dataToDecrypt = this.buffer.subarray(0, this.bufferLength);
                        const { iv, encryptedData } = extractMeta(dataToDecrypt)
                        try {
                            const decryptedChunk = await crypto.subtle.decrypt(
                                {
                                    name: 'AES-GCM',
                                    iv: iv
                                },
                                key,
                                encryptedData
                            );

                            controller.enqueue(decryptedChunk);

                        } catch (e) {
                            console.log('Error decrypting chunk:', e);
                            throw e;
                        }

                        this.buffer = new Uint8Array(23 + bufferSize + 16); // Create a new buffer
                        this.bufferLength = 0;
                        this.chunkCount++;
                    }

                    chunkOffset += chunkSize;
                }
            },
            async flush(controller) {

                if (this.bufferLength > 0) {

                    const dataToDecrypt = new Uint8Array(this.bufferLength);
                    dataToDecrypt.set(this.buffer.subarray(0, this.bufferLength))


                    const { iv, encryptedData } = extractMeta(dataToDecrypt)

                    try {
                        const decryptedChunk = await crypto.subtle.decrypt(
                            {
                                name: 'AES-GCM',
                                iv: iv
                            },
                            key,
                            encryptedData
                        );

                        controller.enqueue(decryptedChunk);
                    } catch (e) {
                        console.log(`Error decrypting chunk No. ${this.chunkCount}`, e);
                        throw e;
                    }

                    this.chunkCount++;
                }

                // console.log('Total chunks processed:', this.chunkCount);
            }
        });
    } catch (error) {
        console.log(error)
        throw error
    }
}



/**
 * Derives a cryptographic key from a passphrase using the PBKDF2 algorithm.
 * The derived key can be used for AES-GCM encryption and decryption.
 * The PBKDF2 algorithm is used with a fixed salt and 100,000 iterations, and the SHA-256 hash function.
 * Note: In a production environment, consider using a random salt and storing it securely for key derivation.
 *
 * @param {string} passPhrase - The passphrase from which to derive the key.
 * @returns {Promise<CryptoKey>} A promise that resolves with the derived key.
 *
 * @example
 * const key = await deriveKey('my secure passphrase');
 */
async function deriveKey(passPhrase) {

    // const salt = crypto.getRandomValues(new Uint8Array(16));
    const enc = new TextEncoder()
    // const passphraseInput = document.getElementById('passphrase').value
    const passphraseUint8Array = enc.encode(passPhrase)
    const baseKey = await crypto.subtle.importKey(
        'raw',
        passphraseUint8Array,
        {
            name: 'PBKDF2'
        },
        false,
        ['deriveKey']
    );
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            // salt: salt,
            salt: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
            iterations: 100000,
            hash: 'SHA-256'
        },
        baseKey,
        {
            name: 'AES-GCM',
            length: 256
        },
        true,
        ['encrypt', 'decrypt']
    );
    // console.log(key)
    return key;

}

/**
 * Exports a key pair (private and public keys) in the JWK (JSON Web Key) format.
 * This function can be used when you want to securely store the keys or transmit them over an insecure network.
 *
 * @param {CryptoKeyPair} keyPair - The key pair to be exported. This should be an object that has `privateKey` and `publicKey` properties.
 * @returns {Promise<Object>} A promise that resolves with an object containing the exported private and public keys.
 * JWK are used to represent cryptographic keys in JSON format, Similar to PKCS#8 and X.509 formats, however, JWK provide
 * human readability and are web friendly with standardized fields.
 */
async function exportKeys(keyPair) {
    const exportedPrivateKey = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
    const exportedPublicKey = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
    return { exportedPrivateKey, exportedPublicKey };
}

/**
 * Encrypts a passphrase using the recipient's public key.
 * 
 * This function uses the RSA-OAEP (RSA Optimal Asymmetric Encryption Padding) algorithm for encryption.
 * RSA-OAEP is a public-key encryption algorithm that combines the RSA algorithm with the OAEP method.
 * RSA is a widely used public-key encryption algorithm that allows for secure data transmission or storage.
 * OAEP is a padding scheme that enhances the security of RSA by preventing certain types of attacks.
 *
 * @param {(CryptoKey|Object)} publicKey - The recipient's public key. This can be a CryptoKey object or a JWK.
 * @param {string} data - The passphrase to be encrypted.
 * @returns {Promise<ArrayBuffer>} A promise that resolves with the encrypted passphrase.
 *
 * @example
 * const publicKey = await getPublicKey(); // Your function to get the public key
 * const passphrase = "my secure passphrase";
 * const encryptedPassphrase = await encryptPassPhraseWithPublicKey(publicKey, passphrase);
 */
async function encryptPassPhraseWithPublicKey(publicKey, data) {

    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    if (!isJwk(publicKey)) {
        publicKey = await importPublicKey(publicKey)
    }

    const encryptedData = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        publicKey,
        encodedData
    );

    return encryptedData;
}


/**
 * Decrypts an encrypted passphrase using the recipient's private key.
 * 
 * This function uses the RSA-OAEP (RSA Optimal Asymmetric Encryption Padding) algorithm for decryption.
 * RSA-OAEP is a public-key encryption algorithm that combines the RSA algorithm with the OAEP method.
 * RSA is a widely used public-key encryption algorithm that allows for secure data transmission or storage.
 * OAEP is a padding scheme that enhances the security of RSA by preventing certain types of attacks.
 *
 * @param {(CryptoKey|Object)} privateKey - The recipient's private key. This can be a CryptoKey object or a JWK.
 * @param {ArrayBuffer} data - The encrypted passphrase to be decrypted.
 * @returns {Promise<string>} A promise that resolves with the decrypted passphrase.
 *
 * @example
 * const privateKey = await getPrivateKey(); // Your function to get the private key
 * const encryptedPassphrase = await getEncryptedPassphrase(); // Your function to get the encrypted passphrase
 * const decryptedPassphrase = await decryptPassPhraseWithPrivateKey(privateKey, encryptedPassphrase);
 */
async function decryptPassPhraseWithPrivateKey(privateKey, data) {
    const privateCryptoKey = await importPrivateKey(privateKey)
    // Decrypt the data
    const decryptedData = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP"
        },
        privateCryptoKey,
        data
    );
    const decoder = new TextDecoder()
    const decryptedText = decoder.decode(decryptedData);
    return decryptedText

}


// Internal Helper Functions
function isCryptoKey(key) {
    return key && key.type && key.extractable !== undefined && key.algorithm && key.usages;
}

function isJwk(key) {
    return key && key.kty && key.e && key.n;
}



/**
 * Imports a user's private key from a JWK (JSON Web Key) for decryption purposes.
 * 
 * This function uses the RSA-OAEP (RSA Optimal Asymmetric Encryption Padding) algorithm with SHA-256 hash function.
 * The imported private key is not stored in memory or logged and is removed upon page refresh.
 * 
 * @param {string} jwk - The private key in JWK format as a string. This key is parsed into a JSON object before being imported.
 * @returns {Promise<CryptoKey>} A promise that resolves with the imported private key as a CryptoKey object.
 *
 * @example
 * const jwkString = '{"kty":"RSA",...}'; // Your JWK string
 * const privateKey = await importPrivateKey(jwkString);
 */
async function importPrivateKey(jwk) {


    jwk = JSON.parse(jwk)


    const privateKey = await window.crypto.subtle.importKey(
        'jwk', // the format of the key to import
        jwk, // the jwk key
        {
            name: "RSA-OAEP",
            hash: { name: "SHA-256" }
        },
        true,
        ['decrypt'] // key usages
    );
    return privateKey
}


/**
 * Imports a user's public key from a JWK (JSON Web Key) for encryption purposes.
 * 
 * This function uses the RSA-OAEP (RSA Optimal Asymmetric Encryption Padding) algorithm with SHA-256 hash function.
 * The imported public key can be used to encrypt data that can only be decrypted with the corresponding private key.
 * 
 * @param {(string|Object)} jwk - The public key in JWK format. This can be a string or an object. If it's a string, it will be parsed into a JSON object.
 * @returns {Promise<CryptoKey>} A promise that resolves with the imported public key as a CryptoKey object.
 *
 * @example
 * const jwkString = '{"kty":"RSA",...}'; // Your JWK string
 * const publicKey = await importPublicKey(jwkString);
 */
async function importPublicKey(jwk) {

    if (typeof jwk === 'string') {
        jwk = JSON.parse(jwk)
    }
    const publicKey = await window.crypto.subtle.importKey(
        'jwk', // the format of the key to import
        jwk, // the jwk key
        {
            name: "RSA-OAEP",
            hash: { name: "SHA-256" }
        },
        true,
        ['encrypt'] // key usages
    );

    return publicKey;
}

/**
 * Generates a public and private key pair using the RSA-OAEP algorithm.
 * 
 * This function uses the RSA-OAEP (RSA Optimal Asymmetric Encryption Padding) algorithm with SHA-256 hash function.
 * The generated key pair is then converted into the JWK (JSON Web Key) format by the `exportKeys` function.
 * 
 * @returns {Promise<Object>} A promise that resolves with the generated key pair in JWK format. The returned object has `privateKey` and `publicKey` properties.
 *
 * @example
 * const jwks = await generateKeyPair();
 * console.log(jwks.privateKey); // Logs the private key in JWK format
 * console.log(jwks.publicKey); // Logs the public key in JWK format
 */
async function generateKeyPair() {

    const keyPair = await crypto.subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256'
        },
        true,
        ['encrypt', 'decrypt']
    );

    const jwks = await exportKeys(keyPair)
    return jwks

}


export { startGzipStreaming,decryptPassPhraseWithPrivateKey, generateKeyPair, importPublicKey, encryptPassPhraseWithPublicKey, deriveKey, encryptFile, decryptFile, generateIV, decryptStream, readFileChunk, startStreaming, encryptStream }