

//click handler for the encrypt button



let savedIV
// const chunkSize = 1024 // Size of each chunk in bytes
let bufferSize = 1 * 1024 * 1024 // 1MB buffer size

console.log('A')
const cryptoMiddleware = require('crypto-middleware/package.json');
console.log(cryptoMiddleware.version);

//generate random key and iv
function generateIV() {
    const iv = crypto.getRandomValues(new Uint8Array(16));
   
    savedIV = iv
    console.log('SAVING IV', savedIV)
    return iv;
}

async function readFileChunk(file) {
    return file.stream()
}


async function encryptStream(passphrase) {
   console.log('Staring encryption stream')
   const key = await deriveKey(passphrase);
    const iv = generateIV();

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
                    const dataToEncrypt = this.buffer.subarray(0, this.bufferLength);
                   
                    const encryptedFile = await crypto.subtle.encrypt(
                        {
                            name: 'AES-GCM',
                            iv: savedIV
                        },
                        key,
                        dataToEncrypt
                
                    );
                    console.log('Encypted Chunk Size:', encryptedFile.byteLength)
                   console.log('Enquieing chunk No:', this.chunkCount)
                    controller.enqueue(encryptedFile);
                    this.buffer = new Uint8Array(bufferSize); // Create a new buffer
                    this.bufferLength = 0;
                    this.chunkCount++;
                }

                chunkOffset += chunkSize;
            }
        },

        async flush(controller) {
            if (this.bufferLength > 0) {
                const dataToEncrypt = this.buffer.subarray(0, this.bufferLength);
                const encryptedFile = await crypto.subtle.encrypt(
                    {
                        name: 'AES-GCM',
                        iv: savedIV
                    },
                    key,
                    dataToEncrypt
            
                );
               
                console.log('Last Chunk No.:', this.chunkCount)
                controller.enqueue(encryptedFile);
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
    const fileBuffer = await file.arrayBuffer(); // this reads the whole file at once


    const encryptedFile = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: savedIV
        },
        key,
        fileBuffer

    );
    
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




  



  function decryptStream(passphrase) {
    try {
        console.log('decrypt pass' ,passphrase)
    let key
    // const key = await deriveKey(passphrase)
//     console.log('in decreypt stream key',key   );
// console.log('in decrypt stream', passphrase)
    return new TransformStream({
        async start() {
            console.log('in start')
            key = await deriveKey(passphrase);

            this.buffer = new Uint8Array(bufferSize + 16); // 64KB buffer
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
            //  console.log('key to use', key)
                try {
                    const decryptedChunk = await crypto.subtle.decrypt(
                        {
                            name: 'AES-GCM',
                            iv: savedIV,
                        },
                        key,
                        dataToDecrypt
                    );

                    controller.enqueue(decryptedChunk);
                } catch (e) {
                    console.log('Error decrypting chunk:', e);
                    throw e;
                }

                this.buffer = new Uint8Array(bufferSize + 16); // Create a new buffer
                this.bufferLength = 0;
                this.chunkCount++;
            }

            chunkOffset += chunkSize;
        }
    },
    async flush(controller) {
        if (this.bufferLength > 0) {
            const dataToDecrypt = this.buffer.subarray(0, this.bufferLength);

            try {
                const decryptedChunk = await crypto.subtle.decrypt(
                    {
                        name: 'AES-GCM',
                        iv: savedIV
                    },
                    key,
                    dataToDecrypt
                );

                controller.enqueue(decryptedChunk);
            } catch (e) {
                console.log('Error decrypting chunk:', e);
                throw e;
            }

            this.buffer = new Uint8Array(bufferSize + 16); // Create a new buffer
            this.bufferLength = 0;
            this.chunkCount++;
        }

        console.log('Total chunks processed:', this.chunkCount);
    }


    });

} catch (error) {
console.log('main.js ', error)
throw error
}
}






async function deriveKey(passPhrase) {
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






export { deriveKey, encryptFile, decryptFile, generateIV,decryptStream,readFileChunk,startStreaming,encryptStream }