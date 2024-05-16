<template>
    <div class="card flex justify-content-center">
        <Dialog v-model:visible="store.isSettings" modal header="Settings" :style="{ width: '35rem' }">
<p>Keys are not stored and will be removed when you exit.</p>
<div class="inputDetails">
            <FloatLabel>
            <Password
              promptLabel="accessKeyId"
              ref="akid"
              inputId="accessKeyId"
              :feedback="false"
            />
            <label for="passphrase">S3 accessKeyId</label>
          </FloatLabel>     
          <FloatLabel>
            <Password
              promptLabel="S3 Key"
              ref="akey"
              inputId="accessKey"
              :feedback="false"
            />
            <label for="passphrase">S3 accessKey</label>
          </FloatLabel>     
        
        </div>
               <div class="buttonGroup">
                <Button type="button" label="Cancel" severity="secondary"></Button>
                <Button type="button" label="Update Keys" @click="update"></Button>
                <!-- <Button type="button" label="Generate RSA Key Pair" @click="genKeys"></Button> -->
                
            </div>
        </Dialog>
    </div>

</template>

<script setup>
import { ref, computed } from 'vue';
import {useStore} from '../store/store';
import Password from "primevue/password";
import FloatLabel from "primevue/floatlabel";
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import * as secure from 'crypto-middleware'
const store = useStore();

const publicKey = ref('')
const akid = ref('')


const update = () => {
    console.log('Settings updated')
    store.isCloud = true
    store.isSettings = false

}

const encryptKey = async () => {
const reply = await secure.encryptPassPhraseWithPublicKey(publicKey.value,store.passphrase)
const blob = new Blob([reply], { type: 'application/octet-stream' })

// Create an object URL for the Blob
const url = URL.createObjectURL(blob)

// Create a link element
const link = document.createElement('a')
link.href = url
link.download = 'encryptedKey.bin'

// Append the link to the body
document.body.appendChild(link)

// Simulate a click on the link
link.click()

// Remove the link from the body
document.body.removeChild(link)
  
}

const genKeys = async () => {
    const keys = await secure.generateKeyPair()
    publicKey.value = JSON.stringify(keys.exportedPublicKey)
    console.log('KEY',keys)
    const privateKeyJson = JSON.stringify(keys.exportedPrivateKey)

    // Create a Blob from the JSON string
    const blob = new Blob([privateKeyJson], { type: 'application/json' })

    // Create an object URL for the Blob
    const url = URL.createObjectURL(blob)

    // Create a link element
    const link = document.createElement('a')
    link.href = url
    link.download = 'privateKey.json'

    // Append the link to the body
    document.body.appendChild(link)

    // Simulate a click on the link
    link.click()

    // Remove the link from the body
    document.body.removeChild(link)

}




</script>

<style scoped>
.inputDetails {
    /* border:1px solid red; */
    margin:1.2rem;
    display:flex;
    flex-direction:row;
    gap:0.5rem;
}

.buttonGroup {
    display:flex;
    flex-direction:row;
    
    gap:1rem;
}

</style>