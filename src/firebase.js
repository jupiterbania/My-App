import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: 'AIzaSyCWMh93QQ6fSjlDC4H7Q5DIkgp2kamxAUQ',
    appId: '1:11735286620:web:1cfab70e4e901da3897799',
    messagingSenderId: '11735286620',
    projectId: 'studio-3289453471-1e5ca',
    authDomain: 'studio-3289453471-1e5ca.firebaseapp.com',
    storageBucket: 'studio-3289453471-1e5ca.firebasestorage.app',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
