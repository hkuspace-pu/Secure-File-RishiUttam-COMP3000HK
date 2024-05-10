<template>
  <div class="container">
<Dialog></Dialog>
<Toast />
 <div class="boxContainer">

    <div class="box">
   
      <div class="tabMenu">
        <TabMenu v-model:activeIndex="activeTab" :model="items" />

      </div>
     
      <div class="encryptBox" v-if="activeTab === 0" id="encrypt">

<FileUpload chooseLabel="Select File" mode="basic" name="demo[]"  ref="fileInput" id="fileInput">
  <!-- <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
  </template> -->
</FileUpload>

<FloatLabel>
<Password  promptLabel="Passphrase" v-model="passphrase" inputId="passphrase" toggleMask />
<label for="passphrase">Passphrase (symmetric key)</label>
</FloatLabel>

<div v-if="awsProgress < 100" class="submenu">
      <button :disabled="!fileInput?.files[0]" @click="uploadOnly" id="encryptButton">Upload Only</button>
      <button :disabled="!fileInput?.files[0] || !passphrase" @click="openPGP" id="encryptButton">Use OpenPGP Encryption</button>
      <button :disabled="!fileInput?.files[0] || !passphrase" @click="openPGPStream" id="encryptButton">Use OpenPGP Strteam Encryption</button>
      <button  @click="runCryptoJS" id="encryptButton">Use Crypto-JS Package</button>
      <button :disabled="!fileInput?.files[0] || !passphrase" @click="encrypt" id="encryptButton">Use SecureSend</button>
      <button  @click="standfordAes" id="encryptButton">Standford AES</button>
      <button  @click="useForge" id="encryptButton">Use Forge</button>

      
      <button @click="genKey" id="encryptButton">GenKey</button>
      <!-- <button @click="encryptPassPhrase " id="encryptButton">RSAPassphrase</button> -->
</div>
<div v-else>
<p>All done!</p>
<button @click="copyKey">{{copyText}}</button>
<button @click="encryptKey">Encrypt Key 🔐 (RSA)</button>
<button @click="clearFile">Send Another?</button>
</div>
   
    </div>
    <div class="encryptBox" v-else id="decrypt">


  <FileUpload mode="basic"  ref="fileInputDecrypt" chooseLabel="Add encrypted file"  name="demo[]" >

</FileUpload>


<div class="radioOptions">
  <input type="radio" id="passphrase" value="passphrase" v-model="decryptMethod">
 <label for="passphrase">Use passphrase</label>

  <input type="radio" id="privateKey" value="privateKey" v-model="decryptMethod">
  <label for="privateKey">Use my PrivateKey</label>
</div>


<FloatLabel v-if="decryptMethod === 'passphrase'">
<Password  promptLabel="Passphrase" v-model="passphrase" inputId="passphrase" toggleMask />
<label for="passphrase">Passphrase (symmetric key)</label>
</FloatLabel>

<div class="fileSpacer" v-else>

  <FileUpload mode="basic" ref="fileEncryptedKey"  class="fileSpacer" chooseLabel="Add the encrypted Key"  name="demo[]" />
  <FileUpload mode="basic" ref="fileYourPrivateKey" accept=".json" chooseLabel="Add your Private Key"  name="demo[]" />

</div>




   <button :disabled="checkDisabledDecrypt" @click="fileInputDecryptFn" id="decryptButton">Decrypt</button>
</div>
  </div>





<div class="box wide">
  <apexchart type="line"  height="400" ref="chart" :options="chartOptions" :series="series"></apexchart>
</div>
  </div>

<div class="boxContainer">

     <a ref="downloadLink" id="downloadLink" style="display: none;">Download file</a>

  
    <div class="box">
    <div class="info">
      <div>Memory usage: {{ prettyBytes(memInfo.usedJSHeapSize) }}</div>
      <div v-show="highestMem">Peak: {{ prettyBytes(highestMem) }}</div>
    </div>



     <apexchart ref="timersBar"  :options="barChartTimerOptions" :series="timers"></apexchart>

  </div>


  <div class="box">
    <apexchart type="radialBar" ref="radialRef" :options="radialOptions" :series="radialSeries"></apexchart>

  </div>
   

    </div>


