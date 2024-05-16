## Members

<dl>
<dt><a href="#bufferSize">bufferSize</a></dt>
<dd><p>BufferSize, this is the size of the buffer that will be used to read the file in chunks and encrypt it in chunks
This is a global variable that can be changed to suit the needs of the application.
The default value is 5MB
AWS Upload Parts minimum is 5MB, hence the default value is set to 5MB, but can be changed to any value from 64KB.
It is important to keep the buffersize the same for both encryption and decryption.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#readFileChunk">readFileChunk(file)</a> ⇒ <code>ReadableStream</code></dt>
<dd><p>Reads a chunk of data from a file using the file&#39;s stream method.
Used in conjunction with the XXX read and process files in chunks.</p>
</dd>
<dt><a href="#encryptStream">encryptStream(passphrase)</a> ⇒ <code>TransformStream</code></dt>
<dd><p>Creates a TransformStream that encrypts input data in chunks using a derived key from a passphrase.
Each chunk is encrypted separately with its own initialization vector (IV).</p>
</dd>
<dt><a href="#flush">flush()</a></dt>
<dd><p>The FlushHandles any remaining data in the buffer when there is no more data to be consumed from the stream.
If there is data left in the buffer, it generates a new initialization vector (IV), 
creates a subarray from the buffer containing the remaining data, and encrypts this data using the AES-GCM algorithm.</p>
</dd>
<dt><a href="#generateIV">generateIV()</a> ⇒ <code>Uint8Array</code></dt>
<dd><p>Generates an initialization vector (IV) for cryptographic operations.
The IV is a random string of 16 bytes, generated using the crypto API.</p>
</dd>
<dt><a href="#handleIV">handleIV(iv, encryptedFile)</a> ⇒ <code>Uint8Array</code></dt>
<dd><p>Prepends the initialization vector (IV) and the encryption algorithm used to the encrypted file.
The IV is 16 bytes and the algorithm used (&#39;AES-GCM&#39;) takes up the remaining bytes, making a total of 23 bytes.</p>
</dd>
<dt><a href="#encryptFile">encryptFile(file, passphrase)</a> ⇒ <code>Promise.&lt;Uint8Array&gt;</code></dt>
<dd><p>Encrypts a file using a derived key from a passphrase.
The encryption algorithm used is AES-GCM, and an initialization vector (IV) is generated for each encryption.
Note: This function reads the whole file into memory at once, which may not be ideal for large files.</p>
</dd>
<dt><a href="#decryptFile">decryptFile(file, passphrase)</a> ⇒ <code>Promise.&lt;ArrayBuffer&gt;</code></dt>
<dd><p>Decrypts a file using a derived key from a passphrase.
The decryption algorithm used is AES-GCM, and the initialization vector (IV) used for encryption is required.
Note: This function reads the whole file into memory at once, which may not be ideal for large files.</p>
</dd>
<dt><a href="#extractMeta">extractMeta(encryptedFile)</a> ⇒ <code>Object</code></dt>
<dd><p>Extracts the metadata (initialization vector and algorithm) from an encrypted file.
The metadata is expected to be in the first 23 bytes of the file, with the IV in the first 16 bytes and the algorithm in the remaining bytes.</p>
</dd>
<dt><a href="#decryptStream">decryptStream(privateKeyOrPassphrase)</a> ⇒ <code>TransformStream</code></dt>
<dd><p>Creates a TransformStream that decrypts data as it is read.
The decryption algorithm used is AES-GCM, and the initialization vector (IV) and algorithm are extracted from each chunk.
The data is held in a buffer to match the buffer length of the encrypted file, allowing the header IV and algorithm to be extracted from each chunk.
The passphrase is used to authenticate each chunk. If any chunk fails authentication, the whole decryption will fail.</p>
</dd>
<dt><a href="#deriveKey">deriveKey(passPhrase)</a> ⇒ <code>Promise.&lt;CryptoKey&gt;</code></dt>
<dd><p>Derives a cryptographic key from a passphrase using the PBKDF2 algorithm.
The derived key can be used for AES-GCM encryption and decryption.
The PBKDF2 algorithm is used with a fixed salt and 100,000 iterations, and the SHA-256 hash function.
Note: In a production environment, consider using a random salt and storing it securely for key derivation.</p>
</dd>
<dt><a href="#exportKeys">exportKeys(keyPair)</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Exports a key pair (private and public keys) in the JWK (JSON Web Key) format.
This function can be used when you want to securely store the keys or transmit them over an insecure network.</p>
</dd>
<dt><a href="#encryptPassPhraseWithPublicKey">encryptPassPhraseWithPublicKey(publicKey, data)</a> ⇒ <code>Promise.&lt;ArrayBuffer&gt;</code></dt>
<dd><p>Encrypts a passphrase using the recipient&#39;s public key.</p>
<p>This function uses the RSA-OAEP (RSA Optimal Asymmetric Encryption Padding) algorithm for encryption.
RSA-OAEP is a public-key encryption algorithm that combines the RSA algorithm with the OAEP method.
RSA is a widely used public-key encryption algorithm that allows for secure data transmission or storage.
OAEP is a padding scheme that enhances the security of RSA by preventing certain types of attacks.</p>
</dd>
<dt><a href="#decryptPassPhraseWithPrivateKey">decryptPassPhraseWithPrivateKey(privateKey, data)</a> ⇒ <code>Promise.&lt;string&gt;</code></dt>
<dd><p>Decrypts an encrypted passphrase using the recipient&#39;s private key.</p>
<p>This function uses the RSA-OAEP (RSA Optimal Asymmetric Encryption Padding) algorithm for decryption.
RSA-OAEP is a public-key encryption algorithm that combines the RSA algorithm with the OAEP method.
RSA is a widely used public-key encryption algorithm that allows for secure data transmission or storage.
OAEP is a padding scheme that enhances the security of RSA by preventing certain types of attacks.</p>
</dd>
<dt><a href="#importPrivateKey">importPrivateKey(jwk)</a> ⇒ <code>Promise.&lt;CryptoKey&gt;</code></dt>
<dd><p>Imports a user&#39;s private key from a JWK (JSON Web Key) for decryption purposes.</p>
<p>This function uses the RSA-OAEP (RSA Optimal Asymmetric Encryption Padding) algorithm with SHA-256 hash function.
The imported private key is not stored in memory or logged and is removed upon page refresh.</p>
</dd>
<dt><a href="#importPublicKey">importPublicKey(jwk)</a> ⇒ <code>Promise.&lt;CryptoKey&gt;</code></dt>
<dd><p>Imports a user&#39;s public key from a JWK (JSON Web Key) for encryption purposes.</p>
<p>This function uses the RSA-OAEP (RSA Optimal Asymmetric Encryption Padding) algorithm with SHA-256 hash function.
The imported public key can be used to encrypt data that can only be decrypted with the corresponding private key.</p>
</dd>
<dt><a href="#generateKeyPair">generateKeyPair()</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Generates a public and private key pair using the RSA-OAEP algorithm.</p>
<p>This function uses the RSA-OAEP (RSA Optimal Asymmetric Encryption Padding) algorithm with SHA-256 hash function.
The generated key pair is then converted into the JWK (JSON Web Key) format by the <code>exportKeys</code> function.</p>
</dd>
</dl>

<a name="bufferSize"></a>

## bufferSize
BufferSize, this is the size of the buffer that will be used to read the file in chunks and encrypt it in chunks
This is a global variable that can be changed to suit the needs of the application.
The default value is 5MB
AWS Upload Parts minimum is 5MB, hence the default value is set to 5MB, but can be changed to any value from 64KB.
It is important to keep the buffersize the same for both encryption and decryption.

**Kind**: global variable  
<a name="readFileChunk"></a>

## readFileChunk(file) ⇒ <code>ReadableStream</code>
Reads a chunk of data from a file using the file's stream method.
Used in conjunction with the XXX read and process files in chunks.

**Kind**: global function  
**Returns**: <code>ReadableStream</code> - A readable stream from which chunks of data can be read.  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>File</code> | The file from which to read. |

**Example**  
```js
const file = new File(["foo"], "foo.txt", {
  type: "text/plain",
});
const stream = await readFileChunk(file);
const reader = stream.getReader();
const { value, done } = await reader.read();
console.log(value); // Logs the first chunk of data from the file.
This is the first part of the startStreaming pipeline 
```
<a name="encryptStream"></a>

## encryptStream(passphrase) ⇒ <code>TransformStream</code>
Creates a TransformStream that encrypts input data in chunks using a derived key from a passphrase.
Each chunk is encrypted separately with its own initialization vector (IV).

**Kind**: global function  
**Returns**: <code>TransformStream</code> - A TransformStream that encrypts input data in chunks.  

| Param | Type | Description |
| --- | --- | --- |
| passphrase | <code>string</code> | The passphrase from which to derive the encryption key. |

**Example**  
```js
const encryptedStream = encryptStream('my secure passphrase');
// Use the encryptedStream with a ReadableStream or WritableStream...
```
<a name="flush"></a>

## flush()
The FlushHandles any remaining data in the buffer when there is no more data to be consumed from the stream.
If there is data left in the buffer, it generates a new initialization vector (IV), 
creates a subarray from the buffer containing the remaining data, and encrypts this data using the AES-GCM algorithm.

**Kind**: global function  
<a name="generateIV"></a>

## generateIV() ⇒ <code>Uint8Array</code>
Generates an initialization vector (IV) for cryptographic operations.
The IV is a random string of 16 bytes, generated using the crypto API.

**Kind**: global function  
**Returns**: <code>Uint8Array</code> - A 16-byte typed array of unsigned integers, suitable for use as an IV.  
<a name="handleIV"></a>

## handleIV(iv, encryptedFile) ⇒ <code>Uint8Array</code>
Prepends the initialization vector (IV) and the encryption algorithm used to the encrypted file.
The IV is 16 bytes and the algorithm used ('AES-GCM') takes up the remaining bytes, making a total of 23 bytes.

**Kind**: global function  
**Returns**: <code>Uint8Array</code> - A new Uint8Array containing the metadata (IV and algorithm) and the encrypted file data.  

| Param | Type | Description |
| --- | --- | --- |
| iv | <code>Uint8Array</code> | The initialization vector used in the encryption. |
| encryptedFile | <code>ArrayBuffer</code> | The encrypted file data. |

**Example**  
```js
const iv = crypto.getRandomValues(new Uint8Array(16));
const encryptedFile = await encryptFile(file, iv);
const fileWithMetadata = handleIV(iv, encryptedFile);
```
<a name="encryptFile"></a>

## encryptFile(file, passphrase) ⇒ <code>Promise.&lt;Uint8Array&gt;</code>
Encrypts a file using a derived key from a passphrase.
The encryption algorithm used is AES-GCM, and an initialization vector (IV) is generated for each encryption.
Note: This function reads the whole file into memory at once, which may not be ideal for large files.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Uint8Array&gt;</code> - A promise that resolves with the encrypted file data as a Uint8Array.  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>File</code> | The file to be encrypted. |
| passphrase | <code>string</code> | The passphrase from which to derive the encryption key. |

**Example**  
```js
const file = new File(["foo"], "foo.txt", {
  type: "text/plain",
});
const encryptedFileData = await encryptFile(file, 'my secure passphrase');
Not Recommened for large files over 50MB
```
<a name="decryptFile"></a>

## decryptFile(file, passphrase) ⇒ <code>Promise.&lt;ArrayBuffer&gt;</code>
Decrypts a file using a derived key from a passphrase.
The decryption algorithm used is AES-GCM, and the initialization vector (IV) used for encryption is required.
Note: This function reads the whole file into memory at once, which may not be ideal for large files.

**Kind**: global function  
**Returns**: <code>Promise.&lt;ArrayBuffer&gt;</code> - A promise that resolves with the decrypted file data as an ArrayBuffer.  
**Throws**:

- Will throw an error if the decryption fails.


| Param | Type | Description |
| --- | --- | --- |
| file | <code>File</code> | The file to be decrypted. |
| passphrase | <code>string</code> | The passphrase from which to derive the decryption key. |

**Example**  
```js
const file = new File([encryptedData], "foo.txt", {
  type: "text/plain",
});
const
```
<a name="extractMeta"></a>

## extractMeta(encryptedFile) ⇒ <code>Object</code>
Extracts the metadata (initialization vector and algorithm) from an encrypted file.
The metadata is expected to be in the first 23 bytes of the file, with the IV in the first 16 bytes and the algorithm in the remaining bytes.

**Kind**: global function  
**Returns**: <code>Object</code> - An object containing the initialization vector (as a Uint8Array) and the encrypted data (as a Uint8Array).  

| Param | Type | Description |
| --- | --- | --- |
| encryptedFile | <code>Uint8Array</code> | The encrypted file data. |

**Example**  
```js
const { iv, encryptedData } = extractMeta(encryptedFileData);
23 bytes = 16 bytes IV + 7 bytes algorithm
```
<a name="decryptStream"></a>

## decryptStream(privateKeyOrPassphrase) ⇒ <code>TransformStream</code>
Creates a TransformStream that decrypts data as it is read.
The decryption algorithm used is AES-GCM, and the initialization vector (IV) and algorithm are extracted from each chunk.
The data is held in a buffer to match the buffer length of the encrypted file, allowing the header IV and algorithm to be extracted from each chunk.
The passphrase is used to authenticate each chunk. If any chunk fails authentication, the whole decryption will fail.

**Kind**: global function  
**Returns**: <code>TransformStream</code> - A TransformStream that decrypts data as it is read.  
**Throws**:

- Will throw an error if the decryption fails.


| Param | Type | Description |
| --- | --- | --- |
| privateKeyOrPassphrase | <code>string</code> \| <code>File</code> | The passphrase or private key to use for decryption. |

**Example**  
```js
const encryptedFile = new File([encryptedData], "foo.txt", {
  type: "text/plain",
});
const rs = encryptedFile.stream().pipeThrough(decryptStream('my secure passphrase'));
```
<a name="deriveKey"></a>

## deriveKey(passPhrase) ⇒ <code>Promise.&lt;CryptoKey&gt;</code>
Derives a cryptographic key from a passphrase using the PBKDF2 algorithm.
The derived key can be used for AES-GCM encryption and decryption.
The PBKDF2 algorithm is used with a fixed salt and 100,000 iterations, and the SHA-256 hash function.
Note: In a production environment, consider using a random salt and storing it securely for key derivation.

**Kind**: global function  
**Returns**: <code>Promise.&lt;CryptoKey&gt;</code> - A promise that resolves with the derived key.  

| Param | Type | Description |
| --- | --- | --- |
| passPhrase | <code>string</code> | The passphrase from which to derive the key. |

**Example**  
```js
const key = await deriveKey('my secure passphrase');
```
<a name="exportKeys"></a>

## exportKeys(keyPair) ⇒ <code>Promise.&lt;Object&gt;</code>
Exports a key pair (private and public keys) in the JWK (JSON Web Key) format.
This function can be used when you want to securely store the keys or transmit them over an insecure network.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - A promise that resolves with an object containing the exported private and public keys.
JWK are used to represent cryptographic keys in JSON format, Similar to PKCS#8 and X.509 formats, however, JWK provide
human readability and are web friendly with standardized fields.  

| Param | Type | Description |
| --- | --- | --- |
| keyPair | <code>CryptoKeyPair</code> | The key pair to be exported. This should be an object that has `privateKey` and `publicKey` properties. |

<a name="encryptPassPhraseWithPublicKey"></a>

## encryptPassPhraseWithPublicKey(publicKey, data) ⇒ <code>Promise.&lt;ArrayBuffer&gt;</code>
Encrypts a passphrase using the recipient's public key.

This function uses the RSA-OAEP (RSA Optimal Asymmetric Encryption Padding) algorithm for encryption.
RSA-OAEP is a public-key encryption algorithm that combines the RSA algorithm with the OAEP method.
RSA is a widely used public-key encryption algorithm that allows for secure data transmission or storage.
OAEP is a padding scheme that enhances the security of RSA by preventing certain types of attacks.

**Kind**: global function  
**Returns**: <code>Promise.&lt;ArrayBuffer&gt;</code> - A promise that resolves with the encrypted passphrase.  

| Param | Type | Description |
| --- | --- | --- |
| publicKey | <code>CryptoKey</code> \| <code>Object</code> | The recipient's public key. This can be a CryptoKey object or a JWK. |
| data | <code>string</code> | The passphrase to be encrypted. |

**Example**  
```js
const publicKey = await getPublicKey(); // Your function to get the public key
const passphrase = "my secure passphrase";
const encryptedPassphrase = await encryptPassPhraseWithPublicKey(publicKey, passphrase);
```
<a name="decryptPassPhraseWithPrivateKey"></a>

## decryptPassPhraseWithPrivateKey(privateKey, data) ⇒ <code>Promise.&lt;string&gt;</code>
Decrypts an encrypted passphrase using the recipient's private key.

This function uses the RSA-OAEP (RSA Optimal Asymmetric Encryption Padding) algorithm for decryption.
RSA-OAEP is a public-key encryption algorithm that combines the RSA algorithm with the OAEP method.
RSA is a widely used public-key encryption algorithm that allows for secure data transmission or storage.
OAEP is a padding scheme that enhances the security of RSA by preventing certain types of attacks.

**Kind**: global function  
**Returns**: <code>Promise.&lt;string&gt;</code> - A promise that resolves with the decrypted passphrase.  

| Param | Type | Description |
| --- | --- | --- |
| privateKey | <code>CryptoKey</code> \| <code>Object</code> | The recipient's private key. This can be a CryptoKey object or a JWK. |
| data | <code>ArrayBuffer</code> | The encrypted passphrase to be decrypted. |

**Example**  
```js
const privateKey = await getPrivateKey(); // Your function to get the private key
const encryptedPassphrase = await getEncryptedPassphrase(); // Your function to get the encrypted passphrase
const decryptedPassphrase = await decryptPassPhraseWithPrivateKey(privateKey, encryptedPassphrase);
```
<a name="importPrivateKey"></a>

## importPrivateKey(jwk) ⇒ <code>Promise.&lt;CryptoKey&gt;</code>
Imports a user's private key from a JWK (JSON Web Key) for decryption purposes.

This function uses the RSA-OAEP (RSA Optimal Asymmetric Encryption Padding) algorithm with SHA-256 hash function.
The imported private key is not stored in memory or logged and is removed upon page refresh.

**Kind**: global function  
**Returns**: <code>Promise.&lt;CryptoKey&gt;</code> - A promise that resolves with the imported private key as a CryptoKey object.  

| Param | Type | Description |
| --- | --- | --- |
| jwk | <code>string</code> | The private key in JWK format as a string. This key is parsed into a JSON object before being imported. |

**Example**  
```js
const jwkString = '{"kty":"RSA",...}'; // Your JWK string
const privateKey = await importPrivateKey(jwkString);
```
<a name="importPublicKey"></a>

## importPublicKey(jwk) ⇒ <code>Promise.&lt;CryptoKey&gt;</code>
Imports a user's public key from a JWK (JSON Web Key) for encryption purposes.

This function uses the RSA-OAEP (RSA Optimal Asymmetric Encryption Padding) algorithm with SHA-256 hash function.
The imported public key can be used to encrypt data that can only be decrypted with the corresponding private key.

**Kind**: global function  
**Returns**: <code>Promise.&lt;CryptoKey&gt;</code> - A promise that resolves with the imported public key as a CryptoKey object.  

| Param | Type | Description |
| --- | --- | --- |
| jwk | <code>string</code> \| <code>Object</code> | The public key in JWK format. This can be a string or an object. If it's a string, it will be parsed into a JSON object. |

**Example**  
```js
const jwkString = '{"kty":"RSA",...}'; // Your JWK string
const publicKey = await importPublicKey(jwkString);
```
<a name="generateKeyPair"></a>

## generateKeyPair() ⇒ <code>Promise.&lt;Object&gt;</code>
Generates a public and private key pair using the RSA-OAEP algorithm.

This function uses the RSA-OAEP (RSA Optimal Asymmetric Encryption Padding) algorithm with SHA-256 hash function.
The generated key pair is then converted into the JWK (JSON Web Key) format by the `exportKeys` function.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - A promise that resolves with the generated key pair in JWK format. The returned object has `privateKey` and `publicKey` properties.  
**Example**  
```js
const jwks = await generateKeyPair();
console.log(jwks.privateKey); // Logs the private key in JWK format
console.log(jwks.publicKey); // Logs the public key in JWK format
```
