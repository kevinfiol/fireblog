/**
 * Firebase Firestore Database Initialization Script
 */

const firebase  = require('firebase/app');
const FIREBASE_CONFIG = require('./config').FIREBASE_CONFIG;

require('firebase/firestore');
require('firebase/auth');

firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });

Promise.all([
    db.collection('blogs').doc().set({}),
    db.collection('posts').doc().set({}),
    db.collection('users').doc().set({})
]).then(() => process.exit());