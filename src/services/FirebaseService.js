module.exports = (firebase, Pager, nanoid) => {
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
        const pager = Pager();

        return db.collection('blogs').doc(username).set({
            pages: pager.getPages()
        });
    };

    const getUserBlogPageNumbers = username => {
        return db.collection('blogs').doc(username)
            .get()
            .then(doc => {
                if (!doc.exists) return null;
                const pages = doc.data().pages;
                const pager = Pager(pages);

                return pager.getPageNumbers();
            })
        ;
    };

    const getUserBlogPage = (username, pageNo) => {
        return db.collection('blogs').doc(username)
            .get()
            .then(doc => {
                if (!doc.exists) throw 'Document does not exist.';

                const pages = doc.data().pages;
                const page = Pager(pages).getPage(pageNo);
                const refs = page.posts.map(ref => ref);

                return Promise.all([
                    page,
                    ...refs.map(ref => ref.get().then(doc => doc.data()))
                ]);
            })
            .then(res => {
                const page = res.shift();
                page.posts = [...res];

                return page;
            })
            .catch(() => null)
        ;
    };

    const getBlogPost = uid => {
        return db.collection('posts').doc(uid)
            .get()
            .then(doc => doc.exists ? doc.data() : null)
        ;
    };

    const createUserBlogPost = (username, title, content) => {
        const date = new Date().toLocaleDateString();
        const userBlogRef = db.collection('blogs').doc(username);
        const allPostsRef = db.collection('posts');

        return userBlogRef.get()
            .then(doc => {
                if (doc.exists) {
                    const pages = doc.data().pages || null;

                    if (pages) {
                        const uid = nanoid(11);
                        const doc_id = `${username}-${uid}`;
                        allPostsRef.doc(doc_id).set({ doc_id, username, title, content, date });

                        const postRef = allPostsRef.doc(doc_id);
                        const pager = Pager(pages);
                        pager.addPost(postRef);

                        userBlogRef.set({ pages: pager.getPages() });
                        return;
                    }
                }

                throw 'Error: Cannot create post!';
            })
        ;
    };

    const updateUserBlogPost = (doc_id, title, content) => {
        return db.collection('posts').doc(doc_id).update({
            title,
            content
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
        createUserBlog,
        updateUserData,
        getUserBlogPage,
        getUserBlogPageNumbers,
        getBlogPost,
        createUserBlogPost,
        updateUserBlogPost
    };
};