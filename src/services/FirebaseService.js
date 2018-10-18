const User = require('./FirebaseService/User');
const Blog = require('./FirebaseService/Blog');
const Post = require('./FirebaseService/Post');

module.exports = (firebase, Pager, nanoid) => {
    const db   = firebase.firestore();
    const auth = firebase.auth();
    const settings = { timestampsInSnapshots: true };
    const getTimestamp = () => firebase.firestore.FieldValue.serverTimestamp();
    db.settings(settings);

    const UserMethods = User(db, auth, getTimestamp);
    const BlogMethods = Blog(db, nanoid, Pager, getTimestamp);
    const PostMethods = Post(db, nanoid, Pager, getTimestamp);

    return Object.assign({}, UserMethods, BlogMethods, PostMethods);
};