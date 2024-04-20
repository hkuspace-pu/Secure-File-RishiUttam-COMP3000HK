

//click handler for the encrypt button

let savedIV
let encryptedBlob
let progress
const chunkSize = 1024 // Size of each chunk in bytes


console.log('A')
const cryptoMiddleware = require('crypto-middleware/package.json');
console.log(cryptoMiddleware.version);

//generate random key and iv
function generateIV() {
    const iv = crypto.getRandomValues(new Uint8Array(16));
   
    savedIV = iv
    return iv;
}

async function readFileChunk(file) {
    return file.stream()
}

async function startStreaming(file,passPhrase) {
    const progressEmitter = new EventTarget();
    const progressStream = createProgressStream(progressEmitter);

  
    const fileStream = await readFileChunk(file);
    const encryptionStream = await encryptStream(passPhrase);
    const encryptedStream = await fileStream.pipeThrough(encryptionStream).pipeThrough(progressStream);

    return { stream: encryptedStream, progressEmitter };


}

async function startDownloading(file,passPhrase) {

}





function createProgressStream(progressEmitter) {
    let totalBytes = 0;
    return new TransformStream({
        transform(chunk, controller) {
            totalBytes += chunk.byteLength;
            progressEmitter.dispatchEvent(new CustomEvent('progress', { detail: totalBytes }));
            controller.enqueue(chunk);
          }
  
    })


}




async function encryptStream(passphrase) {
    const key = await deriveKey(passphrase)
    console.log("Key to use: ", key)
return new TransformStream({
    async transform(chunk, controller) {
        // console.log('CHUNK', chunk.byteLength)
  
        const iv = generateIV();
        const encryptedChunk = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            chunk
        );

        // Create a metadata object
        const metadata = {
            iv: Array.from(iv),
            algorithm: 'AES-GCM',
            // Add other metadata fields as needed
        };
        // create a new empty array of the same byte length as the iv and encrypted file
        const IVAndEncryptedFile = new Uint8Array(iv.byteLength + encryptedChunk.byteLength);
        // set the iv at the start of the array
        IVAndEncryptedFile.set(new Uint8Array(iv), 0);

        // set the encrypted file after the iv
        IVAndEncryptedFile.set(new Uint8Array(encryptedChunk), iv.byteLength);

        controller.enqueue(IVAndEncryptedFile)
    }
})

}


// async function readFileChunkReader(file, passphrase) {
//     const reader = file.stream().getReader();
//     let encryptedChunks = [];
//     console.time('readFileChunk')
//     while (true) {
//         const { done, value } = await reader.read();

//         if (done) {
//             console.log("All Done")
//             break;
//         }


//         console.log('CHUNK', value.byteLength)
//         encryptedChunks.push(value);

//         console.log('totalChunks= ', encryptedChunks.length)
//     }
//     console.timeEnd('chunk time')


// }

async function encryptFile(file, passphrase) {
    console.log('running encryptfile')
    const key = await deriveKey(passphrase)
    const iv = generateIV();

    console.time('EncryptFileWholeBuffer')
    const fileBuffer = await file.arrayBuffer(); // this reads the whole file at once


    const encryptedFile = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        fileBuffer

    );
    
    // Create a metadata object
    const metadata = {
        iv: Array.from(iv),
        algorithm: 'AES-GCM',
        // Add other metadata fields as needed
    };
    // create a new empty array of the same byte length as the iv and encrypted file
    const IVAndEncryptedFile = new Uint8Array(iv.byteLength + encryptedFile.byteLength);
    // set the iv at the start of the array
    IVAndEncryptedFile.set(new Uint8Array(iv), 0);

    // set the encrypted file after the iv
    IVAndEncryptedFile.set(new Uint8Array(encryptedFile), iv.byteLength);


    console.timeEnd('EncryptFileWholeBuffer')
    return IVAndEncryptedFile;

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
    } catch (error) {
        throw new Error('Decryption failed:', error)
    }
}


async function decryptStream(passphrase) {
    const key = await deriveKey(passphrase)

    return new TransformStream({
        async transform(chunk, controller) {
            // Extract the IV from the start of the chunk
            const iv = chunk.slice(0, 12); // Replace 12 with the actual length of your IV
            const data = chunk.slice(12); // Replace 12 with the actual length of your IV
            console.log(iv)
            // Decrypt the chunk
            const decryptedChunk = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: new Uint8Array(iv)
                },
                key,
                data
            );

            controller.enqueue(new Uint8Array(decryptedChunk));
        }
    });
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