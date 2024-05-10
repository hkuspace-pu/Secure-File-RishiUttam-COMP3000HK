self.onmessage = ({ data: { wordArray, key } }) => {
    importScripts('https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js');
    const ciphertext = CryptoJS.AES.encrypt(wordArray, key).toString();
    self.postMessage(ciphertext);
  };