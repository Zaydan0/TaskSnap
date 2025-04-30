// firebase.js
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import { initializeApp } from 'firebase/app';
import { getAuth }      from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage }   from 'firebase/storage';

const firebaseConfig = {
  apiKey:            'AIzaSyB6ap2ntaaUkUgeWYwgIdk-QRLYZMKzoxw',
  authDomain:        'todoapp-42cf2.firebaseapp.com',
  projectId:         'todoapp-42cf2',
  storageBucket:     'todoapp-42cf2.firebasestorage.app',  // ← your actual bucket
  messagingSenderId: '457389266786',
  appId:             '1:457389266786:web:a6c4c94fc1f55a14877e3b'
};

const app = initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
