module.exports = () => {
    const length = () => localStorage.length;

    const clear = () => localStorage.clear();

    const key = n => localStorage.key(n);

    const removeItem = key => localStorage.removeItem(key);

    const getItem = key => {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    };

    const setItem = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch(e) {
            throw e;
        }
    };

    return { length, key, clear, removeItem, getItem, setItem };
};