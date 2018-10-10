/** Dependencies */
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { FIREBASE_CONFIG } from 'config';
import { Pager, nanoid } from 'util';
firebase.initializeApp(FIREBASE_CONFIG);

/** Services */
import FirebaseService from './FirebaseService';
const Firebase = FirebaseService(firebase, Pager, nanoid);

import StorageService from './StorageService';
const LocalStore = StorageService();

export default { Firebase, LocalStore };