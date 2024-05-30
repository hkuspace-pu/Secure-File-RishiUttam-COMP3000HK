#!/usr/bin/env node

/**
 * AUTHOR: Rishi Uttam FINAL YEAR PROJECT
 * @fileoverview This file contains the main logic for a secure file encryption CLI tool.
 * It uses various cryptographic algorithms to encrypt and decrypt files.
 * The user is prompted to select the file, encryption algorithm, and other options.
 * The selected file is then encrypted or decrypted based on the user's choice.
 * The encrypted file is saved with a .enc extension.
 * The tool also supports file compression before encryption.
 * The progress of the encryption process is displayed using a progress bar.
 * The tool uses various external libraries such as chalk, inquirer, figlet, fs, crypto, url, @clack/prompts, picocolors, stream, util, zlib, and cli-progress.
 */

import chalk from "chalk"; //for colors
import inquirer from "inquirer"; //asking questions
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt'
import figlet from "figlet";
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as url from 'node:url';
import * as p from '@clack/prompts'
import color from 'picocolors';
import { pipeline, Stream, Transform } from 'stream';
import { promisify } from 'util';
import zlib from 'zlib';
import * as progress from 'cli-progress';
import prettyBytes from "pretty-bytes";

const __filename = url.fileURLToPath(import.meta.url);
inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)
let maxHeapUsed = 0;
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

/**
 * Prints the project name in ASCII art.
 */
console.log(
  chalk.yellow(figlet.textSync("Rishi Final Year Project", { horizontalLayout: "full" }))
);

/**
 * The main function that runs the encryption/decryption process.
 */
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
            { value: "AES-256-GCM", label: 'AES-256-GCM', hint: 'Advanced encryption standard used worldwide' },
            { value: "ChaCha20", label: 'ChaCha20', hint: 'Stream cipher known for its speed.' },
          ],
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
            { value: 512 * 1024, label: '256KB' },
            { value: 1 * 1024 * 1024, label: '1MB' },
            { value: 2 * 1024 * 1024, label: '2MB' },
            { value: 3 * 1024 * 1024, label: '3MB' },
            { value: 4 * 1024 * 1024, label: '4MB' },
            { value: 5 * 1024 * 1024, label: '4MB' },
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
    try {
      const start = performance.now();
      await encryptFile(group)
      const end = performance.now()
      console.log(`Time taken encrypt ${(end - start).toFixed(3)}ms.`);
    } catch (e) {
      console.log('Error:', e.code)
      s.stop('Failed!')
    }
  }
}

/**
 * Prompts the user to select a file to encrypt.
 * @returns {string} The path of the selected file.
 */
async function selectFile() {
  const fileName = await inquirer
    .prompt([
      {
        type: 'file-tree-selection',
        name: 'file',
        enableGoUpperDirectory: true,
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
  return fileName.file
}

run()
  .catch((error) => {
    console.log('Error:', error.message)
  })

/**
 * Encrypts the selected file using the provided options.
 * @param {object} group - The options selected by the user.
 */
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
  cipherAlgorithm = `${group.startEncrypt}`.toLowerCase()
  console.log('Using : ', cipherAlgorithm)
  console.log(`\nReading => ${group.compressOption ? 'Compression => ' : ''}Encryption => Writing`)
  const cipher = crypto.createCipheriv(cipherAlgorithm, key, iv);
  const writeStream = fs.createWriteStream(path.join(path.dirname(group.selectFile), group.compressOption ? path.basename(group.selectFile) + '.enc.gz' : path.basename(group.selectFile) + '.enc'), { highWaterMark: 64 * 1024 });

  let writeSize = 0;
  totalSize = fs.statSync(group.selectFile).size;
  const pipelineAsync = promisify(pipeline);
  const progress = passThroughStream();
  const streams = [readStream, cipher, progress, writeStream,]
  if (group.compressOption) {
    const gzip = zlib.createGzip();
    streams.splice(1, 0, gzip);  // Insert gzip at index 1
  }
  try {
  
    totalChunks = Math.ceil(totalSize / group.BackpressureBufferSize)
    let currentChunk = 0;
    bar.start(totalSize, 0)
    progress.on('data', (chunk) => {
      totalBytes += chunk.length;
      currentChunk++
      let message = `Encrypting ${prettyBytes(chunk.length)}`
      bar.update(totalBytes, group.compressOption ? { currentChunk, currentChunk, message } : { currentChunk, totalChunks, message });
      const used = process.memoryUsage();
      
      maxHeapUsed = Math.max(maxHeapUsed, used.heapUsed);
    })

    writeStream.on('close', () => {
      const fileLocation = path.join(path.dirname(group.selectFile), group.compressOption ? path.basename(group.selectFile) + '.enc.gz' : path.basename(group.selectFile) + '.enc')
      console.log('File Location', fileLocation)
      fs.appendFileSync(fileLocation, addMetaData());
    })
    writeStream.on('finish', () => {
      bar.update(totalSize)
      bar.stop();
      console.log(`Maximum memory used during operation = ${Math.round((maxHeapUsed / 1024 / 1024) * 100) / 100} MB`);
    })

    await pipelineAsync(...streams)

    console.log('\nPipeline finished')

    let log = logCompressionStats(totalSize, totalBytes)
    log.savingsBytes = prettyBytes(log.savingsBytes)
    log.savingsPct = `${log.savingsPct}%`
    console.table(log)
  } catch (e) {
    console.log('Error:Pipeline Failed', e)
  }
}

/**
 * Adds metadata such as the encryption algorithm and IV to the start of the encrypted file.
 * @returns {string} The metadata in JSON format.
 */
function addMetaData() {
  let metaData = {
    algorithm: cipherAlgorithm,
    iv: iv.toString('hex'),
    timestamp: new Date().toISOString()
  }
  return JSON.stringify(metaData);
}

/**
 * Creates a pass-through stream for progress tracking.
 * @returns {Transform} The pass-through stream.
 */
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

/**
 * Calculates and logs compression statistics.
 * @param {number} originalSize - The original size of the file.
 * @param {number} compressedSize - The compressed size of the file.
 * @returns {object} The compression statistics.
 */
function logCompressionStats(originalSize, compressedSize) {
  const ratio = compressedSize / originalSize;
  const savingsBytes = originalSize - compressedSize;
  const savingsPct = ((1 - ratio) * 100).toFixed(2);
  return {
    MaxMemoryUsed: `${Math.round((maxHeapUsed / 1024 / 1024) * 100) / 100} MB`,
    originalSize: prettyBytes(originalSize),
    compressedSize: prettyBytes(compressedSize),
    compressionRatio: ratio.toFixed(2),
    savingsBytes,
    savingsPct,
  };
}
  // const savingsPct = Math.round((savingsBytes / originalSize) * 100);
  // return { savingsBytes, savingsPct }


function decryptFile(key, iv) {
  console.log('CALLING DECRYPT')
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




