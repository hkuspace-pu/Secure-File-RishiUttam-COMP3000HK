<template>
  <div class="container">
    <h1>Web crypto demo</h1>

    <div class="box">
      <h2>Encrypt</h2>
      <input ref="fileInput" id="fileInput" type="file" />

      <input ref="passphrase" type="text" id="passphrase" placeholder="Enter passphrase" />

      <button @click="encrypt" id="encryptButton">Encrypt Stream</button>
      <button @click="encryptBuffer" id="encryptButton">Encrypt Buffer</button>
    </div>
     <a ref="downloadLink" id="downloadLink" style="display: none;">Download file</a>

    <div class="box">
      <h2>Decrypt</h2>
      <input ref="fileInputDec" id="fileInputDecrypt" type="file" />
      <button @click="decrypt" id="decryptButton">Decrypt</button>
      <!-- <a id="downloadLink" style="display: none;">Download file</a> -->
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import * as secure from 'crypto-middleware'
import * as openpgp from 'openpgp';
let fileInput = ref(null);
let fileInputDec = ref(null);
let passPhrase = ref('');
let downloadLink = ref(null);
// let downloadLink

const openEncrypt = async () => {
  console.log('OPEN  PGP TEST')
const open = await openpgp.generateKey({ curve: 'brainpoolP512r1',  userIDs: [{ name: 'Test', email: 'test@test.com' }] });
console.log(open)
}

// openEncrypt()

//create a method called encrypt
const encrypt = async () => {

    const file = fileInput.value.files[0];
    const totalBytes = file.size
    // const encryptedFile = await secure.encryptFile(file, passphrase.value);
        const {stream,progressEmitter} = await secure.startStreaming(file, passphrase.value);
        console.log('stream',stream)
        console.log('progressEmitter', progressEmitter)

        const onProgress = (event) => {
  console.log(`Processed ${event.detail} bytes`);
  // log the pct
  console.log(`Processed ${event.detail / totalBytes * 100}%`);

};
progressEmitter.addEventListener('progress', onProgress);

        if ('showSaveFilePicker' in window) {
  console.log('Yes has FILESYSTEM API!')
  const fileHandle = await window.showSaveFilePicker();
  console.log('finished selected folder', fileHandle)
  console.time('startStreaming')
  const writable = await fileHandle.createWritable();
  await stream.pipeTo(writable);

  // await writable.close();
  console.timeEnd('startStreaming')
  progressEmitter.removeEventListener('progress', onProgress);
} else {

  console.info('File System Access API not supported');
    // const encryptedBlob = new Blob([readable], { type: 'application/octet-stream' });
    const response = new Response(stream);
    const encryptedBlob = await response.blob();
    const encryptedBlobUrl = URL.createObjectURL(encryptedBlob);
    downloadLink.value.href = encryptedBlobUrl;
    downloadLink.value.download = file.name + '.enc';
    downloadLink.value.style.display = 'block';
  }
};


const encryptBuffer = async () => {
  const file = fileInput.value.files[0];
    const encryptedFile = await secure.encryptFile(file, passphrase.value);
    const encryptedBlob = new Blob([encryptedFile], { type: 'application/octet-stream' });
    const encryptedBlobUrl = URL.createObjectURL(encryptedBlob);
    downloadLink.value.href = encryptedBlobUrl;
    downloadLink.value.download = file.name + '.enc';
    downloadLink.value.style.display = 'block';

}

const decrypt = async () => {
    downloadLink.value.style.display = 'none';
    const file = fileInputDec.value.files[0];
    const decryptedFile = await secure.decryptFile(file, passphrase.value);
    const decryptedBlob = new Blob([decryptedFile], { type: 'application/octet-stream' });
    const decryptedBlobUrl = URL.createObjectURL(decryptedBlob);
    downloadLink.value.href = decryptedBlobUrl;
    downloadLink.value.download = file.name + '.dec';
    downloadLink.value.style.display = 'block';
};


</script>


<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 400px;
}

.box {
  border: 1px solid red;
  padding: 20px;
  height: 400px;
  width: 400px;
}
</style>
