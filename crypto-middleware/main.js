

//click handler for the encrypt button

// const chunkSize = 1024 // Size of each chunk in bytes
let bufferSize = 5 * 1024 * 1024 // 1MB buffer size

console.log('A')
const cryptoMiddleware = require('crypto-middleware/package.json');
console.log(cryptoMiddleware.version);

//generate random key and iv
function generateIV() {
    return crypto.getRandomValues(new Uint8Array(16));
    
}

async function readFileChunk(file) {
    return file.stream()
}




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

async function encryptStream(passphrase) {
   console.log('Staring encryption stream')
   const key = await deriveKey(passphrase);
    

    return new TransformStream({
        start() {
            this.buffer = new Uint8Array(bufferSize); // 
            this.bufferLength = 0;
            this.chunkCount = 0; // Add a counter for the chunks
        },

        async transform(chunk, controller) {
            console.log('Received Chunk', chunk.byteLength);
           
            let chunkOffset = 0;

            while (chunkOffset < chunk.byteLength) {
                const spaceLeftInBuffer = this.buffer.byteLength - this.bufferLength;
                const chunkSize = Math.min(spaceLeftInBuffer, chunk.byteLength - chunkOffset);

                const piece = chunk.subarray(chunkOffset, chunkOffset + chunkSize);
                this.buffer.set(piece, this.bufferLength);
                this.bufferLength += chunkSize;

                if (this.bufferLength === this.buffer.byteLength) {
                    const iv = generateIV();
                    console.log('enc_iv ',iv)
                    const dataToEncrypt = this.buffer.subarray(0, this.bufferLength);
                   
                    const encryptedFile = await crypto.subtle.encrypt(
                        {
                            name: 'AES-GCM',
                            iv: iv
                            
                        },
                        key,
                        dataToEncrypt
                
                    );


              

                   const metaDataAndEncryption = handleIV(iv,encryptedFile)
                   console.log('got meta data and encryption', metaDataAndEncryption.byteLength)




                    console.log('Encypted Chunk Size:', encryptedFile.byteLength)
                   console.log('Enquieing chunk No:', this.chunkCount)
                    controller.enqueue(metaDataAndEncryption);
                    this.buffer = new Uint8Array(bufferSize); // Create a new buffer
                    this.bufferLength = 0;
                    this.chunkCount++;
                }

                chunkOffset += chunkSize;
            }
        },

        async flush(controller) {

            if (this.bufferLength > 0) {
                console.log('encrypt flush No.', this.chunkCount)
                const iv = generateIV();
                console.log('IV', iv)
                // console.log('Encrypted Data', encryptedData)
                const dataToEncrypt = this.buffer.subarray(0, this.bufferLength);
                const encryptedFile = await crypto.subtle.encrypt(
                    {
                        name: 'AES-GCM',
                        iv: iv
                    },
                    key,
                    dataToEncrypt


            
                );
                console.log('FLUSH ENCRYPTION FILE', encryptedFile)
                const metaDataAndEncryption = handleIV(iv,encryptedFile)
                console.log('got FINAL and encryption', metaDataAndEncryption.byteLength)
               
                console.log('Last Chunk No.:', this.chunkCount)
                controller.enqueue(metaDataAndEncryption);
                this.buffer = new Uint8Array(bufferSize); // Create a new buffer
                this.bufferLength = 0;
                this.chunkCount++;
            }
            console.log('Total chunks processed:', this.chunkCount); // Log the total number of chunks
        }
    });
}


async function startStreaming(file,passPhrase) {
  
    const fileStream = await readFileChunk(file);
    const encryptionStream = await encryptStream(passPhrase);
    const encryptedStream = await fileStream.pipeThrough(encryptionStream)

    return encryptedStream
}




async function encryptFile(file, passphrase) {
    console.log('running encryptfile')
    const key = await deriveKey(passphrase)
    const iv = generateIV();

    console.time('EncryptFileWholeBuffer')
    let fileBuffer = await file.arrayBuffer(); // this reads the whole file at once
 console.log('got file buffer', fileBuffer.byteLength)

    const encryptedFile = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        fileBuffer

    );
    
console.log('Done encrypted buffer')
fileBuffer = null;
    // Create a metadata object
    // const metadata = {
    //     iv: Array.from(iv),
    //     algorithm: 'AES-GCM',
    //     // Add other metadata fields as needed
    // };
    // // create a new empty array of the same byte length as the iv and encrypted file
    // const IVAndEncryptedFile = new Uint8Array(iv.byteLength + encryptedFile.byteLength);
    // // set the iv at the start of the array
    // IVAndEncryptedFile.set(new Uint8Array(iv), 0);

    // // set the encrypted file after the iv
    // IVAndEncryptedFile.set(new Uint8Array(encryptedFile), iv.byteLength);


    // console.timeEnd('EncryptFileWholeBuffer')
    // return IVAndEncryptedFile;
    // console.log('type of', typeof encryptedFile)
    // return encryptedFile
    return new Uint8Array(encryptedFile);

}




