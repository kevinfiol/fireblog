module.exports = (firebase) => {
    const db   = firebase.firestore();
    const auth = firebase.auth();

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
    
    return {
        createUser,
        signInUser,
        onAuthStateChanged,
        signOut,
        updateProfile
    };
};