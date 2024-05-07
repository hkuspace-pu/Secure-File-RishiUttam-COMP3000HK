<template>
  <div class="container">
    <!-- <h2 class="text-2xl font-bold underline">Secure Send - Demonstration</h2> -->
 


  <apexchart type="line" height="350"  ref="chart" :options="chartOptions" :series="series"></apexchart>

  

<div class="boxContainer">
    <div class="box">
      <h3>Secure Send - Encrypt</h3>
      <!-- <input ref="fileInput" id="fileInput" type="file" /> -->
<FileUpload mode="basic" name="demo[]"  ref="fileInput" id="fileInput" />


      <input v-model="passphrase" type="text" id="passphrase" placeholder="Enter passphrase" />
      <button @click="uploadOnly" id="encryptButton">Upload Only</button>
      <button @click="encrypt" id="encryptButton">Encrypt Stream</button>
      <button @click="encryptBuffer" id="encryptButton">Encrypt Buffer</button>
      <button @click="openPGP" id="encryptButton">OpenPGP</button>
            <button @click="s3encrypt" id="encryptButton">AS33</button>
   
      <!-- <div class="box"> -->
      <!-- <p>AWS Progress</p> -->
      <ProgressBar :value="awsProgress"></ProgressBar>
      <!-- <progress ref="awsProgress" id="awsProgress" max="100" value="0"></progress> -->
     
    <!-- </div> -->
   
    </div>
     <a ref="downloadLink" id="downloadLink" style="display: none;">Download file</a>

    <!-- <div class="box">
      <h2>Decrypt</h2>
      <input ref="fileInputDec" id="fileInputDecrypt" type="file" />
      <button @click="decrypt" id="decryptButton">Decrypt</button>
      <button @click="decryptStream" id="decryptButton">Decrypt</button>


      <a id="downloadLink" style="display: none;">Download file</a>
    </div> -->
    <div class="box">
        <apexchart type="radialBar" height="350" :options="chartOptions" :series="radialSeries"></apexchart>
      </div>
    <div class="box">
    <p>Used JS heap size: {{ prettyBytes(memInfo.usedJSHeapSize) }}</p>
     <p v-show="highestMem">Max memory: {{ prettyBytes(highestMem) }}</p>
     <p>{{timers.data}}</p>

     <apexchart type="bar" height="350" ref="timersBar" :options="barChartTimerOptions" :series="timers"></apexchart>

  </div>
   

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
import { ref,reactive,onMounted } from "vue";
import * as secure from 'crypto-middleware'
import * as openpgp from 'openpgp';
import { S3Client, ListObjectsV2Command,GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import prettyBytes from 'pretty-bytes'
import FileUpload from 'primevue/fileupload';
// import * as awscrypto from '@aws-crypto/client-browser'

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
let highestMem = ref(0)

const data = ref(null);
const memInfo = ref({
      jsHeapSizeLimit: 0,
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
    });

    const chart = ref();


    const barChartTimerOptions = ref({
      chart: {
        type: 'bar',
        height: 340
      }, xaxis: {
              categories: ['Baseline', 'OPENPGP', 'SecureSend'],
    },yaxis : {
     title : {
      text: 'Duration (ms)'
     }
    },  title: {
              text: 'Time taken (ms)',
              align: 'left'
            },
            subtitle : {
              text: 'Lower is better'
              
            }
  }
    )
    


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
                  speed: 1000
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
              max: 100000000, // 100MB,
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
          name: 'Timers',
          data: []
          // data: traffic2.value.slice()
       
        }
      ]);


      const radialSeries = ref([0])
  

// let downloadLink

const uploadOnly = async () => {
  console.log('Testing upload perofmrance only')
  const startTime = performance.now(); 
  const file = fileInput.value.files[0];
    const totalBytes = file.size
    const fileName = file.name
    // let fileBuffer = await file.arrayBuffer()
    // const uint8Array = new Uint8Array(fileBuffer);
  const result = await uploadS3(fileName,totalBytes ,file)
  console.log('done upload only: ', file)
  const endTime = performance.now(); // Capture end time
    console.log(`Upload Only Baseline ${endTime - startTime} milliseconds.`)
    timers.value[0].data.push(parseFloat((endTime - startTime).toFixed(2)))
}


