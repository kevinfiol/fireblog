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

    const removeCache = route => {
        LocalStore.removeItem(route);
    };

    return { setCache, getCache, removeCache };
};