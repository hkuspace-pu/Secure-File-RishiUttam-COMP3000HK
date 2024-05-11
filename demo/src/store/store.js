import { defineStore } from 'pinia'

export const useStore = defineStore("store", {
    state: () => ({
        
            isPublicKeyModalOpen:false,
            passphrase : '',
            testResults : []
        
    }),
    actions: {
        closeModal() {
                this.isPublicKeyModalOpen = false
        },
        openModal() {
            console.log('action called')
            this.isPublicKeyModalOpen = true
        },
        setPassphrase(value) {
            this.passphrase = value
        }
    }
}) // Store name

