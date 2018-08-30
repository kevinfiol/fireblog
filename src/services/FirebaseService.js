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

    const getUserNames = () => {
        return db.collection('users').get()
            .then(snap => {
                const userNames = [];
                snap.forEach(doc => userNames.push(doc.id));
                return userNames;
            })
        ;
    };

    return {
        createUser,
        signInUser,
        onAuthStateChanged,
        signOut,
        updateProfile,
        getUserNames
    };
};