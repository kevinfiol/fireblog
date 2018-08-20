module.exports = (firebase) => {
    const db   = firebase.firestore();
    const auth = firebase.auth();

    const createUser = (email, pwd) => {
        return auth.createUserWithEmailAndPassword(email, pwd);
    };
    
    const signInUser = (email, pwd) => {
        return auth.signInWithEmailAndPassword(email, pwd);
    };
    
    const onAuthStateChanged = (f) => {
        return auth.onAuthStateChanged(f);
    };
    
    return {
        createUser,
        signInUser,
        onAuthStateChanged
    };
};