<div class="refreshIcon"><i @click="listFiles" style="font-size: 1.5rem" class="pi pi-sync"></i>
<h4>AWS Console File List</h4></div>

    <div v-if="data" class="showList">

      <DataTable resizableColumns lazy stripedRows :value="data.Contents" tableStyle="min-width:60rem">
      <!-- <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header"></Column> -->
      <Column>
        <template #body="slotProps">
    <i @click="downloadFile(slotProps.data)" class="pi pi-cloud-download"></i>
    <i @click="downloadFileUnecrypted(slotProps.data)" class="pi pi-cloud-download"></i>
    <!-- <i @click="decrypt(slotProps.data)" class="pi pi-cloud-download"></i> -->

  </template>



          </Column>
    <Column field="Key" header="Filename"></Column>
    <Column :field="callPrettyBytes" header="Size"></Column>
    <Column field="LastModified" header="Upload Date"></Column>

</DataTable>

    </div>

    
    
    <!-- <Button label="Submit" /> -->
 <div class="foot"><p>COMP3000HK - Final Year Project Demo. Client-side Encryption: The Key to Cloud Confidentiality. Rishi Uttam</p></div>
  </div>
</template>

<script setup>
import { ref,reactive,computed,onMounted,nextTick  } from "vue";
import * as secure from 'crypto-middleware'
import * as openpgp from 'openpgp';
import { S3Client, ListObjectsV2Command,GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload} from "@aws-sdk/lib-storage";
import prettyBytes from 'pretty-bytes'
import FileUpload from 'primevue/fileupload';
import {useStore} from './store/store'
import Password from 'primevue/password';
import FloatLabel from 'primevue/floatlabel';
import TabMenu from 'primevue/tabmenu';
import { useToast } from 'primevue/usetoast';
import forge from 'node-forge'






//CRYPTO JS
// var CryptoJS = require("crypto-js");
// import sha256 from 'crypto-js/sha256';
// var AES = require("crypto-js/aes");
import CryptoJS from 'crypto-js'
;
// import * as wordArray from 'crypto-js/lib/WordArray'

const toast = useToast();
const store = useStore()
// import * as awscrypto from '@aws-crypto/client-browser'

// store()
const client = new S3Client({ region: "ap-east-1",  credentials: {
    accessKeyId: 'AKIAR3HSJBS3T6F7OSEL', 
    secretAccessKey: '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'
  } })
import Dialog from './components/Dialog.vue'
  import Button from 'primevue/button';
  import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tooltip from 'primevue/tooltip';
// import MyWorker from "./workers/comlink?worker";
let decryptMethod = ref('passphrase');
let copyText = ref('Copy Symmetric key');
let fileYourPrivateKey = ref(null)
let fileEncryptedKey = ref(null)
  let privateKey = ref(null)
  let publicKey = ref(null)
