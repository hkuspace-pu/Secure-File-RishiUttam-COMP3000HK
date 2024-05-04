<template>
  <div class="container">
    <h1 class="text-3xl font-bold underline">Web crypto demo</h1>
    <div>
    <p>Used JS heap size: {{ prettyBytes(memInfo.usedJSHeapSize) }}</p>
  </div>
  <Chart type="bar" :data="chartData" :options="chartOptions" class="h-30rem" />

<div class="boxContainer">
    <div class="box">
      <h2>Encrypt</h2>
      <input ref="fileInput" id="fileInput" type="file" />

      <input v-model="passphrase" type="text" id="passphrase" placeholder="Enter passphrase" />
      
      <button @click="encrypt" id="encryptButton">Encrypt Stream</button>
      <button @click="encryptBuffer" id="encryptButton">Encrypt Buffer</button>
   
      <div class="box">
      <p>AWS Progress</p>
      <ProgressBar :value="awsProgress"></ProgressBar>
      <!-- <progress ref="awsProgress" id="awsProgress" max="100" value="0"></progress> -->
     
    </div>
   
    </div>
     <a ref="downloadLink" id="downloadLink" style="display: none;">Download file</a>

    <!-- <div class="box">
      <h2>Decrypt</h2>
      <input ref="fileInputDec" id="fileInputDecrypt" type="file" />
      <button @click="decrypt" id="decryptButton">Decrypt</button>
      <button @click="decryptStream" id="decryptButton">Decrypt</button>


      <a id="downloadLink" style="display: none;">Download file</a>
    </div> -->


   

    </div>


<p><i @click="listFiles" class="pi pi-cloud-download"></i>
</p>
    <div v-if="data" class="showList">
      <DataTable resizableColumns lazy stripedRows :value="data.Contents" tableStyle="min-width:60rem">
      <!-- <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header"></Column> -->
      <Column>
        <template #body="slotProps">
    <i @click="downloadFile(slotProps.data)" class="pi pi-cloud-download"></i>
    <!-- <i @click="decrypt(slotProps.data)" class="pi pi-cloud-download"></i> -->

  </template>



          </Column>
    <Column field="Key" header="Filename"></Column>
    <Column :field="callPrettyBytes" header="Size"></Column>
    <Column field="LastModified" header="Upload Date"></Column>

</DataTable>

    </div>

    
    
    <!-- <Button label="Submit" /> -->
 
  </div>
</template>

