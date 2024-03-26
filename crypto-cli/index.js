#!/usr/bin/env node

import { program } from "commander";//taking command line args
import chalk from "chalk"; //for colors
import inquirer from "inquirer"; `` //asking questions
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt'
import ora from "ora";
import figlet from "figlet";
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as url from 'node:url';
import * as p from '@clack/prompts'
import color from 'picocolors';
import { Performance } from "perf_hooks";
import {pipeline} from 'stream';
import {promisify} from 'util';
import zlib from 'zlib';


const __filename = url.fileURLToPath(import.meta.url);
inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)




// let key = Buffer.from('81ad9de199b2af85dbc13cf3a88e5c8cec4c80b5b19c28dff0a65525293eede5', 'hex')
// let ivs = Buffer.from('dbb849b69186c8e1245f8306cdf0fe90', 'hex')

let key
let iv

console.log(
  chalk.yellow(figlet.textSync("Rishi Final Year Project", { horizontalLayout: "full" }))
);

async function run() {

  console.clear();
  p.intro(`${color.bgCyan(color.black('Secure File Encryption - Author Rishi Uttam: v0.1'))}`);

  const availableCiphers = crypto.getCiphers();
  // console.dir(availableCiphers, { 'maxArrayLength': null });
  // const uniqueCiphers = [...new Set(availableCiphers.map(cipher => cipher.match(/^\D+/)[0]))];
  // const cipherOptions = uniqueCiphers.map(cipher => ({ value: cipher, label: cipher }));



  // console.log(cipherDetails);
  //get a list of available ciphers, but without the bits and the mode of operation.



  // console.log(global.inspect(crypto.getCiphers()))
  // console.log(crypto.getHashes())

  const group = await p.group(
    {


      // path: ({results}) => 
      // p.path({
      //   type: 'select',
      //   message: 'Pick a project:',
      //   initialValue: process.cwd(),
      //   onlyShowDir: true,
      //   maxItems: 12
      // }),


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
      startEncrypt:  () =>
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

      selectBitRate:  () =>
        p.select({
          message: `Select Bit Rate`,
          options: [
            { value: 128, label: '128' },
            { value: 192, label: '192' },
            { value: 256, label: '256' },
          ],
        }),
      selectMode:  () =>
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
        compressOption:  () =>
         p.confirm({
          message: 'Would you like to compress the file before encryption?',
         }),

        confirm:  ({ results }) => {
          console.log(results)
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

  if (group.confirm)  {
    const s = p.spinner()
    s.start('Encrypting...')
    try {

      const start = performance.now();
     
    await encryptFile(group)
    const end = performance.now()
    console.log(`Time taken encrypt ${(end - start).toFixed(3)}ms.`);
    s.stop('Done!')
    }catch(e) {
      console.log('Error:', e.code)
      s.stop('Failed!')
    }
  }



  // const meaning = await p.text({
  //   message: 'What is the meaning of life?',
  //   placeholder: 'Not sure',
  //   initialValue: '42',
  //   validate(value) {
  //     if (value.length === 0) return `Value is required!`;
  //   },
  // });

  // const shouldContinue = await p.confirm({
  //   message: 'Do you want to continue?',
  // });

  // Do stuff
  // p.outro(`You're all set!`);

  // const value = await p.text(/* TODO */);

  // if (p.isCancel(value)) {
  //   cancel('Operation cancelled.');
  //   process.exit(0);
  // }

  // const result = await inquirer.prompt([
  //   {
  //   type:'list',
  //   name: 'encryptOrDecrypt',
  //   message: 'Would you like to encrypt or decrypt?',
  //   choices: [
  //     'Encrypt',
  //     'Decrypt'
  //   ]
  //   }
  // ])
  // return result.encryptOrDecrypt
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

// .then(encryptOrDecryptAnswer => encryptOrDecryptAnswer == 'Encrypt' ? encryptFile() : decryptFile() )
// .then(selectFile())
// .then(fileName => encryptFile(fileName,key,iv))


// encryptFile()





// program
//   .version('1.0.0')
//   .description('A simple CLI app using Commander.js');
//   program
//   .command('greet <name>')
//   program.parse(process.argv);
// const key = crypto.randomBytes(32);
// const iv = crypto.randomBytes(16) // Key for AES-256 is 32 bytes





// program
//   .version("1.0.0")
//   .description("My Node CLI")
//   .option("-n, --name <type>", "Add your name")
//   .action((options) => {
//     console.log(`Hey, ${options.name}!`);
//     console.log(chalk.blue(`Hey, ${options.name}!`));
//     console.log(chalk.green(`Hey, ${options.name}!`));
//     console.log(chalk.red(`Hey, ${options.name}!`));

//     inquirer
//     .prompt([
//       {
//         type: "input",
//         name: "name",
//         message: "What's your name?",
//       },
//     ])
//     .then((answers) => {
//       const spinner = ora(`Doing ...`).start(); // Start the spinner
//       setTimeout(() => {
//         spinner.succeed(chalk.green("Done!"));
//         console.log(chalk.green(`Hey there, ${answers.name}!`));
//       }, 3000);


//     });
//   });

//   program.parse(process.argv);





async function encryptFile(group) {

  if (group.selectBitRate == 128) {
    key = crypto.randomBytes(16)
  } else if (group.selectBitRate == 192) {
    key = crypto.randomBytes(24)
  } else {
    key = crypto.randomBytes(32)
  }
  iv = crypto.randomBytes(16);
  const readStream = fs.createReadStream(group.selectFile,{highWaterMark: 64 * 1024})
  const cipherAlgorithm = `${group.startEncrypt}-${group.selectBitRate}-${group.selectMode}`.toLowerCase()
  console.log('Using : ',cipherAlgorithm)
  const cipher = crypto.createCipheriv(cipherAlgorithm, key, iv);
  const writeStream = fs.createWriteStream(path.join(path.dirname(group.selectFile), 'encrypted_' + path.basename(group.selectFile)), { highWaterMark: 64 * 1024 });
  //  readStream.on('data', (chunk) => console.log('data read chunk', chunk.length))
  //  cipher.on('data', (chunk) => console.log('data encrypted', chunk.length));

  // return new Promise((resolve, reject) => {
  //   readStream.pipe(cipher)
  //     .pipe(writeStream)
  //     .on('finish', () => {
      
  //       resolve()
  //     })
  //     .on('error', (error) => {
  //       console.error("error")
  //       reject(error);

  //     })
  // })

  //Changed to using a pipeline
  const gzip = zlib.createGzip();

  const pipelineAsync = promisify(pipeline);
  const streams = [readStream, cipher, writeStream]
  if (group.compressOption) {
    const gzip = zlib.createGzip();
    streams.splice(1, 0, gzip);  // Insert gzip at index 1
  }
  try {
    // streams.forEach((stream, index) => {
    //   console.log(`Stream ${index}: ${stream.constructor.name}`);
    // });
  await pipelineAsync(...streams)
 console.log('Pipeline finished')
  }catch(e) {
    console.log('Error:Pipeline Failed', e)
  }


}

// encryptFile(filePath, key,iv);




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