let fileInput = ref(null);
let fileInputDecrypt = ref(null);
let fileInputDec = ref(null);
let downloadLink = ref(null);
let awsProgress = ref(0);
let highestMem = ref(0)
let usageHighMem = ref([])
const data = ref(null);
const memInfo = ref({
      jsHeapSizeLimit: 0,
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
    });

    const activeTab = ref(0);
    const items = ref([
    { label: 'Encrypt File', icon: 'pi pi-lock' },
    { label: 'Decrypt File', icon: 'pi pi-lock-open' },
  
]);
    const chart = ref();
    const radialRef = ref();
    const passphrase = computed({
      get: () => store.passphrase,
      set: (value) => store.setPassphrase(value) // replace with your action
    });

    const barChartTimerOptions = ref({
      chart: {
        height: 'auto'
        // type: '',
   
      }, 
      
      plotOptions :{ 

        bar: {

          columnWidth: '25%'
        } 

      },
        xaxis: {
              categories: ['Baseline', 'OPENPGP', 'Crypto-JS', 'SecureSend'],
    },
    yaxis: [
    {
      seriesName: 'Column A',
      axisTicks: {
        show: true
      },
      axisBorder: {
        show: true,
      },
      title: {
        text: "Duration (ms)"
      }
    },
    {
      opposite: true,
      seriesName: 'Line C',
      axisTicks: {
        show: true
      },
      axisBorder: {
        show: true,
      },
      title: {
        text: "Memory (MB)"
      },labels :{
                formatter: function(val) {
                  return prettyBytes(val)
                } 
              },
    }
  ], 
    
  // colors: ['#99C2A2', '#C5EDAC', '#66C7F4'],
    
    title: {
              text: 'Time taken (ms)',
              align: 'left'
            },
            // subtitle : {
            //   text: 'Lower is better'
              
            // }
  }
    )
    

      const radialOptions = ref({
        chart: {
          id: 'radial',
          type: 'radialBar',
          
        },labels: ['Progress'],

      })

    const chartOptions = ref({
            chart: {
              id: 'realtime',
              height: 350,
              type: 'line',
              animations: {
                enabled: false,
                easing: 'linear',
    
                dynamicAnimation: {
                  enabled:true,
                  speed: 1500
                },
           
              },
              toolbar: {
                show: true
              },
              legend : {
                show:true
              },
              zoom: {
                enabled: true
              }
            },
            dataLabels: {
              enabled: false
            },
            stroke: {
              curve: 'smooth'
            },
              title: {
              text: 'Memory Buffer',
              align: 'left'
            },
                markers: {
              size: 0
            },
               xaxis: {
              type: 'datetime',
              title  : {
                text: 'Time'
              }
             
              // range: 30

            },
               yaxis: {
                min: 0,
              max: 200000000, // 100MB,
              labels :{
                formatter: function(val) {
                  return prettyBytes(val)
                } 
              },
              title  : {
                text: 'Memory Usage'
              }
            },
            legend: {
              show: false
            },
          });
          
    const series = ref([
        {
          name: 'Memory',
          data: []
          // data: traffic2.value.slice()
       
        }
      ]);

      const timers = ref([
        {
          name: 'Duration',
          type: 'column',
          data: []
          // data: traffic2.value.slice()
       
        },
        {
        name: 'Memory',
        type: 'line',
        data: [],
        
        }
      ]);


      const radialSeries = ref([0])
  

// let downloadLink
const onAdvancedUpload = async (e) => {
console.log('uploaded', e)
}


const genKey = async () => {
  if (!passphrase.value || !validatePassphrase(passphrase.value)) {
    alert("Passphrase should be minimum of 10 char and contain lowercase, uppercase, number and  special chars.");

    return;
  }

   const keys = await secure.generateKeyPair()
   publicKey.value = keys.publicKey
   privateKey.value = keys.privateKey
   console.log(publicKey.value)
}

const validatePassphrase = (passphrase) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  return regex.test(passphrase);
}

const encryptPassPhrase = async () => {
  if (!passphrase.value || !validatePassphrase(passphrase.value)) {
    alert("Passphrase should be minimum of 10 char and contain lowercase, uppercase, number and  special chars.");
    return;
  }
  const reply = await secure.encryptPassPhraseWithPublicKey(publicKey.value,passphrase.value)
  console.log('enctypted passphrase: ',reply)
}

const uploadOnly = async () => {
  console.log('Testing upload perofmrance only')
  const startTime = performance.now(); 
  const file = fileInput.value.files[0];
    const totalBytes = file.size
    const fileName = file.name
    const currentMemory = window.performance.memory.usedJSHeapSize
    const checkMem = setInterval(returnMaxMem, 500);
    // let fileBuffer = await file.arrayBuffer()
    // const uint8Array = new Uint8Array(fileBuffer);
  const result = await uploadS3(fileName,totalBytes ,file)
   clearInterval(checkMem)
  const endTime = performance.now(); // Capture end time
    console.log(`Upload Only Baseline ${endTime - startTime} milliseconds.`)
    timers.value[0].data.push(parseFloat((endTime - startTime).toFixed(2)))
    timers.value[1].data.push((Math.max(...usageHighMem.value)) - currentMemory)
 
    usageHighMem.value = []
}


