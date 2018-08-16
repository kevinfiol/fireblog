import stream from 'mithril/stream';
import merge from 'deepmerge';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

/** Dependencies */
import { FIREBASE_CONFIG } from './config';
firebase.initializeApp(FIREBASE_CONFIG);

/** Mutators */
import Global from './mutators/Global';

/** State */
const initialState = {
    global: { user: null, signUpMsg: null, showSignUp: false },
};

const update = stream();
const model = stream.scan(merge, initialState, update);
const mutators = { global: Global(update, firebase) }

update.map(v => console.log('update: ', v));

export { model, mutators, initialState };