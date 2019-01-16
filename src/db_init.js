/**
 * Firebase Firestore Database Initialization Script
 */

const firebase  = require('firebase/app');
// const admin     = require('firebase-admin');
const FIREBASE_CONFIG = require('./config').FIREBASE_CONFIG;

require('firebase/firestore');
require('firebase/auth');

firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();
const getTimestamp = () => firebase.firestore.FieldValue.serverTimestamp();

db.settings({ timestampsInSnapshots: true });

/**
 * Delete Collection Snippet
 * https://firebase.google.com/docs/firestore/manage-data/delete-data#collections
 */

function deleteCollection(db, collectionPath, batchSize) {
    var collectionRef = db.collection(collectionPath);
    var query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, batchSize, resolve, reject);
    });
}

function deleteQueryBatch(db, query, batchSize, resolve, reject) {
    query.get().then((snapshot) => {
        // When there are no documents left, we are done
        if (snapshot.size == 0) {
            return 0;
        }

        // Delete documents in a batch
        var batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        return batch.commit().then(() => {
            return snapshot.size;
        });
    }).then((numDeleted) => {
        if (numDeleted === 0) {
            resolve();
            return;
        }

        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
            deleteQueryBatch(db, query, batchSize, resolve, reject);
        });
    }).catch(reject);
}

Promise.all([
    deleteCollection(db, 'meta', 100),
    deleteCollection(db, 'blogs', 100),
    deleteCollection(db, 'posts', 100),
    deleteCollection(db, 'users', 100)
]).then(() => Promise.all([
    db.collection('meta').doc('posts').set({ timestamp: getTimestamp() }),
    db.collection('blogs').doc().set({ }),
    db.collection('posts').doc().set({ }),
    db.collection('users').doc().set({ }),
])).then(() => {
    console.log('Initialized Database.');
    process.exit();
});