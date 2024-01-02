// SYMETRIC ENCRYPTION SHARED PASSWORD

// SENDER AND RECEIVER KNOWS THE SAME PASSWORD

const {createCipheriv,randomBytes,createDecipheriv} = require('crypto')

const message = 'i like turtles'
const key = randomBytes(32)
const iv = randomBytes(16)

const cipher = createCipheriv('aes256',key,iv)

//Encryption

const encryptedText = cipher.update(message, 'utf8', 'hex')
+cipher.final('hex')
// .final('hex');
console.log(encryptedText)

const decipher = createDecipheriv('aes256',key,iv);
const decryptedText = decipher.update(encryptedText,'hex','utf8')
+decipher.final('utf-8')
console.log(decryptedText)

// Limitation with symetric encryption is the shared password problem

// Solved by public key encryption





