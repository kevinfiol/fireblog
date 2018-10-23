/**
 * Dashboard Action Types
 */
const SET_DASHBOARD             = 'SET_DASHBOARD';
const GET_DASHBOARD_POSTS = 'GET_DASHBOARD_POSTS';

/**
 * Global Actions
 * @param {Stream} update   Update Stream
 * @param {Object} Firebase FirebaseService
 * @param {Object} queue    Queue Actions
 */
module.exports = (update, queue, initial, Firebase) => {
    /**
     * Setters
     */
    const setDashboard = dashboard => update(() => ({
        type: SET_DASHBOARD,
        model: { dashboard: dashboard || initial }
    }));

    /**
     * Getters 
     */
    const getDashboardPosts = () => {
        const action = { type: GET_DASHBOARD_POSTS };
        queue.enqueue(action);

        return Firebase.getLatestPosts()
            .then(posts => setDashboard({ posts }))
            .finally(() => queue.dequeue(action))
        ;
    };

    /**
     * Actions
     */
    const createDashboardPostsListener = onDocExists => {
        return Firebase.createLatestPostsListener(onDocExists);
    };

    return { setDashboard, getDashboardPosts, createDashboardPostsListener };
};