// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQwL25bp15mBVlV67LODI4Be-J93NWTWQ",
  authDomain: "colabel-9dd96.firebaseapp.com",
  projectId: "colabel-9dd96",
  storageBucket: "colabel-9dd96.appspot.com",
  messagingSenderId: "1060195721333",
  appId: "1:1060195721333:web:066271a1c20f730385583c",
  measurementId: "G-HYQCFKKVV5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const storage = getStorage(app)


export { app, auth, storage}