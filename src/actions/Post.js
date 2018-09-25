/**
 * Post Action Types
 */

const POST_SET_POST = 'POST_SET_POST';
const POST_GET_POST = 'POST_GET_POST';

/**
 * Post Actions
 */

module.exports = (update, Firebase, queue) => {
    const setPostData = post => update(() => ({
        type: POST_SET_POST,
        model: { post }
    }));

    const getPost = (username, pageNo, postNo) => {
        const action = { type: POST_GET_POST };
        queue.enqueue(action);

        return Firebase.getUserBlogPost(username, pageNo, postNo)
            .then(setPostData)
            .finally(() => queue.dequeue(action))
        ;
    };

    return { setPostData, getPost };
};