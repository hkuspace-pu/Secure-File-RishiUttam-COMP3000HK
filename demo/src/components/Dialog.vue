<template>
    <div class="card flex justify-content-center">
        <Dialog v-model:visible="store.isPublicKeyModalOpen" modal header="Encrypt your Passphrase" :style="{ width: '35rem' }">

           
<!-- <FloatLabel> -->
    <label for="passphrase">Recipient Public Key (JWK format)</label>  <button @click="genKeys">Generate RSA Key Pair</button>
    <Textarea inputId="passphrase" v-model="publicKey" rows="5" cols="50" />
<!-- </FloatLabel> -->
        
        
            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="store.isPublicKeyModalOpen=false"></Button>
                <Button type="button" label="Encrypt Passphrase" @click="encryptKey"></Button>
                <!-- <Button type="button" label="Generate RSA Key Pair" @click="genKeys"></Button> -->
                
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {useStore} from '../store/store';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import * as secure from 'crypto-middleware'
const store = useStore();

const publicKey = ref('')

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

<style>

</style>