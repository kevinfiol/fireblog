module.exports = (db, nanoid, Pager, getTimestamp) => ({
    getPost: doc_id => {
        return db.collection('posts').doc(doc_id)
            .get()
            .then(doc => doc.exists ? doc.data() : null)
        ;
    },

    createPost: (username, title, content) => {
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
    },

    deletePost: doc_id => {
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
    },

    updatePost: (doc_id, title, content) => {
        return db.collection('posts').doc(doc_id).update({
            timestamp: getTimestamp(),
            title,
            content
        });
    },

    createPostComment: (globalUsername, post_doc_id, content) => {
        const timestamp = getTimestamp();
        const postRef = db.collection('posts').doc(post_doc_id);
        const date = new Date().toLocaleDateString();
        const id = `comment-${nanoid(11)}`;

        return postRef.get()
            .then(doc => doc.exists ? doc.data() : null)
            .then(data => {
                if (!data) throw 'Doc does not exist.';

                const comment = { username: globalUsername, id, date, content };
                const comments = [...data.comments];
                comments.push(comment);

                return comments;
            }).then(comments => {
                return postRef.update({ timestamp, comments });
            })
        ;
    },

    deletePostComment: (post_doc_id, commentId) => {
        const timestamp = getTimestamp();
        const postRef = db.collection('posts').doc(post_doc_id);

        return postRef.get()
            .then(doc => doc.exists ? doc.data() : null)
            .then(data => {
                if (!data) throw 'Doc does not exist';

                const comments = [...data.comments];
                const index = comments.findIndex(c => c.id === commentId);

                if (index > -1) comments.splice(index, 1);
                return comments;
            }).then(comments => {
                return postRef.update({ timestamp, comments });
            })
        ;
    },

    createPostListener: (doc_id, onDocExists) => {
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
    }
});