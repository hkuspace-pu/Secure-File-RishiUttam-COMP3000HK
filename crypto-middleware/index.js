

//click handler for the encrypt button
const fileInput = document.getElementById('fileInput');
const fileInputDecrypt = document.getElementById('fileInputDecrypt');
const encryptButton = document.getElementById('encryptButton');
const decryptButton = document.getElementById('decryptButton');
let savedIV

decryptButton.addEventListener('click', async () => {
    console.log('Starting decryption process')
    const file = fileInputDecrypt.files[0];
    const key = await deriveKey();
    try {
    const decryptedFile = await decryptFile(file, key);
        //allow the user to download the decrypted file
    const decryptedBlob = new Blob([decryptedFile], { type: 'application/octet-stream' });
    const decryptedBlobUrl = URL.createObjectURL(decryptedBlob);
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = decryptedBlobUrl;
    downloadLink.download = file.name.replace('.enc', '.dec');
    downloadLink.style.display = 'block';
    }catch (error) {
        console.log('Decryption failed', error.message)
    }
  
});

encryptButton.addEventListener('click', async () => {
    const key = await deriveKey();
    const file = fileInput.files[0];
    const encryptedFile = await encryptFile(file, key, generateIV());
    //allow the user to download the encrypted file
    const encryptedBlob = new Blob([encryptedFile], { type: 'application/octet-stream' });
    const encryptedBlobUrl = URL.createObjectURL(encryptedBlob);
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = encryptedBlobUrl;
    downloadLink.download = file.name + '.enc';
    downloadLink.style.display = 'block';

    
});

//function to remove the download link href, and display
function resetDownloadLink() {
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.style.display = 'none';
    downloadLink.href = '';
    URL.revokeObjectURL(encryptedBlobUrl);
}


//generate random key and iv
function generateIV() {
const iv = crypto.getRandomValues(new Uint8Array(16));
console.log("IV", iv);
savedIV = iv
return iv;
}   

const key = await crypto.subtle.generateKey({
    name: 'AES-GCM',
    length: 256
},
    true,
    ['encrypt', 'decrypt']
);

console.log(key)
//function to encrypt a file using the key using aes-gcm mode
async function encryptFile(file, key, iv) {
    const fileBuffer = await file.arrayBuffer();
    const fileUint8Array = new Uint8Array(fileBuffer);
    const encryptedFile = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        fileUint8Array
    );
    return encryptedFile;
}

//function to decrypt a file using the key using aes-gcm mode
async function decryptFile(file, key) {
    try {
    const fileBuffer = await file.arrayBuffer();
    console.log('decrepting file')
    const fileUint8Array = new Uint8Array(fileBuffer);
    console.log('fileUint8Array', fileUint8Array)
    const decryptedFile = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: savedIV
        },
        key,
        fileUint8Array
    );
    console.log('Decrypted file:', decryptedFile);
    return decryptedFile;
    } catch (error) {
       throw new Error('Decryption failed' + error.message)
    }
}


//get the text input passphrase

//convert the passphrase to a key






async function deriveKey() {
    // const salt = crypto.getRandomValues(new Uint8Array(16));
    // console.log('salt', salt);
    const enc = new TextEncoder()
    const passphraseInput = document.getElementById('passphrase').value
    const passphraseUint8Array = enc.encode(passphraseInput)
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
            salt : new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
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
return key;

}



fileInput.addEventListener('change', async (event) => {
    // resetDownloadLink()
})
//     console.log('deriving key')
//     const key = await deriveKey();
//     console.log('secret key', key)
//     const file = event.target.files[0];
//     const encryptedFile = await encryptFile(file, key, iv);
//     //allow the user to download the encrypted file
//     const encryptedBlob = new Blob([encryptedFile], { type: 'application/octet-stream' });
//     const encryptedBlobUrl = URL.createObjectURL(encryptedBlob);
//     const downloadLink = document.createElement('a');
//     downloadLink.href = encryptedBlobUrl;
//     downloadLink.download = file.name + '.enc';
//     downloadLink.click();
//     URL.revokeObjectURL(encryptedBlobUrl);


// });

