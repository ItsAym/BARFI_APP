import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBRlP983hsCHi_XQlkkK8RwR4fq5vd9QVM',
  authDomain: 'barfi-af8eb.firebaseapp.com',
  projectId: 'barfi-af8eb',
  storageBucket: 'barfi-af8eb.firebasestorage.app',
  messagingSenderId: '1022334800353',
  appId: '1:1022334800353:web:873e9e21b8e511980802a0',
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
