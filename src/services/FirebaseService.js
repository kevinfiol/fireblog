const range = require('../util').range;

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

    const updateUserData = (username, prop, val) => {
        return db.collection('users').doc(username).set({
            [prop]: val
        }, { merge: true });
    };

    const getUserNames = () => {
        return db.collection('users').get()
            .then(snap => {
                const userNames = [];
                snap.forEach(doc => userNames.push(doc.data().username));
                return userNames;
            })
        ;
    };

    const getUserDataByEmail = email => {
        return db.collection('users').where('email', '==', email)
            .get()
            .then(snap => {
                const users = [];
                snap.forEach(doc => users.push( doc.data() ));
                return users[0] || null;
            })
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

    const addUserToDatabase = (username, email, uid) => {
        return db.collection('users').doc(username).set({
            username,
            email,
            uid
        });
    };

    const createUserBlog = username => {
        return db.collection('blogs').doc(username).set({
            pages: [ { posts: [] } ]
        });
    };

    const getUserBlogPageNumbers = username => {
        return db.collection('blogs').doc(username)
            .get()
            .then(doc => {
                if (doc.exists) {
                    return range(doc.data().pages.length);
                }

                return null;
            })
        ;
    };

    const getUserBlogPosts = (username, pageNo) => {
        return db.collection('blogs').doc(username)
            .get()
            .then(doc => {
                if (doc.exists) {
                    const pages = doc.data().pages[pageNo] || null;
                    if (pages) return pages.posts;
                }

                return null;
            })
        ;
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
        createUserBlog,
        updateUserData,
        getUserBlogPosts,
        getUserBlogPageNumbers
    };
};