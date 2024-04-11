<template>
  <div class="container">
    <h1>Web crypto demo</h1>

    <div class="box">
      <h2>Encrypt</h2>
      <input ref="fileInput" id="fileInput" type="file" />

      <input ref="passphrase" type="text" id="passphrase" placeholder="Enter passphrase" />

      <button @click="encrypt" id="encryptButton">Encrypt</button>
    </div>
    | <a ref="downloadLink" id="downloadLink" style="display: none;">Download file</a>

    <div class="box">
      <h2>Decrypt</h2>
      <input id="fileInputDecrypt" type="file" />
      <button id="decryptButton">Decrypt</button>
      <!-- <a id="downloadLink" style="display: none;">Download file</a> -->
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import * as secure from 'crypto-middleware'
let fileInput = ref(null);
let passPhrase = ref('');
let downloadLink = ref(null);
// let downloadLink


//create a method called encrypt
const encrypt = async () => {
    const file = fileInput.value.files[0];
    const encryptedFile = await secure.encryptFile(file, passphrase.value);
    const encryptedBlob = new Blob([encryptedFile], { type: 'application/octet-stream' });
    const encryptedBlobUrl = URL.createObjectURL(encryptedBlob);
    downloadLink.value.href = encryptedBlobUrl;
    downloadLink.value.download = file.name + '.enc';
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
