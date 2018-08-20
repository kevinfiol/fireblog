module.exports = (Firebase, mutators) => {
    const { assignUser } = mutators;

    Firebase.onAuthStateChanged((user) => {
        if (user) {
            console.log('user is', user);
            assignUser(user.email);
        } else {
            // User is signed out
            console.log('user is signed out');
        }
    });
};