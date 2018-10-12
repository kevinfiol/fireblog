/**
 * Profile Action Types
 */

const SET_PROFILE              = 'SET_PROFILE';
const SET_PROFILE_USER         = 'SET_PROFILE_USER';
const SET_PROFILE_BLOG         = 'SET_PROFILE_BLOG';

const CREATE_PROFILE_BLOG_POST    = 'CREATE_PROFILE_BLOG_POST';
const LISTEN_PROFILE_BLOG_CHANGES = 'LISTEN_PROFILE_BLOG_CHANGES';

/**
 * Profile Actions
 * @param {Stream} update   Update Stream
 * @param {Object} Firebase FirebaseService
 * @param {Object} queue    Queue Actions
 */
module.exports = (update, queue, initial, Firebase) => {
    /**
     * Setters 
     */
    const setProfile = profile => update(() => ({
        type: SET_PROFILE,
        model: { profile: profile || initial }
    }));

    const setProfileUser = user => update(() => ({
        type: SET_PROFILE_USER,
        model: { profile: { user: user || initial.user } }
    }));

    const setProfileBlog = blog => update(() => ({
        type: SET_PROFILE_BLOG,
        model: { profile: { blog: blog || initial.blog } }
    }));

    /**
     * Actions
     */
    const createProfileBlogPost = (username, title, content) => {
        const action = { type: CREATE_PROFILE_BLOG_POST };
        queue.enqueue(action);

        return Firebase.createUserBlogPost(username, title, content)
            .finally(() => queue.dequeue(action))
        ;
    };

    const createProfileBlogListener = (username, pageNo, onDocExists) => {
        const action = { type: LISTEN_PROFILE_BLOG_CHANGES };
        const enqueue = () => queue.enqueue(action);
        const dequeue = () => queue.dequeue(action);

        return Firebase.createBlogListener(username, pageNo, onDocExists, enqueue, dequeue);
    };

    const createProfileUserListener = (username, onDocExists) => {
        return Firebase.createUserListener(username, onDocExists);
    };

    return {
        // Setters
        setProfile,
        setProfileUser,
        setProfileBlog,

        // Actions
        createProfileBlogPost,
        createProfileBlogListener,
        createProfileUserListener
    };
};