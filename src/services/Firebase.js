import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

export default {
    db: null,
    auth: null,

    init(config) {
        firebase.initializeApp(config);
        this.db = firebase.firestore();
        this.auth = firebase.auth();
    },

    createUser(email, pwd) {
        return this.auth.createUserWithEmailAndPassword(email, pwd)
            .then(res => res)
            .catch(err => { throw err; })
        ;
    }
};