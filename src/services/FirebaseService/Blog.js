module.exports = (db, nanoid, Pager, getTimestamp) => ({
    createBlog: username => {
        const pager = Pager();

        return db.collection('blogs').doc(username).set({
            timestamp: getTimestamp(),
            pages: pager.getPages(),
            comments: [],
        });
    },

    updateBlogTimestamp: username => {
        return db.collection('blogs').doc(username).update({
            timestamp: getTimestamp()
        });
    },

    createBlogComment: (globalUsername, profileUsername, content) => {
        const timestamp = getTimestamp();
        const userBlogRef = db.collection('blogs').doc(profileUsername);
        const date = new Date().toLocaleDateString();
        const id = `comment-${nanoid(11)}`;

        return userBlogRef.get()
            .then(doc => doc.exists ? doc.data() : null)
            .then(data => {
                if (!data) throw 'Doc does not exist.';

                const comment = { username: globalUsername, id, date, content };
                const comments = [...data.comments];
                comments.push(comment);

                return comments;
            }).then(comments => {
                return userBlogRef.update({ timestamp, comments });
            })
        ;
    },

    deleteBlogComment: (profileUsername, commentId) => {
        const timestamp = getTimestamp();
        const userBlogRef = db.collection('blogs').doc(profileUsername);

        return userBlogRef.get()
            .then(doc => doc.exists ? doc.data() : null)
            .then(data => {
                if (!data) throw 'Doc does not exist';

                const comments = [...data.comments];
                const index = comments.findIndex(c => c.id === commentId);

                if (index > -1) comments.splice(index, 1);
                return comments;
            }).then(comments => {
                return userBlogRef.update({ timestamp, comments });
            })
        ;
    },

    createBlogListener: (username, pageNo, onDocExists) => {
        const unsubscribe = db.collection('blogs').doc(username)
            .onSnapshot(doc => {
                try {
                    const data = doc.data();
                    const timestamp = data.timestamp ? data.timestamp.toDate().toJSON() : null;
                    const page      = data.pages[pageNo];
                    const pageNos   = Object.keys(data.pages).map(Number).sort();
                    const comments  = data.comments;

                    const newBlogState = { timestamp, page, pageNos, comments };
                    onDocExists(newBlogState);
                } catch(e) {
                    onDocExists(null);
                }
            }, () => onDocExists(null))
        ;

        return unsubscribe;
    }
});