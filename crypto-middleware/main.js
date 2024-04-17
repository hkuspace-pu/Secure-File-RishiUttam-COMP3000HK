

//click handler for the encrypt button

let savedIV
let encryptedBlob
let progress
const chunkSize  = 1024 // Size of each chunk in bytes


console.log('running main.js')   



//generate random key and iv
function generateIV() {
const iv = crypto.getRandomValues(new Uint8Array(16));
console.log("IV", iv);
savedIV = iv
return iv;
}   


async function encryptFile(file, passphrase, iv) {
  
const key = await deriveKey(passphrase)
console.log('key', key);
console.time('Reading')
console.time('running encryptfile')
    const fileBuffer = await file.arrayBuffer();
    console.timeEnd('running encryptfile')
    const encryptedFile = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: generateIV()
        },
        key,
        fileBuffer
      
    );
    return encryptedFile;

}




//function to decrypt a file using the key using aes-gcm mode
async function decryptFile(file, key) {
    try {
    const fileBuffer = await file.arrayBuffer();
    console.log('decrepting file')

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
       throw new Error('Decryption failed' + error.message)
    }
}


async function deriveKey(passPhrase) {
    console.log('Passphrase', passPhrase)
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
    console.log(key)
return key;

}






export {deriveKey, encryptFile, decryptFile, generateIV}