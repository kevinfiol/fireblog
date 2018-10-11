/**
 * Profile Action Types
 */

const SET_PROFILE              = 'SET_PROFILE';
const SET_PROFILE_USER         = 'SET_PROFILE_USER';
const SET_PROFILE_BLOG         = 'SET_PROFILE_BLOG';
const SET_PROFILE_BLOG_PAGE    = 'SET_PROFILE_BLOG_PAGE';
const SET_PROFILE_BLOG_PAGENOS = 'SET_PROFILE_BLOG_PAGENOS';

const GET_PROFILE_USER         = 'GET_PROFILE_USER';
const GET_PROFILE_BLOG_PAGE    = 'GET_PROFILE_BLOG_PAGE';
const GET_PROFILE_BLOG_PAGENOS = 'GET_PROFILE_BLOG_PAGENOS';

const CREATE_PROFILE_BLOG_POST  = 'CREATE_PROFILE_BLOG_POST';

const CREATE_PROFILE_BLOG_LISTENER = 'CREATE_PROFILE_BLOGLISTENER';
const CREATE_PROFILE_USER_LISTENER = 'CREATE_PROFILE_USER_LISTENER';

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

    const setProfileUser = data => update(() => {
        const type = SET_PROFILE_USER;
        let user = {};

        if (!data) {
            user = {
                username: null,
                bio: null,
                email: null,
                photoURL: null,
                uid: null
            };
        } else {
            for (let key in data) {
                user[key] = data[key];
            }
        }

        return {
            type,
            model: { profile: { user } }
        };
    });

    const setProfileBlog = blog => update(() => ({
        type: SET_PROFILE_BLOG,
        model: { profile: { blog } }
    }));

    const setProfileBlogPage = data => update(() => {
        const type = SET_PROFILE_BLOG_PAGE;
        let page = {};

        if (!data) page = { pageNo: null, posts: null };
        else page = { pageNo: data.pageNo, posts: data.posts };

        return {
            type,
            model: { profile: { blog: { page } } }
        };
    });

    const setProfileBlogPageNos = pageNos => update(() => ({
        type: SET_PROFILE_BLOG_PAGENOS,
        model: { profile: { blog: { pageNos } } }
    }));

    /**
     * Getters
     */
    const getProfileUser = username => {
        const action = { type: GET_PROFILE_USER };
        queue.enqueue(action);

        setProfileUser(null);
        return Firebase.getUserDataByUsername(username)
            .then(setProfileUser)
            .finally(() => queue.dequeue(action))
        ;
    };

    const getProfileBlogPage = (username, pageNo) => {
        const action = { type: GET_PROFILE_BLOG_PAGE };
        queue.enqueue(action);

        setProfileBlogPage(null);
        return Firebase.getUserBlogPage(username, pageNo)
            .then(setProfileBlogPage)
            .finally(() => queue.dequeue(action))
        ;
    };

    const getProfileBlogPageNos = username => {
        const action = { type: GET_PROFILE_BLOG_PAGENOS };
        queue.enqueue(action);

        return Firebase.getUserBlogPageNumbers(username)
            .then(setProfileBlogPageNos)
            .finally(() => queue.dequeue(action))
        ;
    };

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
        const action = { type: CREATE_PROFILE_BLOG_LISTENER };
        return Firebase.createBlogListener(username, pageNo, onDocExists);
    };

    const createProfileUserListener = (username, onDocExists) => {
        const action = { type: CREATE_PROFILE_USER_LISTENER };
        return Firebase.createUserListener(username, onDocExists);
    };

    return {
        // Setters
        setProfile,
        setProfileUser,
        setProfileBlog,
        setProfileBlogPage,
        setProfileBlogPageNos,

        // Getters
        getProfileUser,
        getProfileBlogPage,
        getProfileBlogPageNos,

        // Actions
        createProfileBlogPost,

        createProfileBlogListener,
        createProfileUserListener
    };
};