//function to decrypt a file using the key using aes-gcm mode
async function decryptFile(file, passphrase) {
try {
        const fileBuffer = await file.arrayBuffer();
        console.log('decrepting file')
        console.log(passphrase)
        const key = await deriveKey(passphrase)
        console.log('Decrept Key', key)
        console.log('Saved IV', savedIV)
        const decryptedFile = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: savedIV
            },
            key,
            fileBuffer
        );
        console.log('Decrypted file:', decryptedFile);


        return decryptedFile;
    }catch (error) {
        throw error
    }
}




  function extractMeta(encryptedFile) {


    console.log('IN EXTRACT META, the passed total enc file with meta is ', encryptedFile.byteLength)
    console.log('the passed encrypted file to extract method in full', encryptedFile)
    const metadataBuffer = new Uint8Array(encryptedFile.buffer, 0, 23);
    const encryptedData = new Uint8Array(encryptedFile.buffer, 23);

    // const encryptedData = new Uint8Array(encryptedFile.buffer, 23,encryptedFile.byteLength - 23);
    console.log('Meta Data length is :', metadataBuffer.byteLength)
    console.log('Encrypted Data length is :', encryptedData.byteLength) 


    
    // Parse the metadata
    const iv = metadataBuffer.slice(0, 16);
    const algorithm = new TextDecoder().decode(metadataBuffer.slice(16));
    console.log('ALGO USED', algorithm)
    return {iv, encryptedData}

  }



  function decryptStream(privateKeyOrPassphrase) {
    try {
      
    let key

    return new TransformStream({
        async start() {
            console.log('in start')
            if (typeof privateKeyOrPassphrase === 'string') {
       
                key = await deriveKey(privateKeyOrPassphrase);
         
            } else {
                console.log('LOOKS LIKE A FILE?')
                console.log(privateKeyOrPassphrase instanceof File)
                const privateKey = await privateKeyOrPassphrase.text();
                key = await decryptPassPhraseWithPrivateKey
           
            }

            // console.log('what is it? :' ,privateKeyOrPassphrase)
            // key = await deriveKey(privateKeyOrPassphrase);
                

            this.buffer = new Uint8Array(23 + bufferSize + 16); // 64KB buffer
            this.bufferLength = 0;
            this.chunkCount = 0; // Add a counter for the chunks

        },

    //    async transform(chunk, controller) {
    //         console.log('Chunk:', chunk.byteLength);
    //         controller.enqueue(chunk);
    //     }

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
                const {iv,encryptedData} = extractMeta(dataToDecrypt)

                console.log('IV', iv)
                console.log('Encrypted Data', encryptedData)

               



               
            //  console.log('key to use', key)
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
                    console.log('DECREPT OKAY', this.chunkCount)
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
            console.log('In flush buffer length is ', this.bufferLength)

            //This only creates a view.
            // const dataToDecrypt = this.buffer.subarray(0, this.bufferLength);

            //create a new array buffer, but limit it to the size of the remaining chunk
            const dataToDecrypt = new Uint8Array(this.bufferLength);
            dataToDecrypt.set(this.buffer.subarray(0, this.bufferLength))

            console.log('in flush data  to decrypt', dataToDecrypt)
            const {iv,encryptedData} = extractMeta(dataToDecrypt)
            console.log('IV', iv)
            console.log('Encrypted Data', encryptedData)
         

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

            // this.buffer = new Uint8Array(23 + bufferSize + 16); // Create a new buffer
            // this.bufferLength = 0;
            this.chunkCount++;
        }
        console.log('buffer length is now ',this.bufferLength)
        console.log('Total chunks processed:', this.chunkCount);
    }


    });

} catch (error) {
console.log('main.js ', error)
throw error
}
}






async function deriveKey(passPhrase) {
   console.log('in derive key: ',passPhrase)
    // console.log('Passphrase', passPhrase)
    // const salt = crypto.getRandomValues(new Uint8Array(16));
    // console.log('salt', salt);
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


async function exportKeys(keyPair) {
    // Export the private key in pkcs8 format
    const exportedPrivateKey = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
 
    // Export the public key in spki format
    const exportedPublicKey = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);

    return { exportedPrivateKey, exportedPublicKey };
  }

async function encryptPassPhraseWithPublicKey(publicKey, data) {
    // Convert the data to an ArrayBuffer
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    

// check if publicKey type is a jwk
if (!isJwk(publicKey)) {
publicKey = await importPublicKey(publicKey)
} 


    // Encrypt the data
    const encryptedData = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        publicKey,
        encodedData
    );
   

    return encryptedData;
}



async function decryptPassPhraseWithPrivateKey(privateKey,data) {
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



function isCryptoKey(key) {
    return key && key.type && key.extractable !== undefined && key.algorithm && key.usages;
}

function isJwk(key) {
    return key && key.kty && key.e && key.n;
}


async function importPrivateKey(jwk) {
    console.log('jwk',jwk)

        jwk = JSON.parse(jwk)

    
    const privateKey = await window.crypto.subtle.importKey(
        'jwk', // the format of the key to import
        jwk, // the jwk key
        {
            name: "RSA-OAEP",
            hash: {name: "SHA-256"}
        },
        true,
        ['decrypt'] // key usages
    );
    return privateKey
}



async function importPublicKey(jwk) {
    console.log(jwk)
    if (typeof jwk === 'string') {
        jwk = JSON.parse(jwk)
    }
    const publicKey = await window.crypto.subtle.importKey(
        'jwk', // the format of the key to import
        jwk, // the jwk key
        {
            name: "RSA-OAEP",
            hash: {name: "SHA-256"}
        },
        true,
        ['encrypt'] // key usages
    );

    return publicKey;
}

// Usage:
// const data = 'my shared key';
// const encryptedData = await encryptWithPublicKey(keyPair.publicKey, data);

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


export { decryptPassPhraseWithPrivateKey,generateKeyPair, importPublicKey,encryptPassPhraseWithPublicKey,deriveKey, encryptFile, decryptFile, generateIV,decryptStream,readFileChunk,startStreaming,encryptStream }