/**
 * Post Action Types
 */

const POST_SET_POST        = 'POST_SET_POST';
const POST_GET_POST        = 'POST_GET_POST';

const POST_UPDATE_BLOGPOST = 'POST_UPDATE_BLOGPOST';
const POST_DELETE_BLOGPOST = 'POST_DELETE_BLOGPOST';

/**
 * Post Actions
 */

module.exports = (update, Firebase, queue) => {
    const setPostData = post => update(() => ({
        type: POST_SET_POST,
        model: { post }
    }));

    const getPost = doc_id => {
        const action = { type: POST_GET_POST };
        queue.enqueue(action);

        return Firebase.getBlogPost(doc_id)
            .then(setPostData)
            .finally(() => queue.dequeue(action))
        ;
    };

    const updateBlogPost = (doc_id, title, content) => {
        const action = { type: POST_UPDATE_BLOGPOST };
        queue.enqueue(action);

        return Firebase.updateUserBlogPost(doc_id, title, content)
            .finally(() => queue.dequeue(action))
        ;
    };

    const deleteBlogPost = doc_id => {
        const action = { type: POST_DELETE_BLOGPOST };
        queue.enqueue(action);

        return Firebase.deleteUserBlogPost(doc_id)
            .finally(() => queue.dequeue(action))
        ;
    };

    return { setPostData, getPost, updateBlogPost, deleteBlogPost };
};