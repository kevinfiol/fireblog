module.exports = (db, nanoid, Pager, getTimestamp) => ({
    getPost: doc_id => {
        return db.collection('posts')
            .doc('posts_doc').collection('posts').doc(doc_id)
            .get()
            .then(doc => doc.exists ? doc.data() : null)
        ;
    },

    getLatestPosts: () => {
        return db.collection('posts').doc('posts_doc').collection('posts')
            .orderBy('created', 'desc')
            .get()
            .then(snap => {
                const posts = [];
                snap.forEach(doc => posts.push( doc.data() ));
                return posts;
            })
        ;
    },

    createPost: (username, title, content) => {
        const blogsRef = db.collection('blogs').doc(username);
        const postsRef = db.collection('posts').doc('posts_doc');

        return blogsRef.get()
            .then(doc => doc.exists ? doc.data() : null)
            .then(data => {
                if (!data) throw 'Doc does not exist.';
                return data.pages || null;
            }).then(pages => {
                if (!pages) throw 'Cannot create new page.';
                
                const created = getTimestamp();
                const timestamp = created;
                const doc_id = `${username}-${nanoid(11)}`;
                const date = new Date().toLocaleDateString();

                // Create Post Document
                postsRef.collection('posts').doc(doc_id).set({
                    created,
                    timestamp,
                    doc_id,
                    username,
                    title,
                    content,
                    date,
                    comments: [],
                });

                // Update timestamp for posts
                postsRef.set({ timestamp }, { merge: true });

                // Update Blog Document's Pages to include new Post
                const postRef = postsRef.collection('posts').doc(doc_id);
                const pager = Pager(pages);
                pager.addPost(doc_id, postRef);

                blogsRef.update({ timestamp, pages: pager.getPages() });
                return;
            })
        ;
    },

    deletePost: doc_id => {
        const postsRef = db.collection('posts').doc('posts_doc');
        const postsCollectionRef = db.collection('posts').doc('posts_doc').collection('posts');
        let userBlogRef;

        return postsCollectionRef.doc(doc_id).get()
            .then(doc => doc.exists ? doc.data() : null)
            .then(data => {
                if (!data) throw 'Doc does not exist.';
                return data.username;
            })
            .then(username => {
                userBlogRef = db.collection('blogs').doc(username);
                return userBlogRef.get().then(doc => doc.data().pages);
            })
            .then(pages => {
                const timestamp = getTimestamp();

                // Update posts/posts_doc/timestamp
                postsRef.set({ timestamp }, { merge: true });

                // Update User's blog pages with post removed
                const pager = Pager(pages);
                pager.deletePost(doc_id);
                userBlogRef.update({ timestamp, pages: pager.getPages() });

                // Delete Post
                return postsCollectionRef.doc(doc_id).delete();
            })
        ;
    },

    updatePost: (doc_id, title, content) => {
        const postsRef = db.collection('posts').doc('posts_doc');
        const postRef = db.collection('posts').doc('posts_doc').collection('posts').doc(doc_id);
        const timestamp = getTimestamp();

        return Promise.all([
            postsRef.set({ timestamp }, { merge: true }),
            postRef.update({ timestamp, title, content })
        ]);
    },

    createPostComment: (globalUsername, post_doc_id, content) => {
        const postRef = db.collection('posts').doc('posts_doc').collection('posts').doc(post_doc_id);
        
        return postRef.get()
            .then(doc => doc.exists ? doc.data() : null)
            .then(data => {
                if (!data) throw 'Doc does not exist.';

                const id = `comment-${nanoid(11)}`;
                const date = new Date().toLocaleDateString();

                const comment = { username: globalUsername, id, date, content };
                const comments = [...data.comments];

                comments.push(comment);
                return comments;
            }).then(comments => {
                const timestamp = getTimestamp();
                return postRef.update({ timestamp, comments });
            })
        ;
    },

    deletePostComment: (post_doc_id, commentId) => {
        const postRef = db.collection('posts').doc('posts_doc').collection('posts').doc(post_doc_id);

        return postRef.get()
            .then(doc => doc.exists ? doc.data() : null)
            .then(data => {
                if (!data) throw 'Doc does not exist';

                const comments = [...data.comments];
                const index = comments.findIndex(c => c.id === commentId);

                if (index > -1) comments.splice(index, 1);
                return comments;
            }).then(comments => {
                const timestamp = getTimestamp();
                return postRef.update({ timestamp, comments });
            })
        ;
    },

    createPostListener: (doc_id, onDocExists) => {
        const unsubscribe = db.collection('posts').doc('posts_doc').collection('posts').doc(doc_id)
            .onSnapshot(doc => {
                try {
                    const post = doc.data() || null;

                    if (post && post.timestamp) {
                        post.timestamp = post.timestamp.toDate().toJSON();
                    }
    
                    onDocExists(post);
                } catch(e) {
                    onDocExists(null);
                }
            }, () => onDocExists(null))
        ;

        return unsubscribe;
    },

    createLatestPostsListener: onDocExists => {
        const unsubscribe = db.collection('posts').doc('posts_doc')
            .onSnapshot(doc => {
                try {
                    const dashboard = {};
                    const postsDoc = doc.data() || null;
                    
                    if (postsDoc && postsDoc.timestamp) {
                        dashboard.timestamp = postsDoc.timestamp.toDate().toJSON();
                    }
                    
                    onDocExists(dashboard);
                } catch(e) {
                    onDocExists(null);
                }
            })
        ;

        return unsubscribe;
    }
});