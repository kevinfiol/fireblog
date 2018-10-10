/**
 * Cache Actions
 */
module.exports = LocalStore => {
    const setCache = (route, value) => {
        LocalStore.setItem(route, value);
    };

    const getCache = route => {
        return LocalStore.getItem(route);
    };

    return { setCache, getCache };
};