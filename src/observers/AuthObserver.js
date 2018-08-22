const m = require('mithril');

module.exports = (Firebase, mutators) => {
    const { assignUser, toggleLoading } = mutators;
    toggleLoading(true);

    Firebase.onAuthStateChanged(user => {
        if (user) assignUser(user.email);
        else assignUser(null);

        toggleLoading(false);
        m.redraw();
    });
};