<script setup>
import { ref,onMounted } from "vue";
import * as secure from 'crypto-middleware'
import * as openpgp from 'openpgp';
import { S3Client, ListObjectsV2Command,GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import prettyBytes from 'pretty-bytes'
import Chart from 'primevue/chart';
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
let passphrase = ref('');
let downloadLink = ref(null);
let awsProgress = ref(0);
let value = ref('');
const data = ref(null);
const memInfo = ref({
      jsHeapSizeLimit: 0,
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
    });
  const chartData = ref({labels: ['Q1', 'Q2', 'Q3', 'Q4']});
const chartOptions = ref();


// let downloadLink

const openEncrypt = async () => {
  console.log('OPEN  PGP TEST')
const open = await openpgp.generateKey({ curve: 'brainpoolP512r1',  userIDs: [{ name: 'Test', email: 'test@test.com' }] });
console.log(open)
}

// openEncrypt()

//create a method called encrypt

const updateMemoryInfo = () => {
      if (window.performance && window.performance.memory) {
        memInfo.value = window.performance.memory;
      }
    }

    onMounted(() => {
      // updateMemoryInfo();
      setInterval(updateMemoryInfo, 1000); // Update every second
    });

const encrypt = async () => {
try {

    const file = fileInput.value.files[0];
    const totalBytes = file.size
console.log('ENCRYPT PASS PRHASE', passphrase.value)
    // const encryptedFile = await secure.encryptFile(file, passphrase.value);
        const stream = await secure.startStreaming(file, passphrase.value);



const params = {
    Bucket: "securesend2", // YOUR_BUCKET_NAME
    Key: file.name, // Use the file name as the key
    Body: stream
  };





  // const awsUpload = stream.pipeTo(aws)

  // function aws() {
  //   console.log('AWS UPLOAD')

  // }

  const uploader = new Upload({client,params});
  //track prorgress



uploader.on('httpUploadProgress', (progress) => {
  awsProgress.value = Math.round((progress.loaded / totalBytes) * 100);
     console.log('Upload Progress ' ,  awsProgress.value)
  
});

// console.log("starting upload...")
  const result = await uploader.done();
    console.log("Upload completed:", result);
//     console.timeEnd('READ>ENCRYPT>UPLOAD')

// const data = await client.send(new PutObjectCommand(command) )
// console.log(data)

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
// 


} catch (error) {
console.log('ERROR', error)
}
};



  // // await writable.close();
  // console.timeEnd('startStreaming')
  // progressEmitter.removeEventListener('progress', onProgress);



const encryptBuffer = async () => {
   console.time('BUFFER')
  const file = fileInput.value.files[0];
  const totalBytes = file.size

    let encryptedFile = await secure.encryptFile(file, passphrase.value.value);
    console.log('back in app.vue')
  //upload to s3

  //type of encryptedFile
  // console.log('TYPE', encryptedFile instanceof ArrayBuffer)

  const params = {
    Bucket: "securesend2", // YOUR_BUCKET_NAME
    Key: file.name, // Use the file name as the key
    Body: encryptedFile, // Upload the encrypted file stream
  };


  const uploader =  new Upload({client,params});
  //track prorgress


  
uploader.on('httpUploadProgress', (progress) => {z
  awsProgress.value = Math.round((progress.loaded / totalBytes) * 100);
     console.log('Upload Progress ' ,  awsProgress.value)
})

const result = await uploader.done();
console.log(result)
encryptedFile = null;
  // const data = await client.send(new PutObjectCommand(params) )
    // const uploader = new Upload({client,params});

  // console.timeEnd('BUFFER' )
  // console.log(result)
  // console.log(data)
    // const encryptedBlob = new Blob([encryptedFile], { type: 'application/octet-stream' });
    // const encryptedBlobUrl = URL.createObjectURL(encryptedBlob);
    // downloadLink.value.href = encryptedBlobUrl;
    // downloadLink.value.download = file.name + '.enc';
    // downloadLink.value.style.display = 'block';

}

const decrypt = async () => {
  try {
    downloadLink.value.style.display = 'none';
    const file = fileInputDec.value.files[0];
    console.log(file)
    const decryptedFile = await secure.decryptFile(file, passphrase.value.value);
    const decryptedBlob = new Blob([decryptedFile], { type: 'application/octet-stream' });
    const decryptedBlobUrl = URL.createObjectURL(decryptedBlob);
    downloadLink.value.href = decryptedBlobUrl;
    downloadLink.value.download = file.name
// // //     //click the download link programatticly
    downloadLink.value.click();

  } catch(error) {
    console.log(error)
  }

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
  // console.log('pp',value.Size)
  return prettyBytes(value.Size)
}

const downloadFile = async (rowData) => {
  console.log('PASSPHRASE APP.VUE 229', passphrase.value)
  // try {
  console.log('Downloading')
  const fileHandle = await window.showSaveFilePicker();
  const writable = await fileHandle.createWritable();

//get the object from s3 streaming
const { Key } = rowData;
console.log('KEY', Key)
const params = {
    Bucket: "securesend2",
    Key: Key
  }

const dl = new GetObjectCommand(params);


const {Body} = await client.send(dl);

// temp use to create an array buffer then send to decrypt the whole file

// const arrayBuffer = await response.arrayBuffer();
// console.log(arrayBuffer)
//

const decryptStream = await secure.decryptStream(passphrase.value);
// console.log('DECRYPT STREAM', decryptStream)
const decryptedStream =  Body.pipeThrough(decryptStream);
console.log('DECRYPTED STREAM', decryptedStream)



  // try {
  await decryptedStream.pipeTo(writable);

  // }catch (e){
    // console.log('ERROR', e.message)  }
// const response = new Response(Body);
//     const decryptedBlob = await response.blob();
//     const arrayBuffer = await response.arrayBuffer();
//     const file = new File([arrayBuffer], key);
//    const blob =  await secure.decryptFile(file, passPhrase.value);
    // const decryptedBlobUrl = URL.createObjectURL(decryptedBlob);
    // downloadLink.value.href = decryptedBlobUrl;
    // downloadLink.value.download = Key;
// // //     //click the download link programatticly
    // downloadLink.value.click();
//     console.log('DOWNLAODED');

//     // downloadLink.value.download = file.name + '.enc';
//     // downloadLink.value.style.display = 'block';

  // } catch (error) {
  //   console.log('ERROR', error)
  // }
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

.boxContainer {
  display: flex;
  gap: 1rem;
width: 100%;
justify-content: space-evenly;
}

.box {
  /* border: 1px solid red; */
  padding: 20px;
  /* height: 400px; */
  /* width: 400px; */
}
</style>
