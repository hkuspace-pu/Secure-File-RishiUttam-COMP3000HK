import * as openpgp from "openpgp";
import { createPinia } from 'pinia';
import { useStore } from "../store/store";
import * as secure from "crypto-middleware";
import CryptoJS from "crypto-js"
import forge from "node-forge/dist/forge.min.js";
import { sjcl } from "../sjcl.js";

const pinia = createPinia();
const store = useStore(pinia);

const utils = {

      
     async CryptoJS(file) {

      encrypt: {
      let fileBuffer = await file.arrayBuffer();
      let u8 = new Uint8Array(fileBuffer);
      const wordArray = CryptoJS.lib.WordArray.create(u8);
      const ciphertext = CryptoJS.AES.encrypt(wordArray, passphrase.value);
      let encrypted = new TextEncoder().encode(ciphertext);
      return encrypted
      }
      decrypt: {
        
      }

    },
    async SecureSend(file) {
 
        const stream = await secure.startStreaming(file, passphrase.value);
      
      return stream
    },
    async OpenPGPStream (file) {
  
      const fileStream = file.stream();
      const message = await openpgp.createMessage({ binary: fileStream });
      const encrypted = await openpgp.encrypt({
        message: message, // input as Message object
        passwords: [store.passphrase.value], // multiple passwords possible
        format: "binary", // don't ASCII armor (for Uint8Array output)
      });
      return encrypted
  
    },
    async Stanford(file) {
      // let arrayBuffer = await file.arrayBuffer();
      // let byteArray = new Uint8Array(arrayBuffer);
      // const bitArray = sjcl.codec.bytes.toBits(byteArray);
      // const encrypted = sjcl.encrypt("password", bitArray);
      // return encrypted
      const byteArray = new Uint8Array(await file.arrayBuffer());
      const encrypted = sjcl.encrypt("password", sjcl.codec.bytes.toBits(byteArray));
      return encrypted;
    },

    async Forge(file) {
      const arrayBuffer = await file.arrayBuffer();
      const salt = forge.random.getBytesSync(128);
      const key = forge.pkcs5.pbkdf2(passphrase.value, salt, 10, 16);
      const iv = forge.random.getBytesSync(16);
      const cipher = forge.cipher.createCipher("AES-GCM", key);
      cipher.start({ iv: iv });
      cipher.update(forge.util.createBuffer(arrayBuffer));
      cipher.finish();
       return cipher.output.data;

    }


    // more functions as needed
  };
  
  export default utils