const openPGPStream = async () => {
  try {
  console.log('OPEN  PGP TEST')
  const startTime = performance.now(); 
   const file = fileInput.value.files[0];
    const totalBytes = file.size
    const fileName = file.name
    const currentMemory = window.performance.memory.usedJSHeapSize
    const checkMem = setInterval(returnMaxMem, 500);
  //  let fileBuffer = await file.arrayBuffer()
   const fileStream = file.stream();
    // const message = await openpgp.createMessage({ binary: new Uint8Array(fileBuffer) });
    const message = await openpgp.createMessage({ binary: fileStream });

    const encrypted = await openpgp.encrypt({
 message:message, // input as Message object
        passwords: ['secret stuff'], // multiple passwords possible
        format: 'binary' // don't ASCII armor (for Uint8Array output)
    });
    
const result = await uploadS3(fileName,totalBytes ,encrypted, 0)
console.log('finished pgp encrypt')
const endTime = performance.now(); // Capture end time
clearInterval(checkMem)
    console.log(`OPEN PGP Streaming Encryhption took ${endTime - startTime} milliseconds.`);
    timers.value[0].data.push(parseFloat((endTime - startTime).toFixed(2)))
    timers.value[1].data.push((Math.max(...usageHighMem.value)) - currentMemory)
    usageHighMem.value = []
    // store.openModal()
   
  } catch (e) {
    console.log(e)
    toast.add({ severity: 'error', summary: 'Failed', detail: `OPENPGP Streaming Failed - ${e}`, life: 4000 })

  }

}

const openPGP = async () => {
  console.log('OPEN  PGP TEST')
  const startTime = performance.now(); 
   const file = fileInput.value.files[0];
    const totalBytes = file.size
    const fileName = file.name
    const currentMemory = window.performance.memory.usedJSHeapSize
    const checkMem = setInterval(returnMaxMem, 500);
   let fileBuffer = await file.arrayBuffer()
  //  const fileStream = file.stream();
    const message = await openpgp.createMessage({ binary: new Uint8Array(fileBuffer) });
    // const message = await openpgp.createMessage({ binary: fileStream });
    
    const encrypted = await openpgp.encrypt({
 message:message, // input as Message object
        passwords: ['secret stuff'], // multiple passwords possible
        format: 'binary' // don't ASCII armor (for Uint8Array output)
    });
    
const result = await uploadS3(fileName,totalBytes ,encrypted, 0)
console.log('finished pgp encrypt')
const endTime = performance.now(); // Capture end time
clearInterval(checkMem)
    console.log(`OPEN PGP EBuffer Encryption took ${endTime - startTime} milliseconds.`);
    timers.value[0].data.push(parseFloat((endTime - startTime).toFixed(2)))
    timers.value[1].data.push((Math.max(...usageHighMem.value)) - currentMemory)
    usageHighMem.value = []
    // store.openModal()
   

}



const s3encrypt = async () => {
  const plainText = new Uint8Array([1, 2, 3, 4, 5])
  // const { result } = await awscrypto.encrypt('1234', plainText, { encryptionContext: context })
console.log(result) 
}




const returnMaxMem = () => {
  //get the memory from window.performance.memory.jsheapmemory
  
  
  usageHighMem.value.push(window.performance.memory.usedJSHeapSize)



}


