
self.importScripts('./sjcl.js');
// import './sjcl'; 
self.onmessage = (event) => {

    // const currentMemory = window.performance.memory.usedJSHeapSize
  const { passphrase, arrayBuffer } = event.data;
  console.log('In Worker ')
  let byteArray = new Uint8Array(arrayBuffer);
  console.log('finish byteARray')
const bitArray = sjcl.codec.bytes.toBits(byteArray) 
console.log('finished converting to bit array')
const enc = sjcl.encrypt("password", bitArray)

// //   const passphrase = sjcl.codec.utf8String.toBits(password)
// const iv = sjcl.codec.utf8String.toBits('IV')
//   console.log('in a worker')

//   const cipher = new sjcl.cipher.aes(password)
//   const enc = sjcl.mode.gcm.encrypt(cipher,bitArray,iv)
// //   const enc = sjcl.cipher.aes.encrypt(password, bitArray);
//   self.postMessage(enc);
console.log('done in ')
self.postMessage(enc)
};

