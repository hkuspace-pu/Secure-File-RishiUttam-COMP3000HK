// HASHING

const {createHash} = require('crypto')
//Salt
const {scryptSync, randomBytes} = require('crypto')


function hash(input) {
    const salt = randomBytes(16).toString('hex')
    const encryptedText = createHash('SHA3-512').update(input).digest('hex')
   
}

console.log(hash('helloWorld!!'))