const updateMemoryInfo = async () => {

 
        memInfo.value = window.performance.memory;
        // memInfo.value = await performance.measureUserAgentSpecificMemory()
        const offset = 8;  // Adjust by 8 hours
        const millisecondsPerHour = 60 * 60 * 1000;
const adjustedNow = Date.now() + offset * millisecondsPerHour;
// const adjustedSixtySecondsAgo = adjustedNow - 60 * 1000;  // 60 seconds ago

const max = Math.max(...series.value[0].data.map(dataPoint => dataPoint[1]));
if (max > highestMem.value) {
  highestMem.value = max;
  }

if (max > 200000000) {
  chart.value.updateOptions({
          yaxis: {
            max: max + 10000000,
            labels :{
                formatter: function(val) {
                  return prettyBytes(val)
                } 
              },
          },
        });
}
series.value[0].data.push([adjustedNow,memInfo.value.usedJSHeapSize]);   
      

        if (series.value[0].data.length > 90) { // Keep only the last 120 data points
          series.value[0].data.shift();
        }
    }

    onMounted(() => {
      setInterval(updateMemoryInfo, 1500); // Update every second
  
    });

const encrypt = async () => {
try {
  const startTime = performance.now(); 
  const currentMemory = window.performance.memory.usedJSHeapSize
  const checkMem = setInterval(returnMaxMem, 500);
    const file = fileInput.value.files[0];
    const totalBytes = file.size

radialRef.value.updateOptions({
labels : ['Uploading']
}) 
    // const encryptedFile = await secure.encryptFile(file, passphrase.value);
        const stream = await secure.startStreaming(file, passphrase.value);




 await uploadS3(file.name,totalBytes ,stream,1)
console.log('FINISHED SECURE SEND ECRYPT')
radialRef.value.updateOptions({
labels : ['Uploaded']
}) 
clearInterval(checkMem)
const endTime = performance.now(); // Capture end time
    console.log(`SecureSend Took ${endTime - startTime} milliseconds.`);
    timers.value[0].data.push(parseFloat((endTime - startTime).toFixed(2)))
    timers.value[1].data.push((Math.max(...usageHighMem.value)) - currentMemory)
    usageHighMem.value = []



} catch (error) {
console.log('ERROR', error)
}
};



const uploadS3 = async (fileName, totalBytes ,stream,index) => {

  try {
  const params = {
    Bucket: "securesend2", // YOUR_BUCKET_NAME
    Key: fileName, // Use the file name as the key
    Body: stream
  };
console.log('Starting Upoad')
  const uploader = new Upload({client,params});
  uploader.on('httpUploadProgress', (progress) => {
  awsProgress.value = Math.round((progress.loaded / totalBytes) * 100);
  radialSeries.value[0] = awsProgress.value
    
  
});


const result = await uploader.done();
toast.add({ severity: 'success', summary: 'Success', detail: 'File Encryption & Uploading Success', life: 4000 })

 
    // store.isPublicKeyModalOpen=true
return result
  }catch (e) {
    console.log('Upload Error',e)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Upload Error, try again', life: 4000 })

  }
}

const encryptKey = async () => {

  store.isPublicKeyModalOpen=true
  // console.log('ENCRYPTED KEY', encryptedKey)

}



const encryptBuffer = async () => {
   console.time('BUFFER')
  const file = fileInput.value.files[0];
  const totalBytes = file.size

    let encryptedFile = await secure.encryptFile(file, passphrase.value.value);
   
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
    
})

const result = await uploader.done();
console.log(result)
encryptedFile = null;


}

const copyKey = async () => {
  try {
    await navigator.clipboard.writeText(passphrase.value);
    console.log('Passphrase copied to clipboard');
    copyText.value = 'Copied!'
  } catch (err) {
    console.log('Failed to copy passphrase: ', err);
  }

}

const clearFile = async () => {
  //  const fileInputComponent = this.$refs.fileInput;
   fileInput.value.clear();
  passphrase.value = null;
  copyText.value = 'Copy Symmetric key'
  awsProgress.value = null;
  radialSeries.value = [0]

}


