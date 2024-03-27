#!/usr/bin/env node

import { program } from "commander";//taking command line args
import chalk from "chalk"; //for colors
import inquirer from "inquirer"; `` //asking questions
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt'
import figlet from "figlet";
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as url from 'node:url';
import * as p from '@clack/prompts'
import color from 'picocolors';
import { Performance } from "perf_hooks";
import { pipeline, Stream, Transform } from 'stream';
import { promisify } from 'util';
import zlib from 'zlib';
import * as progress from 'cli-progress';
import prettyBytes from "pretty-bytes";

const __filename = url.fileURLToPath(import.meta.url);
inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)




// let key = Buffer.from('81ad9de199b2af85dbc13cf3a88e5c8cec4c80b5b19c28dff0a65525293eede5', 'hex')
// let ivs = Buffer.from('dbb849b69186c8e1245f8306cdf0fe90', 'hex')

let key
let iv
let totalSize = 0
let totalBytes = 0
let totalChunks = 0
let cipherAlgorithm = ''
let bar = new progress.SingleBar({
  format: '|' + chalk.blue('{bar}') + `| {percentage}% || {value}/{total} Bytes || Chunks: {currentChunk}/{totalChunks} || {message}`,
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true
}, progress.Presets.shades_classic);

// let bar2 = new progress.SingleBar({
//   format: 'Progress|' + chalk.blue('{bar}') + `| {percentage}% || {value}/{total} Bytes || Chunks: {currentChunk}/{totalChunks}`,
//   barCompleteChar: '\u2588',
//   barIncompleteChar: '\u2591',
//   hideCursor: true
// }, progress.Presets.shades_classic);


console.log(
  chalk.yellow(figlet.textSync("Rishi Final Year Project", { horizontalLayout: "full" }))
);

async function run() {

  console.clear();
  p.intro(`${color.bgCyan(color.black('Secure File Encryption - Author Rishi Uttam: v0.1'))}`);

  const availableCiphers = crypto.getCiphers();


  const group = await p.group(
    {



      encryptDecrypt: ({ results }) =>
        p.select({
          message: `Would you like to encrypt or decrypt?`,
          options: [
            { value: 1, label: 'Encrypt' },
            { value: 0, label: 'Decrypt' },

          ],
        }),
      selectFile: ({ results }) => {
        if (results.encryptDecrypt) {
          return selectFile()
        } else {
          return decryptFile()
        }
      },
      startEncrypt: () =>
        p.select({
          message: `Which Cipher would you like to use?`,
          options: [
            // ...cipherOptions
            { value: "AES", label: 'AES', hint: 'Advanced encryption standard used worldwide' },
            { value: "ARIA", label: 'Aria', hint: 'Block cipher with high security level' },
            { value: "BLOWFISH", label: 'BlowFish', hint: 'Popular symmetric key encryption algorithm' },
            { value: "ChaCha20", label: 'ChaCha20', hint: 'Stream cipher known for its speed.' },
            { value: "3DES", label: '3DES', hint: 'Data Encryption Standard for enhanced security.' },
            { value: "Camellia", label: 'Camellia', hint: 'Symmetric encryption algorithm with strong performance' },
            { value: "SM4", label: 'SM4', hint: 'Chinese encryption standard used in various applications' },

          ],
        }),

      // const data = JSON.parse(results)
      // console.log(data.results.selectFile)
      //   const s = p.spinner()
      //   s.start("Working...")
      //   const start = performance.now();
      // const check = await encryptFile(results.selectFile,keys,ivs)
      // const end = performance.now()
      // console.log(`Time taken to execute add function is ${end - start}ms.`);
      //   s.stop("Done!")

      selectBitRate: () =>
        p.select({
          message: `Select Bit Rate`,
          options: [
            { value: 128, label: '128' },
            { value: 192, label: '192' },
            { value: 256, label: '256' },
          ],
        }),
      selectMode: () =>
        p.select({
          message: 'Select Mode of Operation',
          options: [
            { value: 'CBC', label: 'CBC', hint: 'Cipher Block Chaining' },
            { value: 'CFB', label: 'CFB', hint: 'Cipher Feedback' },
            { value: 'OFB', label: 'OFB', hint: 'Output Feedback' },
            { value: 'CTR', label: 'CTR', hint: 'Counter Mode' },
            { value: 'GCM', label: 'GCM', hint: 'Galois/Counter Mode' },
            { value: 'CCM', label: 'CCM', hint: 'Counter with CBC-MAC' },
          ]
        }),

      BackpressureBufferSize: () =>
        p.select({
          message: 'Select Backpressure Buffer Size',
          options: [
            { value: 16 * 1024, label: '16KB' },
            { value: 32 * 1024, label: '32KB' },
            { value: 64 * 1024, label: '64KB' },
            { value: 128 * 1024, label: '128KB' },
            { value: 256 * 1024, label: '256KB' },
          ],
        }),
      compressOption: () =>
        p.confirm({
          message: 'Would you like to compress the file before encryption?',
        }),

      confirm: ({ results }) => {
        console.table(results)
        return p.confirm({
          message: 'Are you sure you want to proceed?',
        });

      },






      // On Cancel callback that wraps the group
      // So if the user cancels one of the prompts in the group this function will be called
    },
    {
      onCancel: ({ results }) => {
        p.cancel('Operation cancelled.');
        process.exit(0);
      },
    }
  );



  if (group.confirm) {
    const s = p.spinner()
    // s.start('Working...');
    try {

      const start = performance.now();

      await encryptFile(group)
      const end = performance.now()
      console.log(`Time taken encrypt ${(end - start).toFixed(3)}ms.`);
      // s.stop('Done!')
    } catch (e) {
      console.log('Error:', e.code)
      s.stop('Failed!')
    }
  }




}


