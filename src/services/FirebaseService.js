module.exports = (firebase) => {
    const db   = firebase.firestore();
    const auth = firebase.auth();
    const settings = { timestampsInSnapshots: true };

    db.settings(settings);

    const createUser = (email, pwd) => {
        return auth.createUserWithEmailAndPassword(email, pwd);
    };

    const signInUser = (email, pwd) => {
        return auth.signInWithEmailAndPassword(email, pwd);
    };

    const signOut = () => {
        return auth.signOut();
    };

    const onAuthStateChanged = (f) => {
        return auth.onAuthStateChanged(f);
    };

    const updateProfile = (prop, val) => {
        return auth.currentUser.updateProfile({
            [prop]: val
        });
    };

    const updateUserData = (email, prop, val) => {
        return db.collection('users').doc(email).set({
            [prop]: val
        }, { merge: true });
    };

    const getUserNames = () => {
        return db.collection('users').get()
            .then(snap => {
                const userNames = [];
                snap.forEach(doc => userNames.push(doc.id));
                return userNames;
            })
        ;
    };

    const getUserDataByEmail = email => {
        return db.collection('users').doc(email).get()
            .then(doc => doc.data())
        ;
    };

    const getUserDataByUsername = username => {
        return db.collection('users').where('username', '==', username)
            .get()
            .then(snap => {
                const users = [];
                snap.forEach(doc => users.push( doc.data() ));
                return users[0] || null;
            })
        ;
    };

    const addUserToDatabase = (email, username, uid) => {
        return db.collection('users').doc(email).set({
            username,
            uid
        });
    };

    return {
        getUserDataByEmail,
        getUserDataByUsername,
        createUser,
        signInUser,
        onAuthStateChanged,
        signOut,
        updateProfile,
        getUserNames,
        addUserToDatabase,
        updateUserData
    };
};