const fileInputDecryptFn = async() => {
  try {
  const file = fileInputDecrypt.value.files[0];
    const fileHandle = await window.showSaveFilePicker();
  const writable = await fileHandle.createWritable();
  const fileStream = file.stream();
  let  decryptStream;
  if (decryptMethod.value === 'passphrase') {
    decryptStream = await secure.decryptStream(passphrase.value);
  } else {
    console.log('You are using PKI')
    const yourPrivateKeyFile= fileYourPrivateKey.value.files[0];
    const yourPrivateKeyFileString = await yourPrivateKeyFile.text();
    const encryptedKeyFile = fileEncryptedKey.value.files[0];
    const arrayBuffer = await encryptedKeyFile.arrayBuffer();
    
    const decryptedSharedKey = await secure.decryptPassPhraseWithPrivateKey(yourPrivateKeyFileString,arrayBuffer )
    console.log('DECRYPTED KEY', decryptedSharedKey)
    // const privateKey = await privateKeyFile.text();
    // console.log(privateKey)
    decryptStream = await secure.decryptStream(decryptedSharedKey);
  }
  const decryptedStream = fileStream.pipeThrough(decryptStream);

  await decryptedStream.pipeTo(writable);
  }catch (e) {
    toast.add({ severity: 'error', summary: 'Failed', detail: 'Decryption  failed!', life: 6000 })

  }

}

//NOT USED
// const decrypt = async () => {
//   try {
//     downloadLink.value.style.display = 'none';
//     const file = fileInputDec.value.files[0];
//     console.log(file)
//     const decryptedFile = await secure.decryptFile(file, passphrase.value.value);
//     const decryptedBlob = new Blob([decryptedFile], { type: 'application/octet-stream' });
//     const decryptedBlobUrl = URL.createObjectURL(decryptedBlob);
//     downloadLink.value.href = decryptedBlobUrl;
//     downloadLink.value.download = file.name
// // // //     //click the download link programatticly
//     downloadLink.value.click();

//   } catch(error) {
//     console.log(error)
//   }

// };


//get a list of files in s3
const listFiles = async () => {
  const { Contents, KeyCount } = await client.send(new ListObjectsV2Command({ Bucket: "securesend2" }));
  data.value = { Contents, KeyCount };
  // console.log('DATA', data.value.Contents)
}

//run listFiles on created
listFiles()

const callPrettyBytes = (value) => {
  // console.log('pp',value.Size)
  return prettyBytes(value.Size)
}

const downloadFile = async (rowData) => {

try {
  const fileHandle = await window.showSaveFilePicker();
  const writable = await fileHandle.createWritable();

//get the object from s3 streaming
const { Key } = rowData;

const params = {
    Bucket: "securesend2",
    Key: Key
  }

const dl = new GetObjectCommand(params);
const response = await client.send(dl);
const {Body}= response.Body;

const decryptStream = await secure.decryptStream(passphrase.value);
// console.log('DECRYPT STREAM', decryptStream)
const decryptedStream =  Body.pipeThrough(decryptStream);

  await decryptedStream.pipeTo(writable);
 
}catch (e) {
  console.log(e)
  toast.add({ severity: 'error', summary: 'Failed', detail: `Decryption Failed - ${e}`, life: 4000 })

}
}


const downloadFileUnecrypted = async (rowData) => {
  try {
  const fileHandle = await window.showSaveFilePicker();
  const writable = await fileHandle.createWritable();

//get the object from s3 streaming
const { Key } = rowData;

radialRef.value.updateOptions({
labels : ['Downloading']
}) 
const params = {
    Bucket: "securesend2",
    Key: Key
  }

const dl = new GetObjectCommand(params);
const response = await client.send(dl);
const Body = response.Body
let downloadedSize = 0;
const progressStream = new TransformStream({
      transform(chunk, controller) {
        downloadedSize += chunk.length;
        // const progress = downloadedSize / response.ContentLength;
        awsProgress.value = Math.round((downloadedSize / response.ContentLength) * 100);
         radialSeries.value[0] = awsProgress.value
        controller.enqueue(chunk);
      }
    });

// await Body.pipeTo(writable);
   await Body.pipeThrough(progressStream).pipeTo(writable)
   radialRef.value.updateOptions({
labels : ['Downloaded']
}) 
}catch (e) {
  console.log(e)
  toast.add({ severity: 'error', summary: 'Failed', detail: `Decryption Failed - ${e}`, life: 4000 })

}
}

