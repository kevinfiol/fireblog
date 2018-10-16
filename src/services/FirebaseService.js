module.exports = (firebase, Pager, nanoid) => {
    const db   = firebase.firestore();
    const auth = firebase.auth();
    const settings = { timestampsInSnapshots: true };
    const getTimestamp = () => firebase.firestore.FieldValue.serverTimestamp();

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

                if (!users[0]) return null;
                const user = users[0];
                
                user.timestamp = user.timestamp.toDate().toJSON();
                return user;
            })
        ;
    };

    const addUserToDatabase = (username, email, uid) => {
        return db.collection('users').doc(username).set({
            timestamp: getTimestamp(),
            bio: null,
            photoURL: null,
            username,
            email,
            uid
        });
    };

    const updateUserData = (username, prop, val) => {
        return db.collection('users').doc(username).set({
            timestamp: getTimestamp(),
            [prop]: val
        }, { merge: true });
    };

    const updateProfile = (prop, val) => {
        return auth.currentUser.updateProfile({
            [prop]: val
        });
    };

    const createUserBlog = username => {
        const pager = Pager();

        return db.collection('blogs').doc(username).set({
            timestamp: getTimestamp(),
            pages: pager.getPages(),
            comments: [],
        });
    };

    const getUserBlogPost = doc_id => {
        return db.collection('posts').doc(doc_id)
            .get()
            .then(doc => doc.exists ? doc.data() : null)
        ;
    };

    const createUserBlogPost = (username, title, content) => {
        const timestamp = getTimestamp();
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

                        // Create Post Document
                        allPostsRef.doc(doc_id).set({
                            timestamp,
                            doc_id,
                            username,
                            title,
                            content,
                            date,
                            comments: [],
                        });

                        // Update Blog Document's Pages to include new Post
                        const postRef = allPostsRef.doc(doc_id);
                        const pager = Pager(pages);
                        pager.addPost(doc_id, postRef);

                        userBlogRef.update({ timestamp, pages: pager.getPages() });
                        return;
                    }
                }

                throw 'Error: Cannot create post!';
            })
        ;
    };

    const deleteUserBlogPost = doc_id => {
        const timestamp = getTimestamp();
        const allPostsRef = db.collection('posts');
        let userBlogRef;

        return allPostsRef.doc(doc_id)
            .get()
            .then(doc => doc.data())
            .then(data => data.username)
            .then(username => {
                userBlogRef = db.collection('blogs').doc(username);
                return userBlogRef.get().then(doc => doc.data().pages);
            })
            .then(pages => {
                const pager = Pager(pages);
                pager.deletePost(doc_id);

                // Update User's blog pages with post removed
                userBlogRef.update({ timestamp, pages: pager.getPages() });
                return allPostsRef.doc(doc_id).delete();
            })
            .catch(() => {
                throw 'Error: Could not delete post!';
            })
        ;
    };

    const updateUserBlogPost = (doc_id, title, content) => {
        return db.collection('posts').doc(doc_id).update({
            timestamp: getTimestamp(),
            title,
            content
        });
    };

    const updateBlogTimestamp = username => {
        return db.collection('blogs').doc(username).update({
            timestamp: getTimestamp()
        });
    };

    const createUserBlogComment = (globalUsername, profileUsername, content) => {
        const timestamp = getTimestamp();
        const userBlogRef = db.collection('blogs').doc(profileUsername);

        const date = new Date().toLocaleDateString();
        const id = `${profileUsername}-comment-${nanoid(11)}`;

        return userBlogRef.get()
            .then(doc => doc.exists ? doc.data() : null)
            .then(data => {
                if (!data) throw 'Doc does not exist.';

                const comment = { username: globalUsername, id, date, content };
                const comments = [...data.comments];

                comments.unshift(comment);
                return comments;
            }).then(comments => {
                return userBlogRef.update({ timestamp, comments });
            })
        ;
    };

    const createPostComment = (globalUsername, post_doc_id, content) => {
        const timestamp = getTimestamp();
        const postRef = db.collection('posts').doc(post_doc_id);

        const date = new Date().toLocaleDateString();
        const id = `${post_doc_id}-comment-${nanoid(11)}`;

        return postRef.get()
            .then(doc => doc.exists ? doc.data() : null)
            .then(data => {
                if (!data) throw 'Doc does not exist.';

                const comment = { username: globalUsername, id, date, content };
                const comments = [...data.comments];

                comments.unshift(comment);
                return comments;
            }).then(comments => {
                return postRef.update({ timestamp, comments });
            })
        ;
    };

    const createPostListener = (doc_id, onDocExists) => {
        const unsubscribe = db.collection('posts').doc(doc_id)
            .onSnapshot(doc => {
                const post = doc.data() || null;

                if (post && post.timestamp) {
                    post.timestamp = post.timestamp.toDate().toJSON();
                }

                onDocExists(post);
            })
        ;

        return unsubscribe;
    };

    const createBlogListener = (username, pageNo, onDocExists) => {
        const unsubscribe = db.collection('blogs').doc(username)
            .onSnapshot(doc => {
                try {
                    const data = doc.data();

                    const blogPage = {
                        timestamp: data.timestamp ? data.timestamp.toDate().toJSON() : null,
                        page: data.pages[pageNo],
                        pageNos: Object.keys(data.pages).map(Number).sort(),
                        comments: data.comments
                    };
    
                    onDocExists(blogPage);
                } catch(e) {
                    onDocExists(null);
                }
            }, () => null)
        ;

        return unsubscribe;
    };

    const createUserListener = (username, onDocExists) => {
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
    };

    return {
        createUser,
        signInUser,
        signOut,
        onAuthStateChanged,

        getUserNames,
        getUserDataByEmail,
        addUserToDatabase,

        updateUserData,
        updateProfile,
        
        createUserBlog,
        getUserBlogPost,
        createUserBlogPost,
        deleteUserBlogPost,
        updateUserBlogPost,
        updateBlogTimestamp,
        createUserBlogComment,
        createPostComment,

        createPostListener,
        createBlogListener,
        createUserListener
    };
};