async function selectFile() {
  const fileName = await inquirer
    .prompt([
      {
        type: 'file-tree-selection',
        name: 'file',
        enableGoUpperDirectory: true,
        // default: __filename,
        message: 'Select File to Encrypt:',
        transformer: (input) => {
          const name = input.split(path.sep).pop();
          if (name[0] == ".") {
            return chalk.grey(name);
          }
          return name;
        }

      }
    ])

  // console.log(JSON.stringify(`Selected: ${fileName.file}`))
  return fileName.file
}

run()
  .catch((error) => {
    console.log('Error:', error.message)
  })






async function encryptFile(group) {

  if (group.selectBitRate == 128) {
    key = crypto.randomBytes(16)
  } else if (group.selectBitRate == 192) {
    key = crypto.randomBytes(24)
  } else {
    key = crypto.randomBytes(32)
  }
  iv = crypto.randomBytes(16);
  const readStream = fs.createReadStream(group.selectFile, { highWaterMark: group.BackpressureBufferSize })
  cipherAlgorithm = `${group.startEncrypt}-${group.selectBitRate}-${group.selectMode}`.toLowerCase()
  console.log('Using : ', cipherAlgorithm)
  console.log(`\nReading => ${group.compressOption ? 'Compression => ' : ''}Encryption => Writing`)
  const cipher = crypto.createCipheriv(cipherAlgorithm, key, iv);
  const writeStream = fs.createWriteStream(path.join(path.dirname(group.selectFile), group.compressOption ? path.basename(group.selectFile)+'.enc.gz' : path.basename(group.selectFile)+'.enc' ), { highWaterMark: 64 * 1024 });



  let writeSize = 0;
  totalSize = fs.statSync(group.selectFile).size; 
  const pipelineAsync = promisify(pipeline);
  const progress = passThroughStream();
  const streams = [readStream, cipher, progress, writeStream,]
  if (group.compressOption) {

    // totalSize = fs.statSync(group.selectFile).size;
    const gzip = zlib.createGzip();


  
    streams.splice(1, 0, gzip);  // Insert gzip at index 1
  }
  try {
    //Concurrently reading, compressing, encrypting and writing to file.
    // bar.start(totalSize, 0);


    totalChunks = Math.ceil(totalSize / group.BackpressureBufferSize)
    let currentChunk = 0;
    bar.start(totalSize, 0)
    progress.on('data', (chunk) => {
      totalBytes += chunk.length;
      currentChunk++
      let message = `Encrypting ${prettyBytes(chunk.length)}`
      // bar.update(totalBytes, { currentChunk, totalChunks });
      bar.update(totalBytes, group.compressOption ? { currentChunk, currentChunk,message } : { currentChunk, totalChunks,message });
    })

    writeStream.on('close', () => {
      console.log('\nWrite Stream Closed')
      const fileLocation = path.join(path.dirname(group.selectFile), group.compressOption ? path.basename(group.selectFile)+'.enc.gz' : path.basename(group.selectFile)+'.enc')
      console.log('File Location', fileLocation)
      fs.appendFileSync(fileLocation, addMetaData());
    
    })
    writeStream.on('finish', () => {
      bar.update(totalSize)
    
      bar.stop();
    })
    await pipelineAsync(...streams)
     console.log('\nPipeline finished')
     let log = logCompressionStats(totalSize,totalBytes)
     log.savingsBytes = prettyBytes(log.savingsBytes)
     log.savingsPct = `${log.savingsPct}%`
    console.table(log)
  } catch (e) {
    console.log('Error:Pipeline Failed', e)
  } finally {

  }


}