const checkDisabledDecrypt = computed(() =>{
  if (decryptMethod.value == 'passphrase') {
    return !fileInputDecrypt.value?.files[0] || !passphrase.value
  }  else {
    return !fileInputDecrypt.value?.files[0] || !fileYourPrivateKey.value?.files[0]
  }
})


const runCryptoJS =async() => {

  try {
  // const worker = new Worker('./workers/cryptoJSworker.js');
  const startTime = performance.now(); 
  const file = fileInput.value.files[0];
   const totalBytes = file.size
    const fileName = file.name
    const currentMemory = window.performance.memory.usedJSHeapSize
    const checkMem = setInterval(returnMaxMem, 500);
    
    let fileBuffer = await file.arrayBuffer()
    const u8 = new Uint8Array(fileBuffer)

    const wordArray =  CryptoJS.lib.WordArray.create(u8)

    var ciphertext =  CryptoJS.AES.encrypt(wordArray, passphrase.value)
    var uint8Array = new TextEncoder().encode(ciphertext);
    await nextTick();
    const result = await uploadS3(fileName,totalBytes ,uint8Array, 0)
    // console.log(result)
    console.log('finished CRYPTOJS')
    const endTime = performance.now(); 
    clearInterval(checkMem)
      console.log(`CRYPTO JS Encryption took ${endTime - startTime} milliseconds.`);
    timers.value[0].data.push(parseFloat((endTime - startTime).toFixed(2)))
    timers.value[1].data.push((Math.max(...usageHighMem.value)) - currentMemory)
    usageHighMem.value = []

  } catch (e) {
    toast.add({ severity: 'error', summary: 'Failed', detail: `CryptoJS Failed - ${e}`, life: 4000 })

  }
} 


const standfordAes = async() => {
  try {
// Disabled as Wokers dont provide memory and the code stalls at 200mb.
// const worker = new Worker(new URL('./workers/comlink.js', import.meta.url), { type: 'classic' });
// const decrypt = sjcl.decrypt(encrypt.ct,)
const startTime = performance.now(); 
  const currentMemory = window.performance.memory.usedJSHeapSize
const checkMem = setInterval(returnMaxMem, 500);
const file = fileInput.value.files[0];
   const totalBytes = file.size
    const fileName = file.name
let arrayBuffer = await file.arrayBuffer();
console.log('starting Standford')
// worker.postMessage({ passphrase: 'test', arrayBuffer: arrayBuffer }, [arrayBuffer]);
let byteArray = new Uint8Array(arrayBuffer);
const bitArray = sjcl.codec.bytes.toBits(byteArray)
console.log('starting Standford')
// worker.postMessage({ passphrase: 'test', bitArray: bitArray });
const enc = sjcl.encrypt("password", bitArray)
// const blob = new Blob([enc]); // Did not work
const encoder = new TextEncoder();
const arrayBufferAWS = encoder.encode(enc);
console.log('finished encryption!')
await nextTick();
const result = await uploadS3(fileName,totalBytes ,enc , 0)
const endTime = performance.now(); 
    clearInterval(checkMem)
    console.log(`Standford Lib Encryption took ${endTime - startTime} milliseconds.`);
    timers.value[0].data.push(parseFloat((endTime - startTime).toFixed(2)))
    timers.value[1].data.push((Math.max(...usageHighMem.value)) - currentMemory)
    usageHighMem.value = []
console.log(result)

// worker.onmessage = (event) => {
//   console.log('back from worker')
//   console.log(event.data)

//   };
 


}catch(e) {
  toast.add({ severity: 'error', summary: 'Failed', detail: `Stanford Library - ${e}`, life: 4000 })

}

}

