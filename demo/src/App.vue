<template>
  <div class="container">
    <h1 class="text-3xl font-bold underline">Web crypto demo</h1>

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


    <div v-if="data" class="showList">
      <DataTable resizableColumns lazy stripedRows :value="data.Contents" tableStyle="min-width:60rem">
      <!-- <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header"></Column> -->
      <Column>
        <template #body="slotProps">
    <i @click="downloadFile(slotProps.data)" class="pi pi-cloud-download"></i>
  </template>

          </Column>
    <Column field="Key" header="Filename"></Column>
    <Column :field="callPrettyBytes" header="Size"></Column>
    <Column field="LastModified" header="Upload Date"></Column>

</DataTable>

    </div>

    <!-- <Button label="Submit" /> -->
    <div class="box">
      <p>AWS Progress</p>
      <ProgressBar :value="awsProgress"></ProgressBar>
      <progress ref="awsProgress" id="awsProgress" max="100" value="0"></progress>
      <p>Encrypt Progress</p>
      <progress ref="encryptProgress" id="encryptProgress" max="100" value="0"></progress>
    </div>
  </div>
</template>

<script setup>
import { ref,reactive } from "vue";
import * as secure from 'crypto-middleware'
import * as openpgp from 'openpgp';
import { S3Client, ListObjectsV2Command,GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import prettyBytes from 'pretty-bytes'
const client = new S3Client({ region: "ap-east-1",  credentials: {
    accessKeyId: 'AKIAR3HSJBS3T6F7OSEL', 
    secretAccessKey: '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'
  } })

  import Button from 'primevue/button';
  import ProgressBar from 'primevue/progressbar';
  import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

  // Set the parameters
  
let fileInput = ref(null);
let fileInputDec = ref(null);
let passPhrase = ref('');
let downloadLink = ref(null);
let awsProgress = ref(0);
let encryptProgress = ref(0);
let value = ref('');
const data = ref(null);
// let downloadLink

const openEncrypt = async () => {
  console.log('OPEN  PGP TEST')
const open = await openpgp.generateKey({ curve: 'brainpoolP512r1',  userIDs: [{ name: 'Test', email: 'test@test.com' }] });
console.log(open)
}

// openEncrypt()

//create a method called encrypt

const upload = async (file,stream) => {




}


const encrypt = async () => {
try {
  console.time('READ>ENCRYPT')
    const file = fileInput.value.files[0];
    const totalBytes = file.size

    // const encryptedFile = await secure.encryptFile(file, passphrase.value);
        const {stream,progressEmitter} = await secure.startStreaming(file, passphrase.value);

        const onProgress = (event) => {
          encryptProgress.value.value = event.detail / totalBytes * 100;

};
console.timeEnd('READ>ENCRYPT')
progressEmitter.addEventListener('progress', onProgress);
const params = {
    Bucket: "securesend2", // YOUR_BUCKET_NAME
    Key: file.name, // Use the file name as the key
    Body: stream, // Upload the encrypted file stream
  };
if (true) {
  console.log("STARING UPLOAD S3")
  console.time('READ>ENCRYPT>UPLOAD')
  const uploader = new Upload({client,params});
  //track prorgress

uploader.on('httpUploadProgress', (progress) => {
  awsProgress.value.value = progress.loaded / totalBytes * 100;
     console.log('PROGRESSaws ' ,  awsProgress.value.value)
    // console.log(`Uploaded ${progress.loaded} of ${totalBytes} bytes`);
    // console.log(`Uploaded ${progress.loaded / totalBytes * 100}%`);
});

console.log("starting upload...")
  const result = await uploader.done();
    console.log("Upload completed:", result);
    console.timeEnd('READ>ENCRYPT>UPLOAD')

// const data = await client.send(new PutObjectCommand(uploadParams) )

//FOR SAVING TO FILE USING WRITABLE
  //       if ('showSaveFilePicker' in window) {
  // console.log('Yes has FILESYSTEM API!')
  // const fileHandle = await window.showSaveFilePicker();
  // console.log('finished selected folder', fileHandle)
  // console.time('startStreaming')
  // const writable = await fileHandle.createWritable();
  // await stream.pipeTo(writable);

  // // await writable.close();
  // console.timeEnd('startStreaming')
  // progressEmitter.removeEventListener('progress', onProgress);
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
} catch (error) {
console.log('ERROR', error)
}
};


const encryptBuffer = async () => {
   console.time('BUFFER')
  const file = fileInput.value.files[0];
    const encryptedFile = await secure.encryptFile(file, passphrase.value);
  //upload to s3
  const params = {
    Bucket: "securesend2", // YOUR_BUCKET_NAME
    Key: file.name, // Use the file name as the key
    Body: encryptedFile, // Upload the encrypted file stream
  };
  // const data = await client.send(new PutObjectCommand(params) )
    const uploader = new Upload({client,params});
    const result = await uploader.done();
  console.timeEnd('BUFFER' )
    // const encryptedBlob = new Blob([encryptedFile], { type: 'application/octet-stream' });
    // const encryptedBlobUrl = URL.createObjectURL(encryptedBlob);
    // downloadLink.value.href = encryptedBlobUrl;
    // downloadLink.value.download = file.name + '.enc';
    // downloadLink.value.style.display = 'block';

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


//get a list of files in s3
const listFiles = async () => {
  const { Contents, KeyCount } = await client.send(new ListObjectsV2Command({ Bucket: "securesend2" }));
  data.value = { Contents, KeyCount };
  console.log('DATA', data.value.Contents)
}

//run listFiles on created
listFiles()

const callPrettyBytes = (value) => {
  console.log('pp',value.Size)
  return prettyBytes(value.Size)
}

const downloadFile = async (rowData) => {
  console.log('Downloading')
//get the object from s3 streaming
const { Key } = rowData;
const params = {
    Bucket: "securesend2",
    Key: Key
  }

const dl = new GetObjectCommand(params);
const {Body} = await client.send(dl);
const decrypt = await secure.decryptStream(passPhrase.value)
return Body

// const response = new Response(Body);
//     const encryptedBlob = await response.blob();
//     const encryptedBlobUrl = URL.createObjectURL(encryptedBlob);
//     downloadLink.value.href = encryptedBlobUrl;
//     downloadLink.value.download = Key;
//     //click the download link programatticly
//     downloadLink.value.click();

//     // downloadLink.value.download = file.name + '.enc';
//     // downloadLink.value.style.display = 'block';
}


</script>


<style scoped>

.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 400px;
  max-width: 800px;
  margin: auto;
  padding: 1rem;
}

.box {
  border: 1px solid red;
  padding: 20px;
  height: 400px;
  width: 400px;
}
</style>
