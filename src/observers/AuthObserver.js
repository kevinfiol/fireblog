const m = require('mithril');

module.exports = (Firebase, mutators) => {
    const { currentUser, toggleLoading } = mutators;
    toggleLoading(true);

    Firebase.onAuthStateChanged(user => {
        if (user) currentUser(user);
        else currentUser(null);

        toggleLoading(false);
        m.redraw();
    });
};