const useForge = async () => {

  const startTime = performance.now(); 
  const currentMemory = window.performance.memory.usedJSHeapSize
const checkMem = setInterval(returnMaxMem, 500);
  const file = fileInput.value.files[0];
  const totalBytes = file.size
    const fileName = file.name
    let arrayBuffer = await file.arrayBuffer();
  var salt = forge.random.getBytesSync(128);
var key = forge.pkcs5.pbkdf2(passphrase.value, salt, 10, 16);
var iv = forge.random.getBytesSync(16);
console.log('Starting Forge Encryption')
var cipher = forge.cipher.createCipher('AES-GCM', key);
cipher.start({iv: iv});
cipher.update(forge.util.createBuffer(arrayBuffer));
cipher.finish();
var encrypted = cipher.output.data;
console.log('Creating Blob Stream')
var blob = new Blob([encrypted]);
var stream = blob.stream();
//next tick
// Use nextTick to delay the upload until the next DOM update cycle
await nextTick();
const result = await uploadS3(fileName,totalBytes ,stream , 0)
const endTime = performance.now(); 
    clearInterval(checkMem)
    console.log(`Forge Encryption took ${endTime - startTime} milliseconds.`);
    timers.value[0].data.push(parseFloat((endTime - startTime).toFixed(2)))
    timers.value[1].data.push((Math.max(...usageHighMem.value)) - currentMemory)
    usageHighMem.value = []

// outputs encrypted hex
// console.log(encrypted.toHex());
}


</script>

<style>

html
body {
 padding:0;
 margin:0;
}
</style>

<style scoped>

.container {
  display: flex;
  flex-direction: column;
  /* gap: 1rem; */
  /* height: 400px; */
  /* width: 1600px; */
  /* max-width: 98vw; */
  /* margin: auto; */
  /* margin:0; */
  /* padding:0; */
  /* padding: 1rem; */
  /* padding-top:0; */
  /* margin-top:0; */

 
}


.showList {
  padding:1rem;
  margin:0.5rem;
}

.refreshIcon {
  display:flex;
  align-items:center;
  gap:1rem;
  cursor:pointer;
  margin-top:0.5rem;
margin-left: 2rem;
}
.boxContainer {
  display: flex;
  gap: 1rem;
  margin:1rem;
flex-direction:row;

}

.tabMenu {
background: #1f0e0e;
width: fit-content;
margin:auto;
border-bottom:1px solid rgb(230, 230, 230);
/* width: 100%; */
  
}
.box {
  /* border: 1px solid red; */
  padding: 12px;
  /* margin:auto; */
  border-radius:5px;
display:flex;
/* justify-content:space-evenly; */
gap:5px;
min-width: 420px;
/* height: 100%; */
/* height: fit-content; */
flex-direction:column;
/* align-items:center; */
border:1px solid rgb(230, 230, 230);
box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.1);
  /* height: 400px; */
  /* width: 400px; */

}

.wide {
/* margin:auto; */
  /* flex:2; */
  width: 100%;
  /* width: 600px; */
}
.info {
  display:flex;
  flex-direction:row;
  gap:1rem;
}
.box input {
  padding:7px;
  border-radius:2px;
  border:1px solid rgb(129, 129, 129)
}


.section {
  display:flex;
  flex-direction:column;
  /* border:1px solid red; */
  gap:2rem;
  /* justify-content:space-evenly; */

}

.radioOptions {
  display:flex;
  flex-direction:row;
  /* border:1px solid red; */
  gap:1rem;
  /* justify-content:space-between; */
}

.fileSpacer  {
display:flex;
gap:1rem;
}

.encryptBox {
  margin: 1.5rem 0;
  display:flex;
  flex-direction:column;
  /* gap:1.5rem; */
  justify-content: space-between;
align-items: center;
  height: 100%;
  /* border:1px solid red; */
}

.foot {
  margin-top:3rem;
  color:white;
  padding:0.2rem 0.5rem;
  background-color: #2563eb;
}


</style>
