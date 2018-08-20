/** Dependencies */
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { FIREBASE_CONFIG } from 'config';
firebase.initializeApp(FIREBASE_CONFIG);

/** Services */
import FirebaseService from 'services/FirebaseService';
const Firebase = FirebaseService(firebase);

export {
    Firebase
};