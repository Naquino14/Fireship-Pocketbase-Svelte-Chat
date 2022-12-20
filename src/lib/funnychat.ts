// user auth
import PocketBase from 'pocketbase'
import { writable } from 'svelte/store'

// this is the pocketbase instance. It is used to access the database.
export const pb = new PocketBase(`http://127.0.0.1:8090`)

// this is the user object. its null when the user isnt logged in
export const currentUser = writable(pb.authStore.model)

// now we make a callback function that will be called when the user logs in or out
pb.authStore.onChange((auth) => {
    console.log('auth changed', auth)
    currentUser.set(pb.authStore.model)
})