// create a function that adds the meta data such as the algo used, iv, to the start of the encrypted file.
function addMetaData() {
  let metaData = {
    algorithm: cipherAlgorithm,
    iv: iv.toString('hex'),
    timestamp: new Date().toISOString()
  }
  return JSON.stringify(metaData);

 r
}


// encryptFile(filePath, key,iv);


//PASS THROUGH STREAM
function passThroughStream() {
  let progress = new Transform({
    transform(chunk, encoding, callback) {
      callback(null, chunk);
    }
  });
 progress.on('finish', () => {
  const metaData = addMetaData()
 })
  return progress;
}

function logCompressionStats(originalSize,compressedSize) {
  const ratio = compressedSize / originalSize;
  const savingsBytes = originalSize - compressedSize;
  const savingsPct = Math.round((savingsBytes / originalSize) * 100);
  return {savingsBytes,savingsPct}
}

function decryptFile(key, iv) {
  console.log('CALLING DECRUPT')
  console.log('Encryption Key:', key);
  console.log('Encryption IV:', iv);
  let encryptedFilePath = `../encrypted_test.mov`
  const readStream = fs.createReadStream(encryptedFilePath)

  readStream.on('data', (chunk) => {
    console.log('Received a chunk of data.');
    // Do something with the chunk
  });

  readStream.on('error', (error) => {
    console.error('Error reading the file:', error);
  });
  readStream.on('end', () => {
    console.log('Read stream has finished.');
  });

  // console.log('when does this run!?')
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  // const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  const writeStream = fs.createWriteStream('../decrypted_README.mov');

  readStream.pipe(decipher).pipe(writeStream);


  writeStream.on('finish', () => {
    console.log('Decryption finished')

  })


}

// decryptFile(key,iv);


// Encryption and decryption functions using the crypto module
// function encrypt(buffer) {
//  const cipher = crypto.createCipheriv('aes-256-cbc', key,iv);
//   encrypted = Buffer.concat([encrypted, cipher.final()]);
//   return encrypted;
// }

// function decrypt(encrypted) {
//   const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
//   let decrypted = decipher.update(encrypted);
//   decrypted = Buffer.concat([decrypted, decipher.final()]);
//   return decrypted;
// }



// async function encryptDecrypt() {
//   try {
//     const data  = await fs.readFile(filePath)
//     const cipher = crypto.createCipheriv('aes-256-cbc', key,iv);
//     const encryptedData =

//   } catch(e) {
//     console.log('In catch')

//   }
// }



