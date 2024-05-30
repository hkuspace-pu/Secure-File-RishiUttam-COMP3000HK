import { test,expect} from 'vitest';
import * as secure from'./main.js'; // Import the function you want to test
// import fs from 'fs'; // Node.js file system module for handling files
// import path from 'path'; // Node.js path module for handling file paths
let encryptedStream
let decryptedStream 
let encryptedBlob 
let decryptedBlob
const passPhrase = 'mykey'

test('Test Encrypt File', async () => {
//   const file = './README.md';
const blob = new Blob(['Mock file content<- This will get encrypted'], { type: 'text/plain' });
// Create a File object
const file = new File([blob], 'README.md', { type: 'text/plain' });
const reader = new FileReader();
reader.onload = function(event) {
  console.log(event.target.result); // This will log the content of the file
};
reader.readAsText(file);
  // Call the function with the file and passPhrase
  encryptedStream = await secure.startStreaming(file, passPhrase);
  expect(encryptedStream).toBeInstanceOf(ReadableStream);

 
});


test('Read Encrypted File', async () => {

    const response = new Response(encryptedStream);
    encryptedBlob = await response.blob();
      const reader = new FileReader();
      console.log('ENCRYPTED TEXT')
        const readPromise = new Promise((resolve, reject) => {
      reader.onload = function() {
        // Log the contents of the file
        console.log(reader.result);
        console.log('finished encrypted text')
        resolve();
      };
      reader.onerror = reject;
    });
      reader.readAsText(encryptedBlob);


await readPromise;
})


test('Decrypt Encrypted File', async () => {
  console.log('Starting Decrypt File Test')
  const blobStream = encryptedBlob.stream()
   const pipeline = await secure.decryptStream(passPhrase);
    decryptedStream = blobStream.pipeThrough(pipeline)
    expect(decryptedStream).toBeInstanceOf(ReadableStream);
    const response = new Response(decryptedStream.readable);
    decryptedBlob = await response.blob();
     console.log('done decrypting to blob')
  
  },{timeout: 10000})


  test ('Read Decrypted File', async () => {
    console.log('Starting to read decrypted file')
    console.log(decryptedBlob);
    const reader = new FileReader();
    const readPromise = new Promise((resolve, reject) => {
      reader.onload = function() {
        console.log('Output of decrypted Text')
        // Log the contents of the file
        console.log(reader.result);
        resolve();
      };
      reader.onerror = reject;
    });
    reader.readAsText(decryptedBlob);
    await readPromise;


    reader.onerror = function() {
      console.log('onerror event fired');
      reject();
    };
  });

