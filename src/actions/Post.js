/**
 * Post Action Types
 */
const SET_POST             = 'SET_POST';
const GET_POST             = 'GET_POST';

const UPDATE_POST_BLOGPOST = 'POST_UPDATE_BLOGPOST';
const DELETE_POST_BLOGPOST = 'POST_DELETE_BLOGPOST';

/**
 * Post Actions
 */
module.exports = (update, Firebase, queue) => {
    /**
     * Setters
     */
    const setPost = post => update(() => ({
        type: SET_POST,
        model: { post }
    }));

    /**
     * Getters
     */
    const getPost = doc_id => {
        const action = { type: GET_POST };
        queue.enqueue(action);

        setPost({
            doc_id: null,
            username: null,
            title: null,
            date: null,
            content: null
        });
        
        return Firebase.getBlogPost(doc_id)
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

    return { setPost, getPost, updatePostBlogPost, deletePostBlogPost };
};