/**
 * Dashboard Action Types
 */
const SET_DASHBOARD = 'SET_DASHBOARD';

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
     * Actions
     */
    const createDashboardPostsListener = onDocExists => {
        return Firebase.createLatestPostsListener(onDocExists);
    };

    return { setDashboard, createDashboardPostsListener };
};