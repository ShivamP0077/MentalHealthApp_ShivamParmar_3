// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDjZQ--4akc9taUjzuoNKbaWJ7oAt7-4_g",
    authDomain: "hackprints03-5cb81.firebaseapp.com",
    projectId: "hackprints03-5cb81",
    storageBucket: "hackprints03-5cb81.firebasestorage.app",
    messagingSenderId: "823401548177",
    appId: "1:823401548177:web:3516ba0910a8dc51057230",
    measurementId: "G-SPKFW6380E"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
// const analytics = getAnalytics(app);