/**
 * Post Action Types
 */
const SET_POST                   = 'SET_POST';
const GET_POST                   = 'GET_POST';

const UPDATE_POST_BLOGPOST       = 'POST_UPDATE_BLOGPOST';
const UPDATE_POST_BLOG_TIMESTAMP = 'UPDATE_POST_BLOG_TIMESTAMP';
const DELETE_POST_BLOGPOST       = 'POST_DELETE_BLOGPOST';
const CREATE_POST_COMMENT        = 'CREATE_POST_COMMENT';
const DELETE_POST_COMMENT        = 'DELETE_POST_COMMENT';

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
        
        return Firebase.getPost(doc_id)
            .then(setPost)
            .finally(() => queue.dequeue(action))
        ;
    };

    const updatePost = (doc_id, title, content) => {
        const action = { type: UPDATE_POST_BLOGPOST };
        queue.enqueue(action);

        return Firebase.updatePost(doc_id, title, content)
            .finally(() => queue.dequeue(action))
        ;
    };

    const deletePost = doc_id => {
        const action = { type: DELETE_POST_BLOGPOST };
        queue.enqueue(action);

        return Firebase.deletePost(doc_id)
            .finally(() => queue.dequeue(action))
        ;
    };

    const updateBlogTimestamp = username => {
        const action = { type: UPDATE_POST_BLOG_TIMESTAMP };
        queue.enqueue(action);

        return Firebase.updateBlogTimestamp(username)
            .finally(() => queue.dequeue(action))
        ;
    };

    const createPostComment = (globalUsername, post_doc_id, content) => {
        const action = { type: CREATE_POST_COMMENT };
        queue.enqueue(action);

        return Firebase.createPostComment(globalUsername, post_doc_id, content)
            .finally(() => queue.dequeue(action))
        ;
    };

    const deletePostComment = (post_doc_id, commentId) => {
        const action = { type: DELETE_POST_COMMENT };
        queue.enqueue(action);

        return Firebase.deletePostComment(post_doc_id, commentId)
            .finally(() => queue.dequeue(action))
        ;
    };

    const createPostListener = (doc_id, onDocExists) => {
        return Firebase.createPostListener(doc_id, onDocExists);
    };

    return {
        getPost,
        setPost,
        updatePost,
        deletePost,
        updateBlogTimestamp,
        createPostListener,
        createPostComment,
        deletePostComment
    };
};