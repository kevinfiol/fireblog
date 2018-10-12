/**
 * Post Action Types
 */
const SET_POST                   = 'SET_POST';
const GET_POST                   = 'GET_POST';

const UPDATE_POST_BLOGPOST       = 'POST_UPDATE_BLOGPOST';
const UPDATE_POST_BLOG_TIMESTAMP = 'UPDATE_POST_BLOG_TIMESTAMP';
const DELETE_POST_BLOGPOST       = 'POST_DELETE_BLOGPOST';

/**
 * Post Actions
 */
module.exports = (update, queue, initial, Firebase) => {
    /**
     * Setters
     */
    const setPost = post => update(() => ({
        type: SET_POST,
        model: { post: post || initial }
    }));

    /**
     * Getters
     */
    const getPost = doc_id => {
        const action = { type: GET_POST };
        queue.enqueue(action);
        
        return Firebase.getUserBlogPost(doc_id)
            .then(setPost)
            .finally(() => queue.dequeue(action))
        ;
    };

    const updatePostBlogPost = (doc_id, title, content) => {
        const action = { type: UPDATE_POST_BLOGPOST };
        queue.enqueue(action);

        return Firebase.updateUserBlogPost(doc_id, title, content)
            .finally(() => queue.dequeue(action))
        ;
    };

    const deletePostBlogPost = doc_id => {
        const action = { type: DELETE_POST_BLOGPOST };
        queue.enqueue(action);

        return Firebase.deleteUserBlogPost(doc_id)
            .finally(() => queue.dequeue(action))
        ;
    };

    const updatePostBlogTimestamp = username => {
        const action = { type: UPDATE_POST_BLOG_TIMESTAMP };
        queue.enqueue(action);

        return Firebase.updateBlogTimestamp(username)
            .finally(() => queue.dequeue(action))
        ;
    };

    const createPostListener = (doc_id, onDocExists) => {
        return Firebase.createPostListener(doc_id, onDocExists);
    };

    return {
        getPost,
        setPost,
        updatePostBlogPost,
        deletePostBlogPost,
        updatePostBlogTimestamp,
        createPostListener
    };
};