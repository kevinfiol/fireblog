module.exports = (db, auth, getTimestamp) => ({
    createUser: (email, pwd) => auth.createUserWithEmailAndPassword(email, pwd),

    signInUser: (email, pwd) => auth.signInWithEmailAndPassword(email, pwd),

    signOut: () => auth.signOut(),

    onAuthStateChanged: f => auth.onAuthStateChanged(f),

    getUserNames: () => {
        return db.collection('users').get()
            .then(snap => {
                const userNames = [];
                snap.forEach(doc => userNames.push(doc.data().username));
                return userNames;
            })
        ;
    },

    getUserByEmail: email => {
        return db.collection('users').where('email', '==', email)
            .get()
            .then(snap => {
                const users = [];
                snap.forEach(doc => users.push( doc.data() ));

                if (!users[0]) return null;
                const user = users[0];
                
                user.timestamp = user.timestamp.toDate().toJSON();
                return user;
            })
        ;
    },

    addUserToDatabase: (username, email, uid) => {
        return db.collection('users').doc(username).set({
            timestamp: getTimestamp(),
            bio: null,
            photoURL: null,
            username,
            email,
            uid
        });
    },

    updateUser: (username, prop, val) => {
        return db.collection('users').doc(username).set({
            timestamp: getTimestamp(),
            [prop]: val
        }, { merge: true });
    },

    updateProfile: (prop, val) => {
        return auth.currentUser.updateProfile({
            [prop]: val
        });
    },

    createUserListener: (username, onDocExists) => {
        const unsubscribe = db.collection('users').doc(username)
            .onSnapshot(doc => {
                try {
                    const user = doc.data();

                    if (user.timestamp) {
                        user.timestamp = user.timestamp.toDate().toJSON();
                    }
    
                    onDocExists(user);
                } catch(e) {
                    onDocExists(null);
                }
            }, () => null)
        ;

        return unsubscribe;
    }
});