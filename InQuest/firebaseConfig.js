import {  initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
// const firebaseConfig = {
//   apiKey: 'api-key',
//   authDomain: 'project-id.firebaseapp.com',
//   databaseURL: 'https://project-id.firebaseio.com',
//   projectId: 'project-id',
//   storageBucket: 'project-id.appspot.com',
//   messagingSenderId: 'sender-id',
//   appId: 'app-id',
//   measurementId: 'G-measurement-id',
// };

const firebaseConfig = {
    apiKey: "AIzaSyB9rxtRb6hfRMCkMP28kiCpUxj_9WlWU2M",
    authDomain: "fyp-taskmanager-c1040.firebaseapp.com",
    databaseURL: "https://fyp-taskmanager-c1040-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fyp-taskmanager-c1040",
    storageBucket: "fyp-taskmanager-c1040.appspot.com",
    messagingSenderId: "667148136588",
    appId: "1:667148136588:web:4743b5ef23fba7ac914ba9"
  };

  export const FIREBASE_APP = initializeApp(firebaseConfig);
  export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
//   export const FIREBASE_AUTH = getAuth(FIREBASE_APP);

// const app = initializeApp(firebaseConfig);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
