module.exports = (db, nanoid, Pager, getTimestamp) => ({
    getPost: doc_id => {
        return db.collection('posts').doc(doc_id)
            .get()
            .then(doc => doc.exists ? doc.data() : null)
        ;
    },

    createPost: (username, title, content) => {
        const blogsRef = db.collection('blogs').doc(username);
        const postsRef = db.collection('posts');

        return blogsRef.get()
            .then(doc => doc.exists ? doc.data() : null)
            .then(data => {
                if (!data) throw 'Doc does not exist.';
                return data.pages || null;
            }).then(pages => {
                if (!pages) throw 'Cannot create new page.';
                
                const timestamp = getTimestamp();
                const doc_id = `${username}-${nanoid(11)}`;
                const date = new Date().toLocaleDateString();

                // Create Post Document
                postsRef.doc(doc_id).set({
                    timestamp,
                    doc_id,
                    username,
                    title,
                    content,
                    date,
                    comments: [],
                });

                // Update Blog Document's Pages to include new Post
                const postRef = postsRef.doc(doc_id);
                const pager = Pager(pages);
                pager.addPost(doc_id, postRef);

                blogsRef.update({ timestamp, pages: pager.getPages() });
                return;
            })
        ;
    },

    deletePost: doc_id => {
        const postsRef = db.collection('posts');
        let userBlogRef;

        return postsRef.doc(doc_id).get()
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
                const pager = Pager(pages);
                pager.deletePost(doc_id);

                // Update User's blog pages with post removed
                userBlogRef.update({ timestamp, pages: pager.getPages() });
                return postsRef.doc(doc_id).delete();
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
        const postRef = db.collection('posts').doc(post_doc_id);
        
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
                const timestamp = getTimestamp();
                return postRef.update({ timestamp, comments });
            })
        ;
    },

    createPostListener: (doc_id, onDocExists) => {
        const unsubscribe = db.collection('posts').doc(doc_id)
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
        const unsubscribe = db.collection('posts').orderBy('timestamp', 'desc')
            .onSnapshot(snap => {
                const posts = [];
                snap.forEach(doc => posts.push( doc.data() ));

                onDocExists(posts);
            })
        ;

        return unsubscribe;
    }
});