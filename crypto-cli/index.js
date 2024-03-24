#!/usr/bin/env node #ignored in windows

import { program } from "commander";//taking command line args
import chalk from "chalk"; //for colors
import inquirer from "inquirer";`` //asking questions
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt'
import ora from "ora";
import figlet from "figlet";
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as url from 'node:url';
const __filename = url.fileURLToPath(import.meta.url);
inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)


const keys = Buffer.from('81ad9de199b2af85dbc13cf3a88e5c8cec4c80b5b19c28dff0a65525293eede5','hex')
const ivs = Buffer.from('dbb849b69186c8e1245f8306cdf0fe90','hex')

console.log(
  chalk.yellow(figlet.textSync("Secure File - Rishi Final Year Project", { horizontalLayout: "full" }))
);

async function askEncryptOrDecrypt() {
  const result = await inquirer.prompt([
    {
    type:'list',
    name: 'encryptOrDecrypt',
    message: 'Would you like to encrypt or decrypt?',
    choices: [
      'Encrypt',
      'Decrypt'
    ]
    }
  ])
  return result.encryptOrDecrypt
}


async function selectFile() {
  const fileName = await  inquirer
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

  console.log(JSON.stringify(`Selected: ${fileName.file}`))
  return fileName.file
}

askEncryptOrDecrypt()
.then(encryptOrDecryptAnswer => encryptOrDecryptAnswer == 'Encrypt' ? encryptFile() : decryptFile() )
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

 async function encryptFile(key = keys ,iv = ivs) {
  console.log('Encryption Key:', key);
  console.log('Encryption IV:', iv);
    const filePath = await selectFile()
    console.log(filePath)


    const readStream= fs.createReadStream(filePath)
    const cipher = crypto.createCipheriv('aes-256-cbc', key,iv);
    // const writeStream = fs.createWriteStream(path.dirname(filePath),'enc_'+path.basename(filePath))
    const writeStream = fs.createWriteStream(path.join(path.dirname(filePath), 'encrypted_' + path.basename(filePath)));
    // readStream.on('data', () => console.log('data read'))

    readStream.pipe(cipher)
    .on('data',() => {

      // console.log('data read')
    })
    .pipe(writeStream)
    .on('finish',() => {
      // console.log('finish encryption')
    });

  }

  // encryptFile(filePath, key,iv);




  function decryptFile(key,iv) {
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