const openPGP = async () => {
  console.log('OPEN  PGP TEST')
  const startTime = performance.now(); 
   const file = fileInput.value.files[0];
    const totalBytes = file.size
    const fileName = file.name
   let fileBuffer = await file.arrayBuffer()

    const message = await openpgp.createMessage({ binary: new Uint8Array(fileBuffer) });
const encrypted = await openpgp.encrypt({
 message:message, // input as Message object
        passwords: ['secret stuff'], // multiple passwords possible
        format: 'binary' // don't ASCII armor (for Uint8Array output)
    });
    


const result = await uploadS3(fileName,totalBytes ,encrypted, 0)
console.log('finished pgp encrypt')
const endTime = performance.now(); // Capture end time
    console.log(`OPEN PGP Encryption took ${endTime - startTime} milliseconds.`);
    timers.value[0].data.push(parseFloat((endTime - startTime).toFixed(2)))

}



const s3encrypt = async () => {
  const plainText = new Uint8Array([1, 2, 3, 4, 5])
  // const { result } = await awscrypto.encrypt('1234', plainText, { encryptionContext: context })
console.log(result)
}



const updateMemoryInfo = () => {

 
        memInfo.value = window.performance.memory;
        const offset = 8;  // Adjust by 8 hours
        const millisecondsPerHour = 60 * 60 * 1000;
const adjustedNow = Date.now() + offset * millisecondsPerHour;
// const adjustedSixtySecondsAgo = adjustedNow - 60 * 1000;  // 60 seconds ago

const max = Math.max(...series.value[0].data.map(dataPoint => dataPoint[1]));
if (max > highestMem.value) {
  highestMem.value = max;
  }

if (max > 100000000) {
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
    
        // series.value[0].data.push(memInfo.value.usedJSHeapSize);   

        if (series.value[0].data.length > 90) { // Keep only the last 120 data points
          series.value[0].data.shift();
        }
    }

    onMounted(() => {
      setInterval(updateMemoryInfo, 1000); // Update every second
    });

const encrypt = async () => {
try {
  const startTime = performance.now(); 
    const file = fileInput.value.files[0];
    const totalBytes = file.size
console.log('ENCRYPT PASS PRHASE', passphrase.value)
    // const encryptedFile = await secure.encryptFile(file, passphrase.value);
        const stream = await secure.startStreaming(file, passphrase.value);

console.log('stream returned' , stream)


const result = await uploadS3(file.name,totalBytes ,stream,1)
console.log('FINISHED SECURE SEND ECRYPT')
const endTime = performance.now(); // Capture end time
    console.log(`SecureSend Took ${endTime - startTime} milliseconds.`);
    timers.value[0].data.push(parseFloat((endTime - startTime).toFixed(2)))
// return stream




  // const awsUpload = stream.pipeTo(aws)

  // function aws() {
  //   console.log('AWS UPLOAD')

  // }

  // const uploader = new Upload({client,params});
  //track prorgress





// console.log("starting upload...")


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



const uploadS3 = async (fileName, totalBytes ,stream,index) => {
  const params = {
    Bucket: "securesend2", // YOUR_BUCKET_NAME
    Key: fileName, // Use the file name as the key
    Body: stream
  };

  const uploader = new Upload({client,params});
  uploader.on('httpUploadProgress', (progress) => {
  awsProgress.value = Math.round((progress.loaded / totalBytes) * 100);
  radialSeries.value[0] = awsProgress.value
     console.log('Upload Progress ' ,  awsProgress.value)
  
});


const result = await uploader.done();
    console.log("Upload completed:", result);
 

return result

}

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
  // console.log('DATA', data.value.Contents)
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

<style>
body {
  /* background-color:grey; */
}
</style>

<style scoped>

.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  /* height: 400px; */
  max-width: 1200px;
  margin: auto;
  padding: 1rem;
  padding-top:0;
  margin-top:0;

 
}

.boxContainer {
  display: flex;
  gap: 1rem;
flex-direction:Row;
/* align-items:center; */
justify-content: space-evenly;
/* border-radius:6px; */
/* border:1px solid red; */

}

.box {
  /* border: 1px solid red; */
  padding: 12px;
  /* margin:auto; */
  border-radius:5px;
display:flex;
gap:5px;
width: 420px;
flex-direction:column;
align-items:center;
border:1px solid rgb(230, 230, 230);
box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.1);
  /* height: 400px; */
  /* width: 400px; */
}

.box input {
  padding:7px;
  border-radius:2px;
  border:1px solid rgb(129, 129, 129)
}
</style>
