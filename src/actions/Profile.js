/**
 * Profile Action Types
 */

const SET_PROFILE              = 'SET_PROFILE';
const SET_PROFILE_USER         = 'SET_PROFILE_USER';
const SET_PROFILE_BLOG         = 'SET_PROFILE_BLOG';

const CREATE_PROFILE_BLOG_POST    = 'CREATE_PROFILE_BLOG_POST';
const CREATE_PROFILE_BLOG_COMMENT = 'CREATE_PROFILE_BLOG_COMMENT';

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

        return Firebase.createPost(username, title, content)
            .finally(() => queue.dequeue(action))
        ;
    };

    const createProfileBlogComment = (globalUsername, profileUsername, content) => {
        const action = { type: CREATE_PROFILE_BLOG_COMMENT };
        queue.enqueue(action);

        return Firebase.createBlogComment(globalUsername, profileUsername, content)
            .finally(() => queue.dequeue(action))
        ;
    };

    const createProfileBlogListener = (username, pageNo, onDocExists) => {
        return Firebase.createBlogListener(username, pageNo, onDocExists);
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
        createProfileBlogComment,
        createProfileBlogListener,
        createProfileUserListener
    };
};