/**
 * Profile Action Types
 */

const PROFILE_SET_PROFILEDATA = 'PROFILE_SET_PROFILEDATA';
const PROFILE_SET_PAGEDATA    = 'PROFILE_SET_PAGEDATA';

const PROFILE_GET_PROFILEDATA = 'PROFILE_GET_PROFILEDATA';
const PROFILE_GET_BLOGPAGE    = 'PROFILE_GET_BLOGPAGE';

const PROFILE_CREATE_BLOGPOST = 'PROFILE_CREATE_BLOGPOST';

/**
 * Profile Actions
 * @param {Stream} update   Update Stream
 * @param {Object} Firebase FirebaseService
 * @param {Object} queue    Queue Actions
 */

module.exports = (update, Firebase, queue) => {
    const setProfileData = user => update(() => ({
        type: PROFILE_SET_PROFILEDATA,
        model: { profile: { user } }
    }));

    const setPageData = page => update(() => ({
        type: PROFILE_SET_PAGEDATA,
        model: { profile: { blog: { page } } }
    }));

    const getProfileData = username => {
        const action = { type: PROFILE_GET_PROFILEDATA };
        queue.enqueue(action);

        setProfileData(null);
        return Firebase.getUserDataByUsername(username)
            .then(setProfileData)
            .finally(() => queue.dequeue(action))
        ;
    };

    const getBlogPage = (username, pageNo) => {
        const action = { type: PROFILE_GET_BLOGPAGE };
        queue.enqueue(action);

        return Firebase.getUserBlogPage(username, pageNo)
            .then(setPageData)
            .finally(() => queue.dequeue(action))
        ;
    };

    const createBlogPost = (username, title, content) => {
        const action = { type: PROFILE_CREATE_BLOGPOST };
        queue.enqueue(action);

        return Firebase.createUserBlogPost(username, title, content)
            .finally(() => queue.dequeue(action))
        ;
    };

    return {
        getProfileData,
        setProfileData,
        setPageData,
        getBlogPage,
        createBlogPost
    };
};